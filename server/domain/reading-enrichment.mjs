// server/domain/reading-enrichment.mjs
// Deterministic element-theory enrichment — 오행생극 기반 구체성 주입
// 혜민 샘플 수준의 생활 밀착형 조언(색상·방향·숫자·시기·장부·행동)을
// 결정론적으로 산출하여 모든 패턴에 일관된 구체성을 보장합니다.

const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
const CONTROLS = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };
const GENERATED_BY = { 화: '목', 토: '화', 금: '토', 수: '금', 목: '수' };
const CONTROLLED_BY = { 토: '목', 금: '화', 수: '토', 목: '금', 화: '수' };

const ELEMENT_COLORS = {
  목: ['청록색', '초록색', '연두색'],
  화: ['붉은색', '분홍색', '코랄'],
  토: ['노란색', '갈색', '베이지색'],
  금: ['흰색', '은색', '밝은 회색'],
  수: ['검정색', '남색', '짙은 보라색'],
};

const ELEMENT_DIRECTIONS = {
  목: '동쪽', 화: '남쪽', 토: '중앙', 금: '서쪽', 수: '북쪽',
};

const ELEMENT_NUMBERS = {
  목: [3, 8], 화: [2, 7], 토: [5, 10], 금: [4, 9], 수: [1, 6],
};

const ELEMENT_ORGANS = {
  목: '간·담, 목과 어깨, 근육과 관절, 신경계',
  화: '심장·소장, 혈액순환, 눈, 혈압',
  토: '비장·위장, 소화기, 입, 근육과 살',
  금: '폐·대장, 호흡기, 피부, 코',
  수: '신장·방광, 뼈, 귀, 비뇨기와 호르몬',
};

const ELEMENT_SEASON_TIMING = {
  목: '봄 (인월~진월, 양력 2~4월)',
  화: '여름 (사월~미월, 양력 5~7월)',
  토: '각 계절의 마지막 달 (진·미·술·축월)',
  금: '가을 (신월~술월, 양력 8~10월)',
  수: '겨울 (해월~축월, 양력 11~1월)',
};

function getFavorableElement(dayMasterElement, tenGod) {
  switch (tenGod) {
    case '정관': case '편관':
      return GENERATED_BY[dayMasterElement];
    case '정인': case '편인':
      return dayMasterElement;
    case '식신': case '상관':
      return dayMasterElement;
    case '정재': case '편재':
      return GENERATES[dayMasterElement];
    case '비견': case '겁재':
      return CONTROLLED_BY[dayMasterElement];
    default:
      return dayMasterElement;
  }
}

export function getElementTheory(dayMasterElement, tenGod) {
  const fav = getFavorableElement(dayMasterElement, tenGod);
  const avoid = CONTROLLED_BY[fav];
  return {
    favorable: {
      element: fav,
      colors: ELEMENT_COLORS[fav],
      direction: ELEMENT_DIRECTIONS[fav],
      numbers: ELEMENT_NUMBERS[fav],
      timing: ELEMENT_SEASON_TIMING[fav],
    },
    avoid: {
      element: avoid,
      colors: ELEMENT_COLORS[avoid],
    },
    dayMaster: {
      element: dayMasterElement,
      organs: ELEMENT_ORGANS[dayMasterElement],
    },
  };
}

const TEN_GOD_ACTIONS = {
  '정관': {
    must_do: ['개인과 직장의 기준을 명확히 하고 지키세요', '문서·계약을 꼼꼼히 확인하세요 — 올해는 문서운이 있습니다', '배움의 기회를 놓치지 마세요'],
    avoid: ['조급함 — 인정은 시간이 필요합니다', '완벽주의의 함정 — "충분히 좋다"를 받아들이세요', '융통성 부족 — 기준이 경직되면 답답해집니다'],
    wealth: '문서로 확정되는 재물 — 부동산·예금·적립식이 유리합니다. 투기·모험은 피하세요',
    romance: '기준과 가치관이 맞는 사람과 진지한 관계로 발전할 수 있습니다. 빠른 발전보다 서로를 확인하는 시간이 필요합니다',
    fashion: '단정하고 깔끔한 스타일이 호감을 줍니다. 너무 화려하지 않은 것이 좋습니다',
    health: '정신적 스트레스와 완벽주의가 건강을 해칠 수 있습니다. "적당히"의 연습이 필요합니다',
  },
  '편관': {
    must_do: ['책임 앞에서 기준부터 세우세요', '압박을 단련의 재료로 받아들이세요', '건강 관리를 최우선으로 하세요'],
    avoid: ['과로와 스트레스 방치', '갈등을 피하느라 회피만 하기', '충동적 결정 — 올해는 특히 위험합니다'],
    wealth: '압박 속에서 재물을 지키는 것이 핵심입니다. 충동적 지출은 절대 금물. 저축과 보존에 집중하세요',
    romance: '강한 인연이 다가올 수 있으나, 존중받는 관계인지가 가장 중요합니다. 주도권을 다투지 마세요',
    fashion: '깔끔하면서도 힘 있는 스타일이 좋습니다. 너무 부드러우면 기운이 흩어집니다',
    health: '과로·스트레스·수면 부족이 가장 큰 적입니다. 규칙적 휴식을 강제하세요',
  },
  '정인': {
    must_do: ['배움의 기회를 적극 활용하세요', '문서·자격·지식을 쌓으세요', '지원해주는 사람과 관계를 두텁게 하세요'],
    avoid: ['준비만 하고 실행을 미루기', '공상에 빠지기 — 올해는 실행력이 부족해집니다', '지원을 당연하게 여기기'],
    wealth: '지식과 자격이 재물의 통로입니다. 안정적이고 장기적인 형태가 유리합니다',
    romance: '지적 교감이 맞는 사람과 인연이 있습니다. 서로 배워주는 관계가 깊어집니다',
    fashion: '깔끔하고 지적인 이미지가 좋습니다. 편안하면서도 격식 있는 스타일',
    health: '생각이 많아져 우울감이 올 수 있습니다. 몸을 움직이는 운동이 특히 필요합니다',
  },
  '편인': {
    must_do: ['직관과 영감을 기록하세요', '새로운 관점을 실험해 보세요', '명상·산책으로 내면을 정리하세요'],
    avoid: ['공상만 하고 실행 안 하기', '우울감에 빠지기', '너무 안으로만 향하기'],
    wealth: '아이디어와 직관이 재물의 통로입니다. 하지만 실행으로 연결해야 빛을 발합니다',
    romance: '닮은 듯 다른 사람에게 끌립니다. 표현을 미루지 마세요',
    fashion: '독특하고 개성 있는 스타일이 좋습니다. 유행보다 자기색이 중요합니다',
    health: '신경성 질환, 불면, 우울감을 조심하세요. 햇빛을 자주 쬐세요',
  },
  '식신': {
    must_do: ['결과물을 만드세요 — 글, 작품, 요리, 무엇이든', '건강 관리에 투자하세요', '즐거움을 찾되 나태해지지 마세요'],
    avoid: ['나태함과 과식', '완성을 미루기', '소극적으로 숨기'],
    wealth: '창작과 표현이 재물의 통로입니다. 취미를 직업으로 연결할 수 있는 시기',
    romance: '따뜻하고 다정한 분위기가 인연을 부릅니다. 맛있는 곳, 즐거운 자리에서 인연이 닿습니다',
    fashion: '편안하고 부드러운 스타일이 좋습니다. 자연스러운 색감이 잘 맞습니다',
    health: '전반적으로 건강운이 좋은 해이나, 과식과 나태함을 조심하세요',
  },
  '상관': {
    must_do: ['불편함을 개선하는 제안을 하세요', '비판을 건설적으로 표현하세요', '혁신과 실험을 두려워하지 마세요'],
    avoid: ['말실수 — 올해는 특히 조심', '과도한 비판으로 관계 상하기', '감정적으로 터뜨리기'],
    wealth: '기술과 제안이 재물의 통로입니다. 하지만 말이 앞서면 기회를 잃습니다',
    romance: '재치 있고 똑똑한 사람에게 끌립니다. 하지만 말이 너무 많으면 인연이 멀어집니다',
    fashion: '트렌디하고 세련된 스타일이 좋습니다. 액세서리로 포인트를 주세요',
    health: '신경성 두통, 소화 불량을 조심하세요. 스트레스를 말로 풀지 말고 운동으로 푸세요',
  },
  '정재': {
    must_do: ['예산을 정하고 지키세요', '신뢰를 쌓는 데 시간을 투자하세요', '안정적 수입원을 관리하세요'],
    avoid: ['보수적 태도로 기회 놓치기', '너무 안전만 추구하기', '아끼기만 하고 안 쓰기'],
    wealth: '안정과 운영이 재물의 핵심입니다. 예산 관리, 꾸준한 저축, 신뢰 기반 거래가 유리합니다',
    romance: '신뢰와 안정이 바탕이 되는 관계가 자리잡습니다. 허세 없이 진실된 모습이 인연을 부릅니다',
    fashion: '깔끔하고 신뢰감 주는 스타일이 좋습니다. 과시보다 실용을 우선하세요',
    health: '소화기와 위장을 조심하세요. 규칙적 식사가 가장 중요합니다',
  },
  '편재': {
    must_do: ['기회를 넓게 탐색하세요', '현금흐름을 철저히 관리하세요', '새로운 연결과 네트워크를 만드세요'],
    avoid: ['충동적 소비와 투자', '기회가 많다고 무리하게 확장', '현금 부족 방치'],
    wealth: '기회가 넓게 펼쳐지는 해이나, 현금흐름 관리가 생명입니다. 수익이 나도 지출이 큰 시기',
    romance: '매력적이고 다양한 인연이 들어옵니다. 하지만 한 사람에게 집중하기가 어려울 수 있습니다',
    fashion: '세련되고 눈에 띄는 스타일이 좋습니다. 향수와 액세서리로 포인트를 주세요',
    health: '과로와 과음을 조심하세요. 즐거움이 많지만 체력 소모가 큽니다',
  },
  '비견': {
    must_do: ['주도권을 쥐고 앞장서세요', '동료와 협력하되 경계를 분명히 하세요', '독립성을 키우세요'],
    avoid: ['고집으로 동료와 충돌', '경쟁에 지나치게 몰두', '남의 도움 거부하기'],
    wealth: '들고 나는 돈이 비슷한 시기입니다. 큰 돈거래·보증은 절대 피하세요',
    romance: '기싸움이 있는 관계가 될 수 있습니다. 한 발 물러서는 것이 이기는 때가 많습니다',
    fashion: '깔끔하고 자신감 있는 스타일이 좋습니다. 너무 튀지 않되 존재감을 주세요',
    health: '근육·관절 긴장, 목·어깨 뭉침을 조심하세요. 스트레칭이 필수입니다',
  },
  '겁재': {
    must_do: ['경쟁을 두려워하지 마세요', '자원을 분배하고 협동하세요', '유연하게 대처하세요'],
    avoid: ['기싸움에 휘말리기', '돈거래·보증 — 올해는 최대 위험', '고집으로 자원 잃기'],
    wealth: '돈이 흩어지기 쉬운 해입니다. 주변과의 큰 돈거래는 절대 피하세요. 저축이 생명',
    romance: '경쟁자가 있는 관계, 또는 답답한 감정이 될 수 있습니다. 양보가 열쇠입니다',
    fashion: '심플하면서도 포인트가 있는 스타일. 너무 화려하면 시기의 대상이 됩니다',
    health: '스트레스로 인한 위장 장애, 두통을 조심하세요. 유산소 운동이 필요합니다',
  },
};

export function getTenGodActions(tenGod) {
  return TEN_GOD_ACTIONS[tenGod] || null;
}

export function enrichDomain(domain, dayMasterElement, tenGod) {
  if (!domain || !dayMasterElement || !tenGod) return domain;
  const theory = getElementTheory(dayMasterElement, tenGod);
  const actions = getTenGodActions(tenGod);
  if (!actions) return domain;

  const enriched = { ...domain, points: [...(domain.points || [])] };

  switch (domain.domain_key) {
    case 'favorable': {
      const fav = theory.favorable;
      enriched.points.push(
        `색상: ${fav.colors.join(', ')}이(가) 올해 기운을 돕습니다`,
        `방향: ${fav.direction}이(가) 유리한 방향입니다`,
        `숫자: ${fav.numbers.join('과 ')}이(가) 올해의 수(數)입니다`,
        `시기: ${fav.timing}에 기운이 가장 잘 흐릅니다`,
      );
      break;
    }
    case 'avoid': {
      const av = theory.avoid;
      enriched.points.push(
        `색상: ${av.colors.join(', ')}은(는) 올해 기운을 소진시킵니다`,
        ...actions.avoid,
      );
      break;
    }
    case 'fashion':
      enriched.points.push(actions.fashion);
      if (theory.favorable.colors.length > 0) {
        enriched.points.push(`올해 유리한 색상: ${theory.favorable.colors.join(', ')}`);
      }
      break;
    case 'health':
      enriched.points.push(
        `오행적 취약 부위: ${theory.dayMaster.organs}`,
        actions.health,
      );
      break;
    case 'wealth':
      enriched.points.push(actions.wealth);
      break;
    case 'romance':
      enriched.points.push(actions.romance);
      if (theory.favorable.timing) {
        enriched.points.push(`애정운이 좋은 시기: ${theory.favorable.timing}`);
      }
      break;
    case 'must_do': {
      const existingTexts = new Set(enriched.points);
      for (const item of actions.must_do) {
        if (!existingTexts.has(item)) enriched.points.push(item);
      }
      break;
    }
    default:
      break;
  }

  return enriched;
}
