// chart/horasat-engine.mjs
// 태국 전통 점성학 호라삿(Horasat / โหราศาสตร์) 계산 엔진.
// 샴 왕국(Siam) 고유의 베다-불교 융합 점성술 체계에 기반하여
// 황도 12 라시(Rasi)와 8대 탄생 요일별 수호불(Buddha Posture), 수호 색상 및 행성 기운을 계산합니다.

export const HORASAT_POLICY = Object.freeze({
  id: 'TH-HORASAT-1.0',
  version: '1.1.0',
  name: '태국 호라삿 12라시 수호불 간이 모형(β)',
  source: '요일별 수호불·색상은 널리 알려진 태국 전통 설명을 따름. 라시 구간은 태국어 위키백과 「จักรราศี」 항성황도(นิรายนะ) 고정 날짜 표 기준. 연운 목성 입궁 표는 2024~2027 한정(참고용)',
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

// 당해 연도별 목성(Jupiter / Phra Phruehat)의 황도 입궁 라시
const JUPITER_YEARLY_RASIS = Object.freeze({
  2024: { rasiId: 'vrishabha', name: '프리삽 (황소자리)', quality: '안정과 물질적 번영' },
  2025: { rasiId: 'mithuna', name: '미툰 (쌍둥이자리)', quality: '지식과 새로운 네트워크' },
  2026: { rasiId: 'karka', name: '끄라꼿 (게자리)', quality: '최고의 고양(Exaltation), 가족과 삶의 터전 번영' },
  2027: { rasiId: 'simha', name: '싱하 (사자자리)', quality: '명예와 당당한 리더십' },
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
  if (!jupiterInfo) return null; // 검증된 목성 입궁 표는 2024~2027 한정 — 그 외 연도는 계산하지 않고 카드를 생략한다.

  const natalRasiIdx = HORASAT_RASIS.findIndex((r) => r.id === chart.rasi.id);
  const jupiterRasiIdx = HORASAT_RASIS.findIndex((r) => r.id === jupiterInfo.rasiId);
  const houseDistance = (jupiterRasiIdx - natalRasiIdx + 12) % 12; // 0=Same, 4=Trine, 8=Trine...

  let annualTone = '';
  let annualFocus = '';
  if (houseDistance === 0) {
    annualTone = '목성(대길성)의 직접적인 비호와 활력의 해';
    annualFocus = '새로운 프로젝트 시작, 건강 회복, 자기계발';
  } else if (houseDistance === 4 || houseDistance === 8) {
    annualTone = '삼합(Trine)의 기운: 학업·명예·귀인의 큰 후원';
    annualFocus = '시험 합격, 자격 취득, 승진, 귀인과의 만남';
  } else if (houseDistance === 3 || houseDistance === 6 || houseDistance === 9) {
    annualTone = '사정(Kendra)의 기운: 일과 가정의 안정적 번영';
    annualFocus = '직업적 성과 창출, 주거지 안정, 파트너십 강화';
  } else {
    annualTone = '내실을 다지고 지혜롭게 기반을 굳히는 해';
    annualFocus = '계획의 점검, 불필요한 지출 방어, 꾸준한 루틴 유지';
  }

  return {
    targetYear,
    natalRasi: chart.rasi,
    jupiterRasi: jupiterInfo,
    annualTone,
    annualFocus,
    luckyColor: chart.birthDay.color,
    buddhaPosture: chart.birthDay.buddhaPosture,
    summary: `${targetYear}년 태국 호라삿에서는 목성이 ${jupiterInfo.name}에 머물며, 나의 ${chart.rasi.name}에 '${annualTone}'을 전합니다.`,
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
