import assert from 'node:assert/strict';
import {
  analyzeDaewoonBranch,
  analyzeDaewoonCycles,
  DAEWOON_BRANCH_ANALYSIS_VERSION,
} from '../../chart/daewoon-branch-analysis.mjs';
import { calculateDaewoon } from '../../chart/daewoon-engine.mjs';

assert.equal(DAEWOON_BRANCH_ANALYSIS_VERSION, '1.0.0');

// --- analyzeDaewoonBranch: 충(沖) ---
// 대운 지지 子 vs 원국 지지 午 → 충
const clashResult = analyzeDaewoonBranch('子', ['午', '寅', '辰', '申'], '수');
assert.ok(clashResult.length > 0, 'should return results for natal branches');
const clashInteraction = clashResult[0].interactions.find((i) => i.type === 'clash');
assert.ok(clashInteraction, 'should detect 子午 clash');
assert.equal(clashInteraction.severity, 'strong');

// --- analyzeDaewoonBranch: 육합(六合) ---
// 대운 지지 子 vs 원국 지지 丑 → 육합
const harmonyResult = analyzeDaewoonBranch('子', ['丑', '寅', '辰', '申'], '수');
const harmonyInteraction = harmonyResult[0].interactions.find((i) => i.type === 'six-harmony');
assert.ok(harmonyInteraction, 'should detect 子丑 six-harmony');
assert.equal(harmonyInteraction.severity, 'gentle');

// --- analyzeDaewoonBranch: 삼합(三合) ---
// 신자진(申子辰) 수국 — 대운 지지 子, 원국에 申과 辰
const threeHarmonyResult = analyzeDaewoonBranch('子', ['申', '午', '辰', '寅'], '수');
const threeHarmonyInteraction = threeHarmonyResult[0].interactions.find((i) => i.type === 'three-harmony');
assert.ok(threeHarmonyInteraction, 'should detect 申子辰 three-harmony');
assert.equal(threeHarmonyInteraction.severity, 'strong-positive');
assert.ok(threeHarmonyInteraction.name.includes('수국'), 'should include water frame name');

// --- analyzeDaewoonBranch: 반합(partial three-harmony) ---
// 申과 子는 있지만 辰이 없는 경우
const partialResult = analyzeDaewoonBranch('子', ['申', '午', '寅', '卯'], '수');
const partialInteraction = partialResult[0].interactions.find((i) => i.type === 'three-harmony-partial');
assert.ok(partialInteraction, 'should detect partial three-harmony');

// --- analyzeDaewoonBranch: 해(害) ---
// 戌酉 해 — 대운 지지 酉, 원국 지지 戌
const harmResult = analyzeDaewoonBranch('酉', ['戌', '寅', '辰', '申'], '금');
const harmInteraction = harmResult[0].interactions.find((i) => i.type === 'harm');
assert.ok(harmInteraction, 'should detect 戌酉 harm');

// --- analyzeDaewoonBranch: 원진(元瞋) ---
// 子未 원진
const resentmentResult = analyzeDaewoonBranch('子', ['未', '寅', '辰', '申'], '수');
const resentmentInteraction = resentmentResult[0].interactions.find((i) => i.type === 'resentment');
assert.ok(resentmentInteraction, 'should detect 子未 resentment');

// --- analyzeDaewoonBranch: 오행 생극 ---
// 대운 지지 午(화) vs 원국 지지 子(수) → 수가 화를 극(剋) → natal-controls
const elementResult = analyzeDaewoonBranch('午', ['子', '寅', '辰', '申'], '목');
const elementRel = elementResult[0].elementRelation;
assert.ok(elementRel, 'should detect element relation');
assert.equal(elementRel.type, 'natal-controls', '子(수) natal controls 午(화) daewoon');

// --- analyzeDaewoonBranch: 일간 기준 영향 ---
assert.equal(elementResult[0].dayMasterImpact, 'expressive', '목 일간에 대해 화(午)는 표현(식상) 방향');

// --- analyzeDaewoonBranch: 빈 입력 ---
assert.deepEqual(analyzeDaewoonBranch('', ['子'], '수'), []);
assert.deepEqual(analyzeDaewoonBranch('子', [], '수'), []);
assert.deepEqual(analyzeDaewoonBranch('子', ['X'], '수'), []);

// --- analyzeDaewoonCycles: 전체 사이클 분석 ---
const daewoon = calculateDaewoon({ date: '1990-10-10', time: '14:30', yearStem: '庚', monthStem: '丙', monthBranch: '戌', unknownTime: false });
const natalBranches = ['午', '戌', '辰', '申']; // 임의의 원국 지지
const cycleAnalysis = analyzeDaewoonCycles(daewoon.cycles, natalBranches, '토');
assert.equal(cycleAnalysis.length, daewoon.cycles.length, 'cycle analysis should cover all cycles');
assert.ok(cycleAnalysis[0].branchAnalysis, 'each cycle should have branch analysis');
assert.ok(typeof cycleAnalysis[0].toneSummary === 'string', 'each cycle should have a tone summary');
assert.ok(cycleAnalysis[0].dominantInteraction === null || typeof cycleAnalysis[0].dominantInteraction === 'object', 'dominant interaction should be null or object');

// --- toneSummary에 충이 있으면 "변화" 키워드 ---
const cycleWithClash = cycleAnalysis.find((c) =>
  c.branchAnalysis.some((ba) => ba.interactions.some((i) => i.type === 'clash'))
);
if (cycleWithClash) {
  assert.ok(cycleWithClash.toneSummary.includes('변화'), `cycle ${cycleWithClash.cycleIndex} with clash should mention 변화`);
}

// --- 일간 오행 미전달 시에도 동작 ---
const noElementResult = analyzeDaewoonBranch('子', ['午'], undefined);
assert.ok(noElementResult[0].interactions.length > 0, 'should work without dayStemElement');
assert.equal(noElementResult[0].dayMasterImpact, null);

console.log('✓ daewoon-branch-analysis: 17 assertions passed');
