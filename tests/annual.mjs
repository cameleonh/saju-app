import assert from 'node:assert/strict';
import {
  ANNUAL_POLICY,
  ANNUAL_PROFILE,
  ANNUAL_RULE_SET,
  annualYearAt,
  buildAnnualCards,
  calculateAnnualContentHash,
  createAnnualReading,
  getAnnualPillar,
  getIpchunBoundary,
  tenGodFor,
} from '../server/domain/annual.mjs';
import {
  EPHEMERIS_FIXTURES,
  EPHEMERIS_SOURCE,
  SUPPORTED_TARGET_YEARS,
  getSolarMonthRanges,
} from '../server/domain/annual-ephemeris.mjs';
import { annualSubmissionFields, buildAnnualRequest, privacySafeAnnualExport, renderAnnualReading } from '../annual/client.mjs';
import { NATAL_POLICY } from '../chart/natal-engine.mjs';

const chartPolicy = Object.freeze({
  id: NATAL_POLICY.id,
  version: NATAL_POLICY.version,
  engine: NATAL_POLICY.engine,
  engineVersion: NATAL_POLICY.engineVersion,
  source: NATAL_POLICY.source,
});
const natal = {
  dayStem: '戊',
  monthBranch: '戌',
  branches: ['子', '戌', '申', '未'],
  unknownTime: false,
};

assert.deepEqual(SUPPORTED_TARGET_YEARS, [2024, 2025, 2026]);
assert.equal(ANNUAL_POLICY.solarTermSource.id, EPHEMERIS_SOURCE.id);
assert.equal(Object.keys(EPHEMERIS_FIXTURES).length, 4, 'four fixture years close three target-year ranges');
assert.deepEqual(getAnnualPillar(1984), { stem: '甲', branch: '子', text: '甲子' });
assert.deepEqual(getAnnualPillar(2044), { stem: '甲', branch: '子', text: '甲子' });
assert.equal(getAnnualPillar(2026).text, '丙午');
assert.equal(tenGodFor('戊', '丙'), '편인');
assert.throws(() => getIpchunBoundary(2023), /2024 to 2026/);
assert.throws(() => getIpchunBoundary(2027), /2024 to 2026/);

const boundaryFixtures = [
  [2024, '2024-02-04T17:27:00+09:00', '2025-02-03T23:10:00+09:00'],
  [2025, '2025-02-03T23:10:00+09:00', '2026-02-04T05:02:00+09:00'],
  [2026, '2026-02-04T05:02:00+09:00', '2027-02-04T10:46:00+09:00'],
];
for (const [year, start, end] of boundaryFixtures) {
  assert.deepEqual(getIpchunBoundary(year), { start, end });
  const before = new Date(Date.parse(start) - 60_000).toISOString();
  const after = new Date(Date.parse(start) + 60_000).toISOString();
  assert.equal(annualYearAt(before, year), year - 1, `${year} one minute before Ipchun uses the prior annual year`);
  assert.equal(annualYearAt(start, year), year, `${year} exact Ipchun starts the annual year`);
  assert.equal(annualYearAt(after, year), year, `${year} one minute after Ipchun uses the selected year`);
  assert.equal(annualYearAt(end, year), year + 1, `${year} closing Ipchun is end-exclusive`);
}
assert.throws(() => getSolarMonthRanges(2026, { ...EPHEMERIS_FIXTURES, 2027: undefined }), /ephemeris data is unavailable/);
const ranges2026 = getSolarMonthRanges(2026);
assert.equal(ranges2026.length, 12);
assert.deepEqual(ranges2026[11], {
  monthIndex: 12,
  label: '소한 절기월',
  start: '2027-01-05T23:10:00+09:00',
  end: '2027-02-04T10:46:00+09:00',
  boundarySensitive: true,
});

for (const rule of ANNUAL_RULE_SET.rules) {
  assert.ok(rule.id && rule.version && rule.cardType);
  assert.ok(Array.isArray(rule.requiredFactIds) && rule.requiredFactIds.length > 0);
  assert.ok(Array.isArray(rule.prohibitedStates));
  assert.ok(Array.isArray(rule.conflictingStates));
  assert.ok(Number.isInteger(rule.priority));
  assert.ok(Array.isArray(rule.claimCategories) && rule.claimCategories.length > 0);
  assert.ok(rule.copyVariants && Object.keys(rule.copyVariants).length > 0);
  assert.ok(rule.safety?.onUnsupported && rule.safety?.prohibitedClaims);
}

assert.throws(() => createAnnualReading({ targetYear: 2026, natal }), /chartPolicy/);
assert.throws(() => createAnnualReading({ targetYear: 2026, natal, chartPolicy: { id: 'KR-CIVIL-1.0' } }), /version/);
const reading = createAnnualReading({ targetYear: 2026, natal, chartPolicy });
assert.equal(reading.schemaVersion, 'annual-reading.v1');
assert.equal(reading.readingScope, 'annual');
assert.equal(reading.targetYear, 2026);
assert.equal(reading.yearPillar, '丙午');
assert.deepEqual(reading.chartPolicy, chartPolicy);
assert.equal(reading.calculationPolicy.id, ANNUAL_POLICY.id);
assert.equal(reading.calculationPolicy.solarTermSource.id, EPHEMERIS_SOURCE.id);
assert.equal(reading.cards.length, 8);
assert.deepEqual(reading.cards.map(({ cardType }) => cardType), ['cover', 'overall', 'work', 'money', 'relationships', 'growth', 'action', 'method']);
assert.ok(reading.cards.every((card) => card.schemaVersion === 'annual-card.v1' && card.evidence.length >= 1 && card.evidence.length <= 3));
assert.ok(reading.cards.every((card) => card.rule?.id && card.rule?.version && card.claimTrace?.length));
assert.ok(reading.cards.every((card) => card.bullets.length <= 3 && card.keywords.length <= 3));
assert.ok(reading.cards.flatMap((card) => card.evidence).every((id) => reading.facts.some((fact) => fact.id === id)), 'every card evidence ID resolves to a fact');
assert.equal(reading.monthlyFlow.length, 12);
assert.ok(reading.monthlyFlow.every((month) => month.effectiveRange?.start && month.effectiveRange?.end));
assert.ok(reading.monthlyFlow.every((month) => month.rule?.id && month.rule?.version && month.boundarySensitive === true));
assert.ok(reading.monthlyFlow.flatMap((month) => month.evidence).every((id) => reading.facts.some((fact) => fact.id === id)), 'every monthly evidence ID resolves to a fact');
assert.ok(reading.monthlyFlow.every((month) => Object.hasOwn(month, 'unsupportedState')));
assert.equal(reading.monthlyFlow[11].effectiveRange.start, '2027-01-05T23:10:00+09:00');
assert.equal(reading.monthlyFlow[11].effectiveRange.end, '2027-02-04T10:46:00+09:00');
assert.equal(reading.cards.find(({ cardType }) => cardType === 'relationships').rule.variant, 'clash', 'clash wins when clash and harmony facts coexist');
assert.ok(reading.claimTrace.length >= reading.cards.length + reading.monthlyFlow.length);
assert.ok(reading.claimTrace.every((trace) => trace.ruleId && trace.ruleVersion && trace.factIds.every((id) => reading.facts.some((fact) => fact.id === id))));
assert.equal(reading.boundaryFlags.endExclusive, true);
assert.equal(reading.boundaryFlags.precision, 'minute');
assert.ok(reading.unsupportedStates.some(({ id }) => id === 'annual.hiddenStems.activation'));
assert.ok(ANNUAL_PROFILE.excluded.some((item) => /지장간/.test(item)));
assert.ok(reading.facts.every((item) => item.source?.id && item.source?.version && item.source?.kind));
assert.match(reading.contentHash, /^[a-f0-9]{64}$/);
assert.equal(calculateAnnualContentHash(reading), reading.contentHash);
assert.notEqual(calculateAnnualContentHash({ ...reading, ruleSet: { ...reading.ruleSet, version: '999.0.0' } }), reading.contentHash);
assert.notEqual(calculateAnnualContentHash({ ...reading, interpretationProfile: { ...reading.interpretationProfile, version: '999.0.0' } }), reading.contentHash);

const harmonyFirstRuleSet = { ...ANNUAL_RULE_SET, relationPriority: ['harmony', 'clash', 'none'] };
assert.equal(buildAnnualCards(reading.facts, 2026, ANNUAL_PROFILE, harmonyFirstRuleSet).cards.find(({ cardType }) => cardType === 'relationships').rule.variant, 'harmony', 'the declared relation priority controls conflicting facts');

const unknownTime = createAnnualReading({ targetYear: 2026, natal: { ...natal, unknownTime: true, branches: natal.branches.slice(0, 3) }, chartPolicy });
assert.equal(unknownTime.facts.find(({ id }) => id === 'annual.timeDependentRules').status, 'unsupported');
assert.ok(unknownTime.unsupportedStates.some(({ id }) => id === 'annual.natal.hour'));
assert.equal(unknownTime.cards.length, 8, 'v1 annual cards do not depend on the hour branch');

const withoutTenGod = buildAnnualCards(reading.facts.filter(({ id }) => id !== 'annual.stem.tenGodToDayMaster'), 2026);
assert.ok(withoutTenGod.cards.length > 0 && withoutTenGod.cards.length < 8, 'missing facts suppress only dependent rules');
assert.ok(withoutTenGod.suppressedRules.some(({ ruleId, missingFactIds }) => ruleId === 'annual.cover' && missingFactIds.includes('annual.stem.tenGodToDayMaster')));
assert.ok(withoutTenGod.cards.some(({ cardType }) => cardType === 'relationships'), 'independent relation card remains available');

const allCopy = JSON.stringify(reading.cards);
for (const prohibited of ['사망', '질병 확정', '이혼한다', '승진 보장', '수익 보장', '강제집행']) assert.doesNotMatch(allCopy, new RegExp(prohibited));

const chart = { input: { date: '1990-10-10', place: '서울특별시 강남구 역삼1동', unknownTime: false }, pillars: [{ branch: '子' }, { branch: '戌' }, { stem: '戊', branch: '申' }, { branch: '未' }], policy: chartPolicy };
const annualRequest = buildAnnualRequest(chart, 2026);
assert.deepEqual(annualRequest.natal, natal);
assert.deepEqual(annualRequest.chartPolicy, chartPolicy);
assert.doesNotMatch(JSON.stringify(annualRequest), /1990-10-10|역삼1동/);
assert.deepEqual(annualSubmissionFields(reading), { readingScope: 'annual', targetYear: 2026, annualResult: reading });
const safeExport = privacySafeAnnualExport(reading);
assert.deepEqual(safeExport.boundaryFlags, reading.boundaryFlags);
assert.deepEqual(safeExport.unsupportedStates, reading.unsupportedStates);
assert.deepEqual(safeExport.claimTrace, reading.claimTrace);
assert.equal(safeExport.privacy.rawBirthInputIncluded, false);
assert.doesNotMatch(JSON.stringify(safeExport), /1990-10-10|역삼1동|1168064000/);
assert.equal(safeExport.privacy.consentMetadataIncluded, false);
const annualMarkup = renderAnnualReading(reading, { activeIndex: 2, activeFact: 'annual.year.pillar' });
assert.match(annualMarkup, /3 \/ 8/);
assert.match(annualMarkup, /data-annual-card="2"[^>]*data-active="true"[^>]*tabindex="-1"[^>]*aria-current="true"/);
assert.match(annualMarkup, /문서 형태로 8장 전체 보기/);
assert.match(annualMarkup, /월별 흐름 12개 보기/);
assert.match(annualMarkup, /annual\.month\.12\.boundary/);

const assertionCount = (await import('node:fs')).default.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g)?.length || 0;
console.log(`annual policy: ${assertionCount} assertions passed`);
