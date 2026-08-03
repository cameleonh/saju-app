const SAFETY_BOUNDARY = '전통 해석을 자기 점검에 쓰는 자료이며 사실이나 사건 예측이 아닙니다.';
const PROHIBITED_CLAIMS = Object.freeze(['death', 'illness', 'litigation', 'investment-return', 'divorce', 'guaranteed-outcome']);

export const TEN_GOD_GUIDANCE = Object.freeze({
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

const safety = () => Object.freeze({
  onUnsupported: 'suppress',
  rewrite: 'Use a bounded tendency plus a real-world check; never assert a future event.',
  prohibitedClaims: PROHIBITED_CLAIMS,
});

const rule = (definition) => Object.freeze({
  version: '1.1.0',
  prohibitedStates: Object.freeze([]),
  conflictingStates: Object.freeze([]),
  safety: safety(),
  ...definition,
  requiredFactIds: Object.freeze(definition.requiredFactIds),
  claimCategories: Object.freeze(definition.claimCategories),
  copyVariants: Object.freeze(definition.copyVariants),
});

export const ANNUAL_CARD_RULES = Object.freeze([
  rule({
    id: 'annual.cover', cardType: 'cover', priority: 100,
    requiredFactIds: ['annual.year.pillar', 'annual.stem.tenGodToDayMaster', 'annual.boundary.ipchun'],
    claimCategories: ['theme', 'boundary', 'practical-prompt'],
    copyVariants: { default: { title: '{targetYear}년 {pillar} 연운', summary: '{theme}', keywords: '{guidanceKeywords}', bullets: ['연간의 십신: {tenGod}', '입춘부터 다음 입춘 직전까지 적용', '전통 해석과 실제 생활 정보를 함께 확인'], action: '{guidanceAction}', watch: '{guidanceWatch}' } },
  }),
  rule({
    id: 'annual.overall', cardType: 'overall', priority: 90,
    requiredFactIds: ['annual.stem.tenGodToDayMaster', 'annual.branch.relationsToNatal'],
    claimCategories: ['theme', 'relationship-context', 'practical-prompt'],
    copyVariants: { default: { title: '전체 흐름', summary: '{theme}', keywords: ['{tenGod}', '균형', '점검'], bullets: ['{guidanceStrength}', '{relationSummary}', '실제 일정·관계·자원 정보를 함께 확인하세요.'], action: '{guidanceAction}', watch: '{guidanceWatch}' } },
  }),
  rule({
    id: 'annual.work', cardType: 'work', priority: 80,
    requiredFactIds: ['annual.stem.tenGodToDayMaster', 'annual.branch.relationsToNatal'],
    claimCategories: ['work', 'relationship-context', 'practical-prompt'],
    copyVariants: { default: { title: '일과 사회 활동', summary: '{tenGod}의 장점을 역할과 결과물에 연결합니다.', keywords: ['역할', '협업', '결과'], bullets: ['{guidanceStrength}', '역할·마감·결정권을 분리하면 해석을 행동으로 바꾸기 쉽습니다.', '{relationSummary}'], action: '이번 분기의 역할·결과물·검토 날짜를 한 줄씩 적어 보세요.', watch: '승진·이직·평가 결과를 보장하는 뜻으로 읽지 마세요.' } },
  }),
  rule({
    id: 'annual.money', cardType: 'money', priority: 70,
    requiredFactIds: ['annual.stem.tenGodToDayMaster', 'annual.policy'],
    claimCategories: ['money', 'safety', 'practical-prompt'],
    copyVariants: { default: { title: '돈과 현금 흐름', summary: '기회보다 확인 가능한 숫자를 먼저 봅니다.', keywords: ['예산', '현금흐름', '중단조건'], bullets: ['고정비와 선택 지출을 분리하세요.', '수입·비용·회수 시점을 같은 표에 적으세요.', '투자나 계약은 독립적인 자료와 전문가 검토를 우선하세요.'], action: '큰 지출에는 하루 이상의 재검토 시간을 두세요.', watch: '수익·손실·재산 변화를 예측하지 않습니다.' } },
  }),
  rule({
    id: 'annual.relationships', cardType: 'relationships', priority: 60,
    requiredFactIds: ['annual.branch.relationsToNatal', 'annual.monthCommand.context'],
    conflictingStates: Object.freeze(['clash', 'harmony']),
    claimCategories: ['relationships', 'conflict-priority', 'practical-prompt'],
    copyVariants: {
      clash: { title: '관계와 협업', summary: '{relationSummary}', keywords: ['대화', '경계', '합의'], bullets: ['충이 표시된 자리는 변화 압력의 은유로만 보고 실제 갈등을 단정하지 마세요.', '{harmonyBullet}', '기대·기한·거절 가능한 범위를 직접 확인하세요.'], action: '중요한 약속은 각자의 이해를 한 문장씩 말해 확인하세요.', watch: '결별·배신·혼인 같은 사건을 단정하지 않습니다.' },
      harmony: { title: '관계와 협업', summary: '{relationSummary}', keywords: ['대화', '경계', '합의'], bullets: ['v1 충 관계가 표시되지 않았다고 갈등이 없다는 뜻은 아닙니다.', '육합이 표시된 자리는 협력 가능성의 은유이며 관계 결과를 보장하지 않습니다.', '기대·기한·거절 가능한 범위를 직접 확인하세요.'], action: '중요한 약속은 각자의 이해를 한 문장씩 말해 확인하세요.', watch: '결별·배신·혼인 같은 사건을 단정하지 않습니다.' },
      none: { title: '관계와 협업', summary: '{relationSummary}', keywords: ['대화', '경계', '합의'], bullets: ['v1 충 관계가 표시되지 않았다고 갈등이 없다는 뜻은 아닙니다.', 'v1 육합이 표시되지 않았다고 협력이 어렵다는 뜻은 아닙니다.', '기대·기한·거절 가능한 범위를 직접 확인하세요.'], action: '중요한 약속은 각자의 이해를 한 문장씩 말해 확인하세요.', watch: '결별·배신·혼인 같은 사건을 단정하지 않습니다.' },
    },
  }),
  rule({
    id: 'annual.growth', cardType: 'growth', priority: 50,
    requiredFactIds: ['annual.stem.tenGodToDayMaster', 'annual.monthCommand.context'],
    claimCategories: ['growth', 'practical-prompt'],
    copyVariants: { default: { title: '성장과 경험', summary: '배운 것을 작은 실행과 피드백으로 연결합니다.', keywords: ['학습', '실험', '피드백'], bullets: ['{guidanceAction}', '한 번의 해석보다 반복 기록에서 실제 패턴을 찾으세요.', '새 기술은 적용 장면과 검토 날짜를 함께 정하세요.'], action: '한 달 동안 관찰할 행동 지표 하나를 고르세요.', watch: '사주 분류를 능력이나 한계의 고정 판정으로 쓰지 마세요.' } },
  }),
  rule({
    id: 'annual.action', cardType: 'action', priority: 40,
    requiredFactIds: ['annual.stem.tenGodToDayMaster', 'annual.branch.relationsToNatal', 'annual.policy'],
    claimCategories: ['action', 'safety', 'practical-prompt'],
    copyVariants: { default: { title: '실행 체크리스트', summary: '세 가지 행동과 세 가지 주의점을 짧게 확인합니다.', keywords: ['실행', '검토', '회복'], bullets: ['{guidanceAction}', '중요한 선택은 실제 자료와 이해관계자 의견을 확인하세요.', '월말에 기록을 돌아보고 다음 행동 하나만 조정하세요.'], action: '지금 할 수 있는 가장 작은 행동을 30분 일정으로 잡으세요.', watch: '{guidanceWatch} 의료·법률·재무 결정은 해당 전문가와 상의하세요.' } },
  }),
  rule({
    id: 'annual.method', cardType: 'method', priority: 30,
    requiredFactIds: ['annual.policy', 'annual.boundary.ipchun'],
    claimCategories: ['method', 'exclusions', 'safety'],
    copyVariants: { default: { title: '방법과 한계', summary: '계산 사실, 전통 규칙, 실천 질문을 구분합니다.', keywords: ['근거', '제외규칙', '안전'], bullets: ['적용: {included}', '제외: {excluded}', '프로필 {profileId}@{profileVersion}'], action: '각 문장의 근거 ID를 열어 계산값과 해석 범위를 확인하세요.', watch: '격국·용신·조후와 고위험 사건 예측은 이 버전에서 제공하지 않습니다.' } },
  }),
]);

export const MONTHLY_RULE = rule({
  id: 'annual.month.basic', cardType: 'monthly-flow', priority: 20,
  requiredFactIds: ['{pillarFactId}', '{boundaryFactId}', '{tenGodFactId}', '{relationFactId}'],
  claimCategories: ['monthly-theme', 'boundary', 'practical-prompt'],
  copyVariants: { default: { theme: '{theme}', use: '{guidanceAction}', watch: '{guidanceWatch}' } },
});

export const ANNUAL_RULE_SET = Object.freeze({
  id: 'ziping-annual-cards',
  version: '1.1.0',
  relationPriority: Object.freeze(['clash', 'harmony', 'none']),
  suppression: 'Only a rule whose required facts are missing is suppressed.',
  rules: ANNUAL_CARD_RULES,
  monthlyRule: MONTHLY_RULE,
});

const factMap = (facts) => new Map(facts.map((item) => [item.id, item]));

function relationState(relations, priority) {
  const present = new Set(relations.map(({ relation }) => relation));
  return priority.find((state) => state === 'none' || present.has(state)) || 'none';
}

function fill(template, context) {
  if (Array.isArray(template)) return template.map((value) => fill(value, context));
  if (template === '{guidanceKeywords}') return context.guidanceKeywords;
  return String(template).replace(/\{([A-Za-z]+)\}/g, (_match, key) => String(context[key] ?? ''));
}

function contextFor(facts, targetYear, profile, ruleSet) {
  const byId = factMap(facts);
  const tenGod = byId.get('annual.stem.tenGodToDayMaster')?.value;
  const relations = byId.get('annual.branch.relationsToNatal')?.value || [];
  const state = relationState(relations, ruleSet.relationPriority);
  const guidance = TEN_GOD_GUIDANCE[tenGod] || {};
  const clashes = relations.filter(({ relation }) => relation === 'clash');
  const harmonies = relations.filter(({ relation }) => relation === 'harmony');
  return {
    targetYear,
    pillar: byId.get('annual.year.pillar')?.value,
    tenGod,
    monthBranch: byId.get('annual.monthCommand.context')?.value,
    theme: guidance.theme,
    guidanceKeywords: guidance.keywords || [],
    guidanceStrength: guidance.strength,
    guidanceAction: guidance.action,
    guidanceWatch: guidance.watch,
    relationState: state,
    relationSummary: state === 'clash'
      ? '기존 방식과 새 요구가 부딪히는 장면을 먼저 확인하세요.'
      : state === 'harmony'
        ? '협력하기 쉬운 장면에서도 역할과 기대를 말로 확인하세요.'
        : '특정 관계를 억지로 붙이지 않고 십신과 실제 상황을 함께 확인하세요.',
    harmonyBullet: harmonies.length
      ? '육합이 표시된 자리도 협력 가능성의 은유이며 관계 결과를 보장하지 않습니다.'
      : 'v1 육합 관계가 표시되지 않았다고 협력이 어렵다는 뜻은 아닙니다.',
    clashes,
    harmonies,
    included: profile.included.join(' · '),
    excluded: profile.excluded.slice(0, 4).join(' · '),
    profileId: profile.id,
    profileVersion: profile.version,
  };
}

export function buildAnnualCards(facts, targetYear, profile, ruleSet = ANNUAL_RULE_SET) {
  const byId = factMap(facts);
  const context = contextFor(facts, targetYear, profile, ruleSet);
  const cards = [];
  const suppressedRules = [];
  const claimTrace = [];
  for (const currentRule of [...ruleSet.rules].sort((left, right) => right.priority - left.priority)) {
    const missingFactIds = currentRule.requiredFactIds.filter((id) => !byId.has(id));
    if (missingFactIds.length) {
      suppressedRules.push({ ruleId: currentRule.id, ruleVersion: currentRule.version, reason: 'missing-required-facts', missingFactIds });
      continue;
    }
    if (currentRule.requiredFactIds.includes('annual.stem.tenGodToDayMaster') && !TEN_GOD_GUIDANCE[context.tenGod]) {
      suppressedRules.push({ ruleId: currentRule.id, ruleVersion: currentRule.version, reason: 'unsupported-ten-god', missingFactIds: [] });
      continue;
    }
    const variant = currentRule.copyVariants[context.relationState] ? context.relationState : 'default';
    const copy = currentRule.copyVariants[variant];
    const traces = currentRule.claimCategories.map((category) => ({
      claimId: `${currentRule.id}.${category}`,
      cardType: currentRule.cardType,
      category,
      ruleId: currentRule.id,
      ruleVersion: currentRule.version,
      factIds: [...currentRule.requiredFactIds],
    }));
    claimTrace.push(...traces);
    cards.push({
      schemaVersion: 'annual-card.v1',
      scope: 'annual',
      targetYear,
      yearPillar: context.pillar,
      profile: { id: profile.id, version: profile.version },
      cardType: currentRule.cardType,
      title: fill(copy.title, context),
      summary: fill(copy.summary, context),
      keywords: fill(copy.keywords, context).slice(0, 3),
      bullets: fill(copy.bullets, context).slice(0, 3),
      action: fill(copy.action, context),
      watch: fill(copy.watch, context),
      evidence: currentRule.requiredFactIds.slice(0, 3),
      rule: { id: currentRule.id, version: currentRule.version, ruleSetVersion: ruleSet.version, priority: currentRule.priority, variant },
      claimTrace: traces,
      boundary: SAFETY_BOUNDARY,
    });
  }
  return { cards, suppressedRules, claimTrace };
}
