// chart/tu-vi-engine.mjs
// 베트남 전통 점성학 뜨비(Tử Vi / Tử Vi Đẩu Số) 계산 엔진.
// 동아시아·베트남 음력 및 12시진(時辰)을 기반으로
// 12궁(Cung Mệnh, Quan Lộc, Tài Bạch 등)과 5국(Cục), 주성(Chính Tinh) 배치를 결정론적으로 산출합니다.

import { describeSolarToLunar } from '../server/domain/calendar.mjs';

export const TU_VI_POLICY = Object.freeze({
  id: 'VN-TUVI-1.0',
  version: '1.0.0',
  name: '베트남 뜨비 12궁 5국 정통 수리점성학',
  source: 'Traditional Vietnamese Tử Vi Đẩu Số Chart Rules',
});

// 12 지지 (베트남 명칭)
export const BRANCH_NAMES_VN = Object.freeze([
  { id: 'ty', name: '자 (Tý)', hanja: '子', index: 0 },
  { id: 'suu', name: '축 (Sửu)', hanja: '丑', index: 1 },
  { id: 'dan', name: '인 (Dần)', hanja: '寅', index: 2 },
  { id: 'mao', name: '묘 (Mão)', hanja: '卯', index: 3 },
  { id: 'thin', name: '진 (Thìn)', hanja: '辰', index: 4 },
  { id: 'ty_2', name: '사 (Tỵ)', hanja: '巳', index: 5 },
  { id: 'ngo', name: '오 (Ngọ)', hanja: '午', index: 6 },
  { id: 'mui', name: '미 (Mùi)', hanja: '未', index: 7 },
  { id: 'than', name: '신 (Thân)', hanja: '申', index: 8 },
  { id: 'dau', name: '유 (Dậu)', hanja: '酉', index: 9 },
  { id: 'tuat', name: '술 (Tuất)', hanja: '戌', index: 10 },
  { id: 'hoi', name: '해 (Hợi)', hanja: '亥', index: 11 },
]);

// 12궁 (Cung) 정의
export const PALACES_VN = Object.freeze([
  { id: 'menh', name: 'Mệnh (명궁 / 命宮)', meaning: '나의 본질과 정체성', role: '선천적 기질, 성격, 체질 및 평생의 중심축' },
  { id: 'phu_mau', name: 'Phụ mẫu (부모궁 / 父母宮)', meaning: '부모와 윗사람', role: '부모와의 인연, 유산, 스승 및 상사의 후원' },
  { id: 'phuc_duc', name: 'Phúc đức (복덕궁 / 福德宮)', meaning: '정신적 복과 내면', role: '정신적 평온, 조상의 복덕, 내면의 행복감' },
  { id: 'dien_trach', name: 'Điền trạch (전택궁 / 田宅宮)', meaning: '부동산과 안식처', role: '주거 환경, 부동산 자산, 가정의 안정성' },
  { id: 'quan_loc', name: 'Quan lộc (관록궁 / 官祿宮)', meaning: '직업과 커리어', role: '사회적 명예, 성취, 직무 적성 및 승진운' },
  { id: 'no_boc', name: 'Nô bộc (노복궁 / 奴僕宮)', meaning: '동료와 대인관계', role: '친구, 동료, 부하직원과의 화합 및 조력' },
  { id: 'thien_di', name: 'Thiên di (천이궁 / 遷移宮)', meaning: '대외 활동과 이동', role: '외부 사회활동, 출장, 여행, 해외 및 대외 평판' },
  { id: 'tat_ach', name: 'Tật ách (질액궁 / 疾厄宮)', meaning: '건강과 주의점', role: '신체적 건강, 취약한 부위, 질병 예방' },
  { id: 'tai_bach', name: 'Tài bạch (재백궁 / 財帛宮)', meaning: '재물과 금전', role: '재물 획득 방식, 수입의 크기, 금전 관리 능력' },
  { id: 'tu_tuc', name: 'Tử tức (자녀궁 / 子女宮)', meaning: '자녀와 후배', role: '자녀와의 유대, 후배 육성, 다음 세대와의 인연' },
  { id: 'phu_the', name: 'Phu thê (부처궁 / 夫妻宮)', meaning: '배우자와 결혼', role: '배우자 성향, 결혼 생활의 조화, 인생의 반려' },
  { id: 'huynh_de', name: 'Huynh đệ (형제궁 / 兄弟宮)', meaning: '형제와 자매', role: '형제자매와의 우애, 가장 가까운 벗과의 협력' },
]);

// 14 주성 (Chính Tinh) 대표 속성
export const MAJOR_STARS = Object.freeze([
  { name: 'Tử Vi (자미성 / 紫微)', element: '토', nature: '황제의 별', keyword: '위엄, 리더십, 통솔력' },
  { name: 'Thiên Phủ (천부성 / 天府)', element: '토', nature: '재고의 별', keyword: '풍요, 포용력, 안정성' },
  { name: 'Thái Dương (태양성 / 太陽)', element: '화', nature: '빛의 별', keyword: '공명정대, 열정, 봉사' },
  { name: 'Thái Âm (태음성 / 太陰)', element: '수', nature: '달의 별', keyword: '감수성, 섬세함, 부유함' },
  { name: 'Vũ Khúc (무곡성 / 武曲)', element: '금', nature: '재백의 별', keyword: '실행력, 결단력, 재물 창출' },
  { name: 'Thiên Cơ (천기성 / 天機)', element: '목', nature: '지혜의 별', keyword: '기획력, 두뇌 회전, 통찰' },
  { name: 'Liêm Trinh (염정성 / 廉貞)', element: '화', nature: '정의의 별', keyword: '추진력, 도전, 개성' },
  { name: 'Thiên Đồng (천동성 / 天同)', element: '수', nature: '복덕의 별', keyword: '낙천성, 화합, 온화함' },
  { name: 'Tham Lang (탐랑성 / 貪狼)', element: '목', nature: '욕망의 별', keyword: '재능, 매력, 다재다능' },
  { name: 'Cự Môn (거문성 / 巨門)', element: '수', nature: '언변의 별', keyword: '달변, 설득력, 연구' },
  { name: 'Thiên Tướng (천상성 / 天相)', element: '수', nature: '재상의 별', keyword: '조력, 신뢰, 성실함' },
  { name: 'Thiên Lương (천량성 / 天梁)', element: '토', nature: '어른의 별', keyword: '보호, 원칙, 스승' },
  { name: 'Thất Sát (칠살성 / 七殺)', element: '금', nature: '장수의 별', keyword: '돌파력, 카리스마, 용맹' },
  { name: 'Phá Quân (파군성 / 破軍)', element: '수', nature: '개혁의 별', keyword: '혁신, 개척, 과감함' },
]);

// 5국 (Ngũ Cục) 정의
export const CUC_TYPES = Object.freeze([
  { num: 2, name: 'Thủy Nhị Cục (수2국 / 水二局)', element: '수', character: '유연하고 지혜로우며 주변 환경에 빠르게 적응' },
  { num: 3, name: 'Mộc Tam Cục (목3국 / 木三局)', element: '목', character: '성장 욕구가 강하고 곧은 원칙과 생명력을 지님' },
  { num: 4, name: 'Kim Tứ Cục (금4국 / 金四局)', element: '금', character: '명확한 결단력과 단단한 실행력으로 실리를 추구' },
  { num: 5, name: 'Thổ Ngũ Cục (토5국 / 土五局)', element: '토', character: '묵직한 신뢰감과 포용력으로 중심을 지킴' },
  { num: 6, name: 'Hỏa Lục Cục (화6국 / 火六局)', element: '화', character: '뜨거운 열정과 추진력으로 새로운 영역을 개척' },
]);

function getHourBranchIndex(hours) {
  if (hours >= 23 || hours < 1) return 0; // Tý (자)
  if (hours >= 1 && hours < 3) return 1;  // Sửu (축)
  if (hours >= 3 && hours < 5) return 2;  // Dần (인)
  if (hours >= 5 && hours < 7) return 3;  // Mão (묘)
  if (hours >= 7 && hours < 9) return 4;  // Thìn (진)
  if (hours >= 9 && hours < 11) return 5; // Tỵ (사)
  if (hours >= 11 && hours < 13) return 6;// Ngọ (오)
  if (hours >= 13 && hours < 15) return 7;// Mùi (미)
  if (hours >= 15 && hours < 17) return 8;// Thân (신)
  if (hours >= 17 && hours < 19) return 9;// Dậu (유)
  if (hours >= 19 && hours < 21) return 10;// Tuất (술)
  return 11;                              // Hợi (해)
}

/**
 * 베트남 뜨비(Tử Vi) 차트를 계산합니다.
 * @param {object} input { date: 'YYYY-MM-DD', time: 'HH:MM', unknownTime: boolean }
 * @returns {object} 계산된 뜨비 차트 객체
 */
export function calculateTuVi(input = {}) {
  const dateStr = String(input.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('베트남 뜨비 계산을 위해 유효한 출생일(YYYY-MM-DD)이 필요합니다.');
  }

  // 음력 변환
  const lunar = describeSolarToLunar({ date: dateStr });
  const lunarMonth = lunar.month;
  const lunarDay = lunar.day;

  const timeStr = String(input.time || '12:00');
  const [hours] = timeStr.split(':').map(Number);
  const hourBranchIdx = input.unknownTime ? 6 : getHourBranchIndex(hours); // 기본값 Ngọ (오시)

  // 1. Mệnh(명궁) 위치 계산 (공식: 인(Dần=2)에서 출발하여 음력 월만큼 순행 후, 시진만큼 역행)
  // Mệnh = (2 + (lunarMonth - 1) - hourBranchIdx + 12) % 12
  const menhBranchIdx = (2 + (lunarMonth - 1) - hourBranchIdx + 120) % 12;
  const menhBranch = BRANCH_NAMES_VN[menhBranchIdx];

  // 2. Thân(신궁) 위치 계산 (공식: 인에서 출발하여 음력 월만큼 순행 후, 시진만큼 순행)
  const thanBranchIdx = (2 + (lunarMonth - 1) + hourBranchIdx) % 12;
  const thanBranch = BRANCH_NAMES_VN[thanBranchIdx];

  // 3. 12궁(Palaces)을 명궁부터 시계 반대방향(역행)으로 배치
  const palacesPlacement = PALACES_VN.map((palace, i) => {
    const branchIdx = (menhBranchIdx - i + 120) % 12;
    return {
      palace,
      branch: BRANCH_NAMES_VN[branchIdx],
    };
  });

  // 4. 5국(Cục) 산출 (명궁 지지와 월 기반)
  const cucIdx = (menhBranchIdx + lunarMonth) % 5;
  const cuc = CUC_TYPES[cucIdx];

  // 5. 대표 주성(Chính Tinh) 배치
  const starIdx = (menhBranchIdx * 2 + lunarDay) % MAJOR_STARS.length;
  const primaryStar = MAJOR_STARS[starIdx];

  // 관록궁(Quan Lộc) & 재백궁(Tài Bạch) 찾기
  const quanLoc = palacesPlacement.find((p) => p.palace.id === 'quan_loc');
  const taiBach = palacesPlacement.find((p) => p.palace.id === 'tai_bach');

  return {
    policy: TU_VI_POLICY,
    lunarDate: `음력 ${lunar.year}년 ${lunar.month}월 ${lunar.day}일`,
    menhPalace: {
      palace: PALACES_VN[0],
      branch: menhBranch,
      primaryStar,
    },
    thanPalace: {
      branch: thanBranch,
    },
    cuc,
    quanLoc,
    taiBach,
    palacesPlacement,
    summary: `명궁(Mệnh)이 ${menhBranch.name}에 위치하며, 주성 ${primaryStar.name}(${primaryStar.nature})과 ${cuc.name}의 기운을 바탕으로 ${primaryStar.keyword}의 역량을 발휘합니다.`,
  };
}

// 서기 연도별 베트남 세차 지지 (Lưu Niên Chi)
const YEAR_BRANCH_VN = Object.freeze({
  2024: { branchIdx: 4, name: '진 (Thìn / 용의 해)' },
  2025: { branchIdx: 5, name: '사 (Tỵ / 뱀의 해)' },
  2026: { branchIdx: 6, name: '오 (Ngọ / 말의 해)' },
  2027: { branchIdx: 7, name: '미 (Mùi / 양의 해)' },
});

/**
 * 특정 연도(targetYear)의 베트남 뜨비 유년운(Lưu Niên)을 계산합니다.
 * @param {object} input { date: 'YYYY-MM-DD', targetYear: number, time?: string, unknownTime?: boolean }
 * @returns {object} 계산된 뜨비 유년운 객체
 */
export function calculateTuViAnnual(input = {}) {
  const chart = calculateTuVi(input);
  const targetYear = Number(input.targetYear || new Date().getFullYear());
  const yearBranchInfo = YEAR_BRANCH_VN[targetYear] || { branchIdx: ((targetYear - 4) % 12 + 12) % 12, name: '해당 연도' };

  // 당해 연도 세궁(Lưu Niên Cung)에 위치한 내 12궁 찾기
  const activePlacement = chart.palacesPlacement.find((p) => p.branch.index === yearBranchInfo.branchIdx) || chart.palacesPlacement[0];
  const activePalace = activePlacement.palace;

  return {
    targetYear,
    yearBranch: yearBranchInfo,
    activePalace,
    activeBranch: activePlacement.branch,
    primaryStar: chart.menhPalace.primaryStar,
    palaceTheme: `${activePalace.name} (${activePalace.meaning})의 영역이 활성화되는 해`,
    advice: `올해는 ${activePalace.role}에 주력할 때 가장 큰 결실을 맺습니다.`,
    summary: `${targetYear}년(${yearBranchInfo.name}) 베트남 뜨비에서는 ${activePlacement.branch.name}에 위치한 '${activePalace.name}'이 당해 유년운의 중심 무대가 됩니다.`,
  };
}

/**
 * 특정 날짜(targetDate)의 베트남 뜨비 일운(Nhật Vận)을 계산합니다.
 * @param {object} input { date: 'YYYY-MM-DD', targetDate?: 'YYYY-MM-DD' }
 * @returns {object} 계산된 뜨비 일운 객체
 */
export function calculateTuViDaily(input = {}) {
  const chart = calculateTuVi(input);
  const targetDateStr = String(input.targetDate || new Date().toISOString().slice(0, 10)).trim();
  const todayLunar = describeSolarToLunar({ date: targetDateStr });

  // 음력 일진에 따른 12궁 활성화 (음력 일을 12로 나눈 나머지 지지 매핑)
  const activePalaceIdx = ((todayLunar.day - 1) % 12 + 12) % 12;
  const activePlacement = chart.palacesPlacement[activePalaceIdx] || chart.palacesPlacement[0];
  const palace = activePlacement.palace;

  return {
    targetDate: targetDateStr,
    lunarDay: todayLunar.day,
    activePalace: palace,
    activeBranch: activePlacement.branch,
    dailyFocus: `${palace.name} (${palace.meaning})의 기운이 비추는 날`,
    advice: `오늘은 ${palace.role}에 마음을 기울이고 균형을 유지하세요.`,
    summary: `오늘(음력 ${todayLunar.month}월 ${todayLunar.day}일)은 내 12궁 중 '${palace.name}'이 활성화되는 날입니다.`,
  };
}
