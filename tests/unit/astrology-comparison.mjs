// tests/unit/astrology-comparison.mjs
import assert from 'node:assert/strict';
import {
  normalizeBirthProfile,
  resolveEligibility,
  calculateSystem,
  buildComparison,
  listPolicies,
  SYSTEM_IDS,
} from '../../server/domain/astrology-comparison.mjs';

// 1. Policy Registry
const policies = listPolicies();
assert.equal(policies.length, 4);
for (const p of policies) {
  assert.equal(p.status, 'active', `policy ${p.systemId} must be active`);
  assert.equal(p.engineAvailable, true, `engine for ${p.systemId} must be available`);
}

// 2. Normalization
const rawProfile = {
  calendar: 'solar',
  date: '1990-10-10',
  time: '14:30',
  place: '서울특별시 강남구 역삼동',
  countryCode: 'KR',
  timezoneId: 'Asia/Seoul',
};
const profile = normalizeBirthProfile(rawProfile);
assert.equal(profile.inputCalendar.date, '1990-10-10');
assert.equal(profile.birthTime.localTime, '14:30');
assert.equal(profile.place.timezoneId, 'Asia/Seoul', 'the Korean product default is explicit');
assert.equal(profile.resolvedInstant.resolutionStatus, 'exact');

const femaleProfile = normalizeBirthProfile({ ...rawProfile, sex: 'female' });
assert.equal(femaleProfile.traditionalSexParameter, 'female', 'traditional sex input is preserved');
const noTimeProfile = normalizeBirthProfile({ ...rawProfile, time: null, unknownTime: true });
assert.equal(resolveEligibility(noTimeProfile, 'tu-vi').status, 'needs_input', 'Tử Vi never substitutes noon for an unknown hour');
assert.equal(resolveEligibility(noTimeProfile, 'horasat').status, 'needs_input', 'Horasat never substitutes noon for an unknown time');
const unsupportedZoneProfile = normalizeBirthProfile({ ...rawProfile, timezoneId: 'America/New_York' });
assert.equal(resolveEligibility(unsupportedZoneProfile, 'horasat').status, 'unsupported_range', 'an unresolved non-Korean time-zone path is not silently read as Seoul');

// 3. Eligibility - all 4 systems eligible
for (const id of SYSTEM_IDS) {
  const el = resolveEligibility(profile, id);
  assert.equal(el.canCalculate, true, `${id} must be eligible to calculate`);
}

// 4. Calculate all 4 Systems
const sajuResult = calculateSystem(profile, 'saju');
assert.equal(sajuResult.result.systemId, 'saju');
assert.ok(sajuResult.result.facts.length > 0);

const mahaboteResult = calculateSystem(profile, 'mahabote');
assert.equal(mahaboteResult.result.systemId, 'mahabote');
assert.ok(mahaboteResult.result.facts.length >= 8);
assert.ok(mahaboteResult.result.claims.length >= 2);

const horasatResult = calculateSystem(profile, 'horasat');
assert.equal(horasatResult.result.systemId, 'horasat');
assert.ok(horasatResult.result.facts.length >= 5);
assert.ok(horasatResult.result.claims.length >= 2);

const tuViResult = calculateSystem(profile, 'tu-vi');
assert.equal(tuViResult.result.systemId, 'tu-vi');
assert.ok(tuViResult.result.facts.length >= 5);
assert.ok(tuViResult.result.claims.length >= 2);
assert.equal(tuViResult.result.nativeChart.data.sex, null, 'the base Tử Vi chart records missing traditional sex rather than inferring it');
const femaleTuViResult = calculateSystem(femaleProfile, 'tu-vi');
assert.equal(femaleTuViResult.result.nativeChart.data.sex, 'female', 'Tử Vi keeps the provided traditional sex parameter');

// 5. Build 4-System Comparison Bundle
const bundle = buildComparison({
  requestedSystems: ['saju', 'mahabote', 'horasat', 'tu-vi'],
  results: [sajuResult.result, mahaboteResult.result, horasatResult.result, tuViResult.result],
});

assert.equal(bundle.schemaVersion, 'comparison-bundle.v1');
assert.equal(bundle.status, 'complete');
assert.equal(bundle.sourceResults.length, 4);
assert.ok(bundle.sections.common.length > 0 || bundle.sections.different.length > 0 || bundle.sections.unique.length > 0);

console.log('✓ astrology-comparison: 24 assertions passed');
