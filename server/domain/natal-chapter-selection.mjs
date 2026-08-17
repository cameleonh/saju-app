// server/domain/natal-chapter-selection.mjs
// Feature-conditional natal chapter selection — Stage 4
// Pure, deterministic: the same chart features always produce the same
// chapter list, order, variants, and resolved text. No I/O, no randomness.

import { NATAL_CHAPTERS, NATAL_CHAPTER_VERSION } from '../storage/seeds/natal-chapters.mjs';

export const NATAL_CHAPTER_SELECTION_VERSION = '1.0.0';

const STEM_HANGUL = { '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계' };
const BRANCH_HANGUL = { '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해' };
const ELEMENTS = { '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수' };
const BRANCH_ELEMENTS = { '子': '수', '丑': '토', '寅': '목', '卯': '목', '辰': '토', '巳': '화', '午': '화', '未': '토', '申': '금', '酉': '금', '戌': '토', '亥': '수' };
const POLARITY = { '甲': '양', '乙': '음', '丙': '양', '丁': '음', '戊': '양', '己': '음', '庚': '양', '辛': '음', '壬': '양', '癸': '음' };
const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
const CONTROLS = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };
const ELEMENT_ORDER = ['목', '화', '토', '금', '수'];

const CLASH_PAIRS = [
  ['子', '午', '자오'], ['丑', '未', '축미'], ['寅', '申', '인신'],
  ['卯', '酉', '묘유'], ['辰', '戌', '진술'], ['巳', '亥', '사해'],
];
const SIX_HARMONY_PAIRS = [
  ['子', '丑', '자축'], ['寅', '亥', '인해'], ['卯', '戌', '묘술'],
  ['辰', '酉', '진유'], ['巳', '申', '사신'], ['午', '未', '오미'],
];
const THREE_HARMONY_TRIADS = [
  { key: '수국', members: ['申', '子', '辰'] },
  { key: '목국', members: ['亥', '卯', '未'] },
  { key: '화국', members: ['寅', '午', '戌'] },
  { key: '금국', members: ['巳', '酉', '丑'] },
];
const SEASON_BY_BRANCH = {
  '寅': '봄', '卯': '봄', '辰': '봄',
  '巳': '여름', '午': '여름', '未': '여름',
  '申': '가을', '酉': '가을', '戌': '가을',
  '亥': '겨울', '子': '겨울', '丑': '겨울',
};
const TERM_KOREAN = {
  LI_CHUN: '입춘', YU_SHUI: '우수', JING_ZHE: '경칩', CHUN_FEN: '춘분',
  QING_MING: '청명', GU_YU: '곡우', LI_XIA: '입하', XIAO_MAN: '소만',
  MANG_ZHONG: '망종', XIA_ZHI: '하지', XIAO_SHU: '소서', DA_SHU: '대서',
  LI_QIU: '입추', CHU_SHU: '처서', BAI_LU: '백로', QIU_FEN: '추분',
  HAN_LU: '한로', SHUANG_JIANG: '상강', LI_DONG: '입동', XIAO_XUE: '소설',
  DA_XUE: '대설', DONG_ZHI: '동지', XIAO_HAN: '소한', DA_HAN: '대한',
};

function tenGodFor(dayStem, otherStem) {
  if (!ELEMENTS[dayStem] || !ELEMENTS[otherStem]) return null;
  const dayElement = ELEMENTS[dayStem];
  const otherElement = ELEMENTS[otherStem];
  const samePolarity = POLARITY[dayStem] === POLARITY[otherStem];
  if (dayElement === otherElement) return samePolarity ? '비견' : '겁재';
  if (GENERATES[dayElement] === otherElement) return samePolarity ? '식신' : '상관';
  if (CONTROLS[dayElement] === otherElement) return samePolarity ? '편재' : '정재';
  if (CONTROLS[otherElement] === dayElement) return samePolarity ? '편관' : '정관';
  if (GENERATES[otherElement] === dayElement) return samePolarity ? '편인' : '정인';
  return null;
}

function pairMatches(pair, a, b) {
  return (pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a);
}

/**
 * Extract deterministic natal features from a calculated chart.
 * Accepts the raw natal-engine shape ({ pillars, boundaryFlags, input })
 * as well as the client-decorated shape (tenGod/hiddenStems are recomputed
 * here so the selection never depends on client-side decoration).
 */
export function extractNatalFeatures(chart) {
  const pillars = Array.isArray(chart?.pillars) ? chart.pillars : [];
  const [yearPillar, monthPillar, dayPillar, hourPillar] = pillars;
  if (!dayPillar || !ELEMENTS[dayPillar.stem]) return null;

  const validBranches = pillars.map((p) => p?.branch).filter((b) => b && BRANCH_HANGUL[b]);
  const timeKnown = Boolean(hourPillar && BRANCH_HANGUL[hourPillar.branch]);

  const elementCounts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const pillar of pillars) {
    if (pillar?.stem && ELEMENTS[pillar.stem]) elementCounts[ELEMENTS[pillar.stem]] += 1;
    if (pillar?.branch && BRANCH_ELEMENTS[pillar.branch]) elementCounts[BRANCH_ELEMENTS[pillar.branch]] += 1;
  }
  let dominantElement = null;
  let dominantCount = -1;
  for (const element of ELEMENT_ORDER) {
    if (elementCounts[element] > dominantCount) { dominantElement = element; dominantCount = elementCounts[element]; }
  }
  const missingElements = ELEMENT_ORDER.filter((element) => elementCounts[element] === 0);

  const dayStem = dayPillar.stem;
  const visibleTenGods = [yearPillar, monthPillar, timeKnown ? hourPillar : null]
    .filter((p) => p?.stem && ELEMENTS[p.stem])
    .map((p, index) => ({ pillar: index, stem: p.stem, tenGod: tenGodFor(dayStem, p.stem) }))
    .filter((entry) => entry.tenGod);

  const countByTenGod = new Map();
  const firstIndexByTenGod = new Map();
  for (const entry of visibleTenGods) {
    countByTenGod.set(entry.tenGod, (countByTenGod.get(entry.tenGod) || 0) + 1);
    if (!firstIndexByTenGod.has(entry.tenGod)) firstIndexByTenGod.set(entry.tenGod, entry.pillar);
  }
  let repeatedTenGod = null;
  let repeatedCount = 0;
  for (const [tenGod, count] of countByTenGod) {
    if (count < 2) continue;
    if (count > repeatedCount || (count === repeatedCount && firstIndexByTenGod.get(tenGod) < firstIndexByTenGod.get(repeatedTenGod))) {
      repeatedTenGod = tenGod;
      repeatedCount = count;
    }
  }

  const branchSlots = [yearPillar?.branch, monthPillar?.branch, dayPillar?.branch, timeKnown ? hourPillar?.branch : null].filter((b) => b && BRANCH_HANGUL[b]);
  const branchPairs = [];
  for (let i = 0; i < branchSlots.length; i += 1) {
    for (let j = i + 1; j < branchSlots.length; j += 1) branchPairs.push([branchSlots[i], branchSlots[j]]);
  }
  let natalClashKey = null;
  for (const [left, right] of branchPairs) {
    const clashPair = CLASH_PAIRS.find((pair) => pairMatches(pair, left, right));
    if (clashPair) { natalClashKey = clashPair[2]; break; }
  }
  let natalHarmonyKey = null;
  for (const [left, right] of branchPairs) {
    const harmonyPair = SIX_HARMONY_PAIRS.find((pair) => pairMatches(pair, left, right));
    if (harmonyPair) { natalHarmonyKey = harmonyPair[2]; break; }
  }

  let natalTriadKey = null;
  const branchSet = new Set(branchSlots);
  for (const triad of THREE_HARMONY_TRIADS) {
    if (triad.members.every((member) => branchSet.has(member))) { natalTriadKey = triad.key; break; }
  }

  const sensitivity = chart?.boundaryFlags?.sensitivity || null;

  return {
    day_master: STEM_HANGUL[dayStem] || null,
    day_master_element: ELEMENTS[dayStem] || null,
    month_branch: monthPillar?.branch || null,
    month_branch_hangul: monthPillar?.branch ? BRANCH_HANGUL[monthPillar.branch] : null,
    season: monthPillar?.branch ? SEASON_BY_BRANCH[monthPillar.branch] || null : null,
    primary_ten_god: monthPillar?.stem ? tenGodFor(dayStem, monthPillar.stem) : null,
    time_known: timeKnown,
    hour_branch_hangul: timeKnown && hourPillar?.branch ? BRANCH_HANGUL[hourPillar.branch] : null,
    element_counts: elementCounts,
    dominant_element: dominantElement,
    dominant_count: dominantCount,
    missing_elements: missingElements,
    first_missing_element: missingElements[0] || null,
    repeated_ten_god: repeatedTenGod,
    repeated_count: repeatedCount,
    natal_clash: natalClashKey || null,
    natal_clash_key: natalClashKey || null,
    natal_six_harmony: natalHarmonyKey || null,
    natal_harmony_key: natalHarmonyKey || null,
    natal_three_harmony: natalTriadKey || null,
    natal_triad_key: natalTriadKey || null,
    boundary_sensitive: Boolean(sensitivity),
    boundary_term: sensitivity?.term?.key ? TERM_KOREAN[sensitivity.term.key] || sensitivity.term.key : null,
    valid_branches: validBranches,
  };
}

function selectionMatches(selection, features) {
  if (!selection || selection.type === 'always') return true;
  if (selection.type !== 'feature') return false;
  const value = features ? features[selection.feature] : undefined;
  if ('equals' in selection) return value === selection.equals;
  if ('min' in selection) return typeof value === 'number' && value >= selection.min;
  if (selection.notEmpty) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== '' && value !== false;
  }
  return false;
}

function interpolate(template, features) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{([a-z_]+)\}/g, (match, key) => {
    const value = features ? features[key] : undefined;
    if (value === null || value === undefined) return match;
    return String(value);
  });
}

/**
 * Select the ordered, feature-conditional natal chapter list.
 * Deterministic: identical features always yield identical output.
 *
 * Review gate: a module renders only when its effective review_status is
 * 'approved' — the variant-level status when present, else the chapter-level
 * default. Draft modules (pending operator review) simply don't fire, so a
 * chart can fail closed to fewer chapters but never to broken output.
 */
export function selectNatalChapters(features) {
  if (!features || !features.day_master) return { version: NATAL_CHAPTER_SELECTION_VERSION, data_version: NATAL_CHAPTER_VERSION, day_master: null, chapter_count: 0, chapters: [] };

  const chapters = [];
  for (const chapter of NATAL_CHAPTERS) {
    if (!selectionMatches(chapter.selection, features)) continue;

    let content = chapter.base || null;
    let matched = null;
    if (chapter.variant_key) {
      const variantKey = features[chapter.variant_key];
      const variant = variantKey && chapter.variants ? chapter.variants[variantKey] : null;
      if (!variant) continue;
      content = variant;
      matched = variantKey;
    }
    if (!content) continue;
    if ((content.review_status || chapter.review_status) !== 'approved') continue;

    chapters.push({
      chapter_id: chapter.chapter_id,
      domain_index: chapter.domain_index,
      title: chapter.title,
      kind: chapter.kind,
      lead: interpolate(content.lead, features),
      detail: interpolate(content.detail, features),
      practice: interpolate(content.practice, features),
      questions: chapter.questions,
      evidence: chapter.evidence,
      matched,
      tone: chapter.tone,
      review_status: 'approved',
    });
  }

  chapters.sort((a, b) => a.domain_index - b.domain_index);
  return {
    version: NATAL_CHAPTER_SELECTION_VERSION,
    data_version: NATAL_CHAPTER_VERSION,
    day_master: features.day_master,
    chapter_count: chapters.length,
    chapters,
  };
}

/**
 * Full pipeline: calculated chart → features → selected chapters.
 */
export function buildNatalChapters(chart) {
  return selectNatalChapters(extractNatalFeatures(chart));
}
