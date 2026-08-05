import assert from 'node:assert/strict';
import fs from 'node:fs';
import { convertLunarToSolar, describeSolarToLunar, CALENDAR_SOURCE } from '../../server/domain/calendar.mjs';

assert.deepEqual(
  CALENDAR_SOURCE,
  Object.freeze({
    library: 'lunar-javascript',
    version: '1.7.7',
    license: 'MIT',
    range: '1900-01-01..2100-12-31',
  }),
);
assert.equal(Object.isFrozen(CALENDAR_SOURCE), true);

const canonical = convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 1, day: 1, leapMonth: false, hour: 14, minute: 30 });
assert.equal(canonical.date, '2024-02-10');
assert.equal(canonical.time, '14:30');
assert.equal(canonical.calendar, 'solar');
assert.equal(canonical.unknownTime, false);
assert.equal(canonical.source.library, 'lunar-javascript');
assert.deepEqual(canonical.original, { calendar: 'lunar', year: 2024, month: 1, day: 1, leapMonth: false, unknownTime: false, hour: 14, minute: 30 });

const unknownTime = convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 1, day: 1, unknownTime: true });
assert.equal(unknownTime.time, '12:00', 'unknown time canonicalises to midday');
assert.equal(unknownTime.unknownTime, true);
assert.equal(unknownTime.original.unknownTime, true);

const leapMonth = convertLunarToSolar({ calendar: 'lunar', year: 2020, month: 4, day: 1, leapMonth: true, hour: 9, minute: 0 });
assert.equal(typeof leapMonth.date, 'string');
assert.match(leapMonth.date, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(leapMonth.original.leapMonth, true);

const defaultHourMinute = convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 6, day: 15 });
assert.equal(defaultHourMinute.time, '12:00', 'omitting hour and minute defaults to midday');
assert.equal(defaultHourMinute.original.hour, 12);
assert.equal(defaultHourMinute.original.minute, 0);

assert.throws(() => convertLunarToSolar({ calendar: 'solar', year: 2024, month: 1, day: 1 }), /calendar must be lunar/);
assert.throws(() => convertLunarToSolar(null), /calendar must be lunar/);
assert.throws(() => convertLunarToSolar({ calendar: 'lunar' }), /lunar year must be an integer/);

for (const invalidYear of [1899, 2101, 2024.5, null]) {
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

const rollOver = convertLunarToSolar({ calendar: 'lunar', year: 2024, month: 2, day: 30, hour: 12, minute: 0 });
assert.match(rollOver.date, /^\d{4}-\d{2}-\d{2}$/, 'lunar-javascript normalises out-of-range lunar days by rolling into the next month');

const roundTrip = describeSolarToLunar({ date: '2024-02-10' });
assert.equal(roundTrip.year, 2024);
assert.equal(roundTrip.month, 1);
assert.equal(roundTrip.day, 1);
assert.equal(roundTrip.leapMonth, false);
assert.equal(roundTrip.source.library, 'lunar-javascript');

const leapRoundTrip = describeSolarToLunar({ date: '2020-05-01' });
assert.equal(typeof leapRoundTrip.year, 'number');
assert.equal(typeof leapRoundTrip.month, 'number');
assert.equal(typeof leapRoundTrip.leapMonth, 'boolean');

assert.throws(() => describeSolarToLunar({}), /solar date must use YYYY-MM-DD/);
assert.throws(() => describeSolarToLunar({ date: 'not-a-date' }), /solar date must use YYYY-MM-DD/);
assert.throws(() => describeSolarToLunar({ date: '2024-13-01' }), /wrong month/, 'describeSolarToLunar accepts the YYYY-MM-DD shape and lets lunar-javascript reject the actual invalid month');

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`calendar unit: ${assertionCount} assertions passed`);
