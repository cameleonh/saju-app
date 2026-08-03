const REQUIRED_MONTH_TERMS = Object.freeze([
  ['LI_CHUN', '입춘'],
  ['JING_ZHE', '경칩'],
  ['QING_MING', '청명'],
  ['LI_XIA', '입하'],
  ['MANG_ZHONG', '망종'],
  ['XIAO_SHU', '소서'],
  ['LI_QIU', '입추'],
  ['BAI_LU', '백로'],
  ['HAN_LU', '한로'],
  ['LI_DONG', '입동'],
  ['DA_XUE', '대설'],
]);

export const EPHEMERIS_SOURCE = Object.freeze({
  id: 'kasi-kasa-almanac-kst-minute',
  version: '2024-2027.reviewed-2026-08-04',
  kind: 'ephemeris',
  authority: 'Korean annual almanac requirements published by KASI/KASA',
  timezone: 'Asia/Seoul',
  precision: 'minute',
  references: Object.freeze([
    'https://www.kasi.re.kr/kor/post/newsMaterial/32031',
    'https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431',
    'https://astro.kasi.re.kr/life/post/almanac',
    'https://astro.kasi.re.kr/life/post/calendardata',
  ]),
});

const fixture = (year, terms) => Object.freeze({
  year,
  sourceId: EPHEMERIS_SOURCE.id,
  sourceVersion: EPHEMERIS_SOURCE.version,
  observedAt: '2026-08-04',
  terms: Object.freeze(terms),
});

export const EPHEMERIS_FIXTURES = Object.freeze({
  2024: fixture(2024, {
    XIAO_HAN: '2024-01-06T05:49:00+09:00', DA_HAN: '2024-01-20T23:07:00+09:00',
    LI_CHUN: '2024-02-04T17:27:00+09:00', YU_SHUI: '2024-02-19T13:13:00+09:00',
    JING_ZHE: '2024-03-05T11:23:00+09:00', CHUN_FEN: '2024-03-20T12:06:00+09:00',
    QING_MING: '2024-04-04T16:02:00+09:00', GU_YU: '2024-04-19T23:00:00+09:00',
    LI_XIA: '2024-05-05T09:10:00+09:00', XIAO_MAN: '2024-05-20T22:00:00+09:00',
    MANG_ZHONG: '2024-06-05T13:10:00+09:00', XIA_ZHI: '2024-06-21T05:51:00+09:00',
    XIAO_SHU: '2024-07-06T23:20:00+09:00', DA_SHU: '2024-07-22T16:44:00+09:00',
    LI_QIU: '2024-08-07T09:09:00+09:00', CHU_SHU: '2024-08-22T23:55:00+09:00',
    BAI_LU: '2024-09-07T12:11:00+09:00', QIU_FEN: '2024-09-22T21:44:00+09:00',
    HAN_LU: '2024-10-08T04:00:00+09:00', SHUANG_JIANG: '2024-10-23T07:15:00+09:00',
    LI_DONG: '2024-11-07T07:20:00+09:00', XIAO_XUE: '2024-11-22T04:56:00+09:00',
    DA_XUE: '2024-12-07T00:17:00+09:00', DONG_ZHI: '2024-12-21T18:21:00+09:00',
  }),
  2025: fixture(2025, {
    XIAO_HAN: '2025-01-05T11:33:00+09:00', DA_HAN: '2025-01-20T05:00:00+09:00',
    LI_CHUN: '2025-02-03T23:10:00+09:00', YU_SHUI: '2025-02-18T19:07:00+09:00',
    JING_ZHE: '2025-03-05T17:07:00+09:00', CHUN_FEN: '2025-03-20T18:01:00+09:00',
    QING_MING: '2025-04-04T21:49:00+09:00', GU_YU: '2025-04-20T04:56:00+09:00',
    LI_XIA: '2025-05-05T14:57:00+09:00', XIAO_MAN: '2025-05-21T03:55:00+09:00',
    MANG_ZHONG: '2025-06-05T18:57:00+09:00', XIA_ZHI: '2025-06-21T11:42:00+09:00',
    XIAO_SHU: '2025-07-07T05:05:00+09:00', DA_SHU: '2025-07-22T22:29:00+09:00',
    LI_QIU: '2025-08-07T14:52:00+09:00', CHU_SHU: '2025-08-23T05:34:00+09:00',
    BAI_LU: '2025-09-07T17:52:00+09:00', QIU_FEN: '2025-09-23T03:19:00+09:00',
    HAN_LU: '2025-10-08T09:41:00+09:00', SHUANG_JIANG: '2025-10-23T12:51:00+09:00',
    LI_DONG: '2025-11-07T13:04:00+09:00', XIAO_XUE: '2025-11-22T10:36:00+09:00',
    DA_XUE: '2025-12-07T06:05:00+09:00', DONG_ZHI: '2025-12-22T00:03:00+09:00',
  }),
  2026: fixture(2026, {
    XIAO_HAN: '2026-01-05T17:23:00+09:00', DA_HAN: '2026-01-20T10:45:00+09:00',
    LI_CHUN: '2026-02-04T05:02:00+09:00', YU_SHUI: '2026-02-19T00:52:00+09:00',
    JING_ZHE: '2026-03-05T22:59:00+09:00', CHUN_FEN: '2026-03-20T23:46:00+09:00',
    QING_MING: '2026-04-05T03:40:00+09:00', GU_YU: '2026-04-20T10:39:00+09:00',
    LI_XIA: '2026-05-05T20:49:00+09:00', XIAO_MAN: '2026-05-21T09:37:00+09:00',
    MANG_ZHONG: '2026-06-06T00:48:00+09:00', XIA_ZHI: '2026-06-21T17:25:00+09:00',
    XIAO_SHU: '2026-07-07T10:57:00+09:00', DA_SHU: '2026-07-23T04:13:00+09:00',
    LI_QIU: '2026-08-07T20:43:00+09:00', CHU_SHU: '2026-08-23T11:19:00+09:00',
    BAI_LU: '2026-09-07T23:41:00+09:00', QIU_FEN: '2026-09-23T09:05:00+09:00',
    HAN_LU: '2026-10-08T15:29:00+09:00', SHUANG_JIANG: '2026-10-23T18:38:00+09:00',
    LI_DONG: '2026-11-07T18:52:00+09:00', XIAO_XUE: '2026-11-22T16:23:00+09:00',
    DA_XUE: '2026-12-07T11:53:00+09:00', DONG_ZHI: '2026-12-22T05:50:00+09:00',
  }),
  2027: fixture(2027, {
    XIAO_HAN: '2027-01-05T23:10:00+09:00', DA_HAN: '2027-01-20T16:30:00+09:00',
    LI_CHUN: '2027-02-04T10:46:00+09:00', YU_SHUI: '2027-02-19T06:33:00+09:00',
    JING_ZHE: '2027-03-06T04:40:00+09:00', CHUN_FEN: '2027-03-21T05:25:00+09:00',
    QING_MING: '2027-04-05T09:17:00+09:00', GU_YU: '2027-04-20T16:18:00+09:00',
    LI_XIA: '2027-05-06T02:25:00+09:00', XIAO_MAN: '2027-05-21T15:18:00+09:00',
    MANG_ZHONG: '2027-06-06T06:26:00+09:00', XIA_ZHI: '2027-06-21T23:11:00+09:00',
    XIAO_SHU: '2027-07-07T16:37:00+09:00', DA_SHU: '2027-07-23T10:05:00+09:00',
    LI_QIU: '2027-08-08T02:27:00+09:00', CHU_SHU: '2027-08-23T17:14:00+09:00',
    BAI_LU: '2027-09-08T05:28:00+09:00', QIU_FEN: '2027-09-23T15:02:00+09:00',
    HAN_LU: '2027-10-08T21:17:00+09:00', SHUANG_JIANG: '2027-10-24T00:33:00+09:00',
    LI_DONG: '2027-11-08T00:39:00+09:00', XIAO_XUE: '2027-11-22T22:16:00+09:00',
    DA_XUE: '2027-12-07T17:38:00+09:00', DONG_ZHI: '2027-12-22T11:42:00+09:00',
  }),
});

function hasCompleteRange(year, fixtures) {
  const current = fixtures[year]?.terms;
  const next = fixtures[year + 1]?.terms;
  return Boolean(current?.LI_CHUN
    && REQUIRED_MONTH_TERMS.every(([key]) => current[key])
    && next?.XIAO_HAN
    && next?.LI_CHUN);
}

export function deriveSupportedTargetYears(fixtures = EPHEMERIS_FIXTURES) {
  return Object.keys(fixtures)
    .map(Number)
    .filter((year) => hasCompleteRange(year, fixtures))
    .sort((left, right) => left - right);
}

export const SUPPORTED_TARGET_YEARS = Object.freeze(deriveSupportedTargetYears());

export function assertSupportedTargetYear(value) {
  const year = Number(value);
  const first = SUPPORTED_TARGET_YEARS[0];
  const last = SUPPORTED_TARGET_YEARS.at(-1);
  if (!Number.isInteger(year) || !SUPPORTED_TARGET_YEARS.includes(year)) {
    throw new Error(`targetYear must be an integer from ${first} to ${last}`);
  }
  return year;
}

function requireTerm(fixtures, year, key) {
  const value = fixtures[year]?.terms?.[key];
  if (!value) throw new Error(`ephemeris data is unavailable for ${year} ${key}`);
  return value;
}

export function getIpchunBoundary(targetYear, fixtures = EPHEMERIS_FIXTURES) {
  const year = assertSupportedTargetYear(targetYear);
  return {
    start: requireTerm(fixtures, year, 'LI_CHUN'),
    end: requireTerm(fixtures, year + 1, 'LI_CHUN'),
  };
}

export function getSolarMonthRanges(targetYear, fixtures = EPHEMERIS_FIXTURES) {
  const year = assertSupportedTargetYear(targetYear);
  const starts = [
    ...REQUIRED_MONTH_TERMS.map(([key, label]) => ({ year, key, label })),
    { year: year + 1, key: 'XIAO_HAN', label: '소한' },
  ];
  return starts.map((current, index) => {
    const next = starts[index + 1] || { year: year + 1, key: 'LI_CHUN' };
    return {
      monthIndex: index + 1,
      label: `${current.label} 절기월`,
      start: requireTerm(fixtures, current.year, current.key),
      end: requireTerm(fixtures, next.year, next.key),
      boundarySensitive: true,
    };
  });
}
