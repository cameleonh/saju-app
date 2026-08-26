// tests/unit/couple-compatibility.mjs
import assert from 'node:assert/strict';
import { calculateFourSystemCompatibility, COUPLE_POLICY } from '../../chart/couple-compatibility.mjs';

// 1. Policy metadata
assert.equal(COUPLE_POLICY.id, 'ASIAN-COUPLE-4SYS-1.0');

// 2. Compatibility between Person A (1990-10-10) and Person B (1992-02-14)
const result = calculateFourSystemCompatibility({
  personA: { name: '지훈', date: '1990-10-10', time: '14:30', unknownTime: false },
  personB: { name: '서연', date: '1992-02-14', time: '09:00', unknownTime: false },
});

assert.ok(result.saju, 'Saju couple result exists');
assert.ok(result.mahabote, 'Mahabote couple result exists');
assert.ok(result.horasat, 'Horasat couple result exists');
assert.ok(result.tuVi, 'Tu Vi couple result exists');
assert.ok(result.synthesis, 'Synthesis exists');

assert.equal(result.personA.name, '지훈');
assert.equal(result.personB.name, '서연');
assert.ok(result.saju.stemSynergy, 'stem synergy populated');
assert.ok(result.mahabote.animalPair, 'animal pair populated');
assert.ok(result.horasat.rasiPair, 'rasi pair populated');
assert.ok(result.tuVi.starPair, 'star pair populated');

console.log('✓ couple-compatibility: 11 assertions passed');
