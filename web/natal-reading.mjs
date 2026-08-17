// web/natal-reading.mjs
// 명식 읽기 챕터 매핑 — 명식 결과 화면(단일 모드)의 reading-report 패널용.
// server/domain/natal-chapter-selection.mjs가 고른 승인 챕터를 index.html의
// 기존 .reading-card 렌더러(readingMarkup)가 쓰는 모양으로 옮기기만 한다
// (새 문장을 만들지 않는다 — 제품 원칙). 순수 모듈: DOM 의존 없음.

/**
 * 충·육합·삼합 챕터는 씨드에서 evidence가 비어 있다(근거가 두 기둥의 짝이지
 * 단일 팩트가 아니므로). 결과 화면은 이 세 챕터를 위해 calculateChart가
 * natal.clash / natal.harmony / natal.triad 팩트를 계산해 두고, 여기서
 * 그 팩트로 근거 칩을 연결한다(팩트가 없으면 칩도 생략 — 실패 폐쇄).
 */
const RELATION_FACT_BY_CHAPTER = Object.freeze({
  branch_clash: 'natal.clash',
  branch_harmony: 'natal.harmony',
  three_harmony: 'natal.triad',
});

/**
 * buildNatalChapters() 결과를 readingMarkup 아이템 배열로 옮긴다.
 *
 * 가드(패널 존재 조건): selection이 null/undefined이거나 chapters가 배열이
 * 아니면 빈 배열을 돌려준다 — 결과 화면은 빈 패널을 렌더하지 않고 숨긴다.
 *
 * 상태 필터: 렌더 계층에서도 review_status가 'approved'인 챕터만 통과시킨다
 * (선택 로직이 이미 걸렀지만 없는 status는 승인이 아니므로 폐쇄한다).
 *
 * @param {object|null} selection buildNatalChapters() 결과
 * @param {object} [options]
 * @param {Set<string>|null} [options.factIds] 결과 화면에 실제 존재하는 팩트 id 모음.
 *        주어지면 근거 칩은 존재하는 팩트만 가리킨다(없는 팩트 칩은 생략).
 */
export function natalReadingItems(selection, { factIds = null } = {}) {
  const chapters = Array.isArray(selection?.chapters) ? selection.chapters : [];
  const knownFacts = factIds instanceof Set ? factIds : null;
  const items = [];
  for (const chapter of chapters) {
    if (!chapter || chapter.review_status !== 'approved') continue;
    let evidence = Array.isArray(chapter.evidence) ? chapter.evidence.filter(Boolean) : [];
    if (!evidence.length) evidence = RELATION_FACT_BY_CHAPTER[chapter.chapter_id] ? [RELATION_FACT_BY_CHAPTER[chapter.chapter_id]] : [];
    if (knownFacts) evidence = evidence.filter((id) => knownFacts.has(id));
    items.push({
      chapter_id: chapter.chapter_id,
      domain_index: Number.isInteger(chapter.domain_index) ? chapter.domain_index : items.length + 1,
      title: chapter.title,
      kind: chapter.kind,
      text: chapter.lead,
      detail: chapter.detail,
      practice: chapter.practice,
      questions: Array.isArray(chapter.questions) ? chapter.questions : [],
      evidence,
      matched: chapter.matched || null,
    });
  }
  return items.sort((a, b) => a.domain_index - b.domain_index);
}
