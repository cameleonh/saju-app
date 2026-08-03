import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Solar } = require('lunar-javascript');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS = { 甲: '목', 乙: '목', 丙: '화', 丁: '화', 戊: '토', 己: '토', 庚: '금', 辛: '금', 壬: '수', 癸: '수' };
const POLARITY = { 甲: '양', 乙: '음', 丙: '양', 丁: '음', 戊: '양', 己: '음', 庚: '양', 辛: '음', 壬: '양', 癸: '음' };
const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
const CONTROLS = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };
const HARMONY = new Set(['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未']);
const CLASH = new Set(['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥']);
const MONTH_BOUNDARIES = [
  ['立春', '입춘'], ['惊蛰', '경칩'], ['清明', '청명'], ['立夏', '입하'], ['芒种', '망종'], ['小暑', '소서'],
  ['立秋', '입추'], ['白露', '백로'], ['寒露', '한로'], ['立冬', '입동'], ['大雪', '대설'], ['XIAO_HAN', '소한'],
];

export const ANNUAL_POLICY = Object.freeze({
  id: 'KR-ANNUAL-IPCHUN-1.0',
  version: '1.0.0',
  timezone: 'Asia/Seoul',
  supportedYears: [1900, 2099],
  boundary: 'ipchun-to-ipchun',
  solarTermSource: {
    id: 'lunar-javascript-shouxing',
    version: '1.7.7',
    sourceZone: 'UTC+08:00',
    targetZone: 'Asia/Seoul',
    offsetMinutes: 60,
  },
});

export const ANNUAL_PROFILE = Object.freeze({
  id: 'ziping-annual-basic',
  version: '1.0.0',
  label: '자평명리 파생 일간·월령·십신 관계',
  included: ['일간 기준 연간 십신', '출생 월지 맥락', '연지와 원국 지지의 충·육합'],
  excluded: ['격국 확정', '용신 선정', '신강·신약 점수', '조후·병약·통관', '형·파·해·특수합', '사건·건강·투자 결과 예측'],
});

export const ANNUAL_RULE_SET = Object.freeze({
  id: 'ziping-annual-cards',
  version: '1.0.0',
  relationPriority: ['clash', 'harmony', 'none'],
  suppression: 'missing required facts suppresses the dependent card',
});

const TEN_GOD_GUIDANCE = Object.freeze({
  비견: { theme: '내 기준과 동료의 기준을 함께 조율하기', keywords: ['주도성', '동료', '경계'], strength: '스스로 방향을 세우고 비슷한 역할의 사람과 나란히 움직이기 쉽습니다.', watch: '역할이 겹치면 작은 차이도 경쟁처럼 느낄 수 있습니다.', action: '결정권과 공동 책임을 문장으로 나눠 적어 보세요.' },
  겁재: { theme: '속도보다 역할과 자원 합의를 먼저 세우기', keywords: ['협상', '분담', '선택'], strength: '사람과 자원을 빠르게 모아 변화를 시작하는 힘을 살펴볼 수 있습니다.', watch: '기세만 앞서면 시간과 비용의 경계가 흐려질 수 있습니다.', action: '함께 쓰는 돈·시간·권한의 상한을 먼저 정해 보세요.' },
  식신: { theme: '꾸준히 만든 결과를 보이는 형태로 남기기', keywords: ['표현', '완성', '생활'], strength: '익숙한 기술을 반복 가능한 결과물로 다듬는 흐름에 주목할 수 있습니다.', watch: '편안한 방식만 고집하면 마감과 피드백이 늦어질 수 있습니다.', action: '한 주에 하나씩 완성해 공개할 작은 결과물을 정해 보세요.' },
  상관: { theme: '개선 아이디어를 검증 가능한 제안으로 바꾸기', keywords: ['개선', '표현', '검증'], strength: '불편한 점을 발견하고 더 나은 방식을 제안하는 힘을 살펴볼 수 있습니다.', watch: '표현이 앞서면 의도보다 비판으로 전달될 수 있습니다.', action: '문제·근거·대안을 한 장으로 정리한 뒤 공유해 보세요.' },
  편재: { theme: '기회를 넓게 보되 현금 흐름은 좁게 점검하기', keywords: ['기회', '연결', '현금흐름'], strength: '새로운 사람과 거래 가능성을 넓게 탐색하는 데 관심이 갈 수 있습니다.', watch: '가능성을 수익으로 단정하면 지출과 약속이 먼저 커질 수 있습니다.', action: '새 제안은 비용·회수 시점·중단 조건을 함께 적어 보세요.' },
  정재: { theme: '작은 반복을 안정적인 운영 기준으로 만들기', keywords: ['운영', '예산', '신뢰'], strength: '예산과 일정처럼 눈에 보이는 기준을 차분히 관리하기 좋습니다.', watch: '안정만 지키려 하면 필요한 실험까지 미룰 수 있습니다.', action: '고정비와 실험비를 분리하고 월 1회 점검해 보세요.' },
  편관: { theme: '높아진 책임을 우선순위와 회복 계획으로 다루기', keywords: ['책임', '집중', '대응'], strength: '명확한 과제와 긴장감이 집중을 돕는 장면을 살펴볼 수 있습니다.', watch: '모든 요청을 긴급하게 받으면 판단과 회복 시간이 줄어듭니다.', action: '이번 분기의 핵심 책임 세 가지와 하지 않을 일을 함께 적어 보세요.' },
  정관: { theme: '기준과 역할을 분명히 해 신뢰를 쌓기', keywords: ['기준', '책임', '신뢰'], strength: '절차와 역할을 정돈하고 꾸준히 신뢰를 쌓는 데 초점을 둘 수 있습니다.', watch: '정답을 지키려는 마음이 커지면 예외 상황에 경직될 수 있습니다.', action: '반드시 지킬 기준과 조정 가능한 기준을 구분해 보세요.' },
  편인: { theme: '낯선 관점을 작은 실험으로 확인하기', keywords: ['관찰', '재해석', '실험'], strength: '익숙한 문제를 다른 각도에서 다시 읽는 힘을 활용할 수 있습니다.', watch: '생각이 계속 갈라지면 실행 시점을 놓칠 수 있습니다.', action: '가설 하나를 정하고 일주일 안에 확인할 실험을 설계해 보세요.' },
  정인: { theme: '배운 것을 체계화해 다음 선택의 근거로 삼기', keywords: ['학습', '기록', '지원'], strength: '자료를 모으고 배운 내용을 자기 언어로 정리하는 흐름에 주목할 수 있습니다.', watch: '준비가 충분해질 때까지 기다리면 실제 경험이 늦어질 수 있습니다.', action: '배운 내용을 적용할 작은 과제와 피드백 날짜를 정해 보세요.' },
});

function assertTargetYear(value) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < ANNUAL_POLICY.supportedYears[0] || year > ANNUAL_POLICY.supportedYears[1]) {
    throw new Error(`targetYear must be an integer from ${ANNUAL_POLICY.supportedYears[0]} to ${ANNUAL_POLICY.supportedYears[1]}`);
  }
  return year;
}

function parseSolarWallTime(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`unsupported solar-term value: ${value}`);
  return match.slice(1).map(Number);
}

function toSeoulIso(solar) {
  const [year, month, day, hour, minute, second] = parseSolarWallTime(solar.toYmdHms());
  const shifted = new Date(Date.UTC(year, month - 1, day, hour + 1, minute, second));
  const pad = (value) => String(value).padStart(2, '0');
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}+09:00`;
}

function jieQiTable(year) {
  return Solar.fromYmdHms(year, 2, 1, 12, 0, 0).getLunar().getJieQiTable();
}

export function getIpchunBoundary(targetYear) {
  const year = assertTargetYear(targetYear);
  const current = jieQiTable(year).立春;
  const next = jieQiTable(year + 1).立春;
  if (!current || !next) throw new Error(`ephemeris data is unavailable for ${year}`);
  return { start: toSeoulIso(current), end: toSeoulIso(next) };
}

export function getAnnualPillar(targetYear) {
  const year = assertTargetYear(targetYear);
  const cycle = ((year - 1984) % 60 + 60) % 60;
  return { stem: STEMS[cycle % 10], branch: BRANCHES[cycle % 12], text: `${STEMS[cycle % 10]}${BRANCHES[cycle % 12]}` };
}

export function tenGodFor(dayStem, annualStem) {
  if (!POLARITY[dayStem] || !POLARITY[annualStem]) return null;
  const dayElement = ELEMENTS[dayStem];
  const annualElement = ELEMENTS[annualStem];
  const samePolarity = POLARITY[dayStem] === POLARITY[annualStem];
  if (dayElement === annualElement) return samePolarity ? '비견' : '겁재';
  if (GENERATES[dayElement] === annualElement) return samePolarity ? '식신' : '상관';
  if (CONTROLS[dayElement] === annualElement) return samePolarity ? '편재' : '정재';
  if (CONTROLS[annualElement] === dayElement) return samePolarity ? '편관' : '정관';
  if (GENERATES[annualElement] === dayElement) return samePolarity ? '편인' : '정인';
  return null;
}

function relationBetween(left, right) {
  const pair = `${left}${right}`;
  const reverse = `${right}${left}`;
  if (CLASH.has(pair) || CLASH.has(reverse)) return 'clash';
  if (HARMONY.has(pair) || HARMONY.has(reverse)) return 'harmony';
  return 'none';
}

function buildBranchRelations(annualBranch, natalBranches) {
  return natalBranches.map((branch, index) => ({ natalPosition: ['year', 'month', 'day', 'hour'][index] || `branch-${index}`, natalBranch: branch, annualBranch, relation: relationBetween(annualBranch, branch) })).filter(({ relation }) => relation !== 'none');
}

function source(detail) {
  return { policyId: ANNUAL_POLICY.id, policyVersion: ANNUAL_POLICY.version, ruleSetVersion: ANNUAL_RULE_SET.version, detail };
}

function fact(id, label, value, detail, status = 'calculated', sourceDetail = 'deterministic annual engine') {
  return { id, label, value, detail, source: source(sourceDetail), status };
}

function compactRelationText(relations) {
  if (!relations.length) return 'v1에서 지원하는 충·육합 관계 없음';
  return relations.map(({ natalPosition, natalBranch, relation }) => `${natalPosition}:${natalBranch} ${relation === 'clash' ? '충' : '육합'}`).join(' · ');
}

function buildFacts({ targetYear, pillar, boundary, dayStem, monthBranch, natalBranches, unknownTime }) {
  const tenGod = tenGodFor(dayStem, pillar.stem);
  if (!tenGod) throw new Error('natal.dayStem must be one of the ten heavenly stems');
  const relations = buildBranchRelations(pillar.branch, natalBranches);
  return [
    fact('annual.year.pillar', '연운 간지', pillar.text, `${targetYear}년 입춘부터 적용되는 연운 간지입니다.`),
    fact('annual.year.stem', '연간', pillar.stem, `${pillar.text}의 천간은 ${pillar.stem}입니다.`),
    fact('annual.year.branch', '연지', pillar.branch, `${pillar.text}의 지지는 ${pillar.branch}입니다.`),
    fact('annual.stem.tenGodToDayMaster', '연간의 십신', tenGod, `일간 ${dayStem}을 기준으로 연간 ${pillar.stem}은 ${tenGod} 관계입니다.`, 'interpretive', 'day-master ten-god relation table'),
    fact('annual.branch.relationsToNatal', '연지와 원국의 관계', relations, compactRelationText(relations), relations.length ? 'interpretive' : 'limited', 'v1 clash and six-harmony pair table'),
    fact('annual.monthCommand.context', '태어난 달의 맥락', monthBranch, `출생 월지 ${monthBranch}는 원국의 계절 맥락으로만 함께 봅니다. 강약이나 용신 점수로 바꾸지 않습니다.`, 'interpretive', 'bounded month-command context'),
    fact('annual.boundary.ipchun', '입춘 적용 범위', boundary, `${boundary.start}부터 ${boundary.end} 직전까지 적용합니다.`, 'calculated', 'versioned solar-term ephemeris'),
    fact('annual.timeDependentRules', '시각 의존 규칙', unknownTime ? 'suppressed' : 'not-used-in-v1', unknownTime ? '출생 시각이 없어 시각 의존 규칙은 억제합니다.' : 'v1 연운 카드는 출생 시각 의존 규칙을 사용하지 않습니다.', unknownTime ? 'unsupported' : 'limited'),
    fact('annual.policy', '연운 정책', `${ANNUAL_POLICY.id}@${ANNUAL_POLICY.version}`, '입춘부터 다음 입춘까지를 한 연운으로 봅니다.'),
  ];
}

function findFact(facts, id) {
  return facts.find((item) => item.id === id);
}

function makeCard(cardType, title, summary, keywords, bullets, action, watch, evidence, ruleId) {
  return { schemaVersion: 'annual-card.v1', scope: 'annual', cardType, title, summary, keywords: keywords.slice(0, 3), bullets: bullets.slice(0, 3), action, watch, evidence: evidence.slice(0, 3), rule: { id: ruleId, ruleSetVersion: ANNUAL_RULE_SET.version }, boundary: '전통 해석을 자기 점검에 쓰는 자료이며 사실이나 사건 예측이 아닙니다.' };
}

export function buildAnnualCards(facts, targetYear) {
  const required = ['annual.year.pillar', 'annual.stem.tenGodToDayMaster', 'annual.branch.relationsToNatal', 'annual.monthCommand.context', 'annual.boundary.ipchun', 'annual.policy'];
  if (required.some((id) => !findFact(facts, id))) return [];
  const pillar = findFact(facts, 'annual.year.pillar').value;
  const tenGod = findFact(facts, 'annual.stem.tenGodToDayMaster').value;
  const relations = findFact(facts, 'annual.branch.relationsToNatal').value;
  const monthBranch = findFact(facts, 'annual.monthCommand.context').value;
  const guidance = TEN_GOD_GUIDANCE[tenGod];
  if (!guidance) return [];
  const clashes = relations.filter(({ relation }) => relation === 'clash');
  const harmonies = relations.filter(({ relation }) => relation === 'harmony');
  const relationSummary = clashes.length ? '기존 방식과 새 요구가 부딪히는 장면을 먼저 확인하세요.' : harmonies.length ? '협력하기 쉬운 장면에서도 역할과 기대를 말로 확인하세요.' : '특정 관계를 억지로 붙이지 않고 십신과 실제 상황을 함께 확인하세요.';
  const cards = [
    makeCard('cover', `${targetYear}년 ${pillar} 연운`, guidance.theme, guidance.keywords, [`연간의 십신: ${tenGod}`, `출생 월지 ${monthBranch} 맥락을 함께 확인`, '입춘부터 다음 입춘 직전까지 적용'], guidance.action, guidance.watch, ['annual.year.pillar', 'annual.stem.tenGodToDayMaster', 'annual.boundary.ipchun'], 'annual.cover'),
    makeCard('overall', '전체 흐름', guidance.theme, [tenGod, '균형', '점검'], [guidance.strength, relationSummary, '실제 일정·관계·자원 정보를 함께 확인하세요.'], guidance.action, guidance.watch, ['annual.stem.tenGodToDayMaster', 'annual.branch.relationsToNatal'], 'annual.overall'),
    makeCard('work', '일과 사회 활동', `${tenGod}의 장점을 역할과 결과물에 연결합니다.`, ['역할', '협업', '결과'], [guidance.strength, '역할·마감·결정권을 분리하면 해석을 행동으로 바꾸기 쉽습니다.', relationSummary], '이번 분기의 역할·결과물·검토 날짜를 한 줄씩 적어 보세요.', '승진·이직·평가 결과를 보장하는 뜻으로 읽지 마세요.', ['annual.stem.tenGodToDayMaster', 'annual.branch.relationsToNatal'], 'annual.work'),
    makeCard('money', '돈과 현금 흐름', '기회보다 확인 가능한 숫자를 먼저 봅니다.', ['예산', '현금흐름', '중단조건'], ['고정비와 선택 지출을 분리하세요.', '수입·비용·회수 시점을 같은 표에 적으세요.', '투자나 계약은 독립적인 자료와 전문가 검토를 우선하세요.'], '큰 지출에는 하루 이상의 재검토 시간을 두세요.', '수익·손실·재산 변화를 예측하지 않습니다.', ['annual.stem.tenGodToDayMaster', 'annual.policy'], 'annual.money'),
    makeCard('relationships', '관계와 협업', relationSummary, ['대화', '경계', '합의'], [clashes.length ? '충이 표시된 자리는 변화 압력의 은유로만 보고 실제 갈등을 단정하지 마세요.' : 'v1 충 관계가 표시되지 않았다고 갈등이 없다는 뜻은 아닙니다.', harmonies.length ? '육합이 표시된 자리는 협력 가능성의 은유이며 관계 결과를 보장하지 않습니다.' : 'v1 육합이 표시되지 않았다고 협력이 어렵다는 뜻은 아닙니다.', '기대·기한·거절 가능한 범위를 직접 확인하세요.'], '중요한 약속은 각자의 이해를 한 문장씩 말해 확인하세요.', '결별·배신·혼인 같은 사건을 단정하지 않습니다.', ['annual.branch.relationsToNatal', 'annual.monthCommand.context'], 'annual.relationships'),
    makeCard('growth', '성장과 경험', '배운 것을 작은 실행과 피드백으로 연결합니다.', ['학습', '실험', '피드백'], [guidance.action, '한 번의 해석보다 반복 기록에서 실제 패턴을 찾으세요.', '새 기술은 적용 장면과 검토 날짜를 함께 정하세요.'], '한 달 동안 관찰할 행동 지표 하나를 고르세요.', '사주 분류를 능력이나 한계의 고정 판정으로 쓰지 마세요.', ['annual.stem.tenGodToDayMaster', 'annual.monthCommand.context'], 'annual.growth'),
    makeCard('action', '실행 체크리스트', '세 가지 행동과 세 가지 주의점을 짧게 확인합니다.', ['실행', '검토', '회복'], [guidance.action, '중요한 선택은 실제 자료와 이해관계자 의견을 확인하세요.', '월말에 기록을 돌아보고 다음 행동 하나만 조정하세요.'], '지금 할 수 있는 가장 작은 행동을 30분 일정으로 잡으세요.', `${guidance.watch} 의료·법률·재무 결정은 해당 전문가와 상의하세요.`, ['annual.stem.tenGodToDayMaster', 'annual.branch.relationsToNatal', 'annual.policy'], 'annual.action'),
    makeCard('method', '방법과 한계', '계산 사실, 전통 규칙, 실천 질문을 구분합니다.', ['근거', '제외규칙', '안전'], [`적용: ${ANNUAL_PROFILE.included.join(' · ')}`, `제외: ${ANNUAL_PROFILE.excluded.slice(0, 3).join(' · ')}`, `프로필 ${ANNUAL_PROFILE.id}@${ANNUAL_PROFILE.version}`], '각 문장의 근거 ID를 열어 계산값과 해석 범위를 확인하세요.', '격국·용신·조후와 고위험 사건 예측은 이 버전에서 제공하지 않습니다.', ['annual.policy', 'annual.boundary.ipchun'], 'annual.method'),
  ];
  return cards.map((card) => ({ ...card, targetYear, yearPillar: pillar, profile: { id: ANNUAL_PROFILE.id, version: ANNUAL_PROFILE.version } }));
}

function monthPillar(yearStemIndex, monthIndex) {
  const startStemByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const branchIndex = (2 + monthIndex) % 12;
  const stemIndex = (startStemByYearStem[yearStemIndex] + monthIndex) % 10;
  return { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex], text: `${STEMS[stemIndex]}${BRANCHES[branchIndex]}` };
}

function buildMonthlyFlow(targetYear, annualPillar, natal) {
  const table = jieQiTable(targetYear);
  const nextTable = jieQiTable(targetYear + 1);
  return MONTH_BOUNDARIES.map(([key, label], index) => {
    const startSolar = table[key];
    const nextKey = MONTH_BOUNDARIES[index + 1]?.[0];
    const endSolar = nextKey ? table[nextKey] : nextTable.立春;
    if (!startSolar || !endSolar) return { monthIndex: index + 1, status: 'unsupported', label, reason: 'solar-term boundary unavailable' };
    const pillar = monthPillar(STEMS.indexOf(annualPillar.stem), index);
    const tenGod = tenGodFor(natal.dayStem, pillar.stem);
    const relations = buildBranchRelations(pillar.branch, natal.branches);
    const guidance = TEN_GOD_GUIDANCE[tenGod];
    return {
      monthIndex: index + 1,
      label: `${label} 절기월`,
      pillar: pillar.text,
      effectiveRange: { start: toSeoulIso(startSolar), end: toSeoulIso(endSolar) },
      theme: guidance?.theme || '지원하지 않는 십신 관계',
      use: guidance?.action || '지원 규칙을 확인해 주세요.',
      watch: guidance?.watch || '지원되지 않는 해석은 만들지 않습니다.',
      evidence: ['annual.monthCommand.context', 'annual.policy'],
      relations,
      status: guidance ? 'interpretive' : 'unsupported',
    };
  });
}

function stableHash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function calculateAnnualContentHash(value) {
  if (!value || typeof value !== 'object') throw new Error('annual reading must be an object');
  const { contentHash: _contentHash, ...content } = value;
  return stableHash(content);
}

export function createAnnualReading(input) {
  if (!input || typeof input !== 'object') throw new Error('annual input must be an object');
  const targetYear = assertTargetYear(input.targetYear);
  const natal = input.natal || {};
  const dayStem = natal.dayStem;
  const monthBranch = natal.monthBranch;
  const branches = Array.isArray(natal.branches) ? natal.branches.filter((item) => BRANCHES.includes(item)) : [];
  if (!STEMS.includes(dayStem)) throw new Error('natal.dayStem must be one of the ten heavenly stems');
  if (!BRANCHES.includes(monthBranch)) throw new Error('natal.monthBranch must be one of the twelve earthly branches');
  if (branches.length < 3 || branches.length > 4) throw new Error('natal.branches must contain three or four earthly branches');
  const pillar = getAnnualPillar(targetYear);
  const boundary = getIpchunBoundary(targetYear);
  const facts = buildFacts({ targetYear, pillar, boundary, dayStem, monthBranch, natalBranches: branches, unknownTime: Boolean(natal.unknownTime) });
  const cards = buildAnnualCards(facts, targetYear);
  const monthlyFlow = buildMonthlyFlow(targetYear, pillar, { dayStem, branches });
  const result = {
    schemaVersion: 'annual-reading.v1',
    readingScope: 'annual',
    targetYear,
    yearPillar: pillar.text,
    effectiveRange: boundary,
    timezone: ANNUAL_POLICY.timezone,
    calculationPolicy: ANNUAL_POLICY,
    chartPolicy: input.chartPolicy || null,
    interpretationProfile: ANNUAL_PROFILE,
    ruleSet: ANNUAL_RULE_SET,
    facts,
    cards,
    monthlyFlow,
    unsupported: ANNUAL_PROFILE.excluded,
  };
  return { ...result, contentHash: stableHash(result) };
}

export function annualYearAt(instant, targetYear) {
  const boundary = getIpchunBoundary(targetYear);
  const value = Date.parse(instant);
  if (!Number.isFinite(value)) throw new Error('instant must be an ISO date-time');
  if (value < Date.parse(boundary.start)) return targetYear - 1;
  if (value >= Date.parse(boundary.end)) return targetYear + 1;
  return targetYear;
}
