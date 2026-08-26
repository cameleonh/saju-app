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

// 6. Tứ hóa (four transformations) — table matches the Quanshu-lineage standard, cross-verified
// against tuvi-neo 1.0.7 on 213 sampled charts (host star + palace branch, zero mismatches).
import { AUX_STARS, TU_HOA_TABLE_EXPORT as TU_HOA_TABLE } from '../../chart/tu-vi-engine.mjs';
assert.equal(AUX_STARS.length, 4, 'four tu-hoa auxiliary stars defined');
assert.equal(Object.keys(TU_HOA_TABLE).length, 10, 'tu-hoa table covers all ten year stems');
assert.equal(TU_HOA_TABLE[0].khoa, 'vu-khuc', '甲: 武曲化科');
assert.equal(TU_HOA_TABLE[1].quyen, 'thien-luong', '乙: 天梁化權 (Quanshu lineage, matches tuvi-neo)');
assert.equal(TU_HOA_TABLE[4].khoa, 'huu-bat', '戊: 右弼化科');
assert.equal(TU_HOA_TABLE[7].ky, 'van-xuong', '辛: 文昌化忌');

// Fixture: 1990-10-10 14:30 is a Canh Ngọ (庚午) year — Thái dương/Lộc, Vũ khúc/Quyền, Thái âm/Khoa, Thiên đồng/Kỵ.
const hoa = res1.tuHoa;
assert.equal(res1.yearStem.hanja, '庚', '1990 lunar year stem is Canh');
assert.equal(hoa.loc.hostKey, 'thai-duong', '庚: 太陽化祿');
assert.equal(hoa.quyen.hostKey, 'vu-khuc', '庚: 武曲化權');
assert.equal(hoa.khoa.hostKey, 'thai-am', '庚: 太陰化科');
assert.equal(hoa.ky.hostKey, 'thien-dong', '庚: 天同化忌');
// Host palaces for this chart (tuvi-neo oracle): Thái dương@Tý, Vũ khúc+Phá quân@Hợi,
// Thiên cơ+Thái âm@Dần, Thiên đồng@Tuất.
assert.equal(hoa.loc.branch.index, 0, 'hoa-loc palace branch Tý (oracle-verified)');
assert.equal(hoa.quyen.branch.index, 11, 'hoa-quyen palace branch Hợi (oracle-verified)');
assert.equal(hoa.khoa.branch.index, 2, 'hoa-khoa palace branch Dần (oracle-verified)');
assert.equal(hoa.ky.branch.index, 10, 'hoa-ky palace branch Tuất (oracle-verified)');

// Fixture: auxiliary stars for the same chart (lunar month 8, hour Mùi idx 7):
// Văn xương=(10-7)=3 Mão, Văn khúc=(4+7)=11 Hợi, Tả phù=(4+7)=11 Hợi, Hữu bật=(10-7)=3 Mão.
const auxAt = (key) => res1.auxStarsByBranch.find((a) => a.star.key === key)?.branch.index;
assert.equal(auxAt('van-xuong'), 3, 'Văn xương at Mão (hour-derived, oracle rule)');
assert.equal(auxAt('van-khuc'), 11, 'Văn khúc at Hợi (hour-derived, oracle rule)');
assert.equal(auxAt('ta-phu'), 11, 'Tả phù at Hợi (month-derived, oracle rule)');
assert.equal(auxAt('huu-bat'), 3, 'Hữu bật at Mão (month-derived, oracle rule)');

// 7. Minor stars (잡성 14종) — parity with tuvi-neo on 695 sampled charts (zero mismatches).
// Fixture values are the oracle's own output for this profile (Canh Ngọ year, month 8, hour Mùi).
import { MINOR_STARS } from '../../chart/tu-vi-engine.mjs';
assert.equal(MINOR_STARS.length, 14, 'fourteen minor stars defined');
const minorAt = (key) => res1.minorStarsByBranch.find((e) => e.star.key === key)?.branch.index;
assert.equal(minorAt('loc-ton'), 8, 'Lộc tồn at Thân (oracle-verified)');
assert.equal(minorAt('kình-duong'), 9, 'Kình dương at Dậu = Lộc tồn+1');
assert.equal(minorAt('đà-la'), 7, 'Đà la at Mùi = Lộc tồn-1');
assert.equal(minorAt('thiên-khôi'), 6, 'Thiên khôi at Ngọ (Canh stem)');
assert.equal(minorAt('thiên-việt'), 2, 'Thiên việt at Dần (Canh stem)');
assert.equal(minorAt('thiên-mã'), 8, 'Thiên mã at Thân (Ngọ trio)');
assert.equal(minorAt('hồng-loan'), 9, 'Hồng loan at Dậu = (3-yearBranch)');
assert.equal(minorAt('thiên-hỉ'), 3, 'Thiên hỉ at Mão = Hồng loan+6');
assert.equal(minorAt('địa-kiếp'), 6, 'Địa kiếp at Ngọ = Hợi+hour');
assert.equal(minorAt('địa-không'), 4, 'Địa không at Thìn = Hợi-hour');
assert.equal(minorAt('thiên-hình'), 4, 'Thiên hình at Thìn = Dậu+month');
assert.equal(minorAt('thiên-riêu'), 8, 'Thiên riêu at Thân = Sửu+month');
assert.equal(minorAt('hỏa-tinh'), 8, 'Hỏa tinh at Thân (yin-wu-xu yang branch)');
assert.equal(minorAt('linh-tinh'), 8, 'Linh tinh at Thân (yin-wu-xu yang branch)');
// menhMinorStars exposes what actually sits in the Ming palace (Dần idx 2): Thiên việt only.
assert.deepEqual(res1.menhMinorStars.map((s) => s.key), ['thiên-việt'], 'Mệnh palace minor stars (oracle-verified)');

console.log('✓ tu-vi: oracle-verified (tuvi-neo parity) assertions passed');
