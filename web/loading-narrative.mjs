// web/loading-narrative.mjs
// 서생(書生) 로딩 연출 — 연운 계산 대기 화면의 문구 로테이션 + CSS/SVG 애니메이션 마크업
// 결정론: 문구는 고정 배열에서 순환한다. 어떤 종류의 생성(LLM 등)도 사용하지 않는다.
// 순수 모듈: DOM 의존 없음. index.html(오버레이)과 annual/client.mjs(패널)이 같은 마크업을 쓴다.

export const LOADING_LINES = Object.freeze([
  '서생이 명식판을 펼치는 중입니다',
  '네 기둥의 글자를 하나씩 짚어보는 중입니다',
  '절기 경계를 달력에서 다시 확인하는 중입니다',
  '입춘을 기준으로 한 해의 간지를 고르는 중입니다',
  '오행의 양분을 헤아려 무게를 재는 중입니다',
  '풀이를 한지에 정성껏 옮겨 적는 중입니다',
]);

export const LOADING_LINE_INTERVAL_MS = 1700;

/** 인덱스를 고정 배열 위에서 순환시킨다(음수·과잉 인덱스 안전). */
export function pickLoadingLine(index) {
  const n = LOADING_LINES.length;
  const i = Number.isInteger(index) ? ((index % n) + n) % n : 0;
  return { line: LOADING_LINES[i], index: i };
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

/** 달·별·먹선 SVG — 애니메이션은 index.html의 CSS 키프레임(ln-*)이 담당한다. */
export function loadingSceneSvg() {
  return '<svg class="ln-scene" viewBox="0 0 140 96" aria-hidden="true" focusable="false"><path class="ln-moon" d="M96 20a22 22 0 1 0 8.4 38.6A24 24 0 0 1 96 20Z"/><circle class="ln-star ln-star-a" cx="34" cy="22" r="2"/><circle class="ln-star ln-star-b" cx="52" cy="12" r="1.4"/><circle class="ln-star ln-star-c" cx="22" cy="40" r="1.2"/><path class="ln-ink" d="M18 76c14-10 26 6 40-2s24-12 38-4 16 8 26 4"/><path class="ln-ink ln-ink-2" d="M26 86c18-6 34 4 52-2s26-6 38 2"/></svg>';
}

/**
 * 로딩 연출 마크업.
 * @param {object} [options]
 * @param {number}  [options.lineIndex=0] 로테이션 인덱스
 * @param {'overlay'|'panel'} [options.variant] 전체 화면 오버레이 또는 섹션 패널
 * @param {string}  [options.label] 보조 설명(이스케이프됨)
 */
export function loadingNarrativeMarkup({ lineIndex = 0, variant = 'panel', label = '' } = {}) {
  const { line, index } = pickLoadingLine(lineIndex);
  const dots = LOADING_LINES.map((_, i) => `<i class="ln-dot${i === index ? ' active' : ''}" aria-hidden="true"></i>`).join('');
  const labelHtml = label ? `<p class="ln-label">${escapeHtml(label)}</p>` : '';
  return `<div class="loading-narrative ${variant === 'overlay' ? 'ln-overlay-body' : 'ln-panel-body'}" role="status" aria-live="polite">${loadingSceneSvg()}<p class="ln-line">${escapeHtml(line)}</p><div class="ln-dots" aria-hidden="true">${dots}</div>${labelHtml}<span class="ln-character tiny" aria-hidden="true">書生 · 결</span></div>`;
}
