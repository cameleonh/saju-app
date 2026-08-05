import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateSubmission, buildSubmissionDecision, buildTrainingProjection } from '../../server/domain/submission.mjs';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';
import { calculateDaewoon } from '../../chart/daewoon-engine.mjs';

const receipt = (purpose, decision = 'accepted') => ({
  receiptId: `${purpose}-id`,
  purpose,
  decision,
  disclosureVersion: 'v1',
  recordedAt: '2026-08-01T00:00:00Z',
});
const birthInput = { calendar: 'solar', date: '1990-10-10', time: '14:30', place: '서울특별시 강남구 역삼1동', placeCode: '1168064000', unknownTime: false };
const chartFor = (input) => ({ ...calculateNatalChart(input), facts: [{ id: 'day.element', value: '토' }], reading: [] });
const chartWithDaewoonFor = (input) => {
  const chart = chartFor(input);
  return {
    ...chart,
    daewoon: calculateDaewoon({
      date: input.date,
      time: input.unknownTime ? '12:00' : input.time,
      unknownTime: input.unknownTime,
      yearStem: chart.pillars[0].stem,
      monthStem: chart.pillars[1].stem,
      monthBranch: chart.pillars[1].branch,
    }),
  };
};

function baseSubmission(overrides = {}) {
  return {
    schemaVersion: 'submission.v1',
    clientRequestId: 'client-1',
    dataSubject: { relationship: 'self', authorityVerified: true, minor: false },
    birthInput,
    chartResult: chartFor(birthInput),
    purposeReceipts: [receipt('service_storage')],
    ...overrides,
  };
}

assert.deepEqual(validateSubmission(null), ['request body must be a JSON object']);
assert.deepEqual(validateSubmission(undefined), ['request body must be a JSON object']);
assert.deepEqual(validateSubmission('not-an-object'), ['request body must be a JSON object']);

assert.ok(validateSubmission({}).some((error) => /schemaVersion must be submission\.v1/.test(error)));
assert.ok(validateSubmission(baseSubmission({ schemaVersion: 'v0' })).some((error) => /schemaVersion must be submission\.v1/.test(error)));

assert.ok(validateSubmission(baseSubmission({ clientRequestId: null })).some((error) => /clientRequestId is required/.test(error)));
assert.ok(validateSubmission(baseSubmission({ clientRequestId: 'x'.repeat(121) })).some((error) => /clientRequestId is required/.test(error)));

assert.ok(validateSubmission(baseSubmission({ birthInput: null })).some((error) => /birthInput is required/.test(error)));
assert.ok(validateSubmission(baseSubmission({ birthInput: { calendar: 'lunar' } })).some((error) => /only solar input is supported/.test(error)));
assert.ok(validateSubmission(baseSubmission({ birthInput: { ...birthInput, date: '1990/10/10' } })).some((error) => /birthInput\.date must use YYYY-MM-DD/.test(error)));
assert.ok(validateSubmission(baseSubmission({ birthInput: { ...birthInput, time: '14-30' } })).some((error) => /birthInput\.time must use HH:MM/.test(error)));
assert.ok(validateSubmission(baseSubmission({ birthInput: { ...birthInput, place: '' } })).some((error) => /birthInput\.place is required/.test(error)));
assert.ok(validateSubmission(baseSubmission({ birthInput: { ...birthInput, placeCode: 'abc' } })).some((error) => /birthInput\.placeCode must be a 10-digit/.test(error)));
assert.ok(validateSubmission(baseSubmission({ birthInput: { ...birthInput, placeCode: '12345' } })).some((error) => /birthInput\.placeCode must be a 10-digit/.test(error)));

assert.ok(validateSubmission(baseSubmission({ chartResult: null })).some((error) => /chartResult is required/.test(error)));
assert.ok(
  validateSubmission(baseSubmission({ chartResult: { ...chartFor(birthInput), schemaVersion: 'tampered' } }))
    .some((error) => /chartResult chart schemaVersion does not match/.test(error)),
  'a chart with a tampered schemaVersion is rejected',
);

const daewoonChart = chartWithDaewoonFor(birthInput);
assert.deepEqual(validateSubmission(baseSubmission({ chartResult: daewoonChart })), [], 'a deterministic daewoon result is accepted');
const tamperedDaewoonChart = { ...daewoonChart, daewoon: { ...daewoonChart.daewoon, direction: 'backward' } };
assert.ok(validateSubmission(baseSubmission({ chartResult: tamperedDaewoonChart })).some((error) => /daewoon direction does not match/.test(error)), 'a tampered daewoon result is rejected');
const malformedNatalWithDaewoon = { ...daewoonChart, pillars: [] };
assert.doesNotThrow(() => validateSubmission(baseSubmission({ chartResult: malformedNatalWithDaewoon })), 'malformed natal pillars with daewoon produce validation errors instead of throwing');
assert.ok(validateSubmission(baseSubmission({ chartResult: malformedNatalWithDaewoon })).some((error) => /chart pillars do not match/.test(error)));

assert.ok(validateSubmission(baseSubmission({ readingScope: 'daily' })).some((error) => /readingScope must be natal or annual/.test(error)));
assert.ok(validateSubmission(baseSubmission({ readingScope: 'annual' })).some((error) => /targetYear must be an integer/.test(error)));
assert.ok(validateSubmission(baseSubmission({ readingScope: 'annual', targetYear: 2026 })).some((error) => /annualResult is required/.test(error)));

assert.ok(validateSubmission(baseSubmission({ dataSubject: null })).some((error) => /dataSubject\.relationship must be self or third_party/.test(error)));
assert.ok(validateSubmission(baseSubmission({ dataSubject: { relationship: ' acquaintance' } })).some((error) => /dataSubject\.relationship must be self or third_party/.test(error)), 'unknown relationship is rejected');
assert.ok(
  validateSubmission(baseSubmission({ dataSubject: { relationship: 'third_party', authorityVerified: false, minor: false } }))
    .some((error) => /third-party submissions require verified authority/.test(error)),
);
assert.deepEqual(
  validateSubmission(baseSubmission({ dataSubject: { relationship: 'self' } })),
  [],
  'self relationship does not require authorityVerified (only third_party does)',
);

assert.ok(validateSubmission(baseSubmission({ purposeReceipts: [] })).some((error) => /service_storage authorization is required/.test(error)));

const coupleMissingPartner = validateSubmission(baseSubmission({ relationshipMode: 'couple' }));
assert.ok(coupleMissingPartner.some((error) => /partnerBirthInput is required for couple/.test(error)));
assert.ok(coupleMissingPartner.some((error) => /partnerSubject\.relationship must be partner/.test(error)));
assert.ok(coupleMissingPartner.some((error) => /partnerPurposeReceipts are required/.test(error)));
assert.ok(coupleMissingPartner.some((error) => /chartResult\.partner is required/.test(error)));

const coupleMissingPartnerAuthority = validateSubmission(baseSubmission({
  relationshipMode: 'couple',
  partnerSubject: { relationship: 'partner', authorityVerified: false },
}));
assert.ok(coupleMissingPartnerAuthority.some((error) => /couple submissions require verified partner authority/.test(error)));

const partnerBirthInput = { calendar: 'solar', date: '1992-02-14', time: '09:00', place: '서울특별시 종로구 사직동', placeCode: '1111053000', unknownTime: false };
const partnerChart = chartWithDaewoonFor(partnerBirthInput);
const tamperedPartnerChart = { ...partnerChart, daewoon: { ...partnerChart.daewoon, startAge: partnerChart.daewoon.startAge + 1 } };
const tamperedPartnerErrors = validateSubmission(baseSubmission({
  relationshipMode: 'couple',
  partnerBirthInput,
  partnerSubject: { relationship: 'partner', authorityVerified: true },
  partnerPurposeReceipts: [receipt('service_storage')],
  chartResult: { mode: 'couple', self: daewoonChart, partner: tamperedPartnerChart },
}));
assert.ok(tamperedPartnerErrors.some((error) => /partner chartResult daewoon startAge does not match/.test(error)), 'partner daewoon tampering is rejected');

const valid = validateSubmission(baseSubmission());
assert.equal(valid.length, 0, JSON.stringify(valid, null, 2));

const decision = buildSubmissionDecision(baseSubmission());
assert.equal(decision.accepted, true);
assert.equal(decision.status, 'accepted-pending-persistence');
assert.equal(decision.durable, false);
assert.equal(decision.trainingEligible, false, 'no model_training receipt means not training-eligible');
assert.deepEqual(decision.purposes, ['service_storage']);

const rejected = buildSubmissionDecision(baseSubmission({ birthInput: null }));
assert.equal(rejected.accepted, false);
assert.ok(rejected.errors.length > 0);
assert.equal(rejected.durable, undefined);
assert.equal(rejected.trainingEligible, undefined);

const trainingDecision = buildSubmissionDecision(baseSubmission({ purposeReceipts: [receipt('service_storage'), receipt('model_training')] }));
assert.equal(trainingDecision.trainingEligible, true);

const noProjection = buildTrainingProjection(baseSubmission());
assert.equal(noProjection, null, 'no model_training receipt produces no projection');

const projection = buildTrainingProjection(baseSubmission({ purposeReceipts: [receipt('service_storage'), receipt('model_training')] }));
assert.equal(projection.schemaVersion, 'training-projection.v1');
assert.equal(projection.subjectKey, 'subject:self');
assert.equal(projection.consentReceiptId, 'model_training-id');
assert.ok(Array.isArray(projection.chartFacts));
assert.doesNotMatch(JSON.stringify(projection), /역삼|1168064000|1990-10-10/, 'training projection does not echo raw birth input fields');

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`submission unit: ${assertionCount} assertions passed`);
