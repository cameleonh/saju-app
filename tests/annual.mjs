import assert from 'node:assert/strict';
import {
  ANNUAL_POLICY,
  annualYearAt,
  buildAnnualCards,
  calculateAnnualContentHash,
  createAnnualReading,
  getAnnualPillar,
  getIpchunBoundary,
  tenGodFor,
} from '../server/domain/annual.mjs';
import { annualSubmissionFields, buildAnnualRequest, privacySafeAnnualExport, renderAnnualReading } from '../annual/client.mjs';

const natal = {
  dayStem: '戊',
  monthBranch: '戌',
  branches: ['午', '戌', '申', '未'],
  unknownTime: false,
};

assert.deepEqual(getAnnualPillar(1984), { stem: '甲', branch: '子', text: '甲子' });
assert.deepEqual(getAnnualPillar(2044), { stem: '甲', branch: '子', text: '甲子' });
assert.equal(getAnnualPillar(2026).text, '丙午');
assert.equal(tenGodFor('戊', '丙'), '편인');
assert.throws(() => getAnnualPillar(2100), /targetYear/);

const boundary2024 = getIpchunBoundary(2024);
assert.equal(boundary2024.start, '2024-02-04T17:27:07+09:00');
assert.equal(annualYearAt('2024-02-04T17:26:07+09:00', 2024), 2023, 'one minute before Ipchun uses the prior annual year');
assert.equal(annualYearAt('2024-02-04T17:27:07+09:00', 2024), 2024, 'the exact Ipchun instant starts the annual year');
assert.equal(annualYearAt('2024-02-04T17:28:07+09:00', 2024), 2024, 'one minute after Ipchun uses the selected annual year');

const reading = createAnnualReading({ targetYear: 2026, natal, chartPolicy: { id: 'KR-CIVIL-0.1', engine: 'saju-demo-engine 0.1.0' } });
assert.equal(reading.schemaVersion, 'annual-reading.v1');
assert.equal(reading.readingScope, 'annual');
assert.equal(reading.targetYear, 2026);
assert.equal(reading.yearPillar, '丙午');
assert.equal(reading.calculationPolicy.id, ANNUAL_POLICY.id);
assert.equal(reading.cards.length, 8);
assert.deepEqual(reading.cards.map(({ cardType }) => cardType), ['cover', 'overall', 'work', 'money', 'relationships', 'growth', 'action', 'method']);
assert.ok(reading.cards.every((card) => card.schemaVersion === 'annual-card.v1' && card.evidence.length >= 1 && card.evidence.length <= 3));
assert.ok(reading.cards.every((card) => card.bullets.length <= 3 && card.keywords.length <= 3));
assert.ok(reading.cards.flatMap((card) => card.evidence).every((id) => reading.facts.some((fact) => fact.id === id)), 'every evidence ID resolves to an annual fact');
assert.equal(reading.monthlyFlow.length, 12);
assert.ok(reading.monthlyFlow.every((month) => month.effectiveRange?.start && month.effectiveRange?.end && month.evidence?.length));
assert.match(reading.contentHash, /^[a-f0-9]{64}$/);
assert.equal(calculateAnnualContentHash(reading), reading.contentHash);
assert.notEqual(calculateAnnualContentHash({ ...reading, targetYear: 2025 }), reading.contentHash);
assert.notEqual(reading.contentHash, createAnnualReading({ targetYear: 2027, natal, chartPolicy: { id: 'KR-CIVIL-0.1' } }).contentHash);

const unknownTime = createAnnualReading({ targetYear: 2026, natal: { ...natal, unknownTime: true, branches: natal.branches.slice(0, 3) } });
assert.equal(unknownTime.facts.find(({ id }) => id === 'annual.timeDependentRules').status, 'unsupported');
assert.equal(unknownTime.facts.find(({ id }) => id === 'annual.timeDependentRules').value, 'suppressed');
assert.equal(unknownTime.cards.length, 8, 'v1 annual cards do not depend on the hour branch');

const suppressed = buildAnnualCards(reading.facts.filter(({ id }) => id !== 'annual.stem.tenGodToDayMaster'), 2026);
assert.equal(suppressed.length, 0, 'missing required facts suppress dependent cards');

const allCopy = JSON.stringify(reading.cards);
for (const prohibited of ['사망', '질병 확정', '이혼한다', '승진 보장', '수익 보장', '강제집행']) assert.doesNotMatch(allCopy, new RegExp(prohibited));
assert.ok(reading.interpretationProfile.excluded.includes('격국 확정'));
assert.ok(reading.interpretationProfile.excluded.includes('용신 선정'));

const chart = { input: { date: '1990-10-10', place: '서울특별시 강남구 역삼1동', unknownTime: false }, pillars: [{ branch: '午' }, { branch: '戌' }, { stem: '戊', branch: '申' }, { branch: '未' }], policy: { id: 'KR-CIVIL-0.1' } };
const annualRequest = buildAnnualRequest(chart, 2026);
assert.deepEqual(annualRequest.natal, natal);
assert.doesNotMatch(JSON.stringify(annualRequest), /1990-10-10|역삼1동/);
assert.deepEqual(annualSubmissionFields(reading), { readingScope: 'annual', targetYear: 2026, annualResult: reading });
const safeExport = privacySafeAnnualExport(reading);
assert.equal(safeExport.privacy.rawBirthInputIncluded, false);
assert.doesNotMatch(JSON.stringify(safeExport), /1990-10-10|역삼1동|1168064000/);
assert.equal(safeExport.privacy.consentMetadataIncluded, false);
const annualMarkup = renderAnnualReading(reading, { activeIndex: 2, activeFact: 'annual.year.pillar' });
assert.match(annualMarkup, /3 \/ 8/);
assert.match(annualMarkup, /문서 형태로 8장 전체 보기/);
assert.match(annualMarkup, /월별 흐름 12개 보기/);
assert.match(annualMarkup, /annual\.year\.pillar/);

const assertionCount = (await import('node:fs')).default.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g)?.length || 0;
console.log(`annual policy: ${assertionCount} assertions passed`);
