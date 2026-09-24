// tests/unit/horasat.mjs
import assert from 'node:assert/strict';
import { calculateHorasat, calculateHorasatAnnual, calculateHorasatDaily, HORASAT_POLICY, HORASAT_RASIS, HORASAT_WEEKDAYS } from '../../chart/horasat-engine.mjs';
import { HORASAT_RASI_INGRESSES } from '../../chart/horasat-rasi-data.mjs';

// 1. Metadata check
assert.equal(HORASAT_POLICY.id, 'TH-HORASAT-1.0');
assert.equal(HORASAT_POLICY.version, '1.2.0');
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
const annual1 = calculateHorasatAnnual({ date: '1990-10-10', time: '14:30', targetYear: 2026 });
assert.equal(annual1.targetYear, 2026);
assert.ok(annual1.jupiterRasi, 'jupiter info present');
assert.equal(annual1.jupiterRasi.rasiId, 'karka');
assert.ok(annual1.solarRasiHouse >= 1 && annual1.solarRasiHouse <= 12, 'Sun-rasi whole-sign offset is present');
assert.ok(annual1.unsupportedStates.some(({ id }) => id === 'horasat.annual-interpretation'));
assert.equal(annual1.annualTone, undefined, 'unverified fortune prose is not generated');

// 3b. Years outside the verified Jupiter table return null instead of silently reusing 2026.
// The table now spans 2024~2035 (astronomy-engine sidereal scan; first direct ingress of the year).
assert.equal(calculateHorasatAnnual({ date: '1990-10-10', time: '14:30', targetYear: 2030 }).jupiterRasi.rasiId, 'vrishchika', '2030 extended row: Jupiter first direct ingress Scorpio');
assert.equal(calculateHorasatAnnual({ date: '1990-10-10', time: '14:30', targetYear: 2036 }), null, 'year beyond the verified table yields no annual reading');
assert.equal(calculateHorasatAnnual({ date: '1990-10-10', time: '14:30', targetYear: 2023 }), null, 'year before the table yields no annual reading');

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

// Year-specific Lahiri ingress fixture. The old fixed April 13 table called
// 2026-04-13 Mesha, although the generated ingress is the following day.
const meshaIngress = HORASAT_RASI_INGRESSES.find(([minute, sign]) => sign === 0 && new Date(minute * 60_000).toISOString().startsWith('2026-04-'));
assert.ok(meshaIngress, '2026 Lahiri sidereal Sun ingress into Mesha is present');
const seoulInputAtUtcMinute = (minute) => {
  const local = new Date(minute * 60_000 + 9 * 60 * 60 * 1000);
  const date = `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, '0')}-${String(local.getUTCDate()).padStart(2, '0')}`;
  const time = `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`;
  return { date, time };
};
const beforeIngress = calculateHorasat({ ...seoulInputAtUtcMinute(meshaIngress[0] - 1), unknownTime: false });
const atIngress = calculateHorasat({ ...seoulInputAtUtcMinute(meshaIngress[0]), unknownTime: false });
assert.equal(beforeIngress.rasi.id, 'meena', 'one minute before a sidereal ingress remains in the previous sign');
assert.equal(atIngress.rasi.id, 'mesha', 'the exact ingress minute uses the next sign');
assert.deepEqual(
  { before: beforeIngress.boundarySensitivity.before, after: beforeIngress.boundarySensitivity.after },
  { before: 'meena', after: 'mesha' },
  'near-ingress output exposes both neighboring signs',
);
assert.equal(calculateHorasat({ date: '2026-04-13', time: '12:00' }).rasi.id, 'meena', 'a fixed Gregorian sign date cannot move the annual ingress');
assert.throws(() => calculateHorasat({ date: '2026-04-13', unknownTime: true }), /정확한 출생 시각/);
assert.throws(() => calculateHorasat({ date: '2026-02-30', time: '12:00' }), /유효한 출생일/);

// 6. Daily Fortune Test
const daily1 = calculateHorasatDaily({ date: '1990-10-10', time: '14:30', targetDate: '2026-08-26' });
assert.equal(daily1.todayRuler, null, 'Wednesday daytime/Rahu is not guessed without target time');
assert.equal(daily1.todayCandidates.length, 2);
assert.ok(daily1.unsupportedStates.some(({ id }) => id === 'horasat.daily-interpretation'));
assert.equal(daily1.todayTheme, undefined, 'unverified daily forecast prose is not generated');
const wedNight = calculateHorasatDaily({ date: '1990-10-10', time: '14:30', targetDate: '2026-08-26', targetTime: '20:00' });
assert.equal(wedNight.todayRuler, '라후 (Rahu)', 'explicit Wednesday night target time selects Rahu');
assert.ok(wedNight.todayBuddha, 'weekday Buddha marker populated with an exact target time');

console.log('✓ horasat: 21 assertions passed');
