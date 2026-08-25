// tests/unit/horasat.mjs
import assert from 'node:assert/strict';
import { calculateHorasat, HORASAT_POLICY, HORASAT_RASIS, HORASAT_WEEKDAYS } from '../../chart/horasat-engine.mjs';

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

// 3. Date 2: 1990-10-10 20:00 (Wednesday night -> Rahu)
const res2 = calculateHorasat({ date: '1990-10-10', time: '20:00', unknownTime: false });
assert.equal(res2.birthDay.subTime, 'night');
assert.equal(res2.birthDay.planet, '라후 (Rahu)');

// 4. Date 3: 1988-08-08 10:00 (Monday)
const res3 = calculateHorasat({ date: '1988-08-08', time: '10:00', unknownTime: false });
assert.equal(res3.birthDay.dayIndex, 1);
assert.equal(res3.birthDay.planet, '달 (Chandra)');
assert.equal(res3.birthDay.color, '노란색 (Yellow)');
assert.equal(res3.rasi.id, 'karka', '08-08 is Karka (끄라꼿 / 게자리)');

console.log('✓ horasat: 14 assertions passed');
