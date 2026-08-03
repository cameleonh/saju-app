import { createHash } from 'node:crypto';
import {
  EPHEMERIS_SOURCE,
  SUPPORTED_TARGET_YEARS,
  assertSupportedTargetYear,
  getIpchunBoundary as fixtureIpchunBoundary,
  getSolarMonthRanges,
} from './annual-ephemeris.mjs';
import {
  ANNUAL_RULE_SET,
  MONTHLY_RULE,
  TEN_GOD_GUIDANCE,
  buildAnnualCards as evaluateAnnualCards,
} from './annual-rules.mjs';

const STEMS = Object.freeze(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']);
const BRANCHES = Object.freeze(['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']);
const ELEMENTS = Object.freeze({ 甲: '목', 乙: '목', 丙: '화', 丁: '화', 戊: '토', 己: '토', 庚: '금', 辛: '금', 壬: '수', 癸: '수' });
const POLARITY = Object.freeze({ 甲: '양', 乙: '음', 丙: '양', 丁: '음', 戊: '양', 己: '음', 庚: '양', 辛: '음', 壬: '양', 癸: '음' });
const GENERATES = Object.freeze({ 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' });
const CONTROLS = Object.freeze({ 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' });
const HARMONY = new Set(['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未']);
const CLASH = new Set(['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥']);

const CALCULATION_SOURCE = Object.freeze({ kind: 'calculation', id: 'saju-annual-deterministic-engine', version: '1.1.0' });
const SEXAGENARY_SOURCE = Object.freeze({ kind: 'calculation', id: 'sexagenary-year-cycle', version: '1.0.0' });
const RULE_SOURCE = Object.freeze({ kind: 'interpretation-rule', id: ANNUAL_RULE_SET.id, version: ANNUAL_RULE_SET.version });

export const ANNUAL_POLICY = Object.freeze({
  id: 'KR-ANNUAL-IPCHUN-1.1',
  version: '1.1.0',
  timezone: 'Asia/Seoul',
  supportedYears: Object.freeze([SUPPORTED_TARGET_YEARS[0], SUPPORTED_TARGET_YEARS.at(-1)]),
  supportedTargetYears: SUPPORTED_TARGET_YEARS,
  boundary: 'ipchun-to-next-ipchun',
  endExclusive: true,
  solarTermSource: EPHEMERIS_SOURCE,
});

export const ANNUAL_PROFILE = Object.freeze({
  id: 'ziping-annual-basic',
  version: '1.1.0',
  label: '자평명리 파생 일간·월령·십신 관계',
  included: Object.freeze(['일간 기준 연간 십신', '출생 월지 맥락', '연지와 원국 지지의 충·육합']),
  excluded: Object.freeze(['격국 확정', '용신 선정', '신강·신약 점수', '조후·병약·통관', '형·파·해·특수합', '연운 지장간 활성화·가중치', '사건·건강·투자 결과 예측']),
});

export { ANNUAL_RULE_SET };

export function normalizeChartPolicy(value) {
  if (!value || typeof value !== 'object') throw new Error('chartPolicy is required');
  for (const field of ['id', 'version', 'engine', 'engineVersion']) {
    if (typeof value[field] !== 'string' || !value[field].trim()) throw new Error(`chartPolicy.${field} is required`);
  }
  return {
    id: value.id,
    version: value.version,
    engine: value.engine,
    engineVersion: value.engineVersion,
    ...(typeof value.source === 'string' && value.source ? { source: value.source } : {}),
  };
}

export function getIpchunBoundary(targetYear) {
  return fixtureIpchunBoundary(targetYear);
}

export function getAnnualPillar(targetYear) {
  const year = Number(targetYear);
  if (!Number.isInteger(year) || year < 1 || year > 9999) throw new Error('targetYear must be an integer from 1 to 9999');
  const cycle = ((year - 1984) % 60 + 60) % 60;
  return { stem: STEMS[cycle % 10], branch: BRANCHES[cycle % 12], text: `${STEMS[cycle % 10]}${BRANCHES[cycle % 12]}` };
}

export function tenGodFor(dayStem, annualStem) {
  if (!POLARITY[dayStem] || !POLARITY[annualStem]) return null;
  const dayElement = ELEMENTS[dayStem];
  const annualElement = ELEMENTS[annualStem];
  const samePolarity = POLARITY[dayStem] === POLARITY[annualStem];
  if (dayElement === annualElement) return samePolarity ? '비견' : '겁재';
  if (GENERATES[dayElement] === annualElement) return samePolarity ? '식신' : '상관';
  if (CONTROLS[dayElement] === annualElement) return samePolarity ? '편재' : '정재';
  if (CONTROLS[annualElement] === dayElement) return samePolarity ? '편관' : '정관';
  if (GENERATES[annualElement] === dayElement) return samePolarity ? '편인' : '정인';
  return null;
}

function relationBetween(left, right) {
  const pair = `${left}${right}`;
  const reverse = `${right}${left}`;
  if (CLASH.has(pair) || CLASH.has(reverse)) return 'clash';
  if (HARMONY.has(pair) || HARMONY.has(reverse)) return 'harmony';
  return 'none';
}

function buildBranchRelations(annualBranch, natalBranches) {
  return natalBranches
    .map((branch, index) => ({
      natalPosition: ['year', 'month', 'day', 'hour'][index] || `branch-${index}`,
      natalBranch: branch,
      annualBranch,
      relation: relationBetween(annualBranch, branch),
    }))
    .filter(({ relation }) => relation !== 'none');
}

function fact(id, label, value, detail, status, source) {
  return { id, label, value, detail, status, source };
}

function relationText(relations) {
  if (!relations.length) return 'v1에서 지원하는 충·육합 관계 없음';
  return relations.map(({ natalPosition, natalBranch, relation }) => `${natalPosition}:${natalBranch} ${relation === 'clash' ? '충' : '육합'}`).join(' · ');
}

function buildAnnualFacts({ targetYear, pillar, boundary, dayStem, monthBranch, natalBranches, unknownTime, chartPolicy }) {
  const tenGod = tenGodFor(dayStem, pillar.stem);
  if (!tenGod) throw new Error('natal.dayStem must be one of the ten heavenly stems');
  const relations = buildBranchRelations(pillar.branch, natalBranches);
  const chartSource = { kind: 'chart-policy', id: chartPolicy.id, version: chartPolicy.version, engine: chartPolicy.engine, engineVersion: chartPolicy.engineVersion };
  return [
    fact('annual.year.pillar', '연운 간지', pillar.text, `${targetYear}년 입춘부터 적용되는 연운 간지입니다.`, 'calculated', SEXAGENARY_SOURCE),
    fact('annual.year.stem', '연간', pillar.stem, `${pillar.text}의 천간은 ${pillar.stem}입니다.`, 'calculated', SEXAGENARY_SOURCE),
    fact('annual.year.branch', '연지', pillar.branch, `${pillar.text}의 지지는 ${pillar.branch}입니다.`, 'calculated', SEXAGENARY_SOURCE),
    fact('annual.stem.tenGodToDayMaster', '연간의 십신', tenGod, `일간 ${dayStem}을 기준으로 연간 ${pillar.stem}은 ${tenGod} 관계입니다.`, 'interpretive', RULE_SOURCE),
    fact('annual.branch.relationsToNatal', '연지와 원국의 관계', relations, relationText(relations), relations.length ? 'interpretive' : 'limited', RULE_SOURCE),
    fact('annual.monthCommand.context', '태어난 달의 맥락', monthBranch, `출생 월지 ${monthBranch}는 원국의 계절 맥락으로만 함께 봅니다. 강약이나 용신 점수로 바꾸지 않습니다.`, 'interpretive', chartSource),
    fact('annual.boundary.ipchun', '입춘 적용 범위', boundary, `${boundary.start}부터 ${boundary.end} 직전까지 적용합니다.`, 'calculated', EPHEMERIS_SOURCE),
    fact('annual.timeDependentRules', '시각 의존 규칙', unknownTime ? 'suppressed' : 'not-used-in-v1', unknownTime ? '출생 시각이 없어 시각 의존 규칙은 억제합니다.' : 'v1 연운 카드는 출생 시각 의존 규칙을 사용하지 않습니다.', unknownTime ? 'unsupported' : 'limited', RULE_SOURCE),
    fact('annual.hiddenStems.activation', '연운 지장간 활성화', 'excluded', '원국 지장간은 표시하지만 연운 활성화나 가중치에는 사용하지 않습니다.', 'unsupported', RULE_SOURCE),
    fact('annual.policy', '연운 정책', `${ANNUAL_POLICY.id}@${ANNUAL_POLICY.version}`, '입춘부터 다음 입춘 직전까지를 한 연운으로 봅니다.', 'calculated', CALCULATION_SOURCE),
  ];
}

function monthPillar(yearStemIndex, monthIndex) {
  const startStemByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const branchIndex = (2 + monthIndex) % 12;
  const stemIndex = (startStemByYearStem[yearStemIndex] + monthIndex) % 10;
  return { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex], text: `${STEMS[stemIndex]}${BRANCHES[branchIndex]}` };
}

function monthlyFactIds(monthIndex) {
  const prefix = `annual.month.${String(monthIndex).padStart(2, '0')}`;
  return { pillar: `${prefix}.pillar`, boundary: `${prefix}.boundary`, tenGod: `${prefix}.tenGodToDayMaster`, relations: `${prefix}.relationsToNatal` };
}

function buildMonthlyFactsAndFlow(targetYear, annualPillar, natal) {
  const facts = [];
  const monthlyFlow = [];
  const claimTrace = [];
  for (const range of getSolarMonthRanges(targetYear)) {
    const ids = monthlyFactIds(range.monthIndex);
    const pillar = monthPillar(STEMS.indexOf(annualPillar.stem), range.monthIndex - 1);
    const tenGod = tenGodFor(natal.dayStem, pillar.stem);
    const relations = buildBranchRelations(pillar.branch, natal.branches);
    const guidance = TEN_GOD_GUIDANCE[tenGod];
    const effectiveRange = { start: range.start, end: range.end };
    facts.push(
      fact(ids.pillar, `${range.label} 간지`, pillar.text, `${range.label}의 월주는 ${pillar.text}입니다.`, 'calculated', SEXAGENARY_SOURCE),
      fact(ids.boundary, `${range.label} 적용 범위`, effectiveRange, `${range.start}부터 ${range.end} 직전까지 적용합니다.`, 'calculated', EPHEMERIS_SOURCE),
      fact(ids.tenGod, `${range.label} 월간의 십신`, tenGod, `일간 ${natal.dayStem}을 기준으로 월간 ${pillar.stem}은 ${tenGod} 관계입니다.`, guidance ? 'interpretive' : 'unsupported', RULE_SOURCE),
      fact(ids.relations, `${range.label} 월지 관계`, relations, relationText(relations), relations.length ? 'interpretive' : 'limited', RULE_SOURCE),
    );
    const evidence = [ids.pillar, ids.boundary, ids.tenGod, ids.relations];
    const traces = MONTHLY_RULE.claimCategories.map((category) => ({
      claimId: `annual.month.${String(range.monthIndex).padStart(2, '0')}.${category}`,
      cardType: 'monthly-flow',
      category,
      ruleId: MONTHLY_RULE.id,
      ruleVersion: MONTHLY_RULE.version,
      factIds: evidence,
    }));
    claimTrace.push(...traces);
    monthlyFlow.push({
      monthIndex: range.monthIndex,
      label: range.label,
      pillar: pillar.text,
      effectiveRange,
      theme: guidance?.theme || '지원하지 않는 십신 관계',
      use: guidance?.action || '지원 규칙을 확인해 주세요.',
      watch: guidance?.watch || '지원되지 않는 해석은 만들지 않습니다.',
      evidence,
      relations,
      status: guidance ? 'interpretive' : 'unsupported',
      boundarySensitive: range.boundarySensitive,
      unsupportedState: guidance ? null : { id: 'annual.month.tenGod', reason: 'unsupported-ten-god' },
      rule: { id: MONTHLY_RULE.id, version: MONTHLY_RULE.version, ruleSetVersion: ANNUAL_RULE_SET.version },
      claimTrace: traces,
    });
  }
  return { facts, monthlyFlow, claimTrace };
}

export function buildAnnualCards(facts, targetYear, profile = ANNUAL_PROFILE, ruleSet = ANNUAL_RULE_SET) {
  return evaluateAnnualCards(facts, targetYear, profile, ruleSet);
}

function stableHash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function calculateAnnualContentHash(value) {
  if (!value || typeof value !== 'object') throw new Error('annual reading must be an object');
  const { contentHash: _contentHash, ...content } = value;
  return stableHash(content);
}

export function createAnnualReading(input) {
  if (!input || typeof input !== 'object') throw new Error('annual input must be an object');
  const targetYear = assertSupportedTargetYear(input.targetYear);
  const chartPolicy = normalizeChartPolicy(input.chartPolicy);
  const natal = input.natal || {};
  const dayStem = natal.dayStem;
  const monthBranch = natal.monthBranch;
  const branches = Array.isArray(natal.branches) ? natal.branches.filter((item) => BRANCHES.includes(item)) : [];
  if (!STEMS.includes(dayStem)) throw new Error('natal.dayStem must be one of the ten heavenly stems');
  if (!BRANCHES.includes(monthBranch)) throw new Error('natal.monthBranch must be one of the twelve earthly branches');
  if (branches.length < 3 || branches.length > 4) throw new Error('natal.branches must contain three or four earthly branches');
  const pillar = getAnnualPillar(targetYear);
  const boundary = getIpchunBoundary(targetYear);
  const annualFacts = buildAnnualFacts({ targetYear, pillar, boundary, dayStem, monthBranch, natalBranches: branches, unknownTime: Boolean(natal.unknownTime), chartPolicy });
  const monthly = buildMonthlyFactsAndFlow(targetYear, pillar, { dayStem, branches });
  const facts = [...annualFacts, ...monthly.facts];
  const evaluated = buildAnnualCards(facts, targetYear);
  const unsupportedStates = [
    { id: 'annual.hiddenStems.activation', status: 'unsupported', reason: 'Annual hidden-stem activation and weighting are excluded from v1.' },
    ...(natal.unknownTime ? [{ id: 'annual.natal.hour', status: 'unsupported', reason: 'Natal hour is unknown; time-dependent rules are suppressed.' }] : []),
  ];
  const result = {
    schemaVersion: 'annual-reading.v1',
    readingScope: 'annual',
    targetYear,
    yearPillar: pillar.text,
    effectiveRange: boundary,
    timezone: ANNUAL_POLICY.timezone,
    boundaryFlags: {
      basis: 'ipchun',
      endExclusive: true,
      boundarySensitive: true,
      precision: EPHEMERIS_SOURCE.precision,
      sourceId: EPHEMERIS_SOURCE.id,
      sourceVersion: EPHEMERIS_SOURCE.version,
    },
    calculationPolicy: ANNUAL_POLICY,
    chartPolicy,
    interpretationProfile: ANNUAL_PROFILE,
    ruleSet: {
      id: ANNUAL_RULE_SET.id,
      version: ANNUAL_RULE_SET.version,
      relationPriority: ANNUAL_RULE_SET.relationPriority,
      suppression: ANNUAL_RULE_SET.suppression,
      monthlyRule: { id: MONTHLY_RULE.id, version: MONTHLY_RULE.version },
    },
    facts,
    cards: evaluated.cards,
    monthlyFlow: monthly.monthlyFlow,
    suppressedRules: evaluated.suppressedRules,
    unsupportedStates,
    claimTrace: [...evaluated.claimTrace, ...monthly.claimTrace],
  };
  return { ...result, contentHash: stableHash(result) };
}

export function annualYearAt(instant, targetYear) {
  const boundary = getIpchunBoundary(targetYear);
  const value = Date.parse(instant);
  if (!Number.isFinite(value)) throw new Error('instant must be an ISO date-time');
  if (value < Date.parse(boundary.start)) return Number(targetYear) - 1;
  if (value >= Date.parse(boundary.end)) return Number(targetYear) + 1;
  return Number(targetYear);
}
