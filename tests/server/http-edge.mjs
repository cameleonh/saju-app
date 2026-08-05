import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createIngestionServer } from '../../server/http.mjs';
import { createSqliteStorage } from '../../server/storage/sqlite.mjs';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';

const staticRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const storage = createSqliteStorage(':memory:');
const server = createIngestionServer({ staticRoot, storage });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const url = `http://127.0.0.1:${port}`;

const receipt = (purpose, decision = 'accepted') => ({ receiptId: `${purpose}-id`, purpose, decision, disclosureVersion: 'v1', recordedAt: '2026-08-01T00:00:00Z' });
const birthInput = { calendar: 'solar', date: '1990-10-10', time: '14:30', place: '서울특별시 강남구 역삼1동', placeCode: '1168064000', unknownTime: false };
const chartFor = (input) => ({ ...calculateNatalChart(input), facts: [{ id: 'day.element', value: '토' }], reading: [] });
function valid(overrides = {}) {
  return {
    schemaVersion: 'submission.v1',
    clientRequestId: `client-${Math.random().toString(36).slice(2)}`,
    dataSubject: { relationship: 'self', authorityVerified: true, minor: false },
    birthInput,
    chartResult: chartFor(birthInput),
    purposeReceipts: [receipt('service_storage')],
    ...overrides,
  };
}

assert.equal((await fetch(`${url}/unknown-path`)).status, 404);
assert.equal((await fetch(`${url}/v1/submissions/missing-id`)).status, 404, 'GET on a submission resource is not a registered route');
assert.equal((await fetch(`${url}/health`, { method: 'POST' })).status, 404, 'POST /health is not registered');

assert.equal((await fetch(`${url}/health`, { method: 'PUT' })).status, 404);
assert.equal((await fetch(`${url}/health`, { method: 'PATCH' })).status, 404);
assert.equal((await fetch(`${url}/health`, { method: 'DELETE' })).status, 404);

assert.equal((await fetch(`${url}/health`)).status, 200);
const healthBody = await (await fetch(`${url}/health`)).json();
assert.equal(healthBody.status, 'ok');
assert.equal(healthBody.durable, true);
assert.equal(healthBody.persistence, 'sqlite', '/health reports only the storage kind');

const submissionResponse = await fetch(`${url}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid()) });
const submissionBody = await submissionResponse.json();
assert.ok(submissionBody.persistence.startsWith('sqlite:'), 'submission persistence echoes the kind and file path');
assert.equal(submissionBody.durable, true);

assert.equal((await fetch(`${url}/index.html`)).status, 200);
assert.equal((await fetch(`${url}/icon.svg`)).status, 200);
assert.equal((await fetch(`${url}/manifest.webmanifest`)).status, 200);

assert.equal((await fetch(`${url}/%2e%2e/package.json`)).status, 404, 'path traversal via URL-encoded dots is rejected by the public allowlist');
assert.equal((await fetch(`${url}/..%2fpackage.json`)).status, 404);
assert.equal((await fetch(`${url}/server/http.mjs`)).status, 404, 'server source is never public');
assert.equal((await fetch(`${url}/data/saju.sqlite`)).status, 404, 'SQLite file is never public');
assert.equal((await fetch(`${url}/.env`)).status, 404);
assert.equal((await fetch(`${url}/db/migrations/001_initial_contract.sql`)).status, 404);
assert.equal((await fetch(`${url}/tests/server/http.mjs`)).status, 404);

const oversizedBody = 'x'.repeat(256 * 1024 + 1);
const oversized = await fetch(`${url}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: oversizedBody });
assert.equal(oversized.status, 413, 'request body above 256 KB is rejected');

const notJson = await fetch(`${url}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{not-json' });
assert.equal(notJson.status, 400);

const emptyBody = await fetch(`${url}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '' });
assert.equal(emptyBody.status, 422, 'empty body parses to {} and fails validation');

assert.equal((await fetch(`${url}/v1/submissions/extra-segment/training-withdrawal/extra`)).status, 404);

const storedSubmissionId = submissionBody.submissionId;
assert.equal(storage.getSubmission(storedSubmissionId) != null, true, 'durable storage persisted the submission');

const deleteUnknown = await fetch(`${url}/v1/submissions/does-not-exist`, { method: 'DELETE' });
assert.equal(deleteUnknown.status, 404);

const deleted = await fetch(`${url}/v1/submissions/${storedSubmissionId}`, { method: 'DELETE' });
assert.equal(deleted.status, 200);
assert.equal((await deleted.json()).deleted, true);
assert.equal(storage.getSubmission(storedSubmissionId), null);
const deleteAgain = await fetch(`${url}/v1/submissions/${storedSubmissionId}`, { method: 'DELETE' });
assert.equal(deleteAgain.status, 404);

const withdrawalNoBody = await fetch(`${url}/v1/submissions/x/training-withdrawal`, { method: 'POST', headers: { 'content-type': 'application/json' } });
assert.equal(withdrawalNoBody.status, 400, 'withdrawal without recordedAt body is rejected');

const rateLimitedServer = createIngestionServer();
await new Promise((resolve) => rateLimitedServer.listen(0, '127.0.0.1', resolve));
const ratePort = rateLimitedServer.address().port;
const rateUrl = `http://127.0.0.1:${ratePort}/v1/submissions`;
let rateLimited = false;
for (let i = 0; i < 130; i += 1) {
  const response = await fetch(rateUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid()) });
  if (response.status === 429) { rateLimited = true; break; }
}
assert.equal(rateLimited, true, 'the rate limit engages after exceeding the window cap');
const rateLimitedResponse = await fetch(rateUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid()) });
assert.equal(rateLimitedResponse.headers.get('retry-after'), '60');
rateLimitedServer.close();

const malformedLunar = await fetch(`${url}/v1/calendar/convert`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ calendar: 'solar' }) });
assert.equal(malformedLunar.status, 422);
const malformedNatal = await fetch(`${url}/v1/natal-charts`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ calendar: 'solar', date: '2024-02-30', time: '12:00' }) });
assert.equal(malformedNatal.status, 422);
const natalPolicyBody = await malformedNatal.json();
assert.deepEqual(natalPolicyBody.calculationPolicy, { id: 'KR-CIVIL-1.0', version: '1.0.0', engine: 'gyeol-natal-core', engineVersion: '1.0.0' });

const annualOutOfRange = await fetch(`${url}/v1/annual-readings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ targetYear: 2100, natal: { dayStem: '戊', monthBranch: '戌', branches: ['午', '戌', '申', '未'] }, chartPolicy: { id: 'KR-CIVIL-1.0', version: '1.0.0', engine: 'gyeol-natal-core', engineVersion: '1.0.0' } }) });
assert.equal(annualOutOfRange.status, 422);

const unsupportedMethod = await fetch(`${url}/v1/submissions`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: '{}' });
assert.equal(unsupportedMethod.status, 404);

server.close();
storage.close();

const asyncEvents = [];
const asyncStorage = {
  kind: 'async-test',
  filePath: ':memory:',
  async saveSubmission() { await Promise.resolve(); asyncEvents.push('saved'); },
  async deleteSubmission() { await Promise.resolve(); return false; },
  async withdrawTraining() { await Promise.resolve(); return false; },
};
const asyncServer = createIngestionServer({ storage: asyncStorage });
await new Promise((resolve) => asyncServer.listen(0, '127.0.0.1', resolve));
const asyncUrl = `http://127.0.0.1:${asyncServer.address().port}`;

const asyncSave = await fetch(`${asyncUrl}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid()) });
assert.equal(asyncSave.status, 202, 'an asynchronous save completes before success is returned');
assert.deepEqual(asyncEvents, ['saved'], 'the asynchronous save settled before the response');
assert.equal((await fetch(`${asyncUrl}/v1/submissions/missing`, { method: 'DELETE' })).status, 404, 'an awaited asynchronous delete can report a missing record');
assert.equal((await fetch(`${asyncUrl}/v1/submissions/missing/training-withdrawal`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recordedAt: '2026-08-05T00:00:00Z' }) })).status, 404, 'an awaited asynchronous withdrawal can report a missing record');
asyncServer.close();

const failingStorage = {
  kind: 'async-test',
  filePath: ':memory:',
  async saveSubmission() { throw new Error('save failed'); },
  async deleteSubmission() { throw new Error('delete failed'); },
  async withdrawTraining() { throw new Error('withdrawal failed'); },
};
const failingServer = createIngestionServer({ storage: failingStorage });
await new Promise((resolve) => failingServer.listen(0, '127.0.0.1', resolve));
const failingUrl = `http://127.0.0.1:${failingServer.address().port}`;

const failedSave = await fetch(`${failingUrl}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid()) });
assert.equal(failedSave.status, 503, 'an asynchronous save failure is reported as unavailable storage');
assert.equal((await failedSave.json()).error, 'durable_storage_failed');
const failedDelete = await fetch(`${failingUrl}/v1/submissions/any`, { method: 'DELETE' });
assert.equal(failedDelete.status, 503, 'an asynchronous delete failure is reported as unavailable storage');
assert.equal((await failedDelete.json()).error, 'durable_storage_failed');
const failedWithdrawal = await fetch(`${failingUrl}/v1/submissions/any/training-withdrawal`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recordedAt: '2026-08-05T00:00:00Z' }) });
assert.equal(failedWithdrawal.status, 503, 'an asynchronous withdrawal failure is reported as unavailable storage');
assert.equal((await failedWithdrawal.json()).error, 'durable_storage_failed');
failingServer.close();

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`http edge: ${assertionCount} assertions passed`);
