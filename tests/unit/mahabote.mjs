// tests/unit/mahabote.mjs
import assert from 'node:assert/strict';
import { calculateMahabote, calculateMahaboteAnnual, calculateMahaboteDaily, MAHABOTE_DAYS, MAHABOTE_HOUSES, MAHABOTE_POLICY } from '../../chart/mahabote-engine.mjs';

// 1. Metadata and Policy checks
assert.equal(MAHABOTE_POLICY.id, 'MM-MAHABOTE-1.0');
assert.equal(MAHABOTE_DAYS.length, 8, '8 weekdays (including Wednesday PM Rahu)');
assert.equal(MAHABOTE_HOUSES.length, 7, '7 houses');

// 2. Calculation Tests for specific dates
// Date 1: 1990-10-10 (Wednesday) 14:30 -> Wednesday PM (Rahu)
const res1 = calculateMahabote({ date: '1990-10-10', time: '14:30', unknownTime: false });
assert.equal(res1.burmeseYear, 1352, '1990 - 638 = 1352');
assert.equal(res1.akar, 1352 % 7, '1352 % 7 = 1');
assert.equal(res1.birthDay.id, 'wed_pm', '14:30 on Wednesday is Rahu');
assert.equal(res1.birthDay.animal, '엄니 없는 코끼리 (Tuskless Elephant)');
assert.ok(res1.rulingHouse, 'ruling house must be resolved');
assert.equal(res1.housePlacements.length, 7, 'all 7 houses are mapped');

// 3. Annual Fortune Test
const annual1 = calculateMahaboteAnnual({ date: '1990-10-10', targetYear: 2026 });
assert.equal(annual1.targetYear, 2026);
assert.equal(annual1.age, 36);
assert.ok(annual1.yearlyHouse, 'annual house is populated');
assert.ok(annual1.yearlyTheme, 'annual theme is populated');
assert.ok(annual1.yearlyAdvice, 'annual advice is populated');

// Date 2: 1990-10-10 (Wednesday) 09:00 -> Wednesday AM (Boddahu)
const res2 = calculateMahabote({ date: '1990-10-10', time: '09:00', unknownTime: false });
assert.equal(res2.birthDay.id, 'wed_am', '09:00 on Wednesday is Boddahu');
assert.equal(res2.birthDay.animal, '엄니 있는 코끼리 (Tusked Elephant)');

// Date 3: 1992-02-14 (Friday) -> Before Thingyan (Feb < April)
const res3 = calculateMahabote({ date: '1992-02-14', time: '09:00', unknownTime: false });
assert.equal(res3.burmeseYear, 1992 - 639, 'Feb 1992 is in Burmese Era 1353 (before new year)');
assert.equal(res3.birthDay.id, 'fri', '1992-02-14 is Friday');
assert.equal(res3.birthDay.animal, '기니피그 (Guinea Pig)');
assert.equal(res3.birthDay.planet, '금성 (Venus)');

// 4. Daily Fortune Test
const daily1 = calculateMahaboteDaily({ date: '1990-10-10', targetDate: '2026-08-26' });
assert.ok(daily1.todayDay, 'today day resolved');
assert.ok(daily1.dailyTheme, 'daily theme populated');
assert.ok(daily1.dailyAdvice, 'daily advice populated');

// Date 4: 1988-08-08 (Monday)
const res4 = calculateMahabote({ date: '1988-08-08', time: '12:00', unknownTime: false });
assert.equal(res4.birthDay.id, 'mon', '1988-08-08 is Monday');
assert.equal(res4.birthDay.animal, '호랑이 (Tiger)');
assert.equal(res4.birthDay.planet, '달 (Moon)');

console.log('✓ mahabote: 24 assertions passed');
