// server/storage/seeds/month-gap-eul.mjs
// 월지 패턴 DB 시드: 갑(甲)·을(乙) 일간 × 12월지 = 24개 패턴
// 톤: 혜민 샘플 기반 — 2인칭 처방적, 한자 최소화(첫 등장 시만 괄호 보조), 명리 용어 일상어 의역
// 생성일: 2026-08-06

export const MONTH_GAP_EUL = {
  patterns: [
  {
    month_pattern_id: '갑_인',
    day_master: '갑',
    month_branch: '인',
    season: '봄',
    element_interaction: '같은 나무가 겹쳐 자라는',
    label: '큰 나무가 봄의 새싹과 만나 — 성장과 자립의 기운',
    modules: [
      {
        module_id: '갑_인_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목(甲木)이 인(寅)월을 만나면 나무가 겹쳐 자라듯, 자립심과 추진력이 한층 강해지는 흐름입니다',
          '스스로 서고 주도권을 쥐는 것은 장점이지만, 고집이 지나치면 주변과 부딪힙니다',
          "같은 나무가 겹친다는 건 경쟁자도 곁에 있다는 뜻입니다 — '내가 옳다'는 확신은 잠시 내려놓으세요",
          '한 발 물러서서 듣는 연습이 이 월지 출생 갑목에게 가장 필요한 마음가짐입니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_인_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '나무 기운이 겹치면 간과 담에 부담이 커지는 체질입니다',
          '근육이 과하게 긴장되고 목과 어깨가 뻣뻣해지기 쉬우니 꾸준한 스트레칭이 필요합니다',
          '스트레스를 받으면 두통이나 소화 불량으로 이어질 수 있으니 유산소 운동으로 몸을 풀어주세요',
          '술과 기름진 음식은 간을 더 피로하게 하니 줄이는 것이 좋습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_인_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '새로운 시작과 개척에 유리한 흐름입니다 — 앞장서서 이끄는 역할이 어울립니다',
          '경쟁이 있는 환경일수록 추진력이 빛을 발합니다',
          '다만 동료나 동업자와 의견 충돌이 생길 수 있으니 역할과 몫을 미리 명확히 정하세요',
          '혼자서 다 하겠다는 마음은 내려놓고 분업과 협력의 틀을 만드는 것이 성공의 열쇠입니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_인_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '기존 관계가 있다면 신뢰를 다지기 좋은 시기입니다',
          '싱글이라면 직장이나 모임에서 비슷한 성향의 사람과 인연이 닿기 쉽습니다',
          '고집이 비슷한 사람을 만나면 기싸움이 생길 수 있으니 먼저 양보하는 여유가 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_인_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '버는 만큼 빠져나가는 흐름이 있습니다 — 버는 것만큼 지키는 습관이 필요합니다',
          '동료나 친구와 돈거래는 관계를 망칠 수 있으니 피하는 것이 좋습니다',
          '예산을 정하고 저축을 자동화하면 흔들리지 않습니다',
          '투자는 보수적으로, 한 번에 크게 벌려는 유혹은 경계하세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_인_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '비슷한 성향의 사람들이 주변에 몰려듭니다',
          '겸손하지 않으면 자연스레 기싸움이 시작됩니다',
          "'함께 하겠다'는 말을 먼저 꺼내는 것이 관계의 윤활유입니다",
          '남의 성과를 인정하는 연습이 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_인_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '뿌리를 내리는 시기입니다 — 기초가 튼튼해야 2~3년 뒤 큰 나무로 자랍니다',
          '섣부른 확장보다 기초 공사에 집중하세요',
          '배움의 자세를 잃지 않으면 주변의 같은 나무들이 경쟁자가 아닌 동반자가 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_인_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '고집을 내려놓고 협력의 가치를 배우는 것이 이 월지 출생의 핵심 과제입니다',
          "'한 발 물러서서 듣기' — 내 생각이 옳아도 상대의 말을 끝까지 듣는 훈련이 필요합니다",
          '승보다 양보를 택하는 듯한 선택이 장기적으로 더 큰 것을 얻게 합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_묘',
    day_master: '갑',
    month_branch: '묘',
    season: '봄',
    element_interaction: '나무가 울창해져 경쟁하는',
    label: '곧은 나무가 무성한 숲과 만나 — 경쟁과 분출의 기운',
    modules: [
      {
        module_id: '갑_묘_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 묘(卯)월을 만나면 숲이 울창해지듯, 경쟁심과 조급함이 피어나는 흐름입니다',
          "'서두르지 말고 차분하게'라는 말을 스스로에게 자주 건네야 합니다",
          '남과 비교하는 습관이 불안을 키우니 자기만의 속도를 인정하세요',
          '답답함이 밀려올 때는 잠시 멈추고 호흡을 가다듬는 것이 중요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_묘_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '나무 기운이 지나치게 왕성해져 열로 변하기 쉬운 체질입니다',
          '간에 열이 오르면 두통, 답답함, 혈압 상승으로 나타날 수 있습니다',
          '시원하고 바람이 잘 통하는 곳에서 휴식을 취하세요',
          '녹색 채소와 시원한 성질의 음식으로 몸의 열을 식히는 것이 좋습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_묘_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '경쟁이 치열한 환경에서 자칫 남과 비교하게 됩니다',
          "'빨리 성과를 내야 한다'는 압박에 무리하면 오히려 실수가 늘어납니다",
          '남이 가지 않은 길, 당신만의 차별화된 강점을 찾는 것이 정답입니다',
          '장기적인 관점에서 한 우물을 깊이 파는 인내가 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_묘_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '질투나 삼각관계의 유혹이 생길 수 있는 흐름입니다',
          '감정 소모가 크니 관계에서 불안을 키우는 상황은 피하세요',
          "'이 사람이 나를 채워주어야 한다'는 기대를 내려놓으면 관계가 가벼워집니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_묘_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '재물이 새어나가기 쉬운 흐름입니다',
          '충동적인 소비나 투자는 피하고 특히 보증이나 돈을 빌려주는 일은 위험합니다',
          "'지갑을 닫는 연습' — 일정 금액 이상 쓸 때 하루를 기다리는 규칙을 만드세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_묘_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '형제자매나 동료와 기싸움이 생기기 쉽습니다',
          "'내가 더 낫다'는 생각이 갈등의 씨앗입니다",
          '한 발 양보하는 것이 관계를 지키고 마음의 평화를 가져옵니다',
          '비교 대신 감사로 마음을 바꾸는 연습이 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_묘_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '인내와 차분함을 기르는 것이 이 시기의 성장 과제입니다',
          '단기 성과에 집착하지 말고 장기 프로젝트에 몰두하세요',
          "'천천히, 그러나 멈추지 않는 것'이 이 월지의 학습법입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_묘_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '경쟁을 협력으로 바꾸는 것이 이 월지 출생의 핵심 과제입니다',
          '남과의 비교를 자기 성찰로 전환하세요 — 그 사람은 무엇을 잘하는가가 아니라 나는 무엇을 더 깊이 할 수 있는가를 물어야 합니다',
          '조급함을 인내로 다스리면 경쟁자가 동반자가 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_진',
    day_master: '갑',
    month_branch: '진',
    season: '봄',
    element_interaction: '나무가 비옥한 흙에 뿌리를 내리는',
    label: '큰 나무가 봄의 습한 땅에 뿌리를 내리는 — 안정과 수확의 기운',
    modules: [
      {
        module_id: '갑_진_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 진(辰)월을 만나면 나무가 비옥한 흙에 뿌리를 내리듯, 안정과 실속을 다지는 흐름입니다',
          "'한 우물을 파라'는 말이 이 월지에 가장 잘 어울립니다",
          '화려한 외형보다 단단한 내면을 세우는 데 에너지를 쓰세요',
          '책임감이 강해지지만 그것이 스스로를 옭아매지 않도록 균형이 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_진_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '비장과 위장에 습기가 차기 쉬운 체질입니다 — 진은 봄의 습한 흙이라 몸이 무겁고 나른해집니다',
          '소화가 잘 안 되거나 식후에 졸음이 밀려온다면 식사량을 줄이는 것이 좋습니다',
          '매운맛이나 따뜻한 성질의 음식으로 몸의 습기를 배출하세요 — 생강차, 된장찌개가 도움이 됩니다',
          '가벼운 걷기나 유산소 운동으로 습기를 움직이게 하세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_진_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '안정적인 직장이나 꾸준한 관리 업무가 잘 맞습니다',
          '부동산, 금융, 행정, 관리 직무에서 실력을 인정받기 쉽습니다',
          "'꾸준함이 경쟁력'이라는 말을 믿고 묵묵히 쌓으세요",
          '봄의 마무리 단계이니 봄 동안 시작한 일들을 정돈하고 결실을 준비하세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_진_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '진지하고 안정적인 관계로 발전하기 좋은 흐름입니다',
          '가정과 일상을 중시하는 성향이 강해집니다',
          "'함께 살아가는 터전을 세우자'는 방향으로 대화가 자연스럽습니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_진_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '꾸준히 모아가는 재물의 흐름입니다',
          '저축, 부동산, 문서 등 손에 잡히는 자산이 안정감을 줍니다',
          "'모으는 재물'에 집중하고 한 번에 크게 벌려는 유혹은 피하세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_진_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '신뢰를 기반으로 한 소수의 깊은 관계가 어울립니다',
          '약속을 지키고 책임을 다하는 사람으로 인정받게 됩니다',
          '넓고 얕은 인맥보다 좁고 깊은 인연을 가꾸세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_진_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '실무 역량과 재정 관리 능력을 함께 키우는 것이 좋습니다',
          '전문 기술이나 자격을 하나씩 쌓아가면 훗날 튼튼한 기반이 됩니다',
          "'지금 심는 씨앗이 3년 뒤 열매를 맺는다'는 마음으로 임하세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_진_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '봄의 끝자락에 선 이 월지 출생은 봄 동안 심은 씨앗을 정돈하고 결실을 준비하는 것이 핵심 과제입니다',
          '너무 많이 시작했다면 과감히 줄이고 남은 것에 집중하세요',
          "'버릴 줄 아는 것'이 이 월지 출생 갑목의 성숙의 척도입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_사',
    day_master: '갑',
    month_branch: '사',
    season: '여름',
    element_interaction: '나무가 따뜻한 햇살에 꽃을 피우는',
    label: '큰 나무가 초여름 온기에 만개하는 — 표현과 창작의 기운',
    modules: [
      {
        module_id: '갑_사_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 사(巳)월을 만나면 나무가 따뜻한 햇살에 꽃을 피우듯, 여유와 표현의 흐름이 열립니다',
          '생각을 밖으로 꺼내는 것이 좋은 시기입니다 — 숨겨둔 재능이나 아이디어가 빛을 발합니다',
          '완벽하게 준비하려다 기회를 놓치지 말고 일단 시작하는 용기가 필요합니다',
          '다만 적당히의 미학을 잊지 마세요 — 과하면 닳습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_사_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '심장과 소장에 열이 오르기 쉬운 흐름입니다',
          '나무가 초여름 온기에 타면서 입이 마르고 위산이 과다해질 수 있습니다',
          '시원하고 담백한 음식으로 위장을 보호하세요 — 채소, 과일, 묽은 죽이 좋습니다',
          '카페인과 매운 음식은 열을 더하니 줄이는 것이 좋습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_사_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '창작, 기획, 교육, 먹거리, 콘텐츠 분야에서 재능이 드러납니다',
          "'만들어 보세요' — 머릿속 아이디어를 행동으로 옮기면 사람들이 반응합니다",
          '당신의 전문성과 손재주가 재산이 되는 흐름입니다',
          '틈틈이 배우고 익힌 것이 자연스럽게 수익으로 이어질 수 있습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_사_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '자연스러운 매력이 발산되는 시기입니다',
          '억지로 꾸미지 않아도 호감을 받는 흐름입니다',
          "'있는 그대로의 나'를 보여주는 것이 가장 강한 무기입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_사_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '기술, 재능, 아이디어로 버는 흐름입니다',
          "'내가 잘하는 것'이 곧 재물의 원천입니다",
          '전문성을 깊이 갈고닦으면 그 자체가 안정적인 수입원이 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_사_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '붙임성이 좋고 호감형으로 비쳐집니다',
          '주변에 사람이 모이지만 너무 퍼주다 보면 에너지가 고갈됩니다',
          "'줄 수 있는 만큼만 주세요' — 범위를 정하는 것이 지속 가능합니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_사_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '재능 개발과 창작에 몰두하기 좋은 시기입니다',
          '취미를 전문으로 키워가는 것도 좋은 방향입니다',
          "'배운 것을 남에게 가르쳐 보세요' — 가르치면서 더 깊이 이해하게 됩니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_사_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '과하지 않게 절제하며 표현하는 것이 이 월지 출생의 핵심 과제입니다',
          '여유가 매력의 원천이라는 것을 잊지 마세요 — 바쁘고 조급하면 오히려 빛이 가려집니다',
          "'조금 덜해서 조금 더 남기는' 여백의 미학을 익히세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_오',
    day_master: '갑',
    month_branch: '오',
    season: '여름',
    element_interaction: '나무가 맹렬한 불길에 타 밝아지는',
    label: '곧은 나무가 한여름 불길에 휩싸이는 — 열정과 과로의 기운',
    modules: [
      {
        module_id: '갑_오_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 오(午)월을 만나면 나무가 맹렬한 불길에 타 밝아지듯, 열정과 자유의 기운이 강하게 피어오릅니다',
          "'감정의 온도를 낮추세요' — 열정이 뜨거울수록 한 번 더 식히는 연습이 필요합니다",
          '권위와 규율에 반항심이 드는 것은 자연스럽지만 그것을 어떻게 표현하느냐가 관건입니다',
          "'하고 싶다'와 '해야 한다' 사이에서 균형을 잡는 것이 성숙의 척도입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_오_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '심장에 화가 과도하게 쌓이기 쉬운 흐름입니다',
          '불면, 두통, 갈증, 입 마름이 나타날 수 있습니다',
          "'열 번 심호흡하고 말하세요'라는 규칙을 만드세요 — 화를 내면 간이 상합니다",
          '물가에서 시간을 보내거나 수영 등 물과 관련된 활동이 건강에 도움이 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_오_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '혁신과 예술, 새로운 도전에서 두각을 나타냅니다',
          '기존 방식에 문제를 제기하고 더 나은 길을 찾는 능력이 있습니다',
          '다만 권위나 윗사람과 충돌하기 쉬우니 비판은 건설적으로 전환하세요',
          '자유로운 환경에서 일할 때 역량이 극대화됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_오_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '감정의 기복이 크고 자유를 추구하는 흐름입니다',
          '배우자나 연인과 의견 충돌이 잦을 수 있으니 감정이 타오를 때 입을 닫는 연습이 필요합니다',
          "'나의 자유가 상대의 자유를 침해하지 않는가'를 늘 점검하세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_오_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '크게 벌고 크게 쓰는 흐름으로 변동성이 큽니다',
          '투자에 나설 때는 원금 보존을 최우선으로 하세요',
          "'들어온 돈의 절반은 무조건 지킨다'는 원칙을 세우면 흔들리지 않습니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_오_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '말실수로 인한 마찰이 가장 흔한 패턴입니다',
          '윗사람이나 권위 있는 사람과 부딪히기 쉬우니 한 번 더 생각하고 말하세요',
          '재치와 유머는 장점이지만 날카로운 농담은 상처가 될 수 있습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_오_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '예술과 창작에 몰두하면 놀라운 결과가 나올 수 있는 흐름입니다',
          "'절제가 완성의 열쇠'라는 것을 잊지 마세요",
          '감정을 다스리는 훈련 — 명상, 일기, 운동 — 이 창작의 깊이를 더합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_오_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '말과 감정의 온도를 조절하는 것이 이 월지 출생의 핵심 과제입니다',
          "'적게 말하고 더 보여주세요' — 말이 줄어들수록 당신의 존재감은 커집니다",
          '반항 에너지를 창작과 혁신으로 흘려보내면 세상을 바꾸는 힘이 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_미',
    day_master: '갑',
    month_branch: '미',
    season: '여름',
    element_interaction: '나무가 여름의 마른 땅에 뿌리를 내리는',
    label: '큰 나무가 늦여름 메마른 땅을 만나는 — 인내와 저장의 기운',
    modules: [
      {
        module_id: '갑_미_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 미(未)월을 만나면 나무가 여름의 마른 땅에 뿌리를 내리듯, 인내와 저장의 흐름이 열립니다',
          "'느리더라도 제대로'가 이 월지의 모토입니다",
          '눈에 띄는 성과보다 보이지 않는 기반을 다지는 데 의미를 두세요',
          "'지금의 인내가 내일의 결실'이라는 믿음을 잃지 마세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_미_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '비장과 위장이 건조해지기 쉬운 체질입니다 — 미는 여름의 마른 땅이라 위산이 과다해집니다',
          '속이 쓰리고 갈증이 잦을 수 있습니다',
          '시원하고 윤기 있는 음식으로 위장을 보호하세요 — 야채죽, 두부, 요거트가 좋습니다',
          '물을 자주 마시되 너무 차가운 물은 위장을 긴장시키니 미지근한 물이 좋습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_미_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '안정적인 환경에서 꾸준히 일하는 것이 잘 맞습니다',
          '여름 수확의 시작점에 서 있으니 지금까지 쌓아온 것의 결실을 점검하세요',
          "'인내가 핵심' — 당장의 보상을 참고 더 큰 결실을 기다리는 지혜가 필요합니다",
          '관리, 운영, 유지보수 등 끝을 맺는 역할에서 신뢰를 얻습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_미_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '진지하고 현실적인 관계를 추구하게 됩니다',
          "'감정'보다 '신뢰와 책임'이 관계의 중심에 섭니다",
          '느리게 발전하는 만남일수록 오래갑니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_미_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '꾸준한 수입과 저축이 재물의 축입니다',
          '부동산이나 실물 자산에 대한 감각이 좋습니다',
          "'모으는 데 집중하고 쓰는 데는 인내하는' 것이 재물을 지키는 방법입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_미_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '믿을 수 있는 소수의 사람과 깊은 관계를 맺습니다',
          '약속을 지키고 책임을 다하는 것이 당신의 신용자산입니다',
          '넓은 인맥보다 좁은 신뢰망이 당신에게 더 큰 힘이 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_미_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '실무 역량과 재정 관리 능력을 함께 키우는 것이 좋습니다',
          "'지금 하는 일을 3년 더 하면 전문가'라는 마음으로 임하세요",
          '인내심을 기르는 것 자체가 성장입니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_미_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '여름 수확의 시작점에 선 이 월지 출생은 인내가 핵심 과제입니다',
          '지금까지 해 온 일의 결실을 점검하고 덜 익은 것은 기다리세요',
          "'빨리 끝내려다 망치는 일'이 가장 흔하니 끝까지 끈을 놓지 않는 집념이 필요합니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_신',
    day_master: '갑',
    month_branch: '신',
    season: '가을',
    element_interaction: '날카로운 도끼가 큰 나무를 다듬는',
    label: '큰 나무가 가을의 정갈한 도끼를 만나 — 규율과 결실의 기운',
    modules: [
      {
        module_id: '갑_신_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 신(申)월을 만나면 날카로운 도끼가 큰 나무를 다듬듯, 규율과 명예의 기운이 다가옵니다',
          "'바르게 세우세요' — 이것이 이 월지의 좌우명입니다",
          '책임감이 강해지고 원칙을 중시하는 성향이 짙어집니다',
          '다만 규율에 매이다 보면 숨이 막힐 수 있으니 규칙 안에서 자유를 찾는 지혜가 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_신_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '폐와 대장이 가을 건조함에 가장 먼저 반응합니다',
          '기관지가 건조해지고 피부가 당길 수 있으니 보습과 수분 보충이 필수입니다',
          '따뜻한 차를 자주 마시세요 — 배도라지차, 도라지차가 호흡기에 좋습니다',
          '실내 습도를 적정하게 유지하고 피부 관리에 신경 쓰세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_신_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '관직, 법, 규제, 관리 직무에서 능력을 발휘합니다',
          '자격증과 전문성이 빛을 발하는 흐름입니다',
          "'규율 안의 자유'를 체득하면 조직 안에서 영향력이 커집니다",
          '원칙을 지키면서도 창의적으로 일하는 사람으로 인정받게 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_신_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '진지하고 책임감 있는 만남을 추구합니다',
          "'빠르게 타오르기보다 천천히 신뢰를 쌓는' 관계가 어울립니다",
          '늦더라도 신중하게 선택한 인연이 평생의 동반자가 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_신_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '안정적이고 합법적인 수입이 재물의 축입니다',
          '투자는 보수적으로 확실한 것에 투자하세요',
          '명예와 신용이 곧 재물이 되는 흐름 — 평판을 지키는 것이 재물을 지키는 길입니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_신_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '윗사람과의 관계가 중요해지는 흐름입니다',
          '예의 바르고 원칙을 지키는 태도가 신뢰를 낳습니다',
          "'규율을 지키면서도 인간적인 온기'를 잃지 않는 것이 관계의 핵심입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_신_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '자격증, 전문 지식, 규율 안의 자유를 체득하는 것이 성장의 축입니다',
          "'배워서 남 주는 것'이 아니라 '배워서 스스로 세우는 것'이 목표입니다",
          '지식을 체화하여 삶의 원칙으로 만드세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_신_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '규율 안에서 자유를 찾는 것이 이 월지 출생의 핵심 과제입니다',
          "'규칙을 지키면서 창의적으로' — 이 역설을 체득하면 어디서든 자유로워집니다",
          '틀에 갇히는 것이 아니라 틀을 활용하는 지혜가 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_유',
    day_master: '갑',
    month_branch: '유',
    season: '가을',
    element_interaction: '예리한 칼날이 나무를 베어내는',
    label: '곧은 나무가 가을 칼날에 시험을 받는 — 압박과 돌파의 기운',
    modules: [
      {
        module_id: '갑_유_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 유(酉)월을 만나면 예리한 칼날이 나무를 베어내듯, 압박과 시험이 찾아오는 흐름입니다',
          "'압박을 성장의 밑거름으로 받아들이세요' — 스트레스가 크지만 그 압력이 단단함을 만듭니다",
          "'도망치지 말고 맞서되 무리하지 말고 이겨내는' 것이 관건입니다",
          '위기 속에서 자신의 진짜 강점을 발견하게 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_유_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '금이 나무를 베어 간과 담이 압박을 받는 체질입니다 — 스트레스가 통증으로 이어지기 쉽습니다',
          '폐와 대장에 부담이 오니 호흡기 관리에 신경 쓰세요',
          '척추와 관절, 특히 목과 허리가 뻣뻣해지니 꾸준한 스트레칭이 필수입니다',
          '요가나 마사지로 몸의 긴장을 풀어주는 것이 건강에 큰 도움이 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_유_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '위기 관리, 군경, 법, 감사, 품질 관리 등 압박이 큰 일에서 역량이 드러납니다',
          '시험이나 평가, 감찰을 통과하는 흐름 — 정직과 성실이 무기입니다',
          "'시련이 단단함을 만든다'는 말을 가슴에 새기세요",
          '압박을 견디고 통과한 경험이 당신의 이력에서 가장 빛나는 부분이 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_유_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '관계 안에서 시험과 압박을 느끼기 쉬운 흐름입니다',
          '배우자나 연인과 충돌이 잦을 수 있으니 싸우기 전에 한 걸음 물러서는 습관이 필요합니다',
          '압박을 주는 사람이 아니라 버팀목이 되는 사람으로 서세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_유_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '벌어도 스트레스가 따르고 위험 부담이 큰 흐름입니다',
          '투자는 보수적으로 관리하고 원금 보존을 최우선으로 하세요',
          "'한 번에 크게'보다 '조금씩 확실하게'가 이 월지의 재물 전략입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_유_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '갈등과 압박이 따르는 관계가 자주 생깁니다',
          '압박하는 사람을 만나면 정면 대결보다 인내가 필요합니다',
          "'굽히고 이겨내는 것' — 이것이 이 월지 출생의 인간관계 철학입니다",
          '정직과 성실로 압박을 풀면 압박하던 사람조차 존경하게 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_유_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '위기 대처 능력과 인내심을 기르는 것이 성장의 축입니다',
          "'시련이 단단함을 만든다' — 압박을 통과할 때마다 한 단계 성장합니다",
          '체력과 근력을 키우면 정신력도 함께 단단해집니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_유_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '압박을 성장의 동력으로 전환하는 것이 이 월지 출생의 핵심 과제입니다',
          "'굽히고 이겨내세요' — 부러지지 않고 휘어지는 유연함이 생존의 비결입니다",
          '정직과 성실로 압박을 풀면 시련은 당신의 가장 강한 무기가 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_술',
    day_master: '갑',
    month_branch: '술',
    season: '가을',
    element_interaction: '나무가 메마른 가을 흙에 뿌리를 내리는',
    label: '큰 나무가 메마른 가을 흙을 만나 — 수확과 보존의 기운',
    modules: [
      {
        module_id: '갑_술_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 술(戌)월을 만나면 나무가 메마른 가을 흙에 뿌리를 내리듯, 기회와 변동성의 흐름이 열립니다',
          "'기회를 잡되 발을 뺄 줄 알아야 합니다' — 이것이 이 월지의 핵심 철학입니다",
          '트렌드에 민감하고 행동력이 좋은 것은 장점이지만 깊이가 부족하면 흔들립니다',
          "'기회를 쫓기 전에 기반을 먼저 다지세요' — 섣부른 도약은 위험합니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_술_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '비장과 위장에 건조함이 오기 쉬운 흐름입니다 — 술은 가을의 마른 흙입니다',
          '피부가 건조해지고 변비가 생기기 쉬우니 수분 보충과 식이섬유 섭취를 일상화하세요',
          '입이 자주 마르니 윤기 있는 음식을 챙기세요 — 꿀차, 연근, 참기름이 좋습니다',
          '보습 관리에 신경 쓰고 충분한 물을 마시세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_술_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '장사, 투자, 영업 등 트렌드에 민감한 일에서 감각이 드러납니다',
          "'지금 뜨는 것'을 읽는 눈이 뛰어나지만 그것만으로는 오래가지 못합니다",
          '트렌드를 읽되 깊이를 더하면 경쟁자가 없는 영역이 생깁니다',
          '한 우물을 깊이 파는 연습이 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_술_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '다양한 인연이 드나들지만 한 사람에게 정착하기 어려운 흐름입니다',
          "'많이 만나는 것'보다 '한 사람을 깊이 아는 것'이 이 월지의 과제입니다",
          '변덕스러운 감정을 다스리고 오늘의 선택을 내일도 지키는 연습이 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_술_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '들쭉날쭉한 흐름으로 큰 기회와 큰 위험이 공존합니다',
          '분산 투자가 필수 — 한 곳에 몰빵하는 것은 금물입니다',
          "'기회로 번 것의 절반은 안전한 곳에 두세요' — 이 원칙이 흔들림을 막아줍니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_술_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '폭넓고 얕은 인맥이 자연스러운 흐름입니다',
          "'많은 사람' 속에서 진짜를 찾는 노력을 의식적으로 해야 합니다",
          '깊은 관계는 저절로 생기지 않습니다 — 시간과 정성을 들이세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_술_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '트렌드 파악과 기회 감각을 키우되 깊이를 놓치지 마세요',
          "'얕고 넓게'에서 '좁고 깊게'로 전환하는 것이 성숙의 단계입니다",
          '한 분야를 3년 이상 파고들면 기회 감각과 전문성이 동시에 잡힙니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_술_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '한 곳에 정착하는 연습이 이 월지 출생의 핵심 과제입니다',
          "'기회를 쫓기 전에 기반을 다지세요' — 뿌리 없는 나무는 큰 바람에 쓰러집니다",
          "'이것이다' 싶은 것을 정하고 끝까지 가는 인내야말로 이 월지 출생의 진짜 과제입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_해',
    day_master: '갑',
    month_branch: '해',
    season: '겨울',
    element_interaction: '따뜻한 물이 큰 나무를 기우는',
    label: '큰 나무가 겨울 시냇물의 보습을 받는 — 휴식과 영감의 기운',
    modules: [
      {
        module_id: '갑_해_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 해(亥)월을 만나면 따뜻한 시냇물이 큰 나무를 기우듯, 영감과 직관이 피어나는 흐름입니다',
          "'혼자 있는 시간이 보약' — 고독이 두렵지 않은 성향이 강해집니다",
          '머릿속에 떠오르는 생각과 영감을 기록하는 습관이 필요합니다',
          "'비현실적'이라는 말에 위축되지 말고 그것을 현실로 옮기는 다리를 놓으세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_해_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '신장과 방광이 차가워지기 쉬운 체질입니다',
          '해는 따뜻한 물이지만 겨울의 수 기운이 나무에 습기와 차가움을 더합니다',
          '혈액순환이 저하되고 관절이 뻣뻣해질 수 있으니 몸을 따뜻하게 유지하세요',
          '따뜻한 목욕, 온찜질, 생강계피차로 체온을 지키는 것이 좋습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_해_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '학문, 연구, 종교, 철학, 비주류 분야에서 빛을 발합니다',
          "'지식이 자산'인 흐름 — 배운 것이 곧 당신의 무기입니다",
          "'아는 것'에서 '하는 것'으로 옮기는 다리를 놓아야 재산이 됩니다",
          '혼자 깊이 파고드는 연구나 창작에 몰두하면 훗날 큰 결실이 옵니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_해_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '고독을 즐기면서도 누군가를 만나고 싶은 마음이 교차합니다',
          '비현실적인 기대 — 완벽한 사람을 찾는 것 — 은 만남을 방해합니다',
          '상대를 있는 그대로 보는 연습이 필요합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_해_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '지식이 곧 재산이지만 직접적인 수입은 지체될 수 있습니다',
          '지적재산 — 책, 강의, 특허, 콘텐츠 — 을 활용하면 지식이 재물로 변합니다',
          "'빨리 벌겠다'는 조급함을 내려놓고 지식의 층을 두텁게 쌓으세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_해_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '소수의 사람과 깊이 교류하는 것이 자연스럽습니다',
          '다만 고립에 빠지지 않도록 의식적으로 사람을 만나야 합니다',
          "'혼자 있는 시간'이 풍요롭되 그것이 단절로 이어지지 않게 주의하세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_해_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '학문, 철학, 영성의 영역에서 깊이 파고드는 것이 성장의 축입니다',
          "'깊이 파세요' — 얕은 지식으로는 이 월지의 갑목이 충족되지 않습니다",
          '배운 것을 정리하고 남에게 설명할 수 있을 때 비로소 내 것이 됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_해_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '영감을 현실로 옮기는 것이 이 월지 출생의 핵심 과제입니다',
          "'머릿속에만 있는 지식은 세상을 바꾸지 못합니다' — 영감을 행동으로 번역하는 다리를 놓으세요",
          '고독의 시간을 창작의 양식으로 쓰되 그 결과물을 세상과 나누어야 비로소 완성됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_자',
    day_master: '갑',
    month_branch: '자',
    season: '겨울',
    element_interaction: '찬물이 나무의 뿌리를 적시는',
    label: '큰 나무가 겨울 깊은 물에 뿌리를 담그는 — 학문과 내실의 기운',
    modules: [
      {
        module_id: '갑_자_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 자(子)월을 만나면 찬물이 나무의 뿌리를 적시듯, 학문과 내실을 다지는 흐름이 열립니다',
          "'배우고 쌓으세요' — 이것이 이 월지의 방향입니다",
          "'더 많이 알아야 한다'는 압박에 휘둘리지 말고 깊이 있게 하나를 파세요",
          '보호받고 싶은 마음이 커지지만 스스로 서는 연습을 병행해야 합니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_자_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '신장과 방광이 차가워지는 체질입니다 — 자는 겨울의 찬물입니다',
          '냉증이 생기기 쉽고 혈액순환이 저하될 수 있습니다',
          '손발과 아랫배가 차가워지면 따뜻하게 보옥하세요',
          '찬물과 찬 음식은 금물 — 따뜻한 식사와 따뜻한 차를 일상화하세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_자_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '학문, 교육, 문서, 연구 분야에서 안정적으로 성장합니다',
          '자격증 취득과 문서 작업이 좋은 흐름입니다',
          "'기초를 튼튼히' — 쌓아올린 지식이 훗날 든든한 기반이 됩니다",
          '보호자나 스승의 역할을 맡으면 자연스럽게 영향력이 커집니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_자_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '보호받고 싶고 의존하고 싶은 마음이 커지는 흐름입니다',
          '상대에게 기대기보다 스스로 서면서 함께하는 관계를 지향하세요',
          "'나를 채워줄 사람'을 찾기보다 '함께 채워가는 사람'을 만나야 합니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_자_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '안정적이지만 폭발적이지는 않은 흐름입니다',
          '문서, 부동산, 지적재산 등 눈에 보이는 자산이 안정감을 줍니다',
          "'느리지만 확실하게' — 이것이 이 월지의 재물 전략입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_자_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '스승, 보호자, 학문적 교류가 중심이 되는 흐름입니다',
          "'가르치고 배우는 관계'에서 깊은 신뢰가 생깁니다",
          '윗사람의 지도를 받으면 성장이 빨라지니 좋은 스승을 찾으세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_자_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '깊이 있는 학문과 자격, 문서가 성장의 축입니다',
          "'기초를 튼튼히' — 대충 넘기지 말고 근본을 이해하는 데 시간을 쓰세요",
          '배운 것을 삶에 적용하는 실천의 다리를 놓아야 완성됩니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_자_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '배운 것을 체계화하여 남에게 전하는 것이 이 월지 출생의 핵심 과제입니다',
          "'받은 것을 흘려보내야 새 것이 들어옵니다' — 보호받는 자리에 머물지 말고 스승의 자리로 나아가세요",
          '학문을 삶의 실천으로 옮기는 것이 이 월지 갑목의 성숙의 척도입니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '갑_축',
    day_master: '갑',
    month_branch: '축',
    season: '겨울',
    element_interaction: '나무가 얼어붙은 겨울 흙에 뿌리를 내리는',
    label: '큰 나무가 얼어붙은 겨울 땅을 만나는 — 인내와 준비의 기운',
    modules: [
      {
        module_id: '갑_축_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '갑목이 축(丑)월을 만나면 나무가 얼어붙은 겨울 흙에 뿌리를 내리듯, 인내와 준비의 흐름이 열립니다',
          "'겨울을 버텨야 봄이 옵니다' — 눈에 보이지 않는 준비의 시간이 가장 소중합니다",
          '서두르지 말고 한 걸음씩 단단하게 밟아가는 것이 중요합니다',
          "'지금의 인내가 봄의 결실'이라는 믿음을 잃지 마세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_축_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '비장과 위장이 차가워지는 체질입니다 — 축은 겨울의 얼어붙은 땅입니다',
          '소화 기능이 떨어지고 냉증이 생기기 쉬우니 설사나 손발 냉증을 조심하세요',
          '따뜻한 음식은 필수 — 된장찌개, 김치찌개, 따뜻한 죽이 좋습니다',
          '찬 음식과 생과일은 줄이고 따뜻하게 조리한 음식을 드세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_축_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '안정적인 환경에서 꾸준히 일하는 것이 잘 맞습니다',
          "'겨울 버티기' — 체력과 인내 관리가 최우선입니다",
          '당장의 성과보다 기반을 다지는 데 집중하면 봄에 큰 결실이 옵니다',
          '관리, 운영, 내실을 다지는 역할에서 신뢰를 쌓습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_축_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '느리지만 진지한 관계를 추구합니다',
          "'빠른 불꽃'보다 '오래 타는 화로' 같은 관계가 어울립니다",
          '함께 견디고 준비하는 과정에서 신뢰가 깊어집니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_축_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '꾸준히 모으는 재물의 흐름입니다',
          "'모으는 데 집중하고 쓰는 데는 인내하세요'",
          '저축과 안전한 자산에 투자하면 겨울이 지나면 열매를 맺습니다'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_축_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '믿을 수 있는 사람과 깊은 관계를 맺습니다',
          '어려운 시기에 함께하는 사람이 진짜입니다',
          "'넓은 인맥'보다 '좁지만 변하지 않는 신뢰'가 당신의 자산입니다"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_축_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '체력과 인내를 기르는 것이 성장의 기본입니다',
          "'봄을 준비하며 버티세요' — 지금 쌓는 것이 봄에 폭발합니다",
          '기초 공사에 집중하고 화려한 기술보다 단단한 기본기에 투자하세요'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '갑_축_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '겨울을 버티며 봄을 준비하는 것이 이 월지 출생의 핵심 과제입니다',
          '체력과 인내 관리가 최우선 — 무리하면 겨울을 넘기기 어렵습니다',
          "'지금 심는 씨앗은 봄에 싹을 틔운다'는 믿음으로 묵묵히 준비하세요"
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_인',
    day_master: '을',
    month_branch: '인',
    season: '봄',
    element_interaction: '덩굴이 큰 나무에 기대어 함께 오르는',
    label: '연약한 덩굴이 굵은 나무를 만나 — 의지와 도약의 기운',
    modules: [
      {
        module_id: '을_인_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 큰 나무에 기대어 뻗어 올라가는 덩굴 같은 사람입니다. 좋은 환경과 든든한 조력자를 만나면 한층 더 도약할 수 있는 기운입니다.',
          '다만 의지하되 의존하지 않는 것이 핵심입니다. 기대어 오르되, 결국 뿌리를 내려야 할 땅은 당신 자신의 자리입니다.',
          '남의 빛에 가려 내 색깔이 흐려지지 않도록, 가지를 뻗을수록 자기 정체성을 또렷이 세워야 합니다.',
          '도약의 기회가 주어질 때 겸손하되 주눅 들지 말고, 왜 그 자리에 올랐는지 분명히 보여주세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_인_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '간과 담의 기운이 왕성하지만, 남에게 기대는 만큼 신경이 예민해지고 피로가 쌓이기 쉽습니다.',
          '큰 나무의 그늘에 가려 햇빛을 충분히 받지 못하면 본래의 생기가 흐려질 수 있으니, 하루에 한 번은 햇빛을 쐬는 시간이 필요합니다.',
          '혼자만의 조용한 휴식 시간을 의식적으로 만드세요. 남을 챙기다 보면 정작 자기 몸의 신호를 놓치게 됩니다.',
          '목 기운이 과해지면 신경계가 긴장하니, 스트레칭과 가벼운 산책으로 몸의 긴장을 풀어주는 것이 좋습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_인_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '능력 있는 멘토나 든든한 환경을 만나면 성장 속도가 빨라집니다. 좋은 사람을 가릴 줄 아는 안목이 곧 당신의 경쟁력입니다.',
          '다만 남의 공로로 끝나지 않도록, 어떤 일이든 자기 색깔을 분명히 남기는 것이 중요합니다.',
          '조력자의 그늘에 안주하지 말고, 결국 스스로 설 수 있는 실력을 한 가지씩 갈고닦으세요.',
          '기대어 오르는 시기에는 겸손이 미덕이지만, 자기 자리가 잡히면 주도적으로 나서야 할 때가 반드시 옵니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_인_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '강하고 든든한 사람에게 자연스럽게 끌리는 경향이 있습니다. 의지하고 싶은 마음이 큰 만큼, 상대에게 휘둘리지 않도록 주의가 필요합니다.',
          '상대의 기준에만 맞추다 보면 내가 사라질 수 있으니, 연애도 나답게 할 수 있는 기준을 먼저 세우세요.',
          '든든한 사람이 좋되, 당신을 존중해 주는 사람이어야 합니다. 힘만 믿고 따르면 나중에 상처가 클 수 있습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_인_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '남의 도움이나 좋은 환경 덕에 재물이 들어올 수 있는 흐름입니다. 다만 의존하면 들어온 만큼 다시 나갈 수 있으니 주의하세요.',
          '조력자를 통해 들어온 수익원이 영구적이지 않을 수 있으니, 반드시 당신만의 독립된 수익원을 하나 이상 확보하는 것이 좋습니다.',
          '누군가의 후원을 받을 때는 그 대가와 조건을 명확히 해두어야, 나중에 재물 얽힘으로 인한 스트레스를 피할 수 있습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_인_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '큰 인물이나 강한 사람 곁에 있을수록 주관을 잃지 않는 연습이 필요합니다. 기대다 보면 내 목소리가 작아지기 쉽습니다.',
          '기어오르되 뿌리는 내 것이라는 마음을 늘 가져야 합니다. 얽히되 삼켜지지 않는 거리 조절이 관건입니다.',
          '윗사람에게 인정받으려다 동료와의 관계를 소홀히 하지 마세요. 골고루 챙기는 것이 오래가는 인맥의 비결입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_인_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '남의 것을 내 것으로 소화하는 능력이 뛰어납니다. 배운 것을 그대로 흉내 내기보다 창조적으로 변형해 자기만의 것으로 만드세요.',
          '좋은 스승을 만났을 때 가장 빠르게 자라는 시기이니, 배움의 기회를 놓치지 마세요.',
          '다만 모방에 머물면 한계에 부딪힙니다. 남의 방식을 자기 체질에 맞게 다시 빚어내는 것이 성장의 열쇠입니다.',
          '기대어 오르는 동안 배운 것들을 자기 뿌리로 내리면, 언젠가 혼자 설 때 진가를 발휘합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_인_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '기댈 곳이 사라져도 당신 혼자 설 수 있도록, 지금부터 자기 뿌리를 키워야 합니다. 의지할 줄 알되 독립할 줄도 알아야 합니다.',
          '큰 나무가 쓰러지는 날을 대비해, 기대는 동시에 자기 뿌리를 깊이 내리는 두 가지 작업을 병행하세요.',
          '누군가에게 기대어 성장한 만큼, 나중에는 당신이 다른 이의 나무가 되어 줄 줄 알아야 합니다. 받은 도움을 돌려주는 것이 이 월지 출생의 과제입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_묘',
    day_master: '을',
    month_branch: '묘',
    season: '봄',
    element_interaction: '꽃과 풀이 무성하게 얽혀 자라는',
    label: '화초가 봄의 무성한 초원과 만나 — 교류와 번영의 기운',
    modules: [
      {
        module_id: '을_묘_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 무성한 봄 초원의 꽃 같은 사람입니다. 교류와 번영의 에너지가 넘치지만, 그 속에서 자기 자리를 잃지 않는 것이 과제입니다.',
          '얽히지 말고 내 뿌리를 지키는 것 — 무성함 속에서도 중심을 잃지 않는 정체성이 필요합니다.',
          '주변에 비슷한 사람들이 많아 비교와 경쟁이 생기기 쉬우니, 남이 아닌 당신 자신의 기준으로 꽃을 가꾸어야 합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_묘_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '나무 기운이 겹치면서 간·담이 예민해지고 신경이 곤두서기 쉽습니다. 불면이나 긴장감, 답답함을 느낄 수 있습니다.',
          '무성하게 얽힌 에너지가 안에서 꼬이듯 답답해질 수 있으니, 바깥 공기를 쐬고 몸을 움직여 막힌 기운을 풀어주는 것이 좋습니다.',
          '정보와 자극이 너무 많으면 신경계가 지치니, 하루 한 번은 휴대전화를 멀리하고 조용히 있는 시간을 만드세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_묘_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '교류, 협업, 서비스, 디자인 분야에서 두각을 나타냅니다. 관계가 많고 기회도 많은 만큼 정체성을 분명히 해야 합니다.',
          '여러 꽃들 사이에서 나만의 색깔을 찾지 못하면 휩쓸리기 쉬우니, 한 가지 분야에서 전문성을 또렷이 세우는 것이 중요합니다.',
          '인맥이 넓은 것은 장점이지만, 일의 핵심에서 밀려나지 않도록 자기 몫을 분명히 챙기세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_묘_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '주변에 사람이 많고 매력적인 자리이지만, 그만큼 질투와 비교가 생기기 쉬운 환경입니다.',
          '가장 반짝이는 꽃이 되려다 마음이 다치지 않도록, 겉모습보다 진짜 당신을 알아주는 사람을 가까이 하세요.',
          '관계가 얽히기 쉬우니, 만남과 헤어짐의 선을 분명히 하는 것이 마음을 보호하는 길입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_묘_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '같이 쓰고 같이 버는 일이 많은 흐름입니다. 나눔은 좋되, 한도를 정하지 않으면 내 몫이 줄어듭니다.',
          '공동 지출이나 함께 쓰는 돈은 누가 얼마를 냈는지 처음부터 명확히 기록해 두어야, 나중에 서로 안 좋아지지 않습니다.',
          '돈이 들어와도 곧바로 빠져나갈 수 있으니, 들어온 즉시 일정 비율은 무조건 저축하는 습관을 들이세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_묘_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '교류가 무성하고 폭이 넓지만, 그만큼 얽힘과 오해도 생기기 쉽습니다. 친한 사람일수록 거리 조절이 필요합니다.',
          '경계를 명확히 세우지 않으면 내 시간과 에너지가 남에게 흘러가니, 여기까지 선을 스스로 정하세요.',
          '비교와 시기가 생기기 쉬운 자리이니, 남의 성과에 흔들리지 않고 내 길을 가는 마음이 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_묘_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '관계 속에서 자기 정체성을 찾는 것이 이 월지 출생의 성장 과제입니다. 협력하되 동화되지 않아야 합니다.',
          '여러 사람에게 배울 것이 많은 환경이니, 폭넓게 흡수하되 결국 나의 것으로 하나로 묶어내는 안목을 키우세요.',
          '주변과 비교하며 초조해하기보다, 당신만의 속도로 자라는 꽃을 가꾼다고 생각하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_묘_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '무성한 얽힘에서 한 걸음 빠져나와 자기 중심을 세우는 것이 핵심 과제입니다. 남과 비교하지 말고 내 꽃을 가꾸어야 합니다.',
          '사람 관계에 휩쓸려 자기 일을 놓치지 않도록, 매일 나를 위한 시간을 따로 확보하세요.',
          '얽혀 있는 인연 가운데 진짜 당신을 돕는 사람과 겉치레 관계를 분간하는 안목을 기르는 것이 이 시기의 숙제입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_진',
    day_master: '을',
    month_branch: '진',
    season: '봄',
    element_interaction: '덩굴이 봄의 습한 흙에 뿌리를 내리는',
    label: '화초가 봄의 비옥한 땅에 자리잡는 — 안정과 뿌리의 기운',
    modules: [
      {
        module_id: '을_진_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 비옥한 봄 땅에 뿌리를 내리는 화초 같은 사람입니다. 안정에 대한 갈망이 강하고, 한 자리에 깊이 내려앉고자 하는 마음이 큽니다.',
          '한 자리에 깊이 내려앉기 — 떠돌지 말고 자기 자리를 확고히 다지는 것이 지금 가장 중요합니다.',
          '안정을 추구하되 정체와 다름을 명심하고, 뿌리를 내리는 동시에 줄기를 키우는 방향으로 나아가야 합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_진_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '비장과 위의 기운이 왕성하지만, 봄의 습기가 비위에 쌓여 무겁고 나른해지기 쉽습니다.',
          '습기가 피부 트러블이나 소화 불쾌로 나타날 수 있으니, 습기를 배출하는 음식인 녹두, 팥, 생강차를 자주 드시는 것이 좋습니다.',
          '너무 편안해지면 게을러지니, 몸을 가볍게 움직여 습기를 말리는 운동이 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_진_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '안정적인 직장, 서비스, 미용, 농업, 부동산 분야에서 을목의 섬세함과 꼼꼼함이 빛을 발합니다.',
          '한 자리에 깊이 정착할수록 신뢰가 쌓이고 보람이 커지는 구조이니, 이리저리 옮겨다니기보다 한 우물을 깊이 파는 것이 유리합니다.',
          '봄의 비옥한 흙은 성장의 기반이 되는 시기이니, 기초를 튼튼히 다져두면 나중 큰 수확으로 이어집니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_진_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '편안한 쉼터 같은 관계를 갈망하며, 안정적이고 신뢰가 쌓이는 만남에 복을 받습니다.',
          '서로에게 뿌리가 되어 주는 든든한 인연을 만나면 큰 안정이 오니, 겉모습보다 마음의 편안함을 기준으로 사람을 보세요.',
          '가까워질수록 서로의 속도를 존중하고, 너무 빠른 진전보다 천천히 신뢰를 쌓는 것이 오래가는 관계의 비결입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_진_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '꾸준하고 안정적인 수입이 들어오는 흐름입니다. 을목은 재물에 대한 애착이 있어 모으는 편이라 저축이 자연스럽습니다.',
          '봄의 비옥한 땅에 뿌리를 내릴 절호의 시기이니, 수입의 일부를 꾸준히 모아 성장의 기반으로 삼으세요.',
          '다만 재물에 너무 매달리면 사람 관계가 굳을 수 있으니, 쓸 것은 쓰되 계획 있게 쓰는 균형이 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_진_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '신뢰를 바탕으로 한 소수의 깊은 관계가 당신을 튼튼하게 지탱합니다. 따뜻하고 배려 깊은 교류가 어울립니다.',
          '말보다 행동으로 신뢰를 보여주는 사람을 가까이 하고, 가벼운 인맥에 에너지를 낭비하지 마세요.',
          '당신이 먼저 믿음을 보여주면 그만큼 돌아오는 관계의 크기가 커집니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_진_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '실무 역량과 미적 감각, 서비스 정신을 키우는 데 최적의 시기입니다. 눈에 보이는 결과물을 하나씩 만들어가세요.',
          '늦봄의 습기를 활용해 성장 기반을 다지듯, 배운 것을 토양 삼아 자기 역량의 뿌리를 넓히는 것이 좋습니다.',
          '기초가 튼튼한 사람만이 흔들려도 쓰러지지 않으니, 화려한 기술보다 단단한 기본에 충실하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_진_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '봄의 비옥한 땅에 뿌리를 내릴 절호의 기회를 놓치지 마세요. 이 시기에 내린 뿌리가 훗날 큰 나무로 자랍니다.',
          '안정에 안주해 그 자리에 머무르지 않도록, 뿌리는 깊되 줄기는 계속 뻗어 올라야 합니다.',
          '늦봄의 습기를 성장의 자양으로 삼아, 기초 공사에 시간을 들이는 것이 이 월지 출생의 핵심 과제입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_사',
    day_master: '을',
    month_branch: '사',
    season: '여름',
    element_interaction: '화초가 따뜻한 햇살에 꽃을 피우는',
    label: '덩굴장미가 초여름 온기에 활짝 피어나는 — 매력과 표현의 기운',
    modules: [
      {
        module_id: '을_사_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 초여름 온기에 활짝 피어나는 덩굴장미 같은 사람입니다. 아름답게 피어나고 매력을 발산하는 시기입니다.',
          '당신의 꽃을 활짝 피우세요 — 여유를 가지고 창조적으로 자기를 표현하는 것이 지금 가장 어울리는 자세입니다.',
          '밖으로 에너지가 흐르는 만큼, 내면의 여유도 함께 챙겨야 꽃이 오래 핍니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_사_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '심장과 소장의 불 기운이 왕성해지면서, 나무가 타서 꽃이 시들듯 수분이 부족해지기 쉽습니다.',
          '피부가 건조해지고 열이 오를 수 있으니, 수분 보충과 피부 보습을 평소보다 신경 써야 합니다.',
          '서늘한 곳에서 휴식을 취하고, 맵고 짠 음식보다는 담백하고 시원한 음식이 몸에 편안합니다.',
          '열이 오르면 감정도 예민해지니, 마음의 온도를 식히는 호흡법이나 명상이 도움이 됩니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_사_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '미용, 패션, 디자인, 예술, 콘텐츠, 서비스 분야에서 당신의 매력과 섬세함이 곧 재산이 됩니다.',
          '감각을 드러내는 것을 주저하지 마세요. 보여주어야 알아주는 자리입니다.',
          '꽃이 피어 있을 때 열매를 맺을 준비도 함께해야 하니, 인기에 취하지 말고 실력의 뿌리도 챙기세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_사_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '매력이 넘치고 자연스러운 만남이 이어지는 시기입니다. 호감을 많이 받는 흐름입니다.',
          '다만 인기에 취해 너무 많은 곳에 마음을 주면 정작 소중한 사람을 놓칠 수 있으니, 한 사람에게 정성을 다하는 것이 좋습니다.',
          '꽃이 피면 나비가 옵니다 — 억지로 쫓아가기보다 당신을 가꾸면 좋은 인연이 다가옵니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_사_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '미적 감각과 재능, 매력을 통해 재물이 들어오는 흐름입니다. 꽃이 피면 나비가 옵니다라는 말이 딱 맞는 시기입니다.',
          '재능을 드러내는 일에 적극적으로 나서면 그만큼 수입으로 연결되니, 홍보와 노출을 두려워하지 마세요.',
          '꽃이 질 때를 대비해 수입의 일부는 꾸준히 저축하여, 인기의 변동에도 흔들리지 않는 기반을 만드는 것이 좋습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_사_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '붙임성 좋고 호감형이라 주변에 사람이 끊이지 않습니다. 다만 진짜 친구와 가벼운 팬을 분간할 줄 알아야 합니다.',
          '모두에게 좋은 사람이 되려다 보면 정작 중요한 관계에 에너지가 부족해지니, 소수에게 깊이 쏟는 것이 좋습니다.',
          '매력은 책임감과 짝을 이룰 때 진가를 발휘하니, 입이 가벼운 사람보다 말에 무게를 두는 사람을 가까이 하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_사_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '미적 감각과 창작, 자기 관리에 몰두할수록 빛을 발하는 시기입니다. 아름답게 만드는 일에 집중하세요.',
          '배운 것을 곧바로 결과물로 드러내는 습관이 중요합니다. 머릿속 아이디어를 구체적인 작품으로 완성하는 연습이 필요합니다.',
          '외면의 매력과 내면의 실력을 균형 있게 키워야 꽃이 질 때도 당당할 수 있습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_사_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '꽃이 피어도 뿌리를 잊지 마세요. 외면의 매력과 내면의 실력을 균형 있게 키우는 것이 이 월지 출생의 핵심 과제입니다.',
          '인기가 절정일 때 오히려 겸손해지고, 그 시간 에너지를 실력 갈고닦는 데 돌려야 꽃이 진 뒤에도 대비가 됩니다.',
          '당신의 매력을 당신만의 즐거움이 아닌 다른 사람을 위로하고 기쁘게 하는 데 쓰면, 그 꽃은 더 오래 빛납니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_오',
    day_master: '을',
    month_branch: '오',
    season: '여름',
    element_interaction: '연약한 풀이 뜨거운 불길에 시달리는',
    label: '화초가 한여름 뜨거운 햇볕에 말라가는 — 열정과 소진의 기운',
    modules: [
      {
        module_id: '을_오_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 한여름 뜨거운 햇볕 아래 놓인 연약한 풀 같은 사람입니다. 감정이 불꽃처럼 타오르고 자유를 갈망하는 기운입니다.',
          '열정을 식히지 말되, 타서 재가 되지 말 것 — 불길을 다루는 지혜가 지금 가장 필요합니다.',
          '충동과 감정의 파도가 큰 만큼, 스스로 온도를 조절하지 않으면 금방 지쳐버립니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_오_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '심화가 지나치면 피부 발진이나 화상, 탈수, 불면, 신경 쇠약이 올 수 있으니 각별히 주의해야 합니다.',
          '화를 내면 간이 상하고, 감정이 치밀면 몸이 먼저 반응합니다. 시원한 곳에서 휴식하고 수분 섭취를 충분히 하세요.',
          '열이 오르면 잠이 안 오기 쉬우니, 자기 전 화면을 멀리하고 몸을 식히는 습관이 필요합니다.',
          '체력 관리를 최우선으로 삼고, 과로는 곧 병으로 이어질 수 있음을 명심하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_오_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '혁신, 예술, 표현 분야에서 재능이 빛납니다. 다만 을목은 갑목보다 연약하여 과로에 훨씬 더 취약합니다.',
          '휴식이 곧 일입니다. 열정을 쏟되 반드시 회복하는 시간을 일정에 넣어야 오래 버틸 수 있습니다.',
          '충동적으로 결정하거나 말해버리면 나중에 후회하기 쉬우니, 중요한 일은 하루 이상 생각한 뒤 결정하는 것이 좋습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_오_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '감정 기복이 극심하고 불같은 사랑에 빠지기 쉽지만, 금방 타오르고 금방 식는 패턴을 조심해야 합니다.',
          '불꽃이 아닌 온기로 사랑하세요 — 자유를 추구하되 상처 주지 않는 사랑이 되어야 합니다.',
          '감정이 치밀면 먼저 한 박자 쉬고, 말을 내뱉기 전에 세 번 헤아리는 습관이 관계를 지킵니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_오_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '크게 벌고 크게 쓰는 흐름이지만, 소진의 위험이 크니 돈이 들어오는 즉시 일부를 무조건 저축하는 것이 좋습니다.',
          '감정이 격할 때 충동 소비를 하기 쉬우니, 큰 지출은 감정이 가라앉은 뒤 결정하세요.',
          '재물 관리는 머리가 아니라 시스템으로 — 자동 이체로 저축을 먼저 떼어놓는 습관이 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_오_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '감정 표현이 강해서 오해를 받기 쉽고, 말실수가 관계를 그르칠 수 있습니다. 한 박자 쉬고 말하세요.',
          '기분이 좋을 땐 과하게 베풀고 나쁠 땐 차갑게 대하는 변덕을 조심해야 사람이 남습니다.',
          '가까운 사람일수록 말의 온도를 낮추고, 속마음은 따로 조용히 나누는 것이 좋습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_오_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '예술과 창작에 몰두할수록 빛을 발하지만, 절제와 휴식이 완성의 열쇠입니다. 태우기만 하면 남는 것은 재뿐입니다.',
          '강렬한 에너지를 한 곳에 응축하는 훈련이 필요합니다. 흩뿌리는 재능을 모아 하나를 완성해 보세요.',
          '감정의 파도를 관찰하는 명상이나 글쓰기가 창작의 깊이를 더해줍니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_오_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '감정의 온도를 낮추는 것이 이 월지 출생의 가장 시급한 과제입니다. 재가 되기 전에 스스로 물을 뿌릴 줄 알아야 합니다.',
          '체력 관리를 최우선으로 삼고, 열정을 쏟는 만큼 반드시 회복하는 시간을 확보하세요.',
          '충동의 불꽃을 타오르게 하기보다, 그 에너지를 오래 타오르는 장작불로 다루는 지혜가 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_미',
    day_master: '을',
    month_branch: '미',
    season: '여름',
    element_interaction: '덩굴이 여름의 마른 땅에 뿌리를 내리는',
    label: '화초가 늦여름 메마른 땅에 매달리는 — 인내와 저장의 기운',
    modules: [
      {
        module_id: '을_미_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 늦여름 메마른 땅에 매달리는 화초 같은 사람입니다. 안정을 갈망하지만, 환경이 그리 만만치 않은 자리입니다.',
          '한 자리에 깊이 내려앉기 — 그러나 땅이 말라 있어 뿌리를 내리기 위해 인내가 필요합니다.',
          '저장과 보존의 에너지가 강하니, 당장의 수확보다 다음을 위한 비축에 마음을 두는 것이 좋습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_미_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '비장과 위가 건조해지기 쉽고 수분이 부족하여 피부가 건조해지거나 갈증이 날 수 있습니다.',
          '윤기 있는 음식과 수분 보충에 신경 쓰고, 너무 짜거나 매운 음식은 비위를 더 메마르게 하니 삼가는 것이 좋습니다.',
          '여름의 남은 열기에 체력이 소모되니, 무리하지 말고 충분한 휴식과 수면을 챙기세요.',
          '피부 보습은 단순한 미용이 아니라 건강 문제이니, 안팎으로 수분을 채우는 습관이 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_미_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '서비스, 미용, 부동산, 농업 등 안정적이고 꼼꼼함이 빛나는 분야에서 인내심을 발휘하면 좋은 결과가 옵니다.',
          '늦여름의 열기에 지치지 않도록 수분이자 자원을 잘 관리하며, 인내하며 저장하는 자세가 필요합니다.',
          '당장의 수확이 작아 보여도 묵묵히 쌓으면 결실이 커지는 구조이니, 조급해하지 마세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_미_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '안정적이고 편안한 관계를 갈망하지만, 환경이 말라 있어 만남에 인내가 필요한 시기입니다.',
          '서로의 마른 땅에 물을 주듯, 작은 배려와 따뜻한 말 한마디가 관계를 살립니다.',
          '급하게 다가서기보다 천천히 신뢰를 쌓고, 상대의 건조함도 이해해 주는 여유가 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_미_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '꾸준한 수입이 들어오지만, 환경이 메마른 만큼 무리한 투자보다는 저장과 보존에 무게를 두는 것이 좋습니다.',
          '늦여름의 열기에 지치지 않도록 수분 곧 자원을 아껴 두어야, 가을에 결실을 맺을 수 있습니다.',
          '재물은 모아두는 형이니, 큰 수익을 노리기보다 작더라도 꾸준히 저축하는 것이 안전합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_미_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '신뢰를 바탕으로 한 소수의 깊은 관계가 어울립니다. 따뜻하고 배려 깊은 교류가 메마른 환경을 적셔 줍니다.',
          '관계에서 얽매이거나 매달리는 기운이 강할 수 있으니, 적당한 거리를 유지하는 것이 오히려 관계를 건강하게 합니다.',
          '말라붙은 마음에 온기를 더해 주는 사람을 가까이 하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_미_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '실무 역량과 미적 감각을 키우되, 인내심이 동반되어야 빛을 발합니다. 서두르지 말고 한 걸음씩 다지세요.',
          '늦여름의 조건 속에서 자원을 관리하는 능력이 곧 성장의 밑거름이 됩니다.',
          '눈에 띄는 성과가 더딜수록 뿌리가 깊어지는 시기이니, 초조해하지 말고 꾸준함을 믿으세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_미_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '늦여름의 열기에 지치지 않도록 수분 곧 자원과 에너지를 잘 관리하는 것이 핵심 과제입니다.',
          '인내하며 저장하고, 당장의 수확에 집착하지 말고 다음 결실을 위한 비축에 힘을 쏟으세요.',
          '메마른 환경 속에서도 꿋꿋이 버텨 온 사람만이 결실의 계절에 가장 풍성하게 거두게 됩니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_신',
    day_master: '을',
    month_branch: '신',
    season: '가을',
    element_interaction: '가을 바람에 덩굴이 잘려 정리되는',
    label: '덩굴이 가을 정갈한 바람에 다듬어지는 — 규율과 결실의 기운',
    modules: [
      {
        module_id: '을_신_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 가을 정갈한 바람에 다듬어지는 덩굴 같은 사람입니다. 바른 규율로 정돈되고 책임감이 강해지는 기운입니다.',
          '가지를 쳐서 더 아름답게 피우세요 — 규율을 억압이 아닌 성장의 도구로 받아들이는 것이 중요합니다.',
          '자발적으로 정돈하는 만큼 삶의 결이 또렷해지니, 억지 규칙이 아니라 내가 세운 질서에 충실하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_신_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '폐와 대장의 기운이 왕성해지면서, 가을의 건조함이 피부를 거칠게 하고 기관지를 예민하게 만들 수 있습니다.',
          '보습과 수분 섭취에 각별히 신경 쓰고, 건조한 환경을 피하는 것이 좋습니다.',
          '호흡기가 약해질 수 있으니 찬 공기를 직접 쐬는 것을 피하고, 따뜻하게 입어 호흡을 보호하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_신_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '관리, 행정, 법률, 교육, 미용 관리 등 규율과 섬세함이 어우러지는 분야에서 재능이 빛납니다.',
          '윗사람에게 인정받기 쉽고 책임감을 신뢰로 바꿀 수 있으니, 맡은 일을 정확하고 성실하게 다져가세요.',
          '규율 안에서 을목의 섬세함이 발휘되면, 딱딱한 틀 안에서도 유연하게 성과를 만들어냅니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_신_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '진지하고 책임감 있는 만남에 복이 있으니, 늦더라도 신중하게 사람을 선택하는 것이 좋습니다.',
          '규율 있고 믿음이 가는 배우자를 만나면 큰 안정이 오니, 겉모습보다 책임감과 성실함을 기준으로 보세요.',
          '너무 엄격한 기준에 갇혀 기회를 놓치지 않도록, 선은 분명히 하되 마음은 유연하게 여세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_신_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '안정적이고 합법적인 수입이 들어오는 흐름입니다. 투자는 보수적으로, 원금을 지키는 데 무게를 두는 것이 좋습니다.',
          '문서나 자격증이 자산이 될 수 있으니, 공들여 쌓은 자격이 재물로 이어지는 흐름을 믿으세요.',
          '투기나 무리한 투자는 위험하니, 꾸준하고 투명한 방식으로 재물을 키우는 것이 안전합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_신_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '윗사람에게 인정받기 쉽고 예의 바르고 정돈된 태도가 호감을 삽니다. 인맥이 신뢰를 바탕으로 쌓입니다.',
          '다만 너무 깐깐하면 사람이 멀어질 수 있으니, 규율은 있되 따뜻함을 잃지 않는 것이 좋습니다.',
          '정직하고 성실한 사람을 가까이 하고, 말과 행동에 무게를 두는 관계를 키우세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_신_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '자격증, 전문성, 자기 관리에 집중할수록 결실이 큰 시기입니다. 가지를 칠수록 꽃이 큽니다.',
          '규칙과 훈련이 부담이 아니라 자기를 다듬는 과정임을 받아들이면, 성장의 속도가 달라집니다.',
          '배움의 과정에서 생기는 제약을 억압이 아닌 다듬음으로 해석하는 것이 이 시기의 과제입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_신_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '규율을 억압이 아닌 성장의 도구로 받아들이세요. 잘린 가지 자리에서 새 움이 돋습니다 — 다듬어진 만큼 더 아름답게 피어날 자리입니다.',
          '책임감을 피하거나 부담스러워하지 말고, 그 무게를 신뢰와 전문성으로 바꾸는 연습이 필요합니다.',
          '정돈된 삶의 틀을 스스로 세워두면, 어떤 바람이 불어도 흔들리지 않는 중심이 생깁니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_유',
    day_master: '을',
    month_branch: '유',
    season: '가을',
    element_interaction: '날카로운 낫이 풀을 베어내는',
    label: '화초가 가을 날카로운 낫에 시험을 받는 — 압박과 위기의 기운',
    modules: [
      {
        module_id: '을_유_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 날카로운 낫에 베이는 시험을 겪는 화초 같은 사람입니다. 극도의 압박이 찾아오는 가장 힘든 자리입니다.',
          '굽이쳐서 살아남기 — 을목에게 유금은 가장 큰 압박이며, 정신력과 유연성이 시험받는 자리입니다.',
          '압박을 피하려 하지 말고, 흐르는 물처럼 부드럽게 흘려보내는 지혜가 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_유_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '금이 을목을 베듯 간·담에 극도의 압박이 와서 신경쇠약, 스트레스성 질환, 피부 상처, 통증으로 나타날 수 있습니다.',
          '정신 건강이 최우선입니다. 스트레칭, 명상, 심리 상담을 적극 활용하고, 혼자 안고 넘기지 마세요.',
          '폐와 대장도 예민해지니 호흡기와 피부를 보호하고, 규칙적인 수면으로 신경계를 안정시켜야 합니다.',
          '몸에 생기는 긴장과 통증을 가볍게 넘기지 말고, 전문가의 도움을 받는 것이 중요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_유_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '위기 관리, 시험, 감찰, 군·경, 법 등 압박이 큰 분야에서 시련을 겪지만 이겨내면 큰 성장으로 이어집니다.',
          '벼림을 받는 칼날 — 같은 자리에서 단련되는 만큼 강해지니, 도망치지 말고 정면으로 마주하는 용기가 필요합니다.',
          '업무에서 갈등과 압박이 잦은 만큼, 스트레스 해소 창구를 평소에 확보해 두어야 무너지지 않습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_유_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '관계에서 극도의 긴장과 갈등, 시험하는 기운이 강해 배우자나 연인과 큰 충돌이 생기기 쉽습니다.',
          '관계에서 상처받기 쉬운 자리이니, 감정을 참거나 폭발시키기보다 전문 상담이나 중재를 적극 활용하는 것이 좋습니다.',
          '싸우지 말고 피할 줄 알아야 합니다 — 자존심보다 관계를 지키는 쪽으로 한 발짝 물러서는 지혜가 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_유_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '돈은 들어와도 그만큼 스트레스가 따르고, 위험 부담이 가장 큰 자리입니다. 절대 보수적으로 움직여야 합니다.',
          '투기나 무리한 투자는 절대 금물이며, 원금을 잃으면 회복이 어려울 수 있습니다.',
          '재물 문제가 생기면 혼자 결정하지 말고 신뢰할 수 있는 전문가와 반드시 상의하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_유_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '갈등과 압박의 연속이 될 수 있고, 원수가 될 수도 있는 자리입니다. 인내와 지혜가 그 어느 때보다 필요합니다.',
          '싸우지 말고 피할 줄 알아야 합니다 — 물러서는 것이 지는 것이 아님을 명심하세요.',
          '말 한마디가 큰 상처가 될 수 있으니, 갈등이 예감되면 그 자리를 피하고 감정이 가라앉은 뒤 대화하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_유_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '위기 대처, 정신력, 유연성을 기르는 가장 강도 높은 훈련의 자리입니다.',
          '가장 연약한 풀이 가장 끈질기게 살아남습니다 — 시련은 당신을 부수러 온 것이 아니라 단련하러 온 것입니다.',
          '고통스러운 경험을 남에게 압박이 아닌 깊이 이해하는 힘으로 바꾸면, 그것이 당신만의 고유한 성장이 됩니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_유_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '압박을 피하지 말고 유연하게 흘려보내세요. 베이지 않게 몸을 낮추고 흐르는 물처럼 — 부딪힘이 아니라 흐름으로 대처하는 것이 핵심입니다.',
          '정직과 성실로 위기를 기회로 바꾸되, 혼자 감당하려 하지 말고 심리 치료와 상담을 적극 활용하세요.',
          '이 시련을 견뎌낸 경험은 훗날 가장 강한 무기가 됩니다 — 끈질기게 살아남는 것 자체가 이 월지 출생의 가장 큰 성과입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_술',
    day_master: '을',
    month_branch: '술',
    season: '가을',
    element_interaction: '덩굴이 메마른 가을 흙에 매달리는',
    label: '덩굴이 메마른 가을 땅에 얽매이는 — 수확과 보존의 기운',
    modules: [
      {
        module_id: '을_술_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 메마른 가을 땅에 매달리는 덩굴 같은 사람입니다. 기회와 활동성이 있지만, 미련과 집착도 생기기 쉬운 자리입니다.',
          '잡은 것을 놓치지 말되, 미련도 버리세요 — 쥐는 것과 놓는 것의 균형이 지금 가장 중요합니다.',
          '활동성이 큰 만큼 욕심도 커지기 쉬우니, 무엇이 진짜 내 것인지 분별하는 안목이 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_술_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '비장과 위가 건조해지기 쉽고, 가을의 마른 흙이 변비, 입 마름, 피부 건조로 나타날 수 있습니다.',
          '윤기 있는 음식과 충분한 수분 섭취가 필요하고, 과하게 말리거나 기름진 음식은 비위를 더 부담스럽게 합니다.',
          '활동량이 많아 체력 소모가 크니, 쉬는 것을 미루지 말고 규칙적으로 휴식을 챙기세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_술_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '장사, 영업, 투자, 트렌드를 읽는 변동성 높은 일에서 감각이 빛납니다. 기회를 잡는 눈이 뛰어납니다.',
          '다만 한 곳에 정착하기 어려운 만큼, 기회를 쫓기 전에 자기 뿌리를 내릴 기반을 먼저 다지는 것이 중요합니다.',
          '여러 일에 손을 대기 쉬운 자리이니, 한두 개는 끝을 보는 집중력을 기르세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_술_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '다양한 인연이 드나들고 마음이 변덕스러워, 한 사람에게 정착하기가 쉽지 않은 흐름입니다.',
          '인연이 많은 만큼 진짜 마음을 놓을 사람을 가리는 안목이 필요하고, 관계를 가볍게 여기면 상처가 커집니다.',
          '기회를 쫓기 전에 뿌리를 내릴 것 — 사랑에서도 흔들리지 않는 중심을 먼저 세우세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_술_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '재물이 들쭉날쭉 흘러 기회와 위험이 공존합니다. 한 곳에 몰빵하기보다 분산 투자가 안전합니다.',
          '수확의 계절이기도 한 만큼 거둔 것은 확실히 챙기되, 욕심이 지나치면 잃을 수 있으니 선을 정하세요.',
          '트렌드에 민감한 장점을 살리되, 빠르게 벌고 빠르게 쓰는 패턴을 경계하고 저축 비율을 높이는 것이 좋습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_술_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '폭넓고 얕은 인맥이 형성되기 쉬운 자리이니, 깊은 관계는 의식적으로 육성해야 합니다.',
          '사람을 많이 만나는 만큼 가벼운 약속이나 얽힘이 생기기 쉬우니, 말은 신중하게 하세요.',
          '수많은 인연 가운데 진짜 당신을 돕는 사람을 가려내는 안목이 관계의 질을 결정합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_술_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '트렌드 파악과 기회를 감지하는 감각을 키우기 좋은 시기입니다. 정보 수집과 분석에 강점이 있습니다.',
          '다만 기회만 쫓다 보면 뿌리가 없어지니, 배운 것을 한 가지는 끝까지 완성해 보세요.',
          '활동성을 창의성으로 바꾸려면, 흩어진 경험을 하나로 묶는 정리의 습관이 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_술_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '한 곳에 정착하는 연습이 필요합니다. 기회를 쫓기 전에 뿌리를 내릴 것 — 흔들리지 않는 기반을 먼저 다지세요.',
          '많은 것을 쥐려다 정작 소중한 것을 놓치지 않도록, 무엇이 진짜 내 것인지 분별하는 기준을 세우세요.',
          '수확의 계절인 만큼 거둔 것은 확실히 보존하고, 욕심이 부풀 때마다 스스로 브레이크를 거는 습관이 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_해',
    day_master: '을',
    month_branch: '해',
    season: '겨울',
    element_interaction: '따뜻한 시내가 화초를 적셔주는',
    label: '화초가 겨울 따뜻한 시내의 보습을 받는 — 휴식과 자양의 기운',
    modules: [
      {
        module_id: '을_해_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 겨울 따뜻한 시내에 보습을 받는 화초 같은 사람입니다. 휴식과 자양이 흐르는 가장 편안한 자리입니다.',
          '쉬면서 자라세요 — 쉬는 것을 두려워하지 말고, 그 시간이 곧 성장의 자양임을 믿으세요.',
          '지나치게 편안해져 게을러지지 않도록, 쉼 속에서도 작은 자극을 놓지 않는 것이 좋습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_해_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '신장과 방광의 수 기운이 왕성하고, 해는 따뜻한 물이라 혈액순환이 비교적 좋은 편입니다.',
          '다만 수와 목이 겹쳐 약간의 습기가 생길 수 있고, 너무 편안해지면 기운이 둔해지니 적당한 운동이 필요합니다.',
          '따뜻한 곳에서 지내되, 가만히만 있지 말고 몸을 움직여야 자양이 제 역할을 합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_해_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '학문, 교육, 문서, 상담, 치유 분야에서 따뜻한 멘토를 만나 배우며 쉴 수 있는 환경이 어울립니다.',
          '안정감이 큰 만큼 안주하기 쉬우니, 배움의 속도를 점검하고 스스로 목표를 세워 두는 것이 좋습니다.',
          '문서와 지식이 자산이 되는 자리이니, 배운 것을 기록으로 남기고 체계화하세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_해_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '보호받고 싶은 마음이 강하고 포근한 관계를 갈망합니다. 안정감을 주는 사람을 만나면 큰 위로가 됩니다.',
          '다만 지나치면 의존으로 흐르기 쉬우니, 서로 의지하되 각자의 중심을 잃지 않는 것이 좋습니다.',
          '따뜻하고 다정한 만남에 복이 있으니, 서두르지 말고 편안함이 쌓이는 관계를 가꾸세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_해_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '안정적이고 큰 부는 아니더라도 걱정 없는 흐름입니다. 문서와 지식이 자산이 되는 자리입니다.',
          '지나치게 안전만 추구하면 성장이 느려지니, 일부는 약간의 도전에 할애하는 균형이 필요합니다.',
          '모아둔 지식과 문서를 언젠가 현실의 수입으로 바꾸는 노력을 게을리하지 마세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_해_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '따뜻한 보호자나 스승을 만나 포근한 교류가 이어지는 자리입니다. 신뢰가 깊은 관계가 자연스럽게 쌓입니다.',
          '다만 너무 편안해 도움만 받으려 하면 관계가 기울어지니, 받은 만큼 돌려주는 마음을 잃지 마세요.',
          '따뜻함을 베푸는 사람을 가까이 하되, 과보호에 의존하지 않도록 자기 몫을 챙기세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_해_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '학문, 자기 계발, 치유에 집중하기 가장 좋은 시기입니다. 따뜻한 곳에서 천천히 자라기에 딱 맞는 자리입니다.',
          '쉬는 동안 쌓인 내공이 훗날 큰 결실로 이어지니, 배움의 속도에 초조해하지 마세요.',
          '다만 너무 오래 머물면 성장이 멈추니, 적당한 자극과 새로운 목표로 가끔 물살을 일으키는 것이 좋습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_해_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '쉬는 것을 두려워하지 마세요. 휴식은 게으름이 아니라 자양입니다 — 쉼 속에서 자라는 것을 믿으세요.',
          '다만 너무 오래 머물면 성장이 멈추니, 따뜻한 쉼 속에서도 적당한 자극과 새로운 목표를 놓지 마세요.',
          '받은 보호와 자양을 나중에는 다른 이에게 돌려줄 수 있도록, 쉬는 동안 내공을 부지런히 쌓아 두세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_자',
    day_master: '을',
    month_branch: '자',
    season: '겨울',
    element_interaction: '차가운 물이 꽃뿌리를 적시는',
    label: '덩굴이 겨울 차가운 물에 잠기는 — 내관과 침잠의 기운',
    modules: [
      {
        module_id: '을_자_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 겨울 차가운 물에 잠기는 덩굴 같은 사람입니다. 내관과 침잠, 내성적 영감이 강한 자리입니다.',
          '깊이 들어가되 빠져나올 줄 알아야 합니다 — 깊이의 매력을 살리되 고립에 빠지지 않는 것이 과제입니다.',
          '혼자만의 깊은 사색은 풍요롭지만, 그것을 세상과 나누는 출구를 잃지 말아야 합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_자_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '수와 목이 겹쳐 냉증, 혈액순환 저하, 우울감, 신경 예민이 생기기 쉬운 자리입니다.',
          '몸을 따뜻하게 하고 햇빛을 자주 쐬는 것이 중요하며, 우울증 징후가 보이면 혼자 안지 말고 전문가의 도움을 받아야 합니다.',
          '실내에만 있기 쉬우니 의식적으로 바깥 바람을 쐬고, 사람과 만나는 시간을 늘리세요.',
          '생각이 너무 많으면 몸이 차가워지니, 머리를 쉬게 하는 가벼운 운동이 도움이 됩니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_자_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '학문, 연구, 철학, 비주류 분야, 예술에서 깊이를 발휘합니다. 혼자 깊이 파는 일에 강점이 있습니다.',
          '다만 세상과 단절되면 아무리 좋은 지식도 빛을 잃으니, 연구 결과를 밖으로 드러내는 노력이 필요합니다.',
          '혼자 일하는 습관에 갇히지 말고, 다른 사람과 협업하거나 피드백을 받는 창구를 만드세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_자_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '고독을 즐기고 내성적이며 비현실적인 기대를 품기 쉬워, 현실의 관계와 거리가 생길 수 있습니다.',
          '마음의 문을 조금씩 여세요 — 상대를 닫아두지 말고, 조금씩 속마음을 나누는 연습이 필요합니다.',
          '완벽한 사랑을 꿈꾸기보다, 불완전하지만 따뜻한 현실의 만남에 마음을 여는 것이 좋습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_자_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '지식과 아이디어가 곧 자산인 자리입니다. 다만 직접적인 수입은 지연되기 쉬운 흐름입니다.',
          '지적재산을 현실의 수입으로 바꾸는 노력이 필수이니, 머릿속 아이디어를 구체적인 결과물로 완성하세요.',
          '혼자서만 돈을 벌려 하지 말고, 현실 감각이 강한 사람과 협력하면 재물이 풀리기 쉽습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_자_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '소수 깊은 관계가 어울리지만, 고립의 위험이 큰 자리입니다. 혼자만의 시간도 좋지만 사람을 피하지 마세요.',
          '생각이 깊은 만큼 오해도 쌓이기 쉬우니, 속마음을 말로 꺼내는 연습이 관계를 살립니다.',
          '조용한 교류 속에서도 정기적으로 사람을 만나는 시간을 일정에 넣어 두어야 단절을 막을 수 있습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_자_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '심리학, 철학, 영성, 예술 분야에서 가장 깊은 물에서 진주를 건지듯 큰 통찰을 얻을 수 있습니다.',
          '깊이의 매력을 살리되, 그 통찰을 세상에 내놓는 출구를 만들지 않으면 고립으로 끝납니다.',
          '배운 것을 실천으로 옮기는 다리를 놓는 것이 이 시기의 가장 중요한 성장 과제입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_자_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '차가운 침잠에서 빠져나와 세상에 당신의 빛을 내놓으세요. 배운 것을 실천으로 옮기는 것이 이 월지 출생의 핵심 과제입니다.',
          '햇빛과 사람을 가까이 하고, 혼자만의 생각에 갇히지 않도록 정기적으로 밖으로 나가는 시간을 만드세요.',
          '깊은 내면의 통찰을 다른 사람에게 나누는 출구를 하나 이상 만들면, 고립은 연결로 바뀝니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  },
  {
    month_pattern_id: '을_축',
    day_master: '을',
    month_branch: '축',
    season: '겨울',
    element_interaction: '덩굴이 얼어붙은 겨울 흙에 매달리는',
    label: '화초가 얼어붙은 겨울 땅에 매달리는 — 인내와 준비의 기운',
    modules: [
      {
        module_id: '을_축_mindset',
        domain_key: 'mindset',
        domain_label: '마음가짐',
        domain_index: 1,
        points: [
          '당신은 얼어붙은 겨울 땅에 매달리는 화초 같은 사람입니다. 인내와 준비, 버티기의 에너지가 지배하는 자리입니다.',
          '얼어붙은 땅에 매달려 봄을 기다리세요 — 체력과 끈기, 그리고 봄이 올 것이라는 믿음이 필요합니다.',
          '지금은 화려한 성과보다 살아남는 것 자체가 성과이니, 조급해하지 말고 체력을 아끼세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_축_health',
        domain_key: 'health',
        domain_label: '건강',
        domain_index: 2,
        points: [
          '비장과 위가 차가워져 냉증, 소화력 저하, 손발 차가움이 생기기 쉬운 자리입니다.',
          '따뜻한 음식과 체력 보충에 신경 쓰고, 찬 음식과 과식은 비위를 더 식히니 삼가야 합니다.',
          '혹한의 땅에 매달린 만큼 체력 관리가 생명이니, 무리하지 말고 규칙적으로 쉬면서 버텨야 합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_축_career',
        domain_key: 'career',
        domain_label: '일과 직업',
        domain_index: 3,
        points: [
          '인내가 필요한 일, 농업, 관리, 기초 작업 등 느리지만 확실하게 쌓아가는 분야가 어울립니다.',
          '당장의 성과는 작아도 꾸준히 버티면 결실이 오니, 조급함을 버리고 기초를 튼튼히 다지세요.',
          '혼자 묵묵히 일하기 쉬운 자리이니, 때로는 윗사람이나 동료의 도움을 받는 것도 지혜입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_축_romance',
        domain_key: 'romance',
        domain_label: '애정운',
        domain_index: 4,
        points: [
          '관계가 얼어붙거나 정체되기 쉬운 흐름으로, 인내와 온기가 필요한 만남이 됩니다.',
          '차가운 분위기를 풀기 위해 먼저 따뜻한 말과 행동을 건네고, 서두르지 말고 천천히 온기를 쌓으세요.',
          '가장 추운 겨울이 지나면 봄이 옵니다 — 관계에도 봄이 오니, 끝까지 포기하지 마세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_축_wealth',
        domain_key: 'wealth',
        domain_label: '재물',
        domain_index: 5,
        points: [
          '적지만 안정적인 수입이 들어오는 편으로, 모아두는 형에 가깝습니다. 천천히 불리는 것이 안전합니다.',
          '무리한 투자나 빠른 수익을 노리면 손해가 크니, 원금을 지키며 조금씩 키우는 방향이 좋습니다.',
          '체력이 곧 재물인 자리이니, 건강을 돌보는 것이 재물 관리의 첫걸음입니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_축_relationships',
        domain_key: 'relationships',
        domain_label: '인간관계',
        domain_index: 6,
        points: [
          '소수이고 인내심이 필요한 관계가 형성됩니다. 춥고 단단한 인맥이지만, 한번 맺으면 끈이 질깁니다.',
          '관계에 온기를 더해 줄 따뜻한 사람을 가까이 하고, 얼어붙은 감정을 먼저 녹이는 배려가 필요합니다.',
          '말이 아닌 행동으로 신뢰를 보여주는 사람을 가까이 두세요.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_축_growth',
        domain_key: 'growth',
        domain_label: '성장과 학습',
        domain_index: 7,
        points: [
          '기초 체력, 인내력, 장기 계획을 세우는 데 집중하기 좋은 시기입니다. 눈에 띄지 않아도 단단하게 자랍니다.',
          '겨울의 추위 속에서 뿌리를 깊이 내리는 나무가 되듯, 겉으로 드러나지 않는 내공을 쌓으세요.',
          '느린 성장에 초조해하지 말고, 봄을 향한 준비를 착실히 하는 마음이 필요합니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      },
      {
        module_id: '을_축_must_do',
        domain_key: 'must_do',
        domain_label: '이 월지 출생의 핵심 과제',
        domain_index: 8,
        points: [
          '체력 관리와 끈기가 이 월지 출생의 가장 중요한 과제입니다. 가장 추운 겨울이 지나면 봄이 옵니다 — 버티는 자가 이깁니다.',
          '얼어붙은 환경 속에서도 봄을 향한 준비를 멈추지 마세요. 지금의 인내가 훗날 가장 단단한 뿌리가 됩니다.',
          '혼자만 버티려 하지 말고, 따뜻함을 나눌 수 있는 사람을 곁에 두어야 혹한도 함께 견딜 수 있습니다.'
        ],
        closing: null,
        tone: 'natural',
        review_status: 'approved'
      }
    ]
  }
],
};
