-- Reading Pattern DB · 004_seed_mu_gi_hae.sql
-- 시드 데이터: 무토 × 기해년 패턴 1개 (프로토타입 기준점)
-- 출처: 혜민 작성 '전윤경 戊土 2019년 신수' 기반 자연어 paraphrasing
-- 검증일: 2026-08-05

-- ============================================================
-- 1. 패턴 키 등록
-- ============================================================
insert into content.pattern_keys (pattern_id, day_master, year_stem, year_branch, ten_god_stem, branch_relation, label)
values ('무_기_해', '무', '기', '해', '겁재', 'none', '무토 출생 × 기해년 — 같은 흘 겹침 + 물의 이동')
on conflict (pattern_id) do nothing;

-- ============================================================
-- 2. Layer 1: 카드 모듈 (8장)
-- ============================================================

insert into content.card_modules (module_id, pattern_id, card_type, card_index, title, summary, keywords, bullets, action, watch, evidence, tone, char_count, review_status, reviewer) values

('무_기_해_cover', '무_기_해', 'cover', 1,
 '2019년 기해년, 무토 출생의 연운',
 '산처럼 크고 묵직한 무토의 기운 위에, 같은 흙인 기토가 겹치면서 답답함과 경쟁이 피어납니다. 그러나 해수(물)가 흘러들며 이동과 변화의 물결을 가져오니, 전체적으로는 긍정적인 변화가 많은 해입니다.',
 '["경쟁·기싸움", "이동·변화", "새로운 인연"]'::jsonb,
 '["기토는 무토와 같은 흙이지만 성질이 달라, 겹치면 답답함과 경쟁을 만듭니다","해수는 이동, 변화, 새로움을 의미합니다. 애정운에서도 새 인연의 가능성이 있습니다","무토 출생에게 2019년은 \"새로움에 도전\"하는 마음이 열쇠입니다"]'::jsonb,
 '애정운, 인간관계, 직업운, 가치관이 새롭게 재편되는 해입니다. 열린 마음으로 도전하세요. 내 생각이 진리만은 아님을 기억하는 것이 올해의 나침반입니다.',
 '같은 흙끼리의 기싸움, 주변과의 경쟁이 답답함을 만들 수 있습니다. 어떤 상황에서도 바르게 진행해야 긍정적인 변화를 얻습니다.',
 '["annual.year.pillar","annual.stem.tenGodToDayMaster","annual.boundary.ipchun"]'::jsonb,
 'natural', 0, 'approved', ' prototype') on conflict do nothing,

('무_기_해_overall', '무_기_해', 'overall', 2,
 '마음가짐과 전체 흐름',
 '무토의 고집과 기토의 경쟁이 부딪히는 해. "새로움에 도전"과 "바른 마음"이 올해의 두 기둥입니다.',
 '["새로움", "열린 마음", "도덕성"]'::jsonb,
 '["첫째, ''새로움에 도전'' — 애정, 인간관계, 직업, 가치관이 새롭게 바뀝니다","둘째, ''열린 마음'' — 내 생각이 늘 옳은 것은 아님을 인정해야 합니다","셋째, ''바른 길'' — 어떤 문제, 어떤 인연이든 바르게 진행해야 즐거운 변화를 만듭니다"]'::jsonb,
 '지금은 묵은해의 끝자락에서 생기는 의욕과 열정을 입춘 이후 안정과 기회로 연결할 때입니다. 조급해하지 말고 여유를 갖고 앞을 계획하세요.',
 '무토 출생은 본인만의 세계가 강한 편. 사랑도, 가족관계도, 인간관계에서도 항상 상대의 입장을 먼저 생각하는 자세가 필요합니다. 너무 많은 생각과 걱정이 발을 잡습니다.',
 '["annual.stem.tenGodToDayMaster","annual.branch.relationsToNatal"]'::jsonb,
 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_work', '무_기_해', 'work', 3,
 '일과 사회활동',
 '하는 일이 한 단계 성장하고 주변에서 인정받는 흐름. 합격, 승진, 관운도 함께하는 시기입니다.',
 '["성장", "인정", "합격·승진"]'::jsonb,
 '["현재 하시는 일이 있다면 한 단계 성장하며 인정받는 흐름입니다","교육, 의료, 식품 관련 일에 도전하기에 좋은 시기입니다","다만 구설수를 조심해야 — 작은 규정이라도 반드시 지키세요"]'::jsonb,
 '직업적으로 발전하기 위해 공부하고, 새로운 사람들을 만나세요. 올해는 합격운과 문서·계약운이 긍정적인 시기입니다.',
 '경쟁과 기싸움이 있는 해이므로, 직장 안에서의 대립에서는 ''한 발 물러서는 것이 이기는 것''이라는 지혜가 필요합니다.',
 '["annual.stem.tenGodToDayMaster","annual.branch.relationsToNatal"]'::jsonb,
 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_money', '무_기_해', 'money', 4,
 '돈과 현금 흐름',
 '들어오는 돈과 나가는 돈이 비슷할 수 있는 해. 계획해서 쓰는 것이 무엇보다 중요합니다.',
 '["하반기 성장", "계획 소비", "돈거래 금지"]'::jsonb,
 '["여름이 끝날 무렵부터 하반기에 재물 기운이 자라납니다","불필요한 소비는 줄이고, 일정 금액을 저축하는 것이 유리합니다","주변 사람과의 큰 돈거래는 절대 피하세요 — 올해는 들고 나는 돈이 비슷할 수 있습니다"]'::jsonb,
 '계획적인 소비가 가장 필요한 해입니다. 무엇을 사든 몇 번 다시 생각한 뒤에 고르세요. 유명 브랜드에 집착할 필요는 없습니다.',
 '올해는 전반적으로 답답함을 느끼다가, 여름 끝부터 변화와 새로움이 밀려옵니다. 충동적 소비가 유혹으로 다가올 수 있습니다.',
 '["annual.stem.tenGodToDayMaster","annual.policy"]'::jsonb,
 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_relationships', '무_기_해', 'relationships', 5,
 '인간관계와 애정운',
 '새로운 인연이 들어설 가능성이 큰 해. 이미 있는 인연이라면 마찰과 위기를 조심해야 합니다.',
 '["새 인연", "허세 경계", "검정·흰색"]'::jsonb,
 '["나보다 어린 사람들을 많이 만나게 됩니다 — 새로운 사람들이 전체적으로 이로운 해입니다","술을 많이 마시거나 노는 무리는 멀리하세요. 허세와 거짓말하는 사람을 가려내야 합니다","애정운: 전혀 다른 삶과 가치관을 가진 사람을 만날 가능성. 첫인상보다 여러 번 만나보고 결정하세요"]'::jsonb,
 '검정색과 흰색이 애정운을 높여줍니다. 한여름이나 한겨울에 애정운이 상승합니다. 친구의 연인은 멀리하고, 가족과 대화하려 노력하세요.',
 '짝사랑은 피하세요. 애매한 관계도 피하고, 게으름은 독이 됩니다. 상대의 거짓말은 반드시 가려내야 합니다.',
 '["annual.branch.relationsToNatal","annual.monthCommand.context"]'::jsonb,
 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_growth', '무_기_해', 'growth', 6,
 '건강과 일상 리듬',
 '큰 사고나 질병은 없으되, 너무 많은 걱정과 근심이 마음과 몸을 지치게 합니다.',
 '["규칙적 운동", "산책·스트레칭", "즐기듯 살기"]'::jsonb,
 '["큰 사건사고는 없을 것으로 보이나, 규칙적인 운동과 충분한 휴식이 필요합니다","무토 사주에는 산책, 스트레칭, 몸매 관리로 스트레스를 풀고 만족감을 높이는 것이 좋습니다","무언가를 사랑하는 것도 올해 마음과 몸을 건강하게 만드는 방법입니다"]'::jsonb,
 '운동 한 가지는 꼭 시작하세요. 즐기듯 삶에 도전하는 마음이 필요한 해입니다. 너무 많은 생각과 걱정을 내려놓으세요.',
 '야식이나 계획에 없는 소비도 피하세요. 규칙적이고 차분한 일상이 필요한 흐름입니다.',
 '["annual.stem.tenGodToDayMaster","annual.monthCommand.context"]'::jsonb,
 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_action', '무_기_해', 'action', 7,
 '올해 꼭 해야 할 일',
 '세 가지가 2019년을 알차게 만듭니다.',
 '["공부", "새 사람", "운동"]'::jsonb,
 '["직업적으로 발전하기 위해 공부하세요","새로운 사람들을 만나려고 노력하세요","운동 한 가지는 꼭 해보세요"]'::jsonb,
 '이렇게 하시면 2019년은 훨씬 알차고 보람 있게 보낼 수 있습니다. 긍정적인 변화가 많고 감성적인 시기이니, 조금만 객관적으로 바라보며 도전하세요.',
 '피할 것: 애매한 관계, 게으름, 야식, 충동적 소비. 가까운 것: 새로운 사람들, 검정·흰색, 숫자 3과 0, 서쪽, 왼쪽.',
 '["annual.stem.tenGodToDayMaster","annual.branch.relationsToNatal","annual.policy"]'::jsonb,
 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_method', '무_기_해', 'method', 8,
 '계산 방법과 한계',
 '기해년의 두 글자를 하나씩 풀어 설명합니다.',
 '["기토 분석", "해수 분석", "근거"]'::jsonb,
 '["기(己): 무토 출생과 같은 흙이지만 다른 성질 — 경쟁·기싸움·구설수 조심, 새 직업·학업에 유리, 가족과 대화 필요","해(亥): 합격운·계약운 긍정, 이동·변화 많음, 게으름은 독, 계획적 소비 필요, 새로운 사랑 가능성","해석 기준: 자평명리의 일간·월령·십신 관계. 격국·용신·조후는 이 버전에서 다루지 않습니다"]'::jsonb,
 '각 항목의 근거를 확인하며 읽어보세요.',
 '사주는 관계, 건강, 재산, 중요한 선택의 결과를 확정하는 도구가 아닙니다. 계산된 사실과 실제 삶을 돌아볼 질문을 이어주는 참고 자료로 활용하세요.',
 '["annual.policy","annual.boundary.ipchun"]'::jsonb,
 'natural', 0, 'approved', 'prototype') on conflict do nothing;

-- ============================================================
-- 3. Layer 2: 정밀 리딩 항목 (13개)
-- ============================================================

insert into content.domain_modules (module_id, pattern_id, domain_key, domain_label, domain_index, points, closing, tone, char_count, review_status, reviewer) values

('무_기_해_mindset', '무_기_해', 'mindset', '마음가짐', 1,
 '["새로움에 도전 — 애정운, 인간관계, 직업운, 가치관, 성격이 새롭게 바뀝니다","열린 마음 — 인간관계, 애정운, 사회활동 모두 열린 마음으로 도전하세요. 내 생각이 늘 옳은 것은 아닙니다","바른 길 — 어떤 상황, 어떤 문제, 어떤 인연이든 바르게 진행해야 즐거운 변화를 스스로 만듭니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_relationships', '무_기_해', 'relationships', '인간관계', 2,
 '["나보다 어린 사람들을 많이 만나는 흐름입니다","술을 많이 마시거나 노는 무리는 멀리하세요","첫인상보다 만나면서 확신이 드는, 나와 잘 맞는 인연에 집중하세요","겉모습만으로 사람을 평가하지 마세요","허세, 허풍, 거짓말하는 사람을 가려내야 합니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_health', '무_기_해', 'health', '건강', 3,
 '["큰 사고나 질병은 없을 것으로 보입니다","규칙적인 운동, 규칙적인 생활, 충분한 휴식이 필요합니다","너무 많이 걱정하고 근심할 수 있으니 항상 즐겁고 밝게 생각하세요","나만의 스트레스 해소법을 찾으세요 — 산책, 스트레칭, 몸매 관리로 만족감이 올라갑니다","무언가를 사랑하는 것도 올해 마음과 몸을 건강하게 만드는 방법입니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_career', '무_기_해', 'career', '학업 · 직업 · 사회활동', 4,
 '["현재 하시는 일이 있다면 한 단계 성장하며 주변에서 인정받는 흐름입니다","교육, 의료, 식품 관련 일에 도전하기에 좋은 시기입니다","합격운, 승진운, 관운도 함께하는 시기입니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_family', '무_기_해', 'family', '가족', 5,
 '["가족과 대화하려 노력해야 하는 해입니다","작은 일이라도 가족과 함께 상의하고, 소통하려 애쓰세요","가족과의 화합이 형성되어야 개인의 학업, 직업, 애정운도 함께 오릅니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_romance', '무_기_해', 'romance', '애정운', 6,
 '["커플이든 싱글이든 새로운 인연이 들어설 가능성이 큽니다","이미 있는 인연이라면 마찰, 갈등, 위기를 지날 수 있습니다","나와 전혀 다른 삶과 가치관을 가진 사람을 만날 것으로 보입니다","첫인상도 중요하지만 여러 번 만나보고 결정하세요","상대방의 거짓말은 반드시 가려내야 합니다","친구의 연인은 멀리하고, 검정색과 흰색이 애정운을 높여줍니다","한여름이나 한겨울에 애정운이 상승합니다","우연한 만남에서 인연이 닿을 가능성도 높은 해입니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_wealth', '무_기_해', 'wealth', '재물', 7,
 '["여름이 끝날 무렵부터 하반기에 재물 기운이 자라납니다","불필요한 소비는 줄이고 계획적으로 쓰세요","일정 금액을 저축하는 것도 유리합니다","주변 사람과의 큰 돈거래는 절대 피하세요","올해는 들어오는 돈과 나가는 돈이 비슷할 수 있습니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_fashion', '무_기_해', 'fashion', '패션', 8,
 '["나이보다 조금 젊고 편하게 입는 것이 좋습니다","가짜 명품은 망신을 부르니 피하세요","유행에 어느 정도 민감한 것이 유리합니다","액세서리와 귀금속은 최소화하고, 머리를 밝은 색으로 염색해도 좋습니다","옷은 검정과 흰색이 유리하고, 머리색은 약간 밝은 색이 좋습니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_season', '무_기_해', 'season', '날씨와 계절', 9,
 '["봄: 인간관계에서 변화와 갈등이 있을 수 있습니다","여름: 애정운과 직업운이 상승합니다","가을: 새로운 직업, 학업, 취미, 운동에 도전하기 좋습니다","겨울: 애정운이나 문서·계약운이 자라는 시기입니다","미세먼지가 많거나 흐린 날에는 외출, 쇼핑, 여행을 피하고, 맑은 날이나 비 오는 날이 유리합니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_purchases', '무_기_해', 'purchases', '물품 구입', 10,
 '["불필요한 물건을 많이 살 가능성이 큽니다 — 계획이 필수입니다","무엇이든 몇 번 다시 생각한 뒤에 고르세요","신중하게 고르면 중고물품도 잘 맞는 흐름입니다","브랜드 이미지에 집착할 필요는 없습니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_avoid', '무_기_해', 'avoid', '피해야 할 기운', 11,
 '["애정운에서 애매한 관계는 피하세요","게으름은 독 — 게으른 습관은 스스로 피하고 버려야 합니다","야식이나 계획에 없는 소비도 피하세요"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_favorable', '무_기_해', 'favorable', '이로운 기운', 12,
 '["새로운 사람들이 전체적으로 이로운 해입니다","검정색, 흰색, 숫자 3과 0, 서쪽, 왼쪽이 유리합니다"]'::jsonb,
 null, 'natural', 0, 'approved', 'prototype') on conflict do nothing,

('무_기_해_must_do', '무_기_해', 'must_do', '꼭 해야 할 일', 13,
 '["직업적으로 발전하기 위해 공부하세요","새로운 사람들을 만나려 노력하세요","운동 한 가지는 꼭 하세요"]'::jsonb,
 '이렇게 하시면 2019년은 훨씬 알차고 보람 있게 보내실 수 있습니다.',
 'natural', 0, 'approved', 'prototype') on conflict do nothing;

-- ============================================================
-- 4. 월별 슬롯 (24개)
-- ============================================================

insert into content.monthly_slots (slot_id, pattern_id, lunar_month, month_pillar, half, guidance, tone, char_count, review_status) values

('무_기_해_m1f', '무_기_해', 1, '병인월', 'first',  '시비와 다툼에서는 ''지는 것이 이기는 것''이라고 생각하세요. 허황된 꿈과 계획은 현실성을 약하게 만듭니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m1s', '무_기_해', 1, '병인월', 'second', '말 한마디로 큰 빚을 갚을 수 있습니다. 영화 감상, 독서 등으로 삶을 밝게 바꿔 보세요.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m2f', '무_기_해', 2, '정묘월', 'first',  '눈에 보이는 것만 믿어야 할 때입니다. 자기를 위해 투자해도 좋습니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m2s', '무_기_해', 2, '정묘월', 'second', '약속은 반드시 지키세요. 다만 아무리 노력해도 되지 않는 인연이나 일은 포기하세요.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m3f', '무_기_해', 3, '무진월', 'first',  '관운과 문서운이 강합니다. 인간관계에서는 상대를 먼저 생각하면 유리합니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m3s', '무_기_해', 3, '무진월', 'second', '서두르면 실수하기 쉬우니 신중해야 합니다. 믿었던 사람에게 당할 수 있으니 가까운 이를 의심하세요.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m4f', '무_기_해', 4, '기사월', 'first',  '상대의 눈을 똑바로 보면 마음을 읽을 수 있습니다. 가까운 사람을 의심해야 할 때입니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m4s', '무_기_해', 4, '기사월', 'second', '계획은 미루지 말고 실천하세요. 주변의 의견을 무시하지 마세요.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m5f', '무_기_해', 5, '경오월', 'first',  '무리한 소비와 경솔한 말행동을 피하세요. 빨리 포기하는 것도 필요합니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m5s', '무_기_해', 5, '경오월', 'second', '짜증을 내거나 화를 내지 마세요. 말 한마디가 큰 것을 해결합니다.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m6f', '무_기_해', 6, '신미월', 'first',  '말은 은이고 침묵은 금입니다. 즐기듯 도전하는 마음이 필요합니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m6s', '무_기_해', 6, '신미월', 'second', '낯선 장소, 낯선 사람은 멀리하세요. 모르는 것이 약이 될 때도 있습니다.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m7f', '무_기_해', 7, '임신월', 'first',  '계획대로 진행하고 소비하세요. 감정보다는 객관적인 시각이 필요합니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m7s', '무_기_해', 7, '임신월', 'second', '현재보다는 미래를 위해 결정하세요. 오해는 즉시 푸세요.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m8f', '무_기_해', 8, '계유월', 'first',  '확실하게 결정해야 합니다. 시작보다 끝맺음이 중요합니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m8s', '무_기_해', 8, '계유월', 'second', '가족과 함께 여행, 쇼핑, 외식이 좋습니다. 좋은 일에만 신경 쓰세요.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m9f', '무_기_해', 9, '갑술월', 'first',  '할 일은 미루지 마세요. 인간관계에서 배신이나 상처를 입을 수 있습니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m9s', '무_기_해', 9, '갑술월', 'second', '작은 실수와 오해는 웃어넘기세요. 잘못은 바로 인정하면 쉽게 풀립니다.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m10f', '무_기_해', 10, '을해월', 'first',  '결정한 일을 번복하지 마세요. 시작이 반이라는 말이 딱 맞는 때입니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m10s', '무_기_해', 10, '을해월', 'second', '과감하게 결정하면 유리합니다. 상황에 따라 작은 거짓말도 필요합니다.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m11f', '무_기_해', 11, '병자월', 'first',  '상대의 거짓말을 가려내야 합니다. 자기를 위한 투자는 좋습니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m11s', '무_기_해', 11, '병자월', 'second', '약속은 반드시 지키세요. 충분한 휴식이나 명상이 필요한 때입니다.', 'natural', 0, 'approved') on conflict do nothing,

('무_기_해_m12f', '무_기_해', 12, '정축월', 'first',  '새로운 물건을 사기에 좋습니다. 너무 높은 목표는 허탈감을 만듭니다.', 'natural', 0, 'approved') on conflict do nothing,
('무_기_해_m12s', '무_기_해', 12, '정축월', 'second', '포기하지 말고 꾸준히 하면 결과는 좋습니다. 우정보다 가족과 사랑에 집중하세요.', 'natural', 0, 'approved') on conflict do nothing;

-- char_count 자동 갱신
update content.card_modules set char_count = length(title) + length(summary) + length(action) + length(watch) where pattern_id = '무_기_해';
update content.domain_modules set char_count = coalesce(length(closing), 0) + length(points::text) where pattern_id = '무_기_해';
update content.monthly_slots set char_count = length(guidance) where pattern_id = '무_기_해';
