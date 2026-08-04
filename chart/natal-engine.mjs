import {
  NATAL_EPHEMERIS_END_YEAR,
  NATAL_EPHEMERIS_START_YEAR,
  NATAL_TERM_EPOCH_MINUTES,
  NATAL_TERM_KEYS,
} from './natal-ephemeris-data.mjs';

export const STEMS = Object.freeze(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']);
export const BRANCHES = Object.freeze(['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']);
export const ELEMENTS = Object.freeze({ 甲: '목', 乙: '목', 丙: '화', 丁: '화', 戊: '토', 己: '토', 庚: '금', 辛: '금', 壬: '수', 癸: '수', 子: '수', 丑: '토', 寅: '목', 卯: '목', 辰: '토', 巳: '화', 午: '화', 未: '토', 申: '금', 酉: '금', 戌: '토', 亥: '수' });

const OFFICIAL_SOURCE = Object.freeze({
  id: 'kasi-kasa-almanac-kst-minute',
  version: '2024-2027.reviewed-2026-08-04',
  kind: 'ephemeris',
  authority: 'KASI/KASA Korean annual almanac requirements',
  supportedYears: Object.freeze([2024, 2025, 2026, 2027]),
  precision: 'minute',
});

const GENERATED_SOURCE = Object.freeze({
  id: 'shouxing-ephemeris-snapshot',
  version: 'lunar-javascript-1.7.7.generated-2026-08-04',
  kind: 'ephemeris',
  range: `${NATAL_EPHEMERIS_START_YEAR}..${NATAL_EPHEMERIS_END_YEAR}`,
  precision: 'minute',
  validation: Object.freeze({ source: OFFICIAL_SOURCE, years: '2024..2027', maximumObservedDeltaMinutes: 1 }),
});

export const NATAL_POLICY = Object.freeze({
  id: 'KR-CIVIL-1.0',
  version: '1.0.0',
  name: '한국 법정시와 분 단위 절기 경계 정책',
  source: 'KASI/KASA 검토 절기 고정값과 ShouXing 결정론적 절기 스냅샷',
  timezone: 'Asia/Seoul',
  timezoneRules: 'IANA tzdb Asia/Seoul 2026c snapshot',
  supportedSolarDates: Object.freeze(['1900-01-01', '2100-12-31']),
  yearBoundary: 'LI_CHUN',
  monthBoundaries: Object.freeze([...NATAL_TERM_KEYS]),
  dayBoundary: 'civil-midnight',
  ziHour: '23:00-00:59',
  repeatedCivilTime: 'earlier-instant',
  nonexistentCivilTime: 'reject',
  longitudeCorrection: 'none',
  solarTimeCorrection: 'none',
  unknownTime: 'suppress-hour-pillar',
  daewoon: 'unsupported',
  engine: 'gyeol-natal-core',
  engineVersion: '1.0.0',
});

const MONTH_INDEX_BY_TERM = Object.freeze({
  LI_CHUN: 0,
  JING_ZHE: 1,
  QING_MING: 2,
  LI_XIA: 3,
  MANG_ZHONG: 4,
  XIAO_SHU: 5,
  LI_QIU: 6,
  BAI_LU: 7,
  HAN_LU: 8,
  LI_DONG: 9,
  DA_XUE: 10,
  XIAO_HAN: 11,
});
const YEAR_START_STEMS = Object.freeze([2, 4, 6, 8, 0, 2, 4, 6, 8, 0]);
const HOUR_START_STEMS = Object.freeze([0, 2, 4, 6, 8, 0, 2, 4, 6, 8]);

// UTC transition instants and offsets are a compact, deterministic snapshot of
// Asia/Seoul from IANA tzdb 2026c. Birth input is interpreted as legal civil time.
const SEOUL_TRANSITIONS = Object.freeze([
  ['1908-03-31T15:32:08Z', 30_600],
  ['1911-12-31T15:30:00Z', 32_400],
  ['1948-05-31T15:00:00Z', 36_000], ['1948-09-12T14:00:00Z', 32_400],
  ['1949-04-02T15:00:00Z', 36_000], ['1949-09-10T14:00:00Z', 32_400],
  ['1950-03-31T15:00:00Z', 36_000], ['1950-09-09T14:00:00Z', 32_400],
  ['1951-05-05T15:00:00Z', 36_000], ['1951-09-08T14:00:00Z', 32_400],
  ['1954-03-20T15:00:00Z', 30_600],
  ['1955-05-04T15:30:00Z', 34_200], ['1955-09-08T14:30:00Z', 30_600],
  ['1956-05-19T15:30:00Z', 34_200], ['1956-09-29T14:30:00Z', 30_600],
  ['1957-05-04T15:30:00Z', 34_200], ['1957-09-21T14:30:00Z', 30_600],
  ['1958-05-03T15:30:00Z', 34_200], ['1958-09-20T14:30:00Z', 30_600],
  ['1959-05-02T15:30:00Z', 34_200], ['1959-09-19T14:30:00Z', 30_600],
  ['1960-04-30T15:30:00Z', 34_200], ['1960-09-17T14:30:00Z', 30_600],
  ['1961-08-09T15:30:00Z', 32_400],
  ['1987-05-09T17:00:00Z', 36_000], ['1987-10-10T17:00:00Z', 32_400],
  ['1988-05-07T17:00:00Z', 36_000], ['1988-10-08T17:00:00Z', 32_400],
].map(([instant, offsetSeconds]) => Object.freeze({ utcMs: Date.parse(instant), offsetSeconds })));
const SEOUL_OFFSETS = Object.freeze([...new Set([30_472, ...SEOUL_TRANSITIONS.map(({ offsetSeconds }) => offsetSeconds)])]);

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) throw new Error('date must use YYYY-MM-DD');
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const probe = new Date(0);
  probe.setUTCHours(0, 0, 0, 0);
  probe.setUTCFullYear(year, month - 1, day);
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) throw new Error('date must be a valid Gregorian date');
  if (value < NATAL_POLICY.supportedSolarDates[0] || value > NATAL_POLICY.supportedSolarDates[1]) throw new Error(`date must be from ${NATAL_POLICY.supportedSolarDates[0]} through ${NATAL_POLICY.supportedSolarDates[1]}`);
  return { year, month, day };
}

function parseTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || ''));
  if (!match) throw new Error('time must use HH:MM');
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) throw new Error('time must use a valid HH:MM value');
  return { hour, minute };
}

function utcPartsMs({ year, month, day }, { hour, minute }) {
  const probe = new Date(0);
  probe.setUTCHours(hour, minute, 0, 0);
  probe.setUTCFullYear(year, month - 1, day);
  return probe.getTime();
}

function seoulOffsetAt(utcMs) {
  let offsetSeconds = 30_472;
  for (const transition of SEOUL_TRANSITIONS) {
    if (utcMs < transition.utcMs) break;
    offsetSeconds = transition.offsetSeconds;
  }
  return offsetSeconds;
}

export function resolveSeoulCivilTime(date, time) {
  const dateParts = parseDate(date);
  const timeParts = parseTime(time);
  const wallMs = utcPartsMs(dateParts, timeParts);
  const candidates = SEOUL_OFFSETS
    .map((offsetSeconds) => ({ utcMs: wallMs - offsetSeconds * 1000, offsetSeconds }))
    .filter(({ utcMs, offsetSeconds }) => seoulOffsetAt(utcMs) === offsetSeconds)
    .sort((left, right) => left.utcMs - right.utcMs);
  if (!candidates.length) throw new Error('Asia/Seoul civil time does not exist because of a legal clock change');
  const selected = candidates[0];
  return {
    ...dateParts,
    ...timeParts,
    utcMs: selected.utcMs,
    utcMinute: Math.floor(selected.utcMs / 60_000),
    offsetSeconds: selected.offsetSeconds,
    ambiguous: candidates.length > 1,
    candidateCount: candidates.length,
  };
}

function termsForYear(year) {
  if (year < NATAL_EPHEMERIS_START_YEAR || year > NATAL_EPHEMERIS_END_YEAR) throw new Error(`solar-term ephemeris is unavailable for ${year}`);
  const row = NATAL_TERM_EPOCH_MINUTES[year - NATAL_EPHEMERIS_START_YEAR];
  return NATAL_TERM_KEYS.map((key, index) => ({
    year,
    key,
    epochMinute: row[index],
    monthIndex: MONTH_INDEX_BY_TERM[key],
    source: OFFICIAL_SOURCE.supportedYears.includes(year) ? OFFICIAL_SOURCE : GENERATED_SOURCE,
  }));
}

function surroundingTerms(year) {
  return [year - 1, year, year + 1]
    .filter((value) => value >= NATAL_EPHEMERIS_START_YEAR && value <= NATAL_EPHEMERIS_END_YEAR)
    .flatMap(termsForYear)
    .sort((left, right) => left.epochMinute - right.epochMinute);
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatOffset(offsetSeconds) {
  const sign = offsetSeconds < 0 ? '-' : '+';
  const absolute = Math.abs(offsetSeconds);
  return `${sign}${pad(Math.floor(absolute / 3600))}:${pad(Math.floor((absolute % 3600) / 60))}`;
}

function formatSeoulInstant(epochMinute) {
  const utcMs = epochMinute * 60_000;
  const offsetSeconds = seoulOffsetAt(utcMs);
  const local = new Date(utcMs + offsetSeconds * 1000);
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:00${formatOffset(offsetSeconds)}`;
}

function boundaryReference(term) {
  return { key: term.key, instant: formatSeoulInstant(term.epochMinute), sourceId: term.source.id, sourceVersion: term.source.version };
}

function cycleIndex(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const julianDay = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  return ((Math.floor(julianDay + 49) % 60) + 61) % 60;
}

function pillar(stemIndex, branchIndex, label, source) {
  const stem = STEMS[((stemIndex % 10) + 10) % 10];
  const branch = BRANCHES[((branchIndex % 12) + 12) % 12];
  return { label, stem, branch, text: `${stem}${branch}`, element: ELEMENTS[stem], branchElement: ELEMENTS[branch], source };
}

function unknownHourPillar() {
  return { label: '시주', stem: '?', branch: '?', text: '미상', element: null, branchElement: null, source: 'birth time unknown' };
}

function comparablePolicy(policy) {
  return policy && typeof policy === 'object' ? JSON.parse(JSON.stringify(policy)) : null;
}

function comparablePillars(pillars) {
  if (!Array.isArray(pillars)) return [];
  return pillars.map(({ label, stem, branch, text, element, branchElement, source }) => ({ label, stem, branch, text, element, branchElement, source }));
}

function calculateYearMonthPillars(calendarYear, epochMinute, terms) {
  const currentTerm = terms.filter((term) => term.epochMinute <= epochMinute).at(-1);
  const ipchun = termsForYear(calendarYear).find(({ key }) => key === 'LI_CHUN');
  if (!currentTerm || !ipchun) throw new Error('year/month solar-term boundary is unavailable for this date');
  const pillarYear = epochMinute >= ipchun.epochMinute ? calendarYear : calendarYear - 1;
  const yearCycle = ((pillarYear - 1984) % 60 + 60) % 60;
  const yearPillar = pillar(yearCycle % 10, yearCycle % 12, '년주', 'exact Ipchun boundary');
  const monthIndex = currentTerm.monthIndex;
  const monthStem = (YEAR_START_STEMS[yearCycle % 10] + monthIndex) % 10;
  const monthPillar = pillar(monthStem, monthIndex + 2, '월주', `exact ${currentTerm.key} boundary`);
  return { currentTerm, ipchun, yearPillar, monthPillar };
}

export function calculateNatalChart(input) {
  if (!input || typeof input !== 'object') throw new Error('birth input must be an object');
  if (input.calendar && input.calendar !== 'solar') throw new Error('natal calculation requires a normalized solar input');
  const dateParts = parseDate(input.date);
  const civil = resolveSeoulCivilTime(input.date, input.unknownTime ? '12:00' : input.time);
  const terms = surroundingTerms(dateParts.year);
  const yearMonth = calculateYearMonthPillars(dateParts.year, civil.utcMinute, terms);
  const { currentTerm, ipchun, yearPillar, monthPillar } = yearMonth;
  const nextTerm = terms.find(({ epochMinute }) => epochMinute > civil.utcMinute);

  const dayCycle = cycleIndex(dateParts.year, dateParts.month, dateParts.day);
  const dayPillar = pillar(dayCycle % 10, dayCycle % 12, '일주', 'Gregorian civil date at midnight');
  let hourPillar = unknownHourPillar();
  if (!input.unknownTime) {
    const hourBranch = Math.floor(((civil.hour + 1) % 24) / 2);
    const hourStem = (HOUR_START_STEMS[dayCycle % 10] + hourBranch) % 10;
    hourPillar = pillar(hourStem, hourBranch, '시주', 'two-hour civil-time interval');
  }

  const termDistances = [currentTerm, nextTerm].filter(Boolean).map((term) => ({ term, distance: Math.abs(term.epochMinute - civil.utcMinute) }));
  const nearest = termDistances.sort((left, right) => left.distance - right.distance)[0];
  const warnings = [];
  let boundarySensitivity = null;
  if (nearest?.distance <= 60) {
    const before = calculateYearMonthPillars(dateParts.year, nearest.term.epochMinute - 1, terms);
    const after = calculateYearMonthPillars(dateParts.year, nearest.term.epochMinute, terms);
    boundarySensitivity = {
      term: boundaryReference(nearest.term),
      before: { yearPillar: before.yearPillar.text, monthPillar: before.monthPillar.text },
      after: { yearPillar: after.yearPillar.text, monthPillar: after.monthPillar.text },
    };
    warnings.push({ title: '절기 경계에 가까워요', body: `${nearest.term.key} 직전에는 년주 ${boundarySensitivity.before.yearPillar}·월주 ${boundarySensitivity.before.monthPillar}, 경계부터는 년주 ${boundarySensitivity.after.yearPillar}·월주 ${boundarySensitivity.after.monthPillar}로 계산됩니다.`, fact: 'boundary.solar-term' });
  }
  if (!input.unknownTime && (civil.hour === 23 || civil.hour === 0)) warnings.push({ title: '자시와 날짜 경계에 가까워요', body: '자시는 23:00부터 00:59까지이며, 일주는 한국 민간시의 자정에 바뀌는 정책입니다.', fact: 'boundary.day' });
  if (input.unknownTime) warnings.push({ title: '출생 시각을 입력하지 않았어요', body: '시주와 시각에 의존하는 해석은 계산하지 않습니다.', fact: 'input.unknown-time' });
  if (civil.ambiguous) warnings.push({ title: '당시 시각이 두 번 존재했어요', body: '한국의 법정시 변경으로 같은 시각이 두 번 존재해 정책에 따라 먼저 발생한 시각을 사용했습니다.', fact: 'boundary.civil-time' });

  return {
    schemaVersion: 'natal-chart.v1',
    input,
    pillars: [yearPillar, monthPillar, dayPillar, hourPillar],
    policy: NATAL_POLICY,
    boundaryFlags: {
      yearTerm: 'LI_CHUN',
      yearBoundary: boundaryReference(ipchun),
      solarTerm: boundaryReference(currentTerm),
      dayBoundary: NATAL_POLICY.dayBoundary,
      ziHour: NATAL_POLICY.ziHour,
      timeKnown: !input.unknownTime,
      civilTimeAmbiguous: civil.ambiguous,
      endExclusive: true,
      precision: 'minute',
      sensitivity: boundarySensitivity,
    },
    provenance: {
      solarTerms: { calculationSources: [...new Map([ipchun.source, currentTerm.source].map((source) => [source.id, source])).values()], validationSource: OFFICIAL_SOURCE },
      civilTime: { id: 'iana-tzdb-asia-seoul', version: '2026c', offsetSeconds: civil.offsetSeconds },
    },
    unsupportedStates: [
      { id: 'natal.daewoon', reason: 'direction and start-age policy is not approved' },
      { id: 'natal.solar-time-correction', reason: 'policy uses Korean legal civil time without longitude or apparent-solar correction' },
    ],
    warnings,
  };
}

export function verifyNatalChart(input, chart) {
  try {
    const expected = calculateNatalChart(input);
    const actualPillars = comparablePillars(chart?.pillars);
    const expectedPillars = comparablePillars(expected.pillars);
    const errors = [];
    if (JSON.stringify(actualPillars) !== JSON.stringify(expectedPillars)) errors.push('chart pillars do not match the deterministic natal calculation');
    if (JSON.stringify(comparablePolicy(chart?.policy)) !== JSON.stringify(comparablePolicy(expected.policy))) errors.push('chart policy does not match the production natal policy');
    if (chart?.schemaVersion !== expected.schemaVersion) errors.push('chart schemaVersion does not match the production natal contract');
    if (JSON.stringify(chart?.boundaryFlags) !== JSON.stringify(expected.boundaryFlags)) errors.push('chart boundary flags do not match the deterministic natal calculation');
    if (JSON.stringify(chart?.provenance) !== JSON.stringify(expected.provenance)) errors.push('chart provenance does not match the deterministic natal calculation');
    if (JSON.stringify(chart?.unsupportedStates) !== JSON.stringify(expected.unsupportedStates)) errors.push('chart unsupported states do not match the production natal policy');
    return { valid: errors.length === 0, errors, expected };
  } catch (error) {
    return { valid: false, errors: [error.message], expected: null };
  }
}
