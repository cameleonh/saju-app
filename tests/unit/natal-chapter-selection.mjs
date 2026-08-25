import assert from 'node:assert/strict';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';
import {
  extractNatalFeatures,
  selectNatalChapters,
  buildNatalChapters,
  NATAL_CHAPTER_SELECTION_VERSION,
} from '../../server/domain/natal-chapter-selection.mjs';
import { NATAL_CHAPTERS, NATAL_CHAPTER_VERSION } from '../../server/storage/seeds/natal-chapters.mjs';

assert.equal(NATAL_CHAPTER_VERSION, '1.0.0');
assert.equal(NATAL_CHAPTER_SELECTION_VERSION, '1.0.0');
assert.equal(NATAL_CHAPTERS.length, 16, 'DB defines 16 chapter slots');

// --- Module schema validation: every chapter slot is well-formed ---
const VALID_TONES = new Set(['natural']);
const VALID_REVIEW = new Set(['draft', 'approved']);
const TEN_GODS = new Set(['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인']);
const DAY_MASTERS = new Set(['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']);
const SEASONS = new Set(['봄', '여름', '가을', '겨울']);
const ELEMENTS = new Set(['목', '화', '토', '금', '수']);
const CLASH_KEYS = new Set(['자오', '축미', '인신', '묘유', '진술', '사해']);
const HARMONY_KEYS = new Set(['자축', '인해', '묘술', '진유', '사신', '오미']);
const TRIAD_KEYS = new Set(['수국', '목국', '화국', '금국']);

const VARIANT_DOMAINS = {
  day_master: DAY_MASTERS,
  season: SEASONS,
  primary_ten_god: TEN_GODS,
  dominant_element: ELEMENTS,
  repeated_ten_god: TEN_GODS,
  first_missing_element: ELEMENTS,
  natal_clash_key: CLASH_KEYS,
  natal_harmony_key: HARMONY_KEYS,
  natal_triad_key: TRIAD_KEYS,
};

let moduleCount = 0;
const seenChapterIds = new Set();
for (const chapter of NATAL_CHAPTERS) {
  const label = chapter.chapter_id;
  assert.ok(!seenChapterIds.has(label), `${label} chapter_id is unique`);
  seenChapterIds.add(label);
  assert.ok(Number.isInteger(chapter.domain_index), `${label} has integer domain_index`);
  assert.equal(typeof chapter.title, 'string', `${label} has title`);
  assert.equal(typeof chapter.kind, 'string', `${label} has kind`);
  assert.ok(Array.isArray(chapter.questions) && chapter.questions.length >= 2, `${label} has >=2 questions`);
  assert.ok(Array.isArray(chapter.evidence), `${label} has evidence array`);
  assert.ok(VALID_TONES.has(chapter.tone), `${label} tone is known`);
  assert.ok(VALID_REVIEW.has(chapter.review_status), `${label} review_status is known`);

  const contents = chapter.variant_key ? Object.entries(chapter.variants) : [['base', chapter.base]];
  if (chapter.variant_key) {
    assert.ok(chapter.base === undefined, `${label} variant chapters do not also define base`);
    assert.ok(VARIANT_DOMAINS[chapter.variant_key], `${label} variant_key is a known feature`);
  } else {
    assert.ok(chapter.base, `${label} static chapter defines base`);
  }
  for (const [key, content] of contents) {
    moduleCount += 1;
    for (const field of ['lead', 'detail', 'practice']) {
      assert.equal(typeof content[field], 'string', `${label}/${key} has ${field}`);
      assert.ok(content[field].length > 10, `${label}/${key} ${field} is substantive`);
    }
    // Effective status: variant-level status when present, else the chapter default.
    // Every module must carry one — Round 1 operator review flipped 58/80 to
    // 'approved'; the 22 uncovered rare-conditional variants stay 'draft'.
    assert.ok(content.review_status === undefined || VALID_REVIEW.has(content.review_status), `${label}/${key} variant review_status is known`);
    assert.ok(VALID_REVIEW.has(content.review_status || chapter.review_status), `${label}/${key} carries an effective review_status`);
    if (chapter.variant_key) {
      assert.ok(VARIANT_DOMAINS[chapter.variant_key].has(key), `${label} variant key ${key} is a valid ${chapter.variant_key} value`);
    }
  }
}
assert.ok(moduleCount >= 80, `DB carries >=80 content modules (got ${moduleCount})`);

// --- Feature extraction on a real engine chart (1990-06-15 14:30 → 庚午 壬午 辛亥 乙未) ---
const birth = (over = {}) => ({ date: '1990-06-15', time: '14:30', calendar: 'solar', place: '서울특별시', placeCode: '1100000000', ...over });
const chart1990 = calculateNatalChart(birth());
assert.deepEqual(chart1990.pillars.map((p) => p.text), ['庚午', '壬午', '辛亥', '乙未']);

const f1990 = extractNatalFeatures(chart1990);
assert.equal(f1990.day_master, '신');
assert.equal(f1990.day_master_element, '금');
assert.equal(f1990.season, '여름');
assert.equal(f1990.month_branch_hangul, '오');
assert.equal(f1990.primary_ten_god, '상관'); // 辛 day stem vs 壬 month stem
assert.equal(f1990.time_known, true);
assert.equal(f1990.hour_branch_hangul, '미');
assert.equal(f1990.dominant_element, '화'); // 午+午 branches
assert.equal(f1990.dominant_count, 2);
assert.deepEqual(f1990.missing_elements, [], 'all five elements present');
assert.equal(f1990.repeated_ten_god, null);
assert.equal(f1990.natal_clash_key, null);
assert.equal(f1990.natal_harmony_key, '오미'); // 午 year branch · 未 hour branch
assert.equal(f1990.natal_triad_key, null);
assert.equal(f1990.boundary_sensitive, false);

// --- Selection: deterministic, feature-conditional, review-gated ---
// 신(辛) day master is still Round-2 draft → day_master_image and life_hints
// fail closed; the chart keeps the 7 approved chapters (fewer, never broken).
const sel1990 = selectNatalChapters(f1990);
assert.equal(sel1990.chapter_count, sel1990.chapters.length);
assert.deepEqual(sel1990.chapters.map((c) => c.chapter_id), [
  'overview', 'seasonal_root', 'ten_god_structure', 'element_balance',
  'hour_rhythm', 'branch_harmony', 'closing',
], '1990 chart selects exactly the approved chapters in domain order');
assert.ok(sel1990.chapters.every((c) => c.review_status === 'approved'), 'only approved chapters render');
assert.ok(!sel1990.chapters.some((c) => c.chapter_id === 'day_master_image'), 'draft day-master image fails closed');
assert.ok(!sel1990.chapters.some((c) => c.chapter_id === 'life_hints'), 'draft life-hints variant fails closed');
const selAgain = selectNatalChapters(extractNatalFeatures(calculateNatalChart(birth())));
assert.deepEqual(selAgain, sel1990, 'selection is deterministic across recomputation');

for (const chapter of sel1990.chapters) {
  assert.ok(chapter.lead && chapter.detail && chapter.practice, `${chapter.chapter_id} resolves full text`);
  assert.ok(!/\{[a-z_]+\}/.test(chapter.lead), `${chapter.chapter_id} lead has no unresolved placeholder`);
  assert.ok(!/\{[a-z_]+\}/.test(chapter.detail), `${chapter.chapter_id} detail has no unresolved placeholder`);
  assert.ok(!/\{[a-z_]+\}/.test(chapter.practice), `${chapter.chapter_id} practice has no unresolved placeholder`);
}
assert.equal(sel1990.chapters.find((c) => c.chapter_id === 'element_balance').matched, '화');
assert.equal(sel1990.chapters.find((c) => c.chapter_id === 'branch_harmony').matched, '오미');
assert.ok(sel1990.chapters.find((c) => c.chapter_id === 'hour_rhythm').lead.includes('미'), 'hour chapter interpolates hour branch');
assert.ok(!sel1990.chapters.some((c) => c.chapter_id === 'missing_element'), 'no missing-element chapter when all five present');

// --- Unknown time swaps hour_rhythm for unknown_time ---
const chartUnknown = calculateNatalChart(birth({ date: '1975-03-08', time: '10:00', unknownTime: true }));
const selUnknown = buildNatalChapters(chartUnknown);
const idsUnknown = selUnknown.chapters.map((c) => c.chapter_id);
assert.ok(idsUnknown.includes('unknown_time'), 'unknown-time chart gets the placeholder chapter');
assert.ok(!idsUnknown.includes('hour_rhythm'), 'unknown-time chart omits the hour chapter');
assert.equal(selUnknown.chapters.find((c) => c.chapter_id === 'day_master_image').matched, '계');
assert.equal(selUnknown.chapters.find((c) => c.chapter_id === 'missing_element').matched, '화');

// --- Review gate, positive path (2000-11-20 23:30 → 庚辰 丁亥 壬午 庚子) ---
const chart2000 = calculateNatalChart(birth({ date: '2000-11-20', time: '23:30' }));
const f2000 = extractNatalFeatures(chart2000);
assert.equal(f2000.natal_clash_key, '자오'); // Round-2 draft pair
assert.equal(f2000.repeated_ten_god, '편인'); // Round-2 draft variant
const sel2000 = buildNatalChapters(chart2000);
const ids2000 = sel2000.chapters.map((c) => c.chapter_id);
assert.ok(!ids2000.includes('branch_clash'), 'draft clash variant (자오) fails closed');
assert.ok(!ids2000.includes('repeated_ten_god'), 'draft repeated ten-god variant (편인) fails closed');
assert.ok(ids2000.includes('missing_element'), 'chart missing 목 includes missing-element chapter');
assert.equal(sel2000.chapters.find((c) => c.chapter_id === 'missing_element').matched, '목');
assert.ok(ids2000.includes('day_master_image'), '임 day master is approved and renders');
assert.ok(!ids2000.includes('branch_harmony'), 'no harmony chapter without harmony');
assert.ok(!ids2000.includes('dominant_skew'), 'dominant_count 3 does not trigger skew chapter');
assert.ok(!ids2000.includes('ten_god_structure'), 'draft month-stem variant (정재) fails closed');

// --- Review gate, positive path (1986-08-10 11:30 → 丙 day master, 인신 clash, 화국 triad) ---
const chart1986 = calculateNatalChart(birth({ date: '1986-08-10', time: '11:30' }));
const sel1986 = buildNatalChapters(chart1986);
assert.ok(sel1986.chapters.some((c) => c.chapter_id === 'day_master_image' && c.matched === '병'), 'approved 병 day master renders');
assert.ok(sel1986.chapters.some((c) => c.chapter_id === 'branch_clash' && c.matched === '인신'), 'approved 인신 clash renders');
assert.ok(sel1986.chapters.some((c) => c.chapter_id === 'three_harmony' && c.matched === '화국'), 'approved 화국 triad renders');
assert.ok(sel1986.chapters.some((c) => c.chapter_id === 'repeated_ten_god' && c.matched === '비견'), 'approved repeated 비견 renders');
assert.ok(sel1986.chapters.some((c) => c.chapter_id === 'dominant_skew' && c.matched === '화'), 'approved dominant 화 skew renders');
assert.ok(sel1986.chapters.some((c) => c.chapter_id === 'missing_element' && c.matched === '수'), 'approved missing 수 renders');

// --- Real dominant-skew chart (1993-08-17 05:00 → 癸酉 庚申 庚午 己卯: 금 4) ---
const chart1993 = calculateNatalChart(birth({ date: '1993-08-17', time: '05:00' }));
const f1993 = extractNatalFeatures(chart1993);
assert.equal(f1993.dominant_element, '금');
assert.equal(f1993.dominant_count, 4);
const sel1993 = selectNatalChapters(f1993);
assert.ok(sel1993.chapters.some((c) => c.chapter_id === 'dominant_skew' && c.matched === '금'), 'real skew chart fires dominant_skew');
assert.ok(sel1993.chapters.some((c) => c.chapter_id === 'branch_clash' && c.matched === '묘유'), 'real skew chart carries 묘유 clash');

// --- Boundary sensitivity: 1985-02-04 05:15 sits within a minute of 입춘 ---
const chartBoundary = calculateNatalChart(birth({ date: '1985-02-04', time: '05:15' }));
const fBoundary = extractNatalFeatures(chartBoundary);
assert.equal(fBoundary.boundary_sensitive, true);
const selBoundary = selectNatalChapters(fBoundary);
const boundaryChapter = selBoundary.chapters.find((c) => c.chapter_id === 'boundary_sensitive');
assert.ok(boundaryChapter, 'boundary-sensitive chart includes boundary chapter');
assert.ok(boundaryChapter.lead.includes('입춘'), 'boundary term renders in Korean');
const chartNotBoundary = calculateNatalChart(birth({ date: '1985-02-04', time: '05:00' }));
assert.equal(extractNatalFeatures(chartNotBoundary).boundary_sensitive, false);
assert.equal(buildNatalChapters(chartNotBoundary).chapters.some((c) => c.chapter_id === 'boundary_sensitive'), false, 'non-sensitive chart omits boundary chapter');

// --- All 10 day masters resolve a variant; only approved ones render ---
// Round 1 approved: 갑 병 정 무 경 임 계 · Round 2 draft: 을 기 신 (fail closed)
const STEM_BY_HANGUL = { 갑: '甲', 을: '乙', 병: '丙', 정: '丁', 무: '戊', 기: '己', 경: '庚', 신: '辛', 임: '壬', 계: '癸' };
const APPROVED_DAY_MASTERS = new Set(['갑', '병', '정', '무', '경', '임', '계']);
for (const hangul of DAY_MASTERS) {
  const synthetic = { pillars: [{ stem: '甲', branch: '子' }, { stem: '甲', branch: '子' }, { stem: STEM_BY_HANGUL[hangul], branch: '子' }, { stem: '乙', branch: '丑' }] };
  const features = extractNatalFeatures(synthetic);
  assert.equal(features.day_master, hangul);
  const selected = selectNatalChapters(features);
  const dm = selected.chapters.find((c) => c.chapter_id === 'day_master_image');
  if (APPROVED_DAY_MASTERS.has(hangul)) {
    assert.equal(dm.matched, hangul, `${hangul} day master resolves and renders its variant`);
  } else {
    assert.equal(dm, undefined, `${hangul} day master is draft and fails closed`);
    assert.ok(!selected.chapters.some((c) => c.chapter_id === 'life_hints'), `${hangul} life-hints variant is draft and fails closed`);
  }
}

// --- Synthetic triad charts: 화국 renders, 수국 fails closed (Round 2) ---
const triadChartFire = { pillars: [
  { stem: '丙', branch: '寅' }, { stem: '甲', branch: '午' }, { stem: '丙', branch: '戌' }, { stem: '丁', branch: '卯' },
] };
const selTriadFire = buildNatalChapters(triadChartFire);
assert.ok(selTriadFire.chapters.some((c) => c.chapter_id === 'three_harmony' && c.matched === '화국'), '인오술 triad fires the approved three-harmony chapter');
const triadChartDraft = { pillars: [
  { stem: '壬', branch: '申' }, { stem: '壬', branch: '子' }, { stem: '壬', branch: '辰' }, { stem: '丁', branch: '巳' },
] };
const selTriadDraft = buildNatalChapters(triadChartDraft);
assert.ok(!selTriadDraft.chapters.some((c) => c.chapter_id === 'three_harmony'), '신자진 triad is draft and fails closed');

// --- Guard rails ---
assert.deepEqual(selectNatalChapters(null).chapters, [], 'null features yield no chapters');
assert.deepEqual(selectNatalChapters({}).chapters, [], 'featureless input yield no chapters');
assert.equal(buildNatalChapters({ pillars: [{ stem: '?', branch: '?' }] }).chapter_count, 0, 'invalid day stem yields no chapters');
assert.equal(buildNatalChapters(null).chapter_count, 0, 'null chart yields no chapters');

// --- Chapter count bounds: 5 static always-on + up to 9 conditional + 2 variant-gated ---
// The review gate can drop draft variant chapters (day_master_image, life_hints),
// so the floor is the 5 variant-less always-on chapters, never a broken render.
const counts = [sel1990, selUnknown, sel2000, sel1986, sel1993, selBoundary, selTriadFire, selTriadDraft].map((s) => s.chapter_count);
for (const count of counts) assert.ok(count >= 5 && count <= 16, `chapter count stays within 5..16 (got ${count})`);

console.log('✓ natal-chapter-selection: schema + selection assertions passed');
