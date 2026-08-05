import {
  STEMS,
  BRANCHES,
  NATAL_POLICY,
} from './natal-engine.mjs';
import {
  NATAL_EPHEMERIS_START_YEAR,
  NATAL_EPHEMERIS_END_YEAR,
  NATAL_TERM_EPOCH_MINUTES,
  NATAL_TERM_KEYS,
} from './natal-ephemeris-data.mjs';

const YANG_STEMS = new Set(['甲', '丙', '戊', '庚', '壬']);

const JIE_TERMS = NATAL_TERM_KEYS;

const MONTH_INDEX_BY_TERM = {};
NATAL_TERM_KEYS.forEach((key, index) => { MONTH_INDEX_BY_TERM[key] = index; });

const POLICY = Object.freeze({
  id: 'KR-DAEWOON-1.0',
  version: '1.0.0',
  engine: 'gyeol-daewoon-core',
  engineVersion: '1.0.0',
  range: `${NATAL_EPHEMERIS_START_YEAR}..${NATAL_EPHEMERIS_END_YEAR}`,
  cycleCount: 8,
  cycleSpanYears: 10,
  dayToYearDivisor: 3,
  boundaryConvention: 'ipchun',
  directionRule: 'year-stem-yang-forward-yin-backward',
  startAgeRule: 'three-day-per-year',
  unknownTimeProxy: '12:00',
  natalPolicy: NATAL_POLICY.id,
  natalPolicyVersion: NATAL_POLICY.version,
  solarTermsUsed: Object.freeze([...JIE_TERMS]),
});

function assertInteger(value, label, min, max) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${label} must be an integer from ${min} to ${max}`);
  return n;
}

function termsForYear(year) {
  const row = NATAL_TERM_EPOCH_MINUTES[year - NATAL_EPHEMERIS_START_YEAR];
  return NATAL_TERM_KEYS.map((key, index) => ({
    year,
    key,
    epochMinute: row[index],
    monthIndex: index,
  }));
}

function surroundingTerms(year) {
  return [year - 1, year, year + 1]
    .filter((value) => value >= NATAL_EPHEMERIS_START_YEAR && value <= NATAL_EPHEMERIS_END_YEAR)
    .flatMap(termsForYear)
    .sort((left, right) => left.epochMinute - right.epochMinute);
}

function birthToEpochMinute(date, time) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const birthDate = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const seoulOffset = 9 * 60;
  const birthLocal = Date.UTC(y, m - 1, d, 0, 0) / 60_000;
  const birthEpochMinute = Math.floor(birthDate.getTime() / 60_000) - seoulOffset;
  return birthEpochMinute;
}

function findNearestJieBoundary(birthEpochMinute, birthYear, direction) {
  const terms = surroundingTerms(birthYear);
  const jieTerms = terms.filter((t) => JIE_TERMS.includes(t.key));

  if (direction === 'forward') {
    for (const term of jieTerms) {
      if (term.epochMinute > birthEpochMinute) return term;
    }
  } else {
    for (let i = jieTerms.length - 1; i >= 0; i -= 1) {
      if (jieTerms[i].epochMinute < birthEpochMinute) return jieTerms[i];
    }
  }
  throw new Error('no solar-term boundary found within the ephemeris range');
}

function dateToEpochMinute(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const seoulOffsetMs = 9 * 60 * 60 * 1000;
  return Math.floor((Date.UTC(y, m - 1, d, hh, mm) - seoulOffsetMs) / 60_000);
}

function formatSeoulDate(epochMinute) {
  const d = new Date(epochMinute * 60_000 + 9 * 60 * 60 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatStemBranch(stemIndex, branchIndex) {
  return { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex], text: `${STEMS[stemIndex]}${BRANCHES[branchIndex]}` };
}

function monthPillarIndices(monthStem, monthBranch) {
  const stemIndex = STEMS.indexOf(monthStem);
  const branchIndex = BRANCHES.indexOf(monthBranch);
  if (stemIndex < 0 || branchIndex < 0) throw new Error('invalid month pillar stem or branch');
  return { stemIndex, branchIndex };
}

function advancePillar(stemIndex, branchIndex, steps) {
  return {
    stemIndex: ((stemIndex + steps) % STEMS.length + STEMS.length) % STEMS.length,
    branchIndex: ((branchIndex + steps) % BRANCHES.length + BRANCHES.length) % BRANCHES.length,
  };
}

export function calculateDaewoon(input) {
  if (!input || typeof input !== 'object') throw new Error('daewoon input must be an object');
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('date must use YYYY-MM-DD');
  const [birthYear, birthMonth, birthDay] = input.date.split('-').map(Number);
  const dateCheck = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay));
  if (dateCheck.getUTCFullYear() !== birthYear || dateCheck.getUTCMonth() !== birthMonth - 1 || dateCheck.getUTCDate() !== birthDay) {
    throw new Error('date must be a valid calendar date');
  }
  if (birthYear < NATAL_EPHEMERIS_START_YEAR + 1 || birthYear > NATAL_EPHEMERIS_END_YEAR) {
    throw new Error(`birth year must be from ${NATAL_EPHEMERIS_START_YEAR + 1} to ${NATAL_EPHEMERIS_END_YEAR}`);
  }

  const birthTime = input.unknownTime ? POLICY.unknownTimeProxy : (input.time || '12:00');
  if (!/^\d{2}:\d{2}$/.test(birthTime)) throw new Error('time must use HH:MM');
  const [birthHour, birthMinute] = birthTime.split(':').map(Number);
  if (birthHour > 23 || birthMinute > 59) throw new Error('time must be a valid HH:MM');

  if (!input.monthStem || !STEMS.includes(input.monthStem)) throw new Error('monthStem must be one of the ten heavenly stems');
  if (!input.monthBranch || !BRANCHES.includes(input.monthBranch)) throw new Error('monthBranch must be one of the twelve earthly branches');

  const yearStem = input.yearStem;
  if (!yearStem || !STEMS.includes(yearStem)) throw new Error('yearStem must be one of the ten heavenly stems');
  const direction = YANG_STEMS.has(yearStem) ? 'forward' : 'backward';

  const lastCycleYear = birthYear + 9 + (POLICY.cycleCount - 1) * POLICY.cycleSpanYears;
  const cycleCount = lastCycleYear > NATAL_EPHEMERIS_END_YEAR
    ? Math.max(1, Math.floor((NATAL_EPHEMERIS_END_YEAR - birthYear - 9) / POLICY.cycleSpanYears) + 1)
    : POLICY.cycleCount;

  const birthEpochMinute = dateToEpochMinute(input.date, birthTime);
  const boundary = findNearestJieBoundary(birthEpochMinute, birthYear, direction);
  const diffMinutes = direction === 'forward'
    ? boundary.epochMinute - birthEpochMinute
    : birthEpochMinute - boundary.epochMinute;
  const diffDays = Math.floor(diffMinutes / (24 * 60));
  const startAge = Math.max(0, Math.floor(diffDays / POLICY.dayToYearDivisor));

  const { stemIndex, branchIndex } = monthPillarIndices(input.monthStem, input.monthBranch);
  const cycles = [];
  for (let i = 0; i < cycleCount; i += 1) {
    const step = direction === 'forward' ? i : -i;
    const pillar = advancePillar(stemIndex, branchIndex, step);
    const cycleStartAge = startAge + i * POLICY.cycleSpanYears;
    const cycleStartYear = birthYear + cycleStartAge;
    const pillarInfo = formatStemBranch(pillar.stemIndex, pillar.branchIndex);
    cycles.push({
      index: i,
      pillar: pillarInfo.text,
      stem: pillarInfo.stem,
      branch: pillarInfo.branch,
      startAge: cycleStartAge,
      startYear: cycleStartYear,
      direction,
    });
  }

  const boundaryDate = formatSeoulDate(boundary.epochMinute);

  return {
    schemaVersion: 'daewoon.v1',
    policy: {
      id: POLICY.id,
      version: POLICY.version,
      engine: POLICY.engine,
      engineVersion: POLICY.engineVersion,
      range: POLICY.range,
    },
    input: {
      date: input.date,
      time: birthTime,
      unknownTime: Boolean(input.unknownTime),
      yearStem,
      monthStem: input.monthStem,
      monthBranch: input.monthBranch,
    },
    direction,
    startAge,
    startAgeRule: POLICY.startAgeRule,
    boundaryTerm: boundary.key,
    boundaryDate,
    boundaryDirection: direction,
    cycles: Object.freeze(cycles),
    natalPolicy: { id: NATAL_POLICY.id, version: NATAL_POLICY.version },
    unsupportedStates: Object.freeze([
      { id: 'daewoon.strength', status: 'unsupported', reason: '용신/신강신약 분석은 이 정책 범위가 아닙니다.' },
      { id: 'daewoon.gyeokguk', status: 'unsupported', reason: '격국론적 해석은 이 정책 범위가 아닙니다.' },
      { id: 'daewoon.interpretation', status: 'unsupported', reason: '대운의 의미론적 해석은 술사 영역입니다.' },
    ]),
  };
}

export function verifyDaewoon(input, result) {
  const errors = [];
  if (!result || typeof result !== 'object') { errors.push('daewoon result is required'); return { valid: false, errors }; }
  if (result.schemaVersion !== 'daewoon.v1') errors.push('daewoon schemaVersion does not match');
  if (result.policy?.id !== POLICY.id) errors.push('daewoon policy.id does not match');
  if (result.policy?.version !== POLICY.version) errors.push('daewoon policy.version does not match');
  const recomputed = calculateDaewoon(input);
  if (recomputed.direction !== result.direction) errors.push('daewoon direction does not match');
  if (recomputed.startAge !== result.startAge) errors.push('daewoon startAge does not match');
  if (recomputed.startAgeRule !== result.startAgeRule) errors.push('daewoon startAgeRule does not match');
  if (recomputed.boundaryTerm !== result.boundaryTerm) errors.push('daewoon boundaryTerm does not match');
  if (recomputed.boundaryDate !== result.boundaryDate) errors.push('daewoon boundaryDate does not match');
  if (recomputed.boundaryDirection !== result.boundaryDirection) errors.push('daewoon boundaryDirection does not match');
  if (!Array.isArray(result.cycles) || result.cycles.length !== recomputed.cycles.length) {
    errors.push('daewoon cycles array is missing or incomplete');
  } else {
    for (let i = 0; i < recomputed.cycles.length; i += 1) {
      const expected = recomputed.cycles[i];
      const actual = result.cycles[i];
      if (!actual) { errors.push(`daewoon cycle ${i} is missing`); continue; }
      if (actual.pillar !== expected.pillar) errors.push(`daewoon cycle ${i} pillar does not match`);
      if (actual.stem !== expected.stem) errors.push(`daewoon cycle ${i} stem does not match`);
      if (actual.branch !== expected.branch) errors.push(`daewoon cycle ${i} branch does not match`);
      if (actual.startAge !== expected.startAge) errors.push(`daewoon cycle ${i} startAge does not match`);
      if (actual.startYear !== expected.startYear) errors.push(`daewoon cycle ${i} startYear does not match`);
      if (actual.direction !== expected.direction) errors.push(`daewoon cycle ${i} direction does not match`);
      if (actual.index !== expected.index) errors.push(`daewoon cycle ${i} index does not match`);
    }
  }
  if (result.natalPolicy?.id !== NATAL_POLICY.id) errors.push('daewoon natalPolicy.id does not match');
  return { valid: errors.length === 0, errors };
}

export const DAEWOON_POLICY = POLICY;
