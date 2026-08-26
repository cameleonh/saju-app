// chart/horasat-engine.mjs
// 태국 전통 점성학 호라삿(Horasat / โหราศาสตร์) 계산 엔진.
// 샴 왕국(Siam) 고유의 베다-불교 융합 점성술 체계에 기반하여
// 황도 12 라시(Rasi)와 8대 탄생 요일별 수호불(Buddha Posture), 수호 색상 및 행성 기운을 계산합니다.

export const HORASAT_POLICY = Object.freeze({
  id: 'TH-HORASAT-1.0',
  version: '1.1.0',
  name: '태국 호라삿 12라시 수호불 간이 모형(β)',
  source: '요일별 수호불·색상은 널리 알려진 태국 전통 설명을 따름. 라시 구간은 태국어 위키백과 「จักรราศี」 항성황도(นิรายนะ) 고정 날짜 표 기준. 연운 목성 입궁 표(2024~2035)는 astronomy-engine 항성황도 계산으로 산출·기존값과 대조 검증(참고용)',
});

// 태국 8대 요일 (수요일은 주간 06:00~18:00, 야간 18:00~06:00 분리)
export const HORASAT_WEEKDAYS = Object.freeze([
  {
    dayIndex: 0,
    korean: '일요일',
    thai: 'วันอาทิตย์ (Wan Athit)',
    planet: '태양 (Surya)',
    element: '화 (Fire)',
    color: '붉은색 (Red)',
    buddhaPosture: '팡 타와이 넷 (눈을 뜨고 서서 응시하는 부처 / Pang Thawai Net)',
    keywords: ['리더십', '성실함', '명예', '솔직함'],
    character: '태양의 찬란한 빛처럼 당당하고 의리가 있으며, 주변에 선한 영향력과 밝은 에너지를 전파합니다.',
  },
  {
    dayIndex: 1,
    korean: '월요일',
    thai: 'วันจันทร์ (Wan Chan)',
    planet: '달 (Chandra)',
    element: '수 (Water)',
    color: '노란색 (Yellow)',
    buddhaPosture: '팡 함 얏 (평화와 화합을 위해 오른손을 든 부처 / Pang Ham Yat)',
    keywords: ['다정함', '평화', '직관력', '친화력'],
    character: '달의 부드러운 빛처럼 따뜻하고 배려심이 깊으며, 갈등을 중재하고 사람의 마음을 편안하게 만듭니다.',
  },
  {
    dayIndex: 2,
    korean: '화요일',
    thai: 'วันอังคาร (Wan Angkhan)',
    planet: '화성 (Mangala)',
    element: '화 (Fire)',
    color: '분홍색 (Pink)',
    buddhaPosture: '팡 사이얏 (평온하게 누워 열반에 든 와불 / Pang Saiyat)',
    keywords: ['용기', '행동력', '승부욕', '결단력'],
    character: '화성의 강인한 불꽃을 품어 두려움 없이 도전하며, 어려운 난관 앞에서도 굴하지 않는 강철 같은 의지를 지닙니다.',
  },
  {
    dayIndex: 3,
    subTime: 'day',
    korean: '수요일 주간 (06시~18시)',
    thai: 'วันพุธกลางวัน (Wan Phut Klang Wan)',
    planet: '수성 (Budha)',
    element: '목 (Wood)',
    color: '초록색 (Green)',
    buddhaPosture: '팡 움 밧 (발우를 들고 공양을 받는 부처 / Pang Um Bat)',
    keywords: ['지혜', '소통', '임기응변', '총명함'],
    character: '수성의 총명함과 유연성을 지녀 언변과 비즈니스 감각이 뛰어나며, 상황 판단이 빠르고 다재다능합니다.',
  },
  {
    dayIndex: 3,
    subTime: 'night',
    korean: '수요일 야간 (18시~06시 라후)',
    thai: 'วันพุธกลางคืน (Wan Phut Klang Khuen / Rahu)',
    planet: '라후 (Rahu)',
    element: '토 (Earth)',
    color: '연두/회색 (Light Green/Grey)',
    buddhaPosture: '팡 팔레라이 (숲속에서 동물들에게 공양받는 부처 / Pang Parileyyaka)',
    keywords: ['독창성', '신비로움', '통찰력', '뚝심'],
    character: '남들이 보지 못하는 깊은 이면을 꿰뚫는 예리한 직관과 개성을 지녔으며, 위기 속에서 비범한 기지를 발휘합니다.',
  },
  {
    dayIndex: 4,
    korean: '목요일',
    thai: 'วันพฤหัสบดี (Wan Phruehatsabodi)',
    planet: '목성 (Brihaspati)',
    element: '목 (Wood)',
    color: '주황색 (Orange)',
    buddhaPosture: '팡 사마티 (깊은 명상에 든 선정인 부처 / Pang Samadhi)',
    keywords: ['학문', '도덕성', '스승의 품격', '신뢰'],
    character: '목성의 고결한 지혜를 품어 학구열이 높고 원칙을 중시하며, 사람들을 올바른 길로 이끄는 스승의 기품이 있습니다.',
  },
  {
    dayIndex: 5,
    korean: '금요일',
    thai: 'วันศุกร์ (Wan Suk)',
    planet: '금성 (Shukra)',
    element: '금 (Metal)',
    color: '파란색 (Blue)',
    buddhaPosture: '팡 람 픙 (두 손을 가슴에 얹고 깊이 묵상하는 부처 / Pang Ram Phung)',
    keywords: ['예술성', '매력', '감수성', '사랑'],
    character: '금성의 우아하고 감각적인 매력을 지녀 예술적 안목이 탁월하며, 삶의 즐거움과 사랑을 나눌 줄 아는 낭만주의자입니다.',
  },
  {
    dayIndex: 6,
    korean: '토요일',
    thai: 'วันเสาร์ (Wan Sao)',
    planet: '토성 (Shani)',
    element: '토 (Earth)',
    color: '보라색 (Purple)',
    buddhaPosture: '팡 낙 프록 (일곱 머리 나가 뱀의 보호 아래 좌선하는 부처 / Pang Nak Prok)',
    keywords: ['인내', '책임감', '침착함', '보호의 힘'],
    character: '토성의 깊은 인내심과 나가(Naga)의 수호력을 지녀, 묵묵히 자신의 자리를 지키며 결국 큰 결실을 맺는 든든한 사람입니다.',
  },
]);

// 태국 12 라시 (황도 12궁) — 항성황도(นิรายนะ/Sidereal) 기준 날짜 구간.
// 경계값은 태국어 위키백과 「จักรราศี」 표(항성황도 열)를 따른다(근사 고정 구간).
export const HORASAT_RASIS = Object.freeze([
  { id: 'mesha', name: '메샤 (Mesha / 양자리)', thai: 'ราศีเมษ', month: '4월 13일 ~ 5월 14일', ruler: '화성', element: '화', keyword: '선구자, 열정' },
  { id: 'vrishabha', name: '프리삽 (Vrishabha / 황소자리)', thai: 'ราศีพฤษภ', month: '5월 15일 ~ 6월 14일', ruler: '금성', element: '토', keyword: '안정, 물질적 풍요' },
  { id: 'mithuna', name: '미툰 (Mithuna / 쌍둥이자리)', thai: 'ราศีเมถุน', month: '6월 15일 ~ 7월 14일', ruler: '수성', element: '공기', keyword: '소통, 다재다능' },
  { id: 'karka', name: '끄라꼿 (Karka / 게자리)', thai: 'ราศีกรกฎ', month: '7월 15일 ~ 8월 15일', ruler: '달', element: '수', keyword: '모성애, 감수성' },
  { id: 'simha', name: '싱하 (Simha / 사자자리)', thai: 'ราศีสิงห์', month: '8월 16일 ~ 9월 16일', ruler: '태양', element: '화', keyword: '권위, 당당함' },
  { id: 'kanya', name: '깐 (Kanya / 처녀자리)', thai: 'ราศีกันย์', month: '9월 17일 ~ 10월 16일', ruler: '수성', element: '토', keyword: '정밀함, 봉사' },
  { id: 'tula', name: '뚠 (Tula / 천칭자리)', thai: 'ราศีตุลย์', month: '10월 17일 ~ 11월 15일', ruler: '금성', element: '공기', keyword: '조화, 공정함' },
  { id: 'vrishchika', name: '프리칙 (Vrishchika / 전갈자리)', thai: 'ราศีพิจิก', month: '11월 16일 ~ 12월 15일', ruler: '화성', element: '수', keyword: '집념, 통찰' },
  { id: 'dhanu', name: '타누 (Dhanu / 사수자리)', thai: 'ราศีธนู', month: '12월 16일 ~ 1월 14일', ruler: '목성', element: '화', keyword: '자유, 철학' },
  { id: 'makara', name: '망꼰 (Makara / 염소자리)', thai: 'ราศีมังกร', month: '1월 15일 ~ 2월 12일', ruler: '토성', element: '토', keyword: '성실, 대기만성' },
  { id: 'kumbha', name: '꿈 (Kumbha / 물병자리)', thai: 'ราศีกุมภ์', month: '2월 13일 ~ 3월 14일', ruler: '토성/라후', element: '공기', keyword: '혁신, 인도주의' },
  { id: 'meena', name: '민 (Meena / 물고기자리)', thai: 'ราศีมีน', month: '3월 15일 ~ 4월 12일', ruler: '목성', element: '수', keyword: '자비, 예술적 영감' },
]);

/**
 * 태국 호라삿의 라시(Rasi)를 태어난 날짜(월·일)로 도출한다.
 * 구간은 항성황도 기준 고정 날짜 표(태국어 위키백과 「จักรราศี」)를 따른다.
 */
function deriveRasi(month, day) {
  const md = month * 100 + day;
  if (md >= 413 && md <= 514) return HORASAT_RASIS[0];  // 메샤
  if (md >= 515 && md <= 614) return HORASAT_RASIS[1];  // 프리삽
  if (md >= 615 && md <= 714) return HORASAT_RASIS[2];  // 미툰
  if (md >= 715 && md <= 815) return HORASAT_RASIS[3];  // 끄라꼿
  if (md >= 816 && md <= 916) return HORASAT_RASIS[4];  // 싱하
  if (md >= 917 && md <= 1016) return HORASAT_RASIS[5]; // 깐
  if (md >= 1017 && md <= 1115) return HORASAT_RASIS[6]; // 뚠
  if (md >= 1116 && md <= 1215) return HORASAT_RASIS[7]; // 프리칙
  if (md >= 1216 || md <= 114) return HORASAT_RASIS[8]; // 타누
  if (md >= 115 && md <= 212) return HORASAT_RASIS[9];  // 망꼰
  if (md >= 213 && md <= 314) return HORASAT_RASIS[10]; // 꿈
  return HORASAT_RASIS[11]; // 민 (3월 15일 ~ 4월 12일)
}

/**
 * 태국 호라삿(Horasat) 차트를 계산합니다.
 * @param {object} input { date: 'YYYY-MM-DD', time: 'HH:MM', unknownTime: boolean }
 * @returns {object} 호라삿 계산 결과
 */
export function calculateHorasat(input = {}) {
  const dateStr = String(input.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('태국 호라삿 계산을 위해 유효한 출생일(YYYY-MM-DD)이 필요합니다.');
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  const rawDayOfWeek = birthDate.getUTCDay();

  // 수요일의 경우 주간(06:00~18:00)과 야간(18:00~06:00 라후) 분리
  const timeStr = String(input.time || '12:00');
  const [hours] = timeStr.split(':').map(Number);
  const isWedNight = rawDayOfWeek === 3 && (hours >= 18 || hours < 6) && !input.unknownTime;

  let weekday = HORASAT_WEEKDAYS.find((d) => d.dayIndex === rawDayOfWeek && (!d.subTime || (d.subTime === (isWedNight ? 'night' : 'day'))));
  if (!weekday) weekday = HORASAT_WEEKDAYS[0];

  const rasi = deriveRasi(month, day);

  return {
    policy: HORASAT_POLICY,
    birthDay: weekday,
    rasi,
    summary: `${weekday.korean}의 수호불(${weekday.buddhaPosture.split(' ')[0]})과 ${rasi.name}의 기운을 타고났습니다. 행운의 색상은 ${weekday.color}입니다.`,
  };
}

// 당해 연도별 목성(Jupiter / Phra Phruehat)의 황도 입궁 라시 — 2024~2035.
// 컨벤션: "그 해 목성의 첫 순행(직진) 별자리 경계 통과 목적지 라시"(역행 재진입은 제외).
// 천문 검증: astronomy-engine VSOP 지구중심 목성 황경 − 라히리 아야남사(J2000=23.853°, 세차 50.29″/yr)
// 로 일별 스캔해 산출했으며 기존 2024~2027 값(황소·쌍둥이·게·사자)과 4/4 일치 확인.
const JUPITER_YEARLY_RASIS = Object.freeze({
  2024: { rasiId: 'vrishabha', name: '프리삽 (황소자리)', quality: '안정과 물질적 번영' },
  2025: { rasiId: 'mithuna', name: '미툰 (쌍둥이자리)', quality: '지식과 새로운 네트워크' },
  2026: { rasiId: 'karka', name: '끄라꼿 (게자리)', quality: '최고의 고양(Exaltation), 가족과 삶의 터전 번영' },
  2027: { rasiId: 'simha', name: '싱하 (사자자리)', quality: '명예와 당당한 리더십' },
  2028: { rasiId: 'kanya', name: '깐 (처녀자리)', quality: '정밀한 정리와 실속 있는 축적' },
  2029: { rasiId: 'tula', name: '뚠 (천칭자리)', quality: '조화와 균형 있는 결실' },
  2030: { rasiId: 'vrishchika', name: '프리칙 (전갈자리)', quality: '깊은 통찰과 집중' },
  2031: { rasiId: 'dhanu', name: '타누 (사수자리)', quality: '확장과 새로운 지평' },
  2032: { rasiId: 'makara', name: '망꼰 (염소자리)', quality: '구조화와 장기 성취' },
  2033: { rasiId: 'kumbha', name: '꿈 (물병자리)', quality: '혁신과 공동체 연대' },
  2034: { rasiId: 'meena', name: '민 (물고기자리)', quality: '직관과 마무리의 지혜' },
  2035: { rasiId: 'mesha', name: '메샤 (양자리)', quality: '새로운 시작과 개척' },
});

/**
 * 특정 연도(targetYear)의 태국 호라삿 연운(Jupiter Transit)을 계산합니다.
 * @param {object} input { date: 'YYYY-MM-DD', targetYear: number, time?: string, unknownTime?: boolean }
 * @returns {object} 계산된 호라삿 연운 객체
 */
export function calculateHorasatAnnual(input = {}) {
  const chart = calculateHorasat(input);
  const targetYear = Number(input.targetYear || new Date().getFullYear());
  const jupiterInfo = JUPITER_YEARLY_RASIS[targetYear] || null;
  if (!jupiterInfo) return null; // 검증된 목성 입궁 표는 2024~2035 — 그 외 연도는 계산하지 않고 카드를 생략한다.

  const natalRasiIdx = HORASAT_RASIS.findIndex((r) => r.id === chart.rasi.id);
  const jupiterRasiIdx = HORASAT_RASIS.findIndex((r) => r.id === jupiterInfo.rasiId);
  const houseDistance = (jupiterRasiIdx - natalRasiIdx + 12) % 12; // 0=Same, 4=Trine, 8=Trine...

  // 목성이 본명 라시에서 몇 번째 하우스에 들어왔는지(1~12)에 따른 연운 문안.
  // 하우스 의미는 호라삿이 계승한 인도 점성 12하우스 체계를 따른다.
  const JUPITER_HOUSE_READINGS = Object.freeze([
    null, // index 0 unused (houseDistance 0 handled separately)
    { tone: '목성이 나의 하늘 위에 뜨는 해', focus: '새 출발, 건강 회복, 이름 걸고 시작하는 일', practice: '올해 시작하는 일은 내 이름으로 하세요. 12년 주기의 문이 열리는 자리입니다.' },
    { tone: '재물이 저축되는 해', focus: '수입 안정, 저축·적립, 가치 있는 소유', practice: '모으는 해로 설계하세요. 큰 수익보다 확실한 잔고가 올해의 성과입니다.' },
    { tone: '용기와 활동이 넓어지는 해', focus: '단거리 도전, 학습, 형제·동료와의 협업', practice: '가까운 거리에서 많이 움직이면 기회가 쌓입니다. 배우는 일에 목성이 후원합니다.' },
    { tone: '마음과 터전이 따뜻해지는 해', focus: '가정, 주거 안정, 내면의 평온', practice: '집과 마음의 정비에 시간을 쓰세요. 안방이 따뜻해야 바깥 일이 흔들리지 않습니다.' },
    { tone: '창조와 후원이 겹치는 해', focus: '창작, 자녀·제자, 투자 판단', practice: '낳는 일(작품·사업·사람)에 목성이 힘을 줍니다. 다만 과욕은 산만함이 됩니다.' },
    { tone: '일의 결을 다듬는 해', focus: '루틴 정비, 건강 검진, 봉사·협력', practice: '작은 습관을 고치면 큰 흐름이 바뀝니다. 봉사의 인연이 나중 귀인이 됩니다.' },
    { tone: '인연의 문이 열리는 해', focus: '만남, 계약·동업, 공식 관계', practice: '짝과 맺는 일(계약·협약·인연)에 목성이 들어옵니다. 조건은 분명히, 마음은 열려서.' },
    { tone: '깊은 변화를 통과하는 해', focus: '구조 조정, 심리적 정리, 재투자', practice: ' 겉보다 깊은 곳이 바뀌는 해입니다. 붙잡을 것과 놓을 것을 문서로 정리하세요.' },
    { tone: '복과 문이 커지는 해', focus: '시험·법률·연구, 장거리 여행, 스승', practice: '목성이 제일 좋아하는 하우스입니다. 배우고 멀리 나가는 일이 복이 됩니다.' },
    { tone: '직업이 빛나는 해', focus: '승진, 평가, 직책, 사회적 지위', practice: '커리어의 결실기입니다. 성과를 문서와 수치로 남기세요.' },
    { tone: '소원이 자라는 해', focus: '네트워크, 공동체, 수익원 다변화', practice: '뜻을 같이하는 무리와 함께하세요. 혼자 꾸는 소원보다 함께 이루는 소원이 큽니다.' },
    { tone: '묵은 것을 정리하는 해', focus: '마무리, 정산, 해외·익숙지 않은 영역', practice: '끝내야 할 일을 끝내는 해입니다. 비우는 만큼 다음 주기가 가벼워집니다.' },
  ]);

  let annualTone = '';
  let annualFocus = '';
  let annualPractice = '';
  const reading = houseDistance === 0
    ? { tone: '목성이 나의 라시에 함께 머무는 해', focus: '대길 — 새 프로젝트, 건강 회복, 자기계발', practice: '12년 만에 돌아온 목성 귀향입니다. 오래 미룬 "나를 위한 시작"을 올해에 하세요.' }
    : JUPITER_HOUSE_READINGS[houseDistance];
  annualTone = reading.tone;
  annualFocus = reading.focus;
  annualPractice = reading.practice;

  return {
    targetYear,
    natalRasi: chart.rasi,
    jupiterRasi: jupiterInfo,
    jupiterHouse: houseDistance === 0 ? '귀향(1하우스)' : `${houseDistance + 1}하우스`,
    annualTone,
    annualFocus,
    annualPractice,
    luckyColor: chart.birthDay.color,
    buddhaPosture: chart.birthDay.buddhaPosture,
    summary: `${targetYear}년 태국 호라삿에서는 목성이 ${jupiterInfo.name}에 머물며, 나의 ${chart.rasi.name}에서 볼 때 ${houseDistance === 0 ? '바로 내 라시(귀향)' : `${houseDistance + 1}번째 하우스`}에 들어와 '${annualTone}'을 전합니다.`,
  };
}

/**
 * 특정 날짜(targetDate)의 태국 호라삿 일운을 계산합니다.
 * @param {object} input { date: 'YYYY-MM-DD', targetDate?: 'YYYY-MM-DD' }
 * @returns {object} 계산된 호라삿 일운 객체
 */
export function calculateHorasatDaily(input = {}) {
  const chart = calculateHorasat(input);
  const targetDateStr = String(input.targetDate || new Date().toISOString().slice(0, 10)).trim();
  const [tYear, tMonth, tDay] = targetDateStr.split('-').map(Number);
  const todayDate = new Date(Date.UTC(tYear, tMonth - 1, tDay));
  const todayDayIdx = todayDate.getUTCDay();

  const todayDayInfo = HORASAT_WEEKDAYS.find((d) => d.dayIndex === todayDayIdx && (!d.subTime || d.subTime === 'day')) || HORASAT_WEEKDAYS[0];

  return {
    targetDate: targetDateStr,
    natalRasi: chart.rasi,
    todayRuler: todayDayInfo.planet,
    todayColor: todayDayInfo.color,
    todayBuddha: todayDayInfo.buddhaPosture,
    todayTheme: `${todayDayInfo.korean}의 지배성(${todayDayInfo.planet})이 인도하는 하루`,
    advice: `오늘 행운의 색상인 ${todayDayInfo.color} 아이템을 곁들이고, ${todayDayInfo.keywords[0]}의 마음가짐으로 일과를 대하세요.`,
    summary: `오늘은 ${todayDayInfo.korean}으로 ${todayDayInfo.planet}의 기운이 흐릅니다. 추천 색상은 ${todayDayInfo.color}입니다.`,
  };
}
