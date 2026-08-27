// chart/couple-compatibility.mjs
// 아시아 4대 전통(한국 사주, 미얀마 마하보테, 태국 호라삿, 베트남 뜨비) 커플 궁합 계산 엔진.
// 두 사람의 생년월일시를 바탕으로 각 전통의 고유 수리역학에 따른 1:1 관계 조화를 결정론적으로 계산합니다.

import { calculateNatalChart } from './natal-engine.mjs';
import { calculateMahabote } from './mahabote-engine.mjs';
import { calculateHorasat } from './horasat-engine.mjs';
import { calculateTuVi } from './tu-vi-engine.mjs';

export const COUPLE_POLICY = Object.freeze({
  id: 'ASIAN-COUPLE-4SYS-1.0',
  version: '1.0.0',
  name: '아시아 4대 전통 다각도 인연·궁합 간이 모형(β)',
  source: '한국 사주 오행 관계는 검증된 정책 기반. 마하보테·호라삿·뜨비 기반 궁합 산출은 원전 대조 검증 전인 간이 규칙(참고용)',
});

// 1. 한국 사주 오행 상생/상극 맵
const GENERATIVE_PAIRS = {
  목: '화',
  화: '토',
  토: '금',
  금: '수',
  수: '목',
};

const CONTROLLING_PAIRS = {
  목: '토',
  토: '수',
  수: '화',
  화: '금',
  금: '목',
};

const BRANCH_SIX_HARMONY = [
  ['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미'],
];

const BRANCH_THREE_HARMONY = [
  ['해', '묘', '미'], // 목국
  ['인', '오', '술'], // 화국
  ['사', '유', '축'], // 금국
  ['신', '자', '진'], // 수국
];

const BRANCH_CLASHES = [
  ['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해'],
];

// natal-engine의 일주는 { stem:'戊', element:'토', branch:'申' } 문자열 형태로 반환된다.
// 궁합 산출은 일간 오행(pillar.element)과 일지 한글명으로 읽는다.
const HANJA_TO_HANGUL_BRANCH = { 子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사', 午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해' };

function analyzeSajuCouple(chartA, chartB) {
  const dayPillarA = Array.isArray(chartA.pillars) ? chartA.pillars[2] : (chartA.pillars?.day || chartA.pillars?.[2]);
  const dayPillarB = Array.isArray(chartB.pillars) ? chartB.pillars[2] : (chartB.pillars?.day || chartB.pillars?.[2]);
  const elemA = dayPillarA?.element || dayPillarA?.stem?.element || '목';
  const elemB = dayPillarB?.element || dayPillarB?.stem?.element || '목';
  const branchA = HANJA_TO_HANGUL_BRANCH[dayPillarA?.branch] || dayPillarA?.branch?.hangul || '자';
  const branchB = HANJA_TO_HANGUL_BRANCH[dayPillarB?.branch] || dayPillarB?.branch?.hangul || '자';

  let stemSynergy = '';
  let stemDetail = '';
  if (elemA === elemB) {
    stemSynergy = '친구 같은 동지적 화합 (비견/겁재)';
    stemDetail = `두 사람 모두 ${elemA}(${dayPillarA?.stem?.hanja || ''})의 기운을 공유하여, 깊은 공감대와 가치관의 일치를 이룹니다.`;
  } else if (GENERATIVE_PAIRS[elemA] === elemB || GENERATIVE_PAIRS[elemB] === elemA) {
    stemSynergy = '서로를 북돋우는 상생의 결합 (상생/相生)';
    stemDetail = `${elemA}와 ${elemB}의 기운이 만나 자연스럽게 서로의 역량을 키워주고 지친 마음을 채워주는 선순환을 이룹니다.`;
  } else {
    stemSynergy = '다름을 통해 보완하는 성장 인연 (상극/相克)';
    stemDetail = `${elemA}와 ${elemB}의 서로 다른 관점이 상대를 자극하여 시야를 넓혀주고 삶의 균형을 잡아줍니다.`;
  }

  let branchSynergy = '서로의 개성을 존중하는 안정적 관계';
  const isSixHarmony = BRANCH_SIX_HARMONY.some(([x, y]) => (x === branchA && y === branchB) || (x === branchB && y === branchA));
  const isThreeHarmony = BRANCH_THREE_HARMONY.some((group) => group.includes(branchA) && group.includes(branchB));
  const isClash = BRANCH_CLASHES.some(([x, y]) => (x === branchA && y === branchB) || (x === branchB && y === branchA));

  if (isSixHarmony) {
    branchSynergy = '마음과 생활 습관이 끈끈하게 들어맞는 육합(六合)의 조화';
  } else if (isThreeHarmony) {
    branchSynergy = '함께 큰 꿈을 향해 나아가는 삼합(三合)의 시너지';
  } else if (isClash) {
    branchSynergy = '강한 긴장감과 설렘이 공존하며 서로를 단련시키는 역동적 인연';
  }

  return {
    system: '한국 사주',
    flag: '🇰🇷',
    stemSynergy,
    stemDetail,
    branchSynergy,
    summary: `${stemSynergy}으로 본질이 통하며, 일지의 교감이 ${branchSynergy}를 만듭니다.`,
  };
}

// 2. 미얀마 마하보테 요일 수호령 궁합
// 전통 마하보테 친화 요일 그룹 (Mittā / Ranna)
const MAHABOTE_FRIEND_PAIRS = [
  [0, 4], // 일(가루다) + 목(쥐)
  [1, 5], // 월(호랑이) + 금(기니피그)
  [2, 0], // 화(사자) + 일(가루다)
  [3, 6], // 수(코끼리) + 토(용)
  [4, 1], // 목(쥐) + 월(호랑이)
  [5, 2], // 금(기니피그) + 화(사자)
  [6, 3], // 토(용) + 수(코끼리)
];

function analyzeMahaboteCouple(mahaA, mahaB) {
  const dayIdxA = mahaA.birthDay.dayIndex;
  const dayIdxB = mahaB.birthDay.dayIndex;
  const isFriend = MAHABOTE_FRIEND_PAIRS.some(([a, b]) => (a === dayIdxA && b === dayIdxB) || (a === dayIdxB && b === dayIdxA));
  const isSame = dayIdxA === dayIdxB;

  let animalSynergy = '';
  let advice = '';
  if (isFriend) {
    animalSynergy = '미얀마 전통 수호령의 최상 우호 관계 (Mittā)';
    advice = `${mahaA.birthDay.animal}와 ${mahaB.birthDay.animal}가 만나 서로에게 든든한 방패와 행운의 조력자가 되어줍니다.`;
  } else if (isSame) {
    animalSynergy = '같은 수호 동물의 거울 같은 이해';
    advice = `둘 다 ${mahaA.birthDay.animal}의 영혼을 지녀 서로의 마음과 행동 패턴을 말하지 않아도 직관적으로 압니다.`;
  } else {
    animalSynergy = '서로 다른 방위와 에너지를 융합하는 조화';
    advice = `${mahaA.birthDay.direction}의 ${mahaA.birthDay.animal}와 ${mahaB.birthDay.direction}의 ${mahaB.birthDay.animal}가 만나 삶의 사각지대를 서로 보완해 줍니다.`;
  }

  return {
    system: '미얀마 마하보테',
    flag: '🇲🇲',
    animalPair: `${mahaA.birthDay.animal} × ${mahaB.birthDay.animal}`,
    animalSynergy,
    advice,
    summary: `${mahaA.birthDay.korean}과 ${mahaB.birthDay.korean}의 수호령이 만나 '${animalSynergy}'를 형성합니다.`,
  };
}

// 3. 태국 호라삿 라시 & 원소 궁합
const RASI_ELEMENTS = {
  mesha: '화', vrishabha: '토', mithuna: '풍', karka: '수',
  simha: '화', kanya: '토', tula: '풍', vrishchika: '수',
  dhanu: '화', makara: '토', kumbha: '풍', meena: '수',
};

function analyzeHorasatCouple(horaA, horaB) {
  const elemA = RASI_ELEMENTS[horaA.rasi.id] || '화';
  const elemB = RASI_ELEMENTS[horaB.rasi.id] || '화';

  let rasiSynergy = '';
  let harmonyTone = '';
  if (elemA === elemB) {
    rasiSynergy = `같은 ${elemA}(${elemA === '화' ? 'Fire' : elemA === '토' ? 'Earth' : elemA === '풍' ? 'Air' : 'Water'}) 원소의 완벽한 공명 (Sam-samak)`;
    harmonyTone = '정서적 리듬과 세상을 바라보는 눈높이가 같아 함께할 때 안정감이 극대화됩니다.';
  } else if ((elemA === '화' && elemB === '풍') || (elemA === '풍' && elemB === '화')) {
    rasiSynergy = '불과 바람의 역동적인 촉진 관계 (Fire & Air)';
    harmonyTone = '바람이 불꽃을 활활 타오르게 하듯, 대화와 아이디어가 끊임없이 꽃피는 활기찬 인연입니다.';
  } else if ((elemA === '토' && elemB === '수') || (elemA === '수' && elemB === '토')) {
    rasiSynergy = '흙과 물의 비옥한 생명 결합 (Earth & Water)';
    harmonyTone = '물이 대지를 촉촉하게 적셔 꽃을 피우듯, 정서적 안정과 현실적 안락함을 동시에 일구는 배합입니다.';
  } else {
    rasiSynergy = '서로 다른 원소가 빚어내는 다채로운 화학 작용';
    harmonyTone = '서로의 다른 매력에 신선한 자극을 받으며 함께 새로운 시야를 열어가는 관계입니다.';
  }

  return {
    system: '태국 호라삿',
    flag: '🇹🇭',
    rasiPair: `${horaA.rasi.name} × ${horaB.rasi.name}`,
    rasiSynergy,
    harmonyTone,
    colorPair: `${horaA.birthDay.color} × ${horaB.birthDay.color}`,
    summary: `${horaA.rasi.name}와 ${horaB.rasi.name}가 만나 '${rasiSynergy}'를 이룹니다.`,
  };
}

// 4. 베트남 뜨비 명궁 & 주성 배합
function analyzeTuViCouple(tuviA, tuviB) {
  const starA = tuviA.menhPalace.primaryStar.name;
  const starB = tuviB.menhPalace.primaryStar.name;
  const cucA = tuviA.cuc.name;
  const cucB = tuviB.cuc.name;

  let starSynergy = '서로의 장점을 존중하고 역량을 북돋우는 조화';
  if ((starA.includes('Tử Vi') && starB.includes('Thiên Phủ')) || (starB.includes('Tử Vi') && starA.includes('Thiên Phủ'))) {
    starSynergy = '제왕(Tử Vi)과 국고(Thiên Phủ)의 최고의 권위와 안정 결합';
  } else if ((starA.includes('Thái Dương') && starB.includes('Thái Âm')) || (starB.includes('Thái Dương') && starA.includes('Thái Âm'))) {
    starSynergy = '태양(Thái Dương)과 태음(Thái Âm)의 완벽한 음양 합일';
  } else if ((starA.includes('Thiên Cơ') && starB.includes('Thiên Đồng')) || (starB.includes('Thiên Cơ') && starA.includes('Thiên Đồng'))) {
    starSynergy = '지혜(Thiên Cơ)와 순수(Thiên Đồng)의 맑고 깊은 영혼의 교감';
  }

  return {
    system: '베트남 뜨비',
    flag: '🇻🇳',
    starPair: `${starA} × ${starB}`,
    cucPair: `${cucA} × ${cucB}`,
    starSynergy,
    summary: `명궁의 주성 ${starA}와 ${starB}가 만나 '${starSynergy}'를 완성합니다.`,
  };
}

/**
 * 두 사람의 입력 프로필로 아시아 4대 전통 다각도 궁합을 계산합니다.
 * @param {object} input { personA: { name, date, time, unknownTime }, personB: { name, date, time, unknownTime } }
 * @returns {object} 계산된 궁합 종합 분석 객체
 */
export function calculateFourSystemCompatibility(input = {}) {
  const pA = input.personA || {};
  const pB = input.personB || {};

  if (!pA.date || !pB.date) {
    throw new Error('궁합 계산을 위해 두 사람의 생년월일(YYYY-MM-DD)이 모두 필요합니다.');
  }

  const sajuA = calculateNatalChart(pA);
  const sajuB = calculateNatalChart(pB);
  const mahaA = calculateMahabote(pA);
  const mahaB = calculateMahabote(pB);
  const horaA = calculateHorasat(pA);
  const horaB = calculateHorasat(pB);
  const tuviA = calculateTuVi(pA);
  const tuviB = calculateTuVi(pB);

  const sajuComp = analyzeSajuCouple(sajuA, sajuB);
  const mahaComp = analyzeMahaboteCouple(mahaA, mahaB);
  const horaComp = analyzeHorasatCouple(horaA, horaB);
  const tuviComp = analyzeTuViCouple(tuviA, tuviB);

  const nameA = pA.name || '첫 번째 분';
  const nameB = pB.name || '두 번째 분';

  return {
    policy: COUPLE_POLICY,
    personA: { name: nameA, date: pA.date, saju: sajuA, mahabote: mahaA, horasat: horaA, tuVi: tuviA },
    personB: { name: nameB, date: pB.date, saju: sajuB, mahabote: mahaB, horasat: horaB, tuVi: tuviB },
    saju: sajuComp,
    mahabote: mahaComp,
    horasat: horaComp,
    tuVi: tuviComp,
    synthesis: {
      title: `${nameA}님과 ${nameB}님의 4대 전통 인연 조화`,
      headline: `${sajuComp.stemSynergy} × ${horaComp.rasiSynergy}`,
      coreMessage: `두 분은 한국 사주의 ${sajuComp.stemSynergy}을 바탕으로 깊은 신뢰를 쌓으며, 미얀마 마하보테의 ${mahaComp.animalPair} 조화와 태국 호라삿의 ${horaComp.rasiSynergy}가 더해져 일상과 미래 설계 모두에서 강력한 시너지를 발휘하는 인연입니다.`,
      advice: '서로의 강점은 아낌없이 칭찬하고, 서로 다른 템포와 표현 방식은 다정하게 존중해 줄 때 두 분의 복락이 더욱 크게 번창합니다.',
    },
  };
}
