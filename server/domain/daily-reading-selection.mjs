// server/domain/daily-reading-selection.mjs
// "오늘의 기운" (daily reading) — deterministic selection over the daily seed DB.
// Pure: the same (natal features × date) always produce the identical reading.
// No I/O, no randomness, no LLM. Facts come ONLY from existing engines:
//   - day pillar: chart/natal-engine.mjs (KR-CIVIL civil-midnight day boundary)
//   - branch relations (충·합·형·해·원진): chart/daewoon-branch-analysis.mjs
//   - natal features: server/domain/natal-chapter-selection.mjs (extractNatalFeatures)
// Engines are imported read-only — never modified. 신살 (천을귀인·도화·반안살
// 등) has no engine module, so daily readings deliberately exclude it.

import { calculateNatalChart } from '../../chart/natal-engine.mjs';
import { analyzeDaewoonBranch } from '../../chart/daewoon-branch-analysis.mjs';
import { extractNatalFeatures } from './natal-chapter-selection.mjs';
import {
  DAILY_READING_VERSION,
  DAILY_SECTION_SLOTS,
  DAILY_FLOW_NOTES,
  DAILY_ELEMENT_PROPS,
  DAILY_PROP_WHY,
  DAILY_QUEST_SLOT,
  DAILY_TIME_NOTE_SLOT,
  DAILY_CLOSING_SLOT,
} from '../storage/seeds/daily-readings.mjs';

export const DAILY_READING_SELECTION_VERSION = '1.0.0';

const STEM_HANGUL = { '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계' };
const STEM_CHAR_BY_HANGUL = { 갑: '甲', 을: '乙', 병: '丙', 정: '丁', 무: '戊', 기: '己', 경: '庚', 신: '辛', 임: '壬', 계: '癸' };
const BRANCH_HANGUL = { '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해' };
const STEM_ELEMENTS = { '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수' };
const BRANCH_ELEMENTS = { '子': '수', '丑': '토', '寅': '목', '卯': '목', '辰': '토', '巳': '화', '午': '화', '未': '토', '申': '금', '酉': '금', '戌': '토', '亥': '수' };
const POLARITY = { '甲': '양', '乙': '음', '丙': '양', '丁': '음', '戊': '양', '己': '음', '庚': '양', '辛': '음', '壬': '양', '癸': '음' };
const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
const CONTROLS = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };

const TEN_GOD_GROUP = { 비견: 'self', 겁재: 'self', 식신: 'expression', 상관: 'expression', 편재: 'wealth', 정재: 'wealth', 편관: 'power', 정관: 'power', 편인: 'resource', 정인: 'resource' };

// Canonical pair keys used by DAILY_FLOW_NOTES (order-independent lookup).
const CLASH_PAIR_KEYS = { 子午: '자오', 丑未: '축미', 寅申: '인신', 卯酉: '묘유', 辰戌: '진술', 巳亥: '사해' };
const HARMONY_PAIR_KEYS = { 子丑: '자축', 寅亥: '인해', 卯戌: '묘술', 辰酉: '진유', 巳申: '사신', 午未: '오미' };

// Twelve two-hour civil windows — mirrors the engine's hour-branch formula
// (zi hour 23:00–00:59, branch index = floor(((hour+1)%24)/2)).
const HOUR_WINDOWS = Object.freeze([
  { branch: '子', hangul: '자', label: '자시', start: '23:00', end: '00:59' },
  { branch: '丑', hangul: '축', label: '축시', start: '01:00', end: '02:59' },
  { branch: '寅', hangul: '인', label: '인시', start: '03:00', end: '04:59' },
  { branch: '卯', hangul: '묘', label: '묘시', start: '05:00', end: '06:59' },
  { branch: '辰', hangul: '진', label: '진시', start: '07:00', end: '08:59' },
  { branch: '巳', hangul: '사', label: '사시', start: '09:00', end: '10:59' },
  { branch: '午', hangul: '오', label: '오시', start: '11:00', end: '12:59' },
  { branch: '未', hangul: '미', label: '미시', start: '13:00', end: '14:59' },
  { branch: '申', hangul: '신', label: '신시', start: '15:00', end: '16:59' },
  { branch: '酉', hangul: '유', label: '유시', start: '17:00', end: '18:59' },
  { branch: '戌', hangul: '술', label: '술시', start: '19:00', end: '20:59' },
  { branch: '亥', hangul: '해', label: '해시', start: '21:00', end: '22:59' },
]);
const HOUR_WINDOW_BY_BRANCH = new Map(HOUR_WINDOWS.map((w) => [w.branch, w]));

const CLASH_PARTNER = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' };
const HARMONY_PARTNER = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };

const DAY_MASTER_IMPACT_KOREAN = {
  same: '일간과 같은',
  supportive: '일간을 생하는',
  pressuring: '일간을 극하는',
  expressive: '일간이 생해 내는',
  controlling: '일간이 다스리는',
};

export const DAILY_READING_POLICY = Object.freeze({
  id: 'saju-daily-v1',
  version: '1.0.0',
  name: '오늘의 기운 판 정책',
  day_pillar: 'KR-CIVIL-1.0 civil-midnight day pillar (natal engine, read-only reuse)',
  branch_relations: '충·육합·삼합(반합)·형·해·원진 via daewoon-branch-analysis@1.0.0',
  interpretation_profile: 'zipap-derived ten-god day reading, qualitative flow language only',
  grading: 'none — no scores, grades, stars, or luck levels (product principle)',
});

function tenGodFor(dayStem, otherStem) {
  const dayElement = STEM_ELEMENTS[dayStem];
  const otherElement = STEM_ELEMENTS[otherStem];
  if (!dayElement || !otherElement) return null;
  const samePolarity = POLARITY[dayStem] === POLARITY[otherStem];
  if (dayElement === otherElement) return samePolarity ? '비견' : '겁재';
  if (GENERATES[dayElement] === otherElement) return samePolarity ? '식신' : '상관';
  if (CONTROLS[dayElement] === otherElement) return samePolarity ? '편재' : '정재';
  if (CONTROLS[otherElement] === dayElement) return samePolarity ? '편관' : '정관';
  if (GENERATES[otherElement] === dayElement) return samePolarity ? '편인' : '정인';
  return null;
}

function interpolate(template, context) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{([a-z_]+)\}/g, (match, key) => {
    const value = context ? context[key] : undefined;
    if (value === null || value === undefined) return match;
    return String(value);
  });
}

function pairKey(table, left, right) {
  return table[`${left}${right}`] || table[`${right}${left}`] || null;
}

/**
 * Resolve the day pillar for a solar date. Reuses the natal engine unchanged
 * (unknownTime keeps the hour pillar out; the day pillar follows the engine's
 * KR-CIVIL civil-midnight policy). Supported range: 1900-01-01..2100-12-31.
 */
export function resolveDayPillar(dateString) {
  const chart = calculateNatalChart({ date: dateString, time: '12:00', calendar: 'solar', unknownTime: true });
  const dayPillar = chart?.pillars?.[2];
  if (!dayPillar || !STEM_ELEMENTS[dayPillar.stem] || !BRANCH_ELEMENTS[dayPillar.branch]) {
    throw new Error('day pillar could not be resolved for this date');
  }
  return {
    date: String(dateString),
    stem: dayPillar.stem,
    branch: dayPillar.branch,
    text: dayPillar.text,
    stem_hangul: STEM_HANGUL[dayPillar.stem],
    branch_hangul: BRANCH_HANGUL[dayPillar.branch],
    stem_element: STEM_ELEMENTS[dayPillar.stem],
    branch_element: BRANCH_ELEMENTS[dayPillar.branch],
    polarity: POLARITY[dayPillar.stem],
    boundary: 'civil-midnight',
    engine: 'gyeol-natal-core@1.0.0 (day pillar, read-only reuse)',
  };
}

function collectInteractions(branchAnalysis) {
  const clash = [];
  const sixHarmony = [];
  const trio = [];
  const friction = [];
  for (const row of branchAnalysis) {
    for (const interaction of row.interactions || []) {
      const entry = { position: row.position, natal_branch: row.natalBranch };
      if (interaction.type === 'clash') clash.push(entry);
      else if (interaction.type === 'six-harmony') sixHarmony.push(entry);
      else if (interaction.type === 'three-harmony' || interaction.type === 'three-harmony-partial') trio.push({ ...entry, name: interaction.name });
      else if (interaction.type === 'punishment' || interaction.type === 'punishment-full' || interaction.type === 'punishment-partial') friction.push({ ...entry, kind: '형(刑)' });
      else if (interaction.type === 'harm') friction.push({ ...entry, kind: '해(害)' });
      else if (interaction.type === 'resentment') friction.push({ ...entry, kind: '원진(元瞋)' });
    }
  }
  return { clash, sixHarmony, trio, friction };
}

function flowKeyFor({ clash, sixHarmony, trio, friction }, tenGod) {
  const hasClash = clash.length > 0;
  const hasHarmony = sixHarmony.length > 0 || trio.length > 0;
  if (hasClash && hasHarmony) return 'mixed';
  if (hasClash) return 'rough';
  if (hasHarmony) return 'smooth';
  if (friction.length > 0) return 'friction';
  const group = tenGod ? TEN_GOD_GROUP[tenGod] : null;
  return group ? `group:${group}` : 'unknown';
}

function selectPropTip(features, dayPillar) {
  const incoming = [dayPillar.stem_element, dayPillar.branch_element];
  const unique = [...new Set(incoming)];
  const counts = features?.element_counts || {};
  const missing = unique.filter((element) => Number(counts[element] ?? 0) === 0);
  let rule = 'stem';
  let element = dayPillar.stem_element;
  if (missing.length > 0) {
    rule = 'missing';
    element = missing[0];
  } else {
    const generated = features?.dominant_element ? GENERATES[features.dominant_element] : null;
    const bridged = generated ? unique.find((el) => el === generated) : null;
    if (bridged) {
      rule = 'bridge';
      element = bridged;
    }
  }
  const prop = DAILY_ELEMENT_PROPS[element];
  const why = DAILY_PROP_WHY[rule];
  return {
    rule,
    element,
    items: prop ? prop.items.slice() : [],
    color_note: prop ? prop.color_note : null,
    why: interpolate(why?.text || '', { element, dominant_element: features?.dominant_element }),
    review_status: prop?.review_status === 'approved' && why?.review_status === 'approved' ? 'approved' : 'draft',
  };
}

function buildEvidence(features, dayPillar, tenGod, interactions, branchAnalysis) {
  const dayMasterChar = STEM_CHAR_BY_HANGUL[features.day_master] || '?';
  const polarityNote = (dayPillar.polarity === (POLARITY[dayMasterChar] || null)) ? '같은 음양' : '다른 음양';
  const incomingValue = dayPillar.stem_element === dayPillar.branch_element
    ? `${dayPillar.stem_element}(${dayPillar.stem_hangul}·${dayPillar.branch_hangul})`
    : `${dayPillar.stem_element}(${dayPillar.stem_hangul}) · ${dayPillar.branch_element}(${dayPillar.branch_hangul})`;
  const impact = DAY_MASTER_IMPACT_KOREAN[branchAnalysis?.[0]?.dayMasterImpact] || null;

  const relationParts = [];
  for (const entry of interactions.clash) relationParts.push(`${entry.position} ${BRANCH_HANGUL[entry.natal_branch] || entry.natal_branch} 충`);
  for (const entry of interactions.sixHarmony) relationParts.push(`${entry.position} ${BRANCH_HANGUL[entry.natal_branch] || entry.natal_branch} 육합`);
  for (const entry of interactions.trio) relationParts.push(`${entry.position} 삼합`);
  for (const entry of interactions.friction) relationParts.push(`${entry.position} ${entry.kind}`);

  return [
    {
      step: 1,
      label: '오늘의 일진',
      value: `${dayPillar.stem_hangul}${dayPillar.branch_hangul}(${dayPillar.text})`,
      detail: '한국 법정시 자정 기준으로 나눈 오늘의 일주입니다.',
      status: 'calculated',
      source: dayPillar.engine,
    },
    {
      step: 2,
      label: '일간 대비 십신',
      value: tenGod,
      detail: `일간 ${features.day_master}(${dayMasterChar})을 기준으로 오늘 천간 ${dayPillar.stem_hangul}(${dayPillar.stem})은 ${polarityNote}으로 만나는 ${tenGod} 관계입니다.`,
      status: 'interpretive',
      source: 'daily-reading-rules@1.0.0 (ten-god table)',
    },
    {
      step: 3,
      label: '오늘 유입 오행',
      value: incomingValue,
      detail: `천간 ${dayPillar.stem}과 지지 ${dayPillar.branch}에서 들어오는 기운입니다.${impact ? ` 지지의 기운은 ${impact} 기운입니다.` : ''}`,
      status: 'calculated',
      source: dayPillar.engine,
    },
    {
      step: 4,
      label: '원국과의 합·충',
      value: relationParts.length ? relationParts.length.toString() : '해당 없음',
      detail: relationParts.length
        ? `오늘 일지 ${dayPillar.branch_hangul}(${dayPillar.branch})이 원국과 이루는 관계 — ${relationParts.join(' · ')}.`
        : '오늘 일지가 원국과 이루는 충·합·형·해가 없습니다.',
      status: relationParts.length ? 'interpretive' : 'calculated',
      source: 'daewoon-branch-analysis@1.0.0',
    },
  ];
}

/**
 * Select the full daily reading. Deterministic: identical (features, dayPillar)
 * always yield identical output.
 */
export function selectDailyReading(features, dayPillar) {
  if (!features || !features.day_master || !dayPillar || !STEM_ELEMENTS[dayPillar.stem]) {
    return {
      version: DAILY_READING_SELECTION_VERSION,
      data_version: DAILY_READING_VERSION,
      date: dayPillar?.date || null,
      eligible: false,
      reason: 'natal features or day pillar unavailable',
      sections: [],
    };
  }

  const dayMasterChar = STEM_CHAR_BY_HANGUL[features.day_master];
  const tenGod = tenGodFor(dayMasterChar, dayPillar.stem);
  if (!tenGod) {
    return {
      version: DAILY_READING_SELECTION_VERSION,
      data_version: DAILY_READING_VERSION,
      date: dayPillar.date,
      eligible: false,
      reason: 'ten-god relation unavailable',
      sections: [],
    };
  }

  const branchAnalysis = analyzeDaewoonBranch(dayPillar.branch, features.valid_branches || [], features.day_master_element);
  const interactions = collectInteractions(branchAnalysis);
  const flowKey = flowKeyFor(interactions, tenGod);

  const positions = (entries) => entries.map((e) => e.position).join('·') || null;
  const clashEntry = interactions.clash[0] || null;
  const harmonyEntry = interactions.sixHarmony[0] || null;
  const trioEntry = interactions.trio[0] || null;
  const frictionKinds = [...new Set(interactions.friction.map((e) => e.kind))];

  const context = {
    day_master: features.day_master,
    day_master_element: features.day_master_element,
    day_stem_hangul: dayPillar.stem_hangul,
    day_stem_char: dayPillar.stem,
    day_stem_element: dayPillar.stem_element,
    day_branch_hangul: dayPillar.branch_hangul,
    day_branch_char: dayPillar.branch,
    day_branch_element: dayPillar.branch_element,
    day_pillar_text: `${dayPillar.stem_hangul}${dayPillar.branch_hangul}`,
    ten_god: tenGod,
    dominant_element: features.dominant_element,
    clash_positions: positions(interactions.clash),
    clash_partner_hangul: clashEntry ? BRANCH_HANGUL[clashEntry.natal_branch] : null,
    clash_partner_char: clashEntry ? clashEntry.natal_branch : null,
    harmony_positions: positions(interactions.sixHarmony.length ? interactions.sixHarmony : interactions.trio),
    harmony_partner_hangul: harmonyEntry ? BRANCH_HANGUL[harmonyEntry.natal_branch] : null,
    harmony_partner_char: harmonyEntry ? harmonyEntry.natal_branch : null,
    friction_list: frictionKinds.join('·') || null,
    trio_name: trioEntry ? trioEntry.name.replace(/^삼합\s*/, '') : null,
    trio_element: trioEntry ? (trioEntry.name.match(/(목|화|토|금|수)국/) || [])[1] : null,
    element: null,
  };

  // 근거 스트립 (computed data, not module-selected)
  const evidence = buildEvidence(features, dayPillar, tenGod, interactions, branchAnalysis);

  // 흐름 노트 — the evidence→interpretation bridge (conditional)
  let flow = null;
  if (flowKey === 'mixed') {
    flow = { key: 'mixed', label: DAILY_FLOW_NOTES.both.label, text: interpolate(DAILY_FLOW_NOTES.both.text, context) };
  } else if (flowKey === 'rough') {
    const key = pairKey(CLASH_PAIR_KEYS, dayPillar.branch, clashEntry.natal_branch);
    const note = key ? DAILY_FLOW_NOTES.clash[key] : null;
    if (note) flow = { key: 'rough', matched: key, label: note.label, text: interpolate(note.text, context) };
  } else if (flowKey === 'smooth') {
    if (harmonyEntry) {
      const key = pairKey(HARMONY_PAIR_KEYS, dayPillar.branch, harmonyEntry.natal_branch);
      const note = key ? DAILY_FLOW_NOTES.harmony[key] : null;
      if (note) flow = { key: 'smooth', matched: key, label: note.label, text: interpolate(note.text, context) };
    } else if (trioEntry) {
      const note = DAILY_FLOW_NOTES.harmony.trio;
      flow = { key: 'smooth', matched: 'trio', label: note.label, text: interpolate(note.text, context) };
    }
  } else if (flowKey === 'friction') {
    const note = DAILY_FLOW_NOTES.friction;
    flow = { key: 'friction', matched: frictionKinds.join('·'), label: note.label, text: interpolate(note.text, context) };
  }

  // 4 interpretation sections
  const sections = [];
  for (const slot of DAILY_SECTION_SLOTS) {
    const variantKey = context[slot.variant_key];
    const variant = slot.variants[variantKey];
    if (!variant) continue;
    sections.push({
      section_id: slot.section_id,
      slot_index: slot.slot_index,
      title: slot.title,
      kind: slot.kind,
      lead: interpolate(variant.lead, context),
      detail: interpolate(variant.detail, context),
      practice: interpolate(variant.practice, context),
      evidence: slot.evidence,
      matched: variantKey,
      tone: slot.tone,
      review_status: variant.review_status || slot.review_status,
    });
  }
  sections.sort((a, b) => a.slot_index - b.slot_index);

  // 오행 소품 tip
  const propTip = selectPropTip(features, dayPillar);
  context.element = propTip.element;

  // 오늘의 퀘스트
  const questVariant = DAILY_QUEST_SLOT.variants[tenGod];

  // 시간대 노트 (structured windows + prose)
  const joinPartner = HARMONY_PARTNER[dayPillar.branch];
  const clashPartner = CLASH_PARTNER[dayPillar.branch];
  const joinWindow = HOUR_WINDOW_BY_BRANCH.get(joinPartner) || null;
  const clashWindow = HOUR_WINDOW_BY_BRANCH.get(clashPartner) || null;
  const timeVariant = DAILY_TIME_NOTE_SLOT.variants[dayPillar.branch_hangul];

  // 서생의 한 마디
  const closingVariant = DAILY_CLOSING_SLOT.variants[flowKey];

  return {
    version: DAILY_READING_SELECTION_VERSION,
    data_version: DAILY_READING_VERSION,
    date: dayPillar.date,
    eligible: true,
    day_master: features.day_master,
    ten_god: tenGod,
    flow_key: flowKey,
    day_pillar: dayPillar,
    evidence,
    flow,
    sections,
    prop_tip: { ...propTip },
    quest: questVariant
      ? { label: DAILY_QUEST_SLOT.label, text: interpolate(questVariant.text, context), matched: tenGod, review_status: questVariant.review_status || 'draft' }
      : null,
    time_note: timeVariant
      ? {
          label: DAILY_TIME_NOTE_SLOT.label,
          day_branch_hangul: dayPillar.branch_hangul,
          join_window: joinWindow ? { branch: joinWindow.branch, hangul: joinWindow.hangul, label: joinWindow.label, start: joinWindow.start, end: joinWindow.end } : null,
          clash_window: clashWindow ? { branch: clashWindow.branch, hangul: clashWindow.hangul, label: clashWindow.label, start: clashWindow.start, end: clashWindow.end } : null,
          text: interpolate(timeVariant.text, context),
          review_status: timeVariant.review_status || 'draft',
        }
      : null,
    closing: closingVariant
      ? { label: DAILY_CLOSING_SLOT.label, character: DAILY_CLOSING_SLOT.character, matched_flow: flowKey, text: interpolate(closingVariant.text, context), review_status: closingVariant.review_status || 'draft' }
      : null,
    policy: DAILY_READING_POLICY,
    unsupported_states: [
      { id: 'daily.sinsal', reason: 'no engine module computes 신살 (천을귀인·도화·반안살 등); daily readings exclude it' },
    ],
  };
}

/**
 * Full pipeline: calculated chart (or precomputed natal features) + solar date
 * → daily reading. Accepts the raw natal-engine chart shape.
 */
export function buildDailyReading(chartOrFeatures, dateString) {
  const features = chartOrFeatures && Array.isArray(chartOrFeatures.pillars)
    ? extractNatalFeatures(chartOrFeatures)
    : chartOrFeatures;
  const dayPillar = resolveDayPillar(dateString);
  return selectDailyReading(features, dayPillar);
}
