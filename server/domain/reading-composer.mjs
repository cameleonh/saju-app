// server/domain/reading-composer.mjs
// Layer B: 개인화 리딩 조합 엔진
// 정적 패턴 DB 모듈(A1/A2/A3)을 사용자 명식에 맞춰 동적 조합

import { derivePatternId } from '../storage/readings.mjs';
import { enrichDomain, getElementTheory, getTenGodActions } from './reading-enrichment.mjs';
import { analyzeDaewoonBranch, analyzeDaewoonCycles } from '../../chart/daewoon-branch-analysis.mjs';
import { getDaewoonDomains } from './daewoon-domains.mjs';

const STEM_HANGUL = { '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계' };
const BRANCH_HANGUL = { '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해' };
const ELEMENTS = { '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수' };
const POLARITY = { '甲': '양', '乙': '음', '丙': '양', '丁': '음', '戊': '양', '己': '음', '庚': '양', '辛': '음', '壬': '양', '癸': '음' };
const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
const CONTROLS = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };
const CLASH = new Set(['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥']);
const HARMONY = new Set(['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未']);

// 월지별 계절 의미
const MONTH_BRANCH_SEASONAL = {
  '寅': { season: '봄', label: '입춘~경칩', element: '목', theme: '새싹이 돋고 방향을 정하는 시기' },
  '卯': { season: '봄', label: '경칩~청명', element: '목', theme: '나무가 자라고 관계가 활발해지는 시기' },
  '辰': { season: '봄', label: '청명~입하', element: '토', theme: '봄의 마무리와 여름 준비, 저장과 변화의 문턱' },
  '巳': { season: '여름', label: '입하~망종', element: '화', theme: '온기가 자라고 번성이 시작되는 시기' },
  '午': { season: '여름', label: '망종~소서', element: '화', theme: '가장 뜨겁고 활동적인 시기' },
  '未': { season: '여름', label: '소서~입추', element: '토', theme: '여름의 마무리, 수확과 저장의 시작' },
  '申': { season: '가을', label: '입추~백로', element: '금', theme: '거두고 정리하며 결실을 맺는 시기' },
  '酉': { season: '가을', label: '백로~한로', element: '금', theme: '수확의 절정, 날카로움과 명확함' },
  '戌': { season: '가을', label: '한로~입동', element: '토', theme: '가을의 마무리, 저장과 보존의 시기' },
  '亥': { season: '겨울', label: '입동~대설', element: '수', theme: '물이 흐르고 쉬어가는 시기' },
  '子': { season: '겨울', label: '대설~소한', element: '수', theme: '가장 차고 깊은 휴식, 내면으로 향하는 시기' },
  '丑': { season: '겨울', label: '소한~입춘', element: '토', theme: '겨울의 마무리, 봄을 준비하며 버티는 시기' },
};

function tenGodFor(dayStemChar, otherStemChar) {
  const dayElement = ELEMENTS[dayStemChar];
  const otherElement = ELEMENTS[otherStemChar];
  if (!dayElement || !otherElement) return null;
  const samePolarity = POLARITY[dayStemChar] === POLARITY[otherStemChar];
  if (dayElement === otherElement) return samePolarity ? '비견' : '겁재';
  if (GENERATES[dayElement] === otherElement) return samePolarity ? '식신' : '상관';
  if (CONTROLS[dayElement] === otherElement) return samePolarity ? '편재' : '정재';
  if (CONTROLS[otherElement] === dayElement) return samePolarity ? '편관' : '정관';
  if (GENERATES[otherElement] === dayElement) return samePolarity ? '편인' : '정인';
  return null;
}

function relationBetween(left, right) {
  const pair = `${left}${right}`;
  const reverse = `${right}${left}`;
  if (CLASH.has(pair) || CLASH.has(reverse)) return 'clash';
  if (HARMONY.has(pair) || HARMONY.has(reverse)) return 'harmony';
  return 'none';
}

// 일간 기조 이미지
const DAY_MASTER_IMAGES = {
  '갑': { image: '크고 곧은 나무', nature: '위로 뻗고 세우는 힘' },
  '을': { image: '덩굴, 화초', nature: '유연하게 적응하고 감고 오르는 힘' },
  '병': { image: '태양, 큰 불', nature: '밝게 비추고 따뜻하게 만드는 힘' },
  '정': { image: '촛불, 등불', nature: '섬세하게 밝히고 다듬는 힘' },
  '무': { image: '산, 큰 흙', nature: '버티고 지키고 누르는 힘' },
  '기': { image: '밭, 비옥한 흙', nature: '품고 기르고 배려하는 힘' },
  '경': { image: '칼, 쇠', nature: '결단하고 자르고 세우는 힘' },
  '신': { image: '보석, 바늘', nature: '다듬고 빛내고 살피는 힘' },
  '임': { image: '바다, 큰 강', nature: '흐르고 퍼지는 힘' },
  '계': { image: '이슬, 샘물', nature: '스며들고 적시는 힘' },
};

/**
 * 사용자 명식에서 개인화 키를 추출
 */
export function extractPersonalizationKey(natal, daewoon, targetYear, annualResult) {
  const dayStem = natal?.dayStem || annualResult?.facts?.find((f) => f.id === 'annual.stem.tenGodToDayMaster')?.detail?.match(/일간 (\S)을/)?.[1];
  if (!dayStem) return null;

  const monthBranch = natal?.monthBranch;
  const dayBranch = natal?.branches?.[2]; // 일지
  const hourBranch = natal?.branches?.[3]; // 시지 (optional)
  const yearStem = annualResult?.facts?.find((f) => f.id === 'annual.year.stem')?.value;
  const yearBranch = annualResult?.facts?.find((f) => f.id === 'annual.year.branch')?.value;

  const tenGod = tenGodFor(dayStem, yearStem);
  const dayMasterHangul = STEM_HANGUL[dayStem];

  // 원국 지지와 연지의 관계
  const natalBranches = (natal?.branches || []).filter(Boolean);
  const branchRelations = natalBranches.map((nb) => ({
    natalBranch: nb,
    annualBranch: yearBranch,
    relation: relationBetween(yearBranch, nb),
  })).filter((r) => r.relation !== 'none');

  // 대운 정보 — 다음 대운의 startAge로 endAge를 유추
  const allCycles = daewoon?.cycles || [];
  const birthYear = natal?.input?.date ? Number(natal.input.date.slice(0, 4)) : null;
  const targetAge = birthYear ? targetYear - birthYear : null;
  let currentDaewoon = null;
  if (targetAge != null && allCycles.length > 0) {
    currentDaewoon = allCycles.find((c, i) => {
      const next = allCycles[i + 1];
      const endAge = next ? next.startAge : c.startAge + 10;
      return targetAge >= c.startAge && targetAge < endAge;
    });
  }

  const daewoonTenGod = currentDaewoon?.stem ? tenGodFor(dayStem, currentDaewoon.stem) : null;

  // 대운 지지 분석 (충·합·형·해 + 오행 생극)
  const dayMasterElement = ELEMENTS[dayStem];
  let daewoonBranchAnalysis = null;
  let daewoonAllCycles = null;
  if (currentDaewoon?.branch && natalBranches.length > 0) {
    daewoonBranchAnalysis = analyzeDaewoonBranch(currentDaewoon.branch, natalBranches, dayMasterElement);
  }
  if (allCycles.length > 0 && natalBranches.length > 0) {
    daewoonAllCycles = analyzeDaewoonCycles(allCycles, natalBranches, dayMasterElement);
  }

  // 대운×연운 교차 분석
  let daewoonAnnualCross = null;
  if (daewoonTenGod && tenGod) {
    daewoonAnnualCross = buildDaewoonAnnualCross(daewoonTenGod, tenGod);
  }

  return {
    dayStem,
    dayMasterHangul,
    monthBranch,
    monthBranchHangul: monthBranch ? BRANCH_HANGUL[monthBranch] : null,
    dayBranch,
    dayBranchHangul: dayBranch ? BRANCH_HANGUL[dayBranch] : null,
    hourBranch,
    hourBranchHangul: hourBranch ? BRANCH_HANGUL[hourBranch] : null,
    yearStem,
    yearBranch,
    yearStemHangul: yearStem ? STEM_HANGUL[yearStem] : null,
    yearBranchHangul: yearBranch ? BRANCH_HANGUL[yearBranch] : null,
    tenGod,
    branchRelations,
    daewoonPillar: currentDaewoon?.pillar || currentDaewoon?.text || null,
    daewoonBranch: currentDaewoon?.branch || null,
    daewoonTenGod,
    daewoonStartAge: currentDaewoon?.startAge || null,
    daewoonBranchAnalysis,
    daewoonAllCycles,
    daewoonAnnualCross,
    gender: natal?.input?.gender || null,
    birthYear: natal?.input?.date ? Number(natal.input.date.slice(0, 4)) : null,
    targetYear,
    age: natal?.input?.date ? targetYear - Number(natal.input.date.slice(0, 4)) : null,
  };
}

/**
 * 대운×연운 교차 분석
 * 현재 대운의 십신과 연운의 십신이 어떤 시너지/긴장을 만드는지 분석
 */
function buildDaewoonAnnualCross(daewoonTenGod, annualTenGod) {
  const SYNERGY = {
    // 같은 십신이 겹침 — 기운 강화
    same: '대운과 연운이 같은 기운 — 테마가 강하게 강조됩니다. 좋든 싫든 이 주제가 올해의 중심입니다.',
    // 생(生) 관계 — 지원과 성장
    generating: '대운이 연운을 돕는 구조 — 대운의 10년 테마가 올해 결실을 맺기 좋습니다.',
    // 극(剋) 관계 — 긴장과 충돌
    controlling: '대운과 연운이 충돌하는 구조 — 10년 방향과 올해의 기운이 다릅니다. 속도를 줄이고 점검하세요.',
  };

  // 십신 그룹 분류
  const RESOURCE = new Set(['정인', '편인']); // 인성
  const EXPRESSION = new Set(['식신', '상관']); // 식상
  const WEALTH = new Set(['정재', '편재']); // 재성
  const POWER = new Set(['정관', '편관']); // 관성
  const SELF = new Set(['비견', '겁재']); // 비겁

  // 생(生) 흐름: 인성 → 비겁 → 식상 → 재성 → 관성 → 인성
  const FLOWS = [
    { from: RESOURCE, to: SELF },
    { from: SELF, to: EXPRESSION },
    { from: EXPRESSION, to: WEALTH },
    { from: WEALTH, to: POWER },
    { from: POWER, to: RESOURCE },
  ];

  if (daewoonTenGod === annualTenGod) {
    return { type: 'same', daewoonTenGod, annualTenGod, effect: SYNERGY.same };
  }

  const dGroup = [RESOURCE, EXPRESSION, WEALTH, POWER, SELF].find((g) => g.has(daewoonTenGod));
  const aGroup = [RESOURCE, EXPRESSION, WEALTH, POWER, SELF].find((g) => g.has(annualTenGod));

  if (!dGroup || !aGroup) return null;

  if (dGroup === aGroup) {
    return { type: 'same', daewoonTenGod, annualTenGod, effect: '대운과 연운이 같은 에너지 그룹 — 주제가 강조됩니다.' };
  }

  // 생(生) 관계 확인
  const isGenerating = FLOWS.some((f) => f.from === dGroup && f.to === aGroup);
  const isControlling = FLOWS.some((f) => f.from === aGroup && f.to === dGroup);

  if (isGenerating) {
    return { type: 'generating', daewoonTenGod, annualTenGod, effect: SYNERGY.generating };
  }
  if (isControlling) {
    return { type: 'controlling', daewoonTenGod, annualTenGod, effect: SYNERGY.controlling };
  }
  return { type: 'neutral', daewoonTenGod, annualTenGod, effect: '대운과 연운이 다른 에너지 영역 — 균형을 잡는 시기입니다.' };
}

/**
 * 월지별 계절 모듈 (A2) — 규칙 기반 생성
 * 일간×월지의 계절적 특성을 텍스트로 생성
 */
function buildMonthModule(dayStem, monthBranch) {
  const seasonal = MONTH_BRANCH_SEASONAL[monthBranch];
  if (!seasonal) return null;
  const dmImage = DAY_MASTER_IMAGES[STEM_HANGUL[dayStem]];
  if (!dmImage) return null;

  const dmElement = ELEMENTS[dayStem];
  const monthElement = seasonal.element;
  const interaction = dmElement === monthElement ? '같은 기운이 겹침'
    : GENERATES[dmElement] === monthElement ? '생(生)을 받아 자라는'
    : CONTROLS[dmElement] === monthElement ? '내가 통제하는'
    : CONTROLS[monthElement] === dmElement ? '나를 극(剋)하는'
    : GENERATES[monthElement] === dmElement ? '내가 생(生)해 주는'
    : '다른 기운';

  return {
    season: seasonal.season,
    theme: `${dmImage.image}이(가) ${seasonal.season}을 만나는 출생 — ${seasonal.theme}`,
    elementInteraction: `${dmElement}일간이 ${monthElement}월지에서 태어남: ${interaction}`,
    seasonalNote: seasonal.theme,
    healthHint: seasonal.season === '봄' ? '간·담, 피로, 알레르기 주의'
      : seasonal.season === '여름' ? '심장·소장, 더위, 수분 부족 주의'
      : seasonal.season === '가을' ? '폐·대장, 호흡기, 피부 건조 주의'
      : '신장·방광, 수족냉증, 우울감 주의',
  };
}

/**
 * 대운 모듈 (A3) — 대운 십신 기반 테마
 */
function buildDaewoonModule(daewoonTenGod, daewoonPillar) {
  const THEMES = {
    '비견': { theme: '같은 기운이 흐르는 10년 — 자기 주장과 동료 관계가 테마', focus: '주도성, 경쟁, 자립', watch: '고집, 동료와의 충돌' },
    '겁재': { theme: '기운이 겹치는 10년 — 변동과 경쟁이 테마', focus: '유연함, 분담, 선택', watch: '기싸움, 자원 흩어짐' },
    '식신': { theme: '표현과 결과물이 피어나는 10년 — 창작과 완성이 테마', focus: '결과물, 건강, 안정', watch: '나태함, 과식' },
    '상관': { theme: '불편함을 개선하는 10년 — 비판과 혁신이 테마', focus: '제안, 개선, 표현', watch: '말실수, 과도한 비판' },
    '편재': { theme: '기회가 넓게 펼쳐지는 10년 — 탐색과 확장이 테마', focus: '기회, 연결, 현금흐름', watch: '과소비, 기회비용' },
    '정재': { theme: '안정과 운영이 테마인 10년 — 쌓고 지키는 시기', focus: '예산, 신뢰, 꾸준함', watch: '보수적 태도, 실험 회피' },
    '편관': { theme: '책임과 긴장감의 10년 — 압박 속 성장이 테마', focus: '책임, 집중, 대응', watch: '과로, 스트레스, 건강' },
    '정관': { theme: '기준과 신뢰를 쌓는 10년 — 안정적 성장이 테마', focus: '역할, 절차, 신뢰', watch: '경직성, 유연성 부족' },
    '편인': { theme: '생각과 직관이 깊어지는 10년 — 내면 성장이 테마', focus: '학습, 직관, 재해석', watch: '공상, 우울, 실행력 부족' },
    '정인': { theme: '배움과 지원의 10년 — 체계적 성장이 테마', focus: '문서, 자격, 지원', watch: '준비만 하고 실행 못 함' },
  };
  const t = THEMES[daewoonTenGod];
  if (!t) return null;
  return { daewoonPillar, daewoonTenGod, ...t };
}

/**
 * 충·합 수정사항 (A4)
 */
function buildInteractionModifiers(branchRelations) {
  const modifiers = [];
  for (const r of branchRelations) {
    if (r.relation === 'clash') {
      modifiers.push({
        type: 'clash',
        branch: `${BRANCH_HANGUL[r.natalBranch]} ↔ ${BRANCH_HANGUL[r.annualBranch]}`,
        effect: '변화와 긴장이 예상되는 자리입니다. 흔들림을 변화의 기회로 쓰세요.',
        addTo: ['overall', 'relationships'],
      });
    } else if (r.relation === 'harmony') {
      modifiers.push({
        type: 'harmony',
        branch: `${BRANCH_HANGUL[r.natalBranch]} ↔ ${BRANCH_HANGUL[r.annualBranch]}`,
        effect: '협력과 조화가 흐르는 자리입니다. 인연과 기회가 자연스럽게 맺습니다.',
        addTo: ['overall', 'relationships'],
      });
    }
  }
  return modifiers;
}

/**
 * 성별/연령 톤 조정
 */
function buildPersonalTone(pKey) {
  const tone = { ageGroup: null, lifecycleNote: null };
  if (pKey.age != null) {
    if (pKey.age < 30) tone.ageGroup = '청년기 — 방향 탐색과 시행착오가 자연스러운 시기';
    else if (pKey.age < 40) tone.ageGroup = '30대 — 자리 잡기와 성장의 본격적 시기';
    else if (pKey.age < 50) tone.ageGroup = '40대 — 황금기, 결실과 영향력이 커지는 시기';
    else if (pKey.age < 60) tone.ageGroup = '50대 — 정리와 다음 단계 준비의 시기';
    else tone.ageGroup = '60대 이상 — 지혜를 나누고 여유를 가지는 시기';
  }
  if (pKey.gender === 'female' && pKey.age >= 30 && pKey.age < 45) {
    tone.lifecycleNote = '가족과 커리어의 균형이 중요한 시기입니다. 자신을 돌보는 시간을 반드시 확보하세요.';
  } else if (pKey.gender === 'male' && pKey.age >= 35 && pKey.age < 55) {
    tone.lifecycleNote = '책임이 가장 무거운 시기입니다. 건강 관리와 스트레스 해소를 우선하세요.';
  }
  return tone;
}

/**
 * 메인: 개인화된 리딩 조합
 */
export function composePersonalizedReading(baseReading, pKey, readingStore) {
  if (!baseReading || !pKey) return baseReading;

  // DB 월지 모듈 우선, 없으면 규칙 기반 fallback
  let monthModule = null;
  let monthDbModules = null;
  if (pKey.monthBranch && readingStore?.getMonthModule) {
    const dmHangul = STEM_HANGUL[pKey.dayStem];
    const mbHangul = BRANCH_HANGUL[pKey.monthBranch];
    if (dmHangul && mbHangul) {
      const dbResult = readingStore.getMonthModule(dmHangul, mbHangul);
      if (dbResult?.modules?.length > 0) {
        monthDbModules = dbResult.modules;
        const seasonal = MONTH_BRANCH_SEASONAL[pKey.monthBranch];
        monthModule = {
          season: seasonal?.season || '',
          theme: dbResult.pattern.label,
          seasonalNote: dbResult.pattern.element_interaction,
          healthHint: dbResult.modules.find(m => m.domain_key === 'health')?.points?.[0] || '',
        };
      }
    }
  }
  if (!monthModule && pKey.monthBranch) {
    monthModule = buildMonthModule(pKey.dayStem, pKey.monthBranch);
  }

  const daewoonModule = pKey.daewoonTenGod ? buildDaewoonModule(pKey.daewoonTenGod, pKey.daewoonPillar) : null;
  const interactionMods = buildInteractionModifiers(pKey.branchRelations);
  const personalTone = buildPersonalTone(pKey);

  // 베이스 카드에 개인화 정보 주입
  const personalizedCards = baseReading.cards.map((card) => {
    const cardCopy = { ...card };
    // 충·합 수정사항 추가
    const relevantMods = interactionMods.filter((m) => m.addTo.includes(card.cardType));
    if (relevantMods.length > 0) {
      const modText = relevantMods.map((m) => `[${m.branch}] ${m.effect}`).join(' ');
      cardCopy.watch = `${cardCopy.watch} ${modText}`.trim();
    }
    // cover 카드에 월지/대운 정보 추가
    if (card.cardType === 'cover' && monthModule) {
      cardCopy.summary = `${cardCopy.summary} ${pKey.dayMasterHangul}일간이 ${monthModule.season}에 태어났습니다 — ${monthModule.seasonalNote}.`;
    }
    if (card.cardType === 'cover' && daewoonModule) {
      cardCopy.summary = `${cardCopy.summary} 현재 대운은 ${daewoonModule.daewoonPillar}(${daewoonModule.daewoonTenGod}) — ${daewoonModule.theme}.`;
    }
    return cardCopy;
  });

  // 도메인에 개인화 정보 주입
  const dayMasterElement = ELEMENTS[pKey.dayStem];
  const personalizedDomains = (baseReading.domains || []).map((domain) => {
    let domainCopy = { ...domain, points: [...(domain.points || [])] };

    // Deterministic enrichment: 색상·방향·숫자·장부·행동 주입
    if (dayMasterElement && pKey.tenGod) {
      domainCopy = enrichDomain(domainCopy, dayMasterElement, pKey.tenGod);
    }

    // DB 월지 모듈이 있으면 해당 도메인의 points를 DB에서 가져옴
    if (monthDbModules) {
      const dbDomain = monthDbModules.find(m => m.domain_key === domain.domain_key);
      if (dbDomain?.points?.length > 0) {
        domainCopy.points.push(...dbDomain.points);
        if (dbDomain.closing) domainCopy.closing = dbDomain.closing;
      }
    } else {
      // fallback: health에 월지 계절 건강 정보 추가
      if (domain.domain_key === 'health' && monthModule) {
        domainCopy.points.push(`태어난 계절(${monthModule.season}) 특성: ${monthModule.healthHint}`);
      }
    }

    // 대운 13도메인 풀이 주입 — 대운 십신에 맞춘 10년 주기 풀이
    // (career 도메인도 getDaewoonDomains에서 별도 풀이가 제공되므로 별도 주입 불필요)
    if (pKey.daewoonTenGod) {
      const daewoonDomainModules = getDaewoonDomains(pKey.daewoonTenGod);
      const dwDomain = daewoonDomainModules.find(m => m.domain_key === domain.domain_key);
      if (dwDomain?.points?.length > 0) {
        // 대운 풀이는 10년 주기 조언임을 명시
        const labeledPoints = dwDomain.points.map((p) => p.startsWith('[대운]') ? p : `[대운] ${p}`);
        domainCopy.points.push(...labeledPoints);
        if (dwDomain.closing) domainCopy.closing = `[대운] ${dwDomain.closing}`;
      }
    }

    // 대운 지지 분석 결과 주입
    if (pKey.daewoonBranchAnalysis && pKey.daewoonBranchAnalysis.length > 0) {
      const branchEffects = pKey.daewoonBranchAnalysis
        .flatMap((a) => a.interactions || [])
        .filter((i) => i.severity === 'strong' || i.severity === 'strong-positive' || i.severity === 'negative');
      if (branchEffects.length > 0) {
        const topEffect = branchEffects[0];
        if (domain.domain_key === 'relationships' && (topEffect.type === 'clash' || topEffect.type === 'punishment-full' || topEffect.type === 'punishment-partial')) {
          domainCopy.points.push(`대운 지지 ${topEffect.name}: ${topEffect.effect}`);
        }
        if (domain.domain_key === 'favorable' && (topEffect.type === 'six-harmony' || topEffect.type === 'three-harmony' || topEffect.type === 'three-harmony-partial')) {
          domainCopy.points.push(`대운 지지 ${topEffect.name}: ${topEffect.effect}`);
        }
      }
    }

    // 대운×연운 교차 분석 주입
    if (pKey.daewoonAnnualCross && domain.domain_key === 'must_do') {
      domainCopy.points.push(`대운×연운 교차: ${pKey.daewoonAnnualCross.effect}`);
    }

    // mindset에 연령대 정보 추가
    if (domain.domain_key === 'mindset' && personalTone.ageGroup) {
      domainCopy.points.push(`${personalTone.ageGroup}`);
      if (personalTone.lifecycleNote) domainCopy.points.push(personalTone.lifecycleNote);
    }

    // 중복 포인트 제거 (enrichment + DB module + fallback 간 겹침 방지)
    const seen = new Set();
    domainCopy.points = domainCopy.points.filter((p) => {
      const key = String(p).trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return domainCopy;
  });

  // 개인화 메타데이터
  const daewoonBranchSummary = pKey.daewoonAllCycles?.find((c) => c.cycleIndex === pKey.daewoonAllCycles?.findIndex((cc) => cc.branch === pKey.daewoonBranch))?.toneSummary || null;

  const personalization = {
    dayMaster: `${pKey.dayMasterHangul}(${pKey.dayStem})`,
    monthBranch: pKey.monthBranchHangul ? `${pKey.monthBranchHangul}(${pKey.monthBranch})` : null,
    monthModule: monthModule?.theme || null,
    daewoon: daewoonModule ? `${daewoonModule.daewoonPillar}(${daewoonModule.daewoonTenGod})` : null,
    daewoonTheme: daewoonModule?.theme || null,
    daewoonBranch: pKey.daewoonBranch ? `${BRANCH_HANGUL[pKey.daewoonBranch] || ''}(${pKey.daewoonBranch})` : null,
    daewoonBranchTone: daewoonBranchSummary,
    daewoonAnnualCross: pKey.daewoonAnnualCross ? { type: pKey.daewoonAnnualCross.type, effect: pKey.daewoonAnnualCross.effect } : null,
    daewoonCycleAnalysis: pKey.daewoonAllCycles || null,
    interactions: interactionMods.map((m) => ({ type: m.type, branch: m.branch })),
    ageGroup: personalTone.ageGroup,
    personalizationVersion: '2.0.0',
  };

  return {
    ...baseReading,
    cards: personalizedCards,
    domains: personalizedDomains,
    personalization,
  };
}
