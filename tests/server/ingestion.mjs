import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createIngestionServer } from '../../server/http.mjs';
import { createSqliteStorage } from '../../server/storage/sqlite.mjs';

const server = createIngestionServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const url = `http://127.0.0.1:${port}`;

const receipt = (purpose, decision = 'accepted') => ({ receiptId: `${purpose}-receipt`, purpose, decision, disclosureVersion: 'v1', recordedAt: '2026-08-01T00:00:00Z' });
const valid = (overrides = {}) => ({
  schemaVersion: 'submission.v1',
  clientRequestId: 'client-1',
  dataSubject: { relationship: 'self', authorityVerified: true, minor: false },
  birthInput: { calendar: 'solar', date: '1990-10-10', time: '14:30', place: '서울특별시 강남구 역삼1동', placeCode: '1168064000', unknownTime: false },
  chartResult: { pillars: ['庚午', '丙戌', '戊申', '己未'], facts: [{ id: 'day.element', value: '토' }], reading: [], policy: { id: 'KR-CIVIL-0.1' } },
  purposeReceipts: [receipt('service_storage')],
  ...overrides,
});
const post = async (body) => fetch(`${url}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

const health = await fetch(`${url}/health`);
assert.equal(health.status, 200);
assert.equal(health.headers.get('x-frame-options'), 'SAMEORIGIN');
assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
const lunarResponse = await fetch(`${url}/v1/calendar/convert`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ calendar: 'lunar', year: 2024, month: 1, day: 1, leapMonth: false, hour: 14, minute: 30 }) });
assert.equal(lunarResponse.status, 200);
assert.equal((await lunarResponse.json()).date, '2024-02-10');
const annualRequest = { targetYear: 2026, natal: { dayStem: '戊', monthBranch: '戌', branches: ['午', '戌', '申', '未'], unknownTime: false }, chartPolicy: { id: 'KR-CIVIL-0.1' } };
const annualResponse = await fetch(`${url}/v1/annual-readings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(annualRequest) });
assert.equal(annualResponse.status, 200);
const annualResult = await annualResponse.json();
const annualChartResult = { pillars: [{ stem: '庚', branch: '午' }, { stem: '丙', branch: '戌' }, { stem: '戊', branch: '申' }, { stem: '己', branch: '未' }], facts: [{ id: 'day.element', value: '토' }], reading: [], policy: { id: 'KR-CIVIL-0.1' } };
assert.equal(annualResult.cards.length, 8);
assert.equal(annualResult.monthlyFlow.length, 12);
const rejectedAnnual = await fetch(`${url}/v1/annual-readings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...annualRequest, targetYear: 2100 }) });
assert.equal(rejectedAnnual.status, 422);
const accepted = await post(valid());
assert.equal(accepted.status, 202);
assert.equal((await accepted.json()).durable, false);

const training = await post(valid({ purposeReceipts: [receipt('service_storage'), receipt('model_training')] }));
assert.equal((await training.json()).trainingEligible, true);

const couple = await post(valid({
  relationshipMode: 'couple',
  partnerSubject: { relationship: 'partner', authorityVerified: true, minor: 'unknown' },
  partnerBirthInput: { calendar: 'solar', date: '1992-02-14', time: '09:00', place: '서울특별시 종로구 사직동', placeCode: '1111053000', unknownTime: false },
  partnerPurposeReceipts: [receipt('service_storage')],
}));
assert.equal(couple.status, 202);
assert.equal((await couple.json()).trainingEligible, false);

const unknownMinor = await post(valid({ dataSubject: { relationship: 'self', authorityVerified: true, minor: 'unknown' }, purposeReceipts: [receipt('service_storage'), receipt('model_training')] }));
assert.equal((await unknownMinor.json()).trainingEligible, false);

const underNineteen = await post(valid({ dataSubject: { relationship: 'self', authorityVerified: true, minor: true }, birthInput: { ...valid().birthInput, date: '2010-01-01' }, purposeReceipts: [receipt('service_storage'), receipt('model_training')] }));
assert.equal((await underNineteen.json()).trainingEligible, false);

const missingService = await post(valid({ purposeReceipts: [receipt('model_training')] }));
assert.equal(missingService.status, 422);

const thirdPartyTraining = await post(valid({ dataSubject: { relationship: 'third_party', authorityVerified: false, minor: false }, purposeReceipts: [receipt('service_storage'), receipt('model_training')] }));
assert.equal(thirdPartyTraining.status, 422);

const malformed = await fetch(`${url}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
assert.equal(malformed.status, 400);

const malformedPlaceCode = await post(valid({ birthInput: { ...valid().birthInput, placeCode: 'not-a-code' } }));
assert.equal(malformedPlaceCode.status, 422);
const missingAnnualResult = await post(valid({ readingScope: 'annual', targetYear: 2026 }));
assert.equal(missingAnnualResult.status, 422);
const tamperedAnnual = structuredClone(annualResult);
tamperedAnnual.cards[0].summary = 'tampered claim';
const tamperedAnnualResponse = await post(valid({ clientRequestId: 'tampered-annual', chartResult: annualChartResult, readingScope: 'annual', targetYear: 2026, annualResult: tamperedAnnual }));
assert.equal(tamperedAnnualResponse.status, 422);

const adapterDeletion = await fetch(`${url}/v1/submissions/adapter-only`, { method: 'DELETE' });
assert.equal(adapterDeletion.status, 409);
const adapterWithdrawal = await fetch(`${url}/v1/submissions/adapter-only/training-withdrawal`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recordedAt: '2026-08-02T00:00:00Z' }) });
assert.equal(adapterWithdrawal.status, 409);
const extraSegment = await fetch(`${url}/v1/submissions/adapter-only/training-withdrawal/extra`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
assert.equal(extraSegment.status, 404);

const projection = await import('../../server/domain/submission.mjs');
const projectionInput = valid({ purposeReceipts: [receipt('service_storage'), receipt('model_training')] });
const projected = projection.buildTrainingProjection(projectionInput);
assert.ok(projected && !('birthInput' in projected) && !JSON.stringify(projected).includes('birthInput') && !JSON.stringify(projected).includes('place'));

const durableStorage = createSqliteStorage(':memory:');
const durableServer = createIngestionServer({ storage: durableStorage });
await new Promise((resolve) => durableServer.listen(0, '127.0.0.1', resolve));
const durablePort = durableServer.address().port;
const durableResponse = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid({ clientRequestId: 'durable-client' })) });
assert.equal(durableResponse.status, 202);
const durableBody = await durableResponse.json();
assert.equal(durableBody.durable, true);
assert.ok(durableStorage.getSubmission(durableBody.submissionId));

const durableAnnualResponse = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid({ clientRequestId: 'durable-annual-client', chartResult: annualChartResult, readingScope: 'annual', targetYear: 2026, annualResult })) });
assert.equal(durableAnnualResponse.status, 202);
const durableAnnualBody = await durableAnnualResponse.json();
const annualRow = durableStorage.getAnnualReading(durableAnnualBody.submissionId);
assert.equal(annualRow.target_year, 2026);
assert.equal(JSON.parse(annualRow.annual_cards_json).length, 8);
assert.equal(JSON.parse(annualRow.monthly_flow_json).length, 12);
assert.equal(annualRow.content_hash, annualResult.contentHash);

const projectedAnnual = projection.buildTrainingProjection(valid({ chartResult: annualChartResult, purposeReceipts: [receipt('service_storage'), receipt('model_training')], readingScope: 'annual', targetYear: 2026, annualResult }));
assert.equal(projectedAnnual.readingScope, 'annual');
assert.equal(projectedAnnual.annualCards.length, 8);
assert.doesNotMatch(JSON.stringify(projectedAnnual.annualCards), /1990-10-10|역삼1동|1168064000/);

const durableTrainingResponse = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid({ clientRequestId: 'durable-training-client', purposeReceipts: [receipt('service_storage'), receipt('model_training')] })) });
const durableTrainingBody = await durableTrainingResponse.json();
const withdrawalResponse = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions/${durableTrainingBody.submissionId}/training-withdrawal`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recordedAt: '2026-08-02T00:00:00Z' }) });
assert.equal(withdrawalResponse.status, 200);
assert.equal((await withdrawalResponse.json()).trainingEligible, false);
const withdrawnRow = durableStorage.getSubmission(durableTrainingBody.submissionId);
assert.equal(withdrawnRow.training_projection_json, null);
const withdrawnReceipts = JSON.parse(withdrawnRow.purpose_receipts_json);
assert.equal(withdrawnReceipts.find(({ purpose }) => purpose === 'service_storage').decision, 'accepted');
assert.equal(withdrawnReceipts.find(({ purpose }) => purpose === 'model_training').decision, 'withdrawn');

const invalidWithdrawal = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions/${durableTrainingBody.submissionId}/training-withdrawal`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recordedAt: 'not-a-date' }) });
assert.equal(invalidWithdrawal.status, 400);
const missingWithdrawal = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions/missing/training-withdrawal`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recordedAt: '2026-08-02T00:00:00Z' }) });
assert.equal(missingWithdrawal.status, 404);

const deletionResponse = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions/${durableBody.submissionId}`, { method: 'DELETE' });
assert.equal(deletionResponse.status, 200);
assert.equal((await deletionResponse.json()).deleted, true);
assert.equal(durableStorage.getSubmission(durableBody.submissionId), null);
const missingDeletion = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions/${durableBody.submissionId}`, { method: 'DELETE' });
assert.equal(missingDeletion.status, 404);
durableServer.close();
durableStorage.close();

server.close();
const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`ingestion smoke: ${assertionCount} assertions passed`);
