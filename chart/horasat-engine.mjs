// chart/horasat-engine.mjs
// Thai weekday observances plus a Lahiri sidereal Sun-rasi projection.
// This policy is deliberately scoped; it is not a complete Thai Lagna chart.

import { resolveSeoulCivilTime } from './natal-engine.mjs';
import { HORASAT_RASI_INGRESSES, HORASAT_RASI_DATA_SOURCE } from './horasat-rasi-data.mjs';

export const HORASAT_POLICY = Object.freeze({
  id: 'TH-HORASAT-1.0',
  version: '1.2.0',
  name: '태국 요일 수호불 + 라히리 항성 태양라시 투영',
  source: '요일별 수호불·색상은 태국 요일표를 따른다. 태양 라시는 astronomy-engine apparent geocentric solar longitude에서 고정한 Lahiri ayanamsa를 빼고 매년 실제 진입 시각으로 판정한다. 상승점(Lagna)·전 행성 배치·전통 연운 해석은 이 정책 범위가 아니다.',
  solarRasiSource: HORASAT_RASI_DATA_SOURCE,
  timezone: 'Asia/Seoul resolved birth instant',
  supportedBirthDates: Object.freeze(['1900-01-01', '2100-12-31']),
  unknownTime: 'requires-exact-time',
  ayanamsa: Object.freeze({ id: 'lahiri-linear-reference', j2000Degrees: 23.853055, precessionArcsecondsPerYear: 50.290966 }),
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
    buddhaPosture: '팡 오픈 록 (눈을 뜨고 세상을 여는 부처 / Pang Opan Lok, ปางเปิดโลก)',
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
    color: '하늘색 (Light Blue)',
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

// Thai sign labels. The `month` property is descriptive only; sign selection
// uses the year-specific Lahiri ingress ephemeris, never these fixed dates.
export const HORASAT_RASIS = Object.freeze([
  { id: 'mesha', name: '메샤 (Mesha / 양자리)', thai: 'ราศีเมษ', month: '연도별 진입 시각', ruler: '화성', element: '화', keyword: '선구자, 열정' },
  { id: 'vrishabha', name: '프리삽 (Vrishabha / 황소자리)', thai: 'ราศีพฤษภ', month: '연도별 진입 시각', ruler: '금성', element: '토', keyword: '안정, 물질적 풍요' },
  { id: 'mithuna', name: '미툰 (Mithuna / 쌍둥이자리)', thai: 'ราศีเมถุน', month: '연도별 진입 시각', ruler: '수성', element: '공기', keyword: '소통, 다재다능' },
  { id: 'karka', name: '끄라꼿 (Karka / 게자리)', thai: 'ราศีกรกฎ', month: '연도별 진입 시각', ruler: '달', element: '수', keyword: '모성애, 감수성' },
  { id: 'simha', name: '싱하 (Simha / 사자자리)', thai: 'ราศีสิงห์', month: '연도별 진입 시각', ruler: '태양', element: '화', keyword: '권위, 당당함' },
  { id: 'kanya', name: '깐 (Kanya / 처녀자리)', thai: 'ราศีกันย์', month: '연도별 진입 시각', ruler: '수성', element: '토', keyword: '정밀함, 봉사' },
  { id: 'tula', name: '뚠 (Tula / 천칭자리)', thai: 'ราศีตุลย์', month: '연도별 진입 시각', ruler: '금성', element: '공기', keyword: '조화, 공정함' },
  { id: 'vrishchika', name: '프리칙 (Vrishchika / 전갈자리)', thai: 'ราศีพิจิก', month: '연도별 진입 시각', ruler: '화성', element: '수', keyword: '집념, 통찰' },
  { id: 'dhanu', name: '타누 (Dhanu / 사수자리)', thai: 'ราศีธนู', month: '연도별 진입 시각', ruler: '목성', element: '화', keyword: '자유, 철학' },
  { id: 'makara', name: '망꼰 (Makara / 염소자리)', thai: 'ราศีมังกร', month: '연도별 진입 시각', ruler: '토성', element: '토', keyword: '성실, 대기만성' },
  { id: 'kumbha', name: '꿈 (Kumbha / 물병자리)', thai: 'ราศีกุมภ์', month: '연도별 진입 시각', ruler: '토성/라후', element: '공기', keyword: '혁신, 인도주의' },
  { id: 'meena', name: '민 (Meena / 물고기자리)', thai: 'ราศีมีน', month: '연도별 진입 시각', ruler: '목성', element: '수', keyword: '자비, 예술적 영감' },
]);

function ingressIndexAt(utcMinute) {
  let low = 0;
  let high = HORASAT_RASI_INGRESSES.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (HORASAT_RASI_INGRESSES[middle][0] <= utcMinute) low = middle + 1;
    else high = middle;
  }
  return low - 1;
}

function rasiAtUtcMinute(utcMinute) {
  const index = ingressIndexAt(utcMinute);
  if (index < 0) throw new Error('sidereal Sun ingress data is unavailable for this date');
  const [, rasiIndex] = HORASAT_RASI_INGRESSES[index];
  return HORASAT_RASIS[rasiIndex];
}

function rasiBoundarySensitivity(utcMinute) {
  const currentIndex = ingressIndexAt(utcMinute);
  const previous = HORASAT_RASI_INGRESSES[currentIndex];
  const next = HORASAT_RASI_INGRESSES[currentIndex + 1];
  const previousDistance = previous ? Math.abs(previous[0] - utcMinute) : Infinity;
  const nextDistance = next ? Math.abs(next[0] - utcMinute) : Infinity;
  const ingressIndex = previousDistance <= nextDistance ? currentIndex : currentIndex + 1;
  const ingress = HORASAT_RASI_INGRESSES[ingressIndex];
  const distanceMinutes = ingress ? utcMinute - ingress[0] : Infinity;
  if (!ingress || Math.abs(distanceMinutes) > 60) return null;
  const before = HORASAT_RASI_INGRESSES[ingressIndex - 1];
  return {
    before: before ? HORASAT_RASIS[before[1]].id : null,
    after: HORASAT_RASIS[ingress[1]].id,
    ingress: new Date(ingress[0] * 60_000).toISOString(),
    distanceMinutes,
  };
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
  if (year < 1900 || year > 2100 || birthDate.getUTCFullYear() !== year || birthDate.getUTCMonth() !== month - 1 || birthDate.getUTCDate() !== day) {
    throw new Error('태국 호라삿 계산을 위해 유효한 출생일(YYYY-MM-DD)이 필요합니다.');
  }
  const rawDayOfWeek = birthDate.getUTCDay();

  if (input.unknownTime === true || !input.time) throw new Error('태국 태양라시와 수요일 주·야 구분에는 정확한 출생 시각이 필요합니다.');
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(String(input.time));
  if (!timeMatch || Number(timeMatch[1]) > 23 || Number(timeMatch[2]) > 59) throw new Error('time must use a valid HH:MM value');

  // 수요일의 경우 주간(06:00~18:00)과 야간(18:00~06:00 라후) 분리
  const [hours] = input.time.split(':').map(Number);
  const isWedNight = rawDayOfWeek === 3 && (hours >= 18 || hours < 6);

  let weekday = HORASAT_WEEKDAYS.find((d) => d.dayIndex === rawDayOfWeek && (!d.subTime || (d.subTime === (isWedNight ? 'night' : 'day'))));
  if (!weekday) weekday = HORASAT_WEEKDAYS[0];

  if (input.timezoneId && input.timezoneId !== 'Asia/Seoul' && !input.utcInstant) {
    throw new Error('Non-Seoul birth clocks require a resolved UTC instant for this policy.');
  }
  const civil = input.utcInstant
    ? { utcMinute: Math.floor(Date.parse(input.utcInstant) / 60_000) }
    : resolveSeoulCivilTime(dateStr, input.time);
  if (!Number.isFinite(civil.utcMinute)) throw new Error('utcInstant must be a valid ISO timestamp');
  const rasi = rasiAtUtcMinute(civil.utcMinute);
  const boundarySensitivity = rasiBoundarySensitivity(civil.utcMinute);

  return {
    policy: HORASAT_POLICY,
    birthDay: weekday,
    rasi,
    boundarySensitivity,
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
  const houseNumber = ((jupiterRasiIdx - natalRasiIdx + 12) % 12) + 1;

  return {
    targetYear,
    natalRasi: chart.rasi,
    jupiterRasi: { rasiId: jupiterInfo.rasiId, name: jupiterInfo.name },
    solarRasiHouse: houseNumber,
    method: '첫 순행 목성 라시 진입; natal Sun-Rasi부터 세는 whole-sign offset',
    unsupportedStates: [{ id: 'horasat.annual-interpretation', reason: '검증된 태국 유파별 연운 해석 규칙이 없어 예측 문안은 생성하지 않습니다.' }],
    summary: `${targetYear}년 첫 순행 목성 진입은 ${jupiterInfo.name}입니다. 출생 태양 라시(${chart.rasi.name}) 기준 whole-sign 위치는 ${houseNumber}번째입니다. 이는 천문·라시 위치 정보이며 사건 예측이 아닙니다.`,
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) throw new Error('targetDate must use YYYY-MM-DD');
  const [tYear, tMonth, tDay] = targetDateStr.split('-').map(Number);
  const todayDate = new Date(Date.UTC(tYear, tMonth - 1, tDay));
  if (todayDate.getUTCFullYear() !== tYear || todayDate.getUTCMonth() !== tMonth - 1 || todayDate.getUTCDate() !== tDay) throw new Error('targetDate must be a valid Gregorian date');
  const todayDayIdx = todayDate.getUTCDay();
  let targetHour = null;
  if (input.targetTime != null) {
    const targetTimeMatch = /^(\d{2}):(\d{2})$/.exec(String(input.targetTime));
    if (!targetTimeMatch || Number(targetTimeMatch[1]) > 23 || Number(targetTimeMatch[2]) > 59) throw new Error('targetTime must use a valid HH:MM value');
    targetHour = Number(targetTimeMatch[1]);
  }
  const todayDayCandidates = todayDayIdx === 3 && targetHour == null ? HORASAT_WEEKDAYS.filter((d) => d.dayIndex === 3) : null;
  const isWednesdayNight = todayDayIdx === 3 && targetHour != null && (targetHour >= 18 || targetHour < 6);
  const todayDayInfo = todayDayCandidates ? null : (HORASAT_WEEKDAYS.find((d) => d.dayIndex === todayDayIdx && (!d.subTime || d.subTime === (isWednesdayNight ? 'night' : 'day'))) || HORASAT_WEEKDAYS[0]);

  return {
    targetDate: targetDateStr,
    natalRasi: chart.rasi,
    todayRuler: todayDayInfo?.planet || null,
    todayColor: todayDayInfo?.color || null,
    todayBuddha: todayDayInfo?.buddhaPosture || null,
    todayCandidates: todayDayCandidates,
    method: '요일별 행성·색상·수호불 표',
    unsupportedStates: [
      ...(todayDayCandidates ? [{ id: 'horasat.wednesday-time', reason: 'targetTime이 없어 수요일 주간/라후 시간대는 확정되지 않습니다.' }] : []),
      { id: 'horasat.daily-interpretation', reason: '요일 표 밖의 일일 운세·행동 조언은 검증된 규칙이 없습니다.' },
    ],
    summary: todayDayInfo
      ? `오늘의 태국 요일 표식은 ${todayDayInfo.korean}, ${todayDayInfo.planet}, ${todayDayInfo.color}입니다.`
      : '오늘은 수요일이며, 현지 시각에 따라 수요일 주간/라후 표식 중 하나가 적용됩니다.',
  };
}
