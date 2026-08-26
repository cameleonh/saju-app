// tests/unit/tu-vi.mjs
import assert from 'node:assert/strict';
import { calculateTuVi, calculateTuViAnnual, calculateTuViDaily, TU_VI_POLICY, PALACES_VN, MAJOR_STARS, CUC_TYPES } from '../../chart/tu-vi-engine.mjs';

// 1. Metadata check
assert.equal(TU_VI_POLICY.id, 'VN-TUVI-1.0');
assert.equal(PALACES_VN.length, 12, '12 Palaces (Cung)');
assert.equal(MAJOR_STARS.length, 14, '14 Major Stars (Chính Tinh)');
assert.equal(CUC_TYPES.length, 5, '5 Bureau Elements (Ngũ Cục)');

// 2. Oracle fixture: 1990-10-10 14:30 (lunar 1990-08-22, hour Mùi 8)
// Expected values cross-checked against the Vietnamese tuvi-neo@1.0.7 library
// (Mệnh at Dần, Thổ ngũ cục 5, Mệnh stars Thiên cơ + Thái âm, Thân cư Phúc đức).
const res1 = calculateTuVi({ date: '1990-10-10', time: '14:30', unknownTime: false });
assert.ok(res1.lunarDate.includes('1990'));
assert.equal(res1.lunarInput.month, 8, 'lunar month 8 (tuvi-neo)');
assert.equal(res1.lunarInput.day, 22, 'lunar day 22 (tuvi-neo)');
assert.equal(res1.menhPalace.branch.id, 'dan', 'Mệnh at Dần/寅 (tuvi-neo)');
assert.equal(res1.cuc.num, 5, 'Thổ ngũ cục = bureau 5 (tuvi-neo)');
assert.equal(res1.cuc.element, '토', 'Earth bureau element');
assert.deepEqual(res1.menhPalace.stars.map((s) => s.key).sort(), ['thai-am', 'thien-co'], 'Mệnh stars Thiên cơ + Thái âm (tuvi-neo)');
assert.equal(res1.menhPalace.primaryStar.key, 'thien-co', 'primary star Thiên cơ');
assert.ok(res1.thanPalace, 'Thân palace must be computed');
assert.equal(res1.palacesPlacement.length, 12, 'all 12 palaces placed');
assert.ok(res1.quanLoc, 'Quan Lộc palace found');
assert.ok(res1.taiBach, 'Tài Bạch palace found');
assert.equal(new Set(res1.starByBranch.flatMap((s) => s.stars)).size, 14, 'all 14 major stars placed exactly once');

// 2b. Second oracle fixture: 2000-01-01 12:00 (lunar 1999-11-25, hour Ngọ)
// tuvi-neo: Mệnh at Ngọ/午 with Tử vi, Thổ ngũ cục.
const res2 = calculateTuVi({ date: '2000-01-01', time: '12:00', unknownTime: false });
assert.equal(res2.lunarInput.year, 1999, 'lunar year 1999 (tuvi-neo)');
assert.equal(res2.menhPalace.branch.id, 'ngo', 'Mệnh at Ngọ/午 (tuvi-neo)');
assert.equal(res2.cuc.num, 5, 'Thổ ngũ cục (tuvi-neo)');
assert.ok(res2.menhPalace.stars.some((s) => s.key === 'tu-vi'), 'Tử vi sits in Mệnh (tuvi-neo)');

// 2c. Ziwei placement spot checks from the verified 安紫微星 formula
// (parity with tuvi-neo across 246 sampled charts):
// bureau 2 day 1 -> 丑, bureau 3 day 2 -> 丑, bureau 5 day 6 -> 未, bureau 5 day 25 -> 午.
const tableSpot = [
  { cuc: 2, day: 1, branch: 'suu' },
  { cuc: 3, day: 2, branch: 'suu' },
  { cuc: 5, day: 6, branch: 'mui' },
  { cuc: 5, day: 25, branch: 'ngo' },
];
for (const spot of tableSpot) {
  // find any real profile with that bureau+day via scan
  let found = null;
  outer:
  for (let year = 1950; year <= 1990 && !found; year += 1) {
    for (let m = 1; m <= 12 && !found; m += 1) {
      for (let d = 1; d <= 28 && !found; d += 1) {
        const date = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        try {
          const c = calculateTuVi({ date, time: '12:00', unknownTime: false });
          if (c.cuc.num === spot.cuc && c.lunarInput.day === spot.day) found = c;
        } catch { /* out of table range */ }
      }
    }
  }
  assert.ok(found, `fixture found for cuc ${spot.cuc} day ${spot.day}`);
  assert.equal(found.ziweiBranch.id, spot.branch, `ziwei at ${spot.branch} for cuc${spot.cuc} day${spot.day}`);
}

// 3. Annual Fortune Test
const annual1 = calculateTuViAnnual({ date: '1990-10-10', targetYear: 2026 });
assert.equal(annual1.targetYear, 2026);
assert.equal(annual1.yearBranch.branchIdx, 6, '2026 = Ngọ year');
assert.ok(annual1.activePalace, 'active palace present');
assert.ok(annual1.palaceTheme, 'palace theme present');
assert.ok(annual1.advice, 'advice present');

// 4. Daily Fortune Test
const daily1 = calculateTuViDaily({ date: '1990-10-10', targetDate: '2026-08-26' });
assert.ok(daily1.activePalace, 'daily active palace present');
assert.ok(daily1.dailyFocus, 'daily focus present');
assert.ok(daily1.advice, 'daily advice present');

// 5. Unknown time defaults to the Ngọ hour branch, matching an explicit 12:00 input
const res3 = calculateTuVi({ date: '1990-10-10', unknownTime: true });
const resNoon = calculateTuVi({ date: '1990-10-10', time: '12:00', unknownTime: false });
assert.equal(res3.menhPalace.branch.id, resNoon.menhPalace.branch.id, 'unknown time falls back to the noon hour branch');

console.log('✓ tu-vi: oracle-verified (tuvi-neo parity) assertions passed');
