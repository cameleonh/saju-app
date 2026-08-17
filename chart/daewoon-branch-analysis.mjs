// chart/daewoon-branch-analysis.mjs
// 대운 지지(地支) 분석 — 충·합(육합/삼합)·형·해 + 오행 생극
// KR-DAEWOON-1.0 정책의 의미론적 해석 보조 모듈

const BRANCH_HANGUL = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
  '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
};

const BRANCH_ELEMENT = {
  '子': '수', '丑': '토', '寅': '목', '卯': '목', '辰': '토', '巳': '화',
  '午': '화', '未': '토', '申': '금', '酉': '금', '戌': '토', '亥': '수',
};

const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
const CONTROLS = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };

// 충(沖) — 6충
const CLASH = new Set(['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥']);

// 육합(六合) — 6합
const SIX_HARMONY = new Set(['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未']);

// 삼합(三合) — 3조
const THREE_HARMONY = [
  { name: '신자진(申子辰) 수국', members: new Set(['申', '子', '辰']), element: '수' },
  { name: '해묘미(亥卯未) 목국', members: new Set(['亥', '卯', '未']), element: '목' },
  { name: '인오술(寅午戌) 화국', members: new Set(['寅', '午', '戌']), element: '화' },
  { name: '사유축(巳酉丑) 금국', members: new Set(['巳', '酉', '丑']), element: '금' },
];

// 원진(元瞋) — 서로 거슬리는 기운
const RESENTMENT = new Set(['子未', '丑午', '寅巳', '卯辰', '申亥', '酉戌']);

// 형(刑) — 4종
const PUNISHMENT = [
  { pair: '寅巳申', type: '무은지형(無恩之刑)', desc: '은혜를 모르는 형 — 베풂에 대한 배은이 올 수 있는 시기' },
  { pair: '丑戌未', type: '지지호형(持勢之刑)', desc: '세력을 믿고 다투는 형 — 권력이나 힘에 의한 갈등' },
  { pair: '子卯', type: '무례지형(無禮之刑)', desc: '예의가 없는 형 — 관계에서 무례나 실수가 늘어남' },
  { pair: '辰午酉亥', type: '자형(自刑)', desc: '스스로를 형하는 기운 — 자책, 과도한 자기 압박' },
];

// 해(害) — 6해
const HARM = new Set(['戌酉', '子未', '丑午', '寅巳', '卯辰', '申亥']);

function reversePair(pair) {
  return pair[1] + pair[0];
}

function hasSet(set, left, right) {
  return set.has(`${left}${right}`) || set.has(`${right}${left}`);
}

/**
 * 대운 지지 ↔ 원국 지지 간의 모든 상호작용을 분석
 *
 * @param {string} daewoonBranch - 대운 지지 (예: '戌')
 * @param {string[]} natalBranches - 원국 사주 지지 [연지, 월지, 일지, 시지]
 * @param {string} dayStemElement - 일간 오행 (예: '토')
 * @returns {object[]} 분석 결과 배열
 */
export function analyzeDaewoonBranch(daewoonBranch, natalBranches, dayStemElement) {
  if (!daewoonBranch || !BRANCH_ELEMENT[daewoonBranch]) return [];
  const branches = (natalBranches || []).filter((b) => b && BRANCH_ELEMENT[b]);
  const results = [];
  const daewoonElement = BRANCH_ELEMENT[daewoonBranch];

  for (let i = 0; i < branches.length; i++) {
    const natalBranch = branches[i];
    const position = ['연지', '월지', '일지', '시지'][i] || `지지-${i}`;
    const interactions = [];

    // 충(沖)
    if (hasSet(CLASH, daewoonBranch, natalBranch)) {
      interactions.push({
        type: 'clash',
        name: '충(沖)',
        severity: 'strong',
        effect: `${BRANCH_HANGUL[daewoonBranch]} ↔ ${BRANCH_HANGUL[natalBranch]} 충 — 큰 변화와 긴장. 자리가 흔들리지만 새 방향이 열립니다.`,
      });
    }

    // 육합(六合)
    if (hasSet(SIX_HARMONY, daewoonBranch, natalBranch)) {
      interactions.push({
        type: 'six-harmony',
        name: '육합(六合)',
        severity: 'gentle',
        effect: `${BRANCH_HANGUL[daewoonBranch]} ↔ ${BRANCH_HANGUL[natalBranch]} 육합 — 조화와 협력. 인연과 기회가 자연스럽게 맺힙니다.`,
      });
    }

    // 삼합(三合) — 대운 지지가 원국 두 지지와 삼합을 이루는지
    for (const triad of THREE_HARMONY) {
      if (triad.members.has(daewoonBranch) && triad.members.has(natalBranch)) {
        const thirdNeeded = [...triad.members].find((b) => b !== daewoonBranch && b !== natalBranch);
        const thirdPresent = branches.some((b, j) => j !== i && b === thirdNeeded);
        if (thirdPresent) {
          interactions.push({
            type: 'three-harmony',
            name: `삼합 ${triad.name}`,
            severity: 'strong-positive',
            effect: `${triad.name} ${triad.element}국이 완성 — 강력한 조화. ${triad.element} 기운이 10년간 흐릅니다.`,
          });
        } else {
          interactions.push({
            type: 'three-harmony-partial',
            name: `삼합 ${triad.name} (반합)`,
            severity: 'mild-positive',
            effect: `${BRANCH_HANGUL[daewoonBranch]}·${BRANCH_HANGUL[natalBranch]} 반합 — ${triad.element}국의 일부. 인연이 맺히는 중.`,
          });
        }
      }
    }

    // 원진(元瞋)
    if (hasSet(RESENTMENT, daewoonBranch, natalBranch)) {
      interactions.push({
        type: 'resentment',
        name: '원진(元瞋)',
        severity: 'mild-negative',
        effect: `${BRANCH_HANGUL[daewoonBranch]} ↔ ${BRANCH_HANGUL[natalBranch]} 원진 — 거슬림과 짜증. 작은 불만이 쌓이지 않도록 주의.`,
      });
    }

    // 해(害)
    if (hasSet(HARM, daewoonBranch, natalBranch)) {
      interactions.push({
        type: 'harm',
        name: '해(害)',
        severity: 'mild-negative',
        effect: `${BRANCH_HANGUL[daewoonBranch]} ↔ ${BRANCH_HANGUL[natalBranch]} 해 — 방해와 손해. 계획이 의도치 않게 꼬일 수 있습니다.`,
      });
    }

    // 형(刑) — 단일 지지가 아닌 2-3지지 조합
    for (const pun of PUNISHMENT) {
      const chars = [...pun.pair];
      if (chars.length === 2) {
        if ((daewoonBranch === chars[0] && natalBranch === chars[1]) ||
            (daewoonBranch === chars[1] && natalBranch === chars[0])) {
          interactions.push({
            type: 'punishment',
            name: `형(刑) — ${pun.type}`,
            severity: 'negative',
            effect: pun.desc,
          });
        }
      } else if (chars.length === 3) {
        const thirdNeeded = chars.find((c) => c !== daewoonBranch && c !== natalBranch);
        if (chars.includes(daewoonBranch) && chars.includes(natalBranch)) {
          const thirdPresent = branches.some((b, j) => j !== i && b === thirdNeeded);
          interactions.push({
            type: thirdPresent ? 'punishment-full' : 'punishment-partial',
            name: `형(刑) — ${pun.type}${thirdPresent ? ' (완전)' : ' (부분)'}`,
            severity: thirdPresent ? 'negative' : 'mild-negative',
            effect: pun.desc,
          });
        }
      }
    }

    // 오행 생극 분석
    const natalElement = BRANCH_ELEMENT[natalBranch];
    let elementRelation = null;
    if (daewoonElement === natalElement) {
      elementRelation = { type: 'same', desc: `${daewoonElement}기운이 겹침 — 강화 또는 과잉` };
    } else if (GENERATES[daewoonElement] === natalElement) {
      elementRelation = { type: 'generates-natal', desc: `대운 ${daewoonElement}가 원국 ${natalElement}를 생(生) — 자원 유입` };
    } else if (GENERATES[natalElement] === daewoonElement) {
      elementRelation = { type: 'natal-generates', desc: `원국 ${natalElement}가 대운 ${daewoonElement}를 생(生) — 에너지 유출` };
    } else if (CONTROLS[daewoonElement] === natalElement) {
      elementRelation = { type: 'controls-natal', desc: `대운 ${daewoonElement}가 원국 ${natalElement}를 극(剋) — 통제 압력` };
    } else if (CONTROLS[natalElement] === daewoonElement) {
      elementRelation = { type: 'natal-controls', desc: `원국 ${natalElement}가 대운 ${daewoonElement}를 극(剋) — 저항과 방어` };
    }

    // 일간 오행 기준 대운 지지의 영향
    let dayMasterImpact = null;
    if (dayStemElement) {
      if (daewoonElement === dayStemElement) {
        dayMasterImpact = 'same';
      } else if (GENERATES[daewoonElement] === dayStemElement) {
        dayMasterImpact = 'supportive';
      } else if (CONTROLS[daewoonElement] === dayStemElement) {
        dayMasterImpact = 'pressuring';
      } else if (GENERATES[dayStemElement] === daewoonElement) {
        dayMasterImpact = 'expressive';
      } else if (CONTROLS[dayStemElement] === daewoonElement) {
        dayMasterImpact = 'controlling';
      }
    }

    results.push({
      position,
      daewoonBranch,
      natalBranch,
      daewoonBranchHangul: BRANCH_HANGUL[daewoonBranch],
      natalBranchHangul: BRANCH_HANGUL[natalBranch],
      interactions,
      elementRelation,
      dayMasterImpact,
    });
  }

  return results;
}

/**
 * 대운 전체 사이클의 지지 분석 요약
 *
 * @param {object[]} cycles - calculateDaewoon()이 반환한 cycles 배열
 * @param {string[]} natalBranches - 원국 사주 지지
 * @param {string} dayStemElement - 일간 오행
 * @returns {object[]} 각 사이클별 분석 결과
 */
export function analyzeDaewoonCycles(cycles, natalBranches, dayStemElement) {
  if (!Array.isArray(cycles)) return [];
  return cycles.map((cycle) => {
    const branchAnalysis = analyzeDaewoonBranch(cycle.branch, natalBranches, dayStemElement);

    // 가장 강한 상호작용 추출
    const allInteractions = branchAnalysis.flatMap((b) => b.interactions);
    const dominant = allInteractions.sort((a, b) => {
      const order = { 'strong-negative': 5, negative: 4, 'strong': 3, 'strong-positive': 3, 'mild-negative': 2, 'mild-positive': 1, gentle: 1 };
      return (order[b.severity] || 0) - (order[a.severity] || 0);
    })[0] || null;

    // 전체 톤 요약
    const hasClash = allInteractions.some((i) => i.type === 'clash');
    const hasHarmony = allInteractions.some((i) => i.type === 'six-harmony' || i.type === 'three-harmony');
    const hasPunishment = allInteractions.some((i) => i.type.startsWith('punishment'));
    const hasHarm = allInteractions.some((i) => i.type === 'harm');

    let toneSummary = '안정적인 시기';
    if (hasClash && hasHarmony) toneSummary = '변화와 조화가 교차하는 시기';
    else if (hasClash) toneSummary = '큰 변화와 전환의 시기';
    else if (hasPunishment) toneSummary = '내면의 긴장과 성장의 시기';
    else if (hasHarm) toneSummary = '작은 방해에 주의해야 할 시기';
    else if (hasHarmony) toneSummary = '협력과 인연이 흐르는 시기';

    return {
      cycleIndex: cycle.index,
      pillar: cycle.pillar,
      stem: cycle.stem,
      branch: cycle.branch,
      startAge: cycle.startAge,
      startYear: cycle.startYear,
      branchAnalysis,
      dominantInteraction: dominant,
      toneSummary,
    };
  });
}

export const DAEWOON_BRANCH_ANALYSIS_VERSION = '1.0.0';
