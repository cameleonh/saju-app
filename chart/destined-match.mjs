// chart/destined-match.mjs
// 운명의 상대(보완하는 오행의 인연) 도메인 모델 및 매칭 엔진.
// 사주 명리학의 오행 상생(相生) 및 조후·억부 보완 원칙에 기반하여
// 내 명식의 불균형을 채워주는 최적의 인연 아키타입(Archetype)을 결정론(deterministic)적으로 도출합니다.

export const MATCH_ARCHETYPES = Object.freeze({
  목: Object.freeze({
    element: '목',
    elementHanja: '木',
    title: '싱그러운 봄바람 같은 목(木)의 인연',
    tagline: '맑고 다정한 눈빛으로 곁을 따스하게 지켜주는 사람',
    color: '#718d82',
    impressions: [
      '선하고 맑은 눈망울과 부드러운 인상',
      '자연스럽고 편안한 단정한 스타일',
      '맑고 싱그러운 미소가 매력적인 얼굴',
      '차분하면서도 지적인 기품 있는 분위기',
    ],
    personality: [
      '상대방의 감정을 세심하게 살피고 경청하는 배려심',
      '시간이 흐를수록 깊어지는 진솔함과 우직한 신뢰감',
      '함께 있을 때 마음의 긴장을 풀어주는 편안한 포용력',
    ],
    lifestyle: '조용한 산책과 푸른 자연, 책과 음악이 있는 여유로운 일상',
    seasonVenue: '늦봄의 햇살이 비추는 숲길이나 조용한 테라스 카페',
    synergy: '내 사주에 생기와 온화함을 불어넣어, 메마른 마음에 따뜻한 활력과 성장의 에너지를 더해줍니다.',
    avatarMale: 'images/matches/match_wood_male.svg',
    avatarFemale: 'images/matches/match_wood_female.svg',
  }),
  화: Object.freeze({
    element: '화',
    elementHanja: '火',
    title: '따뜻한 모닥불 같은 화(火)의 인연',
    tagline: '솔직하고 열정적인 에너지로 어둠을 밝혀주는 사람',
    color: '#b55f4b',
    impressions: [
      '이목구비가 또렷하고 화려하며 시원한 인상',
      '센스 있고 트렌디한 감각적인 패션 스타일',
      '환하게 웃을 때 주변까지 밝아지는 생동감',
      '자신감 넘치고 당당한 매력적인 눈빛',
    ],
    personality: [
      '마음을 솔직하고 투명하게 표현하는 직진형 성향',
      '위트와 센스가 넘쳐 함께하면 시간 가는 줄 모르는 즐거움',
      '어려운 순간에도 긍정의 에너지를 잃지 않는 든든한 낙천성',
    ],
    lifestyle: '새로운 핫플레이스 탐방, 예술 전시, 열정적인 취미 활동',
    seasonVenue: '여름날의 활기찬 야외 페스티벌이나 야경이 내려다보이는 루프탑',
    synergy: '내 사주의 차가운 기운을 녹이고 침체된 감정을 깨워, 언제나 설렘과 활기찬 용기를 선물합니다.',
    avatarMale: 'images/matches/match_fire_male.svg',
    avatarFemale: 'images/matches/match_fire_female.svg',
  }),
  토: Object.freeze({
    element: '토',
    elementHanja: '土',
    title: '포근하고 듬직한 대지 같은 토(土)의 인연',
    tagline: '흔들림 없는 신뢰와 포근함으로 나를 감싸주는 사람',
    color: '#b48b4e',
    impressions: [
      '단정하고 신뢰감을 주는 이목구비와 선한 눈매',
      '깔끔하고 클래식하며 편안한 베이직 스타일',
      '깊고 차분한 목소리와 안정감 있는 자세',
      '묵직하면서도 온화함이 감도는 푸근한 분위기',
    ],
    personality: [
      '말보다 행동으로 보여주는 우직한 책임감과 진정성',
      '사소한 약속도 소중히 기억하고 지키는 변함없는 마음',
      '어떤 고민도 묵묵히 품어주고 지지해 주는 깊은 인내심',
    ],
    lifestyle: '아늑한 집에서의 힐링, 맛있는 요리 나누기, 잔잔한 감성 여행',
    seasonVenue: '선선한 초가을의 고즈넉한 한옥 마을이나 따뜻한 조명의 레스토랑',
    synergy: '불안정하거나 급변하는 상황 속에서 단단한 뿌리가 되어주며, 지친 마음에 가장 편안한 안식처를 마련해 줍니다.',
    avatarMale: 'images/matches/match_earth_male.svg',
    avatarFemale: 'images/matches/match_earth_female.svg',
  }),
  금: Object.freeze({
    element: '금',
    elementHanja: '金',
    title: '단정하고 세련된 금(金)의 인연',
    tagline: '명확한 주관과 쿨한 의리로 서로를 성장시키는 사람',
    color: '#829096',
    impressions: [
      '날렵하고 깨끗한 턱선과 세련된 도시적 마스크',
      '각 잡힌 정갈한 핏과 모던하고 미니멀한 룩',
      '지적이고 정돈된 분위기, 시원시원한 눈매',
      '신뢰를 주는 똑 부러진 딕션과 맑은 아우라',
    ],
    personality: [
      '자기 관리가 철저하고 매사 분명한 기준과 결단력',
      '선입견 없이 솔직 담백하며 의리와 원칙을 지키는 태도',
      '불필요한 감정 소모 없이 핵심을 짚어주는 명쾌한 조언자',
    ],
    lifestyle: '운동과 자기계발, 깔끔하게 정돈된 공간, 감도 높은 브랜드 투어',
    seasonVenue: '가을바람 부는 도심의 감각적인 와인바나 모던한 건축물의 북카페',
    synergy: '흐트러지기 쉬운 생각과 목표를 깔끔하게 정돈해 주며, 함께할수록 더 멋진 사람으로 나아가게 하는 자극제가 됩니다.',
    avatarMale: 'images/matches/match_metal_male.svg',
    avatarFemale: 'images/matches/match_metal_female.svg',
  }),
  수: Object.freeze({
    element: '수',
    elementHanja: '水',
    title: '깊고 유연한 바다 같은 수(水)의 인연',
    tagline: '풍부한 감수성과 깊은 지혜로 영혼을 통하게 하는 사람',
    color: '#8589ae',
    impressions: [
      '깊고 촉촉한 눈망울과 몽환적이면서 매혹적인 분위기',
      '흐르듯 자연스럽고 감각적인 소프트 캐주얼 스타일',
      '신비롭고 유연하며 다정한 표정과 목소리',
      '보고 있으면 마음이 차분해지는 차분한 매력',
    ],
    personality: [
      '타인의 상처와 아픔을 본능적으로 공감하는 섬세함',
      '상황에 유연하게 대처하는 지혜와 넓은 시야',
      '깊은 대화를 나눌수록 끝없는 매력을 드러내는 내면의 깊이',
    ],
    lifestyle: '심야 드라이브, 바다와 강변 산책, 예술 영화 감상과 깊은 대화',
    seasonVenue: '겨울밤 눈 내리는 강변길이나 잔잔한 재즈 음악이 흐르는 라운지',
    synergy: '과열된 열기와 경직된 긴장을 유연하게 풀어주며, 보이지 않는 깊은 감정까지 온전히 어루만져 줍니다.',
    avatarMale: 'images/matches/match_water_male.svg',
    avatarFemale: 'images/matches/match_water_female.svg',
  }),
});

// 천간 합(合) 짝 매핑 — 갑기, 을경, 병신, 정임, 무계
const HEAVENLY_STEM_HARMONY = Object.freeze({
  '甲': { stem: '己', element: '토' },
  '乙': { stem: '庚', element: '금' },
  '丙': { stem: '辛', element: '금' },
  '丁': { stem: '壬', element: '수' },
  '戊': { stem: '癸', element: '수' },
  '己': { stem: '甲', element: '목' },
  '庚': { stem: '乙', element: '목' },
  '辛': { stem: '丙', element: '화' },
  '壬': { stem: '丁', element: '화' },
  '癸': { stem: '戊', element: '토' },
});

// 일간 상생 관계
const DAY_STEM_ELEMENT = Object.freeze({
  '甲': '목', '乙': '목',
  '丙': '화', '丁': '화',
  '戊': '토', '己': '토',
  '庚': '금', '辛': '금',
  '壬': '수', '癸': '수',
});

/**
 * 명식 데이터를 바탕으로 내 사주를 보완하는 운명의 인연 아키타입을 계산합니다.
 * @param {object} chart 계산된 명식 객체 (pillars, dayStem 등)
 * @returns {object} 운명의 인연 분석 결과
 */
export function deriveDestinedMatch(chart) {
  if (!chart || !Array.isArray(chart.pillars)) {
    return {
      element: '목',
      archetype: MATCH_ARCHETYPES['목'],
      reason: '기본 보완 오행인 목(木)의 생명력을 권장합니다.',
      dayStem: '甲',
    };
  }

  const dayStem = chart.pillars[2]?.stem || '甲';
  const myElement = DAY_STEM_ELEMENT[dayStem] || '목';

  // 1. 오행 분포 계산
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  chart.pillars.forEach((p) => {
    if (p.element && counts[p.element] !== undefined) counts[p.element] += 1;
    if (p.branchElement && counts[p.branchElement] !== undefined) counts[p.branchElement] += 1;
  });

  // 2. 결핍(0개) 및 최저 오행 탐색
  const elements = ['목', '화', '토', '금', '수'];
  const missingElements = elements.filter((e) => counts[e] === 0);

  let targetElement = '목';
  let reason = '';

  const stemHarmony = HEAVENLY_STEM_HARMONY[dayStem];

  if (missingElements.length > 0) {
    // 결핍된 오행 중 천간합 오행이 있다면 최우선
    if (stemHarmony && missingElements.includes(stemHarmony.element)) {
      targetElement = stemHarmony.element;
      reason = `사주 원국에 결핍된 ${targetElement}(${MATCH_ARCHETYPES[targetElement].elementHanja}) 기운을 보완하며 일간(${dayStem})과 천간합을 이루는 완벽한 조화의 인연입니다.`;
    } else {
      targetElement = missingElements[0];
      reason = `사주 원국에 부족한 ${targetElement}(${MATCH_ARCHETYPES[targetElement].elementHanja}) 기운을 채워주어 오행의 균형을 완성하는 상생의 인연입니다.`;
    }
  } else {
    // 모든 오행이 존재할 경우: 일간과 천간합을 이루는 오행 또는 가장 세력이 약한 오행
    const sorted = [...elements].sort((a, b) => counts[a] - counts[b]);
    if (stemHarmony && counts[stemHarmony.element] <= 2) {
      targetElement = stemHarmony.element;
      reason = `일간(${dayStem})과 음양의 조화를 이루는 ${targetElement}(${MATCH_ARCHETYPES[targetElement].elementHanja})의 기운으로 깊은 유대감을 형성하는 인연입니다.`;
    } else {
      targetElement = sorted[0];
      reason = `원국에서 가장 희소한 ${targetElement}(${MATCH_ARCHETYPES[targetElement].elementHanja}) 기운을 지닌 상대로, 나에게 새로운 시야와 활기를 더해주는 인연입니다.`;
    }
  }

  const archetype = MATCH_ARCHETYPES[targetElement] || MATCH_ARCHETYPES['목'];

  return {
    dayStem,
    myElement,
    targetElement,
    reason,
    archetype,
    elementCounts: counts,
  };
}
