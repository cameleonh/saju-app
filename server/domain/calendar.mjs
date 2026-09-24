import KoreanLunarCalendar from 'korean-lunar-calendar';

const CALENDAR_SOURCE = Object.freeze({
  policyId: 'KR-LUNAR-CONVERSION-1.0',
  policyVersion: '1.0.0',
  library: 'korean-lunar-calendar',
  version: '0.4.0',
  license: 'MIT',
  lineage: 'KASI Korean lunar-calendar standard (upstream package claim)',
  lunarRange: '1900-01-01..2050-11-18',
  solarRange: '1900-01-31..2050-12-31',
});

function assertInteger(value, label, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new Error(`${label} must be an integer from ${min} to ${max}`);
  return number;
}

export function convertLunarToSolar(input) {
  if (!input || input.calendar !== 'lunar') throw new Error('calendar must be lunar');
  const year = assertInteger(input.year, 'lunar year', 1900, 2050);
  const month = assertInteger(input.month, 'lunar month', 1, 12);
  const day = assertInteger(input.day, 'lunar day', 1, 30);
  const hour = input.unknownTime ? 12 : assertInteger(input.hour ?? 12, 'hour', 0, 23);
  const minute = input.unknownTime ? 0 : assertInteger(input.minute ?? 0, 'minute', 0, 59);
  const calendar = new KoreanLunarCalendar();
  if (!calendar.setLunarDate(year, month, day, Boolean(input.leapMonth))) {
    throw new Error(`invalid or unsupported Korean lunar date; supported lunar range is ${CALENDAR_SOURCE.lunarRange}`);
  }
  const solar = calendar.getSolarCalendar();
  const date = `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`;
  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { calendar: 'solar', date, time, unknownTime: Boolean(input.unknownTime), source: CALENDAR_SOURCE, original: { calendar: 'lunar', year, month, day, leapMonth: Boolean(input.leapMonth), unknownTime: Boolean(input.unknownTime), hour, minute } };
}

export function describeSolarToLunar(input) {
  const text = String(input?.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error('solar date must use YYYY-MM-DD');
  const [year, month, day] = text.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    throw new Error('solar date must use YYYY-MM-DD');
  }
  const [solarStart, solarEnd] = CALENDAR_SOURCE.solarRange.split('..');
  if (text < solarStart || text > solarEnd) {
    throw new Error(`solar date must be within ${CALENDAR_SOURCE.solarRange}`);
  }
  const calendar = new KoreanLunarCalendar();
  if (!calendar.setSolarDate(year, month, day)) {
    throw new Error(`solar date must be within ${CALENDAR_SOURCE.solarRange}`);
  }
  const lunar = calendar.getLunarCalendar();
  return { year: lunar.year, month: lunar.month, day: lunar.day, leapMonth: Boolean(lunar.intercalation), source: CALENDAR_SOURCE };
}

export { CALENDAR_SOURCE };
