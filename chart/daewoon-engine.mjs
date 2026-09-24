import {
  STEMS,
  BRANCHES,
  NATAL_POLICY,
  formatSeoulInstant,
  seoulCivilClock,
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
  version: '1.3.0',
  engine: 'gyeol-daewoon-core',
  engineVersion: '1.3.0',
  range: NATAL_POLICY.supportedSolarDates.join('..'),
  maxCycleCount: 8,
  cycleSpanYears: 10,
  dayToYearDivisor: 3,
  boundaryConvention: 'direction-dependent-jie',
  directionRule: 'yang-male-yin-female-forward (양남음녀 순행 · 음남양녀 역행; 성별 계산값 필수)',
  birthClockRule: 'Asia/Seoul legal civil time; birth and jie instants use the same UTC timeline and local wall-clock offset',
  firstCycleRule: 'first-cycle-is-month-pillar-plus-minus-one (첫 대운은 월주의 다음/이전 간지)',
  startAgeRule: 'three-day-per-year-truncated-age (대운수=3일1년 절사)',
  startYearRule: 'exact-date-conversion (1일=4개월 환산을 출생일에 가산한 해)',
  unknownTime: 'requires-exact-time',
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

  if (input.unknownTime === true || !input.time) throw new Error('exact birth time is required for daewoon calculation');
  const birthTime = input.time;
  if (!/^\d{2}:\d{2}$/.test(birthTime)) throw new Error('time must use HH:MM');
  const [birthHour, birthMinute] = birthTime.split(':').map(Number);
  if (birthHour > 23 || birthMinute > 59) throw new Error('time must be a valid HH:MM');

  if (!input.monthStem || !STEMS.includes(input.monthStem)) throw new Error('monthStem must be one of the ten heavenly stems');
  if (!input.monthBranch || !BRANCHES.includes(input.monthBranch)) throw new Error('monthBranch must be one of the twelve earthly branches');
  if (!input.yearStem || !STEMS.includes(input.yearStem)) throw new Error('yearStem must be one of the ten heavenly stems');
  if (!['male', 'female'].includes(input.sex)) throw new Error('sex must be male or female for daewoon direction');

  // Yang male / yin female go forward; yin male / yang female go backward.
  const yangYear = YANG_STEMS.has(input.yearStem);
  const male = input.sex === 'male';
  const direction = yangYear === male ? 'forward' : 'backward';

  const clock = seoulCivilClock(input.date, birthTime);
  const boundary = findNearestJieBoundary(clock.utcMinute, birthYear, direction);
  const [civilYear, civilMonth, civilDay] = clock.date.split('-').map(Number);
  const civilHour = Number(clock.time.slice(0, 2));

  // Birth and Jie must be measured on the same Asia/Seoul clock. The prior
  // implementation used UTC+8:30 for birth and UTC+8:00 for Jie, which could
  // reverse the shichen delta and produce a negative start age.
  const zhiOfHour = (h) => (h === 23 ? 11 : Math.floor((h + 1) / 2));
  const boundaryLocal = formatSeoulInstant(boundary.epochMinute);
  const [boundaryYear, boundaryMonth, boundaryDay] = boundaryLocal.slice(0, 10).split('-').map(Number);
  const boundaryHour = Number(boundaryLocal.slice(11, 13));
  const dayIndex = (year, month, day) => Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();
  const addConvertedDuration = (year, month, day, years, months, days) => {
    const absoluteMonth = year * 12 + (month - 1) + years * 12 + months;
    const targetYear = Math.floor(absoluteMonth / 12);
    const targetMonthIndex = ((absoluteMonth % 12) + 12) % 12;
    const targetDay = Math.min(day, daysInMonth(targetYear, targetMonthIndex + 1));
    return new Date(Date.UTC(targetYear, targetMonthIndex, targetDay + days));
  };
  const forward = direction === 'forward';
  const birthDayIdx = dayIndex(civilYear, civilMonth, civilDay);
  const boundaryDayIdx = dayIndex(boundaryYear, boundaryMonth, boundaryDay);
  const startZhi = forward ? zhiOfHour(civilHour) : zhiOfHour(boundaryHour);
  const endZhi = forward ? zhiOfHour(boundaryHour) : zhiOfHour(civilHour);
  const startDayIdx = forward ? birthDayIdx : boundaryDayIdx;
  const endDayIdx = forward ? boundaryDayIdx : birthDayIdx;
  let hourDiff = endZhi - startZhi;
  let dayDiff = endDayIdx - startDayIdx;
  if (hourDiff < 0) { hourDiff += 12; dayDiff -= 1; }
  const monthDiff = Math.floor((hourDiff * 10) / 30);
  const rawTotalMonths = dayDiff * 4 + monthDiff;
  const totalMonths = Math.max(0, rawTotalMonths);
  const startAge = Math.floor(totalMonths / 12);

  const convertedYears = startAge;
  const convertedMonths = totalMonths - convertedYears * 12;
  const convertedDays = rawTotalMonths < 0 ? 0 : hourDiff * 10 - monthDiff * 30;
  const startDate = addConvertedDuration(civilYear, civilMonth, civilDay, convertedYears, convertedMonths, convertedDays);
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
  if (recomputed.input?.sex !== result.input?.sex) errors.push('daewoon input.sex does not match');
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
