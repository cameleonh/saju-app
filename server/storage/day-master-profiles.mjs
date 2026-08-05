// server/storage/day-master-profiles.mjs
// 10간 기조 프로파일 — 일간별 자연 이미지, 성향, 톤 가이드
// 리딩 텍스트 생성 시 일관된 톤을 유지하기 위한 참조

export const DAY_MASTER_PROFILES = Object.freeze({
  갑: {
    stem: '甲', hangul: '갑', element: '목', polarity: '양',
    image: '크고 곧은 나무, 소나무, 기둥',
    nature: '위로 뻗고 세우고 시작하는 힘',
    strengths: ['곧은 마음', '성장动力', '리더십', '시작하는 힘'],
    watchpoints: ['고집', '너무 곧으면 부러짐', '남의 손길 거부'],
    tone: '씨앗에서 큰나무로 자라듯, 단단한 중심을 세우고 위로 뻗어가는 톤',
    metaphor: '뿌리 깊은 나무가 봄비를 만나 한 단계 자라는 해',
    romance_hint: '곧은 마음에 진실한 인연이 닿는다',
    career_hint: '새로운 분야를 개척하거나 주도권을 잡는 데 유리',
    health_hint: '간·담, 근육·관절, 스트레스로 인한 목·어깨',
  },
  을: {
    stem: '乙', hangul: '을', element: '목', polarity: '음',
    image: '덩굴, 화초, 풀잎 — 유연하게 휘고 감고 오르는 나무',
    nature: '부드럽게 적응하고 감고 올라가는 힘',
    strengths: ['유연성', '적응력', '치유', '관계 맺기'],
    watchpoints: ['의존성', '흔들림', '남에게 기대기'],
    tone: '덩굴이 담장을 감듯, 부드럽지만 끈기 있게 자기 자리를 찾는 톤',
    metaphor: '따뜻한 봄볕에 덩굴이 뻗으며 새 길을 찾는 해',
    romance_hint: '부드러운 다정함이 인연을 끌어당긴다',
    career_hint: '협업과 조정, 디자인·교육·상담 분야에서 빛남',
    health_hint: '간·담, 피부, 호흡기, 감기·알레르기',
  },
  병: {
    stem: '丙', hangul: '병', element: '화', polarity: '양',
    image: '태양, 한낮의 불 — 만물을 두루 비추는 큰 빛',
    nature: '밝게 비추고 따뜻하게 만드는 힘',
    strengths: ['밝음', '열정', '포용력', '보여주는 힘'],
    watchpoints: ['너무 뜨거움', '겉만 번짐', '빨리 타버림'],
    tone: '태양이 구름을 헤치고 만물을 비추듯, 밝고 시원한 톤',
    metaphor: '태양이 떠오르 어둠을 걷고 새로운 빛이 닿는 해',
    romance_hint: '밝은 에너지와 따뜻한 시선이 인연을 부른다',
    career_hint: '보여주기, 발표, 마케팅, 공공성이 있는 일에 유리',
    health_hint: '심장·소장, 눈, 혈압, 화로 인한 피로',
  },
  정: {
    stem: '丁', hangul: '정', element: '화', polarity: '음',
    image: '촛불, 등불, 별 — 은은하게 타오르는 작은 불',
    nature: '정밀하게 밝히고 다듬고 살피는 힘',
    strengths: ['섬세함', '집중력', '관찰', '정밀함'],
    watchpoints: ['예민함', '쉽게 꺼짐', '신경 과민'],
    tone: '촛불이 어둠을 밝히듯, 조용하지만 정확하고 따뜻한 톤',
    metaphor: '등불이 길을 비추듯, 세밀하게 살피고 밝히는 해',
    romance_hint: '다정하고 섬세한 마음씨가 깊은 인연을 만든다',
    career_hint: '연구·기획·문서·IT 등 정밀한 작업에 유리',
    health_hint: '심장·소장, 눈, 불면, 신경성 질환',
  },
  무: {
    stem: '戊', hangul: '무', element: '토', polarity: '양',
    image: '산, 큰 둑, 벽 — 크고 묵직하고 방어하는 흙',
    nature: '버티고 막고 지키고 누르는 힘',
    strengths: ['신뢰', '묵직함', '인내', '방어력'],
    watchpoints: ['고집', '답답함', '움직임이 느림', '걱정·근심'],
    tone: '산이 버티듯, 묵직하고 든든하되 고집을 부드럽게 푸는 톤',
    metaphor: '산 같은 무토가 봄비를 만나 단단해지고 위상이 높아지는 해',
    romance_hint: '묵직한 신뢰가 진실한 인연을 부른다',
    career_hint: '관리·책임·건설·부동산·공공 분야에서 두각',
    health_hint: '비장·위, 근육·뼈, 소화기, 스트레스성 위염',
  },
  기: {
    stem: '己', hangul: '기', element: '토', polarity: '음',
    image: '밭, 정원, 비옥한 흙 — 기르고 품고 기르는 흙',
    nature: '품고 길러주고 배려하고 살피는 힘',
    strengths: ['포용력', '배려', '양육', '실용성'],
    watchpoints: ['걱정이 많음', '잡생각', '남을 위해 자신을 희생'],
    tone: '비옥한 밭이 씨앗을 품듯, 따뜻하게 품고 살피는 톤',
    metaphor: '밭이 씨앗을 받아들이듯, 기르고 가꾸는 일이 열매 맺는 해',
    romance_hint: '따뜻한 배려와 살핌이 깊은 관계를 만든다',
    career_hint: '교육·서비스·농업·식품·의료·돌봄 분야에 유리',
    health_hint: '비장·위, 소화기, 피부, 걱정으로 인한 위장 장애',
  },
  경: {
    stem: '庚', hangul: '경', element: '금', polarity: '양',
    image: '칼, 쇠, 도끼 — 베고 결단하고 단단히 세우는 쇠',
    nature: '결단하고 자르고 단단하게 만드는 힘',
    strengths: ['결단력', '의지', '실행력', '정의감'],
    watchpoints: ['너무 날카로움', '단절', '상처', '고집'],
    tone: '칼이 잡념을 베어내듯, 시원하고 단호하되 상처를 조심하는 톤',
    metaphor: '쇠가 불에 달궈져 날을 세우듯, 결단과 실행이 열매 맺는 해',
    romance_hint: '시원한 결단력과 의리가 인연을 지킨다',
    career_hint: '법·군인·경찰·금융·공학·IT 인프라에 유리',
    health_hint: '폐·대장, 호흡기, 피부, 큰 상처를 조심',
  },
  신: {
    stem: '辛', hangul: '신', element: '금', polarity: '음',
    image: '보석, 장신구, 바늘 — 빛나고 섬세하고 날카로운 쇠',
    nature: '다듬고 빛내고 정교하게 살피는 힘',
    strengths: ['섬세함', '미적 감각', '직관', '정밀함'],
    watchpoints: ['예민함', '쉽게 상처받음', '완벽주의'],
    tone: '보석이 빛을 받아 반짝이듯, 섬세하고 유려하되 예민함을 다스리는 톤',
    metaphor: '보석이 세공되어 빛을 발하듯, 정교한 다듬음이成果를 만드는 해',
    romance_hint: '섬세한 다정함과 안목이 좋은 인연을 가려낸다',
    career_hint: '예술·디자인·금융·보석·의료·기술 직무에 유리',
    health_hint: '폐·대장, 호흡기, 피부, 신경성 두통',
  },
  임: {
    stem: '壬', hangul: '임', element: '수', polarity: '양',
    image: '바다, 큰 강, 폭포 — 넓고 깊고 흐르는 큰 물',
    nature: '흐르고 퍼지고 자유롭게 움직이는 힘',
    strengths: ['자유로움', '포용력', '지혜', '유동성'],
    watchpoints: ['정착 어려움', '흩어짐', '감정 기복'],
    tone: '큰 강이 흐르듯, 시원하고 넓으되 흩어짐을 조이는 톤',
    metaphor: '강물이 흐르며 새 길을 만들듯, 넓은 시야와 이동이 열리는 해',
    romance_hint: '자유롭고 넓은 마음이 다양한 인연을 부른다',
    career_hint: '무역·미디어·유통·관광·IT·자유직에 유리',
    health_hint: '신장·방광, 비뇨기, 혈액순환, 수분 대사',
  },
  계: {
    stem: '癸', hangul: '계', element: '수', polarity: '음',
    image: '이슬, 빗물, 샘물 — 조용히 스며들고 촉촉하게 만드는 물',
    nature: '스며들고 적시고 조용히 살피는 힘',
    strengths: ['직관', '섬세함', '인내', '내면의 힘'],
    watchpoints: ['우울', '침체', '너무 안으로만 향함'],
    tone: '이슬이 새벽을 적시듯, 조용하고 부드러우데 침체를 걷어내는 톤',
    metaphor: '이슬이 마른 땅을 적시듯, 조용히 스며들어 만들어가는 해',
    romance_hint: '조용하고 깊은 마음이 닮은 인연을 끌어당긴다',
    career_hint: '연구·상담·문학·종교·치료·정보 분석에 유리',
    health_hint: '신장·방광, 비뇨기, 호르몬, 수면 부족',
  },
});

// 2024~2026 연도별 간지 + 지지 의미
export const YEAR_CONTEXTS = Object.freeze({
  2024: {
    pillar: '甲辰', stem: '甲', branch: '辰',
    stem_meaning: '갑(甲) — 큰 나무의 기운. 새로운 시작, 리더십, 성장',
    branch_meaning: '진(辰) — 늦봄의 습토. 변화의 문턱, 물을 품은 흙, 저장과 준비',
    label: '갑진년 — 큰 나무가 습한 흙에 뿌리를 내리며 자라는 해',
  },
  2025: {
    pillar: '乙巳', stem: '乙', branch: '巳',
    stem_meaning: '을(乙) — 덩굴의 기운. 유연함, 적응, 관계',
    branch_meaning: '사(巳) — 초여름의 불. 온기가 자라고 번성의 시작',
    label: '을사년 — 덩굴이 따뜻한 햇볕을 만나 뻗어가는 해',
  },
  2026: {
    pillar: '丙午', stem: '丙', branch: '午',
    stem_meaning: '병(丙) — 태양의 기운. 밝음, 열정, 두루 비춤',
    branch_meaning: '오(午) — 한여름의 불. 가장 뜨겁고 활동적인 시기',
    label: '병오년 — 한여름 태양이 만물을 뜨겁게 비추는 해',
  },
  2027: {
    pillar: '丁未', stem: '丁', branch: '未',
    stem_meaning: '정(丁) — 촛불·등불의 기운. 섬세함, 집중, 정밀함',
    branch_meaning: '미(未) — 여름의 마무리, 수확과 저장의 시작, 풍요로운 흙',
    label: '정미년 — 섬세한 불빛이 풍요로운 대지를 비추는 해',
  },
});

// 일간 × 연간 십신 계산 (한자 한 글자씩)
export function tenGodFor(dayStemChar, annualStemChar) {
  const ELEMENTS = { '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수' };
  const POLARITY = { '甲': '양', '乙': '음', '丙': '양', '丁': '음', '戊': '양', '己': '음', '庚': '양', '辛': '음', '壬': '양', '癸': '음' };
  const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
  const CONTROLS = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };
  const dayElement = ELEMENTS[dayStemChar];
  const annualElement = ELEMENTS[annualStemChar];
  if (!dayElement || !annualElement) return null;
  const samePolarity = POLARITY[dayStemChar] === POLARITY[annualStemChar];
  if (dayElement === annualElement) return samePolarity ? '비견' : '겁재';
  if (GENERATES[dayElement] === annualElement) return samePolarity ? '식신' : '상관';
  if (CONTROLS[dayElement] === annualElement) return samePolarity ? '편재' : '정재';
  if (CONTROLS[annualElement] === dayElement) return samePolarity ? '편관' : '정관';
  if (GENERATES[annualElement] === dayElement) return samePolarity ? '편인' : '정인';
  return null;
}

const STEM_HANGUL = { '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계' };
const BRANCH_HANGUL = { '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해' };

// 30패턴 (10간 × 3연도) 전체 목록
export function generatePatternMatrix() {
  const hangulStems = Object.keys(DAY_MASTER_PROFILES).filter((k) => k.length === 1);
  const years = [2024, 2025, 2026, 2027];
  const matrix = [];
  for (const hangul of hangulStems) {
    const profile = DAY_MASTER_PROFILES[hangul];
    for (const year of years) {
      const yctx = YEAR_CONTEXTS[year];
      const tenGod = tenGodFor(profile.stem, yctx.stem);
      const yearStemHangul = STEM_HANGUL[yctx.stem];
      const yearBranchHangul = BRANCH_HANGUL[yctx.branch];
      matrix.push({
        pattern_id: `${hangul}_${yearStemHangul}_${yearBranchHangul}`,
        day_master: hangul,
        day_stem_char: profile.stem,
        year_stem: yearStemHangul,
        year_branch: yearBranchHangul,
        target_year: year,
        ten_god: tenGod,
        year_label: yctx.label,
      });
    }
  }
  return matrix;
}
