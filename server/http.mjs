import { createServer } from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildSubmissionDecision, buildTrainingProjection } from './domain/submission.mjs';
import { convertLunarToSolar } from './domain/calendar.mjs';
import { createAnnualReading } from './domain/annual.mjs';
import { NATAL_POLICY, calculateNatalChart } from '../chart/natal-engine.mjs';

const MAX_BODY_BYTES = 256 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const SECURITY_HEADERS = {
  'content-security-policy': "frame-ancestors 'self'",
  'x-frame-options': 'SAMEORIGIN',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};
const NATAL_POLICY_REF = Object.freeze({ id: NATAL_POLICY.id, version: NATAL_POLICY.version, engine: NATAL_POLICY.engine, engineVersion: NATAL_POLICY.engineVersion });

function sendJson(response, status, payload) {
  response.writeHead(status, { ...SECURITY_HEADERS, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('request body too large'), { statusCode: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('request body must be valid JSON'), { statusCode: 400 }); }
}

const MIME_TYPES = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const PUBLIC_STATIC_FILES = new Set(['index.html', 'service-worker.js', 'manifest.webmanifest', 'icon.svg', 'robots.txt', 'ai.txt', 'copyright.html', 'annual/client.mjs', 'annual/storage.mjs', 'chart/natal-engine.mjs', 'chart/natal-ephemeris-data.mjs', 'data/admin-areas.js']);

async function serveStatic(root, request, response) {
  if (!root || request.method !== 'GET') return false;
  const requested = decodeURIComponent((request.url || '/').split('?')[0]);
  const relative = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '');
  if (!PUBLIC_STATIC_FILES.has(relative)) return false;
  const candidate = path.resolve(root, relative);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return false;
  try {
    const body = await fs.readFile(candidate);
    const type = MIME_TYPES[path.extname(candidate)] || 'application/octet-stream';
    response.writeHead(200, { ...SECURITY_HEADERS, 'content-type': type, 'cache-control': 'no-cache' });
    response.end(body);
    return true;
  } catch { return false; }
}

export function createIngestionServer({ staticRoot = null, storage = null } = {}) {
  const requestWindows = new Map();
  const allowRequest = (request) => {
    const now = Date.now();
    const key = request.socket.remoteAddress || 'unknown';
    const current = requestWindows.get(key);
    if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
      requestWindows.set(key, { startedAt: now, count: 1 });
      return true;
    }
    current.count += 1;
    return current.count <= RATE_LIMIT_MAX;
  };
  return createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url || '/', 'http://localhost').pathname;
      const submissionResource = /^\/v1\/submissions\/([A-Za-z0-9_-]{1,120})$/.exec(pathname);
      const withdrawalResource = /^\/v1\/submissions\/([A-Za-z0-9_-]{1,120})\/training-withdrawal$/.exec(pathname);
      const mutationRoute = (request.method === 'POST' && (pathname === '/v1/submissions' || pathname === '/v1/calendar/convert' || pathname === '/v1/natal-charts' || pathname === '/v1/annual-readings' || Boolean(withdrawalResource)))
        || (request.method === 'DELETE' && Boolean(submissionResource));
      if (mutationRoute && !allowRequest(request)) {
        response.setHeader('retry-after', '60');
        return sendJson(response, 429, { error: 'rate_limited', message: '잠시 후 다시 시도해 주세요.' });
      }
      if (request.method === 'GET' && pathname === '/health') return sendJson(response, 200, { status: 'ok', service: 'saju-ingestion-adapter', persistence: storage ? storage.kind : 'adapter-only', durable: Boolean(storage) });
      if (request.method === 'POST' && pathname === '/v1/calendar/convert') {
        const input = await readJson(request);
        try { return sendJson(response, 200, convertLunarToSolar(input)); }
        catch (error) { return sendJson(response, 422, { error: 'calendar_conversion_rejected', message: error.message }); }
      }
      if (request.method === 'POST' && pathname === '/v1/natal-charts') {
        const input = await readJson(request);
        try { return sendJson(response, 200, calculateNatalChart(input)); }
        catch (error) { return sendJson(response, 422, { error: 'natal_chart_rejected', message: error.message, calculationPolicy: NATAL_POLICY_REF }); }
      }
      if (request.method === 'POST' && pathname === '/v1/annual-readings') {
        const input = await readJson(request);
        try { return sendJson(response, 200, createAnnualReading(input)); }
        catch (error) { return sendJson(response, 422, { error: 'annual_reading_rejected', message: error.message }); }
      }
      if (request.method === 'DELETE' && submissionResource) {
        if (!storage?.deleteSubmission) return sendJson(response, 409, { error: 'durable_storage_unavailable', message: '지속 저장소가 연결되지 않아 서버 기록을 지울 수 없습니다.' });
        const deleted = storage.deleteSubmission(submissionResource[1]);
        return deleted ? sendJson(response, 200, { submissionId: submissionResource[1], deleted: true }) : sendJson(response, 404, { error: 'submission_not_found' });
      }
      if (request.method === 'POST' && withdrawalResource) {
        if (!storage?.withdrawTraining) return sendJson(response, 409, { error: 'durable_storage_unavailable', message: '지속 저장소가 연결되지 않아 학습 사용을 철회할 수 없습니다.' });
        const input = await readJson(request);
        if (typeof input.recordedAt !== 'string' || !Number.isFinite(Date.parse(input.recordedAt))) return sendJson(response, 400, { error: 'recorded_at_invalid', message: 'recordedAt은 유효한 날짜와 시각이어야 합니다.' });
        const updated = storage.withdrawTraining(withdrawalResource[1], input.recordedAt);
        return updated ? sendJson(response, 200, { submissionId: withdrawalResource[1], withdrawn: true, trainingEligible: false }) : sendJson(response, 404, { error: 'submission_not_found' });
      }
      if (request.method !== 'POST' || pathname !== '/v1/submissions') {
        if (await serveStatic(staticRoot, request, response)) return;
        return sendJson(response, 404, { error: 'not_found' });
      }
      const input = await readJson(request);
      const decision = buildSubmissionDecision(input);
      if (!decision.accepted) return sendJson(response, 422, { error: 'submission_rejected', errors: decision.errors, calculationPolicy: NATAL_POLICY_REF });
      const submissionId = crypto.randomUUID();
      const projection = buildTrainingProjection(input);
      if (storage) storage.saveSubmission({ submissionId, input, projection, status: 'accepted' });
      return sendJson(response, 202, {
        submissionId,
        ...decision,
        durable: Boolean(storage),
        persistence: storage ? `${storage.kind}:${storage.filePath}` : decision.persistence,
        trainingProjection: projection ? { schemaVersion: projection.schemaVersion, readyForGovernanceReview: true } : null,
      });
    } catch (error) {
      return sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : 'internal_error' });
    }
  });
}
