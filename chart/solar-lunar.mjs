// Browser-safe solar-to-lunar conversion over the pre-generated lunar-javascript table.
// Server code keeps the authoritative library in server/domain/calendar.mjs; this module
// exists so browser module graphs never pull Node builtins. Parity is asserted by
// tests/unit/solar-lunar.mjs.

import { LUNAR_EPOCH_DAY_INDEX, LUNAR_LAST_DAY_INDEX, LUNAR_TABLE, LUNAR_TABLE_SOURCE } from './lunar-calendar-data.mjs';

let cumulative = null;
function cumulativeTable() {
  if (cumulative) return cumulative;
  let dayIndex = LUNAR_EPOCH_DAY_INDEX;
  cumulative = [];
  for (const [year, months] of LUNAR_TABLE) {
    for (const [month, days] of months) {
      cumulative.push({ start: dayIndex, year, month, days });
      dayIndex += days;
    }
  }
  return cumulative;
}

export function describeSolarToLunar(input) {
  const text = String(input?.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error('solar date must use YYYY-MM-DD');
  const [year, month, day] = text.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) throw new Error('solar date must use YYYY-MM-DD');
  const dayIndex = Math.round(Date.UTC(year, month - 1, day) / 86_400_000);
  if (dayIndex < LUNAR_EPOCH_DAY_INDEX || dayIndex > LUNAR_LAST_DAY_INDEX) {
    throw new Error(`solar date must be within ${LUNAR_TABLE_SOURCE.range}`);
  }
  const rows = cumulativeTable();
  let low = 0;
  let high = rows.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (rows[mid].start <= dayIndex) low = mid; else high = mid - 1;
  }
  const row = rows[low];
  return { year: row.year, month: Math.abs(row.month), day: dayIndex - row.start + 1, leapMonth: row.month < 0, source: LUNAR_TABLE_SOURCE };
}

export { LUNAR_TABLE_SOURCE };
