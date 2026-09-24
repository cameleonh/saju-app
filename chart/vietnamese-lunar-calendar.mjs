// Vietnamese lunisolar calendar conversion based on Hồ Ngọc Đức's published
// astronomical rules (105°E / UTC+7). This is intentionally separate from the
// China-standard lunar table used by the Korean-lunar input adapter.

export const VIETNAMESE_LUNAR_SOURCE = Object.freeze({
  id: 'ho-ngoc-duc-vietnamese-lunar-calendar',
  version: '2008-rules-gmt+7.1',
  kind: 'calendar-algorithm',
  timezone: 'Asia/Ho_Chi_Minh',
  meridian: '105E',
  range: '1800..2199',
});

const PI = Math.PI;
const DEG_TO_RAD = PI / 180;
const TIME_ZONE = 7;

function int(value) {
  return Math.floor(value);
}

function julianDayNumber(day, month, year) {
  const a = int((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - int(y / 100) + int(y / 400) - 32045;
  if (jd < 2299161) jd = day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - 32083;
  return jd;
}

function newMoonDay(k) {
  const t = k / 1236.85;
  const t2 = t * t;
  const t3 = t2 * t;
  const dr = DEG_TO_RAD;
  let jd = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
  jd += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);
  const m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
  const mPrime = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
  const f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
  let correction = (0.1734 - 0.000393 * t) * Math.sin(m * dr) + 0.0021 * Math.sin(2 * dr * m);
  correction -= 0.4068 * Math.sin(mPrime * dr) - 0.0161 * Math.sin(2 * dr * mPrime);
  correction -= 0.0004 * Math.sin(3 * dr * mPrime);
  correction += 0.0104 * Math.sin(2 * dr * f) - 0.0051 * Math.sin(dr * (m + mPrime));
  correction -= 0.0074 * Math.sin(dr * (m - mPrime)) - 0.0004 * Math.sin(dr * (2 * f + m));
  correction -= 0.0004 * Math.sin(dr * (2 * f - m)) + 0.0006 * Math.sin(dr * (2 * f + mPrime));
  correction += 0.0010 * Math.sin(dr * (2 * f - mPrime)) + 0.0005 * Math.sin(dr * (2 * mPrime + m));
  const deltaT = t < -11
    ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3
    : -0.000278 + 0.000265 * t + 0.000262 * t2;
  return int(jd + correction - deltaT + 0.5 + TIME_ZONE / 24);
}

function solarLongitudeSector(julianDay) {
  const t = (julianDay - 2451545.5 - TIME_ZONE / 24) / 36525;
  const t2 = t * t;
  const dr = DEG_TO_RAD;
  const meanAnomaly = 357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const meanLongitude = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
  let deltaLongitude = (1.914600 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * meanAnomaly);
  deltaLongitude += (0.019993 - 0.000101 * t) * Math.sin(dr * 2 * meanAnomaly) + 0.000290 * Math.sin(dr * 3 * meanAnomaly);
  let longitude = (meanLongitude + deltaLongitude) * dr;
  longitude -= 2 * PI * int(longitude / (2 * PI));
  return int(longitude / PI * 6);
}

function lunarMonth11(year) {
  const offset = julianDayNumber(31, 12, year) - 2415021;
  const k = int(offset / 29.530588853);
  let monthStart = newMoonDay(k);
  if (solarLongitudeSector(monthStart) >= 9) monthStart = newMoonDay(k - 1);
  return monthStart;
}

function leapMonthOffset(month11) {
  const k = int((month11 - 2415021.076998695) / 29.530588853 + 0.5);
  let previousSector = 0;
  let i = 1;
  let sector = solarLongitudeSector(newMoonDay(k + i));
  do {
    previousSector = sector;
    i += 1;
    sector = solarLongitudeSector(newMoonDay(k + i));
  } while (sector !== previousSector && i < 14);
  return i - 1;
}

function parseGregorianDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) throw new Error('solar date must use YYYY-MM-DD');
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const probe = new Date(0);
  probe.setUTCHours(0, 0, 0, 0);
  probe.setUTCFullYear(year, month - 1, day);
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    throw new Error('solar date must be a valid Gregorian date');
  }
  if (year < 1800 || year > 2199) throw new Error('Vietnamese lunar calendar supports years 1800..2199');
  return { year, month, day };
}

export function describeSolarToVietnameseLunar(input) {
  const { year, month, day } = parseGregorianDate(input?.date);
  const dayNumber = julianDayNumber(day, month, year);
  const k = int((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1);
  if (monthStart > dayNumber) monthStart = newMoonDay(k);

  let a11 = lunarMonth11(year);
  let b11 = a11;
  let lunarYear;
  if (a11 >= monthStart) {
    lunarYear = year;
    a11 = lunarMonth11(year - 1);
  } else {
    lunarYear = year + 1;
    b11 = lunarMonth11(year + 1);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = int((monthStart - a11) / 29);
  let lunarMonth = diff + 11;
  let leapMonth = false;
  if (b11 - a11 > 365) {
    const leapOffset = leapMonthOffset(a11);
    if (diff >= leapOffset) {
      lunarMonth = diff + 10;
      leapMonth = diff === leapOffset;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;

  return { year: lunarYear, month: lunarMonth, day: lunarDay, leapMonth, source: VIETNAMESE_LUNAR_SOURCE };
}
