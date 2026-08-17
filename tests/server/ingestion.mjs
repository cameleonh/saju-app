import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { createIngestionServer } from '../../server/http.mjs';
import { createSqliteStorage } from '../../server/storage/sqlite.mjs';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';
import { calculateDaewoon } from '../../chart/daewoon-engine.mjs';

const server = createIngestionServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const url = `http://127.0.0.1:${port}`;

const receipt = (purpose, decision = 'accepted') => ({ receiptId: `${purpose}-receipt`, purpose, decision, disclosureVersion: 'v1', recordedAt: '2026-08-01T00:00:00Z' });
const defaultBirthInput = { calendar: 'solar', date: '1990-10-10', time: '14:30', place: '서울특별시 강남구 역삼1동', placeCode: '1168064000', unknownTime: false };
const chartFor = (birthInput) => ({ ...calculateNatalChart(birthInput), facts: [{ id: 'day.element', value: '토' }], reading: [] });
const chartWithDaewoonFor = (birthInput) => {
  const chart = chartFor(birthInput);
  return {
    ...chart,
    daewoon: calculateDaewoon({
      date: birthInput.date,
      time: birthInput.unknownTime ? '12:00' : birthInput.time,
      unknownTime: birthInput.unknownTime,
      yearStem: chart.pillars[0].stem,
      monthStem: chart.pillars[1].stem,
      monthBranch: chart.pillars[1].branch,
    }),
  };
};
const valid = (overrides = {}) => ({
  schemaVersion: 'submission.v1',
  clientRequestId: 'client-1',
  dataSubject: { relationship: 'self', authorityVerified: true, minor: false },
  birthInput: defaultBirthInput,
  chartResult: chartFor(defaultBirthInput),
  purposeReceipts: [receipt('service_storage')],
  ...overrides,
});
const post = async (body) => fetch(`${url}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

const staticRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const staticServer = createIngestionServer({ staticRoot });
await new Promise((resolve) => staticServer.listen(0, '127.0.0.1', resolve));
const staticUrl = `http://127.0.0.1:${staticServer.address().port}`;
assert.equal((await fetch(`${staticUrl}/`)).status, 200);
assert.equal((await fetch(`${staticUrl}/chart/natal-engine.mjs`)).status, 200);
assert.equal((await fetch(`${staticUrl}/chart/daewoon-engine.mjs`)).status, 200);
assert.equal((await fetch(`${staticUrl}/web/consent-gate.mjs`)).status, 200, 'the consent-gate module is a public static asset');
assert.equal((await fetch(`${staticUrl}/chart/daewoon-branch-analysis.mjs`)).status, 200, 'the daewoon branch analysis module is a public static asset for the client result view');
assert.equal((await fetch(`${staticUrl}/server/domain/daewoon-domains.mjs`)).status, 200, 'the pure-content daewoon domain DB is a public static asset for the client result view');
assert.equal((await fetch(`${staticUrl}/package.json`)).status, 404, 'package metadata is not a public static asset');
assert.equal((await fetch(`${staticUrl}/data/saju.sqlite`)).status, 404, 'the local durable store is never a public static asset');
assert.equal((await fetch(`${staticUrl}/server/index.mjs`)).status, 404, 'server source is not a public static asset');
staticServer.close();

const health = await fetch(`${url}/health`);
assert.equal(health.status, 200);
assert.equal(health.headers.get('x-frame-options'), 'SAMEORIGIN');
assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
const lunarResponse = await fetch(`${url}/v1/calendar/convert`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ calendar: 'lunar', year: 2024, month: 1, day: 1, leapMonth: false, hour: 14, minute: 30 }) });
assert.equal(lunarResponse.status, 200);
assert.equal((await lunarResponse.json()).date, '2024-02-10');
const natalResponse = await fetch(`${url}/v1/natal-charts`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(defaultBirthInput) });
assert.equal(natalResponse.status, 200);
assert.deepEqual((await natalResponse.json()).pillars.map(({ text }) => text), ['庚午', '丙戌', '戊申', '己未']);
const rejectedNatalResponse = await fetch(`${url}/v1/natal-charts`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...defaultBirthInput, date: '2024-02-30' }) });
assert.equal(rejectedNatalResponse.status, 422);
const rejectedNatalBody = await rejectedNatalResponse.json();
assert.deepEqual(rejectedNatalBody.calculationPolicy, { id: 'KR-CIVIL-1.0', version: '1.0.0', engine: 'gyeol-natal-core', engineVersion: '1.0.0' });
assert.doesNotMatch(JSON.stringify(rejectedNatalBody), /1990-10-10|2024-02-30|역삼1동|1168064000/);
const annualRequest = { targetYear: 2026, natal: { dayStem: '戊', monthBranch: '戌', branches: ['午', '戌', '申', '未'], unknownTime: false }, chartPolicy: calculateNatalChart(defaultBirthInput).policy };
const annualResponse = await fetch(`${url}/v1/annual-readings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(annualRequest) });
assert.equal(annualResponse.status, 200);
const annualResult = await annualResponse.json();
const annualChartResult = chartFor(defaultBirthInput);
assert.equal(annualResult.cards.length, 8);
assert.equal(annualResult.monthlyFlow.length, 12);
const rejectedAnnual = await fetch(`${url}/v1/annual-readings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...annualRequest, targetYear: 2100 }) });
assert.equal(rejectedAnnual.status, 422);
const missingAnnualProvenance = await fetch(`${url}/v1/annual-readings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...annualRequest, chartPolicy: { id: 'KR-CIVIL-1.0' } }) });
assert.equal(missingAnnualProvenance.status, 422);
const accepted = await post(valid());
assert.equal(accepted.status, 202);
assert.equal((await accepted.json()).durable, false);

const chartWithDaewoon = chartWithDaewoonFor(defaultBirthInput);
const acceptedDaewoon = await post(valid({ clientRequestId: 'valid-daewoon', chartResult: chartWithDaewoon }));
assert.equal(acceptedDaewoon.status, 202);
const tamperedDaewoon = { ...chartWithDaewoon, daewoon: { ...chartWithDaewoon.daewoon, direction: 'backward' } };
const tamperedDaewoonResponse = await post(valid({ clientRequestId: 'tampered-daewoon', chartResult: tamperedDaewoon }));
assert.equal(tamperedDaewoonResponse.status, 422);
const malformedNatalDaewoonResponse = await post(valid({ clientRequestId: 'malformed-natal-daewoon', chartResult: { ...chartWithDaewoon, pillars: [] } }));
assert.equal(malformedNatalDaewoonResponse.status, 422, 'malformed natal pillars with daewoon are rejected without a server error');

const training = await post(valid({ purposeReceipts: [receipt('service_storage'), receipt('model_training')] }));
assert.equal((await training.json()).trainingEligible, true);

const couple = await post(valid({
  relationshipMode: 'couple',
  partnerSubject: { relationship: 'partner', authorityVerified: true, minor: 'unknown' },
  partnerBirthInput: { calendar: 'solar', date: '1992-02-14', time: '09:00', place: '서울특별시 종로구 사직동', placeCode: '1111053000', unknownTime: false },
  chartResult: { mode: 'couple', self: chartFor(defaultBirthInput), partner: chartFor({ calendar: 'solar', date: '1992-02-14', time: '09:00', place: '서울특별시 종로구 사직동', placeCode: '1111053000', unknownTime: false }) },
  partnerPurposeReceipts: [receipt('service_storage')],
}));
assert.equal(couple.status, 202);
assert.equal((await couple.json()).trainingEligible, false);

const partnerBirthInput = { calendar: 'solar', date: '1992-02-14', time: '09:00', place: '서울특별시 종로구 사직동', placeCode: '1111053000', unknownTime: false };
const partnerDaewoonChart = chartWithDaewoonFor(partnerBirthInput);
const tamperedPartnerDaewoon = { ...partnerDaewoonChart, daewoon: { ...partnerDaewoonChart.daewoon, startAge: partnerDaewoonChart.daewoon.startAge + 1 } };
const tamperedCouple = await post(valid({
  clientRequestId: 'tampered-partner-daewoon',
  relationshipMode: 'couple',
  partnerSubject: { relationship: 'partner', authorityVerified: true, minor: 'unknown' },
  partnerBirthInput,
  chartResult: { mode: 'couple', self: chartWithDaewoon, partner: tamperedPartnerDaewoon },
  partnerPurposeReceipts: [receipt('service_storage')],
}));
assert.equal(tamperedCouple.status, 422, 'tampered partner daewoon is rejected');

const unknownMinor = await post(valid({ dataSubject: { relationship: 'self', authorityVerified: true, minor: 'unknown' }, purposeReceipts: [receipt('service_storage'), receipt('model_training')] }));
assert.equal((await unknownMinor.json()).trainingEligible, false);

const minorBirthInput = { ...defaultBirthInput, date: '2010-01-01' };
const underNineteen = await post(valid({ dataSubject: { relationship: 'self', authorityVerified: true, minor: true }, birthInput: minorBirthInput, chartResult: chartFor(minorBirthInput), purposeReceipts: [receipt('service_storage'), receipt('model_training')] }));
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
const incompleteAnnual = structuredClone(annualResult);
delete incompleteAnnual.boundaryFlags;
const incompleteAnnualResponse = await post(valid({ clientRequestId: 'incomplete-annual', chartResult: annualChartResult, readingScope: 'annual', targetYear: 2026, annualResult: incompleteAnnual }));
assert.equal(incompleteAnnualResponse.status, 422);

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
assert.equal(annualRow.reading_scope, 'annual');
assert.equal(annualRow.schema_version, 'annual-reading.v1');
assert.equal(JSON.parse(annualRow.annual_cards_json).length, 8);
assert.equal(JSON.parse(annualRow.monthly_flow_json).length, 12);
assert.equal(annualRow.content_hash, annualResult.contentHash);
assert.deepEqual(durableStorage.getAnnualReadingResult(durableAnnualBody.submissionId), annualResult, 'complete annual result round-trips losslessly');

const projectedAnnual = projection.buildTrainingProjection(valid({ chartResult: annualChartResult, purposeReceipts: [receipt('service_storage'), receipt('model_training')], readingScope: 'annual', targetYear: 2026, annualResult }));
assert.equal(projectedAnnual.readingScope, 'annual');
assert.equal(projectedAnnual.annualCards.length, 8);
assert.doesNotMatch(JSON.stringify(projectedAnnual.annualCards), /1990-10-10|역삼1동|1168064000/);

const durableAnnualTrainingResponse = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid({ clientRequestId: 'durable-annual-training-client', chartResult: annualChartResult, purposeReceipts: [receipt('service_storage'), receipt('model_training')], readingScope: 'annual', targetYear: 2026, annualResult })) });
assert.equal(durableAnnualTrainingResponse.status, 202);
const durableAnnualTrainingBody = await durableAnnualTrainingResponse.json();
const annualWithdrawalResponse = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions/${durableAnnualTrainingBody.submissionId}/training-withdrawal`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recordedAt: '2026-08-02T00:00:00Z' }) });
assert.equal(annualWithdrawalResponse.status, 200);
assert.equal(durableStorage.getSubmission(durableAnnualTrainingBody.submissionId).training_projection_json, null);
assert.deepEqual(durableStorage.getAnnualReadingResult(durableAnnualTrainingBody.submissionId), annualResult, 'withdrawal retains the service annual result');

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
const annualDeletionResponse = await fetch(`http://127.0.0.1:${durablePort}/v1/submissions/${durableAnnualBody.submissionId}`, { method: 'DELETE' });
assert.equal(annualDeletionResponse.status, 200);
assert.equal(durableStorage.getAnnualReading(durableAnnualBody.submissionId), null, 'foreign-key cascade removes annual row');
durableServer.close();
durableStorage.close();

const legacyDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'saju-annual-legacy-'));
const legacyPath = path.join(legacyDirectory, 'legacy.sqlite');
const legacyDb = new DatabaseSync(legacyPath);
legacyDb.exec(`
  CREATE TABLE submissions (submission_id TEXT PRIMARY KEY, client_request_id TEXT NOT NULL UNIQUE, relationship_mode TEXT NOT NULL DEFAULT 'single', data_subject_json TEXT NOT NULL, partner_subject_json TEXT, birth_input_json TEXT NOT NULL, chart_result_json TEXT NOT NULL, purpose_receipts_json TEXT NOT NULL, status_code TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE annual_readings (submission_id TEXT PRIMARY KEY REFERENCES submissions(submission_id) ON DELETE CASCADE, target_year INTEGER NOT NULL, calculation_policy_json TEXT NOT NULL, interpretation_profile_json TEXT NOT NULL, annual_facts_json TEXT NOT NULL, annual_cards_json TEXT NOT NULL, monthly_flow_json TEXT NOT NULL, content_hash TEXT NOT NULL, created_at TEXT NOT NULL);
`);
legacyDb.close();
const migratedLegacyStorage = createSqliteStorage(legacyPath);
assert.doesNotThrow(() => migratedLegacyStorage.saveSubmission({ submissionId: 'legacy-annual-id', input: valid({ clientRequestId: 'legacy-annual-client', chartResult: annualChartResult, readingScope: 'annual', targetYear: 2026, annualResult }), projection: null, status: 'accepted' }));
assert.deepEqual(migratedLegacyStorage.getAnnualReadingResult('legacy-annual-id'), annualResult, 'additive migration makes old SQLite files lossless');
migratedLegacyStorage.close();
fs.rmSync(legacyDirectory, { recursive: true, force: true });

server.close();
const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`ingestion smoke: ${assertionCount} assertions passed`);
