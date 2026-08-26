// tests/unit/tu-vi.mjs
import assert from 'node:assert/strict';
import { calculateTuVi, calculateTuViAnnual, TU_VI_POLICY, PALACES_VN, MAJOR_STARS, CUC_TYPES } from '../../chart/tu-vi-engine.mjs';

// 1. Metadata check
assert.equal(TU_VI_POLICY.id, 'VN-TUVI-1.0');
assert.equal(PALACES_VN.length, 12, '12 Palaces (Cung)');
assert.equal(MAJOR_STARS.length, 14, '14 Major Stars (Chính Tinh)');
assert.equal(CUC_TYPES.length, 5, '5 Bureau Elements (Ngũ Cục)');

// 2. Date 1: 1990-10-10 14:30 (음력 1990년 8월 22일, 미시 Mùi)
const res1 = calculateTuVi({ date: '1990-10-10', time: '14:30', unknownTime: false });
assert.ok(res1.lunarDate.includes('1990'));
assert.ok(res1.menhPalace, 'Mệnh palace must be computed');
assert.ok(res1.thanPalace, 'Thân palace must be computed');
assert.ok(res1.cuc, 'Cục must be determined');
assert.ok(res1.menhPalace.primaryStar, 'Primary star in Mệnh must exist');
assert.equal(res1.palacesPlacement.length, 12, 'all 12 palaces placed');
assert.ok(res1.quanLoc, 'Quan Lộc palace found');
assert.ok(res1.taiBach, 'Tài Bạch palace found');

// 3. Annual Fortune Test
const annual1 = calculateTuViAnnual({ date: '1990-10-10', targetYear: 2026 });
assert.equal(annual1.targetYear, 2026);
assert.ok(annual1.activePalace, 'active palace present');
assert.ok(annual1.palaceTheme, 'palace theme present');
assert.ok(annual1.advice, 'advice present');

console.log('✓ tu-vi: 17 assertions passed');
