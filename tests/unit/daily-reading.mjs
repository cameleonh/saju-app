import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';
import {
  resolveDayPillar,
  selectDailyReading,
  buildDailyReading,
  DAILY_READING_SELECTION_VERSION,
  DAILY_READING_POLICY,
} from '../../server/domain/daily-reading-selection.mjs';
import {
  DAILY_READING_VERSION,
  DAILY_SECTION_SLOTS,
  DAILY_FLOW_NOTES,
  DAILY_ELEMENT_PROPS,
  DAILY_PROP_WHY,
  DAILY_QUEST_SLOT,
  DAILY_TIME_NOTE_SLOT,
  DAILY_CLOSING_SLOT,
} from '../../server/storage/seeds/daily-readings.mjs';
import { extractNatalFeatures } from '../../server/domain/natal-chapter-selection.mjs';

const require = createRequire(import.meta.url);
const { Solar } = require('lunar-javascript');

assert.equal(DAILY_READING_VERSION, '1.0.0');
assert.equal(DAILY_READING_SELECTION_VERSION, '1.0.0');
assert.equal(DAILY_READING_POLICY.grading, 'none — no scores, grades, stars, or luck levels (product principle)');

const TEN_GODS = new Set(['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인']);
const ELEMENTS = new Set(['목', '화', '토', '금', '수']);
const CLASH_KEYS = new Set(['자오', '축미', '인신', '묘유', '진술', '사해']);
const HARMONY_KEYS = new Set(['자축', '인해', '묘술', '진유', '사신', '오미']);
const BRANCH_HANGUL_KEYS = new Set(['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']);
const FLOW_KEYS = new Set(['rough', 'smooth', 'mixed', 'friction', 'group:resource', 'group:expression', 'group:wealth', 'group:power', 'group:self', 'unknown']);
const VALID_TONES = new Set(['natural']);
const VALID_REVIEW = new Set(['draft', 'approved']);

// Product principle: no grading/judgment wording anywhere in daily prose.
const BANNED_PATTERN = /아주\s*좋|너무\s*좋|최고|대박|점수|별점|등급|대길|길일|흉일|행운|[0-9]+\s*점/i;
// Hanja is allowed only inside parenthetical glosses — minimal hanja policy.
const HANJA = /[\u4e00-\u9fff]/;
const stripParens = (text) => String(text).replace(/\([^)]*\)/g, '');

function assertPolicyClean(label, ...texts) {
  for (const text of texts) {
    assert.equal(typeof text, 'string', `${label} text is a string`);
    assert.ok(text.length > 10, `${label} text is substantive`);
    assert.ok(!BANNED_PATTERN.test(text), `${label} carries no grading wording (${text.slice(0, 30)}…)`);
    assert.ok(!HANJA.test(stripParens(text)), `${label} keeps hanja inside parentheses only`);
  }
}

// --- Module schema validation ---
assert.equal(DAILY_SECTION_SLOTS.length, 4, '4 interpretation section slots');
let moduleCount = 0;
const seenSections = new Set();
for (const slot of DAILY_SECTION_SLOTS) {
  const label = slot.section_id;
  assert.ok(!seenSections.has(label), `${label} section_id is unique`);
  seenSections.add(label);
  assert.ok(Number.isInteger(slot.slot_index), `${label} has integer slot_index`);
  assert.ok(slot.tone && VALID_TONES.has(slot.tone), `${label} tone is known`);
  assert.ok(VALID_REVIEW.has(slot.review_status), `${label} review_status is known`);
  assert.equal(slot.review_status, 'draft', `${label} is draft until operator review`);
  assert.ok(Array.isArray(slot.evidence) && slot.evidence.length > 0, `${label} has evidence array`);
  const domain = slot.variant_key === 'ten_god' ? TEN_GODS : ELEMENTS;
  assert.ok(slot.variant_key === 'ten_god' || slot.variant_key === 'day_branch_element', `${label} variant_key is a known axis`);
  for (const [key, variant] of Object.entries(slot.variants)) {
    moduleCount += 1;
    assert.ok(domain.has(key), `${label}/${key} is a valid ${slot.variant_key} value`);
    assertPolicyClean(`${label}/${key}`, variant.lead, variant.detail, variant.practice);
  }
}
assert.deepEqual(seenSections, new Set(['mood', 'work', 'relations', 'energy']), 'section order: 결·일·사람·몸');

for (const [key, note] of Object.entries(DAILY_FLOW_NOTES.clash)) {
  assert.ok(CLASH_KEYS.has(key), `flow clash key ${key} is canonical`);
  assertPolicyClean(`flow/clash/${key}`, note.text);
  moduleCount += 1;
}
for (const [key, note] of Object.entries(DAILY_FLOW_NOTES.harmony)) {
  assert.ok(key === 'trio' || HARMONY_KEYS.has(key), `flow harmony key ${key} is canonical`);
  assertPolicyClean(`flow/harmony/${key}`, note.text);
  moduleCount += 1;
}
assertPolicyClean('flow/both', DAILY_FLOW_NOTES.both.text);
assertPolicyClean('flow/friction', DAILY_FLOW_NOTES.friction.text);
moduleCount += 2;
assert.equal(Object.keys(DAILY_FLOW_NOTES.harmony).length, 7, '6 육합 notes + 1 삼합 note');

for (const [element, prop] of Object.entries(DAILY_ELEMENT_PROPS)) {
  assert.ok(ELEMENTS.has(element), `prop element ${element} is valid`);
  assert.ok(Array.isArray(prop.items) && prop.items.length === 2 && prop.items.every((item) => item.length > 2), `${element} prop carries two items`);
  assert.equal(typeof prop.color_note, 'string', `${element} prop has color note`);
  moduleCount += 1;
}
assert.equal(Object.keys(DAILY_PROP_WHY).length, 3, '3 prop why rules (missing/bridge/stem)');
assert.ok(DAILY_PROP_WHY.missing.includes('{element}') && DAILY_PROP_WHY.bridge.includes('{element}') && DAILY_PROP_WHY.stem.includes('{element}'));
assert.ok(DAILY_PROP_WHY.bridge.includes('{dominant_element}'));

for (const [key, text] of Object.entries(DAILY_QUEST_SLOT.variants)) {
  assert.ok(TEN_GODS.has(key), `quest key ${key} is a valid ten god`);
  assertPolicyClean(`quest/${key}`, text);
  moduleCount += 1;
}

for (const [key, text] of Object.entries(DAILY_TIME_NOTE_SLOT.variants)) {
  assert.ok(BRANCH_HANGUL_KEYS.has(key), `time-note key ${key} is a valid branch`);
  assertPolicyClean(`time/${key}`, text);
  const ranges = text.match(/\d{2}:\d{2}–\d{2}:\d{2}/g);
  assert.ok(ranges && ranges.length === 2, `time/${key} names both 육합 and 충 windows`);
  moduleCount += 1;
}

for (const [key, text] of Object.entries(DAILY_CLOSING_SLOT.variants)) {
  assert.ok(FLOW_KEYS.has(key), `closing key ${key} is a known flow key`);
  assertPolicyClean(`closing/${key}`, text);
  assert.ok(/[니라]\.$/.test(text), `closing/${key} keeps the 서생 반말 ending`);
  moduleCount += 1;
}
assert.equal(Object.keys(DAILY_CLOSING_SLOT.variants).length, 10, 'closing covers all 10 flow keys');
assert.equal(DAILY_CLOSING_SLOT.character, '서생');
assert.ok(moduleCount >= 85, `DB carries >=85 content modules (got ${moduleCount})`);

// --- Day pillar resolution: golden values + independent cross-check ---
assert.deepEqual(
  { stem: resolveDayPillar('2026-08-17').stem, branch: resolveDayPillar('2026-08-17').branch },
  { stem: '癸', branch: '亥' },
  '2026-08-17 is 계해일',
);
assert.equal(resolveDayPillar('2026-01-01').text, '乙亥');
assert.equal(resolveDayPillar('2027-12-31').text, '甲申');

let crossChecked = 0;
for (let offset = 0; offset < 365; offset += 9) {
  const date = new Date(Date.UTC(2026, 7, 17 + offset));
  const iso = date.toISOString().slice(0, 10);
  const engine = resolveDayPillar(iso);
  const lunar = Solar.fromYmd(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()).getLunar().getDayInGanZhi();
  assert.equal(engine.text, lunar, `${iso} day pillar matches the independent lunar-javascript source`);
  crossChecked += 1;
}
assert.ok(crossChecked >= 40, `cross-checked ${crossChecked} dates against lunar-javascript`);

assert.throws(() => resolveDayPillar('2025-13-40'), 'malformed date is rejected');
assert.throws(() => resolveDayPillar('1800-01-01'), 'date outside engine range is rejected');

// --- Real engine charts (same fixtures as the natal-chapter tests) ---
const birth = (over = {}) => ({ date: '1990-06-15', time: '14:30', calendar: 'solar', place: '서울특별시', placeCode: '1100000000', ...over });
const chart1990 = calculateNatalChart(birth());
const features1990 = extractNatalFeatures(chart1990);
assert.equal(features1990.day_master, '신');
const chart1975 = calculateNatalChart(birth({ date: '1975-03-08', time: '10:00', unknownTime: true }));
const features1975 = extractNatalFeatures(chart1975);
assert.ok(features1975.missing_elements.includes('화'), '1975 chart lacks 화 for the prop missing-rule');

// --- Known-date assertions (2026-08-17 = 癸亥일) ---
const todayPillar = resolveDayPillar('2026-08-17');
const readingToday = selectDailyReading(features1990, todayPillar);
assert.equal(readingToday.eligible, true);
assert.equal(readingToday.day_master, '신');
assert.equal(readingToday.ten_god, '식신', '辛 day master vs 癸 day stem — both 음, 금생수');
assert.equal(readingToday.evidence[0].value, '계해(癸亥)');
assert.ok(readingToday.evidence[1].detail.includes('식신'), 'evidence strip names the ten-god relation');
assert.ok(readingToday.evidence[2].value.includes('수'), 'evidence strip shows incoming 수 기운');
assert.equal(readingToday.flow_key, 'smooth', '亥 day forms a 삼합 반합 with natal 未');
assert.equal(readingToday.flow.matched, 'trio');
assert.ok(readingToday.flow.text.includes('삼합'), 'trio note renders');
assert.equal(readingToday.sections.length, 4, 'all four sections fill');
assert.deepEqual(readingToday.sections.map((s) => s.section_id), ['mood', 'work', 'relations', 'energy'], 'section render order');
assert.equal(readingToday.sections.find((s) => s.section_id === 'mood').matched, '식신');
assert.equal(readingToday.sections.find((s) => s.section_id === 'energy').matched, '수');
assert.ok(readingToday.sections.find((s) => s.section_id === 'energy').detail.includes('해(亥)'), 'energy interpolates the day branch');
assert.equal(readingToday.prop_tip.rule, 'stem', '수 incoming with 토-generating dominant 화 → stem rule');
assert.equal(readingToday.prop_tip.element, '수');
assert.equal(readingToday.quest.matched, '식신');
assert.equal(readingToday.time_note.day_branch_hangul, '해');
assert.equal(readingToday.time_note.join_window.hangul, '인', '해(亥) 육합 partner is 인(寅)');
assert.equal(readingToday.time_note.clash_window.hangul, '사', '해(亥) 충 partner is 사(巳)');
assert.equal(readingToday.closing.matched_flow, 'smooth');
assert.ok(readingToday.closing.text.includes('씨앗'), 'smooth closing renders');
assert.ok(readingToday.unsupported_states.some((s) => s.id === 'daily.sinsal'), '신살 exclusion is explicit');
for (const text of [
  ...readingToday.sections.flatMap((s) => [s.lead, s.detail, s.practice]),
  readingToday.flow?.text, readingToday.quest?.text, readingToday.time_note?.text, readingToday.closing?.text, readingToday.prop_tip.why,
].filter(Boolean)) {
  assert.ok(!/\{[a-z_]+\}/.test(text), `no unresolved placeholder in: ${text.slice(0, 40)}…`);
}

// 2026-08-19 = 을축일: 丑 clashes natal 未 (축미충), 乙 vs 辛 → 편재
const readingUk = selectDailyReading(features1990, resolveDayPillar('2026-08-19'));
assert.equal(readingUk.ten_god, '편재');
assert.equal(readingUk.flow_key, 'rough');
assert.equal(readingUk.flow.matched, '축미');
assert.ok(readingUk.flow.text.includes('두 흙'), '축미 clash note renders');
assert.ok(readingUk.evidence[3].detail.includes('충'), 'evidence strip lists the clash');

// 2026-08-26 = 임신일: 申 vs natal 亥 → 원진 (friction)
const readingFriction = selectDailyReading(features1990, resolveDayPillar('2026-08-26'));
assert.equal(readingFriction.flow_key, 'friction', '원진-only day falls to the friction note');
assert.ok(readingFriction.flow.matched.includes('원진'));

// 2026-08-22 = 무진일: no branch relation; 戊 vs 辛 → 정인 (group:resource)
const readingGroup = selectDailyReading(features1990, resolveDayPillar('2026-08-22'));
assert.equal(readingGroup.flow_key, 'group:resource');
assert.equal(readingGroup.flow, null, 'no relation → no flow note, group-keyed closing');
assert.equal(readingGroup.closing.matched_flow, 'group:resource');
assert.equal(readingGroup.ten_god, '정인');
assert.equal(readingGroup.prop_tip.rule, 'bridge', '토 incoming = dominant 화(火)가 생해 주는 기운');
assert.equal(readingGroup.prop_tip.element, '토');

// 2026-08-23 = 기사일: 사(巳) branch is 화 — 1975 chart lacks 화 → prop missing-rule
const readingMissing = selectDailyReading(features1975, resolveDayPillar('2026-08-23'));
assert.equal(readingMissing.prop_tip.rule, 'missing');
assert.equal(readingMissing.prop_tip.element, '화');
assert.ok(readingMissing.prop_tip.why.includes('드러나지 않았던'));

// --- Synthetic chart: 충 + 합 same day → mixed (2026-08-25 = 신미일) ---
const mixedChart = { pillars: [
  { stem: '甲', branch: '午' }, { stem: '甲', branch: '丑' }, { stem: '壬', branch: '午' }, { stem: '丁', branch: '亥' },
] };
const mixedReading = buildDailyReading(mixedChart, '2026-08-25');
assert.equal(mixedReading.eligible, true);
assert.equal(mixedReading.day_master, '임');
assert.equal(mixedReading.ten_god, '정인', '辛 stem generates 壬 day master — different polarity');
assert.equal(mixedReading.flow_key, 'mixed', '未 day: 오미 육합 + 축미 충');
assert.equal(mixedReading.flow.key, 'mixed');
assert.equal(mixedReading.closing.matched_flow, 'mixed');
assert.ok(mixedReading.closing.text.includes('엇갈리는'));

// --- Determinism: same date + chart → identical reading, across recomputation ---
for (const [chart, date] of [[chart1990, '2026-08-17'], [chart1990, '2026-08-19'], [chart1975, '2026-08-23'], [mixedChart, '2026-08-25']]) {
  const first = buildDailyReading(chart, date);
  const again = buildDailyReading(chart, date);
  assert.deepEqual(first, again, `selection is deterministic for ${date}`);
}
const recomputed = buildDailyReading(calculateNatalChart(birth()), '2026-08-17');
assert.deepEqual(recomputed, readingToday, 'chart recomputation yields the identical reading');
const fromFeatures = buildDailyReading(features1990, '2026-08-17');
assert.deepEqual(fromFeatures, readingToday, 'precomputed features take the same path as a raw chart');

// --- Coverage sweep: 60 consecutive days exercise every day pillar ---
const MANDATORY = (reading) => reading.eligible
  && reading.sections.length === 4
  && Boolean(reading.prop_tip && ELEMENTS.has(reading.prop_tip.element))
  && Boolean(reading.quest && reading.quest.text)
  && Boolean(reading.time_note && reading.time_note.text)
  && Boolean(reading.closing && reading.closing.text);
const seenTenGods = new Set();
const seenBranchElements = new Set();
const seenTimeKeys = new Set();
const seenFlowFamilies = new Set();
const seenPropRules = new Set();
for (const chart of [chart1990, chart1975]) {
  for (let offset = 0; offset < 60; offset += 1) {
    const iso = new Date(Date.UTC(2026, 7, 17 + offset)).toISOString().slice(0, 10);
    const reading = buildDailyReading(chart, iso);
    assert.ok(MANDATORY(reading), `${iso} fills every mandatory slot`);
    for (const text of [
      ...reading.sections.flatMap((s) => [s.lead, s.detail, s.practice]),
      reading.flow?.text, reading.quest.text, reading.time_note.text, reading.closing.text, reading.prop_tip.why,
    ].filter(Boolean)) {
      assert.ok(!/\{[a-z_]+\}/.test(text), `${iso} leaves no unresolved placeholder`);
    }
    assert.ok(!BANNED_PATTERN.test([reading.quest.text, reading.closing.text, reading.prop_tip.why].join(' ')), `${iso} output carries no grading wording`);
    seenTenGods.add(reading.ten_god);
    seenBranchElements.add(reading.sections.find((s) => s.section_id === 'energy').matched);
    seenTimeKeys.add(reading.time_note.day_branch_hangul);
    seenFlowFamilies.add(reading.flow_key.split(':').length > 1 ? 'group' : reading.flow_key);
    seenPropRules.add(reading.prop_tip.rule);
  }
}
assert.equal(seenTenGods.size, 10, 'all ten ten-god relations occur across 60 days');
assert.equal(seenBranchElements.size, 5, 'all five branch elements occur');
assert.equal(seenTimeKeys.size, 12, 'all twelve day branches occur');
for (const family of ['rough', 'smooth', 'friction', 'group']) {
  assert.ok(seenFlowFamilies.has(family), `flow family ${family} occurs in the sweep`);
}
for (const rule of ['missing', 'bridge', 'stem']) assert.ok(seenPropRules.has(rule), `prop rule ${rule} occurs in the sweep`);

// --- Year sweep: mixed flow on a real chart + closing group coverage ---
const groupKeysSeen = new Set();
let mixedCount = 0;
for (let offset = 0; offset < 365; offset += 1) {
  const iso = new Date(Date.UTC(2026, 7, 17 + offset)).toISOString().slice(0, 10);
  const reading = buildDailyReading(mixedChart, iso);
  if (reading.flow_key === 'mixed') mixedCount += 1;
  groupKeysSeen.add(reading.closing.matched_flow);
}
assert.ok(mixedCount > 0, 'the 충+합 chart hits the mixed flow across a year');
for (const key of ['group:resource', 'group:expression', 'group:wealth', 'group:power', 'group:self']) {
  assert.ok(groupKeysSeen.has(key), `closing variant ${key} is exercised across a year`);
}

// --- Guard rails ---
assert.equal(buildDailyReading(null, '2026-08-17').eligible, false, 'null chart is ineligible');
assert.equal(selectDailyReading({}, todayPillar).eligible, false, 'featureless input is ineligible');
assert.equal(selectDailyReading(null, null).eligible, false, 'null inputs are ineligible');
assert.equal(selectDailyReading(features1990, null).eligible, false, 'missing day pillar is ineligible');
assert.deepEqual(selectDailyReading(features1990, null).sections, [], 'ineligible readings carry no sections');

console.log('✓ daily-reading: schema + day-pillar + determinism + coverage assertions passed');
