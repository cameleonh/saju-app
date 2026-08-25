// server/storage/seeds/natal-chapters.mjs
// Natal reading chapter DB — feature-conditional chapter scheme (Stage 4)
// 16 chapter slots: 7 always-on + 9 feature-conditional; 80 content modules.
// Same seed conventions as month-* seeds (module text + tone + review_status):
// review_status lives on the module — the variant object when the chapter has
// variants, else the chapter base — with the chapter-level value as the
// fallback default. Round 1 operator review (2026-08-17 render pack) approved
// 58/80 modules; the remaining 22 rare-conditional variants stay 'draft'
// until Round 2 (see %TEMP%\saju-review-pack\COVERAGE.md). Placeholders {key}
// are resolved by server/domain/natal-chapter-selection.mjs against extracted
// natal features.

export const NATAL_CHAPTER_VERSION = '1.0.0';

export const NATAL_CHAPTERS = Object.freeze([

// ── 1. 전체 흐름 (always) ─────────────────────────────
{
  chapter_id: 'overview', domain_index: 1, title: '전체 흐름', kind: '내 명식',
  selection: { type: 'always' },
  evidence: ['day.element', 'balance.dominant'],
  questions: ['중심의 기운과 전체의 물결이 같은 방향으로 흘렀던 때는 언제인가요?', '두 기운이 다른 방향을 가리켰을 때 나는 주로 어디에 섰나요?'],
  base: {
    lead: '당신의 중심에는 {day_master}({day_master_element}) 일간이 앉아 있습니다. 여덟 글자 가운데 몸에 가장 가까운 글자로, 당신이 세상을 대하는 기본 옷깃입니다.',
    detail: '다섯 기운 가운데서는 {dominant_element}가 {dominant_count}자로 가장 두드러집니다. 중심의 색과 전체의 물결이 같을 수도 있고 다를 수도 있습니다 — 그 차이가 당신의 쓰임새를 읽는 첫 단서입니다.',
    practice: '오늘 하루, 중심 기운({day_master_element})이 나온 장면 하나와 전체 분포({dominant_element})가 이끈 장면 하나를 나누어 적어보세요.',
  },
  tone: 'natural', review_status: 'approved', // Round 1
},

// ── 2. 일간의 기조 (always, 10 day-master variants) ────
{
  chapter_id: 'day_master_image', domain_index: 2, title: '일간의 기조', kind: '일간의 기조',
  selection: { type: 'always' },
  evidence: ['day.element'],
  questions: ['내 바탕의 힘이 가장 잘 쓰인 때는 언제였나요?', '내 바탕의 그늘을 만난 때는 언제였나요?'],
  variant_key: 'day_master',
  variants: {
    '갑': {
      lead: '갑(甲)은 크고 곧은 나무입니다. 뿌리 깊은 소나무처럼 위로 뻗으며 제 자리를 지키는 힘이 당신의 바탕입니다.',
      detail: '곧은 마음과 시작하는 힘이 강점입니다. 다만 나무가 너무 곧으면 부러지듯, 고집이 굳어지면 남의 손길을 밀어내기 쉽습니다. 큰 가지는 바람에 흔들리도록 두셔야 합니다.',
      practice: '이번 주에 곧게 밀고 나간 일 하나와, 한 발 물러서 들은 조언 하나를 나란히 적어보세요.',
      review_status: 'approved', // Round 1
    },
    '을': {
      lead: '을(乙)은 덩굴과 화초의 나무입니다. 큰 나무 곁을 감고 오르듯 부드럽게 제 길을 찾는 힘이 당신의 바탕입니다.',
      detail: '유연함과 적응이 강점이라 어디에 심겨도 삽니다. 다만 기댈 나무를 찾는 습성이 깊어, 홀로 서는 연습이 평생의 공부입니다. 덩굴에도 줄기가 있다는 것을 잊지 마시지요.',
      practice: '이번 주에 혼자 결정해서 끝낸 일 하나를 적어 두세요. 그 기록이 홀로 서는 힘을 기릅니다.',
      review_status: 'draft', // Round 2
    },
    '병': {
      lead: '병(丙)은 한낮의 태양입니다. 만물을 두루 비추는 큰 빛이 당신의 바탕이라, 있는 자리가 환해집니다.',
      detail: '밝음과 포용이 강점입니다. 다만 해가 저물 줄 모르고 타오르면 지칩니다 — 열심히 빛나던 끝의 공허를 아시는지요. 기운을 아껴 쓰는 법이 이 그릇의 숙제입니다.',
      practice: '빛을 내는 일과 기운을 채우는 시간을 이번 주 일정에 나란히 적어보세요.',
      review_status: 'approved', // Round 1
    },
    '정': {
      lead: '정(丁)은 촛불과 등불입니다. 어둠 속에서도 한 점을 밝히는 섬세한 불이 당신의 바탕입니다.',
      detail: '집중과 관찰이 강점이라 남들이 지나친 디테일을 살핍니다. 다만 바람에 흔들리는 불심지처럼 예민해지기 쉬우니, 감정의 창을 조금 닫아두는 시간이 필요합니다.',
      practice: '하루 한 번, 불을 낮추듯 손길을 멈추고 호흡만 세어보세요.',
      review_status: 'approved', // Round 1
    },
    '무': {
      lead: '무(戊)는 큰 산과 둑의 흙입니다. 묵직하게 버티고 지키는 힘이 당신의 바탕이라, 사람들이 기대어 쉬는 자리가 됩니다.',
      detail: '신뢰와 인내가 강점입니다. 다만 산이 굳어지면 물이 흐르지 않듯, 변화를 미루는 고집이 걸림돌이 됩니다. 산에도 봄이 온다는 것을 기억하시지요.',
      practice: '미뤄둔 변화 하나를 아주 작은 첫 삽으로 이번 주에 시작해 보세요.',
      review_status: 'approved', // Round 1
    },
    '기': {
      lead: '기(己)는 밭과 정원의 흙입니다. 씨앗을 품고 기르는 힘이 당신의 바탕이라, 당신 곁에는 무언가 자라납니다.',
      detail: '배려와 실용이 강점이라 사람과 일을 가리지 않고 살립니다. 다만 밭이 남의 씨앗으로만 채워지면 정작 제 꽃을 못 피웁니다 — 자신을 기르는 일도 밭일입니다.',
      practice: '남을 돌본 날과 나를 돌본 날을 달력에 표시해 보세요. 둘의 균형이 이번 달의 눈금입니다.',
      review_status: 'draft', // Round 2
    },
    '경': {
      lead: '경(庚)은 칼과 쇠입니다. 결단하고 자르는 힘이 당신의 바탕이라, 어지러운 자리를 단칼에 정리합니다.',
      detail: '결단력과 의리가 강점입니다. 다만 날이 선 만큼 스친 자리에 상처가 남기 쉽습니다. 칼집이 있는 칼이 오래 쓰이는 법입니다.',
      practice: '이번 주에 끊어낼 일 하나와, 끊지 않고 봉합할 일 하나를 미리 정해두세요.',
      review_status: 'approved', // Round 1
    },
    '신': {
      lead: '신(辛)은 보석과 장신구의 쇠입니다. 빛을 받아 다시 빛내는 섬세함이 당신의 바탕입니다.',
      detail: '감각과 직관이 강점이라 미묘한 차이를 알아봅니다. 다만 보석은 작은 흠에도 금이 가듯, 완벽을 향한 예민함이 스스로를 닳게 합니다. 조금 무딘 흙도 마음에 두시지요.',
      practice: '미완인 채로 내놓은 결과 하나를 되돌아보고, 그대로의 가치를 한 줄 적어보세요.',
      review_status: 'draft', // Round 2
    },
    '임': {
      lead: '임(壬)은 바다와 큰 강입니다. 넓고 깊게 흐르는 힘이 당신의 바탕이라, 굽이마다 새 길을 만듭니다.',
      detail: '포용과 지혜가 강점이라 사람과 생각이 모입니다. 다만 물은 흩어지기 쉬우니 — 넓음을 좁음으로 바꾸는 닻이 필요합니다. 강도 좁은 골짜기에서 소리를 낸다는 것을 기억하시지요.',
      practice: '흩어져 있는 관심사를 한 줄로 좁혀 적고, 이번 주에는 그 한 줄에만 물을 대세요.',
      review_status: 'approved', // Round 1
    },
    '계': {
      lead: '계(癸)는 이슬과 샘물입니다. 조용히 스며들어 적시는 힘이 당신의 바탕이라, 말없이 깊은 자리까지 닿습니다.',
      detail: '직관과 인내가 강점입니다. 다만 안으로 깊이 스미는 만큼 침체와 우울이 찾기 쉽습니다 — 샘물도 솟아나야 산 물입니다. 밖으로 나가 햇볕을 쬐는 일을 게을리하지 마시지요.',
      practice: '마음에 고인 생각 하나를 말로 꺼내 누군가에게 들려보세요. 스미는 물도 소리를 냅니다.',
      review_status: 'approved', // Round 1
    },
  },
  tone: 'natural', review_status: 'draft', // default — variant-level Round 1/2 statuses above
},

// ── 3. 태어난 계절의 뿌리 (always, 4 season variants) ──
{
  chapter_id: 'seasonal_root', domain_index: 3, title: '태어난 계절의 뿌리', kind: '계절의 뿌리',
  selection: { type: 'always' },
  evidence: ['month.pillar'],
  questions: ['내 계절의 기운이 가장 잘 맞는 생활은 무엇인가요?', '그 계절의 그늘에서 나는 어떻게 지내왔나요?'],
  variant_key: 'season',
  variants: {
    '봄': {
      lead: '당신은 봄에 뿌리를 둔 명식입니다. 월지 {month_branch_hangul}의 자리에서 만물이 움 트는 기운이 바탕에 깔려 있습니다.',
      detail: '봄의 사주는 시작과 성장에 재주가 있습니다. 방향을 세우는 힘이 강한 만큼, 꽃이 진 뒤 열매를 기다리는 인내가 공부입니다. 심는 계절의 사람은 거두는 계절까지 미리 그려두어야 합니다.',
      practice: '지금 심고 있는 씨앗 하나가 열매 맺는 모습을 구체적으로 적어보세요.',
    },
    '여름': {
      lead: '당신은 여름에 뿌리를 둔 명식입니다. 월지 {month_branch_hangul}의 자리에서 만물이 타오르는 기운이 바탕에 깔려 있습니다.',
      detail: '여름의 사주는 열정과 실행에서 앞섭니다. 타오르는 만큼 기운의 소모가 크니, 그늘과 물을 챙기는 것이 재주입니다. 한여름의 나무는 쉬는 법을 알아야 가을까지 삽니다.',
      practice: '불을 지피는 일과 물을 마시는 시간을 하루 구분하여 적어보세요.',
    },
    '가을': {
      lead: '당신은 가을에 뿌리를 둔 명식입니다. 월지 {month_branch_hangul}의 자리에서 만물이 여무는 기운이 바탕에 깔려 있습니다.',
      detail: '가을의 사주는 정리와 결실에 재주가 있습니다. 날이 선 만큼 남을 자르기 쉬우니, 거두는 칼은 곳간을 위해 쓰는 법입니다. 결실 뒤의 나눔이 이 계절의 공부입니다.',
      practice: '이번 주에 거둘 것 하나와 나눌 것 하나를 정해보세요.',
    },
    '겨울': {
      lead: '당신은 겨울에 뿌리를 둔 명식입니다. 월지 {month_branch_hangul}의 자리에서 만물이 쉬는 기운이 바탕에 깔려 있습니다.',
      detail: '겨울의 사주는 깊이와 인내가 바탕입니다. 안으로 모으는 힘이 강한 만큼, 밖으로 움직이는 결기를 스스로 만들어야 합니다. 얼음 밑에서도 물은 흐른다는 것을 기억하시지요.',
      practice: '하루 한 번, 몸을 데울 만큼 움직이는 일을 정해두세요.',
    },
  },
  tone: 'natural', review_status: 'approved', // Round 1 — all 4 season variants reviewed
},

// ── 4. 십신이 그리는 역할 (always, 10 primary ten-god variants) ──
{
  chapter_id: 'ten_god_structure', domain_index: 4, title: '십신이 그리는 역할', kind: '역할과 관계',
  selection: { type: 'always' },
  evidence: ['ten-god.visible', 'day.element'],
  questions: ['이 역할이 내 삶에서 가장 자주 나타나는 자리는 어디인가요?', '이 역할이 힘이 될 때와 벽이 될 때는 각각 언제인가요?'],
  variant_key: 'primary_ten_god',
  variants: {
    '비견': {
      lead: '월주에 비견이 앉아 있습니다. 나와 같은 기운이 바로 옆자리를 지키는 구조입니다.',
      detail: '주체성이 앞서고 동료와의 거리를 스스로 정합니다. 밀어내는 힘이 강한 만큼, 함께 서는 법을 배우면 홀로 서던 산이 마을이 됩니다.',
      practice: '혼자 이룬 일과 함께 이룬 일을 나란히 적어보세요.',
      review_status: 'approved', // Round 1
    },
    '겁재': {
      lead: '월주에 겁재가 앉아 있습니다. 같은 오행의 다른 극 기운이 옆자리에서 경쟁합니다.',
      detail: '경쟁이 분발을 만들지만 판이 커지면 기운이 흩어집니다. 다투어 이기는 것보다 나누어 가지는 쪽이 이 구조의 이득입니다.',
      practice: '경쟁하는 자리 하나를 나누는 자리로 바꾸어 보세요.',
      review_status: 'approved', // Round 1
    },
    '식신': {
      lead: '월주에 식신이 앉아 있습니다. 일간이 생해내는 기운이 옆자리에서 열매를 맺습니다.',
      detail: '표현과 완성이 재주입니다. 가꾸고 차리는 일에서 두각을 보이니, 결과물을 쌓는 것이 이 구조의 길입니다. 즐거움이 지나치면 나태가 되는 것만 조심하시지요.',
      practice: '이번 주에 완성할 결과물 하나를 정하세요.',
      review_status: 'approved', // Round 1
    },
    '상관': {
      lead: '월주에 상관이 앉아 있습니다. 일간이 뻗어 나가는 날카로운 기운이 옆자리에서 빛납니다.',
      detail: '재치와 비판이 재주입니다. 불편함을 고치는 제안에서 힘이 나지만, 말이 앞서면 사람이 다칩니다. 칼은 갈아서 쓰는 법입니다.',
      practice: '비판하고 싶은 것을 제안의 말로 바꾸어 한 번 연습해 보세요.',
      review_status: 'approved', // Round 1
    },
    '편재': {
      lead: '월주에 편재가 앉아 있습니다. 일간이 다스리는 넓은 재물의 기운이 옆자리에 펼쳐 있습니다.',
      detail: '기회를 넓게 보는 재주가 있습니다. 손이 크고 발이 빠른 만큼, 씀과 거둠의 균형이 이 구조의 숙제입니다. 흩어 뿌린 씨 중에 골라 거두는 눈을 기르시지요.',
      practice: '이번 달의 씀을 세 곳으로 나누어 골라 적어보세요.',
      review_status: 'draft', // Round 2
    },
    '정재': {
      lead: '월주에 정재가 앉아 있습니다. 일간이 다스리는 정돈된 재물의 기운이 옆자리에 쌓입니다.',
      detail: '쌓고 지키는 재주가 있습니다. 꾸준함이 곧 재물이 되는 구조이니, 작은 이익을 무시하지 마세요. 다만 지키기만 하는 흙이 굳지 않도록, 쓸 곳을 정해 두는 것이 지혜입니다.',
      practice: '모으는 통 하나와 쓰는 통 하나를 정해보세요.',
      review_status: 'draft', // Round 2
    },
    '편관': {
      lead: '월주에 편관이 앉아 있습니다. 일간을 다스리는 강한 기운이 옆자리에서 누릅니다.',
      detail: '책임과 단련이 삶의 재료입니다. 압박 속에서 성장하는 그릇이니, 어려움을 피하지 않되 부러지지 않게 마디를 굽힐 줄 알아야 합니다. 쉼은 게으름이 아니라 무예입니다.',
      practice: '지고 있는 책임 하나를 적고, 그 무게를 덜어줄 사람을 한 명 정해보세요.',
      review_status: 'approved', // Round 1
    },
    '정관': {
      lead: '월주에 정관이 앉아 있습니다. 일간을 다스리는 바른 기운이 옆자리에서 자리를 잡습니다.',
      detail: '기준과 신뢰가 삶의 뼈대입니다. 맡은 역할에서 인정을 받는 구조이니, 원칙이 곧 이름이 됩니다. 다만 뼈대가 굳으면 몸이 뻣뻣해지니, 융통을 배우는 것도 원칙입니다.',
      practice: '지키는 기준 하나와 놓아도 좋을 기준 하나를 가려보세요.',
      review_status: 'draft', // Round 2
    },
    '편인': {
      lead: '월주에 편인이 앉아 있습니다. 일간을 적시는 깊은 기운이 옆자리에서 고여 있습니다.',
      detail: '직관과 학문이 재주입니다. 남다른 통찰이 오지만, 고인 물은 썩기 쉬우니 생각을 행동으로 흘려보내야 합니다. 배움은 쓰임으로 완성됩니다.',
      practice: '떠오른 통찰 하나를 행동 한 스푼으로 줄여 이번 주에 실행하세요.',
      review_status: 'approved', // Round 1
    },
    '정인': {
      lead: '월주에 정인이 앉아 있습니다. 일간을 키우는 정다운 기운이 옆자리에서 받쳐줍니다.',
      detail: '배움과 지원이 바탕입니다. 귀인의 손이 닿는 구조이니, 받은 것을 어디에 쓸지 정해두는 것이 이 은혜의 갚음입니다. 준비가 길어지면 실행의 문지방만 높아집니다.',
      practice: '받은 도움 하나를 적고, 그것으로 만들 결과를 정하세요.',
      review_status: 'approved', // Round 1
    },
  },
  tone: 'natural', review_status: 'draft', // default — variant-level Round 1/2 statuses above
},

// ── 5. 다섯 기운의 분포 (always, 5 dominant-element variants) ──
{
  chapter_id: 'element_balance', domain_index: 5, title: '다섯 기운의 분포', kind: '다섯 기운',
  selection: { type: 'always' },
  evidence: ['balance.dominant', 'input.policy'],
  questions: ['가장 두터운 기운이 나를 이끄는 장면은 무엇인가요?', '그 기운이 쉼이 필요하다고 속삭일 때는 언제인가요?'],
  variant_key: 'dominant_element',
  variants: {
    '목': {
      lead: '여덟 글자 사이에서 목의 기운이 가장 두텁습니다. 뻗고 세우는 힘이 판을 이룹니다.',
      detail: '목이 두터우면 방향과 주장이 분명합니다. 다만 숲이 우거지면 길이 사라지듯, 뻗는 일이 많으면 골라 할 일이 흐려집니다. 가지를 쳐주는 정리가 이 판의 화풀이입니다.',
      practice: '뻗어 있는 일의 목록에서 반드시 남길 가지 하나만 골라보세요.',
    },
    '화': {
      lead: '여덟 글자 사이에서 화의 기운이 가장 두텁습니다. 밝히고 타오르는 힘이 판을 이룹니다.',
      detail: '화가 두터우면 열정과 표현이 앞섭니다. 다만 장작 없는 불은 오래 타지 못하니, 기운의 공급처를 챙겨야 합니다. 불은 온기를 나누는 데서 제 몫을 다합니다.',
      practice: '나를 태우는 장작 목록 세 가지를 적어보세요.',
    },
    '토': {
      lead: '여덟 글자 사이에서 토의 기운이 가장 두텁습니다. 품고 버티는 힘이 판을 이룹니다.',
      detail: '토가 두터우면 든든하고 신뢰가 갑니다. 다만 흙이 굳으면 밭이 되지 못하듯, 참는 것이 습관이 되면 굳은 둑이 터집니다. 쌓인 것을 걷어내는 배수가 이 판의 숙제입니다.',
      practice: '참고만 있는 일 하나를 꺼내어 말로 정리해 보세요.',
    },
    '금': {
      lead: '여덟 글자 사이에서 금의 기운이 가장 두텁습니다. 베고 다듬는 힘이 판을 이룹니다.',
      detail: '금이 두터우면 결단과 원칙이 분명합니다. 다만 칼이 많으면 스치는 곳마다 상처가 남습니다. 벼리는 돌을 곁에 두면 칼이 흉기가 아니라 도구가 됩니다.',
      practice: '결단이 필요한 일과 붙들고 있을 일을 가르는 선을 그어보세요.',
    },
    '수': {
      lead: '여덟 글자 사이에서 수의 기운이 가장 두텁습니다. 흐르고 스미는 힘이 판을 이룹니다.',
      detail: '수가 두터우면 지혜와 유연함이 깊습니다. 다만 물이 많으면 둑이 필요하듯, 생각을 흐르는 대로 두면 결이 흐려집니다. 가두어 쓸 곳을 정하는 것이 이 판의 공부입니다.',
      practice: '흐르는 생각을 받아둘 그릇 — 노트나 달력 — 하나를 정하세요.',
    },
  },
  tone: 'natural', review_status: 'approved', // Round 1 — all 5 element variants reviewed
},

// ── 6. 인연과 일과 몸의 단서 (always, 10 day-master variants) ──
{
  chapter_id: 'life_hints', domain_index: 6, title: '인연과 일과 몸의 단서', kind: '인연과 일과 몸',
  selection: { type: 'always' },
  evidence: ['day.element', 'ten-god.visible'],
  questions: ['인연·일·몸의 단서 중 오늘 내게 필요한 것은 무엇인가요?', '이번 주에 실천할 수 있는 가장 작은 처방은 무엇인가요?'],
  variant_key: 'day_master',
  variants: {
    '갑': {
      lead: '인연에서는 곧은 진심이 당신의 언어입니다. 꾸밈없이 행동으로 보여주는 인연이 닿습니다.',
      detail: '일에서는 개척과 주도가 씨앗이라 새 길을 여는 자리에서 빛납니다. 몸에서는 간·담과 목·어깨를 살피시지요. 스트레스가 곧 근육에 얹힙니다.',
      practice: '목과 어깨의 뭉침을 풀어주는 시간을 일주일에 두 번은 두세요.',
      review_status: 'approved', // Round 1
    },
    '을': {
      lead: '인연에서는 다정한 살핌이 당신의 언어입니다. 부드러움이 인연을 끌어당깁니다.',
      detail: '일에서는 조율과 돌봄, 가르치고 기르는 자리에서 빛납니다. 몸에서는 간·담과 호흡기·피부를 살피시지요. 환절기 감기와 알레르기가 찾아오기 쉽습니다.',
      practice: '환절기마다 몸의 결 — 피부와 호흡 — 을 점검하는 날을 정해두세요.',
      review_status: 'draft', // Round 2
    },
    '병': {
      lead: '인연에서는 밝은 온기가 당신의 언어입니다. 있는 자리가 따뜻해집니다.',
      detail: '일에서는 보여주고 알리는 자리 — 발표와 기획, 마케팅에서 빛납니다. 몸에서는 심장과 눈, 혈압을 살피시지요. 뜨거운 만큼 식는 것도 빠릅니다.',
      practice: '하루 끝에 눈을 감고 심장의 박동을 잠시 세어보세요.',
      review_status: 'approved', // Round 1
    },
    '정': {
      lead: '인연에서는 섬세한 배려가 당신의 언어입니다. 말보다 마음 챙김이 인연을 깊게 합니다.',
      detail: '일에서는 연구·기획·문서처럼 정밀한 자리에서 빛납니다. 몸에서는 심장과 눈, 잠을 살피시지요. 예민한 날에는 불을 낮추듯 자극을 줄이세요.',
      practice: '자기 전 화면을 끄고 등불만 켜두는 반 시간을 만들어 보세요.',
      review_status: 'approved', // Round 1
    },
    '무': {
      lead: '인연에서는 묵직한 신뢰가 당신의 언어입니다. 말수가 적어도 곁이 든든해집니다.',
      detail: '일에서는 관리·책임·공공처럼 지키는 자리에서 빛납니다. 몸에서는 비장·위와 소화기를 살피시지요. 근심이 곧 위장에 내려앉습니다.',
      practice: '걱정이 올라올 때마다 종이에 내려놓고, 밥을 먹을 때는 밥에만 집중해 보세요.',
      review_status: 'approved', // Round 1
    },
    '기': {
      lead: '인연에서는 품어주는 살핌이 당신의 언어입니다. 당신 곁의 사람들은 쉼을 얻습니다.',
      detail: '일에서는 교육·돌봄·서비스처럼 기르는 자리에서 빛납니다. 몸에서는 비장·위와 피부를 살피시지요. 남을 채우다 제 그릇이 비기 쉽습니다.',
      practice: '밥을 지을 때 나의 몫도 따로 지어두세요.',
      review_status: 'draft', // Round 2
    },
    '경': {
      lead: '인연에서는 의리와 결단이 당신의 언어입니다. 흔들리지 않는 곁이 되어줍니다.',
      detail: '일에서는 법·기술·금융처럼 단단한 자리에서 빛납니다. 몸에서는 폐·대장과 호흡기를 살피시지요. 크고 작은 상처를 대수롭지 않게 넘기지 마세요.',
      practice: '숨을 길게 내쉬는 호흡법을 하루 한 번 익혀두세요.',
      review_status: 'approved', // Round 1
    },
    '신': {
      lead: '인연에서는 안목과 섬세함이 당신의 언어입니다. 좋은 것을 알아보는 눈이 인연을 가려냅니다.',
      detail: '일에서는 예술·디자인·기술처럼 다듬는 자리에서 빛납니다. 몸에서는 폐·대장과 신경성 두통을 살피시지요. 완벽의 자루가 가벼워지도록 짐을 덜어내세요.',
      practice: '이번 주에 실패해도 좋은 서투른 시도 하나를 해보세요.',
      review_status: 'draft', // Round 2
    },
    '임': {
      lead: '인연에서는 넓은 포용이 당신의 언어입니다. 물처럼 여러 사람을 만나 흐릅니다.',
      detail: '일에서는 유통·미디어·교역처럼 흐르는 자리에서 빛납니다. 몸에서는 신장·방광과 수분 대사를 살피시지요. 흘러다니는 만큼 뿌리 내릴 곳도 정해두셔야 합니다.',
      practice: '뿌리내릴 사람이나 장소 하나를 정하고 그곳에 꾸준히 드나드세요.',
      review_status: 'approved', // Round 1
    },
    '계': {
      lead: '인연에서는 조용한 깊이가 당신의 언어입니다. 말수가 적어도 닿는 곳이 깊습니다.',
      detail: '일에서는 연구·상담·문서·분석처럼 스미는 자리에서 빛납니다. 몸에서는 신장·방광과 잠을 살피시지요. 모자란 잠이 곧 마음의 결이 됩니다.',
      practice: '잠드는 시각을 한 시간 당겨보는 것을 이번 주 과제로 두세요.',
      review_status: 'approved', // Round 1
    },
  },
  tone: 'natural', review_status: 'draft', // default — variant-level Round 1/2 statuses above
},

// ── 7. 하루의 리듬 (feature: time_known = true) ────────
{
  chapter_id: 'hour_rhythm', domain_index: 7, title: '하루의 리듬', kind: '하루의 리듬',
  selection: { type: 'feature', feature: 'time_known', equals: true },
  evidence: ['year.pillar', 'day.pillar'],
  questions: ['하루 중 가장 나답다고 느끼는 시간은 언제인가요?', '그 시간에 무엇을 하고 있습니까?'],
  base: {
    lead: '시주 {hour_branch_hangul}의 자리가 하루의 뒤안길을 가리킵니다. 나이 들어 갈수록, 아랫사람과의 인연에서 드러나는 결로 읽는 자리입니다.',
    detail: '{hour_branch_hangul} 시주의 기운은 당신이 쉬고 마무리하는 방식에 색을 얹습니다. 시주를 정해진 시간표로 받지는 마시고, 하루 중 기운이 꺾이는 시간을 관찰하는 눈금으로 쓰세요.',
    practice: '일주일 동안 기운이 가장 잘 흐르는 시간과 꺾이는 시간을 적어 시주의 글자와 견주어 보세요.',
  },
  tone: 'natural', review_status: 'approved', // Round 1
},

// ── 8. 시주를 비워 두며 (feature: time_known = false) ──
{
  chapter_id: 'unknown_time', domain_index: 8, title: '시주를 비워 두며', kind: '시각 정보 없음',
  selection: { type: 'feature', feature: 'time_known', equals: false },
  evidence: ['input.unknown-time'],
  questions: ['내 몸이 가장 잘 쉬는 방식은 무엇인가요?', '집중이 자연스러워지는 시간대는 언제인가요?'],
  base: {
    lead: '출생 시각을 알 수 없어 시주는 비워 두었습니다. 모르는 시간을 짐작으로 채우지 않는 것이 이 책상의 원칙입니다.',
    detail: '시주가 비어도 년주·월주·일주의 결을 읽는 데는 지장이 없습니다. 다만 리듬에 관한 이야기는 사주에서 얻을 수 없으니, 당신의 기록이 그 자리를 대신합니다.',
    practice: '이번 주는 잠든 시각과 집중이 잘된 시각만 적어두세요. 그 기록이 당신의 시주가 됩니다.',
  },
  tone: 'natural', review_status: 'approved', // Round 1
},

// ── 9. 겹쳐 흐르는 기운 (feature: repeated_ten_god) ────
{
  chapter_id: 'repeated_ten_god', domain_index: 9, title: '겹쳐 흐르는 기운', kind: '겹치는 기운',
  selection: { type: 'feature', feature: 'repeated_ten_god', notEmpty: true },
  evidence: ['ten-god.visible'],
  questions: ['겹친 기운이 나에게 복이 된 사례는 무엇인가요?', '겹친 기운이 그늘이 된 사례는 무엇인가요?'],
  variant_key: 'repeated_ten_god',
  variants: {
    '비견': {
      lead: '천간 자리에 비견의 기운이 {repeated_count}번 겹쳐 보입니다. 나와 같은 기운이 여러 자리에서 목소리를 냅니다.',
      detail: '자립과 주장이 한층 굳은 구조입니다. 동료는 든든하지만 판이 좁아 보일 수 있으니, 다른 기운의 사람을 곁에 두는 것이 처방입니다.',
      practice: '나와 다른 결을 가진 사람 한 명과 이번 주에 이야기를 나눠보세요.',
      review_status: 'approved', // Round 1
    },
    '겁재': {
      lead: '천간 자리에 겁재의 기운이 {repeated_count}번 겹쳐 보입니다. 닮은 듯 다른 기운이 서로 당깁니다.',
      detail: '경쟁과 분배의 주제가 반복되는 구조입니다. 욕심이 이기려 들면 잃고, 나누면 도로 얻는 판입니다.',
      practice: '다투는 자리를 한 번 포기해 보고, 그 결과를 적어두세요.',
      review_status: 'approved', // Round 1
    },
    '식신': {
      lead: '천간 자리에 식신의 기운이 {repeated_count}번 겹쳐 보입니다. 기르고 표현하는 기운이 여러 자리에서 피어 있습니다.',
      detail: '결과물과 즐거움이 많은 구조입니다. 하는 일마다 손이 가니, 완성의 문지방을 낮추는 것이 처방입니다.',
      practice: '시작한 것 중 가장 가벼운 것 하나를 이번 주에 끝내세요.',
      review_status: 'approved', // Round 1
    },
    '상관': {
      lead: '천간 자리에 상관의 기운이 {repeated_count}번 겹쳐 보입니다. 뻗어 나가는 날카로움이 여러 자리에 서 있습니다.',
      detail: '재치가 사람을 모으고 말이 사람을 흩습니다. 입을 다스리는 것이 이 구조의 첫 공부입니다.',
      practice: '하고 싶은 말을 하루 한 번 삼키고 종이에만 적어보세요.',
      review_status: 'draft', // Round 2
    },
    '편재': {
      lead: '천간 자리에 편재의 기운이 {repeated_count}번 겹쳐 보입니다. 기회와 재물의 문이 여러 개 열려 있습니다.',
      detail: '손이 크고 길이 넓은 구조입니다. 문이 많으면 바람도 많으니, 지갑의 문을 줄이는 것이 처방입니다.',
      practice: '이번 달에 닫을 지출의 문 하나를 정하세요.',
      review_status: 'draft', // Round 2
    },
    '정재': {
      lead: '천간 자리에 정재의 기운이 {repeated_count}번 겹쳐 보입니다. 쌓이고 지켜지는 기운이 여러 자리에 앉아 있습니다.',
      detail: '모으는 재주가 배가되는 구조입니다. 다만 움켜쥔 손은 펴야 다시 쥘 수 있으니, 쓸 곳을 미리 정해두세요.',
      practice: '모은 것 중 나눌 한 몫을 정해보세요.',
      review_status: 'draft', // Round 2
    },
    '편관': {
      lead: '천간 자리에 편관의 기운이 {repeated_count}번 겹쳐 보입니다. 누르는 책임의 기운이 여러 자리에서 무겁게 앉습니다.',
      detail: '단련이 많은 구조입니다. 무거운 만큼 그릇이 커지지만, 부러지지 않도록 쉼이 곧 무예입니다.',
      practice: '짊어진 책임 목록을 적고, 하나만 내려놓을 사람을 정하세요.',
      review_status: 'approved', // Round 1
    },
    '정관': {
      lead: '천간 자리에 정관의 기운이 {repeated_count}번 겹쳐 보입니다. 기준과 역할의 기운이 여러 자리에 단정히 앉습니다.',
      detail: '인정과 신뢰가 쌓이는 구조입니다. 역할이 많아지면 제 몫을 잃기 쉬우니, 이름값 안에서도 나의 시간을 지키세요.',
      practice: '맡은 역할 중 하나의 크기를 작게 조정해 보세요.',
      review_status: 'draft', // Round 2
    },
    '편인': {
      lead: '천간 자리에 편인의 기운이 {repeated_count}번 겹쳐 보입니다. 생각이 고이는 기운이 여러 자리에서 깊게 고입니다.',
      detail: '통찰이 깊은 구조입니다. 고인 물은 흘러야 사니, 배움을 쓰임으로 내보내는 것이 처방입니다.',
      practice: '배운 것 하나를 짧은 글로 누군가에게 설명해 보세요.',
      review_status: 'draft', // Round 2
    },
    '정인': {
      lead: '천간 자리에 정인의 기운이 {repeated_count}번 겹쳐 보입니다. 배움과 지원의 기운이 여러 자리에서 받쳐줍니다.',
      detail: '은혜가 두터운 구조입니다. 받는 것이 익숙해지면 주는 것을 잊으니, 받은 것의 씀을 정해두세요.',
      practice: '받은 도움 하나에 갚을 방법을 이번 주에 정하세요.',
      review_status: 'approved', // Round 1
    },
  },
  tone: 'natural', review_status: 'draft', // default — variant-level Round 1/2 statuses above
},

// ── 10. 보이지 않는 기운 (feature: missing_elements) ──
{
  chapter_id: 'missing_element', domain_index: 10, title: '보이지 않는 기운', kind: '보이지 않는 기운',
  selection: { type: 'feature', feature: 'missing_elements', notEmpty: true },
  evidence: ['balance.dominant', 'input.policy'],
  questions: ['보이지 않는 기운을 내가 배워온 방식은 무엇인가요?', '이번 주에 그 기운을 작게 써볼 일은 무엇인가요?'],
  variant_key: 'first_missing_element',
  variants: {
    '목': {
      lead: '여덟 글자에서 목의 기운이 드러나지 않습니다. 시작과 방향의 기운이 겉으로 보이지 않는 명식입니다.',
      detail: '없다는 것은 부족함이 아니라, 그 기운을 만나는 방식이 배움이라는 뜻입니다. 새 시작을 남의 손으로 얻기보다 작게라도 직접 심는 연습이 이 명식의 공부입니다.',
      practice: '아주 작은 새 시작 하나를 이번 주에 직접 심어보세요.',
    },
    '화': {
      lead: '여덟 글자에서 화의 기운이 드러나지 않습니다. 밝힘과 열정의 기운이 겉으로 보이지 않는 명식입니다.',
      detail: '불이 없는 것이 아니라, 불을 때우는 일이 평생의 공부인 명식입니다. 표현과 온기를 의도적으로 챙기면 사람이 모입니다.',
      practice: '나의 생각을 소리 내어 말하는 자리를 일주일에 한 번 만드세요.',
    },
    '토': {
      lead: '여덟 글자에서 토의 기운이 드러나지 않습니다. 품음과 중재의 기운이 겉으로 보이지 않는 명식입니다.',
      detail: '흙이 겉에 없으면 나무도 물도 붙잡히지 않으니, 자리와 뿌리를 의도적으로 만드는 것이 공부입니다. 몸과 마음의 안방을 챙기세요.',
      practice: '매일 같은 시간 같은 자리에서 하는 루틴 하나를 만드세요.',
    },
    '금': {
      lead: '여덟 글자에서 금의 기운이 드러나지 않습니다. 결단과 마무리의 기운이 겉으로 보이지 않는 명식입니다.',
      detail: '베어내는 칼이 겉에 없으니 끝맺음이 늦어질 수 있습니다. 결론을 유예하는 습관을 알고, 마감을 남과 함께 세우세요.',
      practice: '마감이 있는 약속 하나를 만들어 끝까지 지켜보세요.',
    },
    '수': {
      lead: '여덟 글자에서 수의 기운이 드러나지 않습니다. 흐름과 지혜의 기운이 겉으로 보이지 않는 명식입니다.',
      detail: '물이 겉에 없으면 굳음이 먼저 옵니다. 유연함을 의도적으로 배우는 것이 이 명식의 공부입니다 — 남의 말을 끝까지 듣는 연습부터.',
      practice: '이번 주에 반대 의견을 끝까지 듣고 요점만 적어보세요.',
    },
  },
  tone: 'natural', review_status: 'approved', // Round 1 — all 5 element variants reviewed
},

// ── 11. 한쪽으로 기운 판 (feature: dominant_count >= 4) ──
{
  chapter_id: 'dominant_skew', domain_index: 11, title: '한쪽으로 기운 판', kind: '판의 기울기',
  selection: { type: 'feature', feature: 'dominant_count', min: 4 },
  evidence: ['balance.dominant'],
  questions: ['압도적인 기운이 가장 큰 힘이 되었던 때는 언제인가요?', '그 기운에 균형을 주어야 할 때는 언제였나요?'],
  variant_key: 'dominant_element',
  variants: {
    '목': {
      lead: '목의 기운이 {dominant_count}자로 판을 압도합니다. 숲이 우거진 명식입니다.',
      detail: '한쪽 기운이 두터우면 그 뜻이 강하게 나타나되, 비틀림도 같은 곳에서 옵니다. 목의 비틀림은 조급함과 고집이니, 기다림을 약으로 삼으세요.',
      practice: '조급해진 순간을 알아채고 하루 한 번 기록해 보세요.',
    },
    '화': {
      lead: '화의 기운이 {dominant_count}자로 판을 압도합니다. 불이 크게 타오른 명식입니다.',
      detail: '열정이 남다르되 식는 골도 깊습니다. 화의 비틀림은 조급함과 산만함이니, 물과 그늘을 약으로 삼으세요.',
      practice: '하루 한 번 아무것도 하지 않는 십 분을 두세요.',
    },
    '토': {
      lead: '토의 기운이 {dominant_count}자로 판을 압도합니다. 산이 겹으로 쌓인 명식입니다.',
      detail: '든든하되 굳습니다. 토의 비틀림은 고집과 걱정이니, 흙을 가는 갈이와 배수를 약으로 삼으세요.',
      practice: '걱정 목록을 적고 하나만 오늘의 일로 남겨두세요.',
    },
    '금': {
      lead: '금의 기운이 {dominant_count}자로 판을 압도합니다. 칼이 여러 자루 꽂힌 명식입니다.',
      detail: '결단이 빠르되 베이는 곳이 많습니다. 금의 비틀림은 날카로움이니, 부드러운 벼리를 약으로 삼으세요.',
      practice: '말을 내기 전에 한 박자 세는 습관을 이번 주에 익히세요.',
    },
    '수': {
      lead: '수의 기운이 {dominant_count}자로 판을 압도합니다. 물이 깊게 고인 명식입니다.',
      detail: '지혜가 깊되 흐릅니다. 수의 비틀림은 흩어짐과 침체이니, 둑과 방향을 약으로 삼으세요.',
      practice: '이번 주에 둑 하나 — 지킬 약속이나 정한 시간 — 을 세워보세요.',
    },
  },
  tone: 'natural', review_status: 'approved', // Round 1 — all 5 element variants reviewed
},

// ── 12. 충이 품은 긴장 (feature: natal_clash) ──────────
{
  chapter_id: 'branch_clash', domain_index: 12, title: '충이 품은 긴장', kind: '긴장의 결',
  selection: { type: 'feature', feature: 'natal_clash', notEmpty: true },
  evidence: [],
  questions: ['그 긴장이 문이 되어 열린 적이 있습니까?', '요동을 다스리는 나의 방식은 무엇입니까?'],
  variant_key: 'natal_clash_key',
  variants: {
    '자오': {
      lead: '원국에 자·오의 충이 있습니다. 물과 불이 마주 선 자리에서 팽팽한 긴장을 품고 태어났습니다.',
      detail: '충은 흔들림이자 문입니다. 이 명식의 긴장은 남의 탓이 아니라 타고난 결이니, 큰 결정과 변화가 잦은 인생으로 읽는 편이 옳습니다. 요동은 미움이 아니라 에너지입니다.',
      practice: '요동치는 영역 하나를 적고, 그곳에 둑 — 정해진 원칙 — 을 세워보세요.',
      review_status: 'draft', // Round 2
    },
    '축미': {
      lead: '원국에 축·미의 충이 있습니다. 두 흙이 서로 밀치는 자리에서 긴장을 품고 태어났습니다.',
      detail: '축미의 충은 뜻밖의 일로 쌓였던 것이 무너지는 결입니다. 한꺼번에 무너지기보다, 조금씩 비워내는 습관이 이 명식의 지혜입니다.',
      practice: '쌓아둔 일 하나를 골라 조금씩 나누어 끝내보세요.',
      review_status: 'draft', // Round 2
    },
    '인신': {
      lead: '원국에 인·신의 충이 있습니다. 나무와 쇠가 부딪히는 자리에서 긴장을 품고 태어났습니다.',
      detail: '인신의 충은 움직임과 멈춤의 다툼입니다. 가려 떠나는 일과 부딪혀 멈추는 일이 반복되니, 이동과 변동을 두려워하지 않되 뿌리가 될 것 하나는 남겨두세요.',
      practice: '떠나온 것들과 남겨둔 것들을 나란히 적어보세요.',
      review_status: 'approved', // Round 1
    },
    '묘유': {
      lead: '원국에 묘·유의 충이 있습니다. 두 정교한 기운이 부딪치는 자리에서 글이 흔들립니다.',
      detail: '묘유의 충은 예리함이 서로 베는 결입니다. 말과 감각이 날카로운 만큼 사람과 부딪히는 일이 잦습니다. 칼끝을 종이에 대면 글이 되듯, 그 결을 쓸 자리를 찾으세요.',
      practice: '베어내는 재주를 쓸 일 — 글과 수선, 편집 — 하나를 찾아 해보세요.',
      review_status: 'approved', // Round 1
    },
    '진술': {
      lead: '원국에 진·술의 충이 있습니다. 두 산이 서로 흔드는 자리에서 판이 요동입니다.',
      detail: '진술의 충은 쌓인 것이 열리는 결입니다. 고여 있던 감정과 일이 한 번에 쏟아지기 쉬우니, 곳간의 문을 조금씩 열어두는 것이 지혜입니다.',
      practice: '감정의 곳간을 점검하는 대화를 한 번 열어보세요.',
      review_status: 'draft', // Round 2
    },
    '사해': {
      lead: '원국에 사·해의 충이 있습니다. 불과 물이 마주치는 자리에서 큰 긴장을 품습니다.',
      detail: '사해의 충은 시작과 끝이 다투는 결입니다. 벌이다 무너뜨리기를 반복하니, 마무리를 남에게 맡기지 말고 제 손으로 지으세요. 끝맺음이 곧 이 명식의 도략입니다.',
      practice: '미완으로 둔 일 하나를 골라 오늘 한 걸음만 마저 가세요.',
      review_status: 'approved', // Round 1
    },
  },
  tone: 'natural', review_status: 'draft', // default — variant-level Round 1/2 statuses above
},

// ── 13. 합이 부르는 인연 (feature: natal_six_harmony) ──
{
  chapter_id: 'branch_harmony', domain_index: 13, title: '합이 부르는 인연', kind: '합의 결',
  selection: { type: 'feature', feature: 'natal_six_harmony', notEmpty: true },
  evidence: [],
  questions: ['합의 결이 가장 깊이 작동한 관계는 무엇입니까?', '그 결을 어디에 쓰고 싶습니까?'],
  variant_key: 'natal_harmony_key',
  variants: {
    '자축': {
      lead: '원국에 자·축의 육합이 있습니다. 물과 흙이 서로 붙드는 조화를 품고 태어났습니다.',
      detail: '합은 인연을 부르는 결입니다. 붙들고 붙들리는 관계가 곧 재주가 되니, 믿고 맡기는 사람 한 사람이 있는 것이 이 명식의 복입니다.',
      practice: '오래 붙들어준 사람 한 명에게 고맙다는 말을 전하세요.',
      review_status: 'approved', // Round 1
    },
    '인해': {
      lead: '원국에 인·해의 육합이 있습니다. 나무와 물이 서루 돕는 조화를 품고 태어났습니다.',
      detail: '받아 키우는 결입니다. 베풀면 돌아오는 구조라 사람과 일이 씨줄 날줄로 이어집니다. 다만 베풂이 쌓이면 바닥이 드러나니, 받는 연습도 곁들이세요.',
      practice: '이번 달에 받은 도움만 따로 적어보세요.',
      review_status: 'approved', // Round 1
    },
    '묘술': {
      lead: '원국에 묘·술의 육합이 있습니다. 두 기운이 불로 녹아 합하는 결을 품고 태어났습니다.',
      detail: '정으로 묶이는 결입니다. 한번 마음을 주면 오래가는 구조니, 사람과 일을 가려 잡는 안목이 이 명식의 처방입니다.',
      practice: '오래 가고 싶은 인연 한 명을 골라 그 이유를 적어보세요.',
      review_status: 'draft', // Round 2
    },
    '진유': {
      lead: '원국에 진·유의 육합이 있습니다. 흙과 쇠가 서로 다듬는 결을 품고 태어났습니다.',
      detail: '서로를 세공하는 결입니다. 가까이 있는 사람을 통해 제가 다듬어지는 구조니, 충고를 귀 기울여 듣는 것이 이 명식의 공부입니다.',
      practice: '최근에 들었던 충고 하나를 꺼내 다시 읽어보세요.',
      review_status: 'approved', // Round 1
    },
    '사신': {
      lead: '원국에 사·신의 육합이 있습니다. 불과 쇠가 서루를 만드는 결을 품고 태어났습니다.',
      detail: '치고 받으며 성기는 결입니다. 다툼 속에서 정이 깊어지는 구조니, 갈등을 회피하지 말고 잘 쓰는 것이 이 명식의 재주입니다.',
      practice: '건설적으로 다퉈본 경험 하나를 적어보세요.',
      review_status: 'draft', // Round 2
    },
    '오미': {
      lead: '원국에 오·미의 육합이 있습니다. 두 불기운이 한결같이 붙는 결을 품고 태어났습니다.',
      detail: '한곁으로 기우는 결입니다. 마음이 한번 기울면 오래가는 구조니, 기울 곳을 잘 가리는 것이 이 명식의 지혜입니다.',
      practice: '내 시간과 마음이 기울어 있는 곳을 적어보세요.',
      review_status: 'approved', // Round 1
    },
  },
  tone: 'natural', review_status: 'draft', // default — variant-level Round 1/2 statuses above
},

// ── 14. 삼합의 물줄 (feature: natal_three_harmony) ────
{
  chapter_id: 'three_harmony', domain_index: 14, title: '삼합의 물줄', kind: '큰 물줄',
  selection: { type: 'feature', feature: 'natal_three_harmony', notEmpty: true },
  evidence: [],
  questions: ['이 큰 물줄을 어디에 흘려보내고 싶습니까?', '물줄의 그늘 — 흩어짐과 조급함 — 을 막는 나의 둑은 무엇입니까?'],
  variant_key: 'natal_triad_key',
  variants: {
    '수국': {
      lead: '원국에 신자진 수국의 삼합이 갖추어졌습니다. 물의 길이 판을 이룹니다.',
      detail: '한 오행의 큰 물줄이 명식을 흐릅니다. 지혜와 유연함이 강점이자 과제이니, 이 물을 어디로 흘려보낼지 — 둑과 수문 — 을 정하는 것이 이 명식의 도략입니다.',
      practice: '흘려보낼 곳 한 곳을 정해 물댈 일 하나를 잡아보세요.',
      review_status: 'draft', // Round 2
    },
    '목국': {
      lead: '원국에 해묘미 목국의 삼합이 갖추어졌습니다. 나무의 길이 판을 이룹니다.',
      detail: '성장과 확장의 물줄이 명식을 흐릅니다. 뻗음이 강점이자 과제이니, 어디까지 뻗을지 선을 긋는 것이 이 명식의 도략입니다.',
      practice: '뻗을 가지와 칠 가지를 가려 적어보세요.',
      review_status: 'draft', // Round 2
    },
    '화국': {
      lead: '원국에 인오술 화국의 삼합이 갖추어졌습니다. 불의 길이 판을 이룹니다.',
      detail: '빛과 열의 물줄이 명식을 흐릅니다. 보여주는 힘이 강점이자 과제이니, 태울 곳을 정해 불을 등불로 쓰는 것이 이 명식의 도략입니다.',
      practice: '불을 등불로 쓸 일 하나 — 가르침이나 소통 — 을 정하세요.',
      review_status: 'approved', // Round 1
    },
    '금국': {
      lead: '원국에 사유축 금국의 삼합이 갖추어졌습니다. 쇠의 길이 판을 이룹니다.',
      detail: '결단과 결의 물줄이 명식을 흐릅니다. 베어내는 힘이 강점이자 과제이니, 칼을 쟁기로 쓸 일을 정하는 것이 이 명식의 도략입니다.',
      practice: '칼을 쟁기로 바꿀 일 — 정리해서 심는 일 — 하나를 찾아보세요.',
      review_status: 'draft', // Round 2
    },
  },
  tone: 'natural', review_status: 'draft', // default — variant-level Round 1/2 statuses above
},

// ── 15. 절기의 문턱에서 (feature: boundary_sensitive) ──
{
  chapter_id: 'boundary_sensitive', domain_index: 15, title: '절기의 문턱에서', kind: '문턱에서 태어남',
  selection: { type: 'feature', feature: 'boundary_sensitive', equals: true },
  evidence: ['boundary.solar-term'],
  questions: ['문턱에서 태어난 나의 변화의 결을 어디서 보았습니까?', '근거를 직접 확인하니 어떤 점이 달라 보입니까?'],
  base: {
    lead: '출생이 {boundary_term} 절기의 경계와 아주 가까웠습니다. 하늘의 문턱을 지나는 순간에 태어난 명식입니다.',
    detail: '경계의 사주는 같은 날이라도 계산 정책에 따라 년주·월주가 달라질 수 있는 자리입니다. 이 앱은 검증된 경계 규칙을 밝히고 하나를 선택하니, 결과의 근거 보기를 꼭 펼쳐 확인하세요. 문턱의 사람은 변화의 결을 타고납니다.',
    practice: '결과 화면의 경계 비교 근거를 펼쳐 스스로 확인해 보세요.',
  },
  tone: 'natural', review_status: 'approved', // Round 1
},

// ── 16. 읽기를 마치며 (always) ────────────────────────
{
  chapter_id: 'closing', domain_index: 16, title: '읽기를 마치며', kind: '읽기를 마치며',
  selection: { type: 'always' },
  evidence: ['input.policy'],
  questions: ['이 풀이와 내 경험이 다른 부분은 어디입니까?', '다음에 확인하고 싶은 장면은 무엇입니까?'],
  base: {
    lead: '이 풀이는 정해진 미래가 아니라, 타고난 결을 비추어 드린 거울입니다.',
    detail: '맞지 않는 문장은 억지로 끼워 맞추지 마시고 표시해 두세요. 독법이 쌓이면 결이 보입니다 — 다음 읽기에서 더 나은 질문이 만들어질 것입니다.',
    practice: '이번 주에 반복되는 장면 하나를 골라 사실 한 줄, 느낌 한 줄, 다음 행동 한 줄을 적어보세요.',
  },
  tone: 'natural', review_status: 'approved', // Round 1
},

]);
