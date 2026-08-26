// chart/tu-vi-engine.mjs
// 베트남 전통 점성학 뜨비(Tử Vi / Tử Vi Đẩu Số) 계산 엔진.
// 명궁·신궁·국(局)·주성 배치는 자미두수(紫微斗數) 통용 규칙(중국어 위키백과 「紫微斗數」
// 안궁 절차: 五行局=명궁 간지의 납음 오행, 紫微 안성 공식, 자미군·천부군 14성 전개)을 따름.
// 베트남 현지 유파별 상세 규칙(사화, 잡성, 윤월 세분)과 대조 검증은 진행 중이며
// 음력은 중국 음양력 데이터로 대체 사용한다(정책 source 참조).

import { describeSolarToLunar } from './solar-lunar.mjs';

export const TU_VI_POLICY = Object.freeze({
  id: 'VN-TUVI-1.0',
  version: '1.1.0',
  name: '베트남 뜨비 12궁 5국 (배치 규칙 오라클 검증·β)',
  source: '명궁·신궁·납음 오행 국(局)·자미 안성·14주성·사화(四化)·잡성 14종 배치는 자미두수 정통 규칙을 따르며 베트남 구현체 tuvi-neo 1.0.7과 대조 검증(주성 246·사화 213·잡성 695 표본 전수 일치, 달력 경계 6건 제외). 음력은 중국 음양력 데이터로 대체(참고용)',
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

// 10천간 (자미두수 안궁용)
const STEM_NAMES = Object.freeze(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']);

// 12궁 (Cung) 정의 — 명궁부터 시계 반대 방향 순서
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

// 14 주성 (Chính Tinh) — 자미두수 14정성. 자미군 6성 + 천부군 8성.
// 베트남 명칭과 한국 대응 표기.
export const MAJOR_STARS = Object.freeze([
  { key: 'tu-vi', name: 'Tử Vi (자미성 / 紫微)', element: '토', nature: '황제의 별', keyword: '위엄, 리더십, 통솔력', group: 'ziwei' },
  { key: 'thien-co', name: 'Thiên Cơ (천기성 / 天機)', element: '목', nature: '지혜의 별', keyword: '기획력, 두뇌 회전, 통찰', group: 'ziwei' },
  { key: 'thai-duong', name: 'Thái Dương (태양성 / 太陽)', element: '화', nature: '빛의 별', keyword: '공명정대, 열정, 봉사', group: 'ziwei' },
  { key: 'vu-khuc', name: 'Vũ Khúc (무곡성 / 武曲)', element: '금', nature: '재백의 별', keyword: '실행력, 결단력, 재물 창출', group: 'ziwei' },
  { key: 'thien-dong', name: 'Thiên Đồng (천동성 / 天同)', element: '수', nature: '복덕의 별', keyword: '낙천성, 화합, 온화함', group: 'ziwei' },
  { key: 'liem-trinh', name: 'Liêm Trinh (염정성 / 廉貞)', element: '화', nature: '정의의 별', keyword: '추진력, 도전, 개성', group: 'ziwei' },
  { key: 'thien-phu', name: 'Thiên Phủ (천부성 / 天府)', element: '토', nature: '재고의 별', keyword: '풍요, 포용력, 안정성', group: 'tianfu' },
  { key: 'thai-am', name: 'Thái Âm (태음성 / 太陰)', element: '수', nature: '달의 별', keyword: '감수성, 섬세함, 부유함', group: 'tianfu' },
  { key: 'tham-lang', name: 'Tham Lang (탐랑성 / 貪狼)', element: '목', nature: '욕망의 별', keyword: '재능, 매력, 다재다능', group: 'tianfu' },
  { key: 'cu-mon', name: 'Cự Môn (거문성 / 巨門)', element: '수', nature: '언변의 별', keyword: '달변, 설득력, 연구', group: 'tianfu' },
  { key: 'thien-tuong', name: 'Thiên Tướng (천상성 / 天相)', element: '수', nature: '재상의 별', keyword: '조력, 신뢰, 성실함', group: 'tianfu' },
  { key: 'thien-luong', name: 'Thiên Lương (천량성 / 天梁)', element: '토', nature: '어른의 별', keyword: '보호, 원칙, 스승', group: 'tianfu' },
  { key: 'that-sat', name: 'Thất Sát (칠살성 / 七殺)', element: '금', nature: '장수의 별', keyword: '돌파력, 카리스마, 용맹', group: 'tianfu' },
  { key: 'pha-quan', name: 'Phá Quân (파군성 / 破軍)', element: '수', nature: '개혁의 별', keyword: '혁신, 개척, 과감함', group: 'tianfu' },
]);

// 5국 (Ngũ Cục) — 납음 오행 → 국수 매핑 (자미두수 통용: 水二 木三 金四 土五 火六)
export const CUC_TYPES = Object.freeze([
  { num: 2, name: 'Thủy Nhị Cục (수2국 / 水二局)', element: '수', character: '유연하고 지혜로우며 주변 환경에 빠르게 적응' },
  { num: 3, name: 'Mộc Tam Cục (목3국 / 木三局)', element: '목', character: '성장 욕구가 강하고 곧은 원칙과 생명력을 지님' },
  { num: 4, name: 'Kim Tứ Cục (금4국 / 金四局)', element: '금', character: '명확한 결단력과 단단한 실행력으로 실리를 추구' },
  { num: 5, name: 'Thổ Ngũ Cục (토5국 / 土五局)', element: '토', character: '묵직한 신뢰감과 포용력으로 중심을 지킴' },
  { num: 6, name: 'Hỏa Lục Cục (화6국 / 火六局)', element: '화', character: '뜨거운 열정과 추진력으로 새로운 영역을 개척' },
]);

// 60갑자 납음 오행 (30쌍; 각 쌍은 같은 납음). 순서는 甲子乙丑(海中金)부터.
const NAYIN_ELEMENTS = Object.freeze([
  '금', '화', '목', '토', '금', // 甲子..壬申
  '화', '수', '토', '금', '목', // 甲戌..壬午
  '수', '토', '화', '목', '수', // 甲申..壬辰
  '금', '화', '목', '토', '금', // 甲午..壬寅
  '화', '수', '토', '금', '목', // 甲辰..壬子
  '수', '토', '화', '목', '수', // 甲寅..壬戌
]);
const NAYIN_NAMES = Object.freeze([
  '海中金', '爐中火', '大林木', '路旁土', '劍鋒金',
  '山頭火', '澗下水', '城頭土', '白蠟金', '楊柳木',
  '泉中水', '屋上土', '霹靂火', '松柏木', '長流水',
  '砂石金', '山下火', '平地木', '壁上土', '金箔金',
  '覆燈火', '天河水', '大驛土', '釵釧金', '桑柘木',
  '大溪水', '沙中土', '天上火', '石榴木', '大海水',
]);
const ELEMENT_TO_CUC_NUM = Object.freeze({ 수: 2, 목: 3, 금: 4, 토: 5, 화: 6 });

// 사화 대상 보조성 (Tứ hóa phụ tinh)
export const AUX_STARS = Object.freeze([
  { key: 'van-xuong', name: 'Văn Xương (문창성 / 文昌)', element: '금', nature: '문서의 별', keyword: '학문, 시험, 문서운' },
  { key: 'van-khuc', name: 'Văn Khúc (문곡성 / 文曲)', element: '수', nature: '재주의 별', keyword: '예술, 언변, 기교' },
  { key: 'ta-phu', name: 'Tả Phù (좌보성 / 左輔)', element: '토', nature: '조력의 별', keyword: '보좌, 협력, 성실' },
  { key: 'huu-bat', name: 'Hữu Bật (우필성 / 右弼)', element: '수', nature: '조력의 별', keyword: '보좌, 관대함, 인망' },
]);

// 사화(四化) 배정표 — 년간별 祿/權/科/忌 숙주. 전서(全書) 계열 표준표이며
// 독립 오라클 tuvi-neo 1.0.7 실측(전 천간 4화 숙주궁 덤프)과 일치.
const TU_HOA_TABLE = Object.freeze({
  0: { loc: 'liem-trinh', quyen: 'pha-quan', khoa: 'vu-khuc', ky: 'thai-duong' },   // 甲
  1: { loc: 'thien-co', quyen: 'thien-luong', khoa: 'tu-vi', ky: 'thai-am' },       // 乙
  2: { loc: 'thien-dong', quyen: 'thien-co', khoa: 'van-xuong', ky: 'liem-trinh' }, // 丙
  3: { loc: 'thai-am', quyen: 'thien-dong', khoa: 'thien-co', ky: 'cu-mon' },       // 丁
  4: { loc: 'tham-lang', quyen: 'thai-am', khoa: 'huu-bat', ky: 'thien-co' },       // 戊
  5: { loc: 'vu-khuc', quyen: 'tham-lang', khoa: 'thien-luong', ky: 'van-khuc' },   // 己
  6: { loc: 'thai-duong', quyen: 'vu-khuc', khoa: 'thai-am', ky: 'thien-dong' },    // 庚
  7: { loc: 'cu-mon', quyen: 'thai-duong', khoa: 'van-khuc', ky: 'van-xuong' },     // 辛
  8: { loc: 'thien-luong', quyen: 'tu-vi', khoa: 'ta-phu', ky: 'vu-khuc' },         // 壬
  9: { loc: 'pha-quan', quyen: 'cu-mon', khoa: 'thai-am', ky: 'tham-lang' },        // 癸
});
export { TU_HOA_TABLE as TU_HOA_TABLE_EXPORT };

// 잡성(Phụ Tinh / auxiliary stars) — 13종 배치 규칙. 모두 tuvi-neo 1.0.7 실측과 대조 검증됨.
export const MINOR_STARS = Object.freeze([
  { key: 'loc-ton', name: 'Lộc Tồn (록존성 / 祿存)', nature: '길성', keyword: '복록, 재물, 안정' },
  { key: 'kình-duong', name: 'Kình Dương (경양성 / 擎羊)', nature: '살성', keyword: '예리함, 경쟁, 상처' },
  { key: 'đà-la', name: 'Đà La (타라성 / 陀羅)', nature: '살성', keyword: '지연, 인내, 소모' },
  { key: 'thiên-khôi', name: 'Thiên Khôi (천괴성 / 天魁)', nature: '길성', keyword: '윗사람 인연, 시험운' },
  { key: 'thiên-việt', name: 'Thiên Việt (천월성 / 天鉞)', nature: '길성', keyword: '아랫사람 인연, 재물귀인' },
  { key: 'thiên-mã', name: 'Thiên Mã (천마성 / 天馬)', nature: '길성', keyword: '이동, 변화, 활동' },
  { key: 'hồng-loan', name: 'Hồng Loan (홍란성 / 紅鸞)', nature: '길성', keyword: '연애, 결혼, 인기' },
  { key: 'thiên-hỉ', name: 'Thiên Hỉ (천희성 / 天喜)', nature: '길성', keyword: '기쁨, 경사, 출산' },
  { key: 'địa-kiếp', name: 'Địa Kiếp (지겁성 / 地劫)', nature: '살성', keyword: '파재, 손실, 공허' },
  { key: 'địa-không', name: 'Địa Không (지공성 / 地空)', nature: '살성', keyword: '공상, 좌절, 변동' },
  { key: 'thiên-hình', name: 'Thiên Hình (천형성 / 天刑)', nature: '살성', keyword: '규율, 형벌, 의료' },
  { key: 'thiên-riêu', name: 'Thiên Riêu (천요성 / 天姚)', nature: '살성', keyword: '매력, 유혹, 시비' },
  { key: 'hỏa-tinh', name: 'Hỏa Tinh (화성성 / 火星)', nature: '살성', keyword: '폭발, 급변, 추진' },
  { key: 'linh-tinh', name: 'Linh Tinh (령성성 / 鈴星)', nature: '살성', keyword: '잠복, 은근한 화, 집념' },
]);

// 년간 기반 잡성 표 — 록존은 고전 표(甲寅 乙卯 丙戊巳 丁己午 庚申 辛酉 壬亥 癸子),
// 경양=록존+1, 타라=록존−1, 천괴/천월은 간 쌍 그룹 (tuvi-neo 실측 일치).
const LOC_TON_BY_STEM = Object.freeze([2, 3, 5, 6, 5, 6, 8, 9, 11, 0]);
const KHAC_BY_STEM = Object.freeze([1, 0, 11, 11, 1, 0, 6, 6, 3, 3]);
const VIET_BY_STEM = Object.freeze([7, 8, 9, 9, 7, 8, 2, 2, 5, 5]);
// 화성·령성: 년지 삼합 그룹×음양에 따른 기준궁과 시지 진행 방향 (tuvi-neo 실측 피팅).
const FIRE_BELL_BASES = Object.freeze({
  fire: { yangTrio: { 'yin-wu-xu': 1, 'shen-zi-chen': 2 }, yinTrio: { 'hai-mao-wei': 9, 'si-you-chou': 3 }, yangDir: 1, yinDir: -1 },
  bell: { yangTrio: { 'yin-wu-xu': 3, 'shen-zi-chen': 10 }, yinTrio: { 'hai-mao-wei': 10, 'si-you-chou': 10 }, yangDir: -1, yinDir: 1 },
});
function yearTrio(branchIdx) {
  if ([2, 6, 10].includes(branchIdx)) return 'yin-wu-xu';
  if ([0, 4, 8].includes(branchIdx)) return 'shen-zi-chen';
  if ([1, 5, 9].includes(branchIdx)) return 'si-you-chou';
  return 'hai-mao-wei';
}

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
  return 11;                               // Hợi (해)
}

// 생년 천간 인덱스(甲0..癸9). 60갑자 년주는 (year - 4) 기준: 1984=甲子.
function yearStemIndex(year) {
  return (((year - 4) % 10) + 10) % 10;
}

// 오호둔(五虎遁): 년간 → 인궁 천간. 甲己→丙寅, 乙庚→戊寅, 丙辛→庚寅, 丁壬→壬寅, 戊癸→甲寅.
function yinStemIndexForYearStem(stemIdx) {
  return ((stemIdx % 5) * 2 + 2) % 10;
}

// 지지 인덱스에 배치된 천간 인덱스 (인궁부터 순행)
function stemAtBranch(branchIdx, yinStem) {
  return (yinStem + ((branchIdx - 2 + 12) % 12)) % 10;
}

// 60갑자 인덱스 → 납음 쌍 인덱스 (동일 납음이 2간지씩)
// 60갑자 순서 n(0..59)은 stem = n%10, branch = n%12을 만족하므로 stem에서 10씩 올라 branch를 맞춘다.
function nayinPairOf(stemIdx, branchIdx) {
  let n = stemIdx % 10;
  while (n % 12 !== branchIdx % 12) n += 10;
  return Math.floor(n / 2);
}

function nayinOf(stemIdx, branchIdx) {
  const pair = nayinPairOf(stemIdx, branchIdx);
  const element = NAYIN_ELEMENTS[pair];
  const name = NAYIN_NAMES[pair];
  const cucNum = ELEMENT_TO_CUC_NUM[element];
  const cuc = CUC_TYPES.find((c) => c.num === cucNum) || CUC_TYPES[0];
  return { element, name, ganZhi: `${STEM_NAMES[stemIdx]}${BRANCH_NAMES_VN[branchIdx].hanja}`, cuc, cucNum };
}

// 자미(紫微) 안성 — 정통 규칙(紫微斗數全書 계열, 독립 구현 ziwei@0.0.8과 대조 검증):
// 국수로 생일을 나누어 떨어지면 몫이 자미수. 아니면 차 = (몫+1)×국수 - 생일로,
// 차가 짝수면 자미수 = 차 + 몫 + 1, 홀수면 자미수 = 몫 + 1 - 차. 자미궁 = (자미수+1)을 12로 나눈 나머지.
function ziweiBranchIndex(cucNum, lunarDay) {
  let number;
  if (lunarDay % cucNum === 0) number = lunarDay / cucNum;
  else {
    const quotient = Math.floor(lunarDay / cucNum);
    const diff = (quotient + 1) * cucNum - lunarDay;
    number = diff % 2 === 0 ? diff + quotient + 1 : quotient + 1 - diff;
  }
  return (((number + 1) % 12) + 12) % 12;
}

// 자미 기준 14성 전개. 천부는 자미와 寅-申 축 대칭.
// 자미군 6성은 자미로부터 역행(-), 천부군 8성은 천부로부터 순행(+).
const ZIWEI_GROUP_OFFSETS = Object.freeze([
  ['tu-vi', 0], ['thien-co', -1], ['thai-duong', -3], ['vu-khuc', -4], ['thien-dong', -5], ['liem-trinh', -8],
]);
const TIANFU_GROUP_OFFSETS = Object.freeze([
  ['thien-phu', 0], ['thai-am', 1], ['tham-lang', 2], ['cu-mon', 3], ['thien-tuong', 4], ['thien-luong', 5], ['that-sat', 6], ['pha-quan', 10],
]);

function starPlacements(ziweiIdx) {
  const tianfuIdx = (4 - ziweiIdx + 12) % 12;
  const placements = new Map();
  for (const [key, offset] of ZIWEI_GROUP_OFFSETS) placements.set(key, (ziweiIdx + offset + 120) % 12);
  for (const [key, offset] of TIANFU_GROUP_OFFSETS) placements.set(key, (tianfuIdx + offset + 120) % 12);
  return placements;
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

  const lunar = describeSolarToLunar({ date: dateStr });
  const lunarMonth = lunar.month; // 윤달은 본월에 붙여 계산
  const lunarDay = lunar.day;

  const timeStr = String(input.time || '12:00');
  const [hours] = timeStr.split(':').map(Number);
  const hourBranchIdx = input.unknownTime ? 6 : getHourBranchIndex(hours); // 기본값 Ngọ (오시)

  // 1. Mệnh(명궁): 인(寅)에서 음력 월만큼 순행 후 시진만큼 역행
  const menhBranchIdx = (2 + (lunarMonth - 1) - hourBranchIdx + 120) % 12;
  const menhBranch = BRANCH_NAMES_VN[menhBranchIdx];

  // 2. Thân(신궁): 인(寅)에서 음력 월만큼 순행 후 시진만큼 순행
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

  // 4. 국(Cục): 오호둔으로 명궁 천간을 정하고 명궁 간지의 납음 오행으로 결정 (紫微斗數 통용 절차)
  const stemIdx = yearStemIndex(lunar.year);
  const yinStem = yinStemIndexForYearStem(stemIdx);
  const menhStemIdx = stemAtBranch(menhBranchIdx, yinStem);
  const nayin = nayinOf(menhStemIdx, menhBranchIdx);
  const cuc = nayin.cuc;

  // 5. 자미(紫微) 안성 후 14주성(Chính Tinh) 전개
  const ziweiIdx = ziweiBranchIndex(cuc.num, lunarDay);
  const placements = starPlacements(ziweiIdx);
  const starByBranch = new Map();
  for (const star of MAJOR_STARS) {
    const idx = placements.get(star.key);
    if (!starByBranch.has(idx)) starByBranch.set(idx, []);
    starByBranch.get(idx).push(star);
  }

  // 6. 보조성(문창·문곡·좌보·우필) 안성 — 고전 규칙(tuvi-neo 실측 일치):
  // 문창=술궁에서 시지만큼 역행, 문곡=진궁에서 시지만큼 순행,
  // 좌보=진궁에서 생월만큼 순행, 우필=술궁에서 생월만큼 역행.
  const auxPlacements = new Map([
    ['van-xuong', (((10 - hourBranchIdx) % 12) + 12) % 12],
    ['van-khuc', (4 + hourBranchIdx) % 12],
    ['ta-phu', (4 + (lunarMonth - 1)) % 12],
    ['huu-bat', (((10 - (lunarMonth - 1)) % 12) + 12) % 12],
  ]);

  // 7. 사화(四化) — 년간별 숙주 성의 궁위에 배정
  const hoaHosts = TU_HOA_TABLE[stemIdx];
  const starPosition = (key) => (placements.has(key) ? placements.get(key) : auxPlacements.get(key));
  const hoaEntries = { loc: 'Hóa Lộc (화록)', quyen: 'Hóa Quyền (화권)', khoa: 'Hóa Khoa (화과)', ky: 'Hóa Kỵ (화기)' };
  const starName = (key) => MAJOR_STARS.find((s) => s.key === key)?.name || AUX_STARS.find((s) => s.key === key)?.name || key;
  const tuHoa = {};
  for (const [field, label] of Object.entries(hoaEntries)) {
    const hostKey = hoaHosts[field];
    const branchIdx = starPosition(hostKey);
    tuHoa[field] = { label, host: starName(hostKey), hostKey, branch: BRANCH_NAMES_VN[branchIdx] ?? null };
  }

  // 8. 잡성(Minor Stars) 13종 배치 — 년간/년지/시지/생월 기반 규칙(tuvi-neo 실측 일치)
  const yearBranchIdx = (((lunar.year - 4) % 12) + 12) % 12;
  const minorPlacements = new Map();
  const setMinor = (key, idx) => minorPlacements.set(key, (((idx % 12) + 12) % 12));
  const locTon = LOC_TON_BY_STEM[stemIdx];
  setMinor('loc-ton', locTon);
  setMinor('kình-duong', locTon + 1);
  setMinor('đà-la', locTon - 1);
  setMinor('thiên-khôi', KHAC_BY_STEM[stemIdx]);
  setMinor('thiên-việt', VIET_BY_STEM[stemIdx]);
  const hongLoan = (3 - yearBranchIdx + 12) % 12;
  setMinor('hồng-loan', hongLoan);
  setMinor('thiên-hỉ', hongLoan + 6);
  setMinor('địa-kiếp', 11 + hourBranchIdx);
  setMinor('địa-không', 11 - hourBranchIdx);
  setMinor('thiên-hình', 9 + (lunarMonth - 1));
  setMinor('thiên-riêu', 1 + (lunarMonth - 1));
  // 천마: 년지 삼합 기준궁(인오술→申, 사유축→亥, 신자진→寅, 해묘미→巳)
  setMinor('thiên-mã', { 2: 8, 6: 8, 10: 8, 1: 11, 5: 11, 9: 11, 0: 2, 4: 2, 8: 2 }[yearBranchIdx] ?? 5);
  // 화성·령성: 삼합 그룹×년지 음양별 기준궁에서 시지 방향으로 진행
  const isYangBranch = yearBranchIdx % 2 === 0;
  const trioName = yearTrio(yearBranchIdx);
  for (const [kind, cfg] of Object.entries(FIRE_BELL_BASES)) {
    const base = isYangBranch ? cfg.yangTrio[trioName] : cfg.yinTrio[trioName];
    const dir = isYangBranch ? cfg.yangDir : cfg.yinDir;
    setMinor(kind === 'fire' ? 'hỏa-tinh' : 'linh-tinh', base + dir * hourBranchIdx);
  }
  const menhStars = starByBranch.get(menhBranchIdx) || [];
  const primaryStar = menhStars[0] || MAJOR_STARS[0];

  // 관록궁(Quan Lộc) & 재백궁(Tài Bạch)
  const quanLoc = palacesPlacement.find((p) => p.palace.id === 'quan_loc');
  const taiBach = palacesPlacement.find((p) => p.palace.id === 'tai_bach');

  const starsText = menhStars.map((s) => s.name).join(' + ');

  return {
    policy: TU_VI_POLICY,
    lunarDate: `음력 ${lunar.year}년 ${lunar.month}월${lunar.leapMonth ? '(윤) ' : ' '}${lunar.day}일`,
    lunarInput: { year: lunar.year, month: lunar.month, day: lunar.day, leapMonth: lunar.leapMonth },
    menhPalace: {
      palace: PALACES_VN[0],
      branch: menhBranch,
      primaryStar,
      stars: menhStars,
    },
    thanPalace: {
      branch: thanBranch,
    },
    menhGanZhi: nayin.ganZhi,
    menhNayin: { element: nayin.element, name: nayin.name },
    cuc,
    ziweiBranch: BRANCH_NAMES_VN[ziweiIdx],
    starByBranch: [...starByBranch.entries()].map(([idx, stars]) => ({ branch: BRANCH_NAMES_VN[idx], stars })),
    auxStarsByBranch: [...auxPlacements.entries()].map(([key, idx]) => ({ star: AUX_STARS.find((s) => s.key === key), branch: BRANCH_NAMES_VN[idx] })),
    minorStarsByBranch: [...minorPlacements.entries()].map(([key, idx]) => ({ star: MINOR_STARS.find((s) => s.key === key), branch: BRANCH_NAMES_VN[idx] })),
    menhMinorStars: [...minorPlacements.entries()].filter(([, idx]) => idx === menhBranchIdx).map(([key]) => MINOR_STARS.find((s) => s.key === key)),
    tuHoa,
    yearStem: { index: stemIdx, hanja: STEM_NAMES[stemIdx] },
    quanLoc,
    taiBach,
    palacesPlacement,
    summary: `명궁(Mệnh)이 ${menhBranch.name}(${nayin.ganZhi}, 납음 ${nayin.name})에 위치하며 ${cuc.name}으로 자미(紫微)가 ${BRANCH_NAMES_VN[ziweiIdx].hanja}궁에 앉습니다. 명궁 주성은 ${starsText}로 ${primaryStar.keyword}의 역량을 발휘합니다. 년간 ${STEM_NAMES[stemIdx]}의 사화는 ${tuHoa.loc.host}·${tuHoa.quyen.host}·${tuHoa.khoa.host}·${tuHoa.ky.host}에 걸립니다.`,
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
 * 세궁(歲宮)은 당해 년지가 놓인 궁 — 통용 규칙.
 * @param {object} input { date: 'YYYY-MM-DD', targetYear: number, time?: string, unknownTime?: boolean }
 * @returns {object} 계산된 뜨비 유년운 객체
 */
export function calculateTuViAnnual(input = {}) {
  const chart = calculateTuVi(input);
  const targetYear = Number(input.targetYear || new Date().getFullYear());
  const yearBranchInfo = YEAR_BRANCH_VN[targetYear] || { branchIdx: ((targetYear - 4) % 12 + 12) % 12, name: '해당 연도' };

  const activePlacement = chart.palacesPlacement.find((p) => p.branch.index === yearBranchInfo.branchIdx) || chart.palacesPlacement[0];
  const activePalace = activePlacement.palace;
  const activeStars = (chart.starByBranch.find((s) => s.branch.index === yearBranchInfo.branchIdx)?.stars) || [];

  return {
    targetYear,
    yearBranch: yearBranchInfo,
    activePalace,
    activeBranch: activePlacement.branch,
    activeStars,
    primaryStar: chart.menhPalace.primaryStar,
    palaceTheme: `${activePalace.name} (${activePalace.meaning})의 영역이 활성화되는 해`,
    advice: `올해는 ${activePalace.role}에 주력할 때 가장 큰 결실을 맺습니다.`,
    summary: `${targetYear}년(${yearBranchInfo.name}) 베트남 뜨비에서는 ${activePlacement.branch.name}에 위치한 '${activePalace.name}'${activeStars.length ? `(${activeStars.map((s) => s.name).join(', ')})` : ''}이 당해 유년운의 중심 무대가 됩니다.`,
  };
}

/**
 * 특정 날짜(targetDate)의 베트남 뜨비 일운(Nhật Vận)을 계산합니다.
 * 일운의 궁 회전은 통용 규칙이 확립되지 않아 음력 일수 기반 간이 순환을 사용한다(β).
 * @param {object} input { date: 'YYYY-MM-DD', targetDate?: 'YYYY-MM-DD' }
 * @returns {object} 계산된 뜨비 일운 객체
 */
export function calculateTuViDaily(input = {}) {
  const chart = calculateTuVi(input);
  const targetDateStr = String(input.targetDate || new Date().toISOString().slice(0, 10)).trim();
  const todayLunar = describeSolarToLunar({ date: targetDateStr });

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
