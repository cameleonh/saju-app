import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  NATAL_POLICY,
  calculateNatalChart,
  resolveSeoulCivilTime,
  verifyNatalChart,
} from '../chart/natal-engine.mjs';
import { EPHEMERIS_FIXTURES } from '../server/domain/annual-ephemeris.mjs';

const birth = (date, time, overrides = {}) => ({
  calendar: 'solar',
  date,
  time,
  unknownTime: false,
  place: '서울특별시 강남구 역삼1동',
  placeCode: '1168064000',
  ...overrides,
});

const golden = calculateNatalChart(birth('1990-10-10', '14:30'));
assert.deepEqual(golden.pillars.map(({ text }) => text), ['庚午', '丙戌', '戊申', '己未']);
assert.equal(golden.policy.id, 'KR-CIVIL-1.0');
assert.equal(golden.policy.version, '1.1.0');
assert.equal(golden.policy.engine, 'gyeol-natal-core');
assert.equal(golden.policy.engineVersion, '1.1.0');
assert.equal(golden.boundaryFlags.yearTerm, 'LI_CHUN');
assert.equal(golden.boundaryFlags.dayBoundary, 'solar-corrected-midnight (동경 127.5도 보정시계의 자정)');
assert.equal(golden.boundaryFlags.ziHour, '23:00-00:59 (보정시계 기준)');
assert.equal(golden.solarTime.date, '1990-10-10');
assert.equal(golden.solarTime.time, '14:00');
assert.equal(golden.solarTime.offsetMinutes, 510);
assert.equal(golden.boundaryFlags.endExclusive, true);
assert.equal(golden.provenance.solarTerms.calculationSources[0].id, 'shouxing-ephemeris-snapshot');
assert.equal(golden.provenance.solarTerms.validationSource.id, 'kasi-kasa-almanac-kst-minute');
assert.equal(verifyNatalChart(birth('1990-10-10', '14:30'), golden).valid, true);
assert.equal(verifyNatalChart(birth('1990-10-10', '14:30'), { ...golden, pillars: [{ text: '甲子' }] }).valid, false);
assert.equal(verifyNatalChart(birth('1990-10-10', '14:30'), { ...golden, pillars: golden.pillars.map((item, index) => index === 2 ? { ...item, stem: '甲' } : item) }).valid, false);
assert.equal(verifyNatalChart(birth('1990-10-10', '14:30'), { ...golden, boundaryFlags: { ...golden.boundaryFlags, dayBoundary: 'zi-hour' } }).valid, false);

const unknownTime = calculateNatalChart(birth('1990-10-10', '12:00', { unknownTime: true }));
assert.equal(unknownTime.pillars[3].text, '미상');
assert.equal(unknownTime.boundaryFlags.timeKnown, false);
assert.ok(unknownTime.warnings.some(({ fact }) => fact === 'input.unknown-time'));

// 입춘 2024 = 17:27 KST. 동경 127.5도 보정(−30분)으로 유효 경계는 벽시계 17:57이다.
const beforeIpchun = calculateNatalChart(birth('2024-02-04', '17:56'));
const exactIpchun = calculateNatalChart(birth('2024-02-04', '17:57'));
const afterIpchun = calculateNatalChart(birth('2024-02-04', '17:58'));
assert.deepEqual(beforeIpchun.pillars.slice(0, 2).map(({ text }) => text), ['癸卯', '乙丑']);
assert.deepEqual(exactIpchun.pillars.slice(0, 2).map(({ text }) => text), ['甲辰', '丙寅']);
assert.deepEqual(afterIpchun.pillars.slice(0, 2).map(({ text }) => text), ['甲辰', '丙寅']);
assert.deepEqual(exactIpchun.boundaryFlags.sensitivity.before, { yearPillar: '癸卯', monthPillar: '乙丑' });
assert.deepEqual(exactIpchun.boundaryFlags.sensitivity.after, { yearPillar: '甲辰', monthPillar: '丙寅' });
assert.match(exactIpchun.warnings.find(({ fact }) => fact === 'boundary.solar-term').body, /癸卯·월주 乙丑.*甲辰·월주 丙寅/);
assert.equal(exactIpchun.boundaryFlags.yearBoundary.sourceId, 'kasi-kasa-almanac-kst-minute');
assert.deepEqual(exactIpchun.provenance.solarTerms.calculationSources.map(({ id }) => id), ['kasi-kasa-almanac-kst-minute']);
assert.ok(exactIpchun.warnings.some(({ fact }) => fact === 'boundary.solar-term'));

// 경칩 2024 = 11:23 KST → 유효 경계는 벽시계 11:53.
const beforeJingzhe = calculateNatalChart(birth('2024-03-05', '11:52'));
const exactJingzhe = calculateNatalChart(birth('2024-03-05', '11:53'));
assert.equal(beforeJingzhe.pillars[1].text, '丙寅');
assert.equal(exactJingzhe.pillars[1].text, '丁卯');

const termKeys = ['XIAO_HAN', 'LI_CHUN', 'JING_ZHE', 'QING_MING', 'LI_XIA', 'MANG_ZHONG', 'XIAO_SHU', 'LI_QIU', 'BAI_LU', 'HAN_LU', 'LI_DONG', 'DA_XUE'];
const chartAtModernSeoulInstant = (instant) => {
  const local = new Date(instant + 9 * 60 * 60 * 1000);
  const date = `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, '0')}-${String(local.getUTCDate()).padStart(2, '0')}`;
  const time = `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`;
  return calculateNatalChart(birth(date, time));
};
for (const year of [2024, 2025, 2026, 2027]) {
  assert.equal(Object.keys(EPHEMERIS_FIXTURES[year].terms).length, 24, `${year} retains the complete authoritative 24-term fixture set`);
  for (const key of termKeys) {
    const instant = Date.parse(EPHEMERIS_FIXTURES[year].terms[key]);
    // 동경 127.5도 보정(−30분)으로 절기의 유효 경계는 epoch+30분(벽시계)이다.
    const before = chartAtModernSeoulInstant(instant - 60_000);
    const exact = chartAtModernSeoulInstant(instant + 30 * 60_000);
    const after = chartAtModernSeoulInstant(instant + 31 * 60_000);
    assert.notEqual(before.boundaryFlags.solarTerm.key, key, `${year} ${key} one minute before retains the prior term`);
    assert.equal(exact.boundaryFlags.solarTerm.key, key, `${year} ${key} solar-corrected exact minute uses the new term`);
    assert.equal(after.boundaryFlags.solarTerm.key, key, `${year} ${key} one minute past the effective boundary retains the new term`);
    assert.equal(exact.boundaryFlags.solarTerm.instant, EPHEMERIS_FIXTURES[year].terms[key]);
    assert.ok(Number.isFinite(instant));
  }
}

const at2300 = calculateNatalChart(birth('1990-10-10', '23:00'));
const at2330 = calculateNatalChart(birth('1990-10-10', '23:30'));
const midnight = calculateNatalChart(birth('1990-10-11', '00:00'));
const at0030 = calculateNatalChart(birth('1990-10-11', '00:30'));
const at0130 = calculateNatalChart(birth('1990-10-11', '01:30'));
assert.equal(at2300.pillars[2].text, '戊申');
assert.equal(at2330.pillars[2].text, '戊申');
assert.equal(at2300.pillars[3].text, '癸亥'); // 보정시계 22:30 → 亥시
assert.equal(midnight.pillars[2].text, '戊申'); // 보정시계 10일 23:30 → 일주는 아직 전날
assert.equal(midnight.pillars[3].text, '壬子');
assert.equal(at0030.pillars[2].text, '己酉'); // 보정시계 00:00 → 자정 이후 11일
assert.equal(at0030.pillars[3].text, '甲子');
assert.equal(at0130.pillars[3].text, '乙丑');
assert.ok(at2330.warnings.some(({ fact }) => fact === 'boundary.day'));
assert.ok(at0030.warnings.some(({ fact }) => fact === 'boundary.day'));

assert.equal(resolveSeoulCivilTime('1954-03-21', '00:15').offsetSeconds, 30_600);
assert.equal(resolveSeoulCivilTime('1961-08-10', '00:45').offsetSeconds, 32_400);
assert.throws(() => resolveSeoulCivilTime('1988-05-08', '02:30'), /does not exist/);
const repeated = resolveSeoulCivilTime('1988-10-09', '02:30');
assert.equal(repeated.ambiguous, true);
assert.equal(repeated.offsetSeconds, 36_000, 'repeated civil times choose the earlier instant');

assert.throws(() => calculateNatalChart(birth('2024-02-30', '12:00')), /valid Gregorian date/);
assert.throws(() => calculateNatalChart(birth('1899-12-31', '12:00')), /1900-01-01/);
assert.throws(() => calculateNatalChart(birth('2024-01-01', '24:00')), /HH:MM/);
assert.equal(Object.isFrozen(NATAL_POLICY), true);

const originalTz = process.env.TZ;
process.env.TZ = 'America/New_York';
const newYorkHost = calculateNatalChart(birth('2024-02-04', '17:27'));
process.env.TZ = 'Pacific/Honolulu';
const honoluluHost = calculateNatalChart(birth('2024-02-04', '17:27'));
process.env.TZ = originalTz;
assert.deepEqual(newYorkHost.pillars, honoluluHost.pillars, 'host timezone never changes the chart');

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`natal policy: ${assertionCount} assertions passed plus ${termKeys.length * 4} official solar-term boundaries verified at the solar-corrected effective minute (+30분 보정)`);
