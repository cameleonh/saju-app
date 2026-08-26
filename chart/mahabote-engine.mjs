// chart/mahabote-engine.mjs
// 미얀마 전통 수리점성학 마하보테(Mahabote, မဟာဘုတ်) 계산 엔진.
// 서기 연도를 미얀마력(Burmese Era, BE = CE - 638)으로 환산하여
// 7대 하우스(Gha)와 8개 탄생 요일(Ne) 및 수호 동물·행성을 결정론(deterministic)적으로 계산합니다.

export const MAHABOTE_POLICY = Object.freeze({
  id: 'MM-MAHABOTE-1.0',
  version: '1.0.0',
  name: '미얀마 마하보테 정통 8요일 7하우스 수리역학',
  source: 'Traditional Burmese Mahabote Chart Rules (Myanmar Standard Astronomical Calculation)',
});

// 8개 요일 (수요일은 정오 12시 기준으로 오전/오후 분리)
export const MAHABOTE_DAYS = Object.freeze([
  {
    id: 'sun',
    dayIndex: 0,
    korean: '일요일',
    burmese: 'တနင်္ဂနွေ (Tanin-ganwe)',
    planet: '태양 (Sun)',
    element: '화 (Fire)',
    animal: '가루다 (금시조 / Garuda)',
    direction: '북동쪽 (North-East)',
    keywords: ['지도력', '명예', '밝은 열정', '당당함'],
    character: '태양의 밝은 빛처럼 자신감이 넘치고 명예를 중시하며, 주변을 이끄는 당당한 기품이 있습니다.',
  },
  {
    id: 'mon',
    dayIndex: 1,
    korean: '월요일',
    burmese: 'တနင်္လာ (Tanin-la)',
    planet: '달 (Moon)',
    element: '수 (Water)',
    animal: '호랑이 (Tiger)',
    direction: '동쪽 (East)',
    keywords: ['감수성', '용기', '직관력', '섬세함'],
    character: '달의 부드러움과 호랑이의 민첩한 용기를 동시에 지녀, 섬세하면서도 결정적 순간에 과감합니다.',
  },
  {
    id: 'tue',
    dayIndex: 2,
    korean: '화요일',
    burmese: 'အင်္ဂါ (Inga)',
    planet: '화성 (Mars)',
    element: '화 (Fire)',
    animal: '사자 (Lion)',
    direction: '남동쪽 (South-East)',
    keywords: ['추진력', '열정', '솔직함', '정의감'],
    character: '사자의 용맹함과 화성의 역동성을 품고 있어, 목표를 향해 거침없이 전진하는 솔직담백한 성향입니다.',
  },
  {
    id: 'wed_am',
    dayIndex: 3,
    subDay: 'am',
    korean: '수요일 오전',
    burmese: 'ဗုဒ္ဓဟူး (Boddahu)',
    planet: '수성 (Mercury)',
    element: '목 (Wood)',
    animal: '엄니 있는 코끼리 (Tusked Elephant)',
    direction: '남쪽 (South)',
    keywords: ['지혜', '소통', '총명함', '적응력'],
    character: '수성의 총명함과 엄니 코끼리의 지혜를 지녀, 상황 파악이 빠르고 언변과 지적 호기심이 뛰어납니다.',
  },
  {
    id: 'wed_pm',
    dayIndex: 3,
    subDay: 'pm',
    korean: '수요일 오후 (라후)',
    burmese: 'ရာဟု (Rahu)',
    planet: '라후 (Rahu / 암흑성)',
    element: '토 (Earth)',
    animal: '엄니 없는 코끼리 (Tuskless Elephant)',
    direction: '북서쪽 (North-West)',
    keywords: ['독창성', '신비로움', '인내심', '직관'],
    character: '라후의 깊은 통찰력과 온순한 코끼리의 끈기를 지녀, 남들이 보지 못하는 이면을 꿰뚫는 독창성이 있습니다.',
  },
  {
    id: 'thu',
    dayIndex: 4,
    korean: '목요일',
    burmese: 'ကြာသပတေး (Kyathabade)',
    planet: '목성 (Jupiter)',
    element: '목 (Wood)',
    animal: '쥐 (Rat)',
    direction: '서쪽 (West)',
    keywords: ['성실함', '신뢰', '풍요', '배움'],
    character: '목성의 관대함과 쥐의 부지런함을 품어, 꾸준히 지식과 자산을 쌓아가며 두터운 신뢰를 받습니다.',
  },
  {
    id: 'fri',
    dayIndex: 5,
    korean: '금요일',
    burmese: 'သောကြာ (Thawka)',
    planet: '금성 (Venus)',
    element: '금 (Metal)',
    animal: '기니피그 (Guinea Pig)',
    direction: '북쪽 (North)',
    keywords: ['예술성', '매력', '화합', '다정함'],
    character: '금성의 우아함과 기니피그의 사랑스러움을 지녀, 대인관계가 원만하고 미적 감각과 감수성이 풍부합니다.',
  },
  {
    id: 'sat',
    dayIndex: 6,
    korean: '토요일',
    burmese: 'စနေ (Sane)',
    planet: '토성 (Saturn)',
    element: '토 (Earth)',
    animal: '나기 / 용 (Naga / Dragon)',
    direction: '남서쪽 (South-West)',
    keywords: ['인내', '책임감', '신중함', '불굴의 의지'],
    character: '토성의 묵직함과 용(Naga)의 신비로운 힘을 지녀, 어려운 역경 속에서도 끝내 결실을 맺는 끈기가 있습니다.',
  },
]);

// 7대 하우스 (Gha) 정의
export const MAHABOTE_HOUSES = Object.freeze([
  {
    houseIndex: 0,
    name: 'Binga (빙가)',
    burmese: 'ဘင်္ဂ',
    meaning: '불안정과 극복의 자리',
    theme: '변화무쌍함 속에서 스스로 길을 개척하는 독립적인 개척자의 기운',
    advice: '안정에 안주하기보다 새로운 도전과 환경 변화 속에서 잠재력이 폭발합니다.',
    nature: 'challenging',
  },
  {
    houseIndex: 1,
    name: 'Atun (아툰)',
    burmese: 'အထွန်း',
    meaning: '명예와 인기의 자리',
    theme: '주변 사람들에게 인정받고 이름을 널리 알리는 빛나는 성취의 기운',
    advice: '사람들과의 따뜻한 유대와 공적 활동에서 큰 기회와 행운을 얻습니다.',
    nature: 'favorable',
  },
  {
    houseIndex: 2,
    name: 'Yaza (야자)',
    burmese: 'ရာဇ',
    meaning: '왕과 지도자의 자리',
    theme: '조직이나 집단에서 중심을 잡고 이끄는 공적 권위와 리더십의 기운',
    advice: '책임감 있는 결정과 공정한 원칙을 지킬 때 존경과 높은 지위에 오릅니다.',
    nature: 'favorable',
  },
  {
    houseIndex: 3,
    name: 'Adipati (아디파티)',
    burmese: 'အဓိပတိ',
    meaning: '최고 권력과 지배의 자리',
    theme: '스스로 주도권을 잡고 큰 그림을 완성하는 강한 통솔력과 승리의 기운',
    advice: '남의 의견에 끌려다니지 않고 자신의 확고한 비전으로 밀고 나갈 때 대성합니다.',
    nature: 'favorable',
  },
  {
    houseIndex: 4,
    name: 'Marana (마라나)',
    burmese: 'မရဏ',
    meaning: '단절과 재생의 자리',
    theme: '묵은 것을 과감히 버리고 새롭게 다시 태어나는 탈바꿈의 기운',
    advice: '과거의 실패나 집착을 비우고 유연하게 내려놓을 때 새로운 도약이 열립니다.',
    nature: 'challenging',
  },
  {
    houseIndex: 5,
    name: 'Thike (타이크)',
    burmese: 'သိုက်',
    meaning: '재물과 풍요의 자리',
    theme: '물질적 자산과 실리를 단단하게 모으고 불려 나가는 풍요의 기운',
    advice: '성실한 자산 관리와 현실적인 안목을 발휘할 때 가장 큰 번영을 누립니다.',
    nature: 'favorable',
  },
  {
    houseIndex: 6,
    name: 'Puti (푸티)',
    burmese: 'ပုတိ',
    meaning: '성찰과 내면의 자리',
    theme: '겉으로 드러나지 않는 깊은 내면의 가치와 철학을 탐구하는 기운',
    advice: '외적인 경쟁보다 내면의 실력과 영적 성장에 집중할 때 흔들리지 않는 평온을 얻습니다.',
    nature: 'neutral',
  },
]);

// 마하보테 기본 하우스 배치 매트릭스
// Akar (MY % 7)에 따른 하우스별 요일 순서 (0:Sun, 1:Mon, 2:Tue, 3:Wed, 4:Thu, 5:Fri, 6:Sat)
const HOUSE_ORDER_SEQUENCE = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

/**
 * 주어진 날짜와 시각으로 미얀마 마하보테 차트를 계산합니다.
 * @param {object} input { date: 'YYYY-MM-DD', time: 'HH:MM', unknownTime: boolean }
 * @returns {object} 계산된 마하보테 결과 객체
 */
export function calculateMahabote(input = {}) {
  const dateStr = String(input.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('마하보테 계산을 위해 유효한 출생일(YYYY-MM-DD)이 필요합니다.');
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  const rawDayOfWeek = birthDate.getUTCDay(); // 0: Sun, 1: Mon, ..., 6: Sat

  // 수요일의 경우 오전(00:00~12:00)과 오후(12:00~24:00 라후) 분리
  const timeStr = String(input.time || '12:00');
  const [hours] = timeStr.split(':').map(Number);
  const isWednesdayPm = rawDayOfWeek === 3 && (hours >= 12 && !input.unknownTime);

  let weekdayItem = MAHABOTE_DAYS.find((d) => d.dayIndex === rawDayOfWeek && (!d.subDay || (d.subDay === (isWednesdayPm ? 'pm' : 'am'))));
  if (!weekdayItem) weekdayItem = MAHABOTE_DAYS[0];

  // 미얀마력 연도 계산 (Burmese Era)
  // 전통적으로 미얀마 띤잔(Thingyan, 양력 4월 16~17일경) 기준으로 새해가 시작되나,
  // 표준 수리역학에서는 서기 연도 - 638년 환산을 기본으로 합니다.
  const burmeseYear = month < 4 || (month === 4 && day < 16) ? year - 639 : year - 638;
  const akar = ((burmeseYear % 7) + 7) % 7; // 0 to 6

  // 7개 하우스에 각 요일 행성 배치
  // Akar에 따라 Binga(하우스 0)에 들어갈 시작 요일 인덱스 결정
  // 규칙: Akar 값에 해당하는 요일이 Binga 하우스에 배속되고 순차적으로 회전
  const housePlacements = [];
  for (let hIndex = 0; hIndex < 7; hIndex++) {
    const dayIndexInHouse = (akar + hIndex) % 7;
    const matchedDay = MAHABOTE_DAYS.find((d) => d.dayIndex === dayIndexInHouse && (!d.subDay || d.subDay === 'am'));
    housePlacements.push({
      house: MAHABOTE_HOUSES[hIndex],
      assignedDay: matchedDay,
    });
  }

  // 본인의 탄생 요일이 위치한 하우스 찾기
  // (수요일 오후 라후도 7하우스 수리역학 상 수요일 자리 매핑)
  const myHousePlacementIndex = housePlacements.findIndex((p) => p.assignedDay.dayIndex === rawDayOfWeek);
  const myHouse = myHousePlacementIndex >= 0 ? MAHABOTE_HOUSES[myHousePlacementIndex] : MAHABOTE_HOUSES[0];

  return {
    policy: MAHABOTE_POLICY,
    burmeseYear,
    akar,
    birthDay: weekdayItem,
    rulingHouse: myHouse,
    houseIndex: myHouse.houseIndex,
    housePlacements,
    summary: `${weekdayItem.korean} ${weekdayItem.animal}의 기운을 타고났으며, 인생의 핵심 기운이 ${myHouse.name}(${myHouse.meaning})에 머뭅니다.`,
  };
}

/**
 * 특정 연도(targetYear)의 미얀마 마하보테 연운(Thet-Kayit)을 계산합니다.
 * @param {object} input { date: 'YYYY-MM-DD', targetYear: number, time?: string, unknownTime?: boolean }
 * @returns {object} 계산된 마하보테 연운 객체
 */
export function calculateMahaboteAnnual(input = {}) {
  const chart = calculateMahabote(input);
  const birthYear = Number(String(input.date || '').split('-')[0]);
  const targetYear = Number(input.targetYear || new Date().getFullYear());
  const age = Math.max(1, targetYear - birthYear);

  // 전통 마하보테 연령 순환 규칙: 본인의 하우스에서 출발하여 매년 다음 하우스로 순환
  const yearlyHouseIndex = (chart.rulingHouse.houseIndex + (age % 7)) % 7;
  const yearlyHouse = MAHABOTE_HOUSES[yearlyHouseIndex];

  const HOUSE_ANNUAL_THEMES = {
    binga: {
      theme: '개척과 돌파의 해',
      advice: '기존의 익숙한 틀을 깨고 새로운 분야를 과감히 개척할 때 큰 성취를 얻습니다.',
      focus: '도전, 문제 해결, 주도권 확보',
    },
    atun: {
      theme: '명예와 확장의 해',
      advice: '나의 노력과 역량이 널리 인정받고 사회적 명예와 영향력이 크게 확장됩니다.',
      focus: '승진, 발표, 대외 활동, 신뢰 구축',
    },
    yaza: {
      theme: '지도력과 권위의 해',
      advice: '조직이나 모임에서 중심 역할을 맡아 사람들을 이끌고 큰 책임을 완수하게 됩니다.',
      focus: '리더십, 결정권 행사, 계약과 성사',
    },
    adipati: {
      theme: '통솔과 총괄의 해',
      advice: '풍부한 경험을 바탕으로 주도적으로 프로젝트를 이끌며 실질적인 지휘권을 갖습니다.',
      focus: '협력 조율, 총괄 기획, 안정적 성과',
    },
    marana: {
      theme: '전환과 탈바꿈의 해',
      advice: '낡은 습관과 불필요한 인연을 정리하고 새로운 도약을 위해 내실을 다지는 시기입니다.',
      focus: '정리정돈, 건강 관리, 내면 성찰, 체질 개선',
    },
    thike: {
      theme: '풍요와 결실의 해',
      advice: '그동안 뿌려둔 노력의 씨앗이 물질적·정신적 풍요로 환원되어 결실을 맺는 길한 해입니다.',
      focus: '재물 획득, 투자 성과, 안정적 수입',
    },
    puti: {
      theme: '성찰과 배움의 해',
      advice: '외형적 확장보다는 깊이 있는 학문, 기술 연마, 마음의 평온을 찾는 데 집중할 때 복이 됩니다.',
      focus: '자격증 취득, 연구, 명상, 지식 축적',
    },
  };

  const yearlyTheme = HOUSE_ANNUAL_THEMES[yearlyHouse.id] || HOUSE_ANNUAL_THEMES.atun;

  return {
    targetYear,
    age,
    natalRulingHouse: chart.rulingHouse,
    yearlyHouse,
    yearlyTheme: yearlyTheme.theme,
    yearlyAdvice: yearlyTheme.advice,
    focusKeywords: yearlyTheme.focus,
    auspiciousDirection: chart.birthDay.direction,
    summary: `${targetYear}년(만 ${age}세)은 마하보테 7하우스 중 ${yearlyHouse.name}(${yearlyHouse.meaning})에 머무는 '${yearlyTheme.theme}'입니다.`,
  };
}

/**
 * 특정 날짜(targetDate)의 미얀마 마하보테 일운을 계산합니다.
 * @param {object} input { date: 'YYYY-MM-DD', targetDate?: 'YYYY-MM-DD' }
 * @returns {object} 계산된 마하보테 일운 객체
 */
export function calculateMahaboteDaily(input = {}) {
  const chart = calculateMahabote(input);
  const targetDateStr = String(input.targetDate || new Date().toISOString().slice(0, 10)).trim();
  const [tYear, tMonth, tDay] = targetDateStr.split('-').map(Number);
  const todayDate = new Date(Date.UTC(tYear, tMonth - 1, tDay));
  const todayDayIdx = todayDate.getUTCDay();

  const todayDayItem = MAHABOTE_DAYS.find((d) => d.dayIndex === todayDayIdx && (!d.subDay || d.subDay === 'am')) || MAHABOTE_DAYS[0];
  const isBirthDay = chart.birthDay.dayIndex === todayDayIdx;

  let dailyTheme = '';
  let dailyAdvice = '';
  if (isBirthDay) {
    dailyTheme = '수호령의 날: 내 고유의 주도력과 자신감이 빛나는 날';
    dailyAdvice = '중요한 결정이나 자기표현에 적극적으로 나서기에 가장 길한 날입니다.';
  } else {
    dailyTheme = `${todayDayItem.korean}(${todayDayItem.animal})의 기운이 흐르는 날`;
    dailyAdvice = `${todayDayItem.direction}의 차분한 기운을 받아 성실하고 유연하게 일정을 소화하세요.`;
  }

  return {
    targetDate: targetDateStr,
    birthDay: chart.birthDay,
    todayDay: todayDayItem,
    dailyTheme,
    dailyAdvice,
    favorableDirection: isBirthDay ? chart.birthDay.direction : todayDayItem.direction,
    summary: `오늘은 ${todayDayItem.korean}(${todayDayItem.animal})의 날로, 나의 ${chart.birthDay.animal} 기운과 어우러져 '${dailyTheme}'이 됩니다.`,
  };
}
