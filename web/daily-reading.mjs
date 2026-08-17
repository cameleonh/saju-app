// web/daily-reading.mjs
// 오늘의 기운(daily reading) 패널 — 명식 결과 화면(단일 모드)용 렌더러.
// server/domain/daily-reading-selection.mjs가 고른 결정론 결과를 조립해 보여주기만 한다(새 문장 만들지 않음).
// 점수·등급 표현은 붙이지 않는다(제품 원칙). 서생 반말은 마무리 문구에만 있다(선택 로직이 보장).
// 순수 모듈: DOM 의존 없음 — index.html(명식 결과 뷰)이 부르고, 연운 패널(annual/client.mjs)과 같은 포장 언어를 쓴다.

import { loadingNarrativeMarkup } from './loading-narrative.mjs';
import { badgeMarkup, evidenceFlowMarkup, questMarkup, remarkMarkup } from './result-packaging.mjs';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

// index.html의 icon('chevron')과 같은 모양 — 모듈 안에서 자급한다.
const chevronMarkup = () => '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

// 흐름 키 → 배지 색 버킷(정성 표현. rough/mixed=주의, smooth=순조, friction=잔금은 중립).
const FLOW_TONES = Object.freeze({ rough: 'caution', mixed: 'caution', smooth: 'favorable', friction: 'neutral' });

function formatKoreanDate(dateString) {
  const [year, month, day] = String(dateString || '').split('-').map(Number);
  if (!year || !month || !day) return String(dateString || '');
  return `${year}년 ${month}월 ${day}일`;
}

/** 근거 스트립 단계 — evidence[]를 evidenceFlowMarkup 형태로 옮긴다. */
export function dailyEvidenceSteps(daily) {
  return (Array.isArray(daily?.evidence) ? daily.evidence : [])
    .filter((step) => step?.label)
    .map((step) => ({ label: step.label, value: step.value }));
}

/** 흐름 노트 → 배지 모양(없으면 null — 지지 관계가 없는 날은 흐름 칩을 생략한다). */
export function dailyFlowBadge(daily) {
  const flow = daily?.flow;
  if (!flow?.label) return null;
  return { label: flow.label, note: flow.text || '', tone: FLOW_TONES[flow.key] || 'neutral' };
}

/** 해석 4절 — 명식 읽기 카드(.reading-card)와 같은 구조로 접는다. */
function dailySectionMarkup(section, index) {
  const number = String(section.slot_index ?? index + 1).padStart(2, '0');
  return `<details class="reading-card daily-section" data-daily-section="${escapeHtml(section.section_id || '')}" ${index === 0 ? 'open' : ''}><summary><span class="chapter-title"><span class="chapter-number">${escapeHtml(number)}</span><span><span class="kind">${escapeHtml(section.kind || '')}</span><span class="chapter-heading" role="heading" aria-level="3">${escapeHtml(section.title || '')}</span></span></span>${chevronMarkup()}</summary><div class="reading-body"><div class="reading-lead"><strong>한눈에 보기</strong><p>${escapeHtml(section.lead)}</p></div>${section.detail ? `<div class="reading-detail-block"><strong>쉽게 풀어보면</strong><p class="reading-detail">${escapeHtml(section.detail)}</p></div>` : ''}${section.practice ? `<div class="reading-practice"><strong>오늘 해볼 일</strong><p>${escapeHtml(section.practice)}</p></div>` : ''}</div></details>`;
}

/** 근거 4단계의 설명·출처 — 스트립 아래에서 펼쳐 본다. */
function dailyEvidenceDetailMarkup(daily) {
  const steps = (Array.isArray(daily?.evidence) ? daily.evidence : []).filter((step) => step?.label);
  if (!steps.length) return '';
  return `<details class="daily-evidence-detail"><summary>근거 4단계 펼쳐 보기</summary><ol>${steps.map((step) => `<li><strong>${escapeHtml(step.label)} · ${escapeHtml(step.value)}</strong><p>${escapeHtml(step.detail || '')}</p>${step.source ? `<span class="tiny mono">${escapeHtml(step.source)}</span>` : ''}</li>`).join('')}</ol></details>`;
}

/** 오행 소품 — .lucky-props 언어를 그대로 쓰고 색 노트를 함께 표시한다. */
function dailyPropMarkup(propTip) {
  if (!propTip?.element) return '';
  const colorNote = propTip.color_note ? ` · 색은 ${escapeHtml(propTip.color_note)}` : '';
  return `<div class="lucky-props"><strong>오행 소품 · ${escapeHtml(propTip.element)} 기운</strong><p>${(propTip.items || []).map(escapeHtml).join(' · ')}</p><span class="tiny">${escapeHtml(propTip.why || '')}${colorNote}</span></div>`;
}

/** 시간대 노트 — 이어지는 시간(육합 짝)과 마주치는 시간(충 짝)을 나란히 놓고 설명을 붙인다. */
function dailyTimeMarkup(timeNote) {
  if (!timeNote) return '';
  const cell = (window, toneClass, labelText) => window ? `<div class="daily-time-cell ${toneClass}"><span>${escapeHtml(labelText)} · ${escapeHtml(window.label)}(${escapeHtml(window.hangul)})</span><strong>${escapeHtml(window.start)}–${escapeHtml(window.end)}</strong></div>` : '';
  const strip = `<div class="daily-time-grid">${cell(timeNote.join_window, '', '이어지는 시간')}${cell(timeNote.clash_window, 'clash', '마주치는 시간')}</div>`;
  return `<div class="daily-time-note"><div class="side-title"><h3>${escapeHtml(timeNote.label || '시간대 노트')}</h3><span class="tiny">두 시간 창은 참고 결</span></div>${strip}<p class="daily-time-caption">${escapeHtml(timeNote.text || '')}</p></div>`;
}

/**
 * 오늘의 기운 패널 전체 마크업.
 * @param {object|null} daily buildDailyReading() 결과(eligible=false면 안내 카드)
 * @param {object} [options]
 * @param {boolean} [options.loading] 계산 대기 중이면 서생 로딩 연출을 보여준다(연운 패널과 같은 처리)
 * @param {string}  [options.error] 계산 실패 안내 문구
 */
export function renderDailyReading(daily, { loading = false, error = '' } = {}) {
  if (loading) return `<section class="panel daily-reading" aria-live="polite">${loadingNarrativeMarkup({ lineIndex: 0, variant: 'panel', label: '오늘의 일진과 명식의 관계를 계산하고 있습니다.' })}</section>`;
  if (error) return `<section class="notice amber daily-reading" role="alert"><h2>오늘의 기운을 만들지 못했습니다</h2><p>${escapeHtml(error)}</p></section>`;
  if (!daily) return '';
  if (daily.eligible === false) {
    return `<section class="panel daily-reading" aria-labelledby="daily-reading-title"><div class="section-heading"><div><div class="eyebrow">오늘의 기운 · 일운(日運)</div><h2 id="daily-reading-title">오늘의 기운을 만들 수 없습니다</h2></div></div><p class="annual-basis">${escapeHtml(daily.reason || '명식 정보가 부족해 오늘의 풀이를 만들지 못했습니다.')}</p></section>`;
  }
  const dayPillar = daily.day_pillar || {};
  const headingDate = formatKoreanDate(daily.date);
  const pillarReading = dayPillar.stem_hangul && dayPillar.branch_hangul ? `${dayPillar.stem_hangul}${dayPillar.branch_hangul}(${dayPillar.text || ''})` : '';
  const flowBadgeChip = dailyFlowBadge(daily);
  const sections = (Array.isArray(daily.sections) ? daily.sections : []).map(dailySectionMarkup).join('');
  return `<section class="panel daily-reading" aria-labelledby="daily-reading-title"><div class="section-heading daily-heading"><div><div class="eyebrow">오늘의 기운 · 일운(日運)</div><h2 id="daily-reading-title">${headingDate ? `오늘 ${headingDate}` : '오늘'}${pillarReading ? ` ${pillarReading}의 결` : '의 결'}</h2></div><p>한국 법정시 자정 기준 일진 · 매일 새로 계산</p></div><p class="annual-basis">해석 기준: 오늘 일진의 십신·유입 오행·원국과의 합충. 신살(천을귀인·도화 등)은 계산 엔진이 없어 포함하지 않습니다. 흐름 표현은 정성 서술이며 점수가 아닙니다.</p>${evidenceFlowMarkup(dailyEvidenceSteps(daily), '흐름 노트와 네 가지 결로 이어집니다')}${dailyEvidenceDetailMarkup(daily)}${flowBadgeChip ? badgeMarkup(flowBadgeChip, '오늘의 흐름') : ''}<div class="daily-sections">${sections}</div><div class="daewoon-pack daily-pack">${daily.prop_tip ? dailyPropMarkup(daily.prop_tip) : ''}${daily.quest ? questMarkup(daily.quest) : ''}${dailyTimeMarkup(daily.time_note)}</div>${daily.closing ? remarkMarkup(daily.closing, '오늘의 기운') : ''}<p class="daily-hash mono">${escapeHtml(daily.policy?.id || 'saju-daily-v1')}@${escapeHtml(daily.policy?.version || '')} · daily-seeds@${escapeHtml(daily.data_version || '')}</p></section>`;
}
