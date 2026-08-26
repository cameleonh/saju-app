// tests/unit/horasat.mjs
import assert from 'node:assert/strict';
import { calculateHorasat, calculateHorasatAnnual, calculateHorasatDaily, HORASAT_POLICY, HORASAT_RASIS, HORASAT_WEEKDAYS } from '../../chart/horasat-engine.mjs';

// 1. Metadata check
assert.equal(HORASAT_POLICY.id, 'TH-HORASAT-1.0');
assert.equal(HORASAT_WEEKDAYS.length, 8, '8 weekdays (Wednesday Day / Night split)');
assert.equal(HORASAT_RASIS.length, 12, '12 Rasis');

// 2. Date 1: 1990-10-10 14:30 (Wednesday afternoon -> Day time)
const res1 = calculateHorasat({ date: '1990-10-10', time: '14:30', unknownTime: false });
assert.equal(res1.birthDay.dayIndex, 3);
assert.equal(res1.birthDay.subTime, 'day');
assert.equal(res1.birthDay.planet, '수성 (Budha)');
assert.equal(res1.birthDay.color, '초록색 (Green)');
assert.equal(res1.rasi.id, 'kanya', '10-10 is Kanya (깐 / 처녀자리)');

// 3. Annual Fortune Test
const annual1 = calculateHorasatAnnual({ date: '1990-10-10', targetYear: 2026 });
assert.equal(annual1.targetYear, 2026);
assert.ok(annual1.jupiterRasi, 'jupiter info present');
assert.ok(annual1.annualTone, 'annual tone present');
assert.ok(annual1.luckyColor, 'lucky color present');

// 3b. Years outside the verified Jupiter table return null instead of silently reusing 2026
assert.equal(calculateHorasatAnnual({ date: '1990-10-10', targetYear: 2030 }), null, 'unverified target year yields no annual reading');
assert.equal(calculateHorasatAnnual({ date: '1990-10-10', targetYear: 2023 }), null, 'year before the table yields no annual reading');

// 4. Date 2: 1990-10-10 20:00 (Wednesday night -> Rahu)
const res2 = calculateHorasat({ date: '1990-10-10', time: '20:00', unknownTime: false });
assert.equal(res2.birthDay.subTime, 'night');
assert.equal(res2.birthDay.planet, '라후 (Rahu)');

// 5. Date 3: 1988-08-08 10:00 (Monday)
const res3 = calculateHorasat({ date: '1988-08-08', time: '10:00', unknownTime: false });
assert.equal(res3.birthDay.dayIndex, 1);
assert.equal(res3.birthDay.planet, '달 (Chandra)');
assert.equal(res3.birthDay.color, '노란색 (Yellow)');
assert.equal(res3.rasi.id, 'karka', '08-08 is Karka (끄라꼿 / 게자리)');

// 5b. Sidereal boundary fixtures from the Thai Wikipedia จักรราศี table:
// Mesha starts 4/13, Mithuna ends 7/14, Karka starts 7/15, Simha starts 8/16, Meena ends 4/12.
const boundaryCases = [
  { md: '1988-04-12', rasi: 'meena', note: 'day before Mesha start' },
  { md: '1988-04-13', rasi: 'mesha', note: 'Mesha start (Songkran)' },
  { md: '1988-07-14', rasi: 'mithuna', note: 'last day of Mithuna' },
  { md: '1988-07-15', rasi: 'karka', note: 'Karka start' },
  { md: '1988-08-15', rasi: 'karka', note: 'last day of Karka' },
  { md: '1988-08-16', rasi: 'simha', note: 'Simha start' },
  { md: '1988-12-16', rasi: 'dhanu', note: 'Dhanu start' },
  { md: '1988-01-14', rasi: 'dhanu', note: 'Dhanu end (year wrap)' },
  { md: '1988-01-15', rasi: 'makara', note: 'Makara start' },
];
for (const c of boundaryCases) {
  const r = calculateHorasat({ date: c.md, time: '10:00', unknownTime: false });
  assert.equal(r.rasi.id, c.rasi, `${c.md} (${c.note}) is ${c.rasi}`);
}

// 6. Daily Fortune Test
const daily1 = calculateHorasatDaily({ date: '1990-10-10', targetDate: '2026-08-26' });
assert.ok(daily1.todayRuler, 'today ruler populated');
assert.ok(daily1.todayColor, 'today color populated');
assert.ok(daily1.todayTheme, 'today theme populated');

console.log('✓ horasat: 21 assertions passed');
