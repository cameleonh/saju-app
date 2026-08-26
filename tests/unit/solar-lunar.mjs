import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { describeSolarToLunar as fromLibrary } from '../../server/domain/calendar.mjs';
import { describeSolarToLunar as fromTable, LUNAR_TABLE_SOURCE } from '../../chart/solar-lunar.mjs';

const require = createRequire(import.meta.url);
require('lunar-javascript');

function textOfDayIndex(dayIndex) {
  const d = new Date(dayIndex * 86_400_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

const start = Math.round(Date.UTC(1900, 0, 31) / 86_400_000);
const end = Math.round(Date.UTC(2100, 11, 31) / 86_400_000);
const stride = 37;

let checked = 0;
for (let dayIndex = start; dayIndex <= end; dayIndex += stride) {
  const date = textOfDayIndex(dayIndex);
  const library = fromLibrary({ date });
  const table = fromTable({ date });
  assert.equal(table.year, library.year, `${date}: lunar year matches lunar-javascript`);
  assert.equal(table.month, library.month, `${date}: lunar month matches lunar-javascript`);
  assert.equal(table.day, library.day, `${date}: lunar day matches lunar-javascript`);
  assert.equal(table.leapMonth, library.leapMonth, `${date}: leap-month flag matches lunar-javascript`);
  checked += 1;
}
assert.ok(checked > 1800, `sampled at least 1800 days across the full range (got ${checked})`);

// Anchors and known leap-month boundaries (2020 leap fourth month: 2020-05-23..2020-06-20).
for (const date of ['1900-01-31', '1900-02-01', '2020-05-22', '2020-05-23', '2020-06-25', '2100-12-31']) {
  const library = fromLibrary({ date });
  const table = fromTable({ date });
  assert.deepEqual({ year: table.year, month: table.month, day: table.day, leapMonth: table.leapMonth }, { year: library.year, month: library.month, day: library.day, leapMonth: library.leapMonth }, `${date} matches exactly`);
}
assert.deepEqual({ year: 2020, month: 4, day: 30, leapMonth: false }, (() => { const r = fromTable({ date: '2020-05-22' }); return { year: r.year, month: r.month, day: r.day, leapMonth: r.leapMonth }; })(), '2020-05-22 is the last day of the regular fourth month');
assert.deepEqual({ year: 2020, month: 4, day: 1, leapMonth: true }, (() => { const r = fromTable({ date: '2020-05-23' }); return { year: r.year, month: r.month, day: r.day, leapMonth: r.leapMonth }; })(), '2020-05-23 opens the leap fourth month');

// Range and input guards mirror the server contract.
assert.throws(() => fromTable({ date: '1899-12-31' }), /within/, 'dates before the table range are rejected');
assert.throws(() => fromTable({ date: '2101-01-29' }), /within/, 'dates after the table range are rejected');
assert.throws(() => fromTable({ date: '2101-06-01' }), /within/);
assert.throws(() => fromTable({ date: '1990-13-01' }), /YYYY-MM-DD/);
assert.equal(LUNAR_TABLE_SOURCE.library, 'lunar-javascript');
assert.equal(LUNAR_TABLE_SOURCE.version, '1.7.7');

const assertionCount = (await import('node:fs')).readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g)?.length || 0;
console.log(`solar-lunar unit: ${assertionCount} assertion blocks passed (${checked} sampled days)`);
