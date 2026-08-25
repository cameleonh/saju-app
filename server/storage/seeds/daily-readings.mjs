// server/storage/seeds/daily-readings.mjs
// Daily reading ("오늘의 기운") content DB — doryeong-inspired, policy-adapted.
// Structure: 근거 스트립(computed) → 흐름 노트 → 4 sections (오늘의 결 · 일의 흐름 ·
// 사람 사이 · 몸의 리듬) → 오행 소품 tip → 오늘의 퀘스트 → 시간대 노트 → 서생의 한 마디.
// Same seed conventions as natal-chapters.mjs: module text + tone + review_status.
// review_status lives on the module — the variant object when the slot has
// variants — with the slot-level value as the fallback default. Round 1
// operator review (2026-08-17 render pack) approved 69/90 modules; the 21
// uncovered variants (energy 화·금, most flow pairs, props 금, 8 time branches,
// closing unknown) stay 'draft' until Round 2 (see
// %TEMP%\saju-review-pack\COVERAGE.md).
// No grading words, no scores, no luck levels —
// 흐름/결/톤 language only (product principle). Placeholders {key} are resolved by
// server/domain/daily-reading-selection.mjs against the daily reading context.
// Selection axes use ONLY engine-derived facts: day pillar (KR-CIVIL natal engine),
// ten-god vs day master, branch 충·합·형·해·원진 (chart/daewoon-branch-analysis.mjs).
// 신살 (천을귀인·도화·반안살 등) has no engine module — deliberately excluded.

export const DAILY_READING_VERSION = '1.0.0';

// ── 4 interpretation sections ─────────────────────────────────────────────
// mood / work / relations vary by today's ten-god relation to the day master
// (10 variants each); energy varies by today's day-branch element (5 variants).
export const DAILY_SECTION_SLOTS = Object.freeze([

{
  section_id: 'mood', slot_index: 1, title: '오늘의 결', kind: '하루의 결',
  variant_key: 'ten_god',
  evidence: ['daily.dayPillar', 'daily.tenGodToDayMaster'],
  variants: {
    '비견': {
      lead: '나와 같은 기운이 하루의 문을 여는 결 — 내 목소리가 또렷해지는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 당신의 일간과 같은 오행에 같은 음양입니다. 거울을 마주 앉은 것처럼 내 판단이 크게 들리고, 남의 말은 한 발 물러서 들리지요. 주체성이 사는 날이지만 고집도 함께 자라니, 문은 열어 두셔야 합니다.',
      practice: '오늘 결정할 일 하나는 남의 말과 나의 판단을 나란히 적은 뒤에 정해 보세요.',
    },
    '겁재': {
      lead: '같은 오행의 다른 결 — 경쟁하는 기운이 살아 움직이는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 당신의 일간과 같은 오행, 다른 음양입니다. 옆자리의 손이 빨라 보이고, 서두르면 잡은 것을 흘리기 쉽지요. 나누면 커지고 다투면 좁아지는 결입니다.',
      practice: '경쟁이 걸린 자리라면 이기는 그림보다 나누는 그림을 먼저 그려 보세요.',
    },
    '식신': {
      lead: '내가 기르던 것이 편안하게 피어나는 결 — 풀어내는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 일간이 생해 내는 기운이 같은 음양으로 들어왔습니다. 쌓아 둔 것을 꺼내 보이기 좋고, 손맛이 붙는 일이 순조롭습니다. 즐거움이 살지만 늘어지기도 쉬우니 끝맺는 시간을 정해 두시지요.',
      practice: '미뤄 둔 완성품 하나를 오늘 안에 마지막 매무새까지 끝내 보세요.',
    },
    '상관': {
      lead: '붓끝이 날카로워지는 결 — 재치가 살되 말이 빨라지는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 일간이 뻗어 나가는 기운이 다른 음양으로 들어왔습니다. 남이 지나친 흠이 보이고 고칠 점이 떠오릅니다. 제안은 힘이 되지만 말이 앞서면 사람이 닿아 아프지요. 갈아서 쓰는 칼이 오래 쓰이는 법입니다.',
      practice: '지적하고 싶은 것 하나를 지적이 아니라 제안의 문장으로 고쳐 적어 보세요.',
    },
    '편재': {
      lead: '다스릴 것이 넓게 펼쳐지는 결 — 움직이는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 일간이 다스리는 기운이 같은 음양으로 들어왔습니다. 할 일과 만날 사람이 넓게 늘어나고 씀씀이의 폭도 커집니다. 활동적인 결이니 범위를 정해 두면 그득해지고, 정하지 않으면 흩어집니다.',
      practice: '오늘의 지출과 약속 범위를 아침에 먼저 정해 두세요.',
    },
    '정재': {
      lead: '셈하고 정리하는 결 — 실속이 고이는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 일간이 다스리는 기운이 다른 음양으로 들어왔습니다. 꼼꼼히 정리하고 차곡차곡 쌓기 좋은 결입니다. 약속과 장부가 어긋나지 않게 하는 하루지, 크게 벌이는 하루가 아니지요.',
      practice: '미뤄 둔 정리 하나 — 장부, 서류, 서랍 — 를 오늘 안에 끝내 보세요.',
    },
    '편관': {
      lead: '긴장이 어깨에 얹히는 결 — 속도를 점검하는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 일간을 다스리는 기운이 같은 음양으로 들어왔습니다. 마감과 책임이 따라붙고 서두르면 흠이 남습니다. 무게는 무겁지만 단련이 되는 결이니, 버틸 것과 맡길 것을 가려내시지요.',
      practice: '오늘 감당할 일과 맡길 일을 종이에 나누어 적어 보세요.',
    },
    '정관': {
      lead: '질서가 곧게 서는 결 — 절제가 힘이 되는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 일간을 다스리는 기운이 다른 음양으로 들어왔습니다. 이름과 약속이 힘을 쓰는 결이라 예의 바른 자리와 서류가 잘 풀립니다. 융통은 조금 굳어도, 지킨 것이 그대로 신용이 됩니다.',
      practice: '중요한 약속이나 서명이 있다면 오전에 먼저 확인해 두세요.',
    },
    '편인': {
      lead: '생각이 깊어지는 결 — 통찰과 피로가 함께 오는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 일간을 생하는 기운이 같은 음양으로 들어왔습니다. 문득 답이 보이는 통찰이 있는가 하면, 생각이 한바탕 굴면 몸이 지칩니다. 밤샘보다 적당한 때에 붓을 내려놓는 것이 이 날의 재주입니다.',
      practice: '떠오른 생각을 잘게 적어 두고, 하루 한 번은 몸을 움직여 환기시키세요.',
    },
    '정인': {
      lead: '받아들이는 결 — 배움과 쉼이 함께 오는 날입니다.',
      detail: '오늘 일간은 {day_stem_hangul}({day_stem_char}) — 일간을 생하는 기운이 다른 음양으로 들어왔습니다. 도움과 배움이 자연스레 다가오는 결입니다. 다만 받기만 하면 채워지는 듯하면서 비니, 배운 것을 한 줄이라도 제 것으로 옮겨 적는 하루가 되시지요.',
      practice: '오늘 배우거나 받은 것 가운데 하나를 제 말로 한 줄 요약해 적어 보세요.',
    },
  },
  tone: 'natural', review_status: 'approved', // Round 1 — all 10 ten-god variants reviewed
},

{
  section_id: 'work', slot_index: 2, title: '일의 흐름', kind: '일의 흐름',
  variant_key: 'ten_god',
  evidence: ['daily.dayPillar', 'daily.tenGodToDayMaster'],
  variants: {
    '비견': {
      lead: '주도권이 손에 잡히는 흐름 — 내 이름 건 일을 밀고 가기 좋습니다.',
      detail: '같은 기운이 일의 문을 여니, 혼자 판단하고 혼자 끝내는 과제가 순조롭습니다. 다만 동료의 손길을 밀어내기 쉬우니, 확인이 필요한 일은 한 번은 되물어 보시지요.',
      practice: '미룬 과제 하나를 오늘 내 것으로 지명해 첫 삽을 뜨세요.',
    },
    '겁재': {
      lead: '경쟁과 협업이 교차하는 흐름 — 손익을 분명히 적는 날입니다.',
      detail: '같은 오행의 다른 결이 일자리를 비춥니다. 동료와 나눌 일과 내가 챙길 일의 경계가 흐려지기 쉬우니, 셈을 먼저 적어 두면 다툼이 줄어듭니다.',
      practice: '오늘의 협업 범위를 한 줄로 적어 상대와 맞춰 보세요.',
    },
    '식신': {
      lead: '완성의 흐름 — 마무리 손맛이 붙는 날입니다.',
      detail: '기르던 작업이 마지막 매무새를 만나는 흐름입니다. 벌이기보다 다듬기, 넓히기보다 마무리가 잘 됩니다. 몸이 편한 만큼 쉬는 시간도 함께 정해 두시지요.',
      practice: '아홉 할에서 멈춰 둔 일 하나를 오늘 끝까지 끝내세요.',
    },
    '상관': {
      lead: '제안의 흐름 — 문제를 고치는 아이디어가 삽니다.',
      detail: '흠과 개선점이 눈에 밟히는 흐름입니다. 고침이 힘이 되는 날이지만, 지적이 사람을 스치지 않게 말을 다듬어 쓰세요. 회의가 있다면 존중과 제안의 문형을 미리 준비하시지요.',
      practice: '고치고 싶은 점 하나를 그러니 제안합니다 문장으로 바꾸어 내보세요.',
    },
    '편재': {
      lead: '범위가 넓어지는 흐름 — 밖으로 움직이는 일이 잘 됩니다.',
      detail: '만남과 실행의 폭이 넓어지는 흐름입니다. 외부 만남, 견적, 새 품목 다루기가 순조롭습니다. 폭이 넓은 만큼 흩어지기 쉬우니, 오늘의 우선순위 하나는 못 박아 두시지요.',
      practice: '오늘 반드시 끝낼 일 하나를 정하고 나머지는 내일 칸에 적어 두세요.',
    },
    '정재': {
      lead: '정산의 흐름 — 숫자와 서류가 잘 맞아떨어집니다.',
      detail: '꼼꼼함이 사는 흐름이라 장부 정리, 결산, 계약 조건 점검이 잘 됩니다. 큰 벌이보다 바로잡기가 알맞은 날입니다. 확인을 두 번 하면 그만큼 단단해집니다.',
      practice: '밀린 정산이나 서류 하나를 오늘 안에 결재하세요.',
    },
    '편관': {
      lead: '마감의 흐름 — 무거운 일부터 먼저 붙드세요.',
      detail: '책임과 기한이 따라붙는 흐름입니다. 미루면 무게가 커지니, 어려운 일부터 책상에 올리시지요. 완벽보다 완성이 이 날의 법입니다.',
      practice: '가장 미루고 싶은 일부터 스물다섯 분만 붙들어 보세요.',
    },
    '정관': {
      lead: '절차의 흐름 — 이름 걸고 지킬 일이 잘 풀립니다.',
      detail: '규정, 서류, 보고가 힘을 쓰는 흐름입니다. 허가와 확인 절차가 순조롭고 정중한 요청이 잘 통합니다. 융통성보다 정확이 유리한 날입니다.',
      practice: '제출을 미룬 서류나 보고 하나를 오전에 끝내세요.',
    },
    '편인': {
      lead: '설계의 흐름 — 머릿속에서 굴리면 답이 옵니다.',
      detail: '생각의 결이 깊어 자료 조사, 설계, 전략 수립이 잘 됩니다. 다만 생각이 한 번 굴면 몸이 굳으니, 중간에 몸을 풀어 흐름을 트시지요.',
      practice: '고민하던 문제를 오늘 한 번은 종이 위에 펼쳐 적어 보세요.',
    },
    '정인': {
      lead: '학습의 흐름 — 배우고 받아 적기 좋은 날입니다.',
      detail: '가르침과 자료가 잘 들어오는 흐름입니다. 새로 익히는 일, 안내서 읽기, 조언 듣기가 알맞습니다. 다만 받기만 하면 흐르니, 배운 것을 소화하는 시간을 남겨 두세요.',
      practice: '오늘 배운 것을 세 문장 안으로 요약해 제 것으로 만드세요.',
    },
  },
  tone: 'natural', review_status: 'approved', // Round 1 — all 10 ten-god variants reviewed
},

{
  section_id: 'relations', slot_index: 3, title: '사람 사이', kind: '사람 사이',
  variant_key: 'ten_god',
  evidence: ['daily.dayPillar', 'daily.tenGodToDayMaster'],
  variants: {
    '비견': {
      lead: '동료의 얼굴이 가까운 날 — 나와 닮은 사람과 잘 맞습니다.',
      detail: '같은 결의 사람들이 눈에 띕니다. 벗과의 약속, 모임, 팀의 의기투합이 살고, 나와 다른 결의 사람과는 간격이 느껴집니다. 다름을 흠으로 적지 않는 것이 이 날의 예의입니다.',
      practice: '오랜 벗에게 먼저 안부 한 줄 보내 보세요.',
    },
    '겁재': {
      lead: '부탁과 경쟁이 교차하는 날 — 선을 정중히 그으세요.',
      detail: '지인의 손이 자주 뻗치는 흐름입니다. 도울 일과 못할 일을 미리 정해 두면 관계가 편해집니다. 경쟁하는 자리에서는 이기려는 말보다 함께 커지는 그림을 보이시지요.',
      practice: '오늘 받은 부탁 중 하나는 생각해 보고 답하겠다고 여유를 두어 보세요.',
    },
    '식신': {
      lead: '밥상이 잘 통하는 날 — 함께 먹는 자리가 인연을 풉니다.',
      detail: '표현이 부드럽고 정이 흐르니, 식사 자리, 소소한 안부, 웃음이 오가는 만남이 잘 어울립니다. 나눈 이야기가 오래 기억에 남을 결입니다.',
      practice: '오늘 한 끼는 꼭 누군가와 같이 드셔 보세요.',
    },
    '상관': {
      lead: '말의 온도를 조절하는 날 — 재치는 살리고 날은 누르세요.',
      detail: '입이 빨라지는 흐름입니다. 농담 하나가 벽이 되기 쉬우니 민감한 자리에서는 듣는 비중을 늘리시지요. 잘 쓰면 말 한마디가 다리가 됩니다.',
      practice: '오늘 하루, 반박하고 싶은 순간 하나는 삼키고 들어 보세요.',
    },
    '편재': {
      lead: '새 인연이 드나드는 날 — 첫인상의 폭이 넓습니다.',
      detail: '만남의 문이 넓게 열리는 흐름입니다. 모임, 소개, 지나가는 인사가 인연으로 이어지기 쉽습니다. 넓은 만남이 많은 만큼 깊은 대화 하나는 골라 지속하시지요.',
      practice: '오늘 만난 새 인연 가운데 한 사람과 다음 약속을 잡아 보세요.',
    },
    '정재': {
      lead: '약속이 단단해지는 날 — 오래된 관계에 알맞습니다.',
      detail: '정과 신용이 잘 지켜지는 흐름입니다. 오래 안다는 사람과의 약속, 갚을 것과 받을 것을 정리하는 대화가 잘 풀립니다. 큰 사교보다 깊은 확인이 어울리는 날입니다.',
      practice: '미뤄 둔 답장이나 인사 하나를 오늘 끝내 보세요.',
    },
    '편관': {
      lead: '윗사람과의 거리를 재는 날 — 예를 갖추면 힘이 됩니다.',
      detail: '책임과 위계가 의식되는 흐름입니다. 어른이나 윗자리와 만나는 자리에서는 존중을 먼저 세우고 의견은 골라 내시지요. 갈등이 걷히면 그만큼 신용이 쌓입니다.',
      practice: '오늘 존중하고 싶은 사람에게 감사를 먼저 말해 보세요.',
    },
    '정관': {
      lead: '예의가 통하는 날 — 정중한 만남이 잘 맞아떨어집니다.',
      detail: '명분과 질서가 살아 정중한 요청과 약속이 잘 지켜집니다. 첫 만남, 격식 있는 자리, 소개받은 인연에 알맞은 흐름입니다.',
      practice: '약속이 있다면 시간보다 먼저 도착해 마음을 정리하세요.',
    },
    '편인': {
      lead: '혼자 깊어지는 날 — 조언은 골라서 듣세요.',
      detail: '생각이 안으로 도는 흐름이라, 혼자 있는 시간이 오히려 관계를 지킵니다. 여러 의견을 한꺼번에 들으면 흔들리니, 맡길 조언은 한 사람으로 정하시지요.',
      practice: '고민이 있으면 가장 신뢰하는 한 사람에게만 이야기해 보세요.',
    },
    '정인': {
      lead: '은인과 스승의 날 — 도움을 겸손히 받으세요.',
      detail: '윗세대, 스승, 책이 가까워지는 흐름입니다. 배움을 청하면 잘 얻고, 받은 것은 감사로 답하면 인연이 오래갑니다. 의존이 아니라 학습의 자세가 이 날의 결입니다.',
      practice: '오늘 도움받은 사람에게 감사 인사를 구체적으로 전하세요.',
    },
  },
  tone: 'natural', review_status: 'approved', // Round 1 — all 10 ten-god variants reviewed
},

{
  section_id: 'energy', slot_index: 4, title: '몸의 리듬', kind: '몸의 리듬',
  variant_key: 'day_branch_element',
  evidence: ['daily.dayPillar.branch', 'daily.branchElement'],
  variants: {
    '목': {
      lead: '뻗는 기운의 날 — 아침이 가장 씩씩합니다.',
      detail: '오늘 일지 {day_branch_hangul}({day_branch_char})에서 목(木) 기운이 흐릅니다. 근육과 힘줄을 쓰기 좋은 날이니 아침과 오전에 몸 쓰는 일을 배치하세요. 오래 앉아 있으면 기운이 뭉치니, 자주 일어나 허리와 어깨를 풀어 주시지요.',
      practice: '아침에 몸 풀기 다섯 분, 저녁에는 쓴 만큼 풀어 주세요.',
      review_status: 'approved', // Round 1
    },
    '화': {
      lead: '타오르는 기운의 날 — 열과 물을 함께 챙기세요.',
      detail: '오늘 일지 {day_branch_hangul}({day_branch_char})에서 화(火) 기운이 흐릅니다. 낮동안 열이 올라 활동적이지만 눈과 입이 마르기 쉽습니다. 찾은 것보다 미지근한 물을 곁에 두고, 저녁에는 열을 내리는 시간을 가지시지요.',
      practice: '물을 자주 마시고, 저녁에는 온기를 내려 몸을 편히 쉬게 하세요.',
      review_status: 'draft', // Round 2
    },
    '토': {
      lead: '중심이 잡히는 기운의 날 — 식사 리듬이 곧 리듬입니다.',
      detail: '오늘 일지 {day_branch_hangul}({day_branch_char})에서 토(土) 기운이 흐릅니다. 위장과 소화가 하루의 중심이니, 밥시간을 지키는 것이 가장 잘 맞는 보양입니다. 과식보다 정해진 양, 간식보다 따뜻한 한 끼가 몸을 편하게 합니다.',
      practice: '세 끼 중 한 끼라도 제시간에 앉아서 드세요.',
      review_status: 'approved', // Round 1
    },
    '금': {
      lead: '정리되는 기운의 날 — 호흡이 곧 리듬입니다.',
      detail: '오늘 일지 {day_branch_hangul}({day_branch_char})에서 금(金) 기운이 흐릅니다. 호흡기와 피부가 하루의 결을 정하니, 먼지와 건조를 조심하고 고른 호흡을 붙이세요. 저녁의 정돈된 마무리가 내일 아침을 가볍게 합니다.',
      practice: '하루 한 번, 들숨과 날숨을 각각 네 번 세어 보세요.',
      review_status: 'draft', // Round 2
    },
    '수': {
      lead: '깊이 흐르는 기운의 날 — 잠이 가장 좋은 약입니다.',
      detail: '오늘 일지 {day_branch_hangul}({day_branch_char})에서 수(水) 기운이 흐릅니다. 콩팥과 수분, 잠이 하루의 축이니 밤을 새기보다 일찍 눕는 하루가 알맞습니다. 몸이 차게 두지 말고 따뜻한 물로 하루를 닫으시지요.',
      practice: '오늘은 평소보다 삼십 분 일찍 잠자리에 들어 보세요.',
      review_status: 'approved', // Round 1
    },
  },
  tone: 'natural', review_status: 'draft', // default — variant-level Round 1/2 statuses above
},

]);

// ── 흐름 노트 (근거 스트립과 해석 사이의 다리) ────────────────────────────
// Today's day branch × natal branch interactions (충·합·형·해·원진), from
// chart/daewoon-branch-analysis.mjs. Conditional — absent when nothing matches.
export const DAILY_FLOW_NOTES = Object.freeze({
  clash: Object.freeze({
    '자오': {
      label: '충이 열리는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {clash_positions}의 {clash_partner_hangul}({clash_partner_char})지와 충(沖)을 이룹니다. 물과 불이 마주 하는 결이라 감정과 속도의 진폭이 커기 쉬우니, 뜨거워진 안건은 식을 때까지 붙들어 두시지요.',
      review_status: 'draft', // Round 2
    },
    '축미': {
      label: '충이 열리는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {clash_positions}의 {clash_partner_hangul}({clash_partner_char})지와 충(沖)을 이룹니다. 두 흙이 서로 미는 결이라 고집과 고집이 맞서기 쉬우니, 누가 맞느냐보다 무엇이 남느냐를 적어 보시지요.',
      review_status: 'draft', // Round 2
    },
    '인신': {
      label: '충이 열리는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {clash_positions}의 {clash_partner_hangul}({clash_partner_char})지와 충(沖)을 이룹니다. 시작과 정리가 함께 몰리는 결이니, 새 일을 연다면 정리할 일도 하나 함께 정해 두시지요.',
      review_status: 'draft', // Round 2
    },
    '묘유': {
      label: '충이 열리는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {clash_positions}의 {clash_partner_hangul}({clash_partner_char})지와 충(沖)을 이룹니다. 부드러운 것과 날 선 것이 스치는 결이라 말과 감정이 스치기 쉬우니, 예민한 대화는 낮 시간으로 옮기시지요.',
      review_status: 'draft', // Round 2
    },
    '진술': {
      label: '충이 열리는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {clash_positions}의 {clash_partner_hangul}({clash_partner_char})지와 충(沖)을 이룹니다. 쌓아 둔 것이 흔들리는 결이니, 중요한 기록과 약속은 한 번 더 확인하시지요.',
      review_status: 'draft', // Round 2
    },
    '사해': {
      label: '충이 열리는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {clash_positions}의 {clash_partner_hangul}({clash_partner_char})지와 충(沖)을 이룹니다. 계획과 현실이 엇갈리기 쉬운 결이니, 일정에는 여유를 한 뼘 남겨 두시지요.',
      review_status: 'approved', // Round 1
    },
  }),
  harmony: Object.freeze({
    '자축': {
      label: '합이 이어지는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {harmony_positions}의 {harmony_partner_hangul}({harmony_partner_char})지와 육합(六合)을 이룹니다. 물과 흙이 어우러지듯 차분히 이어지는 결이니, 미뤄 둔 대화를 꺼내기 알맞습니다.',
      review_status: 'approved', // Round 1
    },
    '인해': {
      label: '합이 이어지는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {harmony_positions}의 {harmony_partner_hangul}({harmony_partner_char})지와 육합(六合)을 이룹니다. 나무에 물을 대듯 배움이 인연을 데려오는 결이니, 물어보고 싶었던 것을 묻기 좋습니다.',
      review_status: 'approved', // Round 1
    },
    '묘술': {
      label: '합이 이어지는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {harmony_positions}의 {harmony_partner_hangul}({harmony_partner_char})지와 육합(六合)을 이룹니다. 정원의 나무와 담이 어우러지듯 맡은 자리가 편안해지는 결이니, 오래 묵힌 관계를 가꾸기 알맞습니다.',
      review_status: 'draft', // Round 2
    },
    '진유': {
      label: '합이 이어지는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {harmony_positions}의 {harmony_partner_hangul}({harmony_partner_char})지와 육합(六合)을 이룹니다. 흙 속 쇠를 제련하듯 다듬을수록 매끈해지는 결이니, 마무리와 매무새에 공을 들이기 좋습니다.',
      review_status: 'draft', // Round 2
    },
    '사신': {
      label: '합이 이어지는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {harmony_positions}의 {harmony_partner_hangul}({harmony_partner_char})지와 육합(六合)을 이룹니다. 불에 쇠를 담금질하듯 서로의 쓸모가 맞물리는 결이니, 함께 하는 일과 거래가 잘 맞물립니다.',
      review_status: 'draft', // Round 2
    },
    '오미': {
      label: '합이 이어지는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {harmony_positions}의 {harmony_partner_hangul}({harmony_partner_char})지와 육합(六合)을 이룹니다. 한낮과 이른 오후가 나란히 앉듯 정이 잘 통하는 결이니, 함께 하는 식사가 인연을 묶어 줍니다.',
      review_status: 'draft', // Round 2
    },
    'trio': {
      label: '삼합으로 흐르는 결',
      text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국 {harmony_positions}의 지지와 삼합({trio_name})을 이룹니다. 한 방향으로 깊이 흐르는 결이니, 그 국(局)의 기운인 {trio_element}에 맞는 일을 오늘 안에 하나 골라 두시지요.',
      review_status: 'approved', // Round 1
    },
  }),
  both: Object.freeze({
    label: '충과 합이 함께 열리는 결',
    text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국과 충(沖)과 합(合)을 함께 이룹니다. 흐름이 엇갈리는 결이니, 잡히는 일부터 붙들고 놓을 일은 이름을 적어 두시지요.',
    review_status: 'approved', // Round 1
  }),
  friction: Object.freeze({
    label: '잔금이 가는 결',
    text: '오늘 일지 {day_branch_hangul}({day_branch_char}) — 원국과 {friction_list} 관계를 이룹니다. 큰 부딪힘은 아니어도 잔금이 가는 결이니, 예의와 매무새를 단단히 하시지요.',
    review_status: 'approved', // Round 1
  }),
});

// ── 오행 소품 (고정 표 — 결정론. 점수·효능 보장 없이 '곁에 두고 살펴보는' 소품) ──
export const DAILY_ELEMENT_PROPS = Object.freeze({
  '목': Object.freeze({ items: Object.freeze(['푸른 잎의 화분 한 분', '나무결 살린 펜']), color_note: '청록', review_status: 'approved' }), // Round 1
  '화': Object.freeze({ items: Object.freeze(['촛불 한 자루', '따뜻한 독서등']), color_note: '붉은 기', review_status: 'approved' }), // Round 1
  '토': Object.freeze({ items: Object.freeze(['도자기 컵', '흙색 깔개']), color_note: '황토', review_status: 'approved' }), // Round 1
  '금': Object.freeze({ items: Object.freeze(['금속 문방소품', '흰 꽃 한 송이']), color_note: '흰 기', review_status: 'draft' }), // Round 2
  '수': Object.freeze({ items: Object.freeze(['맑은 유리 물병', '짙은 남색 필통']), color_note: '짙은 남색', review_status: 'approved' }), // Round 1
});

export const DAILY_PROP_WHY = Object.freeze({
  missing: { text: '오늘 드러난 기운 가운데 명식에 드러나지 않았던 {element} 기운을 곁에 두고 하루의 균형을 살펴보기 위한 소품입니다', review_status: 'approved' }, // Round 1
  bridge: { text: '명식의 중심인 {dominant_element} 기운이 생해 주는 {element} 기운을 곁에 두고 흐름을 살펴보기 위한 소품입니다', review_status: 'approved' }, // Round 1
  stem: { text: '오늘 천간의 {element} 기운을 그대로 곁에 두고 하루의 결을 가늠해 보기 위한 소품입니다', review_status: 'approved' }, // Round 1
});

// ── 오늘의 퀘스트 (ten-god별 행동 문장 — 사실의 재조합) ────────────────────
export const DAILY_QUEST_SLOT = Object.freeze({
  section_id: 'quest', label: '오늘의 퀘스트',
  variant_key: 'ten_god',
  evidence: ['daily.dayPillar', 'daily.tenGodToDayMaster', 'daily.branchElement'],
  variants: Object.freeze({
    '비견': { text: '결정을 미뤄 둔 일 하나를 오늘 내 판단으로 점찍고, 첫 행동까지 옮겨 보기.', review_status: 'approved' }, // Round 1
    '겁재': { text: '오늘의 씀씀이와 나눌 것을 한 줄로 적어 두기.', review_status: 'approved' }, // Round 1
    '식신': { text: '아홉 할에서 멈춰 둔 일 하나를 끝까지 끝내기.', review_status: 'approved' }, // Round 1
    '상관': { text: '지적하고 싶은 것 하나를 제안의 문장으로 고쳐 말해 보기.', review_status: 'approved' }, // Round 1
    '편재': { text: '오늘 새로 연 문 하나에 이름과 다음 약속 남기기.', review_status: 'approved' }, // Round 1
    '정재': { text: '밀린 정리·정산·답장 가운데 하나를 오늘 안에 끝내기.', review_status: 'approved' }, // Round 1
    '편관': { text: '가장 무거운 일부터 스물다섯 분 붙들어 보기.', review_status: 'approved' }, // Round 1
    '정관': { text: '서류·보고·신청 하나를 오전에 끝내기.', review_status: 'approved' }, // Round 1
    '편인': { text: '고민을 종이에 펼쳐 적고 한 단락으로 좁히기.', review_status: 'approved' }, // Round 1
    '정인': { text: '오늘 배운 것을 세 문장으로 요약해 적기.', review_status: 'approved' }, // Round 1
  }),
});

// ── 시간대 노트 (일지 기준 — 육합 짝 시간대 · 충 짝 시간대) ────────────────
// Hour windows follow the engine's two-hour civil-time interval policy
// (zi hour 23:00–00:59; 자축인묘… 해 branches in order).
export const DAILY_TIME_NOTE_SLOT = Object.freeze({
  section_id: 'time_note', label: '시간대 노트',
  variant_key: 'day_branch_hangul',
  evidence: ['daily.dayPillar.branch', 'daily.hourWindows'],
  variants: Object.freeze({
    '자': { text: '오늘 일지 자(子)의 짝은 축(丑) — 축시(01:00–02:59)에 인연과 일이 이어지기 쉬우니 붙들어 둘 이야기를 그 시간에 나누세요. 마주치는 결은 오시(11:00–12:59) — 오(午)와 충하니 이 시간의 큰 결정은 하루 뒤로 미뤄도 좋습니다.', review_status: 'approved' }, // Round 1
    '축': { text: '오늘 일지 축(丑)의 짝은 자(子) — 자시(23:00–00:59)에 마음이 고요히 이어지니 하루를 정리하며 닫기 좋습니다. 마주치는 결은 미시(13:00–14:59) — 미(未)와 충하니 오후의 약속은 여유를 두어 여기세요.', review_status: 'approved' }, // Round 1
    '인': { text: '오늘 일지 인(寅)의 짝은 해(亥) — 해시(21:00–22:59)에 배움과 대화가 깊어지니 물어보고 싶은 것을 그 시간에 꺼내세요. 마주치는 결은 신시(15:00–16:59) — 신(申)과 충하니 늦은 오후의 결정은 가볍게 시작하세요.', review_status: 'approved' }, // Round 1
    '묘': { text: '오늘 일지 묘(卯)의 짝은 술(戌) — 술시(19:00–20:59)에 정이 편안히 이어지니 함께하는 저녁이 인연을 묶습니다. 마주치는 결은 유시(17:00–18:59) — 유(酉)와 충하니 해 질 무렵의 날 선 대화는 다음으로 미루세요.', review_status: 'draft' }, // Round 2
    '진': { text: '오늘 일지 진(辰)의 짝은 유(酉) — 유시(17:00–18:59)에 다듬고 매무새 짜는 일이 잘 되니 마무리할 일을 그 시간에 두세요. 마주치는 결은 술시(19:00–20:59) — 술(戌)과 충하니 저녁의 큰 약속은 이른 시간으로 옮기시지요.', review_status: 'draft' }, // Round 2
    '사': { text: '오늘 일지 사(巳)의 짝은 신(申) — 신시(15:00–16:59)에 서로의 쓸모가 맞물리니 함께 하는 일을 그 시간에 붙이세요. 마주치는 결은 해시(21:00–22:59) — 해(亥)와 충하니 밤의 결정은 낮의 판단에 비추어 보세요.', review_status: 'draft' }, // Round 2
    '오': { text: '오늘 일지 오(午)의 짝은 미(未) — 미시(13:00–14:59)에 정이 잘 통하니 식사와 대화를 그 시간에 나누세요. 마주치는 결은 자시(23:00–00:59) — 자(子)와 충하니 늦은 밤의 서두름은 하루를 거슬러 봅니다.', review_status: 'draft' }, // Round 2
    '미': { text: '오늘 일지 미(未)의 짝은 오(午) — 오시(11:00–12:59)에 활기가 이어지니 만남과 협의를 낮에 두세요. 마주치는 결은 축시(01:00–02:59) — 축(丑)과 충하니 새벽의 생각은 적어 두고 아침에 판단하시지요.', review_status: 'draft' }, // Round 2
    '신': { text: '오늘 일지 신(申)의 짝은 사(巳) — 사시(09:00–10:59)에 일이 맞물려 잘 풀리니 협의와 거래를 오전에 두세요. 마주치는 결은 인시(03:00–04:59) — 인(寅)과 충하니 동트기 전의 결심은 몸이 깬 뒤에 점검하시지요.', review_status: 'draft' }, // Round 2
    '유': { text: '오늘 일지 유(酉)의 짝은 진(辰) — 진시(07:00–08:59)에 차분히 다듬는 기운이 들어오니 아침 정리와 준비가 잘 됩니다. 마주치는 결은 묘시(05:00–06:59) — 묘(卯)와 충하니 이른 아침의 서두름은 한 호흡 늦추세요.', review_status: 'draft' }, // Round 2
    '술': { text: '오늘 일지 술(戌)의 짝은 묘(卯) — 묘시(05:00–06:59)에 부드러운 기운이 문을 여니 아침 인사와 약속 확인이 잘 풀립니다. 마주치는 결은 진시(07:00–08:59) — 진(辰)과 충하니 출근길의 결정은 여유를 두고 하시지요.', review_status: 'draft' }, // Round 2
    '해': { text: '오늘 일지 해(亥)의 짝은 인(寅) — 인시(03:00–04:59)에 씨앗 심는 기운이 오르니 새로 시작할 일의 첫 줄을 그 시간에 적어 보세요. 마주치는 결은 사시(09:00–10:59) — 사(巳)와 충하니 오전의 안건은 점심 무렵 다시 훑으시지요.', review_status: 'approved' }, // Round 1
  }),
});

// ── 서생의 한 마디 (반말 캐릭터 톤 — 음이니/니라. Layer B 서생 문체) ────────
// Flow-key priority mirrors the packaging flow badge: 충+합(엇갈림) > 충(거침) >
// 합(이어짐) > 형·해·원진(잔금) > 십신 다섯 무리 > 없음(천천히).
export const DAILY_CLOSING_SLOT = Object.freeze({
  section_id: 'closing', label: '서생의 한 마디', character: '서생',
  variant_key: 'flow_key',
  evidence: ['daily.dayPillar', 'daily.branchRelationsToNatal', 'daily.tenGodToDayMaster'],
  variants: Object.freeze({
    'rough': { text: '{day_master}일간이 오늘 {day_pillar_text} 일진의 길에서 부딪히는 기운을 만났음이니. 바람 부는 날에는 돛을 반만 걸고 노를 저어 가는 것이 도리니라.', review_status: 'approved' }, // Round 1
    'smooth': { text: '{day_master}일간이 오늘 {day_pillar_text} 일진과 손을 잡았음이니. 묵혀 둔 씨앗 하나를 오늘 밭에 심어 보니라.', review_status: 'approved' }, // Round 1
    'mixed': { text: '{day_master}일간이 오늘 {day_pillar_text} 일진에서 엇갈리는 기운을 지나감이니. 붙들 것과 놓을 것을 이름을 적어 가르는 것이 오늘의 공부니라.', review_status: 'approved' }, // Round 1
    'friction': { text: '{day_master}일간이 오늘 {day_pillar_text} 일진에서 잔금 가는 기운을 만났음이니. 큰 붓질보다 매무새를 다시는 날로 삼으니라.', review_status: 'approved' }, // Round 1
    'group:resource': { text: '{day_master}일간에게 오늘 드러난 {day_pillar_text} 일진이 배움의 물을 대어 줌이니. 받은 것을 붓끝으로 옮겨 적어 두니라.', review_status: 'approved' }, // Round 1
    'group:expression': { text: '{day_master}일간에게 오늘 드러난 {day_pillar_text} 일진이 붓끝을 가볍게 함이니. 만들고 싶던 것을 말보다 먼저 손대어 보니라.', review_status: 'approved' }, // Round 1
    'group:wealth': { text: '{day_master}일간에게 오늘 드러난 {day_pillar_text} 일진이 다스릴 일을 늘려 줌이니. 장부를 가늠하고 씀씀이를 미리 적어 두니라.', review_status: 'approved' }, // Round 1
    'group:power': { text: '{day_master}일간에게 오늘 드러난 {day_pillar_text} 일진이 책임의 짐을 얹힘이니. 이름 걸은 일부터 수습해 나아가니라.', review_status: 'approved' }, // Round 1
    'group:self': { text: '{day_master}일간에게 오늘 드러난 {day_pillar_text} 일진이 제 목소리를 키워 줌이니. 뜻은 크게 세우되 말은 아껴 두니라.', review_status: 'approved' }, // Round 1
    'unknown': { text: '{day_master}일간이 오늘 {day_pillar_text} 일진의 자리를 천천히 읽어 가니라. 억지로 뜻을 붙이지 않는 것이 이 서생의 버릇이니라.', review_status: 'draft' }, // Round 2
  }),
});
