import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  calculateDaewoon,
  verifyDaewoon,
  DAEWOON_POLICY,
} from '../../chart/daewoon-engine.mjs';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';

assert.equal(DAEWOON_POLICY.id, 'KR-DAEWOON-1.0');
assert.equal(DAEWOON_POLICY.version, '1.1.0');
assert.equal(DAEWOON_POLICY.engine, 'gyeol-daewoon-core');
assert.equal(DAEWOON_POLICY.maxCycleCount, 8);
assert.equal(DAEWOON_POLICY.cycleSpanYears, 10);
assert.equal(DAEWOON_POLICY.dayToYearDivisor, 3);
assert.equal(DAEWOON_POLICY.boundaryConvention, 'direction-dependent-jie');
assert.match(DAEWOON_POLICY.directionRule, /yang-male-yin-female-forward/);
assert.deepEqual(DAEWOON_POLICY.natalPolicy, 'KR-CIVIL-1.0');
assert.equal(Object.isFrozen(DAEWOON_POLICY), true);

assert.throws(() => calculateDaewoon(null), /daewoon input must be an object/);
assert.throws(() => calculateDaewoon({}), /date must use YYYY-MM-DD/);
assert.throws(() => calculateDaewoon({ date: '1990-02-30', time: '12:00', yearStem: '甲', monthStem: '丙', monthBranch: '寅' }), /valid calendar date/);
assert.throws(() => calculateDaewoon({ date: '1990-10-10', time: '99:99', yearStem: '甲', monthStem: '丙', monthBranch: '寅' }), /valid HH:MM/);
assert.throws(() => calculateDaewoon({ date: '1898-01-01', time: '12:00', yearStem: '甲', monthStem: '丙', monthBranch: '寅' }), /birth year/);
assert.throws(() => calculateDaewoon({ date: '1990-10-10', time: '12:00', yearStem: 'X', monthStem: '丙', monthBranch: '寅' }), /yearStem/);
assert.throws(() => calculateDaewoon({ date: '1990-10-10', time: '12:00', yearStem: '甲', monthStem: 'X', monthBranch: '寅' }), /monthStem/);
assert.throws(() => calculateDaewoon({ date: '1990-10-10', time: '12:00', yearStem: '甲', monthStem: '丙', monthBranch: 'X' }), /monthBranch/);
assert.throws(() => calculateDaewoon({ date: '1990-10-10', time: 'bad', yearStem: '甲', monthStem: '丙', monthBranch: '寅' }), /time must use HH:MM/);

const yangResult = calculateDaewoon({ date: '1990-10-10', time: '14:30', sex: 'male', yearStem: '庚', monthStem: '丙', monthBranch: '戌', unknownTime: false });
assert.equal(yangResult.schemaVersion, 'daewoon.v1');
assert.equal(yangResult.direction, 'forward', '庚 yang year + male → forward');
assert.equal(yangResult.cycles.length, 8);
assert.equal(yangResult.cycles[0].pillar, '丁亥', 'first cycle is the pillar AFTER the month pillar (oracle: lunar-javascript)');
assert.equal(yangResult.cycles[1].pillar, '戊子', 'second cycle advances one step forward');
assert.equal(yangResult.cycles[7].pillar, '甲午', 'eighth cycle');
assert.equal(yangResult.cycles[0].startYear, 2000, 'start year uses the exact 1-day=4-month conversion (oracle: 2000, not 1990+9)');
assert.equal(yangResult.cycles[1].startYear, 2010, 'subsequent cycles are +10 calendar years');
assert.equal(yangResult.startAge, 9, 'daewoon-su (3-day-per-year, truncated)');
assert.equal(yangResult.cycles[0].startAge < yangResult.cycles[1].startAge, true);
for (let i = 1; i < 8; i += 1) {
  assert.equal(yangResult.cycles[i].startAge - yangResult.cycles[i - 1].startAge, 10, `cycle ${i} is 10 years after cycle ${i - 1}`);
}
assert.ok(yangResult.startAge >= 0 && yangResult.startAge < 10, 'start age from 3-day rule is between 0 and 9');
assert.ok(yangResult.boundaryTerm, 'boundary term is identified');

// Oracle-verified fixtures (lunar-javascript EightChar parity, 2026-08-27):
// [date, time, sex, yearStem, monthStem/Branch, direction, first pillar, first startYear]
const oracleFixtures = [
  { date: '1990-10-10', time: '14:30', sex: 'male', yearStem: '庚', monthStem: '丙', monthBranch: '戌', direction: 'forward', first: '丁亥', year: 2000, seq: ['丁亥', '戊子', '己丑', '庚寅', '辛卯'] },
  { date: '1985-02-20', time: '10:00', sex: 'male', yearStem: '乙', monthStem: '戊', monthBranch: '寅', direction: 'backward', first: '丁丑', year: 1990, seq: ['丁丑', '丙子', '乙亥', '甲戌', '癸酉'] },
  { date: '1972-08-15', time: '03:40', sex: 'female', yearStem: '壬', monthStem: '戊', monthBranch: '申', direction: 'backward', first: '丁未', year: 1975, seq: ['丁未', '丙午', '乙巳', '甲辰', '癸卯'] },
  { date: '2001-05-05', time: '23:30', sex: 'female', yearStem: '辛', monthStem: '癸', monthBranch: '巳', direction: 'forward', first: '甲午', year: 2011, seq: ['甲午', '乙未', '丙申', '丁酉', '戊戌'] },
  { date: '1949-10-01', time: '06:00', sex: 'male', yearStem: '己', monthStem: '癸', monthBranch: '酉', direction: 'backward', first: '壬申', year: 1957, seq: ['壬申', '辛未', '庚午', '己巳', '戊辰'] },
];
for (const f of oracleFixtures) {
  const r = calculateDaewoon({ date: f.date, time: f.time, sex: f.sex, yearStem: f.yearStem, monthStem: f.monthStem, monthBranch: f.monthBranch, unknownTime: false });
  assert.equal(r.direction, f.direction, `${f.date} ${f.sex}: direction`);
  assert.equal(r.cycles[0].pillar, f.first, `${f.date} ${f.sex}: first pillar`);
  assert.equal(r.cycles[0].startYear, f.year, `${f.date} ${f.sex}: first start year`);
  f.seq.forEach((pillar, i) => assert.equal(r.cycles[i].pillar, pillar, `${f.date} ${f.sex}: sequence ${i}`));
}

// Gender flips the direction (양남음녀 순행 · 음남양녀 역행).
const female1990 = calculateDaewoon({ date: '1990-10-10', time: '14:30', sex: 'female', yearStem: '庚', monthStem: '丙', monthBranch: '戌', unknownTime: false });
assert.equal(female1990.direction, 'backward', 'yang-year FEMALE walks backward');
const female1985 = calculateDaewoon({ date: '1985-02-20', time: '10:00', sex: 'female', yearStem: '乙', monthStem: '戊', monthBranch: '寅', unknownTime: false });
assert.equal(female1985.direction, 'forward', 'yin-year FEMALE walks forward');

const yinResult = calculateDaewoon({ date: '1985-06-15', time: '10:00', sex: 'male', yearStem: '乙', monthStem: '壬', monthBranch: '午', unknownTime: false });
assert.equal(yinResult.direction, 'backward', '乙 yin year + male → backward');
assert.equal(yinResult.cycles[0].pillar, '辛巳', 'backward first cycle is the pillar BEFORE the month pillar');
assert.equal(yinResult.cycles[1].pillar, '庚辰', 'backward second cycle retreats one step');
assert.equal(yinResult.cycles[7].pillar, '甲戌', 'backward eighth cycle');

for (const yangStem of ['甲', '丙', '戊', '庚', '壬']) {
  const r = calculateDaewoon({ date: '2000-03-15', time: '12:00', yearStem: yangStem, monthStem: '己', monthBranch: '卯' });
  assert.equal(r.direction, 'forward', `${yangStem} is yang → forward`);
}
for (const yinStem of ['乙', '丁', '己', '辛', '癸']) {
  const r = calculateDaewoon({ date: '2000-03-15', time: '12:00', yearStem: yinStem, monthStem: '己', monthBranch: '卯' });
  assert.equal(r.direction, 'backward', `${yinStem} is yin → backward`);
}

const yangStems = ['甲', '丙', '戊', '庚', '壬'];
const yinStems = ['乙', '丁', '己', '辛', '癸'];
assert.equal(yangStems.length, 5);
assert.equal(yinStems.length, 5);

const unknownTimeResult = calculateDaewoon({ date: '1990-10-10', yearStem: '庚', monthStem: '丙', monthBranch: '戌', unknownTime: true });
assert.equal(unknownTimeResult.input.time, '12:00', 'unknown time uses noon proxy');
assert.equal(unknownTimeResult.input.unknownTime, true);

const historicalForward = calculateDaewoon({ date: '1901-02-07', time: '15:00', yearStem: '甲', monthStem: '丙', monthBranch: '寅' });
assert.equal(historicalForward.startAge, 8, 'historical forward calculation uses Korean legal civil time instead of a fixed UTC+9 offset');
const historicalBackward = calculateDaewoon({ date: '1901-03-06', time: '15:00', yearStem: '乙', monthStem: '丙', monthBranch: '寅' });
assert.equal(historicalBackward.startAge, 0, 'historical backward calculation selects the correct legal-time boundary');
assert.equal(historicalBackward.boundaryTerm, 'JING_ZHE');

const natal = calculateNatalChart({ calendar: 'solar', date: '1990-10-10', time: '14:30', place: '서울', placeCode: '1111000000', unknownTime: false });
const natalDaewoon = calculateDaewoon({
  date: '1990-10-10',
  time: '14:30',
  sex: 'male',
  yearStem: natal.pillars[0].stem,
  monthStem: natal.pillars[1].stem,
  monthBranch: natal.pillars[1].branch,
  unknownTime: false,
});
assert.equal(natalDaewoon.cycles[0].pillar, '丁亥', 'daewoon first cycle is one step past the natal month pillar 丙戌 (forward, male)');

const verification = verifyDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌' }, yangResult);
assert.equal(verification.valid, true);
assert.deepEqual(verification.errors, []);

const tampered = { ...yangResult, direction: 'backward' };
const tamperedVerify = verifyDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌' }, tampered);
assert.equal(tamperedVerify.valid, false);
assert.ok(tamperedVerify.errors.some((e) => /direction does not match/.test(e)));

const tamperedCycle = { ...yangResult, cycles: yangResult.cycles.map((c, i) => (i === 2 ? { ...c, pillar: 'XXX', stem: 'X', branch: 'X' } : c)) };
const tamperedCycleVerify = verifyDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌' }, tamperedCycle);
assert.equal(tamperedCycleVerify.valid, false);
assert.ok(tamperedCycleVerify.errors.some((e) => /cycle 2 pillar does not match/.test(e)));

const tamperedPolicy = { ...yangResult, policy: { ...yangResult.policy, id: 'FAKE' } };
const tamperedPolicyVerify = verifyDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌' }, tamperedPolicy);
assert.equal(tamperedPolicyVerify.valid, false);
assert.ok(tamperedPolicyVerify.errors.some((e) => /policy\.id does not match/.test(e)));

const tamperedBoundary = { ...yangResult, boundaryDate: '1999-99-99' };
const tamperedBoundaryVerify = verifyDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌' }, tamperedBoundary);
assert.equal(tamperedBoundaryVerify.valid, false);
assert.ok(tamperedBoundaryVerify.errors.some((e) => /boundaryDate does not match/.test(e)));

const tamperedStartYear = { ...yangResult, cycles: yangResult.cycles.map((c, i) => (i === 1 ? { ...c, startYear: c.startYear + 100 } : c)) };
const tamperedStartYearVerify = verifyDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌' }, tamperedStartYear);
assert.equal(tamperedStartYearVerify.valid, false);
assert.ok(tamperedStartYearVerify.errors.some((e) => /cycle 1 startYear does not match/.test(e)));

const tamperedEngine = { ...yangResult, policy: { ...yangResult.policy, engine: 'fake-engine' } };
assert.ok(verifyDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌' }, tamperedEngine).errors.some((e) => /policy\.engine does not match/.test(e)));

const tamperedInput = { ...yangResult, input: { ...yangResult.input, date: '2000-01-01' } };
assert.ok(verifyDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌' }, tamperedInput).errors.some((e) => /input\.date does not match/.test(e)));

const tamperedUnsupportedReason = { ...yangResult, unsupportedStates: yangResult.unsupportedStates.map((state, index) => (index === 0 ? { ...state, reason: 'tampered' } : state)) };
assert.ok(verifyDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌' }, tamperedUnsupportedReason).errors.some((e) => /unsupportedStates\[0\]\.reason does not match/.test(e)));

assert.equal(yangResult.policy.id, 'KR-DAEWOON-1.0');
assert.equal(yangResult.natalPolicy.id, 'KR-CIVIL-1.0');
assert.ok(Array.isArray(yangResult.unsupportedStates));
assert.ok(yangResult.unsupportedStates.some((s) => s.id === 'daewoon.strength'));
assert.ok(yangResult.unsupportedStates.some((s) => s.id === 'daewoon.interpretation'));

assert.throws(
  () => calculateDaewoon({ date: '2101-01-01', time: '12:00', yearStem: '甲', monthStem: '丙', monthBranch: '寅' }),
  /birth year/,
  'out of ephemeris range is rejected',
);

const lateBirth = calculateDaewoon({ date: '2030-01-01', time: '12:00', yearStem: '甲', monthStem: '丙', monthBranch: '寅' });
assert.ok(lateBirth.cycles.length < DAEWOON_POLICY.maxCycleCount, 'late birth year produces fewer cycles within ephemeris range');
assert.ok(lateBirth.cycles.every((c) => c.startYear <= 2100), 'all cycle start years are within ephemeris range');

const maxFullCyclesYear = 2100 - 9 - 7 * 10;
const edgeResult = calculateDaewoon({ date: `${maxFullCyclesYear}-06-15`, time: '08:00', yearStem: '庚', monthStem: '壬', monthBranch: '午' });
assert.equal(edgeResult.cycles.length, DAEWOON_POLICY.maxCycleCount, 'boundary birth year still gets full 8 cycles');
assert.ok(edgeResult.cycles[7].startYear <= 2100);

for (const date of ['2100-01-01', '2100-06-15', '2100-12-31']) {
  const result = calculateDaewoon({ date, time: '12:00', yearStem: '甲', monthStem: '丙', monthBranch: '寅' });
  assert.equal(result.cycleCount, 1, `${date} retains the first cycle after later cycles are truncated`);
  assert.equal(result.cycles.length, 1);
}
const finalSupportedDate = calculateDaewoon({ date: '2100-12-31', time: '12:00', yearStem: '甲', monthStem: '丙', monthBranch: '寅' });
assert.equal(finalSupportedDate.boundaryTerm, 'XIAO_HAN');
assert.equal(finalSupportedDate.boundaryDate, '2101-01-05', 'the 2101 sentinel boundary completes the declared 2100 birth-date range');

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`daewoon unit: ${assertionCount} assertions passed`);
