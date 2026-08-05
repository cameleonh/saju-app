import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createIngestionServer } from '../../server/http.mjs';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';

const birthInput = { calendar: 'solar', date: '1990-10-10', time: '14:30', place: '서울특별시', placeCode: '1100000000', unknownTime: false };
const receipt = { receiptId: 'service-storage', purpose: 'service_storage', decision: 'accepted', disclosureVersion: 'service-storage.v2', recordedAt: '2026-08-05T00:00:00Z' };
const valid = (overrides = {}) => ({
  schemaVersion: 'submission.v1',
  clientRequestId: `auth-${Math.random().toString(36).slice(2)}`,
  relationshipMode: 'single',
  dataSubject: { relationship: 'self', authorityVerified: true, minor: false },
  birthInput,
  chartResult: { ...calculateNatalChart(birthInput), facts: [], reading: [] },
  purposeReceipts: [receipt],
  ...overrides,
});

const saved = [];
const storage = {
  kind: 'postgres',
  async saveSubmission(value) { saved.push(value); },
  async deleteSubmission(id, actorUserId) { return id === 'owned' && actorUserId === '11111111-1111-4111-8111-111111111111'; },
  async listSubmissions(actorUserId) { return actorUserId ? [{ submissionId: 'owned', createdAt: '2026-08-05T00:00:00Z' }] : []; },
  async getSubmission(id, actorUserId) { return id === 'owned' && actorUserId ? { submissionId: id, chart: { schemaVersion: 'natal-chart.v1' } } : null; },
  async withdrawTraining() { return false; },
};
const auth = {
  required: true,
  verifyMutation(request) { return request.headers.origin === 'https://saju.blog'; },
  async authenticate(request) {
    return request.headers.authorization === 'Session valid'
      ? { userId: '11111111-1111-4111-8111-111111111111', status: 'active' }
      : null;
  },
};
const server = createIngestionServer({ storage, auth });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const post = (body, authorized = false) => fetch(`${url}/v1/submissions`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'https://saju.blog', ...(authorized ? { authorization: 'Session valid' } : {}) },
  body: JSON.stringify(body),
});

assert.equal((await post(valid())).status, 401, 'cloud persistence requires an authenticated account');
assert.equal((await post(valid(), true)).status, 202, 'an authenticated adult can save their own chart');
assert.equal((await fetch(`${url}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Session valid', origin: 'https://attacker.test' }, body: JSON.stringify(valid()) })).status, 403, 'cookie-authenticated mutations reject a foreign origin');
assert.equal(saved.length, 1);
assert.equal(saved[0].actorUserId, '11111111-1111-4111-8111-111111111111');
const partnerBirthInput = { ...birthInput, date: '1992-02-14', time: '09:00' };
assert.equal((await post(valid({
  relationshipMode: 'couple',
  partnerSubject: { relationship: 'partner', authorityVerified: true, minor: false },
  partnerBirthInput,
  chartResult: {
    mode: 'couple',
    self: { ...calculateNatalChart(birthInput), facts: [], reading: [] },
    partner: { ...calculateNatalChart(partnerBirthInput), facts: [], reading: [] },
  },
  partnerPurposeReceipts: [{ ...receipt, receiptId: 'partner-service-storage' }],
}), true)).status, 409, 'couple records stay local-only');
assert.equal((await post(valid({ dataSubject: { relationship: 'self', authorityVerified: true, minor: true } }), true)).status, 409, 'minor records stay local-only');
assert.equal((await fetch(`${url}/v1/submissions`)).status, 401, 'cloud history requires authentication');
assert.equal((await fetch(`${url}/v1/submissions`, { headers: { authorization: 'Session valid' } })).status, 200);
assert.equal((await fetch(`${url}/v1/submissions/owned`, { headers: { authorization: 'Session valid' } })).status, 200);
assert.equal((await fetch(`${url}/v1/submissions/missing`, { headers: { authorization: 'Session valid' } })).status, 404);
assert.equal((await fetch(`${url}/v1/submissions/owned`, { method: 'DELETE', headers: { origin: 'https://saju.blog' } })).status, 401);
assert.equal((await fetch(`${url}/v1/submissions/owned`, { method: 'DELETE', headers: { authorization: 'Session valid', origin: 'https://saju.blog' } })).status, 200);

server.close();
const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`auth boundary: ${assertionCount} assertions passed`);
