// tests/unit/couple-compatibility.mjs
import assert from 'node:assert/strict';
import { calculateFourSystemCompatibility, COUPLE_POLICY, findCoupleBranchInteractions, findNatalBranchInteractions } from '../../chart/couple-compatibility.mjs';

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

// 3. Unknown birth time is rejected until both times are known (Thai/Vietnamese boundaries require it)
assert.throws(
  () => calculateFourSystemCompatibility({
    personA: { name: '지훈', date: '1990-10-10', time: '14:30', unknownTime: false },
    personB: { name: '서연', date: '1992-02-14', time: '09:00', unknownTime: true },
  }),
  /정확한 출생 시각/,
  'unknown birth time must throw before computing Thai/Vietnamese boundaries',
);

const branchInteractions = findCoupleBranchInteractions(
  [
    { label: '년주', branch: '亥' }, { label: '월주', branch: '午' }, { label: '일주', branch: '卯' }, { label: '시주', branch: '戌' },
  ],
  [
    { label: '년주', branch: '戌' }, { label: '월주', branch: '巳' }, { label: '일주', branch: '子' }, { label: '시주', branch: '?' },
  ],
);
assert.deepEqual(branchInteractions.map(({ type, branches }) => `${type}:${branches}`).sort(), ['육합:卯戌', '충:子午', '충:巳亥', '형:子卯']);
assert.ok(branchInteractions.every(({ branchA, branchB }) => branchA !== '?' && branchB !== '?'), 'unknown-time branch is excluded from cross-chart relations');

const updatedSelfBranches = [
  { label: '년주', branch: '亥' }, { label: '월주', branch: '午' }, { label: '일주', branch: '酉' }, { label: '시주', branch: '卯' },
];
const updatedPartnerBranches = [
  { label: '년주', branch: '戌' }, { label: '월주', branch: '巳' }, { label: '일주', branch: '子' }, { label: '시주', branch: '?' },
];
assert.deepEqual(
  findCoupleBranchInteractions(updatedSelfBranches, updatedPartnerBranches).map(({ type, branches }) => `${type}:${branches}`).sort(),
  ['육합:卯戌', '충:子午', '충:巳亥', '파:子酉', '해:酉戌', '형:子卯'],
  'cross-chart comparison includes clash, punishment, harmony, harm, and break markers',
);
assert.deepEqual(findNatalBranchInteractions(updatedSelfBranches).map(({ type, branches }) => `${type}:${branches}`), ['파:卯午', '충:卯酉'], 'within-chart branch markers are reported separately from couple cross-markers');

console.log('✓ couple-compatibility: 16 assertions passed');
