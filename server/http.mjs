import { createServer } from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildSubmissionDecision, buildTrainingProjection } from './domain/submission.mjs';
import { convertLunarToSolar } from './domain/calendar.mjs';
import { createAnnualReading } from './domain/annual.mjs';
import { evaluateCloudPersistence } from './domain/cloud-policy.mjs';
import { NATAL_POLICY, calculateNatalChart } from '../chart/natal-engine.mjs';
import { buildComparison, calculateSystem, listPolicies, normalizeBirthProfile, resolveEligibility, SYSTEM_IDS } from './domain/astrology-comparison.mjs';

const MAX_BODY_BYTES = 256 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_BUCKET_MAX = 50_000;
const SECURITY_HEADERS = {
  'content-security-policy': "frame-ancestors 'self'",
  'x-frame-options': 'SAMEORIGIN',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};
const NATAL_POLICY_REF = Object.freeze({ id: NATAL_POLICY.id, version: NATAL_POLICY.version, engine: NATAL_POLICY.engine, engineVersion: NATAL_POLICY.engineVersion });
const ASTROLOGY_PREFIXES = ['/api/v1/astrology', '/v1/astrology'];

function sendJson(response, status, payload) {
  response.writeHead(status, { ...SECURITY_HEADERS, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(payload));
}

function sendStorageFailure(response) {
  return sendJson(response, 503, { error: 'durable_storage_failed', message: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
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

const MIME_TYPES = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const PUBLIC_STATIC_FILES = new Set(['index.html', 'privacy.html', 'terms.html', 'service-worker.js', 'manifest.webmanifest', 'icon.svg', 'robots.txt', 'ai.txt', 'copyright.html', 'annual/client.mjs', 'annual/storage.mjs', 'chart/natal-engine.mjs', 'chart/natal-ephemeris-data.mjs', 'chart/daewoon-engine.mjs', 'chart/daewoon-branch-analysis.mjs', 'chart/destined-match.mjs', 'chart/couple-compatibility.mjs', 'chart/mahabote-engine.mjs', 'chart/horasat-engine.mjs', 'chart/tu-vi-engine.mjs', 'data/admin-areas.js', 'web/consent-gate.mjs', 'web/loading-narrative.mjs', 'web/result-packaging.mjs', 'web/daily-reading.mjs', 'web/natal-reading.mjs', 'web/destined-match.mjs', 'web/couple-compatibility.mjs', 'web/multi-system-comparison.mjs', 'server/domain/daewoon-domains.mjs', 'server/domain/daily-reading-selection.mjs', 'server/domain/natal-chapter-selection.mjs', 'server/storage/seeds/daily-readings.mjs', 'server/storage/seeds/natal-chapters.mjs']);
const PUBLIC_FONT_FILE = /^fonts\/noto-sans-kr-5\.3\.0\/(?:400\.css|files\/noto-sans-kr-(?:\d{1,3}|korean|latin|latin-ext|cyrillic|vietnamese)-400-normal\.woff2)$/;
const PUBLIC_IMAGE_FILE = /^images\/matches\/match_[a-z]+_(?:male|female)\.svg$/;

async function serveStatic(root, request, response) {
  if (!root || request.method !== 'GET') return false;
  const requested = decodeURIComponent((request.url || '/').split('?')[0]);
  const relative = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '');
  if (!PUBLIC_STATIC_FILES.has(relative) && !PUBLIC_FONT_FILE.test(relative) && !PUBLIC_IMAGE_FILE.test(relative)) return false;
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

export function createIngestionServer({ staticRoot = null, storage = null, auth = null, readingStore = null } = {}) {
  const requestWindows = new Map();
  const rateLimitSalt = crypto.randomBytes(32);
  let lastRateLimitSweep = 0;
  const allowRequest = (request) => {
    const now = Date.now();
    if (now - lastRateLimitSweep >= RATE_LIMIT_WINDOW_MS) {
      for (const [bucket, value] of requestWindows) {
        if (now - value.startedAt >= RATE_LIMIT_WINDOW_MS) requestWindows.delete(bucket);
      }
      lastRateLimitSweep = now;
    }
    const forwarded = request.headers['x-forwarded-for'];
    const socketAddress = request.socket.remoteAddress || 'unknown';
    let sourceAddress = socketAddress;
    if (forwarded && (socketAddress === '127.0.0.1' || socketAddress === '::1')) {
      const hops = String(forwarded).split(',').map((s) => s.trim()).filter(Boolean);
      sourceAddress = hops[hops.length - 1] || socketAddress;
    }
    const key = crypto.createHmac('sha256', rateLimitSalt).update(sourceAddress).digest('hex');
    const current = requestWindows.get(key);
    if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
      if (!current && requestWindows.size >= RATE_LIMIT_BUCKET_MAX) return false;
      requestWindows.set(key, { startedAt: now, count: 1 });
      return true;
    }
    current.count += 1;
    return current.count <= RATE_LIMIT_MAX;
  };
  return createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url || '/', 'http://localhost').pathname;
      const authRoute = pathname.startsWith('/auth/') || pathname === '/v1/me' || pathname === '/v1/account';
      if (authRoute && !allowRequest(request)) {
        response.setHeader('retry-after', '60');
        return sendJson(response, 429, { error: 'rate_limited', message: '잠시 후 다시 시도해 주세요.' });
      }
      if (auth?.handle && await auth.handle(request, response)) return;
      if (!auth?.handle && request.method === 'GET' && pathname === '/v1/me') {
        return sendJson(response, 200, { authenticated: false, available: false });
      }
      const submissionResource = /^\/v1\/submissions\/([A-Za-z0-9_-]{1,120})$/.exec(pathname);
      const withdrawalResource = /^\/v1\/submissions\/([A-Za-z0-9_-]{1,120})\/training-withdrawal$/.exec(pathname);
      const astrologyMutation = request.method === 'POST' && ASTROLOGY_PREFIXES.some((prefix) => pathname.startsWith(`${prefix}/`));
      const mutationRoute = (request.method === 'POST' && (pathname === '/v1/submissions' || pathname === '/v1/calendar/convert' || pathname === '/v1/natal-charts' || pathname === '/v1/annual-readings' || Boolean(withdrawalResource) || astrologyMutation))
        || (request.method === 'DELETE' && Boolean(submissionResource));
      if (mutationRoute && !allowRequest(request)) {
        response.setHeader('retry-after', '60');
        return sendJson(response, 429, { error: 'rate_limited', message: '잠시 후 다시 시도해 주세요.' });
      }
      const accountMutation = (request.method === 'POST' && (pathname === '/v1/submissions' || Boolean(withdrawalResource)))
        || (request.method === 'DELETE' && Boolean(submissionResource));
      const accountRead = request.method === 'GET' && (pathname === '/v1/submissions' || Boolean(submissionResource));
      let principal = null;
      if (auth?.required === true && (accountMutation || accountRead)) {
        try { principal = await auth.authenticate(request); }
        catch { principal = null; }
        if (!principal) return sendJson(response, 401, { error: 'authentication_required', message: '클라우드 저장은 로그인한 계정에서만 사용할 수 있습니다.' });
      }
      if (accountMutation && auth?.required === true && !auth.verifyMutation?.(request)) {
        return sendJson(response, 403, { error: 'origin_rejected', message: '요청 출처를 확인할 수 없습니다.' });
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
      const astrologyPath = ASTROLOGY_PREFIXES.map((prefix) => pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : null).find(Boolean);
      if (astrologyPath === '/policies' && request.method === 'GET') return sendJson(response, 200, { schemaVersion: 'policy-registry.v1', systems: listPolicies() });
      if (astrologyPath === '/profile/normalize' && request.method === 'POST') {
        const input = await readJson(request);
        try { return sendJson(response, 200, normalizeBirthProfile(input.profile || input)); }
        catch (error) { return sendJson(response, 422, { error: 'invalid_input', status: 'invalid_input', message: error.message }); }
      }
      if (astrologyPath === '/eligibility' && request.method === 'POST') {
        const input = await readJson(request);
        try {
          const profile = normalizeBirthProfile(input.profile || input);
          const systemIds = Array.isArray(input.requestedSystems) && input.requestedSystems.length ? input.requestedSystems : SYSTEM_IDS;
          return sendJson(response, 200, { schemaVersion: 'eligibility-response.v1', profile, eligibilities: systemIds.map((systemId) => resolveEligibility(profile, systemId)) });
        } catch (error) { return sendJson(response, 422, { error: 'invalid_input', status: 'invalid_input', message: error.message }); }
      }
      if ((astrologyPath === '/calculation' || astrologyPath === '/calculate') && request.method === 'POST') {
        const input = await readJson(request);
        try {
          const profile = input.profile?.schemaVersion === 'birth-profile.v2' ? input.profile : normalizeBirthProfile(input.profile || input);
          const systemId = input.systemId;
          if (!SYSTEM_IDS.includes(systemId)) return sendJson(response, 422, { error: 'invalid_input', status: 'invalid_input', message: 'systemId is not registered' });
          const calculation = calculateSystem(profile, systemId);
          return sendJson(response, 200, { schemaVersion: 'calculation-response.v1', systemId, eligibility: calculation.eligibility, result: calculation.result });
        } catch (error) { return sendJson(response, 422, { error: 'invalid_input', status: 'invalid_input', message: error.message }); }
      }
      if ((astrologyPath === '/comparison' || astrologyPath === '/compare') && request.method === 'POST') {
        const input = await readJson(request);
        try {
          const requestedSystems = Array.isArray(input.requestedSystems) && input.requestedSystems.length ? input.requestedSystems : SYSTEM_IDS;
          let results = Array.isArray(input.results) ? input.results : [];
          if (results.length === 0 && input.profile) {
            const profile = input.profile.schemaVersion === 'birth-profile.v2' ? input.profile : normalizeBirthProfile(input.profile);
            results = requestedSystems.map((systemId) => calculateSystem(profile, systemId).result).filter(Boolean);
          }
          return sendJson(response, 200, buildComparison({ requestedSystems, results }));
        } catch (error) { return sendJson(response, 422, { error: error.code || 'comparison_rejected', message: error.message }); }
      }
      if (request.method === 'POST' && pathname === '/v1/annual-readings') {
        const input = await readJson(request);
        try { return sendJson(response, 200, createAnnualReading(input, { readingStore })); }
        catch (error) { return sendJson(response, 422, { error: 'annual_reading_rejected', message: error.message }); }
      }
      if (auth?.required === true && request.method === 'GET' && pathname === '/v1/submissions') {
        if (!storage?.listSubmissions) return sendJson(response, 409, { error: 'durable_storage_unavailable' });
        try { return sendJson(response, 200, { records: await storage.listSubmissions(principal.userId) }); }
        catch { return sendStorageFailure(response); }
      }
      if (auth?.required === true && request.method === 'GET' && submissionResource) {
        if (!storage?.getSubmission) return sendJson(response, 409, { error: 'durable_storage_unavailable' });
        let record;
        try { record = await storage.getSubmission(submissionResource[1], principal.userId); }
        catch { return sendStorageFailure(response); }
        return record ? sendJson(response, 200, record) : sendJson(response, 404, { error: 'submission_not_found' });
      }
      if (request.method === 'DELETE' && submissionResource) {
        if (!storage?.deleteSubmission) return sendJson(response, 409, { error: 'durable_storage_unavailable', message: '지속 저장소가 연결되지 않아 서버 기록을 지울 수 없습니다.' });
        let deleted;
        try { deleted = await storage.deleteSubmission(submissionResource[1], principal?.userId); }
        catch { return sendStorageFailure(response); }
        return deleted ? sendJson(response, 200, { submissionId: submissionResource[1], deleted: true }) : sendJson(response, 404, { error: 'submission_not_found' });
      }
      if (request.method === 'POST' && withdrawalResource) {
        if (!storage?.withdrawTraining) return sendJson(response, 409, { error: 'durable_storage_unavailable', message: '지속 저장소가 연결되지 않아 학습 사용을 철회할 수 없습니다.' });
        const input = await readJson(request);
        if (typeof input.recordedAt !== 'string' || !Number.isFinite(Date.parse(input.recordedAt))) return sendJson(response, 400, { error: 'recorded_at_invalid', message: 'recordedAt은 유효한 날짜와 시각이어야 합니다.' });
        let updated;
        try { updated = await storage.withdrawTraining(withdrawalResource[1], input.recordedAt, principal?.userId); }
        catch { return sendStorageFailure(response); }
        return updated ? sendJson(response, 200, { submissionId: withdrawalResource[1], withdrawn: true, trainingEligible: false }) : sendJson(response, 404, { error: 'submission_not_found' });
      }
      if (request.method !== 'POST' || pathname !== '/v1/submissions') {
        if (await serveStatic(staticRoot, request, response)) return;
        return sendJson(response, 404, { error: 'not_found' });
      }
      const input = await readJson(request);
      const decision = buildSubmissionDecision(input);
      if (!decision.accepted) return sendJson(response, 422, { error: 'submission_rejected', errors: decision.errors, calculationPolicy: NATAL_POLICY_REF });
      if (auth?.required === true) {
        const cloudPolicy = evaluateCloudPersistence({ auth: principal, input });
        if (!cloudPolicy.allowed) return sendJson(response, 409, {
          error: 'cloud_persistence_restricted',
          reason: cloudPolicy.reason,
          message: '이 명식은 기기 안에서만 저장할 수 있습니다.',
        });
      }
      const submissionId = crypto.randomUUID();
      const projection = buildTrainingProjection(input);
      let persisted = null;
      if (storage) {
        try { persisted = await storage.saveSubmission({ submissionId, input, projection, status: 'accepted', actorUserId: principal?.userId }); }
        catch { return sendStorageFailure(response); }
      }
      return sendJson(response, 202, {
        submissionId: persisted?.submissionId || submissionId,
        ...decision,
        durable: Boolean(storage),
        persistence: storage ? storage.kind : decision.persistence,
        trainingProjection: projection ? { schemaVersion: projection.schemaVersion, readyForGovernanceReview: true } : null,
      });
    } catch (error) {
      return sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : 'internal_error' });
    }
  });
}
