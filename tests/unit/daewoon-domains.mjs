import assert from 'node:assert/strict';
import {
  getDaewoonDomains,
  buildDaewoonCycleDomains,
  DAEWOON_DOMAIN_VERSION,
} from '../../server/domain/daewoon-domains.mjs';

assert.equal(DAEWOON_DOMAIN_VERSION, '1.0.0');

// --- getDaewoonDomains: 십신별 13 도메인 반환 ---
for (const tenGod of ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인']) {
  const domains = getDaewoonDomains(tenGod);
  assert.equal(domains.length, 13, `${tenGod} should return 13 domains`);
  for (const d of domains) {
    assert.ok(d.domain_key, `domain should have domain_key`);
    assert.ok(d.domain_label, `domain should have domain_label`);
    assert.ok(Array.isArray(d.points), `${tenGod} ${d.domain_key} points should be array`);
  }
  // 주요 도메인이 비어있지 않은지 확인
  const mindset = domains.find((d) => d.domain_key === 'mindset');
  assert.ok(mindset.points.length >= 2, `${tenGod} mindset should have ≥2 points`);
  const wealth = domains.find((d) => d.domain_key === 'wealth');
  assert.ok(wealth.points.length >= 2, `${tenGod} wealth should have ≥2 points`);
  const mustDo = domains.find((d) => d.domain_key === 'must_do');
  assert.ok(mustDo.points.length >= 3, `${tenGod} must_do should have ≥3 points`);
  // closing이 있는 도메인 확인 (mindset에 closing이 있어야 함)
  assert.ok(mindset.closing, `${tenGod} mindset should have closing`);
}

// --- getDaewoonDomains: 잘못된 십신 ---
assert.deepEqual(getDaewoonDomains('잘못됨'), []);

// --- buildDaewoonCycleDomains: 대운 사이클별 도메인 ---
const mockCycles = [
  { index: 0, pillar: '丙戌', stem: '丙', branch: '戌', startAge: 3, startYear: 1993, direction: 'forward' },
  { index: 1, pillar: '丁亥', stem: '丁', branch: '亥', startAge: 13, startYear: 2003, direction: 'forward' },
  { index: 2, pillar: '戊子', stem: '戊', branch: '子', startAge: 23, startYear: 2013, direction: 'forward' },
];
const cycleDomains = buildDaewoonCycleDomains(mockCycles, '庚'); // 경금 일간
assert.equal(cycleDomains.length, 3, 'should return domains for all 3 cycles');

// 丙(화)은 庚(금)을 극(剋) → 편관
assert.equal(cycleDomains[0].tenGod, '편관', '丙 vs 庚 should be 편관');
// 丁(화)은 庚(금)을 극(剋) → 정관
assert.equal(cycleDomains[1].tenGod, '정관', '丁 vs 庚 should be 정관');
// 戊(토)는 庚(금)을 생(生) → 편인
assert.equal(cycleDomains[2].tenGod, '편인', '戊 vs 庚 should be 편인');

// 각 사이클의 도메인이 13개인지 확인
for (const cd of cycleDomains) {
  assert.equal(cd.domains.length, 13, `cycle ${cd.cycleIndex} should have 13 domains`);
}

// --- buildDaewoonCycleDomains: 빈 입력 ---
assert.deepEqual(buildDaewoonCycleDomains([], '庚'), []);
assert.deepEqual(buildDaewoonCycleDomains(mockCycles, ''), []);

console.log('✓ daewoon-domains: 14 assertions passed');
