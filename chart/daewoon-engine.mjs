import {
  STEMS,
  BRANCHES,
  NATAL_POLICY,
  formatSeoulInstant,
  resolveSeoulCivilTime,
} from './natal-engine.mjs';
import {
  NATAL_EPHEMERIS_START_YEAR,
  NATAL_EPHEMERIS_END_YEAR,
  NATAL_EPHEMERIS_NEXT_XIAO_HAN_EPOCH_MINUTE,
  NATAL_TERM_EPOCH_MINUTES,
  NATAL_TERM_KEYS,
} from './natal-ephemeris-data.mjs';

const YANG_STEMS = new Set(['甲', '丙', '戊', '庚', '壬']);
const JIE_TERMS = NATAL_TERM_KEYS;

const POLICY = Object.freeze({
  id: 'KR-DAEWOON-1.0',
  version: '1.1.0',
  engine: 'gyeol-daewoon-core',
  engineVersion: '1.1.0',
  range: NATAL_POLICY.supportedSolarDates.join('..'),
  maxCycleCount: 8,
  cycleSpanYears: 10,
  dayToYearDivisor: 3,
  boundaryConvention: 'direction-dependent-jie',
  directionRule: 'yang-male-yin-female-forward (양남음녀 순행 · 음남양녀 역행; 미선택 시 남성 기준)',
  firstCycleRule: 'first-cycle-is-month-pillar-plus-minus-one (첫 대운은 월주의 다음/이전 간지)',
  startAgeRule: 'three-day-per-year-truncated-age (대운수=3일1년 절사)',
  startYearRule: 'exact-date-conversion (1일=4개월 환산을 출생일에 가산한 해)',
  unknownTimeProxy: '12:00',
  natalPolicy: NATAL_POLICY.id,
  natalPolicyVersion: NATAL_POLICY.version,
  solarTermsUsed: Object.freeze([...JIE_TERMS]),
});

function termsForYear(year) {
  const row = NATAL_TERM_EPOCH_MINUTES[year - NATAL_EPHEMERIS_START_YEAR];
  return NATAL_TERM_KEYS.map((key, index) => ({ year, key, epochMinute: row[index], monthIndex: index }));
}

function surroundingTerms(year) {
  const terms = [year - 1, year, year + 1]
    .filter((value) => value >= NATAL_EPHEMERIS_START_YEAR && value <= NATAL_EPHEMERIS_END_YEAR)
    .flatMap(termsForYear)
  if (year === NATAL_EPHEMERIS_END_YEAR) {
    terms.push({
      year: NATAL_EPHEMERIS_END_YEAR + 1,
      key: 'XIAO_HAN',
      epochMinute: NATAL_EPHEMERIS_NEXT_XIAO_HAN_EPOCH_MINUTE,
      monthIndex: 0,
    });
  }
  return terms.sort((left, right) => left.epochMinute - right.epochMinute);
}

function findNearestJieBoundary(birthEpochMinute, birthYear, direction) {
  const terms = surroundingTerms(birthYear).filter((t) => JIE_TERMS.includes(t.key));
  if (direction === 'forward') {
    for (const term of terms) { if (term.epochMinute > birthEpochMinute) return term; }
  } else {
    for (let i = terms.length - 1; i >= 0; i -= 1) { if (terms[i].epochMinute < birthEpochMinute) return terms[i]; }
  }
  throw new Error('no solar-term boundary found within the ephemeris range');
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
  if (!input.yearStem || !STEMS.includes(input.yearStem)) throw new Error('yearStem must be one of the ten heavenly stems');

  // 정통 방향 규칙: 양남·음녀 순행, 음남·양녀 역행. 성별 미선택(unset) 시 남성 기준으로 계산한다.
  const yangYear = YANG_STEMS.has(input.yearStem);
  const male = input.sex !== 'female';
  const direction = yangYear === male ? 'forward' : 'backward';

  const birthEpochMinute = resolveSeoulCivilTime(input.date, birthTime).utcMinute;
  const boundary = findNearestJieBoundary(birthEpochMinute, birthYear, direction);
  const diffMinutes = direction === 'forward'
    ? boundary.epochMinute - birthEpochMinute
    : birthEpochMinute - boundary.epochMinute;
  const diffDays = diffMinutes / (24 * 60);
  const startAge = Math.max(0, Math.floor(diffDays / POLICY.dayToYearDivisor));

  // 시작 연도는 정통 환산(3일=1년, 1일=4개월)으로 출생일에 가산한 실제 날짜의 연도를 쓴다.
  const convertedYears = Math.floor(diffDays / POLICY.dayToYearDivisor);
  const convertedMonths = Math.floor((diffDays - convertedYears * POLICY.dayToYearDivisor) * 4);
  const startDate = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay));
  startDate.setUTCFullYear(startDate.getUTCFullYear() + convertedYears);
  startDate.setUTCMonth(startDate.getUTCMonth() + convertedMonths);
  const startYearExact = startDate.getUTCFullYear();

  // Determine cycle count AFTER startAge is known, so truncation is accurate
  const lastCycleEndYear = startYearExact + (POLICY.maxCycleCount - 1) * POLICY.cycleSpanYears;
  const cycleCount = lastCycleEndYear > NATAL_EPHEMERIS_END_YEAR
    ? Math.max(1, Math.floor((NATAL_EPHEMERIS_END_YEAR - startYearExact) / POLICY.cycleSpanYears) + 1)
    : POLICY.maxCycleCount;

  const { stemIndex, branchIndex } = monthPillarIndices(input.monthStem, input.monthBranch);
  const cycles = [];
  for (let i = 0; i < cycleCount; i += 1) {
    // 첫 대운은 월주 자체가 아니라 진행 방향으로 한 칸 이동한 간지부터 시작한다.
    const offset = i + 1;
    const step = direction === 'forward' ? offset : -offset;
    const pillar = advancePillar(stemIndex, branchIndex, step);
    const cycleStartYear = startYearExact + i * POLICY.cycleSpanYears;
    cycles.push({
      index: i,
      pillar: `${STEMS[pillar.stemIndex]}${BRANCHES[pillar.branchIndex]}`,
      stem: STEMS[pillar.stemIndex],
      branch: BRANCHES[pillar.branchIndex],
      startAge: startAge + i * POLICY.cycleSpanYears,
      startYear: cycleStartYear,
      direction,
    });
  }

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
      sex: input.sex || 'unset',
      yearStem: input.yearStem,
      monthStem: input.monthStem,
      monthBranch: input.monthBranch,
    },
    direction,
    startAge,
    startAgeRule: POLICY.startAgeRule,
    boundaryTerm: boundary.key,
    boundaryDate: formatSeoulInstant(boundary.epochMinute).slice(0, 10),
    boundaryDirection: direction,
    cycleCount,
    maxCycleCount: POLICY.maxCycleCount,
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
  if (result.policy?.engine !== POLICY.engine) errors.push('daewoon policy.engine does not match');
  if (result.policy?.engineVersion !== POLICY.engineVersion) errors.push('daewoon policy.engineVersion does not match');
  if (result.policy?.range !== POLICY.range) errors.push('daewoon policy.range does not match');
  if (result.natalPolicy?.id !== NATAL_POLICY.id) errors.push('daewoon natalPolicy.id does not match');
  if (result.natalPolicy?.version !== NATAL_POLICY.version) errors.push('daewoon natalPolicy.version does not match');

  const recomputed = calculateDaewoon(input);

  if (recomputed.direction !== result.direction) errors.push('daewoon direction does not match');
  if (recomputed.startAge !== result.startAge) errors.push('daewoon startAge does not match');
  if (recomputed.startAgeRule !== result.startAgeRule) errors.push('daewoon startAgeRule does not match');
  if (recomputed.boundaryTerm !== result.boundaryTerm) errors.push('daewoon boundaryTerm does not match');
  if (recomputed.boundaryDate !== result.boundaryDate) errors.push('daewoon boundaryDate does not match');
  if (recomputed.boundaryDirection !== result.boundaryDirection) errors.push('daewoon boundaryDirection does not match');
  if (recomputed.cycleCount !== result.cycleCount) errors.push('daewoon cycleCount does not match');
  if (recomputed.maxCycleCount !== result.maxCycleCount) errors.push('daewoon maxCycleCount does not match');

  if (recomputed.input?.date !== result.input?.date) errors.push('daewoon input.date does not match');
  if (recomputed.input?.time !== result.input?.time) errors.push('daewoon input.time does not match');
  if (recomputed.input?.unknownTime !== result.input?.unknownTime) errors.push('daewoon input.unknownTime does not match');
  if (recomputed.input?.yearStem !== result.input?.yearStem) errors.push('daewoon input.yearStem does not match');
  if (recomputed.input?.monthStem !== result.input?.monthStem) errors.push('daewoon input.monthStem does not match');
  if (recomputed.input?.monthBranch !== result.input?.monthBranch) errors.push('daewoon input.monthBranch does not match');

  if (!Array.isArray(result.cycles) || result.cycles.length !== recomputed.cycles.length) {
    errors.push('daewoon cycles array is missing or incomplete');
  } else {
    for (let i = 0; i < recomputed.cycles.length; i += 1) {
      const expected = recomputed.cycles[i];
      const actual = result.cycles[i];
      if (!actual) { errors.push(`daewoon cycle ${i} is missing`); continue; }
      for (const field of ['index', 'pillar', 'stem', 'branch', 'startAge', 'startYear', 'direction']) {
        if (actual[field] !== expected[field]) errors.push(`daewoon cycle ${i} ${field} does not match`);
      }
    }
  }

  if (!Array.isArray(result.unsupportedStates) || result.unsupportedStates.length !== recomputed.unsupportedStates.length) {
    errors.push('daewoon unsupportedStates does not match');
  } else {
    for (let i = 0; i < recomputed.unsupportedStates.length; i += 1) {
      if (result.unsupportedStates[i]?.id !== recomputed.unsupportedStates[i].id) errors.push(`daewoon unsupportedStates[${i}].id does not match`);
      if (result.unsupportedStates[i]?.status !== recomputed.unsupportedStates[i].status) errors.push(`daewoon unsupportedStates[${i}].status does not match`);
      if (result.unsupportedStates[i]?.reason !== recomputed.unsupportedStates[i].reason) errors.push(`daewoon unsupportedStates[${i}].reason does not match`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export const DAEWOON_POLICY = POLICY;
