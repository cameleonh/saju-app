// server/storage/seeds/month-byeong-jeong.mjs
// 시드 데이터: 병화(丙)·정화(丁) 일간 × 12월지 = 24개 월지 패턴
// 톤: 혜민 샘플 기반 — 2인칭 처방적, 한자 최소화(첫 등장 시만 괄호 보조), 명리 용어 일상어 의역
// 생성일: 2026-08-06
//
// 일간 이미지:
//   병화(丙) — 태양, 양화. 밝게 비추고 따뜻하게 만드는 힘, 열정, 포용력. 너무 뜨거움 주의
//   정화(丁) — 촛불·등불, 음화. 섬세하게 밝히고 다듬는 힘, 집중력, 관찰. 예민함 주의
//
// 월지 계절: 봄(인·묘·진) / 여름(사·오·미) / 가을(신·유·술) / 겨울(해·자·축)
//
// 패턴 목록:
//   병화(丙) — 태양
//     1. 병_인  (봄,  生)   2. 병_묘 (봄,  生)   3. 병_진 (봄,  生)
//     4. 병_사  (여름, 비견) 5. 병_오 (여름, 비견) 6. 병_미 (여름, 식상)
//     7. 병_신  (가을, 극)   8. 병_유 (가을, 극)   9. 병_술 (가을, 식상)
//    10. 병_해  (겨울, 극)  11. 병_자 (겨울, 극)  12. 병_축 (겨울, 식상)
//   정화(丁) — 촛불
//    13. 정_인  (봄,  生)  14. 정_묘 (봄,  생)  15. 정_진 (봄,  생)
//    16. 정_사  (여름, 겁재) 17. 정_오 (여름, 비견) 18. 정_미 (여름, 식상)
//    19. 정_신  (가을, 극)  20. 정_유 (가을, 극)  21. 정_술 (가을, 식상)
//    22. 정_해  (겨울, 극)  23. 정_자 (겨울, 극)  24. 정_축 (겨울, 식상)

export const MONTH_BYEONG_JEONG = Object.freeze({
  patterns: [
    // ================================================================
    // 1. 병_인 — 봄, 나무가 태양을 길러 밝게 타오름 (생)
    //    태양이 이른 봄에 떠오른 — 생명을 깨우는 시작의 빛
    // ================================================================
    {
      month_pattern_id: '병_인', day_master: '병', month_branch: '인',
      season: '봄',
      element_interaction: '나무가 불을 길러 밝게 타오름 (생)',
      label: '태양이 이른 봄에 떠오른 — 생명을 깨우는 시작의 빛',
      modules: [
        { module_id: '병_인_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '이른 봄의 아침 해처럼 에너지가 싱싱하게 솟습니다 — 무엇이든 시작할 기운이 가득한 성품입니다',
            '호기심이 왕성하고 새로운 것에 눈을 뜨는 데 그늘이 없습니다 — 배우고 싶은 마음이 늘 앞섭니다',
            '다만 시작의 열정이 앞서면 깊이가 부족해지기 쉬우니, 하나를 끝까지 파고드는 인내가 필요합니다',
            '많이보다 깊이를 선택하는 습관이 이른 봄의 빛을 여름까지 이어줍니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_인_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '병화는 심장·소장, 눈·혈액순환과 연결됩니다 — 열이 위로 오르기 쉬우니 머리와 눈을 식히세요',
            '에너지가 넘쳐 무리하기 쉬운 성품입니다 — 수분 보충과 규칙적 수면이 기본입니다',
            '인목(나무)의 기운이 목·어깨 결림을 동반할 수 있으니, 스트레칭과 가벼운 산책을 생활화하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_인_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '학업, 자격증, 새 프로젝트, 창업 등 처음을 시작하는 데 가장 밝은 성품입니다',
            '나무가 불을 길러주는 기운이 있어 스승·멘토의 인연이 큰 도움이 됩니다 — 배우려는 자세가 성과를 키웁니다',
            '아이디어가 끓어오르니 메모와 정리 습관이 반짝이는 생각을 자산으로 바꿉니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_인_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '밝고 따뜻한 매력이 돋보여 먼저 다가가도 호감을 받기 쉽습니다',
            '모임·강의·여행처럼 자연스러운 자리에서 인연이 닿을 가능성이 높습니다',
            '열정이 너무 앞서면 상대가 부담을 느끼니, 한 발 기다려 주는 여유가 인연을 지킵니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_인_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '당장의 수익보다 실력과 배움에 투자할수록 길러주는 기운이 큽니다',
            '쌓아올린 실력이 나중에 큰 수익으로 돌아오는 구조이니, 조급한 투자는 피하세요',
            '배움과 경험 자체가 재물이 되니, 돈을 쫓기보다 실력을 쫓으세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_인_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '밝고 따뜻한 인상으로 사람이 자연스럽게 모입니다 — 인맥이 넓어지는 성품입니다',
            '윗사람과 스승의 인연이 열려 있으니, 겸손하게 배우려 다가가면 큰 도움을 받습니다',
            '너무 앞장서다 보면 주변이 안 보일 수 있으니, 한 발 물러서서 듣는 시간이 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_인_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '배움의 황금기 — 무엇이든 빨리 흡수하는 시기입니다',
            '철학·언어·기술·예술 등 폭넓은 분야에 마음이 끌리니 호기심을 따라가 보세요',
            '다만 넓게만 배우면 얕아지니, 하나는 반드시 깊이 파고드세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_인_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '하나의 분야를 깊이 배워 자기 것으로 만드세요 — 길러주는 기운이 배움을 배로 키워줍니다',
            '스승이나 멘토를 가까이 하세요 — 혼자 배우는 것의 열 배가 됩니다',
            '아침 햇빛을 받으며 하루를 일찍 시작하세요 — 자연의 리듬과 기운이 맞물립니다',
          ],
          closing: '이렇게 하시면 타고난 밝은 시작의 기운을 평생 단단한 뿌리로 삼을 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 2. 병_묘 — 봄, 나무가 태양을 길러 한창 타오름 (생)
    //    태양이 꽃 핀 봄날에 비춘 — 만개한 매력과 표현의 빛
    // ================================================================
    {
      month_pattern_id: '병_묘', day_master: '병', month_branch: '묘',
      season: '봄',
      element_interaction: '나무가 불을 길러 밝게 타오름 (생)',
      label: '태양이 꽃 핀 봄날에 비춘 — 만개한 매력과 표현의 빛',
      modules: [
        { module_id: '병_묘_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '봄이 한창인 시기 — 만물이 만개하듯 마음도 활짝 열리고 표현하고 싶은 에너지가 넘칩니다',
            '인정받고 싶은 마음이 강해지니, 무대와 사람 앞에 서는 일이 즐겁습니다',
            '다만 보여주고 싶음이 지나치면 허세가 될 수 있으니, 실력과 겸손의 균형이 필요합니다',
            '꽃이 필 때 비료를 주어야 하듯, 인기 있는 동안 뿌리를 깊이 내려야 합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_묘_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '에너지가 한창 왕성하지만, 그만큼 소모도 큽니다 — 열이 오르고 피부·눈이 건조해지기 쉽습니다',
            '묘목(꽃나무)의 기운이 호흡기와 피부에 영향을 주니, 봄꽃 알레르기와 건조증을 조심하세요',
            '밖으로 활동량이 늘어 부상 위험이 있으니, 무리한 운동은 피하고 준비운동으로 풀어주세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_묘_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '표현, 발표, 기획, 마케팅, 예술, 디자인 등 눈에 띄는 일에 가장 유리한 성품입니다',
            '인정과 주목을 받기 쉬우니, 무대 앞에 설 기회가 있다면 주저하지 마세요',
            '다만 인기에 취하면 실력이 뒷전이 될 수 있으니, 주목받는 만큼 더 단단해져야 합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_묘_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '매력이 만개하는 시기 — 주변에 이성이 자연스럽게 모입니다',
            '로맨틱한 분위기에 휩쓸리기 쉬우니, 첫인상보다 사람 됨을 깊이 보는 눈이 필요합니다',
            '한 사람에게 집중하지 않으면 인연이 흩어질 수 있으니, 마음을 정하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_묘_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '이름과 인지도가 재물이 되는 시기 — 나를 아는 사람이 늘어 수익으로 이어집니다',
            '인기와 인맥을 돈으로 바꾸는 구조이니, 너무 일찍 돈을 쫓으면 인맥이 상합니다',
            '과시용 지출이 늘기 쉬우니, 보이기 위한 소비를 경계하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_묘_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '인기가 상승하는 시기 — 사람들이 자연스럽게 다가옵니다',
            '다만 인기에 취하면 교만해지기 쉬우니, 나를 일깨워주는 사람을 가까이 하세요',
            '칭찬만 하는 사람보다 바른 말을 해주는 사람이 진짜 인연입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_묘_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '표현력과 미적 감각이 가장 빛나는 시기 — 예술, 언어, 발표 훈련에 투자하세요',
            '만개한 만큼 시들 때의 대비도 필요합니다 — 인기 있는 동안 실력의 뿌리를 깊이 내리세요',
            '보여주기가 아닌 진짜 나를 다듬는 학습이 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_묘_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '주목받는 동안 실력의 뿌리를 깊이 내리세요 — 꽃이 필 때 비료를 주어야 합니다',
            '칭찬만 하는 사람에서 한 발 물러서고, 바른 말을 해주는 사람을 가까이 하세요',
            '인기와 인맥을 돈보다 먼저 챙기세요 — 사람이 진짜 자산입니다',
          ],
          closing: '이렇게 하시면 타고난 눈부신 매력을 허상이 아닌 단단한 실력으로 지켜낼 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 3. 병_진 — 봄→여름, 불이 흙을 따뜻하게 달굼 (생)
    //    태양이 늦봄의 흙을 데우는 — 생각을 결과물로 빚어내는 시기
    // ================================================================
    {
      month_pattern_id: '병_진', day_master: '병', month_branch: '진',
      season: '봄',
      element_interaction: '불이 흙을 따뜻하게 달굼 (생)',
      label: '태양이 늦봄의 흙을 데우는 — 생각을 결과물로 빚어내는 시기',
      modules: [
        { module_id: '병_진_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '생각과 아이디어가 구체적인 결과물로 빚어지는 시기 — 머릿속에만 있던 것을 세상에 내놓을 때입니다',
            '진토(늦봄의 습한 흙)는 그릇의 기운 — 무엇이든 담아 모양을 잡아주는 토대가 있습니다',
            '배우기만 하면 공허해지니, 배운 것을 반드시 결과물로 만드는 습관이 필요합니다',
            '정리하고 표현하는 과정 자체가 성장입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_진_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '늦봄의 습한 기운이 위장과 피로를 동반할 수 있습니다 — 소화를 돕는 가벼운 식사가 좋습니다',
            '머리를 많이 쓰면 열이 위로 몰리니, 하체 운동(걷기, 등산)으로 기운을 내려주세요',
            '생각이 많아져 잠을 설치기 쉬우니, 밤에는 생각을 끄고 몸을 쉬게 하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_진_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '기획, 연구, 출판, 교육, 콘텐츠 제작 등 생각을 결과물로 만드는 일에 가장 유리합니다',
            '진토의 저장 기운이 있어, 배우고 쌓아둔 것이 실무에서 큰 자산이 됩니다',
            '결과물을 꾸준히 내는 사람으로 인정받습니다 — 양보다 질로 승부하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_진_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '성실하고 신뢰가 가는 매력이 돋보입니다 — 화려함보다 깊이를 보는 인연이 다가옵니다',
            '말과 행동을 다듬어 대하면 상대에게 신뢰를 줍니다',
            '생각이 많아 행동이 늦어질 수 있으니, 마음이 가면 용기를 내어 표현하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_진_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '지적 재산 — 특허, 저작권, 강의, 출판, 콘텐츠에서 재물이 나오는 성품입니다',
            '진토의 창고 기운이 있어 저축과 장기 투자에 유리합니다',
            '돈을 직접 쫓기보다 결과물을 쌓으면 돈이 따라오는 구조입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_진_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '진중하고 신뢰감 있는 태도로 깊은 관계를 맺는 성품입니다',
            '얕은 인맥보다 소수와 깊이 교류할수록 유리합니다',
            '생각을 속에 담아두면 오해가 생기니, 적절히 표현하는 연습이 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_진_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '배운 것을 정리하고 체계화하는 데 탁월한 시기입니다',
            '글쓰기, 강의, 기록의 습관이 내면의 지혜를 견고하게 만듭니다',
            '진토의 그릇에 담듯, 흩어진 지식을 하나로 모아보세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_진_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '배운 것을 반드시 하나의 결과물로 만드세요 — 글, 강의, 작품 무엇이든 좋습니다',
            '생각을 속에 담아두지 말고 적절히 표현하세요 — 오해를 줄이는 열쇠입니다',
            '흩어진 지식을 체계적으로 정리하는 습관을 들이세요',
          ],
          closing: '이렇게 하시면 머릿속의 빛나는 생각들이 세상에 닿는 결과물이 됩니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 4. 병_사 — 여름, 같은 불이 겹쳐 과열됨 (비견)
    //    태양이 한여름 초입에 타오른 — 열정이 넘치되 과열을 경계
    // ================================================================
    {
      month_pattern_id: '병_사', day_master: '병', month_branch: '사',
      season: '여름',
      element_interaction: '같은 불이 겹쳐 과열됨 (비견/겁재)',
      label: '태양이 한여름 초입에 타오른 — 열정이 넘치되 과열을 경계',
      modules: [
        { module_id: '병_사_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '열정이 불타오르기 시작하는 시기 — 하고 싶은 것이 많고 에너지가 넘칩니다',
            '같은 불끼리 겹치면 자신감은 커지지만, 조급함과 다툼의 불씨도 함께 커집니다',
            '열정을 쏟되 한 발 식힐 줄 아는 절제가 이 시기의 가장 중요한 과제입니다',
            '뜨거운 만큼 화를 내기 쉬우니, 마음의 온도를 의식적으로 낮추세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_사_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '여름의 열기가 심장과 혈압에 부담을 줍니다 — 혈압 관리와 수분 보충이 필수입니다',
            '불기운이 겹쳐 눈이 충혈되고 입이 마르기 쉽습니다 — 차가운 음식으로 열을 식히세요',
            '에너지가 넘쳐 무리하다 갑자기 쓰러질 수 있으니, 쉬는 시간을 의식적으로 만드세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_사_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '추진력과 실행력이 최고조 — 망설이지 않고 밀어붙이는 힘이 강합니다',
            '같은 분야의 동료·경쟁자가 눈에 보이기 시작합니다 — 선의의 경쟁은 동기가 되지만, 싸우면 손해입니다',
            '열정이 앞서 무리한 일을 벌이기 쉬우니, 한 번 더 식히고 검토하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_사_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '뜨거운 매력과 적극성으로 인연이 빨리 다가옵니다',
            '다만 감정 기복이 크고 화가 나면 관계가 상할 수 있으니, 한 박자 쉬는 습관이 필요합니다',
            '불꽃 같은 로맨스에 휩쓸리지 말고, 상대의 본질을 냉정하게 보세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_사_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '돈이 빠르게 들오고 빠르게 나갑니다 — 버는 만큼 새는 구조이니 예산 관리가 필수입니다',
            '충동적 투자와 과소비가 가장 큰 위험입니다 — 결정 전 하루를 더 기다리세요',
            '같은 기운끼리 돈거래를 하면 분쟁이 생기기 쉬우니 신중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_사_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '밝고 활달하지만, 기싸움이 생기기 쉬운 시기입니다',
            '의견 충돌时 절대 먼저 양보하세요 — 지는 것이 이기는 길입니다',
            '친한 사람일수록 말에 상처를 주기 쉬우니, 화가 나면 입을 다무세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_사_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '에너지가 넘쳐 무엇이든 빠르게 익히지만, 깊이가 부족해지기 쉽습니다',
            '체력과 열정을 골고루 쓰려면 계획이 필요합니다 — 충동적 도전을 줄이세요',
            '열을 식히는 학습(독서, 명상, 기록)이 불조절의 균형을 만듭니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_사_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '열정을 쏟되 반드시 한 발 식히는 시간을 가지세요 — 절제가 이 시기의 열쇠입니다',
            '충동적 결정을 줄이세요 — 돈, 감정, 인간관계 모두 하루 더 기다리는 습관이 필요합니다',
            '체력 관리를 최우선으로 하세요 — 뜨거운 만큼 소모도 큽니다',
          ],
          closing: '이렇게 하시면 넘치는 열정을 타오르는 불이 아닌 따뜻한 빛으로 다스릴 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 5. 병_오 — 여름, 같은 불이 겹쳐 과열됨 (비견)
    //    태양이 한여름 정오에 내리쬐는 — 가장 밝게 빛나는 절정의 시기
    // ================================================================
    {
      month_pattern_id: '병_오', day_master: '병', month_branch: '오',
      season: '여름',
      element_interaction: '같은 불이 겹쳐 과열됨 (비견/겁재)',
      label: '태양이 한여름 정오에 내리쬐는 — 가장 밝게 빛나는 절정의 시기',
      modules: [
        { module_id: '병_오_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '태양이 정오에 이른 격 — 빛과 열이 가장 강한 절정의 성품입니다',
            '리더십과 존재감이 압도적이라 자연스럽게 중심이 됩니다',
            '다만 너무 뜨거우면 주변이 타버리니, 빛은 밝히되 열은 식히는 지혜가 필요합니다',
            '강할수록 낮출 줄 알아야 합니다 — 정오의 태양은 곧 기울기 시작합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_오_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '불기운이 극에 달해 심장·혈압·눈에 가장 큰 부담이 옵니다 — 정기 검진이 필요합니다',
            '여름의 과열은 수면 부족과 만성 피로로 이어지니, 밤 11시 전 취침을 목표로 하세요',
            '찬물 샤워, 수영, 그늘 휴식으로 몸의 온도를 의식적으로 낮추세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_오_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '한 조직의 정점에 서는 기운 — 리더, 대표, 총괄 자리에 가장 잘 맞습니다',
            '존재감이 압도적이라 주변이 따르지만, 독단적이 되면 반발이 생깁니다',
            '빛을 홀로 쥐려 하지 말고 주변을 함께 비추면 더 큰 리더가 됩니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_오_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '눈부신 매력으로 주변의 시선을 한 몸에 받습니다 — 다만 기가 너무 세면 상대가 지칩니다',
            '강한 만큼 상대를 압도하지 말고, 부드러움으로 감싸주세요',
            '불꽃 같은 열정은 불타오르듯 시작되지만 식으면 차가워지니, 끓는 물처럼 지속적인 온기를 만드세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_오_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '큰 돈이 오가는 시기이지만, 들어온 만큼 빠져나가기 쉽습니다 — 관리가 생명입니다',
            '과시와 허세로 지출이 커지니, 수입의 일정 비율은 무조건 묻어두세요',
            '투자는 한 번에 크게 벌려 하지 말고,나누어 조금씩 진행하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_오_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '존재감이 강해 사람이 따르지만, 기가 세면 곁이 비어집니다',
            '강한 만큼 한 발 낮추고 물러서는 겸손이 인맥을 지킵니다',
            '말투와 표정에 온기를 더하세요 — 강한 빛은 그림자도 진합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_오_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '정점에 있을 때가 가장 위험한 시기 — 교만해지지 않도록 배움의 자세를 잃지 마세요',
            '강한 만큼 비판을 수용하는 훈련이 필요합니다 — 칭찬보다 비판이 성장의 거름입니다',
            '체력 관리가 곧 경쟁력입니다 — 과열을 식히는 휴식의 기술을 익히세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_오_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '강한 만큼 한 발 낮추세요 — 정오의 태양이 기울지 않으려면 주변을 함께 비춰야 합니다',
            '과시와 충동 지출을 경계하고, 수입의 일정 비율은 반드시 저축하세요',
            '체력과 온도 관리를 최우선으로 하세요 — 뜨거운 만큼 식힐 줄 알아야 지속됩니다',
          ],
          closing: '이렇게 하시면 절정의 빛을 타오르는 불꽃이 아닌 모두를 따뜻하게 비추는 태양으로 지켜낼 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 6. 병_미 — 여름→가을, 불이 흙을 만들며 식어가는
    //    태양이 한여름 끝에 머문 — 열기를 식히며 열매를 거두는 시기
    // ================================================================
    {
      month_pattern_id: '병_미', day_master: '병', month_branch: '미',
      season: '여름',
      element_interaction: '불이 흙을 만들며 식어가는',
      label: '태양이 한여름 끝에 머문 — 열기를 식히며 열매를 거두는 시기',
      modules: [
        { module_id: '병_미_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '여름의 열기가 서서히 식기 시작하는 시기 — 정열에서 차분함으로 바꾸어야 합니다',
            '지금까지 벌인 일의 결과물을 거두고 정리하는 데 의미를 두는 성품입니다',
            '미토(더운 흙)는 나무가 열매를 맺는 땅 — 쏟은 에너지를 결실로 바꾸는 그릇입니다',
            '태우기만 하면 남는 것이 없으니, 이제는 식히고 거두는 시기입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_미_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '여름의 남은 열기가 위장과 소화기에 부담을 줍니다 — 찬 음식보다는 따뜻하고 소화되는 음식이 좋습니다',
            '미토의 습한 열이 피로와 무거움을 동반합니다 — 가벼운 운동으로 땀을 내세요',
            '식어가는 시기이니 몸의 리듬을 안정시키는 규칙적 생활이 중요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_미_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '지금까지 추진해온 일을 마무리하고 결과를 내는 데 유리합니다',
            '과정보다 결과로 평가받는 시기 — 정리와 보고의 감각이 성과를 키웁니다',
            '새로 시작하기보다 진행 중인 일을 끝맺는 데 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_미_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '불꽃 같은 열정보다 따뜻하고 안정적인 인연이 좋은 시기입니다',
            '결실의 기운이 있어 진지한 관계로 발전하기 쉽습니다',
            '감정의 온도를 조절하며, 천천히 깊어지는 관계를 만드세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_미_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '지금까지 쌓아온 노력이 수익으로 구체화되는 시기 — 결실의 재물입니다',
            '미토의 저장 기운이 있어, 거둔 것을 묻어두고 키우는 데 유리합니다',
            '새로 벌이기보다 있는 것을 굳히고 불리는 데 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_미_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '따뜻하고 포용적인 태도로 주변을 편안하게 만드는 성품입니다',
            '열정의 시기를 지나 조화와 안정의 시기 — 갈등을 부드럽게 푸는 힘이 있습니다',
            '결실을 주변과 나누면 인맥이 더욱 단단해집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_미_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '배운 것과 경험한 것을 정리하고 체화하는 시기입니다',
            '실전에서 얻은 교훈을 기록으로 남기면 큰 자산이 됩니다',
            '식어가는 열기를 이용해 마음을 가다듬고 다음 단계를 준비하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_미_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '진행 중인 일을 끝맺고 결과물을 거두세요 — 이 시기의 가치는 결실에 있습니다',
            '거둔 것을 저축하고 굳히는 데 집중하세요 — 새로 벌이기보다 있는 것을 지키는 것이 유리합니다',
            '열정의 온도를 낮추고 차분함과 안정의 리듬으로 바꾸세요',
          ],
          closing: '이렇게 하시면 타오르던 열정이 식지 않고 단단한 열매로 남습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 7. 병_신 — 가을, 불이 쇠를 녹이고 다듬음 (극)
    //    태양이 가을 하늘에 맑게 비친 — 큰 열매를 거두되 벅참을 다스리는 시기
    // ================================================================
    {
      month_pattern_id: '병_신', day_master: '병', month_branch: '신',
      season: '가을',
      element_interaction: '불이 쇠를 녹이고 다듬음 (극)',
      label: '태양이 가을 하늘에 맑게 비친 — 큰 열매를 거두되 벅참을 다스리는 시기',
      modules: [
        { module_id: '병_신_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '가을 하늘처럼 맑고 결실의 기운이 강한 시기 — 큰 열매를 거둘 수 있는 성품입니다',
            '불이 쇠를 녹이듯 무언가를 다듬고 결과로 만드는 힘이 있습니다',
            '다만 욕심이 너무 크면 벅차서 오히려 녹이지 못합니다 — 한 번에 다 하려 하지 말고 나누어 다듬으세요',
            '결실의 시기이지만 그만큼 에너지가 소모되니, 거둔 것을 챙기는 지혜가 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_신_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '가을의 건조함이 폐·대장과 호흡기를 말립니다 — 따뜻한 물과 보습이 중요합니다',
            '쇠를 녹이는 데 에너지를 쏟으면 폐가 약해지니, 숨쉬기 운동과 등산으로 호흡기를 돌보세요',
            '결실의 피로가 쌓이기 쉬우니, 따뜻한 차와 충분한 휴식으로 기운을 보충하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_신_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '큰 성과와 큰 재물이 눈앞에 보이는 시기 — 결실의 직감이 날카롭습니다',
            '다듬고 완성하는 능력이 빛나니, 기획 마무리·협상·실무 총괄에 유리합니다',
            '욕심이 커지면 무리하게 벌이다가 실수가 생기니, 한 번에 큰 것보다 확실한 것을 먼저 잡으세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_신_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '이성적으로 매력적인 상대를 끌어당기는 시기 — 조건이나 능력이 눈에 잘 보입니다',
            '다만 너무 조건을 따지면 마음이 보이지 않으니, 능력보다 사람 됨을 보세요',
            '결실의 인연이 닿을 수 있으니, 진지하게 만날수록 유리합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_신_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '재물운이 강한 시기 — 노력한 만큼 크게 돌아오는 결실의 재물입니다',
            '다만 욕심이 지나치면 무리한 투자로 잃을 수 있으니, 확실한 것부터 챙기세요',
            '거둔 재물의 일부는 반드시 저축에 묻어두세요 — 쇠를 다 녹이려 하면 불이 꺼집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_신_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '날카로운 직관력으로 사람의 본질을 잘 파악하는 성품입니다',
            '다만 너무 날카로우면 사람이 멀어지니, 판단을 속에 두고 겉으로는 부드럽게 대하세요',
            '실속 있는 소수의 인맥이 넓은 인맥보다 유리한 시기입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_신_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '분석력과 직관이 가장 날카로운 시기 — 비판적 사고와 협상 기술을 키우세요',
            '결실을 다듬는 시기이니, 배운 것을 실전에 적용해 보세요',
            '욕심을 줄이고 한 가지를 깊이 파고들면 큰 전문성이 됩니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_신_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '한 번에 크게 벌려 하지 말고 확실한 것부터 챙기세요 — 욕심이 지나치면 녹이지 못합니다',
            '거둔 재물의 일부는 반드시 저축에 묻어두세요 — 다 녹이려 하면 불이 꺼집니다',
            '날카로운 판단력은 속에 두고, 겉으로는 부드럽게 사람을 대하세요',
          ],
          closing: '이렇게 하시면 가을의 결실을 온전히 거두면서도 스스로를 태우지 않을 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 8. 병_유 — 가을, 불이 쇠를 녹이고 다듬음 (극)
    //    태양이 늦가을에 비친 — 섬세한 결실을 정밀하게 다듬는 시기
    // ================================================================
    {
      month_pattern_id: '병_유', day_master: '병', month_branch: '유',
      season: '가을',
      element_interaction: '불이 쇠를 녹이고 다듬음 (극)',
      label: '태양이 늦가을에 비친 — 섬세한 결실을 정밀하게 다듬는 시기',
      modules: [
        { module_id: '병_유_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '늦가을의 맑고 섬세한 빛 — 큰 결실보다 정밀하고 깔끔한 결과를 만드는 성품입니다',
            '쇠를 다듬듯 무언가를 섬세하게 완성하는 집중력이 뛰어납니다',
            '완벽을 추구하는 만큼 스스로에게 깐깐해지기 쉬우니, 적당한 타협도 필요합니다',
            '결실이 안정적으로 들어오는 시기 — 차분하게 거두고 정리하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_유_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '가을의 건조함이 피부와 호흡기를 말립니다 — 보습과 따뜻한 물을 자주 드세요',
            '섬세한 집중이 눈과 신경을 피로하게 합니다 — 눈 휴식과 명상으로 심신을 푸세요',
            '결실의 시기이지만 긴장이 많으면 소화가 약해지니, 식사 시간을 규칙적으로 하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_유_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '정밀한 작업, 품질 관리, 디자인, 데이터 분석, 재무 등 섬세함이 빛나는 일에 유리합니다',
            '안정적인 성과가 인정받는 시기 — 큰 도약보다 꼼꼼한 완성으로 신뢰를 쌓으세요',
            '결과물의 품질로 승부하면 주변에서 확실한 평가를 받습니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_유_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '깔끔하고 섬세한 매력으로 안정적인 인연이 다가옵니다',
            '다만 기준이 높아 만남을 놓치기 쉬우니, 완벽을 구하지 말고 마음이 가는 사람에게 열려 있으세요',
            '천천히 깊어지는 관계가 가장 안정적인 결실로 이어집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_유_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '안정적이고 꾸준한 재물이 들어오는 시기 — 큰 수익보다 확실한 수익이 좋습니다',
            '섬세한 관리로 지출을 줄이면 재물이 차곡차곡 쌓입니다',
            '욕심 부리지 말고 현재 수입 안에서 저축의 비율을 높이세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_유_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '섬세하고 배려 깊은 성격으로 신뢰를 쌓는 성품입니다',
            '다만 깐깐함이 지나치면 거리감이 생기니, 너그러움을 의식적으로 연습하세요',
            '소수와 깊이 교류할수록 안정적인 관계가 됩니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_유_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '집중력과 섬세함이 최고조 — 정밀한 기술, 언어, 자격증에 투자하세요',
            '배운 것을 다듬어 완성품으로 만드는 능력이 빛납니다',
            '완벽주의에 빠지지 말고, 80퍼센트의 완성도로 빠르게 내놓는 연습도 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_유_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '섬세한 집중력을 살려 한 가지를 정밀하게 완성하세요 — 품질이 곧 경쟁력입니다',
            '완벽주의에 빠지지 말고 적당한 타협으로 속도를 내세요',
            '안정적으로 들어오는 재물을 꼼꼼히 관리하고 저축하세요',
          ],
          closing: '이렇게 하시면 늦가을의 맑은 빛으로 섬세하고 확실한 결실을 만들어 낼 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 9. 병_술 — 가을→겨울, 흙에 묻혀 불이 수그러드는
    //    태양이 지평선으로 기울어 — 열기를 거두고 내면을 채우는 갱신의 시기
    // ================================================================
    {
      month_pattern_id: '병_술', day_master: '병', month_branch: '술',
      season: '가을',
      element_interaction: '흙에 묻혀 불이 수그러드는',
      label: '태양이 지평선으로 기울어 — 열기를 거두고 내면을 채우는 갱신의 시기',
      modules: [
        { module_id: '병_술_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '태양이 지평선으로 기울듯 밖으로 쏟던 에너지를 거두어 들이는 시기입니다',
            '술토(건조한 늦가을 흙)는 저장의 땅 — 빛을 흙 속에 묻어 씨앗처럼 키우는 갱신의 시기입니다',
            '밖으로 드러내기보다 안을 채우고 정비하는 데 의미를 두는 성품입니다',
            '끓어오르던 열정을 차분한 온기로 바꾸어 저장하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_술_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '가을의 건조함이 피부와 호흡기를 말립니다 — 보습과 따뜻한 음식으로 건조증을 예방하세요',
            '에너지를 거두는 시기이니 무리한 운동보다 가벼운 산책과 휴식이 좋습니다',
            '위장이 건조해지기 쉬우니, 따뜻하고 부드러운 식사로 소화기를 돌보세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_술_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '지금까지의 성과를 정리하고 다음 단계를 준비하는 시기 — 갱신과 재정비에 유리합니다',
            '저장과 축적의 기운이 있어 자산 관리, 기록, 정리, 보관 관련 일에 강합니다',
            '새로 벌이기보다 있는 것을 점검하고 다듬는 데 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_술_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '겉으로 드러내기보다 속으로 깊어지는 관계가 좋은 시기입니다',
            '서로의 내면을 나누는 시간이 관계의 깊이를 더합니다',
            '느리지만 진지한 인연이 이 시기에 자라납니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_술_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '저장과 축적의 시기 — 들어온 재물을 묻어두고 키우는 데 유리합니다',
            '새로 벌기보다 있는 것을 굳히고 관리하는 것이 우선입니다',
            '장기 투자와 저축에 유리하니, 단기 수익에 현혹되지 마세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_술_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '차분하고 진중한 태도로 깊은 신뢰를 쌓는 성품입니다',
            '겉도는 인맥보다 소수와 깊이 교류할수록 유리합니다',
            '침묵이 길어지면 오해가 생기니, 속마음을 적절히 표현하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_술_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '경험과 지식을 정리하여 내면의 자산으로 만드는 시기입니다',
            '기록, 정리, 회고의 습관이 흩어진 것을 하나로 모아줍니다',
            '조용히 배우고 쌓는 시기 — 드러내지 않아도 쌓이는 것이 큽니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_술_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '밖으로 쏟던 에너지를 거두어 들이세요 — 안을 채우고 정비하는 시기입니다',
            '지금까지의 성과와 경험을 정리하여 저장하세요 — 기록이 큰 자산이 됩니다',
            '재물은 묻어두고 키우세요 — 단기 수익보다 장기 축적이 유리합니다',
          ],
          closing: '이렇게 하시면 타오르던 빛이 식지 않고 흙 속 씨앗처럼 다음 봄을 위한 에너지가 됩니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 10. 병_해 — 겨울, 물이 불을 끄려 하는 긴장 (극)
    //    태양이 겨울 바다에 잠기듯 — 큰 시련 속에서 자신을 다듬는 극기의 시기
    // ================================================================
    {
      month_pattern_id: '병_해', day_master: '병', month_branch: '해',
      season: '겨울',
      element_interaction: '물이 불을 끄려 하는 긴장 (극)',
      label: '태양이 겨울 바다에 잠기듯 — 큰 시련 속에서 자신을 다듬는 극기의 시기',
      modules: [
        { module_id: '병_해_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '큰 물(바다)이 태양의 불을 끄려 하는 격 — 밖에서 강한 압력과 시련이 밀려오는 성품입니다',
            '그러나 해수(큰 물) 속에는 나무(甲)의 기운이 숨어 있어, 시련 속에서도 새 싹이 트는 여지가 있습니다',
            '거센 물결에 불빛이 흔들리지만 꺼뜨리지 않는 것이 이 시기의 가장 중요한 과제입니다',
            '큰 시련은 큰 그릇을 만듭니다 — 버텨내면 그만큼 단단해집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_해_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '겨울의 차가운 기운이 심장과 혈액순환을 위축시킵니다 — 따뜻한 음식과 온수 목욕으로 몸을 데우세요',
            '스트레스와 긴장이 만성 피로로 이어지니, 충분한 수면과 휴식이 필수입니다',
            '차가운 날씨에 관절이 굳으니, 실내에서 가볍게 몸을 풀어주는 운동이 좋습니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_해_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '강한 압력과 책임이 따라붙는 시기 — 시련 속에서 자신을 증명할 기회가 있습니다',
            '거센 흐름에 맞서기보다 흐름을 읽고 방향을 잡는 것이 유리합니다',
            '당장의 성과보다 위기를 넘기며 쌓는 경험이 훗날 큰 자산이 됩니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_해_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '거센 감정의 흐름에 휩쓸리기 쉬운 시기 — 감정에만 의존하면 관계가 흔들립니다',
            '서로의 차이와 갈등을 인정하고 천천히 신뢰를 쌓는 것이 필요합니다',
            '시련을 함께 넘긴 인연이 가장 깊고 단단해집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_해_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '재물이 흔들리고 빠져나가기 쉬운 시기 — 지키는 것이 벌기보다 중요합니다',
            '큰 투자와 무리한 지출은 피하고, 비상금을 반드시 확보하세요',
            '안전한 자산(예금, 보험)에 우선순위를 두세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_해_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '강한 압력 속에서 진짜 인연과 겉인연이 구분되는 시기입니다',
            '어려울 때 곁에 남는 사람을 소중히 하세요',
            '막 나가는 사람보다 차분하게 조언해 주는 사람이 진짜 도움입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_해_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '시련이 가장 큰 스승인 시기 — 위기 속에서 배우는 것이 깊이가 다릅니다',
            '인내심과 회복력을 기르는 훈련(명상, 기록, 독서)이 마음을 지켜줍니다',
            '남과 비교하지 말고 자기 리듬을 지키세요 — 겨울은 견디는 계절입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_해_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '거센 압력 속에서 불빛을 꺼뜨리지 마세요 — 버텨내면 그만큼 단단해집니다',
            '재물은 무조건 지키는 것을 우선으로 하세요 — 비상금을 확보하십시오',
            '어려울 때 곁에 남는 사람을 소중히 하고, 차분한 조언자를 가까이 하세요',
          ],
          closing: '이렇게 하시면 큰 시련을 넘기며 태양보다 더 깊고 단단한 빛을 갖게 됩니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 11. 병_자 — 겨울, 물이 불을 끄려 하는 긴장 (극)
    //    태양이 한겨울 한밤에 머문 — 규율과 책임 속에서 인내로 빛을 지키는 시기
    // ================================================================
    {
      month_pattern_id: '병_자', day_master: '병', month_branch: '자',
      season: '겨울',
      element_interaction: '물이 불을 끄려 하는 긴장 (극)',
      label: '태양이 한겨울 한밤에 머문 — 규율과 책임 속에서 인내로 빛을 지키는 시기',
      modules: [
        { module_id: '병_자_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '한겨울 한밤의 태양 — 가장 어둡고 추운 시기에 작은 빛을 지켜야 하는 성품입니다',
            '자수(섬세하고 차가운 물)는 규율과 책임의 기운 — 엄격한 틀 속에서 인내를 배웁니다',
            '밖으로 빛을 쏟기보다 안에서 빛을 키우는 시기 — 절제와 규칙이 곧 힘이 됩니다',
            '추위 속에서 작은 온기 하나가 얼마나 소중한지 아는 사람이 됩니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_자_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '한겨울의 추위가 심장·신장·혈액순환을 위축시킵니다 — 따뜻한 음식과 옷으로 체온을 지키세요',
            '수면이 부족하면 면역력이 급격히 떨어지니, 밤 10시 전 취침을 목표로 하세요',
            '실내에서 따뜻하게 몸을 풀고(요가, 스트레칭) 혈액순환을 돌보세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_자_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '규율과 체계가 중요한 시기 — 책임감과 성실함이 인정을 받습니다',
            '큰 도약보다 꾸준함으로 신뢰를 쌓는 것이 유리합니다',
            '혼자서 묵묵히 하는 일(연구, 기획, 관리)이 눈에 띄지 않아도 큰 결실로 이어집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_자_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '차분하고 진지한 인연이 좋은 시기 — 화려함보다 신뢰와 책임이 중요합니다',
            '감정을 속에 담아두면 오해가 생기니, 마음을 조금씩 표현하세요',
            '추운 시기이니 따뜻한 말 한마디가 관계를 살립니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_자_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '재물이 조용히 들어오고 조용히 나가는 시기 — 꼼꼼한 관리가 필수입니다',
            '절약과 저축이 자연스러운 시기이니, 이 습관을 살려 자산을 키우세요',
            '무리한 투자는 피하고 안전한 자산에 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_자_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '말수가 적고 진중한 성품 — 깊은 신뢰를 천천히 쌓습니다',
            '다만 차가워 보이기 쉬우니, 의식적으로 따뜻하게 대하는 연습이 필요합니다',
            '소수의 깊은 인연이 넓은 인맥보다 훨씬 소중한 시기입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_자_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '조용히 집중하여 깊이 파고드는 데 가장 유리한 시기 — 독서, 연구, 학습에 투자하세요',
            '절제와 규칙의 생활이 학습 효율을 크게 높입니다',
            '겨울이 지난 뒤의 봄을 위해 씨앗을 심는 마음으로 배우세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_자_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '어둡고 추운 시기에 작은 빛을 꺼뜨리지 마세요 — 절제와 규칙이 곧 힘입니다',
            '말수가 적은 만큼 의식적으로 따뜻하게 대하는 연습을 하세요',
            '조용히 집중하여 깊이 배우고 쌓으세요 — 봄을 위한 씨앗입니다',
          ],
          closing: '이렇게 하시면 한겨울 한밤의 작은 빛이 봄이 올 때 가장 밝은 빛으로 피어납니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 12. 병_축 — 겨울→봄, 차가운 흙이 불의 열을 빨아들임
    //    태양이 겨울 끝 얼어붙은 흙에 닿은 — 조용히 인내하며 봄을 기다리는 시기
    // ================================================================
    {
      month_pattern_id: '병_축', day_master: '병', month_branch: '축',
      season: '겨울',
      element_interaction: '차가운 흙이 불의 열을 빨아들임',
      label: '태양이 겨울 끝 얼어붙은 흙에 닿은 — 조용히 인내하며 봄을 기다리는 시기',
      modules: [
        { module_id: '병_축_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '겨울 끝, 얼어붙은 흙에 닿은 태양 — 열을 쏟아도 흙이 빨아들여 쉽게 데워지지 않는 시기입니다',
            '축토(차갑고 얼어붙은 흙)는 인내와 기다림의 땅 — 조급해하면 안 되는 성품입니다',
            '다만 축토 속에는 숨은 물과 금의 기운이 있어, 인내 속에서 차곡차곡 쌓이는 힘이 있습니다',
            '봄이 오기 전 마지막 추위를 견디는 시기 — 서두르지 말고 기초를 다지세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_축_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '차가운 기운이 위장과 관절을 굳게 합니다 — 따뜻한 음식(국, 죽, 탕)으로 소화기를 돌보세요',
            '에너지가 빨려나가는 듯한 피로가 올 수 있으니, 무리하지 말고 리듬을 천천히 유지하세요',
            '실내 온기를 유지하고, 찬 음식과 노출은 피하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_축_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '보이지 않게 기초를 다지는 시기 — 당장의 성과는 더디어도 쌓이는 것이 단단합니다',
            '관리, 정비, 기반 작업, 행정 등 꼼꼼함과 인내가 필요한 일에 강합니다',
            '급하게 바꾸기보다 현재 자리에서 기초를 튼튼히 하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_축_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '천천히 깊어지는 관계가 좋은 시기 — 조급하게 다가가면 상대가 닫힙니다',
            '따뜻함을 주되 상대가 받아들일 때까지 기다려 주는 여유가 필요합니다',
            '인내 속에서 싹트는 인연이 가장 오래갑니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_축_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '재물이 천천히 들어오는 시기 — 큰 수익보다 꾸준한 저축이 유리합니다',
            '축토의 저장 기운이 있어 묻어둔 재물이 잘 자라납니다',
            '조급한 투자는 피하고, 시간을 두고 쌓는 것에 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_축_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '말수가 적고 참을성 있는 성품 — 깊은 신뢰를 천천히 쌓습니다',
            '다만 너무 닫혀 있으면 고립되니, 가까운 사람에게 마음을 조금씩 여세요',
            '인내심이 길어질수록 진짜 인연이 남습니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_축_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '느리지만 깊이 쌓이는 시기 — 기초를 튼튼히 다지는 학습에 가장 좋습니다',
            '조급해하지 말고 하나씩 확실히 익히세요 — 축토에 심은 것은 봄에 크게 자라납니다',
            '혼자만의 시간을 활용해 뿌리를 깊이 내리세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '병_축_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '조급해하지 말고 기초를 튼튼히 다지세요 — 축토에 심은 것은 봄에 크게 자라납니다',
            '인내를 인생의 무기로 삼으세요 — 기다릴 줄 아는 사람이 가장 멀리 갑니다',
            '너무 닫혀 있지 않게 가까운 사람에게 마음을 조금씩 여세요',
          ],
          closing: '이렇게 하시면 겨울 끝의 인내가 봄이 올 때 가장 단단한 뿌리가 됩니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 13. 정_인 — 봄, 나무가 촛불을 살려 밝게 비춤 (생)
    //     촛불이 이른 봄에 켜진 — 나무가 바람을 막아주는 따뜻한 내면의 빛
    // ================================================================
    {
      month_pattern_id: '정_인', day_master: '정', month_branch: '인',
      season: '봄',
      element_interaction: '나무가 촛불을 살려 밝게 비춤 (생)',
      label: '촛불이 이른 봄에 켜진 — 나무가 바람을 막아주는 따뜻한 내면의 빛',
      modules: [
        { module_id: '정_인_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '촛불은 바람에 흔들리기 쉽지만, 인목(큰 나무)이 바람을 막아주어 불빛이 안정되는 시기입니다',
            '밖으로 뻗는 빛이 아니라 안을 향해 깊이 밝히는 빛 — 내면의 지혜와 직관이 맑아집니다',
            '배움과 사색이 깊어지는 시기이지만, 생각에만 잠기면 현실과 멀어질 수 있습니다',
            '배운 것을 사람들과 나누어야 내면의 빛이 꺼지지 않습니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_인_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '정화는 심장·혈액·눈과 연결됩니다 — 신경이 예민해지기 쉬우니 마음을 안정시키세요',
            '생각이 많으면 수면이 흐트러집니다 — 밤에는 생각을 끊고 숨쉬기로 마음을 가라앉히세요',
            '인목의 기운이 간·목·어깨와 연결되니, 가벼운 스트레칭으로 풀어주세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_인_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '학문, 연구, 기획, 교육, 상담 등 깊이 생각하고 전달하는 일에 유리합니다',
            '직관과 통찰이 맑은 시기 — 복잡한 문제의 본질을 꿰뚫는 능력이 빛납니다',
            '다만 생각에만 머물지 말고, 반드시 결과물로 정리하여 내놓으세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_인_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '섬세하고 따뜻한 마음씨로 깊은 인연을 끌어당깁니다',
            '다만 너무 안으로만 파고들면 상대가 답답해하니, 밖으로 표현하는 것도 필요합니다',
            '정신적으로 통하는 사람이 가장 좋은 인연입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_인_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '지식과 통찰이 재물이 되는 시기 — 자격증, 강의, 집필, 상담 등 지적 자산이 유리합니다',
            '돈을 직접 쫓기보다 실력과 내면을 쌓으면 재물이 따라옵니다',
            '조급한 투자는 피하고, 꾸준히 쌓는 것에 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_인_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '다정하고 섬세한 배려로 깊은 신뢰를 쌓는 성품입니다',
            '혼자만의 시간이 필요하지만, 너무 오래 혼자 있으면 고독이 깊어집니다 — 사람과 나누세요',
            '스승과 멘토의 인연이 열려 있으니, 배우려는 마음으로 다가가세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_인_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '내면의 지혜가 가장 깊어지는 시기 — 철학, 심리학, 종교, 문학 등에 마음이 끌립니다',
            '직관을 신뢰하되, 논리로 검증하는 습관이 통찰을 단단하게 만듭니다',
            '배운 것을 기록하고 정리하지 않으면 흩어지니, 꾸준히 적으세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_인_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '생각에만 머물지 말고 배운 것을 결과물로 만들어 내놓으세요',
            '혼자만의 시간이 길어지면 고독이 깊어집니다 — 사람과 나누는 시간을 의식적으로 만드세요',
            '직관을 신뢰하되, 반드시 논리로 한 번 더 검증하는 습관을 들이세요',
          ],
          closing: '이렇게 하시면 안으로 밝히는 따뜻한 빛이 세상에 닿는 지혜가 됩니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 14. 정_묘 — 봄, 나무가 촛불을 살려 밝게 비춤 (생)
    //     촛불이 꽃 핀 봄밤에 밝힌 — 섬세한 아름다움과 예술적 감수성
    // ================================================================
    {
      month_pattern_id: '정_묘', day_master: '정', month_branch: '묘',
      season: '봄',
      element_interaction: '나무가 촛불을 살려 밝게 비춤 (생)',
      label: '촛불이 꽃 핀 봄밤에 밝힌 — 섬세한 아름다움과 예술적 감수성',
      modules: [
        { module_id: '정_묘_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '꽃 핀 봄밤의 촛불 — 예술적 감수성과 미적 감각이 가장 섬세하게 피어나는 시기입니다',
            '감정이 풍부하고 표현하고 싶은 에너지가 넘치지만, 예민함도 함께 강해집니다',
            '아름다움에 대한 감각이 뛰어난 만큼, 거칠고 투박한 것에 상처를 받기 쉽습니다',
            '감수성을 예술로 승화시키면 빛나지만, 감정에만 휩쓸리면 흔들립니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_묘_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '신경이 예민해져 불면과 긴장성 두통이 오기 쉽습니다 — 명상과 따뜻한 차로 마음을 푸세요',
            '봄의 꽃가루와 건조함이 호흡기와 피부에 영향을 주니, 보습과 알레르기 관리가 필요합니다',
            '감정 기복이 체력을 소모하니, 규칙적인 수면으로 신경을 안정시키세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_묘_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '예술, 디자인, 문학, 음악, 미용, 인테리어 등 아름다움을 다루는 일에 가장 유리합니다',
            '감각과 섬세함이 인정받는 시기 — 작지만 정교한 결과물로 승부하세요',
            '다만 감정 기복이 일의 지속성을 흔들 수 있으니, 규칙적인 작업 습관이 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_묘_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '낭만적이고 섬세한 매력으로 인연이 다가옵니다 — 감정의 교감이 중요한 시기입니다',
            '다만 감정에 휩쓸려 상처받기 쉬우니, 천천히 마음을 확인하세요',
            '예술적이고 감수성이 풍부한 사람이 잘 맞을 수 있습니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_묘_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '감각과 재능이 재물이 되는 시기 — 디자인, 예술, 미용, 콘텐츠에서 수익이 나옵니다',
            '이름과 평판이 중요하니, 작품 하나하나에 정성을 다하세요',
            '감정적 소비(기분전환 쇼핑)를 경계하고, 꾸준히 저축하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_묘_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '다정하고 섬세하여 사람을 끌어당기지만, 예민함으로 오해를 사기도 합니다',
            '거친 말이나 투박한 태도에 상처받으니, 마음을 보호하는 경계가 필요합니다',
            '감수성이 통하는 소수의 사람과 깊이 교류하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_묘_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '미적 감각과 창의력이 가장 빛나는 시기 — 예술, 언어, 표현 기술에 투자하세요',
            '감정을 다루는 법을 배우세요 — 감수성은 재능이지만 다루지 못하면 흔들림이 됩니다',
            '섬세함을 살려 한 분야의 전문성을 깊이 파고드세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_묘_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '풍부한 감수성을 예술이나 창작으로 승화시키세요 — 감정에만 머물면 흔들립니다',
            '예민함을 보호하되, 너무 닫히지 말고 감각이 통하는 사람과 교류하세요',
            '감정적 소비를 경계하고, 재능을 꾸준히 저축으로 연결하세요',
          ],
          closing: '이렇게 하시면 섬세한 감수성이 흔들림이 아닌 빛나는 예술로 피어납니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 15. 정_진 — 봄→여름, 촛불이 흙을 정성스레 데움 (생)
    //     촛불이 늦봄의 흙을 데우는 — 작은 불이 정성스레 그릇을 빚는 시기
    // ================================================================
    {
      month_pattern_id: '정_진', day_master: '정', month_branch: '진',
      season: '봄',
      element_interaction: '촛불이 흙을 정성스레 데움 (생)',
      label: '촛불이 늦봄의 흙을 데우는 — 작은 불이 정성스레 그릇을 빚는 시기',
      modules: [
        { module_id: '정_진_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '작은 촛불이 흙을 정성스레 데워 그릇을 빚듯 — 섬세하고 정성스러운 결과물을 만드는 성품입니다',
            '큰 불로 단번에 달구는 것이 아니라, 천천히 다듬고 완성하는 인내심이 있습니다',
            '진토(늦봄의 습한 흙)는 그릇의 기운 — 정성으로 빚은 것이 튼튼한 그릇이 됩니다',
            '조급함을 버리고 한 땀 한 땀 다듬는 마음이 이 시기의 보물입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_진_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '늦봄의 습한 기운이 위장과 소화기에 부담을 줍니다 — 소화되는 따뜻한 음식이 좋습니다',
            '섬세한 집중이 눈과 신경을 피로하게 하니, 휴식과 눈 운동을 생활화하세요',
            '생각이 많아지면 위장이 먼저 반응하니, 식사 시에는 생각을 내려놓으세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_진_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '정성과 섬세함으로 결과물을 완성하는 일에 유리합니다 — 공예, 요리, 교육, 돌봄, 서비스',
            '진토의 그릇 기운이 있어, 만든 것을 담고 저장하는 능력이 있습니다',
            '양보다 질로 승부하면 주변에서 확실한 인정을 받습니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_진_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '정성스럽고 따뜻한 마음으로 신뢰를 쌓는 시기 — 행동으로 보여주는 사랑이 좋습니다',
            '말보다 작은 정성이 관계를 깊게 만듭니다',
            '다만 너무 헌신하면 지치니, 자신을 챙기는 균형이 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_진_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '정성과 기술이 재물이 되는 시기 — 손재주, 서비스, 교육, 요리 등에서 수익이 나옵니다',
            '진토의 저장 기운이 있어, 꾸준히 모은 것이 큰 자산이 됩니다',
            '큰 수익을 한 번에 노리지 말고, 차곡차곡 쌓으세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_진_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '정성스럽고 배려 깊은 성품으로 주변을 편안하게 만듭니다',
            '말보다 행동으로 보여주는 신뢰가 관계의 기반입니다',
            '너무 헌신하면 이용당할 수 있으니, 줄 것과 지킬 것의 경계가 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_진_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '섬세한 손재주와 정성을 살리는 학습에 유리합니다 — 공예, 요리, 서비스, 교육 기술',
            '배운 것을 정성으로 다듬어 완성품으로 만드는 능력이 빛납니다',
            '조급함을 버리고, 하나를 끝까지 완성하는 습관이 큰 성장으로 이어집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_진_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '조급함을 버리고 정성으로 하나를 끝까지 완성하세요 — 질이 곧 경쟁력입니다',
            '말보다 행동으로 보여주되, 너무 헌신하여 자신을 잃지 마세요',
            '꾸준히 모은 것을 저장하는 습관을 들이세요 — 진토의 그릇이 채워집니다',
          ],
          closing: '이렇게 하시면 작은 촛불의 정성이 단단하고 아름다운 그릇이 됩니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 16. 정_사 — 여름, 같은 불에 촛불이 가려 묻힘 (겁재)
    //     촛불이 한여름 초입에 선 — 큰 불에 가려 빛을 잃기 쉬운 시기
    // ================================================================
    {
      month_pattern_id: '정_사', day_master: '정', month_branch: '사',
      season: '여름',
      element_interaction: '같은 불에 촛불이 가려 묻힘 (겁재)',
      label: '촛불이 한여름 초입에 선 — 큰 불에 가려 빛을 잃기 쉬운 시기',
      modules: [
        { module_id: '정_사_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '사화(큰 불) 앞의 촛불 — 내 빛이 남의 큰 불에 묻혀 보이지 않기 쉬운 시기입니다',
            '주변에 강한 사람이나 환경에 휩쓸려 내 색깔을 잃을 위험이 있습니다',
            '다만 사화 속에는 금의 기운이 숨어 있어, 인내 속에서 다듬을 기회가 생깁니다',
            '남의 빛에 가려지지 말고, 나만의 섬세한 빛을 지키세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_사_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '여름의 열기가 심장과 신경을 자극합니다 — 예민함이 극에 달해 불면과 긴장이 올 수 있습니다',
            '열을 식히는 것이 건강의 열쇠 — 찬물 샤워, 수분 보충, 그늘 휴식을 생활화하세요',
            '감정 기복이 심하니, 명상과 호흡으로 마음의 온도를 조절하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_사_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '강한 동료나 경쟁자에 가려 인정받기 어려운 시기 — 인내가 필요합니다',
            '무리하게 앞장서기보다, 자기 자리에서 섬세함을 다루는 일에 집중하세요',
            '남과 비교하지 말고, 내 강점(섬세함, 집중력)을 키우는 데 시간을 쓰세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_사_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '감정이 뜨거워지기 쉽지만, 흔들림도 큰 시기 — 충동적 결정을 피하세요',
            '강한 인연에 끌리기 쉬우나, 나를 잃지 않도록 주의해야 합니다',
            '감정의 온도를 식히고, 상대의 본질을 냉정하게 보세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_사_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '재물이 빠져나가기 쉬운 시기 — 충동적 소비와 감정적 지출을 경계하세요',
            '남의 유혹(투자 권유, 빠른 수익)에 넘어가지 말고, 자기 판단을 굳히세요',
            '지출을 최소화하고, 안전한 자산에 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_사_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '강한 사람이나 무리에 휩쓸리기 쉬운 시기 — 나를 잃지 않는 경계가 필요합니다',
            '맞지 않는 무리에 억지로 맞추지 말고, 나와 맞는 사람을 찾으세요',
            '침묵하면 묻히니, 의견을 차분하게 표현하는 연습이 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_사_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '남과 비교하여 위축되기 쉬운 시기 — 나만의 강점을 잃지 마세요',
            '섬세함과 집중력이 정화의 무기 — 큰 불이 못 하는 정밀한 일에 투자하세요',
            '인내 속에서 다듬는 기술이 훗날 빛을 발합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_사_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '남의 큰 불에 가려 나의 섬세한 빛을 잃지 마세요 — 자기 색깔을 지키는 것이 가장 중요합니다',
            '충동적 소비와 감정적 결정을 경계하세요 — 하루를 더 기다리는 습관이 필요합니다',
            '억지로 무리에 맞추지 말고, 나와 맞는 사람과 환경을 찾으세요',
          ],
          closing: '이렇게 하시면 큰 불에 묻히지 않고, 나만의 섬세한 빛을 끝까지 지킬 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 17. 정_오 — 여름, 촛불이 한낮의 제 자리에 선 (비견)
    //     촛불이 한낮의 제 자리에 선 — 등불이 가장 강해지는 본래의 자리
    // ================================================================
    {
      month_pattern_id: '정_오', day_master: '정', month_branch: '오',
      season: '여름',
      element_interaction: '촛불이 제 자리에 단단히 선 — 가장 강해짐 (비견)',
      label: '촛불이 한낮의 제 자리에 선 — 등불이 가장 강해지는 본래의 자리',
      modules: [
        { module_id: '정_오_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '오화는 정화가 가장 편안하게 머무는 자리 — 촛불이 제 자리를 찾아 가장 밝고 강해지는 시기입니다',
            '주체성과 자신감이 확고해져 흔들림 없이 자기 길을 걷는 성품입니다',
            '다만 강해진 만큼 고집이 세지고, 남의 말을 듣기 어려워질 수 있습니다',
            '강한 빛은 그림자도 깊게 만듭니다 — 주위를 살피는 부드러움이 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_오_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '여름의 열기가 심장과 혈압에 부담을 줍니다 — 수분 보충과 열 식히기가 필수입니다',
            '기운이 강한 만큼 소모도 크니, 과로하지 말고 휴식 시간을 만드세요',
            '신경이 예민해져 불면이 올 수 있으니, 밤에는 마음을 가라앉히세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_오_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '자기 주도력이 가장 강한 시기 — 스스로 방향을 정하고 밀어붙이는 힘이 있습니다',
            '전문성과 주체성이 인정받습니다 — 자기 이름으로 하는 일에 유리합니다',
            '다만 독단적이 되면 협력이 깨지니, 주변의 의견을 귀담아들으세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_오_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '자신감 있고 매력적인 시기 — 주도적으로 다가가면 인연이 생깁니다',
            '다만 고집이 세면 갈등이 생기니, 한 발 양보하는 여유가 필요합니다',
            '강한 만큼 상대를 존중하는 마음이 관계를 지킵니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_오_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '자기 능력으로 재물을 만드는 시기 — 주도적으로 일할수록 수익이 커집니다',
            '다만 자신감이 지나쳐 무리한 투자를 할 수 있으니, 한 번 더 검토하세요',
            '강한 시기에 번 만큼 저축의 비율을 높이세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_오_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '강한 주체성으로 존재감이 크지만, 고집이 세면 사람이 멀어집니다',
            '내가 강한 만큼 한 발 물러서서 듣는 시간이 인맥을 지킵니다',
            '칭찬하는 사람보다 바른 말을 해주는 사람을 가까이 하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_오_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '자기 주도로 배우고 실천하는 데 가장 유리한 시기 — 스스로 방향을 정하세요',
            '강한 만큼 비판을 수용하는 훈련이 필요합니다 — 강한 빛은 그림자도 깊습니다',
            '전문성을 한 단계 끌어올릴 수 있는 시기 — 과감히 투자하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_오_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '강해진 만큼 고집을 낮추고 주변의 말을 들으세요 — 부드러움이 강함을 지킵니다',
            '주도적으로 일하되, 무리한 투자와 결정은 한 번 더 검토하세요',
            '강한 시기에 번 만큼 저축의 비율을 높이세요 — 강할 때 굳혀야 약할 때 버팁니다',
          ],
          closing: '이렇게 하시면 가장 강한 빛을 독단이 아닌 따뜻한 주체성으로 지켜낼 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 18. 정_미 — 여름→가을, 촛불이 흙을 만들며 온기를 나눔
    //     촛불이 한여름 끝에 머문 — 섬세한 온기로 마무리를 짓는 시기
    // ================================================================
    {
      month_pattern_id: '정_미', day_master: '정', month_branch: '미',
      season: '여름',
      element_interaction: '촛불이 흙을 만들며 온기를 나눔',
      label: '촛불이 한여름 끝에 머문 — 섬세한 온기로 마무리를 짓는 시기',
      modules: [
        { module_id: '정_미_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '여름의 열기가 서서히 식기 시작하는 시기 — 섬세한 온기를 나누며 마무리를 짓는 성품입니다',
            '미토(더운 흙)는 촛불의 온기를 받아 결과물을 빚는 땅 — 정성으로 다듬은 것을 완성하세요',
            '정화 특유의 섬세함이 결실로 구체화되는 시기 — 돌봄과 정성이 빛납니다',
            '타오르는 열정이 아닌, 식어가는 온기로 마무리하는 지혜가 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_미_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '여름의 남은 열기가 위장과 소화기에 부담을 줍니다 — 소화되는 따뜻한 음식이 좋습니다',
            '미토의 습열이 피로와 무거움을 동반합니다 — 가벼운 운동으로 땀을 내세요',
            '섬세한 신경이 피로하니, 휴식과 따뜻한 차로 마음을 안정시키세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_미_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '섬세한 마무리와 돌봄이 빛나는 시기 — 서비스, 교육, 의료, 요리, 공예에 유리합니다',
            '진행 중인 일을 정성으로 완성하는 능력이 인정받습니다',
            '새로 시작하기보다, 있는 것을 다듬고 마무리하는 데 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_미_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '따뜻하고 섬세한 온기로 안정적인 인연이 좋은 시기입니다',
            '말보다 작은 정성과 배려가 관계를 깊게 만듭니다',
            '천천히 깊어지는 관계가 결실로 이어집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_미_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '섬세함과 정성이 재물이 되는 시기 — 손재주, 서비스, 돌봄에서 수익이 나옵니다',
            '미토의 저장 기운이 있어, 꾸준히 모은 것이 자산이 됩니다',
            '큰 수익을 노리지 말고, 차곡차곡 쌓으세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_미_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '따뜻하고 배려 깊은 태도로 주변을 편안하게 만드는 성품입니다',
            '섬세한 돌봄으로 깊은 신뢰를 쌓습니다 — 말보다 행동이 관계의 기반입니다',
            '너무 헌신하면 지치니, 자신을 챙기는 균형이 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_미_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '섬세한 손재주와 돌봄의 기술을 키우는 데 유리합니다',
            '배운 것을 정성으로 완성품으로 만드는 능력이 빛납니다',
            '마무리의 감각 — 끝을 맺는 훈련이 큰 성장으로 이어집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_미_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '진행 중인 일을 정성으로 완성하고 마무리하세요 — 섬세함이 곧 경쟁력입니다',
            '말보다 작은 정성과 행동으로 관계를 다지세요',
            '너무 헌신하지 말고 자신을 챙기는 균형을 잃지 마세요',
          ],
          closing: '이렇게 하시면 섬세한 온기가 단단한 결실로 남습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 19. 정_신 — 가을, 촛불이 큰 쇠를 녹여 다듬음 (극)
    //     촛불이 가을 하늘에 비친 — 큰 쇠를 다듬으려 벅찬 열매의 시기
    // ================================================================
    {
      month_pattern_id: '정_신', day_master: '정', month_branch: '신',
      season: '가을',
      element_interaction: '촛불이 큰 쇠를 녹여 다듬음 (극)',
      label: '촛불이 가을 하늘에 비친 — 큰 쇠를 다듬으려 벅찬 열매의 시기',
      modules: [
        { module_id: '정_신_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '작은 촛불이 큰 쇠를 녹이려 하는 격 — 결실은 보이지만 나의 힘으로 감당하기 벅찬 시기입니다',
            '욕심이 앞서면 촛불이 꺼질 수 있으니, 한 번에 다 하려 하지 말고 조금씩 다듬으세요',
            '신금(큰 쇠)은 결실의 기운 — 섬세하게 다루면 큰 결과가 되지만, 무리하면 오히려 녹이지 못합니다',
            '내 힘의 한계를 아는 것이 이 시기의 지혜입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_신_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '큰 쇠를 녹이려 에너지를 쏟으면 폐와 호흡기가 약해집니다 — 숨쉬기 운동으로 보호하세요',
            '가을의 건조함이 신경을 예민하게 하니, 따뜻한 차와 보습으로 마음과 피부를 돌보세요',
            '벅찬 일에 매달리면 만성 피로가 오니, 쉬는 시간을 반드시 만드세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_신_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '결실의 기회가 눈앞에 있지만, 한 번에 다 잡으려 하면 벅찹니다 — 나누어 다루세요',
            '섬세하게 다듬는 일(기획, 분석, 편집, 품질 관리)에 집중하면 큰 결과로 이어집니다',
            '욕심이 커지면 실수가 생기니, 확실한 것부터 하나씩 잡으세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_신_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '매력적인 상대가 다가오지만, 너무 큰 기대를 품으면 실망하기 쉽습니다',
            '조건이나 겉모습에 현혹되지 말고, 사람 됨을 섬세하게 살피세요',
            '천천히 깊이 만나는 것이 안정적인 인연으로 이어집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_신_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '재물의 기회는 있지만, 무리하게 벌려 하면 잃습니다 — 내 힘의 한계를 아세요',
            '섬세하게 다듬은 결과물에서 안정적 수익이 나옵니다',
            '큰 투자보다 확실한 소득에 집중하고, 거둔 것의 일부는 반드시 저축하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_신_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '섬세한 직관으로 사람을 잘 파악하지만, 너무 날카로우면 거리감이 생깁니다',
            '판단은 속에 두고, 겉으로는 너그럽게 대하세요',
            '실속 있는 소수의 인맥이 넓은 인맥보다 유리합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_신_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '섬세한 분석력이 빛나는 시기 — 편집, 데이터 분석, 품질 관리 등 정밀한 기술에 투자하세요',
            '욕심을 줄이고 한 가지를 깊이 다듬으면 큰 전문성이 됩니다',
            '배운 것을 실전에 적용하되, 무리하지 말고 조금씩 완성하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_신_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '한 번에 큰 것을 잡으려 하지 말고 조금씩 섬세하게 다루세요 — 벅차면 촛불이 꺼집니다',
            '내 힘의 한계를 아는 것이 지혜입니다 — 확실한 것부터 챙기세요',
            '거둔 재물의 일부는 반드시 저축에 묻어두세요',
          ],
          closing: '이렇게 하시면 작은 촛불의 섬세함으로 큰 쇠를 정밀하게 다듬어 결실로 만들 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 20. 정_유 — 가을, 촛불이 섬세한 쇠를 정밀하게 다듬음 (극)
    //     촛불이 늦가을에 비친 — 섬세한 쇠를 정밀하게 다듬는 결실의 시기
    // ================================================================
    {
      month_pattern_id: '정_유', day_master: '정', month_branch: '유',
      season: '가을',
      element_interaction: '촛불이 섬세한 쇠를 정밀하게 다듬음 (극)',
      label: '촛불이 늦가을에 비친 — 섬세한 쇠를 정밀하게 다듬는 결실의 시기',
      modules: [
        { module_id: '정_유_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '작은 촛불이 섬세한 바늘을 다듬듯 — 정화의 집중력과 유금의 섬세함이 가장 잘 맞아떨어지는 시기입니다',
            '촛불의 크기에 딱 맞는 결과물을 만드는 성품 — 정밀하고 안정적인 결실이 있습니다',
            '완벽을 추구하는 집중력이 빛나지만, 너무 깐깐해지면 스스로를 갉아먹습니다',
            '적당한 타협과 속도의 균형이 이 시기의 열쇠입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_유_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '가을의 건조함이 피부와 호흡기를 말립니다 — 보습과 따뜻한 물을 자주 드세요',
            '섬세한 집중이 눈과 신경을 피로하게 합니다 — 눈 휴식과 명상으로 심신을 푸세요',
            '완벽주의 스트레스가 소화기를 약하게 하니, 식사 시간을 규칙적으로 하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_유_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '정밀한 작업, 품질 관리, 디자인, 데이터 분석, 재무, 편집 등 섬세함이 빛나는 일에 가장 유리합니다',
            '안정적이고 꾸준한 성과가 인정받는 시기 — 품질로 신뢰를 쌓으세요',
            '큰 도약보다 확실한 완성으로 승부하면 주변에서 확실한 평가를 받습니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_유_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '깔끔하고 섬세한 매력으로 안정적인 인연이 다가옵니다',
            '기준이 높아 만남을 놓치기 쉬우니, 완벽을 구하지 말고 마음이 가는 사람에게 열려 있으세요',
            '천천히 깊어지는 관계가 가장 안정적인 결실로 이어집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_유_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '안정적이고 꾸준한 재물이 들어오는 시기 — 섬세한 관리로 재물이 차곡차곡 쌓입니다',
            '큰 수익을 노리지 말고, 현재 수입 안에서 저축의 비율을 높이세요',
            '정밀한 기술과 결과물이 장기적으로 큰 자산이 됩니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_유_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '섬세하고 배려 깊은 성품으로 신뢰를 쌓습니다',
            '깐깐함이 지나치면 거리감이 생기니, 너그러움을 의식적으로 연습하세요',
            '소수와 깊이 교류할수록 안정적인 관계가 됩니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_유_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '집중력과 섬세함이 최고조 — 정밀한 기술, 언어, 자격증에 투자하세요',
            '배운 것을 정성으로 다듬어 완성품으로 만드는 능력이 빛납니다',
            '완벽주의에 빠지지 말고, 적당한 타협으로 속도를 내는 연습도 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_유_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '섬세한 집중력을 살려 한 가지를 정밀하게 완성하세요 — 품질이 곧 경쟁력입니다',
            '완벽주의에 빠지지 말고 적당한 타협으로 속도를 내세요',
            '안정적으로 들어오는 재물을 꼼꼼히 관리하고 저축하세요',
          ],
          closing: '이렇게 하시면 촛불과 바늘이 만나 가장 정밀하고 아름다운 결실을 빚어 낼 수 있습니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 21. 정_술 — 가을→겨울, 흙 속에서 촛불이 갱신을 준비함
    //     촛불이 늦가을 흙에 스민 — 저장과 갱신으로 내면을 채우는 시기
    // ================================================================
    {
      month_pattern_id: '정_술', day_master: '정', month_branch: '술',
      season: '가을',
      element_interaction: '흙 속에서 촛불이 갱신을 준비함',
      label: '촛불이 늦가을 흙에 스민 — 저장과 갱신으로 내면을 채우는 시기',
      modules: [
        { module_id: '정_술_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '늦가을의 흙 속으로 촛불이 스며들 듯 — 밖의 빛을 거두어 안을 채우는 갱신의 시기입니다',
            '술토(건조한 흙)는 촛불을 보호하며 저장하는 땅 — 섬세한 빛을 흙 속 씨앗처럼 키웁니다',
            '밖으로 드러내기보다 안을 가꾸고 정비하는 데 의미를 두는 성품입니다',
            '흩어진 것을 모아 하나로 만드는 차분한 시기입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_술_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '가을의 건조함이 피부와 호흡기를 말립니다 — 보습과 따뜻한 음식으로 건조증을 예방하세요',
            '에너지를 거두는 시기이니 무리한 운동보다 가벼운 산책과 휴식이 좋습니다',
            '위장이 건조해지기 쉬우니, 따뜻하고 부드러운 식사로 소화기를 돌보세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_술_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '성과를 정리하고 다음 단계를 준비하는 시기 — 갱신과 재정비에 유리합니다',
            '저장과 정리의 기운이 있어 기록, 관리, 보관, 자산 운용 관련 일에 강합니다',
            '새로 벌이기보다 있는 것을 점검하고 다듬는 데 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_술_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '겉으로 드러내기보다 속으로 깊어지는 관계가 좋은 시기입니다',
            '서로의 내면을 나누는 시간이 관계의 깊이를 더합니다',
            '느리지만 진지한 인연이 이 시기에 자라납니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_술_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '저장과 축적의 시기 — 들어온 재물을 묻어두고 키우는 데 유리합니다',
            '새로 벌기보다 있는 것을 굳히고 관리하는 것이 우선입니다',
            '장기 투자와 저축에 유리하니, 단기 수익에 현혹되지 마세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_술_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '차분하고 진중한 태도로 깊은 신뢰를 쌓는 성품입니다',
            '겉도는 인맥보다 소수와 깊이 교류할수록 유리합니다',
            '침묵이 길어지면 오해가 생기니, 속마음을 적절히 표현하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_술_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '경험과 지식을 정리하여 내면의 자산으로 만드는 시기입니다',
            '기록, 정리, 회고의 습관이 흩어진 것을 하나로 모아줍니다',
            '조용히 배우고 쌓는 시기 — 드러내지 않아도 쌓이는 것이 큽니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_술_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '밖으로 쏟던 에너지를 거두어 들이세요 — 안을 채우고 정비하는 시기입니다',
            '경험과 지식을 정리하여 저장하세요 — 기록이 큰 자산이 됩니다',
            '재물은 묻어두고 키우세요 — 단기 수익보다 장기 축적이 유리합니다',
          ],
          closing: '이렇게 하시면 흙 속에 스민 촛불이 다음 봄을 위한 따뜻한 씨앗이 됩니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 22. 정_해 — 겨울, 큰 물이 촛불을 끄려 위태로움 (극)
    //     촛불이 겨울 바다 앞에 선 — 큰 물의 압박 속에서 길을 찾는 시기
    // ================================================================
    {
      month_pattern_id: '정_해', day_master: '정', month_branch: '해',
      season: '겨울',
      element_interaction: '큰 물이 촛불을 끄려 위태로움 (극)',
      label: '촛불이 겨울 바다 앞에 선 — 큰 물의 압박 속에서 길을 찾는 시기',
      modules: [
        { module_id: '정_해_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '거대한 바다 앞의 작은 촛불 — 가장 위태롭지만, 가장 깊은 인내와 지혜를 배우는 시기입니다',
            '해수(큰 물) 속에는 나무(甲)의 기운이 숨어 있어, 시련 속에서도 살 길이 열립니다',
            '거센 물결에 흔들리는 촛불을 바람막이로 지키듯, 마음의 중심을 꿋꿋이 잡아야 합니다',
            '위태로움 속에서 배우는 섬세함과 유연함이 훗날 큰 빛이 됩니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_해_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '겨울의 차가운 기운이 심장과 신경을 위축시킵니다 — 따뜻한 음식과 온수 목욕으로 몸을 데우세요',
            '스트레스와 긴장이 신경을 예민하게 하니, 명상과 충분한 수면이 필수입니다',
            '차가운 날씨에 감기와 관절 통증이 오기 쉬우니, 실내에서 따뜻하게 몸을 풀어주세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_해_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '강한 압력과 위태로움이 따라붙는 시기 — 인내와 유연함으로 버텨야 합니다',
            '거센 흐름에 맞서기보다 흐름을 피해 조용히 길을 찾는 것이 유리합니다',
            '위기를 넘기며 쌓는 경험이 훗날 가장 큰 자산이 됩니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_해_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '거센 감정의 흐름에 흔들리기 쉬운 시기 — 감정에만 의존하면 관계가 위태롭습니다',
            '서로의 차이를 인정하고, 천천히 신뢰를 쌓는 것이 필요합니다',
            '위태로움을 함께 넘긴 인연이 가장 깊고 단단해집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_해_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '재물이 흔들리고 빠져나가기 쉬운 시기 — 지키는 것이 벌기보다 중요합니다',
            '큰 투자와 무리한 지출은 피하고, 비상금을 반드시 확보하세요',
            '안전한 자산(예금, 보험)에 우선순위를 두세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_해_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '위태로움 속에서 진짜 인연이 구분되는 시기입니다',
            '어려울 때 곁을 지키는 사람을 소중히 하세요',
            '막 나가는 사람보다 차분하게 조언해 주는 섬세한 사람이 진짜 도움입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_해_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '위태로움이 가장 큰 스승인 시기 — 인내와 유연함을 깊이 배웁니다',
            '명상, 기록, 독서로 마음의 중심을 잡는 훈련이 빛을 지켜줍니다',
            '남과 비교하지 말고, 자기 리듬과 섬세함을 잃지 마세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_해_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '거센 압박 속에서 마음의 중심을 꿋꿋이 잡으세요 — 바람막이로 촛불을 지키듯',
            '재물은 무조건 지키는 것을 우선으로 하세요 — 비상금을 확보하십시오',
            '위태로움 속에서 배우는 인내와 유연함을 무기로 삼으세요',
          ],
          closing: '이렇게 하시면 바다 앞의 작은 촛불이 꺼지지 않고, 가장 깊고 따뜻한 빛이 됩니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 23. 정_자 — 겨울, 물이 촛불을 끄려 위태로움 — 작은 빛을 지켜야 (극)
    //     촛불이 한겨울 한밤에 켜진 — 어둠 속에서 작은 빛을 지키는 인내의 시기
    // ================================================================
    {
      month_pattern_id: '정_자', day_master: '정', month_branch: '자',
      season: '겨울',
      element_interaction: '물이 촛불을 끄려 위태로움 — 작은 빛을 지켜야 (극)',
      label: '촛불이 한겨울 한밤에 켜진 — 어둠 속에서 작은 빛을 지키는 인내의 시기',
      modules: [
        { module_id: '정_자_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '한겨울 한밤의 촛불 — 가장 어둡고 추운 시기에 가장 작고 의미 있는 빛을 지키는 성품입니다',
            '자수(섬세하고 차가운 물)는 촛불에게 가장 위태로운 환경 — 절제와 인내가 곧 생명입니다',
            '작은 빛 하나가 어둠을 얼마나 밝히는지 아는 사람 — 깊은 연민과 따뜻함을 품습니다',
            '추위 속에서 인내로 빛을 지키면, 봄이 올 때 그 빛이 가장 소중해집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_자_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '한겨울의 차가움이 심장·신장·혈액순환을 위축시킵니다 — 따뜻한 음식과 옷으로 체온을 지키세요',
            '신경이 극도로 예민해질 수 있으니, 충분한 수면과 따뜻한 휴식이 필수입니다',
            '실내에서 따뜻하게 몸을 풀고(요가, 스트레칭) 혈액순환을 돌보세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_자_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '규율과 절제가 중요한 시기 — 묵묵히 책임을 다하면 깊은 신뢰를 받습니다',
            '큰 도약보다 꾸준함으로 자리를 지키는 것이 유리합니다',
            '혼자서 섬세하게 하는 일(연구, 기획, 관리, 분석)이 눈에 띄지 않아도 큰 결실로 이어집니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_자_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '차분하고 진지한 인연이 좋은 시기 — 화려함보다 신뢰와 책임이 중요합니다',
            '감정을 속에 담아두면 오해가 생기니, 따뜻한 말 한마디라도 표현하세요',
            '추운 시기이니 작은 온기가 관계를 살립니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_자_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '재물이 조용히 들어오고 조용히 나가는 시기 — 꼼꼼한 관리가 필수입니다',
            '절약과 저축이 자연스러운 시기이니, 이 습관을 살려 자산을 키우세요',
            '무리한 투자는 피하고 안전한 자산에 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_자_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '말수가 적고 진중한 성품 — 깊은 신뢰를 천천히 쌓습니다',
            '차가워 보이기 쉬우니, 의식적으로 따뜻하게 대하는 연습이 필요합니다',
            '소수의 깊은 인연이 넓은 인맥보다 훨씬 소중한 시기입니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_자_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '조용히 집중하여 깊이 파고드는 데 가장 유리한 시기 — 독서, 연구, 학습에 투자하세요',
            '절제와 규칙의 생활이 섬세한 통찰을 낳습니다',
            '겨울이 지난 뒤의 봄을 위해 씨앗을 심는 마음으로 배우세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_자_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '어둠 속에서 작은 빛을 꺼뜨리지 마세요 — 절제와 인내가 곧 생명입니다',
            '차가워 보이지 않도록 의식적으로 따뜻하게 대하는 연습을 하세요',
            '조용히 집중하여 깊이 배우고 쌓으세요 — 봄을 위한 씨앗입니다',
          ],
          closing: '이렇게 하시면 한밤의 작은 촛불이 봄이 올 때 가장 따뜻하고 밝은 빛이 됩니다.', tone: 'natural', review_status: 'approved' },
      ],
    },

    // ================================================================
    // 24. 정_축 — 겨울→봄, 차가운 흙이 촛불의 온기를 빨아들임
    //     촛불이 겨울 끝 얼어붙은 흙에 닿은 — 조금씩 온기를 나누며 봄을 기다리는 시기
    // ================================================================
    {
      month_pattern_id: '정_축', day_master: '정', month_branch: '축',
      season: '겨울',
      element_interaction: '차가운 흙이 촛불의 온기를 빨아들임',
      label: '촛불이 겨울 끝 얼어붙은 흙에 닿은 — 조금씩 온기를 나누며 봄을 기다리는 시기',
      modules: [
        { module_id: '정_축_mindset', domain_key: 'mindset', domain_label: '마음가짐', domain_index: 1,
          points: [
            '얼어붙은 흙에 닿은 작은 촛불 — 온기를 나눠주어도 흙이 빨아들여 쉽게 데워지지 않는 시기입니다',
            '축토(차갑고 얼어붙은 흙)는 인내와 기다림의 땅 — 조급해하면 안 되는 성품입니다',
            '작은 촛불이 얼어붙은 흙을 조금씩 녹이듯, 끈기 있게 조금씩 변화를 만들어 가야 합니다',
            '봄이 오기 전 마지막 추위를 묵묵히 견디는 시기 — 서두르지 말고 기초를 다지세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_축_health', domain_key: 'health', domain_label: '건강', domain_index: 2,
          points: [
            '차가운 기운이 위장과 관절을 굳게 합니다 — 따뜻한 음식(국, 죽, 탕)으로 소화기를 돌보세요',
            '에너지가 빨려나가는 듯한 피로가 올 수 있으니, 무리하지 말고 리듬을 천천히 유지하세요',
            '신경이 예민해지기 쉬우니, 따뜻한 휴식과 충분한 수면이 필요합니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_축_career', domain_key: 'career', domain_label: '일과 직업', domain_index: 3,
          points: [
            '보이지 않게 기초를 다지는 시기 — 당장의 성과는 더디어도 쌓이는 것이 단단합니다',
            '관리, 정비, 돌봄, 행정 등 꼼꼼함과 인내가 필요한 일에 강합니다',
            '급하게 바꾸기보다 현재 자리에서 기초를 튼튼히 하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_축_romance', domain_key: 'romance', domain_label: '애정운', domain_index: 4,
          points: [
            '천천히 깊어지는 관계가 좋은 시기 — 조급하게 다가가면 상대가 닫힙니다',
            '따뜻한 온기를 조금씩 나누되, 상대가 받아들일 때까지 기다려 주세요',
            '인내 속에서 싹트는 인연이 가장 오래갑니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_축_wealth', domain_key: 'wealth', domain_label: '재물', domain_index: 5,
          points: [
            '재물이 천천히 들어오는 시기 — 큰 수익보다 꾸준한 저축이 유리합니다',
            '축토의 저장 기운이 있어 묻어둔 재물이 잘 자라납니다',
            '조급한 투자는 피하고, 시간을 두고 쌓는 것에 집중하세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_축_relationships', domain_key: 'relationships', domain_label: '인간관계', domain_index: 6,
          points: [
            '말수가 적고 참을성 있는 성품 — 깊은 신뢰를 천천히 쌓습니다',
            '너무 닫혀 있으면 고립되니, 가까운 사람에게 마음을 조금씩 여세요',
            '인내심이 길어질수록 진짜 인연이 남습니다',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_축_growth', domain_key: 'growth', domain_label: '성장과 학습', domain_index: 7,
          points: [
            '느리지만 깊이 쌓이는 시기 — 기초를 튼튼히 다지는 학습에 가장 좋습니다',
            '조급해하지 말고 하나씩 확실히 익히세요 — 축토에 심은 것은 봄에 크게 자라납니다',
            '혼자만의 시간을 활용해 뿌리를 깊이 내리세요',
          ],
          closing: null, tone: 'natural', review_status: 'approved' },
        { module_id: '정_축_must_do', domain_key: 'must_do', domain_label: '이 월지 출생의 핵심 과제', domain_index: 8,
          points: [
            '조급해하지 말고 기초를 튼튼히 다지세요 — 축토에 심은 것은 봄에 크게 자라납니다',
            '인내를 인생의 무기로 삼으세요 — 기다릴 줄 아는 사람이 가장 멀리 갑니다',
            '너무 닫혀 있지 않게 가까운 사람에게 마음을 조금씩 여세요',
          ],
          closing: '이렇게 하시면 겨울 끝의 작은 촛불이 봄이 올 때 가장 따뜻한 온기로 피어납니다.', tone: 'natural', review_status: 'approved' },
      ],
    },
  ],
});
