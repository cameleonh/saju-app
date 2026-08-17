import assert from 'node:assert/strict';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';
import { buildNatalChapters } from '../../server/domain/natal-chapter-selection.mjs';
import { natalReadingItems } from '../../web/natal-reading.mjs';

// --- Panel-presence guards: malformed input never throws, always fails closed ---
assert.deepEqual(natalReadingItems(null), [], 'null selection yields no items');
assert.deepEqual(natalReadingItems(undefined), [], 'undefined selection yields no items');
assert.deepEqual(natalReadingItems({}), [], 'selection without chapters yields no items');
assert.deepEqual(natalReadingItems({ chapters: 'nope' }), [], 'non-array chapters yield no items');
assert.deepEqual(natalReadingItems({ chapters: [] }), [], 'empty chapter list yields no items (panel hides)');
assert.deepEqual(natalReadingItems({ chapters: [null, undefined, 42, 'x'] }), [], 'malformed chapter entries are skipped');

// --- Status filter: render layer passes approved-only (fail closed) ---
const approved = { chapter_id: 'overview', domain_index: 1, title: '다섯 기운의 판', kind: '명식 읽기', lead: '한 줄 요약', detail: '풀이', practice: '실천', questions: ['q1', 'q2'], evidence: ['day.element'], review_status: 'approved' };
const draft = { ...approved, chapter_id: 'day_master_image', domain_index: 2, review_status: 'draft' };
const missingStatus = { ...approved, chapter_id: 'seasonal_root', domain_index: 3, review_status: undefined };
assert.equal(natalReadingItems({ chapters: [missingStatus] }).length, 0, 'chapter without review_status fails closed (no status = not approved)');
assert.equal(natalReadingItems({ chapters: [approved, draft, missingStatus] }).length, 1, 'only approved chapters survive the render-layer filter');
assert.equal(natalReadingItems({ chapters: [approved] })[0].text, approved.lead, 'lead maps to the reading-card text field');

// --- Real pipeline through the engine: mapped shape + order ---
const birth = (over = {}) => ({ date: '1990-06-15', time: '14:30', calendar: 'solar', place: '서울특별시', placeCode: '1100000000', ...over });
const chart1990 = calculateNatalChart(birth());
const selection1990 = buildNatalChapters(chart1990);
const items1990 = natalReadingItems(selection1990);
assert.ok(items1990.length >= 5, 'approved chapters map to reading items');
assert.deepEqual(items1990.map((item) => item.chapter_id), selection1990.chapters.map((chapter) => chapter.chapter_id), 'items keep the selection order');
for (const item of items1990) {
  assert.ok(item.title && item.kind && item.text && item.detail && item.practice, `${item.chapter_id} carries full card text`);
  assert.ok(Array.isArray(item.questions) && item.questions.length >= 2, `${item.chapter_id} carries questions`);
  assert.ok(Array.isArray(item.evidence), `${item.chapter_id} carries an evidence array`);
}

// --- Evidence wiring: relation chapters fall back to natal.* facts; unknown facts drop ---
const clashApproved = { chapter_id: 'branch_clash', domain_index: 12, title: '충이 품은 긴장', kind: '명식 읽기', lead: 'l', detail: 'd', practice: 'p', questions: ['q1', 'q2'], evidence: [], review_status: 'approved', matched: '인신' };
assert.deepEqual(natalReadingItems({ chapters: [clashApproved] })[0].evidence, ['natal.clash'], 'empty-evidence clash chapter points at the natal.clash fact');
assert.deepEqual(
  natalReadingItems({ chapters: [clashApproved] }, { factIds: new Set(['year.pillar']) })[0].evidence,
  [],
  'evidence chips fail closed when the fact is not present on the screen',
);
assert.deepEqual(
  natalReadingItems({ chapters: [{ ...approved, review_status: 'approved', evidence: ['day.element', 'not.a.fact'] }] }, { factIds: new Set(['day.element']) })[0].evidence,
  ['day.element'],
  'unknown evidence ids are filtered out',
);
assert.deepEqual(natalReadingItems({ chapters: [{ ...approved, review_status: 'approved', evidence: ['day.element'] }] })[0].evidence, ['day.element'], 'factIds optional — no filtering without the set');

// --- Determinism: same chart → same items ---
assert.deepEqual(natalReadingItems(buildNatalChapters(calculateNatalChart(birth()))), items1990, 'mapping is deterministic across recomputation');

console.log('✓ natal-reading: panel-presence guards + status-filter assertions passed');
