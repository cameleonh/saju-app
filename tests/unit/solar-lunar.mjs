import assert from 'node:assert/strict';

import { describeSolarToLunar as fromLibrary } from '../../server/domain/calendar.mjs';
import { describeSolarToLunar as fromTable, LUNAR_TABLE_SOURCE } from '../../chart/solar-lunar.mjs';

function textOfDayIndex(dayIndex) {
  const d = new Date(dayIndex * 86_400_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

const start = Math.round(Date.UTC(1900, 0, 31) / 86_400_000);
const end = Math.round(Date.UTC(2050, 11, 31) / 86_400_000);
const stride = 5;

let checked = 0;
for (let dayIndex = start; dayIndex <= end; dayIndex += stride) {
  const date = textOfDayIndex(dayIndex);
  const library = fromLibrary({ date });
  const table = fromTable({ date });
  assert.equal(table.year, library.year, `${date}: lunar year matches the Korean calendar source`);
  assert.equal(table.month, library.month, `${date}: lunar month matches the Korean calendar source`);
  assert.equal(table.day, library.day, `${date}: lunar day matches the Korean calendar source`);
  assert.equal(table.leapMonth, library.leapMonth, `${date}: leap-month flag matches the Korean calendar source`);
  checked += 1;
}
assert.ok(checked > 10_000, `sampled at least 10,000 days across the full range (got ${checked})`);

// Upstream-documented anchor dates and Korean/Chinese divergence fixtures.
for (const date of ['1900-01-31', '1900-02-01', '2017-06-23', '2017-06-24', '2020-05-22', '2020-05-23', '2020-06-25', '2050-12-31']) {
  const library = fromLibrary({ date });
  const table = fromTable({ date });
  assert.deepEqual({ year: table.year, month: table.month, day: table.day, leapMonth: table.leapMonth }, { year: library.year, month: library.month, day: library.day, leapMonth: library.leapMonth }, `${date} matches exactly`);
}
assert.deepEqual({ year: 2017, month: 5, day: 1, leapMonth: true }, (() => { const r = fromTable({ date: '2017-06-24' }); return { year: r.year, month: r.month, day: r.day, leapMonth: r.leapMonth }; })(), 'Korean 2017-06-24 is leap fifth-month day 1');
assert.deepEqual({ year: 2020, month: 4, day: 30, leapMonth: false }, (() => { const r = fromTable({ date: '2020-05-22' }); return { year: r.year, month: r.month, day: r.day, leapMonth: r.leapMonth }; })(), '2020-05-22 is the last day of the regular fourth month');
assert.deepEqual({ year: 2020, month: 4, day: 1, leapMonth: true }, (() => { const r = fromTable({ date: '2020-05-23' }); return { year: r.year, month: r.month, day: r.day, leapMonth: r.leapMonth }; })(), '2020-05-23 opens the leap fourth month');

// Range and input guards mirror the server contract.
assert.throws(() => fromTable({ date: '1899-12-31' }), /within/, 'dates before the table range are rejected');
assert.throws(() => fromTable({ date: '1900-01-30' }), /within/, 'dates before the Korean lunar epoch are rejected');
assert.throws(() => fromTable({ date: '2051-01-01' }), /within/, 'dates after the documented solar range are rejected');
assert.throws(() => fromTable({ date: '1990-13-01' }), /YYYY-MM-DD/);
assert.equal(LUNAR_TABLE_SOURCE.library, 'korean-lunar-calendar');
assert.equal(LUNAR_TABLE_SOURCE.version, '0.4.0');
assert.equal(LUNAR_TABLE_SOURCE.policyId, 'KR-LUNAR-CONVERSION-1.0');
assert.equal(LUNAR_TABLE_SOURCE.policyVersion, '1.0.0');
assert.equal(LUNAR_TABLE_SOURCE.lineage, 'KASI Korean lunar-calendar standard (upstream package claim)');

const assertionCount = (await import('node:fs')).readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g)?.length || 0;
console.log(`solar-lunar unit: ${assertionCount} assertion blocks passed (${checked} sampled days)`);
