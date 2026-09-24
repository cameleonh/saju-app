import assert from 'node:assert/strict';
import fs from 'node:fs';
import { convertLunarToSolar, describeSolarToLunar, CALENDAR_SOURCE } from '../../server/domain/calendar.mjs';

assert.deepEqual(
  CALENDAR_SOURCE,
  Object.freeze({
    policyId: 'KR-LUNAR-CONVERSION-1.0',
    policyVersion: '1.0.0',
    library: 'korean-lunar-calendar',
    version: '0.4.0',
    license: 'MIT',
    lineage: 'KASI Korean lunar-calendar standard (upstream package claim)',
    lunarRange: '1900-01-01..2050-11-18',
    solarRange: '1900-01-31..2050-12-31',
  }),
);
assert.equal(Object.isFrozen(CALENDAR_SOURCE), true);

const canonical = convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 1, day: 1, leapMonth: false, hour: 14, minute: 30 });
assert.equal(canonical.date, '2024-02-10');
assert.equal(canonical.time, '14:30');
assert.equal(canonical.calendar, 'solar');
assert.equal(canonical.unknownTime, false);
assert.equal(canonical.source.library, 'korean-lunar-calendar');
assert.deepEqual(canonical.original, { calendar: 'lunar', year: 2024, month: 1, day: 1, leapMonth: false, unknownTime: false, hour: 14, minute: 30 });

// KASI-lineage Korean dates can diverge from Chinese-standard lunar dates.
const koreanDivergence = convertLunarToSolar({ calendar: 'lunar', year: 2017, month: 5, day: 1, leapMonth: true });
assert.equal(koreanDivergence.date, '2017-06-24', 'Korean lunar 2017 leap fifth-month day 1 is June 24');
assert.deepEqual(
  (({ year, month, day, leapMonth }) => ({ year, month, day, leapMonth }))(describeSolarToLunar({ date: '2017-06-24' })),
  { year: 2017, month: 5, day: 1, leapMonth: true },
  'solar-to-lunar conversion uses the Korean leap fifth month, not the Chinese sixth month',
);

const unknownTime = convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 1, day: 1, unknownTime: true });
assert.equal(unknownTime.time, '12:00', 'unknown time canonicalises to midday');
assert.equal(unknownTime.unknownTime, true);
assert.equal(unknownTime.original.unknownTime, true);

const leapMonth = convertLunarToSolar({ calendar: 'lunar', year: 2020, month: 4, day: 1, leapMonth: true, hour: 9, minute: 0 });
assert.equal(leapMonth.date, '2020-05-23');
assert.equal(leapMonth.time, '09:00');
assert.equal(leapMonth.original.leapMonth, true);

const defaultHourMinute = convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 6, day: 15 });
assert.equal(defaultHourMinute.time, '12:00', 'omitting hour and minute defaults to midday');
assert.equal(defaultHourMinute.original.hour, 12);
assert.equal(defaultHourMinute.original.minute, 0);

assert.throws(() => convertLunarToSolar({ calendar: 'solar', year: 2024, month: 1, day: 1 }), /calendar must be lunar/);
assert.throws(() => convertLunarToSolar(null), /calendar must be lunar/);
assert.throws(() => convertLunarToSolar({ calendar: 'lunar' }), /lunar year must be an integer/);

for (const invalidYear of [1899, 2051, 2024.5, null]) {
  assert.throws(() => convertLunarToSolar({ calendar: 'lunar', year: invalidYear, month: 1, day: 1 }), /lunar year/, `year ${invalidYear} is rejected`);
}
const numericStringYear = convertLunarToSolar({ calendar: 'lunar', year: '2024', month: 1, day: 1 });
assert.equal(numericStringYear.original.year, 2024, 'numeric strings are coerced by assertInteger');
for (const invalidMonth of [0, 13, 1.5]) {
  assert.throws(() => convertLunarToSolar({ calendar: 'lunar', year: 2024, month: invalidMonth, day: 1 }), /lunar month/, `month ${invalidMonth} is rejected`);
}
for (const invalidDay of [0, 31, 15.5]) {
  assert.throws(() => convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 1, day: invalidDay }), /lunar day/, `day ${invalidDay} is rejected`);
}
for (const invalidHour of [-1, 24, 12.5]) {
  assert.throws(() => convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 1, day: 1, hour: invalidHour }), /hour/, `hour ${invalidHour} is rejected`);
}
for (const invalidMinute of [-1, 60, 30.5]) {
  assert.throws(() => convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 1, day: 1, minute: invalidMinute }), /minute/, `minute ${invalidMinute} is rejected`);
}

assert.throws(
  () => convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 1, day: 30 }),
  /invalid or unsupported Korean lunar date/,
  'a day beyond the actual Korean lunar month length is rejected instead of rolling forward',
);
assert.throws(
  () => convertLunarToSolar({ calendar: 'lunar', year: 2017, month: 3, day: 1, leapMonth: true }),
  /invalid or unsupported Korean lunar date/,
  'a leap-month flag for a year/month without a Korean leap month is rejected',
);
assert.throws(
  () => convertLunarToSolar({ calendar: 'lunar', year: 2050, month: 11, day: 19 }),
  /2050-11-18/,
  'the last supported Korean lunar date is enforced',
);
assert.equal(convertLunarToSolar({ calendar: 'lunar', year: 2050, month: 11, day: 18 }).date, '2050-12-31');
assert.equal(convertLunarToSolar({ calendar: 'lunar', year: 1900, month: 1, day: 1 }).date, '1900-01-31');

const roundTrip = describeSolarToLunar({ date: '2024-02-10' });
assert.equal(roundTrip.year, 2024);
assert.equal(roundTrip.month, 1);
assert.equal(roundTrip.day, 1);
assert.equal(roundTrip.leapMonth, false);
assert.equal(roundTrip.source.library, 'korean-lunar-calendar');

const leapRoundTrip = describeSolarToLunar({ date: '2020-05-01' });
assert.equal(typeof leapRoundTrip.year, 'number');
assert.equal(typeof leapRoundTrip.month, 'number');
assert.equal(typeof leapRoundTrip.leapMonth, 'boolean');

assert.throws(() => describeSolarToLunar({}), /solar date must use YYYY-MM-DD/);
assert.throws(() => describeSolarToLunar({ date: 'not-a-date' }), /solar date must use YYYY-MM-DD/);
assert.throws(() => describeSolarToLunar({ date: '2024-13-01' }), /solar date must use YYYY-MM-DD/);
assert.throws(() => describeSolarToLunar({ date: '1900-01-30' }), /1900-01-31..2050-12-31/);
assert.throws(() => describeSolarToLunar({ date: '2051-01-01' }), /1900-01-31..2050-12-31/);

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`calendar unit: ${assertionCount} assertions passed`);
