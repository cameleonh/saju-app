import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Lunar, Solar } = require('lunar-javascript');
const CALENDAR_SOURCE = Object.freeze({ library: 'lunar-javascript', version: '1.7.7', license: 'MIT', range: '1900-01-01..2100-12-31' });

function assertInteger(value, label, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new Error(`${label} must be an integer from ${min} to ${max}`);
  return number;
}

export function convertLunarToSolar(input) {
  if (!input || input.calendar !== 'lunar') throw new Error('calendar must be lunar');
  const year = assertInteger(input.year, 'lunar year', 1900, 2100);
  const month = assertInteger(input.month, 'lunar month', 1, 12);
  const day = assertInteger(input.day, 'lunar day', 1, 30);
  const hour = input.unknownTime ? 12 : assertInteger(input.hour ?? 12, 'hour', 0, 23);
  const minute = input.unknownTime ? 0 : assertInteger(input.minute ?? 0, 'minute', 0, 59);
  const lunarMonth = input.leapMonth ? -month : month;
  const lunar = Lunar.fromYmdHms(year, lunarMonth, day, hour, minute, 0);
  const solar = lunar.getSolar();
  const date = `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`;
  const time = `${String(solar.getHour()).padStart(2, '0')}:${String(solar.getMinute()).padStart(2, '0')}`;
  return { calendar: 'solar', date, time, unknownTime: Boolean(input.unknownTime), source: CALENDAR_SOURCE, original: { calendar: 'lunar', year, month, day, leapMonth: Boolean(input.leapMonth), unknownTime: Boolean(input.unknownTime), hour, minute } };
}

export function describeSolarToLunar(input) {
  const [year, month, day] = String(input.date || '').split('-').map(Number);
  if (![year, month, day].every(Number.isInteger)) throw new Error('solar date must use YYYY-MM-DD');
  const solar = Solar.fromYmdHms(year, month, day, 12, 0, 0);
  const lunar = solar.getLunar();
  return { year: lunar.getYear(), month: Math.abs(lunar.getMonth()), day: lunar.getDay(), leapMonth: lunar.getMonth() < 0, source: CALENDAR_SOURCE };
}

export { CALENDAR_SOURCE };
