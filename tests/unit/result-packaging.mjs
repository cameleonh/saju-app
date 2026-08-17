import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  STEM_HANGUL,
  badgeMarkup,
  buildQuest,
  evidenceFlowMarkup,
  flowBadge,
  luckyElementProps,
  luckyPropsMarkup,
  questMarkup,
  remarkMarkup,
  saeseongRemark,
} from '../../web/result-packaging.mjs';
import { renderAnnualReading } from '../../annual/client.mjs';
import { createAnnualReading } from '../../server/domain/annual.mjs';
import { NATAL_POLICY, calculateNatalChart } from '../../chart/natal-engine.mjs';

let passed = 0;
const ok = (label) => { passed++; console.log(`  ✓ ${label}`); };

// 1. 흐름 배지 — 십신 그룹 5종 모두 정성 라벨, 숫자 없음
{
  const cases = [
    ['정인', '배움이'], ['편인', '배움이'],
    ['식신', '만든'], ['상관', '만든'],
    ['정재', '다스릴'], ['편재', '다스릴'],
    ['정관', '책임'], ['편관', '책임'],
    ['비견', '목소리'], ['겁재', '목소리'],
  ];
  for (const [tenGod, keyword] of cases) {
    const badge = flowBadge({ tenGod, relations: [] });
    assert.ok(badge.label.includes(keyword), `${tenGod} → ${badge.label}`);
    assert.doesNotMatch(badge.label, /\d/, `${tenGod} label must be qualitative (no digits)`);
    assert.ok(['neutral', 'caution', 'favorable'].includes(badge.tone), 'tone is a color bucket');
  }
  ok('flowBadge: all ten-god groups map to qualitative labels (no digits)');
}

// 2. 배지 우선순위 — 충·합이 십신 그룹보다 우선, 충+합은 엇갈림
{
  assert.equal(flowBadge({ tenGod: '식신', relations: [{ relation: 'clash' }] }).key, 'rough');
  assert.equal(flowBadge({ tenGod: '식신', relations: [{ relation: 'harmony' }] }).key, 'smooth');
  assert.equal(flowBadge({ tenGod: '정관', relations: [{ relation: 'clash' }, { relation: 'harmony' }] }).key, 'mixed');
  assert.equal(flowBadge({ tenGod: null, relations: [] }).key, 'unknown');
  assert.equal(flowBadge({ tenGod: '식신', relations: [{ relation: 'other' }, { relation: 'none' }] }).key, 'group:expression', 'non-clash/harmony relations fall through to the ten-god group');
  ok('flowBadge: clash/harmony take priority; mixed and unknown handled');
}

// 3. 서생의 한 마디 — 결정론, 한글 일간, 타 캐릭터 어미 미사용
{
  const input = { dayStem: '戊', badge: flowBadge({ tenGod: '편인', relations: [] }), period: { kind: 'annual', label: '丙午년' } };
  const a = saeseongRemark(input);
  const b = saeseongRemark(input);
  assert.equal(a.text, b.text, 'deterministic');
  assert.ok(a.text.includes('무일간'), 'hangul day-master reading');
  assert.ok(a.text.includes('丙午년'), 'period label included');
  assert.equal(a.source, 'deterministic-template');
  assert.equal(a.character, '서생');
  for (const other of ['로다.', '시게.', '것이오']) assert.ok(!a.text.includes(other), `must not borrow another character's ending: ${other}`);
  const rough = saeseongRemark({ dayStem: '甲', badge: flowBadge({ relations: [{ relation: 'clash' }] }), period: { kind: 'daewoon', label: '甲寅 대운' } });
  assert.ok(rough.text.includes('갑일간') && rough.text.includes('甲寅 대운'));
  assert.ok(rough.text.includes('甲寅 대운을 지나는'), 'object particle follows the final consonant (운→을)');
  const smoothYear = saeseongRemark({ dayStem: '戊', badge: flowBadge({ relations: [{ relation: 'harmony' }] }), period: { kind: 'annual', label: '丙午년' } });
  assert.ok(smoothYear.text.includes('丙午년과 손을 잡는'), 'comitative particle follows the final consonant (년→과)');
  const groupYear = saeseongRemark({ dayStem: '戊', badge: flowBadge({ tenGod: '편인', relations: [] }), period: { kind: 'annual', label: '丙午' } });
  assert.ok(groupYear.text.includes('丙午는 배움이') || groupYear.text.includes('丙午는'), 'no-final-consonant label takes 는');
  assert.equal(STEM_HANGUL['癸'], '계');
  ok('saeseongRemark: deterministic, hangul stems, distinct voice');
}

// 4. 퀘스트 — 제공된 문구만 재조합, 80자 넘으면 말끝에서 자름, 후보 없으면 null
{
  const q1 = buildQuest({ candidates: ['', null, '이번 주에 시작할 일 하나를 정해 10분만 해보기'] });
  assert.equal(q1.text, '이번 주에 시작할 일 하나를 정해 10분만 해보기');
  assert.equal(q1.label, '첫 번째 퀘스트');
  const long = '가'.repeat(120);
  const q2 = buildQuest({ candidates: [long] });
  assert.ok(q2.text.length <= 81 && q2.text.endsWith('…'), 'long quest is truncated with an ellipsis');
  assert.equal(buildQuest({ candidates: [] }), null);
  assert.equal(buildQuest({}), null);
  ok('buildQuest: recombines provided copy only, bounded length');
}

// 5. 오행 소품 — 빠진 오행 우선, 없으면 최다 오행이 생하는 기운, 5행 모두 커버
{
  const missing = luckyElementProps({ 목: 0, 화: 3, 토: 2, 금: 1, 수: 0 });
  assert.equal(missing.element, '목', 'missing element wins');
  assert.ok(missing.items.length >= 2);
  const noMissing = luckyElementProps({ 목: 1, 화: 1, 토: 1, 금: 1, 수: 5 });
  assert.equal(noMissing.element, '목', 'water generates wood — next element of the dominant');
  for (const element of ['목', '화', '토', '금', '수']) {
    const counts = { 목: 1, 화: 1, 토: 1, 금: 1, 수: 1 };
    counts[element] = 0;
    const props = luckyElementProps(counts);
    assert.equal(props.element, element, `each element is selectable (${element})`);
    assert.equal(props.items.length, 2);
  }
  assert.equal(luckyElementProps(null).element, '목', 'null counts fail over to a deterministic pick');
  ok('luckyElementProps: missing-first rule, all five elements covered');
}

// 6. 마크업 — 이스케이프, 화살표 흐름, 배지에 숫자 없음
{
  const badge = flowBadge({ tenGod: '식신', relations: [] });
  const badgeHtml = badgeMarkup(badge, '2026년 흐름');
  assert.match(badgeHtml, /flow-badge tone-neutral/);
  assert.match(badgeHtml, /정성 표현\(점수 아님\)/);
  assert.ok(!/\d+점/.test(badgeHtml), 'no score-like numerals in the badge');
  const remarkHtml = remarkMarkup(saeseongRemark({ dayStem: '戊', badge, period: { kind: 'annual', label: '丙午년' } }), '<연운>');
  assert.match(remarkHtml, /서생의 한 마디/);
  assert.match(remarkHtml, /&lt;연운&gt;/, 'context label is escaped');
  assert.match(remarkHtml, /AI 생성 아님/);
  const questHtml = questMarkup(buildQuest({ candidates: ['<b>위험</b> 문장'] }));
  assert.match(questHtml, /&lt;b&gt;위험&lt;\/b&gt;/, 'quest text is escaped');
  const luckyHtml = luckyPropsMarkup(luckyElementProps({ 목: 0, 화: 2, 토: 1, 금: 1, 수: 1 }));
  assert.match(luckyHtml, /오행 소품 · 목 기운/);
  const flow = evidenceFlowMarkup([{ label: '연운 간지', value: '丙午' }, { label: '십신', value: '편인' }]);
  assert.match(flow, /evidence-flow/);
  assert.equal((flow.match(/ef-arrow/g) || []).length, 2, 'arrows between steps and before interpretation');
  assert.match(flow, /해석/);
  assert.equal(evidenceFlowMarkup([]), '', 'empty steps render nothing');
  ok('markup: escaped, flow arrows, explicit non-score note');
}

// 7. 연운 패널 통합 — 패턴 DB 경로(도메인 포함)와 규칙 엔진 경로 모두 포장 블록이 붙는다
{
  const chartPolicy = { id: NATAL_POLICY.id, version: NATAL_POLICY.version, engine: NATAL_POLICY.engine, engineVersion: NATAL_POLICY.engineVersion };
  const { DatabaseSync } = await import('node:sqlite');
  const { createReadingStore } = await import('../../server/storage/readings.mjs');
  const store = createReadingStore(new DatabaseSync(':memory:'));
  const annual = createAnnualReading({
    targetYear: 2026,
    chartPolicy,
    natal: { dayStem: '戊', monthBranch: '戌', branches: ['子', '戌', '申', '未'] },
  }, { readingStore: store });
  const markup = renderAnnualReading(annual, { activeIndex: 0, elementCounts: { 목: 0, 화: 2, 토: 3, 금: 2, 수: 1 } });
  assert.match(markup, /evidence-flow/);
  assert.match(markup, /연운 간지/);
  assert.match(markup, /flow-badge tone-caution/, 'clash+harmony (子午 충, 午未 합) yields the mixed/caution badge');
  assert.match(markup, /첫 번째 퀘스트/);
  assert.match(markup, /서생의 한 마디/);
  assert.match(markup, /오행 소품/);
  assert.equal(annual.domains.length, 13, 'DB path carries the 13 domains');
  assert.match(markup, /정밀 풀이 13항목 — 근거별로 펼쳐 보기/);
  assert.match(markup, /domain-number/, 'domain cards are numbered after re-layout');
  assert.match(markup, /문서 형태로 8장 전체 보기/, 'existing document view survives');
  assert.match(markup, /월별 흐름 12개 보기/, 'existing monthly view survives');
  assert.ok(!/\d+점/.test(markup), 'the packaged panel contains no score numerals');
  const withoutCounts = renderAnnualReading(annual, {});
  assert.doesNotMatch(withoutCounts, /오행 소품/, 'lucky props are skipped without element counts');
  const ruleEngine = renderAnnualReading(createAnnualReading({ targetYear: 2026, chartPolicy, natal: { dayStem: '甲', monthBranch: '寅', branches: ['寅', '卯', '辰', '巳'] } }), { elementCounts: { 목: 3, 화: 1, 토: 1, 금: 0, 수: 1 } });
  assert.match(ruleEngine, /flow-badge tone-neutral/, 'group badge on the rule-engine path (甲→丙 식신, no relations)');
  assert.match(ruleEngine, /서생의 한 마디/);
  assert.match(ruleEngine, /첫 번째 퀘스트/);
  assert.doesNotMatch(ruleEngine, /정밀 풀이 13항목/, 'rule-engine path has no domain details');
  ok('annual panel: evidence flow, badge, quest, remark, lucky props integrate');
}

// 8. 대운 통합 — index.html이 현재 대운 요약과 상세 패널 포장을 갖춘다
{
  const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  assert.match(html, /function buildDaewoonPackaging\(/);
  assert.match(html, /buildDaewoonPackaging\(currentDaewoonIndex\)/, 'current-cycle summary renders without interaction');
  assert.match(html, /daewoon-pack/);
  assert.match(html, /흐름 배지는 정성 표현이며 점수가 아닙니다/, 'badge disclaimer');
  assert.match(html, /지지 관계\(근거\) ↓/, 'daewoon detail keeps the evidence-first order');
  assert.match(html, /elementCounts: chart\.elementCounts/, 'annual panel receives the chart element counts');
  ok('daewoon panel: packaging wired for current cycle and detail panel');
}

// 9. 오늘의 운세 패널 — 근거 스트립 → (흐름 노트) → 4절 → 소품·퀘스트·시간대 → 서생 마무리
{
  const { buildDailyReading, selectDailyReading, resolveDayPillar } = await import('../../server/domain/daily-reading-selection.mjs');
  const { renderDailyReading, dailyEvidenceSteps, dailyFlowBadge } = await import('../../web/daily-reading.mjs');
  const chart = calculateNatalChart({ date: '1990-10-10', time: '14:30', calendar: 'solar', unknownTime: false });
  const daily = buildDailyReading(chart, '2026-08-17');
  assert.equal(daily.eligible, true, 'golden natal chart is eligible');
  assert.equal(daily.day_pillar.text, '癸亥', 'golden day pillar for 2026-08-17');
  const markup = renderDailyReading(daily);
  assert.match(markup, /<section class="panel daily-reading" aria-labelledby="daily-reading-title">/);
  assert.match(markup, /오늘의 운세 · 일운\(日運\)/, 'user-facing vocabulary is 오늘의 운세 (P0-1 rename)');
  assert.doesNotMatch(markup, /오늘의 기운/, 'the renamed panel carries no 기운 copy');
  assert.match(markup, /오늘 2026년 8월 17일 계해\(癸亥\)의 결/, 'heading shows the Seoul civil date and today\'s day pillar');
  assert.match(markup, /evidence-flow/, 'the panel opens with the evidence strip');
  for (const label of ['오늘의 일진', '일간 대비 십신', '오늘 유입 오행', '원국과의 합·충']) assert.match(markup, new RegExp(label), `evidence step: ${label}`);
  assert.match(markup, /근거 4단계 펼쳐 보기/, 'evidence detail stays available below the strip');
  assert.match(markup, /신살\(천을귀인·도화 등\)은 계산 엔진이 없어 포함하지 않습니다/, 'the basis note states the 신살 exclusion');
  const badge = dailyFlowBadge(daily);
  assert.ok(badge && badge.tone === 'favorable', '亥+未 삼합(반합) yields the smooth/favorable flow badge');
  assert.match(markup, /flow-badge tone-favorable/, 'flow note renders as a badge chip');
  assert.match(markup, /삼합으로 흐르는 결/, 'the trio flow label is used verbatim from the selection');
  const sectionTitles = [...markup.matchAll(/class="chapter-heading" role="heading" aria-level="3">([^<]+)</g)].map((m) => m[1]);
  assert.deepEqual(sectionTitles, ['오늘의 결', '일의 흐름', '사람 사이', '몸의 리듬'], 'four sections render in the fixed slot order');
  assert.equal((markup.match(/class="reading-card daily-section"/g) || []).length, 4, 'sections reuse the reading-card collapsible language');
  assert.match(markup, /오행 소품 · /, 'prop tip renders');
  assert.match(markup, /🎯 오늘의 퀘스트/, 'quest chip renders');
  assert.match(markup, /이어지는 시간 · 인시\(인\)/, 'time note join window (寅 = 亥\'s harmony partner)');
  assert.match(markup, /마주치는 시간 · 사시\(사\)/, 'time note clash window (巳 = 亥\'s clash partner)');
  assert.match(markup, /서생의 한 마디/, 'closing renders through the remark block');
  assert.match(markup, /서생의 한 마디<\/strong><em>오늘의 운세<\/em>/, 'the closing remark labels its context with the renamed vocabulary');
  assert.match(markup, /daily-hash/, 'policy/version footer is present');
  assert.ok(!/\d+점/.test(markup), 'the daily panel contains no score numerals');
  assert.equal(renderDailyReading(daily), markup, 'rendering is deterministic');
  assert.equal(dailyEvidenceSteps(daily).length, 4, 'evidence steps map 1:1');
  // No-relation day: natal 子 has no 충·합·형·해·원진 with 亥 → flow chip omitted, closing still present
  const plain = selectDailyReading({ day_master: '무', day_master_element: '토', dominant_element: '토', element_counts: { 목: 0, 화: 0, 토: 3, 금: 1, 수: 1 }, valid_branches: ['子'] }, resolveDayPillar('2026-08-17'));
  assert.equal(plain.flow_key, 'group:wealth', '戊 vs 癸 → 정재 → wealth group when no branch relation');
  assert.equal(plain.flow, null, 'flow note is conditional');
  const plainMarkup = renderDailyReading(plain);
  assert.doesNotMatch(plainMarkup, /flow-badge/, 'no flow chip on a relation-free day');
  assert.match(plainMarkup, /서생의 한 마디/, 'closing still renders from the group key');
  // Edge paths: loading narrative, error notice, null passthrough, ineligible notice
  assert.match(renderDailyReading(daily, { loading: true }), /loading-narrative/, 'loading reuses the 서생 narrative');
  assert.match(renderDailyReading(daily, { error: '<b>위험</b>' }), /notice amber daily-reading/, 'errors render the amber notice');
  assert.match(renderDailyReading(daily, { error: '<b>위험</b>' }), /오늘의 운세를 만들지 못했습니다/, 'the error heading uses the renamed vocabulary');
  assert.ok(/&lt;b&gt;위험&lt;\/b&gt;/.test(renderDailyReading(daily, { error: '<b>위험</b>' })), 'error text is escaped');
  assert.equal(renderDailyReading(null), '', 'null daily renders nothing');
  const ineligible = buildDailyReading({}, '2026-08-17');
  assert.equal(ineligible.eligible, false);
  assert.match(renderDailyReading(ineligible), /오늘의 운세를 만들 수 없습니다/, 'ineligible readings explain themselves instead of failing silently');
  ok('daily panel: evidence strip, conditional flow, 4 sections, props, quest, time windows, closing');
}

console.log(`✓ result-packaging: ${passed} assertions passed`);
