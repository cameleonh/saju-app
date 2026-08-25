// web/result-packaging.mjs
// 연운/대운 결과 포장 — 근거→해석 흐름, 서술형 흐름 배지, 서생의 한 마디, 행동 퀘스트, 오행 소품
// 모든 출력은 고정 템플릿·고정 표에서 조합되는 결정론(deterministic) 결과다. 생성 모델(LLM)은 사용하지 않는다.
// 숫자 점수·등급 점수는 만들지 않는다(제품 원칙). 배지는 정성 서술형 표현만 쓴다.
// 순수 모듈: DOM 의존 없음 — annual/client.mjs(연운 패널)와 index.html(대운 패널)이 함께 쓴다.

export const STEM_HANGUL = Object.freeze({ '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계' });

const GENERATES = Object.freeze({ 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' });

// 십신 그룹 → 정성 흐름 배지(서술형, 숫자 없음)
const TEN_GOD_GROUP_BADGES = Object.freeze({
  resource: { label: '배움이 흐르는 해', tone: 'neutral', note: '인성 기운 — 받아 적고 쌓아 두는 일이 잘 이어집니다' },
  expression: { label: '만든 것이 피어나는 해', tone: 'neutral', note: '식상 기운 — 표현하고 완성하는 일에 숨이 붙습니다' },
  wealth: { label: '다스릴 것이 늘어나는 해', tone: 'neutral', note: '재성 기운 — 셈하고 정리할 일이 눈에 띄게 많아집니다' },
  power: { label: '책임이 무게를 더는 해', tone: 'caution', note: '관성 기운 — 맡은 일이 늘어 속도를 점검해야 합니다' },
  self: { label: '내 목소리가 커지는 해', tone: 'neutral', note: '비겁 기운 — 주도권이 생기되 말과 결정은 아껴 둡니다' },
});

const TEN_GOD_GROUPS = Object.freeze([
  { group: 'resource', members: ['정인', '편인'] },
  { group: 'expression', members: ['식신', '상관'] },
  { group: 'wealth', members: ['정재', '편재'] },
  { group: 'power', members: ['정관', '편관'] },
  { group: 'self', members: ['비견', '겁재'] },
]);

/**
 * 서술형 흐름 배지. 입력: 연간/대운 십신 + 지지 관계 목록.
 * relations: [{ relation: 'clash' | 'harmony' | 기타 }] — 충이면 거칠 흐름, 육합이면 순조 흐름이 우선한다.
 * 출력 배지에는 숫자가 없다(제품 원칙: 점수 금지).
 */
export function flowBadge({ tenGod, relations = [] } = {}) {
  const hasClash = relations.some((item) => item?.relation === 'clash');
  const hasHarmony = relations.some((item) => item?.relation === 'harmony');
  if (hasClash && hasHarmony) return { key: 'mixed', label: '엇갈리는 흐름', tone: 'caution', note: '충과 합이 함께 있어 흐름의 폭이 큽니다. 큰 결정은 경계와 함께' };
  if (hasClash) return { key: 'rough', label: '거칠 수 있는 흐름', tone: 'caution', note: '지지 충이 있어 변동의 폭이 커집니다. 변화를 점검과 함께' };
  if (hasHarmony) return { key: 'smooth', label: '순조롭게 이어지는 흐름', tone: 'favorable', note: '지지 육합이 있어 인연과 일이 이어지기 쉽습니다' };
  const group = TEN_GOD_GROUPS.find(({ members }) => members.includes(tenGod))?.group;
  if (group) return { key: `group:${group}`, ...TEN_GOD_GROUP_BADGES[group] };
  return { key: 'unknown', label: '천천히 읽어갈 흐름', tone: 'neutral', note: '지원하지 않는 관계는 억지로 해석하지 않습니다' };
}

// 서생(書生)의 한 마디 — 고정 문형 템플릿. 조용한 서생 문체(음이니/니라/보니라).
// 타 서비스 캐릭터의 어미(~로다/~시게/~것이오)는 쓰지 않는다.
const hasFinalConsonant = (value) => {
  const last = String(value ?? '').slice(-1);
  return /[가-힣]$/.test(last) && ((last.charCodeAt(0) - 0xac00) % 28) !== 0;
};
const objectParticle = (value) => (hasFinalConsonant(value) ? '을' : '를');
const withParticle = (value) => (hasFinalConsonant(value) ? '과' : '와');
const topicParticle = (value) => (hasFinalConsonant(value) ? '은' : '는');

const REMARK_TEMPLATES = Object.freeze({
  rough: (dm, period) => `${dm}일간이 ${period}${objectParticle(period)} 지나는 길에는 바람이 있음이니. 붓을 잡은 채 달리지 말고 하루 한 걸음만 적어가니라.`,
  smooth: (dm, period) => `${dm}일간이 ${period}${withParticle(period)} 손을 잡는 길이니. 묵혀 둔 이야기와 씨앗을 꺼내 밭에 심음이 좋으니라.`,
  mixed: (dm, period) => `${dm}일간이 ${period}에서 엇갈리는 기운을 만나음이니. 잡히는 일부터 붙들고, 놓을 일은 이름을 적어 두니라.`,
  'group:resource': (dm, period) => `${dm}일간에게 ${period}${topicParticle(period)} 배움이 문을 두드리는 때음이니. 서재의 먼지를 털고 받아 적어 두니라.`,
  'group:expression': (dm, period) => `${dm}일간에게 ${period}${topicParticle(period)} 붓끝이 가벼워지는 때음이니. 만들고 싶던 것을 말보다 먼저 시작해 보니라.`,
  'group:wealth': (dm, period) => `${dm}일간에게 ${period}${topicParticle(period)} 다스릴 것이 늘어나는 때음이니. 장부를 정리하고 씀씀이를 미리 가늠해 두니라.`,
  'group:power': (dm, period) => `${dm}일간에게 ${period}${topicParticle(period)} 책임이 어깨에 얹히는 때음이니. 이름 걸고 맡은 일부터 수습해 나가니라.`,
  'group:self': (dm, period) => `${dm}일간에게 ${period}${topicParticle(period)} 내 목소리가 한층 커지는 때음이니. 뜻은 크게 세우되 말은 아껴 두니라.`,
  unknown: (dm, period) => `${dm}일간이 ${period}${objectParticle(period)} 만난 자리를 천천히 읽어가니라. 억지로 뜻을 붙이지 않는 것이 이 서생의 버릇이니.`,
});

/**
 * 서생의 한 마디(결정론 템플릿).
 * @param {object} input
 * @param {string} input.dayStem 일간 천간(한자) — 한글 독음으로 바꿔 쓴다
 * @param {string} input.badge flowBadge() 결과
 * @param {{kind:'annual'|'daewoon', label:string}} input.period 예: {kind:'annual', label:'丙午년'}
 */
export function saeseongRemark({ dayStem, badge, period } = {}) {
  const dm = STEM_HANGUL[dayStem] || '그';
  const label = period?.label || '이 길';
  const template = REMARK_TEMPLATES[badge?.key] || REMARK_TEMPLATES.unknown;
  return { text: template(dm, label), character: '서생', source: 'deterministic-template' };
}

/**
 * 행동 퀘스트 — 기존 문구(candidates)를 재조합해 첫 행동 하나만 고른다. 새 문구를 만들지 않는다.
 * @param {string[]} input.candidates 카드 행동문·핵심 과제 문장 등(우선순위 순)
 * @returns {{label:string, text:string}|null} — 후보가 없으면 null
 */
export function buildQuest({ candidates = [] } = {}) {
  const first = candidates.map((item) => String(item ?? '').trim()).find((item) => item.length > 0);
  if (!first) return null;
  const MAX = 80;
  const text = first.length > MAX ? `${first.slice(0, MAX).replace(/\s+\S*$/, '')}…` : first;
  return { label: '첫 번째 퀘스트', text };
}

// 오행 소품표 — 고정 표(결정론). 점수·효능 보장 없이 '양분이 되는 기운' 소품만 제시.
const ELEMENT_PROPS = Object.freeze({
  목: { items: ['푸른 식물 한 분', '원목 소품'], color: '청록' },
  화: { items: ['촛불 한 자루', '따뜻한 독서등'], color: '붉은 기' },
  토: { items: ['도자기 컵', '흙색 용기'], color: '황토' },
  금: { items: ['금속 문방소품', '흰 꽃 한 송이'], color: '흰 기' },
  수: { items: ['유리 물병', '어두운 남색 필통'], color: '짙은 남색' },
});

/**
 * 오행 소품 매핑. 우선순위: 명식에 드러나지 않은 오행 → 없다면 가장 많은 오행이 생해 주는 다음 오행.
 * @param {Record<string, number>} elementCounts {목,화,토,금,수} 개수
 */
export function luckyElementProps(elementCounts) {
  const counts = {};
  for (const key of ['목', '화', '토', '금', '수']) counts[key] = Number(elementCounts?.[key] ?? 0);
  const missing = Object.entries(counts).filter(([, count]) => count === 0).map(([key]) => key);
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const element = missing[0] || GENERATES[dominant];
  const why = missing.length
    ? '명식에 드러나지 않은 기운을 생활 곁에 두어 균형을 살펴보기 위한 소품입니다'
    : '가장 많은 기운이 생해 주는 다음 기운을 얹어 흐름을 살펴보기 위한 소품입니다';
  return { element, why, items: ELEMENT_PROPS[element].items.slice(), colorNote: ELEMENT_PROPS[element].color };
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

/** 배지 마크업 — 서술형 라벨만 표시한다(숫자 없음). */
export function badgeMarkup(badge, contextLabel = '흐름') {
  if (!badge?.label) return '';
  return `<div class="flow-badge tone-${escapeHtml(badge.tone || 'neutral')}"><strong>${escapeHtml(badge.label)}</strong><span>${escapeHtml(badge.note || '')}</span><em class="tiny">${escapeHtml(contextLabel)} · 정성 표현(점수 아님)</em></div>`;
}

/** 서생의 한 마디 마크업 — 본문(존댓말)과 구분되는 캐릭터 톡 블록. */
export function remarkMarkup(remark, contextLabel = '') {
  if (!remark?.text) return '';
  const context = contextLabel ? `<em>${escapeHtml(contextLabel)}</em>` : '';
  return `<aside class="saeseong-remark"><div class="remark-seal" aria-hidden="true">註</div><div><strong>서생의 한 마디</strong>${context}<p>${escapeHtml(remark.text)}</p><span class="tiny">고정 문형 템플릿 · AI 생성 아님</span></div></aside>`;
}

/** 퀘스트 칩 마크업. */
export function questMarkup(quest) {
  if (!quest?.text) return '';
  return `<div class="quest-chip"><strong>🎯 ${escapeHtml(quest.label)}</strong><p>${escapeHtml(quest.text)}</p></div>`;
}

/** 오행 소품 마크업. */
export function luckyPropsMarkup(props) {
  if (!props?.element) return '';
  return `<div class="lucky-props"><strong>오행 소품 · ${escapeHtml(props.element)} 기운</strong><p>${props.items.map(escapeHtml).join(' · ')}</p><span class="tiny">${escapeHtml(props.why)}</span></div>`;
}

/**
 * 근거→해석 흐름 스트립. 마지막에 해석 단계로 내려가는 화살표를 붙인다.
 * @param {{label:string, value:string}[]} steps 근거 단계들
 * @param {string} [interpretationLabel] 마지막 해석 단계 라벨(기본: 아래 해석으로 이어집니다)
 */
export function evidenceFlowMarkup(steps, interpretationLabel = '아래 해석으로 이어집니다') {
  const list = (Array.isArray(steps) ? steps : []).filter((step) => step?.label);
  if (!list.length) return '';
  const items = list.map((step) => `<li class="ef-step"><span>${escapeHtml(step.label)}</span><strong>${escapeHtml(step.value ?? '')}</strong></li>`)
    .join('<li class="ef-arrow" aria-hidden="true">↓</li>');
  return `<ol class="evidence-flow">${items}<li class="ef-arrow" aria-hidden="true">↓</li><li class="ef-step ef-final"><span>해석</span><strong>${escapeHtml(interpretationLabel)}</strong></li></ol>`;
}
