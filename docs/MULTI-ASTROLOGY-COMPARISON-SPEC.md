# 사주·호라삿·뜨비·마하보테 통합 비교 명세

> 문서 상태: Draft v1.0
> 작성일: 2026-08-23
> 대상 제품: `_saju-app`의 개인용 다전통 점성술 확장
> 구현 기준: 기존 바닐라 HTML/CSS/JavaScript 구조와 `DESIGN.md`, `DESIGN-SYSTEM.md`를 유지한다.
> 현재 상태: 한국 사주만 구현된 기준선이다. 태국 호라삿, 베트남 Tử Vi, 미얀마 Mahabote 엔진과 4체계 비교 기능은 아직 구현되지 않았다.

이 문서는 한 사람의 출생 정보를 한 번 입력해 한국 사주, 태국 호라삿, 베트남 Tử Vi, 미얀마 마하보테를 각각 계산하고, 서로 같은 말과 다른 말과 한 체계만 말하는 내용을 비교하는 제품을 구현하기 위한 계약이다.

이 문서에서 `해야 한다`는 필수 요구사항, `권장한다`는 기본 구현안, `할 수 있다`는 선택 요구사항을 뜻한다.

---

## 1. 구현자가 먼저 알아야 할 결론

### 1.1 제품 한 문장

> 한 번 입력하고 네 전통으로 본 뒤, 공통점·차이점·고유 관점을 근거와 함께 읽는다.

### 1.2 핵심 차별점

이 제품은 네 종류의 운세 메뉴를 한 사이트에 나열하는 서비스가 아니다. 아래 순서가 하나의 제품 경험이어야 한다.

1. 한 번의 출생 프로필 입력
2. 체계별 계산 가능 여부 확인
3. 독립된 네 계산 엔진 실행
4. 체계별 원본 결과 보존
5. 공통점, 차이점, 고유 관점으로 비교
6. 근거가 된 체계별 사실과 계산 정책으로 되돌아가기

### 1.3 변경하지 않는 현재 기준선

- 현재 한국 사주 엔진과 `KR-CIVIL-1.0` 정책은 구현된 기준선으로 취급한다.
- 기존 개인 사주 및 커플 사주 사용자 흐름은 새 비교 기능 때문에 깨지면 안 된다.
- 커플 사주는 4체계 비교 v1의 범위가 아니다. 비교 v1은 한 사람의 네 체계를 비교한다.
- 기존 사주 결과를 새 공통 결과 봉투에 넣을 때에는 어댑터를 사용한다. 기존 계산 사실을 새 비교 로직에 맞춰 다시 계산하거나 덮어쓰지 않는다.

### 1.4 아직 구현으로 간주하면 안 되는 것

- 호라삿 엔진
- Tử Vi 엔진
- Mahabote 엔진
- 네 체계 비교 프로젝터
- 해외 출생지 및 과거 시각대 해석
- 다전통 결과 저장·공유·유료화

세 신규 엔진은 각각 승인된 계산 정책, 사용 가능한 출처, 독립 오라클, 경계값 픽스처가 준비되기 전까지 `draft` 상태여야 한다. `draft` 엔진이 실제 결과처럼 보이는 임시 문구를 반환해서는 안 된다.

---

## 2. 참고 제품과 참고 범위

조사 기준일은 2026-08-23이다. 아래 자료는 제품 흐름과 표현 방식을 참고하기 위한 것이며, 점성술 계산의 권위 자료가 아니다.

| 참고 제품 | 관찰한 제품 패턴 | 이 제품에 채택할 부분 | 채택하지 않을 부분 |
| --- | --- | --- | --- |
| [Horasat](https://horasat.kr/) | 태국 점성술, Tử Vi, Mahabote를 각각 진입해 결과를 읽는 한국어 서비스 | 한국어 용어 난이도, 체계별 상세 결과의 깊이, 입력에서 결과로 바로 이어지는 흐름 | 해당 사이트의 계산식을 검증 없이 복제하거나 계산 권위로 인용하는 것 |
| [Co-Star](https://apps.apple.com/us/app/co-star-personalized-astrology/id1264782561) | 개인 차트, 일상적 재방문, 사람 간 비교, 상세 유료 리포트를 한 구조에 연결 | 첫 개인 결과 뒤 비교와 공유로 확장하는 순서, 핵심 차트와 상세 읽기의 분리 | 흑백 시각물을 그대로 복제하는 것, 불투명한 점수화 |
| [CHANI](https://apps.apple.com/us/app/chani-your-astrology-guide/id1532791252) | 오늘의 짧은 진입점과 깊은 읽기·오디오·저널 콘텐츠를 함께 제공 | 무료 첫 가치 후 깊은 콘텐츠로 이어지는 계층, 부담이 작은 재방문 진입점 | 콘텐츠 양으로 계산 근거를 가리는 것 |
| [Finch](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748) | 짧은 체크인, 작은 행동, 기록과 보상으로 재방문 습관을 형성 | 결과를 읽고 끝내지 않고 한 줄 성찰과 기록으로 이어지는 짧은 루프 | 점술 결과를 행동 강제나 게임 보상으로 취급하는 것 |

적용 원칙은 다음과 같다.

- 첫 화면에는 여러 메뉴보다 하나의 강한 개인화 시작점을 둔다.
- 첫 결과에서 핵심 내용을 먼저 제공하고, 상세 차트와 계산 근거는 단계적으로 펼친다.
- 비교와 공유는 개인 결과를 본 다음에 제안한다.
- 결제는 무료 핵심 결과를 확인한 다음에만 제안한다.
- 유료 여부와 관계없이 계산 정책, 데이터 삭제, 안전 고지는 가리지 않는다.
- 참고 제품의 화면, 문구, 이미지, 아이콘을 복제하지 않는다.

### 2.1 계산 권위와 제품 참고의 분리

`horasat.kr`을 포함한 상용 서비스의 출력은 탐색용 교차 확인 자료가 될 수 있지만 단독 오라클이 될 수 없다. 신규 엔진을 활성화하려면 18장의 출처·오라클 게이트를 별도로 통과해야 한다.

---

## 3. 제품 목표와 비목표

### 3.1 P0 목표

- 사용자가 출생 프로필을 한 번 입력한다.
- 현재 입력으로 어떤 체계를 계산할 수 있는지 실행 전에 알 수 있다.
- 활성화된 체계만 독립적으로 계산한다.
- 한 엔진이 실패해도 다른 엔진 결과는 보존한다.
- 완료된 체계가 둘 이상이면 공통점·차이점·고유 관점을 만든다.
- 모든 비교 문장에서 원래 체계별 근거로 이동할 수 있다.
- 정확한 출생 시각을 모르는 사용자는 가능한 체계만 계산하고, 불가능한 체계의 이유를 이해할 수 있다.
- 결과 저장은 명시적 동의 후에만 한다.
- 공유물은 기본적으로 출생일, 출생시각, 출생지, 좌표를 포함하지 않는다.

### 3.2 P1 목표

- 체계별 심화 장과 시기별 읽기
- 결과를 바탕으로 한 개인 저널
- 사용자가 선택한 관심 주제 중심의 비교 재정렬
- 여러 기기 간 암호화 동기화
- 근거가 잠긴 유료 심화 리포트

### 3.3 P2 후보

- 두 사람의 다전통 관계 비교
- 오늘·이번 달의 짧은 재방문 카드
- 오디오 읽기
- 전문가 검토가 포함된 유료 상담 연결

### 3.4 비목표

- 네 체계 중 가장 정확한 체계를 고르는 것
- 체계별 정확도, 신뢰도, 적중률 점수를 만드는 것
- 서로 다른 전통을 하나의 혼합 계산식으로 합치는 것
- 생성형 AI가 출생 차트나 핵심 사실을 계산하게 하는 것
- 건강, 법률, 금융, 임신, 수명, 사고를 확정적으로 예측하는 것
- 불안을 유도해 결제를 압박하는 것
- 출처 승인이 끝나지 않은 계산 결과를 베타 문구라는 이유로 사용자에게 사실처럼 노출하는 것

---

## 4. 체계 식별자와 상태 계약

화면의 번역 명칭과 저장 식별자를 분리한다. 저장 식별자는 출시 후 변경하지 않는다.

| `systemId` | 한국어 표시명 | 보조 표기 | 초기 상태 | v1 역할 |
| --- | --- | --- | --- | --- |
| `saju` | 한국 사주 | Four Pillars | `active` | 기존 구현 기준선 |
| `horasat` | 태국 호라삿 | Thai Horasat | `draft` | 출처·오라클 승인 후 활성화 |
| `tu-vi` | 베트남 뜨비 | Tử Vi Đẩu Số | `draft` | 출처·오라클 승인 후 활성화 |
| `mahabote` | 미얀마 마하보테 | Mahabote | `draft` | 출처·오라클 승인 후 활성화 |

### 4.1 정책 식별자

초기 식별자 형식은 다음과 같다.

```text
{COUNTRY}-{SYSTEM}-{POLICY_MAJOR}.{POLICY_MINOR}
```

예시는 다음과 같다.

```text
KR-CIVIL-1.0 @ 1.0.0
TH-HORASAT-1.0 @ 0.1.0-draft.1
VN-TUVI-1.0 @ 0.1.0-draft.1
MM-MAHABOTE-1.0 @ 0.1.0-draft.1
```

정책 가족 ID와 정책 버전을 분리한다. 초안 버전은 저장된 실제 결과의 `policyVersion`으로 사용할 수 없으며, `active`가 된 정확한 버전만 계산에 사용한다. 학교나 핵심 규칙 범위가 달라지면 기존 ID를 조용히 바꾸지 말고 별도 정책 가족을 만든다.

### 4.2 정책 상태

```text
draft -> source-locked -> fixture-locked -> implemented -> verified -> active -> deprecated
```

- `draft`: 규칙의 범위나 출처가 확정되지 않았다.
- `source-locked`: 한 학교와 규범 출처·라이선스·규칙 결정이 잠겼다.
- `fixture-locked`: 독립 기대값과 경계 픽스처가 승인됐다.
- `implemented`: 결정론 엔진과 결과 검증기가 구현됐다. 아직 사용자 계산에는 쓸 수 없다.
- `verified`: 필수 테스트, 독립 검토, 브라우저/서버 또는 로컬/검증기 동등성이 통과했다.
- `active`: 사용자 계산에 사용할 수 있다.
- `deprecated`: 과거 결과 재현에만 남기고 신규 계산에는 사용하지 않는다.

상태를 건너뛸 수 없다. 클라이언트는 서버나 로컬 레지스트리가 반환한 `active` 정책만 계산 버튼에 연결해야 한다.

### 4.3 결과 불변성

저장된 결과는 다음 버전 집합으로 재현 가능해야 한다.

- `policyId`
- `engineVersion`
- `factSchemaVersion`
- `interpretationVersion`
- `comparisonVersion`
- `sourceSetVersion`
- `calendarDataVersion`
- `timezoneDataVersion`

새 버전이 나와도 과거 결과를 조용히 다시 계산해 덮어쓰지 않는다. 사용자가 새 버전으로 다시 계산하면 별도 결과를 만들고 변경점을 알려야 한다.

---

## 5. 출시 범위

### 5.1 4체계 비교 v1에 포함

- 개인 한 명의 출생 프로필
- 한국어 UI 및 한국어 해석
- 네 체계의 계산 가능 여부 미리보기
- 활성 체계의 독립 계산
- 체계별 핵심 결과와 상세 결과
- 공통점, 차이점, 고유 관점 비교
- 계산 방법 및 근거 보기
- 로컬 기록 저장, 내보내기, 삭제
- 개인정보를 제거한 결과 카드 공유
- 부분 성공 및 재시도

### 5.2 v1에서 제외

- 커플의 네 체계 동시 비교
- 소셜 피드와 공개 프로필
- 사용자가 만든 해석을 다른 사용자에게 판매하는 기능
- 미성년자 대상 맞춤 결제 유도
- 자동 상담 예약
- 점술가 마켓플레이스
- 사용자가 직접 정책 공식을 바꾸는 기능
- 계산 출처가 다른 결과를 하나의 동일한 정책처럼 병합하는 기능

---

## 6. 정보 구조

바닐라 애플리케이션은 해시 라우팅 또는 동일한 상태 전환으로 아래 논리 경로를 제공한다. 현재 라우터가 없다면 URL은 강제가 아니지만 화면 식별자는 유지해야 한다.

| 화면 ID | 권장 경로 | 목적 |
| --- | --- | --- |
| `comparison-home` | `#/compare` | 제품 약속과 시작 CTA |
| `birth-profile` | `#/compare/profile` | 공통 입력과 점진적 추가 입력 |
| `profile-review` | `#/compare/review` | 변환·위치·체계별 자격 확인 |
| `bundle-progress` | `#/compare/calculate/:bundleId` | 체계별 계산 상태 |
| `comparison-overview` | `#/compare/result/:bundleId` | 공통점·차이점·고유 관점 |
| `system-detail` | `#/compare/result/:bundleId/:systemId` | 체계별 원본 결과와 근거 |
| `comparison-share` | `#/compare/result/:bundleId/share` | 비식별 공유 카드 만들기 |
| `records` | 기존 기록 경로 | 저장된 개인·비교 결과 관리 |
| `data-controls` | 기존 데이터 경로 | 내보내기·삭제·동의 관리 |

### 6.1 전역 탐색

- 기존 하단 탐색은 유지한다.
- `개인 사주`, `커플 사주`와 별개로 `네 전통 비교` 진입점을 추가한다.
- 상세 화면의 뒤로 가기는 항상 비교 개요로 돌아간다.
- 계산 중 브라우저 뒤로 가기를 눌러도 입력 초안을 잃지 않는다.
- 공유 링크를 통해 들어온 사용자는 공유된 요약만 보고, 원 출생 프로필이나 비공개 상세 결과에 접근할 수 없다.

---

## 7. 전체 사용자 흐름

```text
비교 홈
  -> 출생 프로필 입력
  -> 체계별 필요한 정보가 부족하면 점진적으로 요청
  -> 입력 검토 및 계산 가능 여부 확인
  -> 가능한 체계 계산 시작
  -> 체계별 독립 성공/실패 표시
  -> 완료 체계가 2개 이상이면 비교 생성
  -> 비교 개요
       -> 체계별 상세
       -> 계산 근거
       -> 저장
       -> 비식별 공유
       -> 선택적 심화 리포트
```

### 7.1 첫 가치까지의 목표

- 홈에서 첫 입력 필드까지 1회 클릭 이내
- 필수 공통 입력을 마친 뒤 계산 가능 여부까지 1회 제출
- 계정 생성 없이 무료 핵심 결과 확인
- 저장이나 결제 동의는 핵심 결과 전 필수 조건이 아니어야 한다.

### 7.2 사용자 중단과 복귀

- 입력 초안은 같은 탭의 세션 저장소에만 임시 보관할 수 있다.
- 영구 저장 동의 전에는 브라우저를 닫은 뒤 초안을 자동 복원하지 않는다.
- 계산 중 새로고침하면 `bundleId`와 완료된 결과를 바탕으로 복구한다.
- 정책 또는 엔진 버전이 계산 도중 바뀌면 해당 번들을 완료하지 말고 `VERSION_CHANGED` 오류와 다시 계산 안내를 표시한다.

---

## 8. 출생 프로필 입력 계약

### 8.1 공통 입력

| 필드 | 필수 조건 | UI | 저장 규칙 |
| --- | --- | --- | --- |
| 출생일 | 모든 계산에 필수 | 날짜 입력 + 직접 타이핑 | ISO 지역 날짜와 원입력 보존 |
| 입력 달력 | 모든 계산에 필수 | 양력/지원되는 음력 선택 | 달력 종류와 윤달 여부 보존 |
| 출생시각 상태 | 모든 사용자에게 질문 | 정확히 앎/대략 앎/모름 | 상태와 시각을 분리 저장 |
| 출생시각 | 상태가 `exact` 또는 `approximate`일 때 | 시·분 입력 | 지역 민간시각으로 보존 |
| 출생지 | 위치가 필요한 활성 정책이 있을 때 | 검색 + 선택 | 표시명, 국가, 좌표, IANA 시각대 보존 |
| 전통 규칙 계산용 성별값 | 활성 정책이 요구할 때 | 설명 후 여성/남성/입력 안 함 | 성 정체성과 다른 계산 파라미터임을 명시 |
| 관심 주제 | 선택 | 일·돈·관계·몸과 마음·시기 | 계산에는 사용하지 않고 표시 순서에만 사용 |

### 8.2 시각 정확도

```text
exact       사용자가 분 단위 시각을 알고 있음
approximate 사용자가 대략적인 시각만 알고 있음
unknown     사용자가 시각을 모름
```

- `approximate`에는 오차 범위를 함께 받아야 한다. 기본 선택지는 `±30분`, `±1시간`, `시간대만 앎`이다.
- 엔진이 정확한 시각을 요구하면 `approximate`를 자동으로 `exact`처럼 사용해서는 안 된다.
- 정책이 허용하면 범위 계산을 통해 변하지 않는 사실과 변할 수 있는 사실을 분리할 수 있다. 정책에 범위 계산이 정의되지 않았다면 `needs_input`으로 처리한다.
- `unknown`일 때 임의의 정오나 자정을 넣어 계산하지 않는다.

### 8.3 달력 입력과 변환

- 사용자가 입력한 달력과 날짜는 원본 그대로 보존한다.
- 내부 공통 표현은 검증된 지역 민간 날짜·시각, IANA 시각대, UTC 순간이다.
- 한국 음력 변환을 베트남 달력 변환에 재사용하지 않는다.
- 각 체계가 요구하는 달력 변환은 해당 `policyId`의 버전된 변환기로 수행한다.
- 존재하지 않는 날짜, 윤달 모순, 지원 범위 밖의 날짜는 계산 전에 막는다.
- 변환된 날짜는 검토 화면에서 사용자에게 보여주되, 혼동을 막기 위해 어떤 체계가 어떤 날짜 표현을 쓰는지 함께 표시한다.

### 8.4 위치와 시각대

- 위치 선택 결과는 `countryCode`, `latitude`, `longitude`, `timezoneId`, `timezoneConfidence`를 포함한다.
- 표시 문자열만으로 위치를 계산하지 않는다.
- 과거의 일광절약시간과 시각대 규칙은 버전된 IANA 데이터로 해석한다.
- 경계 지역이나 동일 지명 후보가 여러 개인 경우 자동 첫 후보를 선택하지 않는다.
- 위치를 찾지 못하면 사용자가 지도 좌표를 직접 입력할 수 있게 하되, 좌표와 시각대를 각각 확인하게 한다.
- 현재 사주 정책이 한국 10자리 장소 코드만 지원하면 해당 한계를 자격 판정에 그대로 반영한다. 다른 체계의 세계 위치 지원과 혼동하지 않는다.

### 8.5 전통 규칙 계산용 성별값

일부 전통 정책이 이진 계산 파라미터를 요구할 수 있다. 이 값은 성 정체성 프로필이 아니다.

- UI 문구: `일부 전통의 순행·역행 같은 규칙에 쓰는 계산값입니다. 성 정체성을 묻는 항목과 다릅니다.`
- 사용자는 `입력 안 함`을 선택할 수 있다.
- 입력하지 않으면 해당 값을 필수로 하는 체계만 `needs_input`이 된다.
- 분석 이벤트에는 원값을 전송하지 않고 `provided: true|false`만 전송한다.

---

## 9. 체계별 입력 요구와 자격 판정

구체 요구사항은 활성 정책 레지스트리가 최종 결정한다. 아래 표는 UI와 도메인 계약의 최소 기준이다. 신규 계산식의 확정 선언이 아니다.

| 체계 | 최소 공통 요구 | 추가 가능 요구 | 시각을 모를 때 | 엔진 준비 상태 |
| --- | --- | --- | --- | --- |
| 사주 | 유효한 출생일과 달력 | 현재 정책이 요구하는 장소 코드, 시각 | 현재 정책이 허용하는 범위에서 부분 결과 | 구현 기준선 |
| 호라삿 | 유효한 출생일 | 정확한 시각, 좌표, IANA 시각대 | 활성 정책이 허용하지 않으면 계산 불가 | 미구현, 출처·오라클 게이트 |
| 뜨비 | 유효한 출생일 | 정책별 달력 변환, 시각 단위, 전통 계산용 성별값 | 활성 정책의 시간 미상 규칙이 없으면 계산 불가 | 미구현, 출처·오라클 게이트 |
| 마하보테 | 유효한 출생일 | 정책이 요일 세분에 시각을 요구할 수 있음 | 정책이 날짜만으로 허용하면 계산 가능 | 미구현, 출처·오라클 게이트 |

### 9.1 자격 상태

```text
eligible            모든 필수 입력과 활성 정책이 준비됨
partial             정책이 명시적으로 부분 계산을 허용함
needs_input         사용자 입력이 더 필요함
policy_unverified   정책이 아직 active가 아님
engine_unavailable  활성 정책은 있으나 엔진 번들을 사용할 수 없음
unsupported_range   날짜·지역·달력 등이 지원 범위 밖임
invalid_input       입력 자체가 유효하지 않음
```

### 9.2 판정 우선순위

한 체계에 여러 문제가 있으면 아래 우선순위로 대표 상태를 정하고, `reasons[]`에는 모든 원인을 담는다.

```text
invalid_input
-> unsupported_range
-> policy_unverified
-> engine_unavailable
-> needs_input
-> partial
-> eligible
```

계산 시작 후 실패는 자격 상태가 아니라 `CalculationRunState.failed`와 `CalculationErrorCode`로 기록한다.

### 9.3 실행 버튼 규칙

- `eligible` 또는 `partial`인 체계가 하나 이상이면 `가능한 체계로 결과 보기` 버튼을 활성화한다.
- `eligible` 또는 `partial`인 체계가 0개이면 버튼을 비활성화하고 가장 가까운 해결 행동을 보여준다.
- 사용자는 계산할 체계를 체크 해제할 수 있다.
- 선택하지 않은 체계는 `skipped-by-user`로 기록하고 실패로 세지 않는다.
- 비교는 완료된 체계가 2개 이상일 때만 만든다.
- 1개만 완료되면 체계별 결과는 보여주고 `비교하려면 한 체계가 더 필요해요`라고 안내한다.

### 9.4 자격 판정 의사코드

```js
function resolveEligibility(profile, descriptor) {
  if (!isValidCommonProfile(profile)) return invalidInputReasons(profile);
  if (descriptor.status !== 'active') return policyUnverified(descriptor);
  if (!isEngineAvailable(descriptor)) return engineUnavailable(descriptor);

  const rangeIssues = descriptor.validateSupportedRange(profile);
  if (rangeIssues.length > 0) return unsupportedRange(rangeIssues);

  const missing = descriptor.requiredInputs.filter(
    requirement => !requirement.isSatisfiedBy(profile)
  );
  if (missing.length > 0) return needsInput(missing);

  const precision = descriptor.resolvePrecision(profile);
  return precision === 'partial' ? partial(descriptor) : eligible(descriptor);
}
```

판정 로직에 체계별 특례를 `if (systemId === ...)` 형태로 흩뿌리지 않는다. 정책 기술자와 엔진 어댑터가 요구사항을 선언한다.

---

## 10. 화면별 UX 명세

### 10.1 비교 홈 `comparison-home`

#### 목적

사용자가 여러 메뉴를 공부하지 않아도 통합 비교의 가치를 이해하고 바로 시작한다.

#### 필수 구성

1. 제목: `한 번 입력하고, 네 전통으로 보세요`
2. 설명: `한국 사주·태국 호라삿·베트남 뜨비·미얀마 마하보테가 같은 삶을 어떻게 다르게 읽는지 비교합니다.`
3. 주 CTA: `네 전통 비교 시작`
4. 네 체계 짧은 소개
5. `어떻게 비교하나요?` 3단계 설명
6. 개인정보 처리 요약
7. 계산 정책과 한계 보기 링크

#### 상태

- 세 신규 엔진이 아직 비활성인 개발 환경에서는 일반 사용자에게 가짜 시작 CTA를 제공하지 않는다.
- 내부 기능 플래그 환경에서는 각 체계에 `준비 중`, `검증 중`, `사용 가능` 배지를 표시한다.
- 공개 4체계 출시에서는 네 체계가 모두 `active`여야 한다.

#### 반응형

- 모바일: 주 CTA가 첫 화면 높이 안에 보인다. 체계 소개는 세로 카드다.
- 데스크톱: 왼쪽에 제목과 CTA, 오른쪽에 네 체계가 하나의 원을 이루는 요약 시각물을 둔다.
- 장식 때문에 CTA와 설명의 읽기 순서가 바뀌면 안 된다.

### 10.2 출생 프로필 `birth-profile`

#### 목적

최소 공통 입력부터 받고, 선택한 활성 체계가 요구할 때만 추가 질문을 연다.

#### 단계

1. `언제 태어났나요?`: 달력, 날짜, 시각 상태, 시각
2. `어디에서 태어났나요?`: 검색, 후보 확인, 시각대
3. `전통 계산에 필요한 정보`: 활성 정책이 요구하는 추가 파라미터
4. `무엇을 먼저 보고 싶나요?`: 선택 관심 주제

#### 상시 표시

입력 하단에 `system-eligibility-strip`을 두고 네 체계 상태를 즉시 갱신한다.

```text
사주        계산 가능
호라삿      정확한 출생시각이 필요해요
뜨비        전통 계산용 값을 선택해 주세요
마하보테    계산 가능
```

#### 검증

- 필드를 떠날 때 로컬 형식 검증을 한다.
- 제출할 때 전체 자격 판정을 한다.
- 오류는 입력 바로 아래와 화면 상단 요약에 함께 표시한다.
- 오류가 있는 첫 필드로 포커스를 이동한다.
- 자동 보정 전에는 원래 입력과 변경 내용을 보여주고 사용자의 확인을 받는다.

### 10.3 입력 검토 `profile-review`

#### 목적

계산에 실제 사용될 날짜, 위치, 시각대와 체계별 상태를 사용자가 확인한다.

#### 필수 구성

- 원 입력 요약
- 해석된 지역 민간 날짜·시각
- 위치 표시명, 국가, 시각대
- 체계별 변환 요약
- 네 체계 자격 카드
- 부분 계산의 한계
- `수정`과 `가능한 체계 계산` 버튼

#### 문구 예시

```text
입력한 시각은 Asia/Seoul의 1990년 1월 1일 12:00으로 해석합니다.
체계마다 달력과 하루의 경계를 다르게 다룰 수 있습니다.
각 결과에는 사용한 정책 버전을 함께 남깁니다.
```

### 10.4 계산 진행 `bundle-progress`

#### 목적

한 체계의 지연이나 실패가 전체 실패처럼 느껴지지 않게 한다.

#### 체계별 상태

```text
not-requested -> checking-eligibility -> blocked | queued | skipped-by-user
queued -> loading-engine -> calculating -> verifying -> complete | partial | failed
queued | loading-engine | calculating | verifying -> cancelled
failed | cancelled -> queued  (새 attempt로 재시도)
complete | partial -> stale   (과거 결과는 읽을 수 있으나 새 비교에는 사용하지 않음)
```

#### 필수 동작

- 네 체계 행을 고정된 순서로 보여준다.
- 완료되는 즉시 해당 행에 `결과 준비됨`을 표시한다.
- 실패한 체계에는 오류 원인과 `이 체계만 다시 계산`을 제공한다.
- 완료된 결과를 실패 때문에 폐기하지 않는다.
- 둘 이상 완료되어 비교를 만들 수 있으면 나머지를 기다리는 동안 `완료된 결과 먼저 보기`를 허용한다.
- 계산 중단은 queued/running attempt에 취소 신호를 보내고 `cancelled`로 기록한다. 이미 검증 완료된 결과는 취소로 삭제하지 않으며, 결과 삭제에는 별도 동의가 필요하다.
- `complete` run은 `status: ready` 결과를, `partial` run은 `status: partial` 결과를 참조한다. run 상태와 결과 상태를 같은 필드로 재사용하지 않는다.

#### 접근성

- 진행 변화는 `aria-live="polite"` 영역에 체계별로 알린다.
- 무한 회전 애니메이션만으로 상태를 표시하지 않는다.
- `prefers-reduced-motion`이면 반복 움직임을 제거한다.

### 10.5 비교 개요 `comparison-overview`

#### 목적

차트 네 개를 먼저 공부하게 하지 않고, 네 전통이 같은 삶을 어디서 함께 보고 어디서 다르게 보는지 보여준다.

#### 위에서 아래 순서

1. 결과 제목과 계산 시점
2. 체계 완료 상태 스트립
3. 한 문장 비교 요약
4. 관심 주제 바로가기
5. `공통으로 보는 점`
6. `다르게 보는 점`
7. `이 체계만 보는 점`
8. 체계별 상세 진입 카드
9. 방법·한계·버전
10. 저장·공유·심화 읽기

#### 비교 카드 구조

```text
[분류 배지] [삶의 영역]
비교 제목
두세 문장의 쉬운 설명

사주 · 호라삿이 함께 말함
[각 체계에서 확인] [왜 이렇게 묶였나요?]
```

#### 빈 상태

- 완료 0개: 계산 오류 복구 화면
- 완료 1개: 해당 체계 결과만 표시하고 비교 미생성 안내
- 완료 2~3개: 부분 비교임을 상단과 각 카드에 표시
- 비교할 수 있는 정규화 주제가 없음: 원본 결과는 유지하고 `억지로 같은 뜻으로 묶지 않았어요`라고 설명

#### 금지

- `85% 일치`, `호라삿이 더 정확`, `4개 중 3개가 맞음` 같은 표현
- 체계별 순위
- 녹색은 좋음, 빨간색은 나쁨으로만 읽히는 표시
- 근거 없이 만들어진 종합 운세 한 문장

### 10.6 체계별 상세 `system-detail`

#### 공통 골격

1. 체계명, 정책 버전, 계산 완전성
2. 이 체계의 핵심 한 문장
3. 차트 또는 구조도
4. 삶의 영역별 해석
5. 시기 해석이 정책에 포함된 경우 그 장
6. 비교에 사용된 문장 표시
7. 계산 사실과 해석 근거
8. 방법·출처·한계

#### 체계별 최소 표현 계층

아래는 UI가 수용해야 할 결과 계층이며 계산식 확정 목록이 아니다.

- 사주: 네 기둥과 기존 사실, 기존 장별 해석, 정책 근거
- 호라삿: 활성 정책이 확정한 천체·별자리·하우스 등 핵심 사실, 차트, 장별 해석
- 뜨비: 활성 정책이 확정한 궁과 별 배치 등 핵심 사실, 판 구성, 장별 해석
- 마하보테: 활성 정책이 확정한 달력·요일·행성·하우스 등 핵심 사실, 구조도, 장별 해석

#### 근거 서랍

`왜 이런 해석인가요?`를 열면 다음을 보여준다.

- 사용자에게 읽기 쉬운 계산 사실
- 내부 `factId`
- 정책명과 버전
- 해석 규칙 버전
- 완전/부분 결과 여부
- 출처 집합 요약 링크

내부 수식 전체를 강제 공개할 필요는 없지만, 재현에 필요한 정책 식별자와 입력 해석은 숨기지 않는다.

### 10.7 공유 `comparison-share`

#### 기본 공유물

- 제품명
- 사용자가 선택한 비교 카드 1개
- 참여한 체계명
- `성찰과 오락을 위한 해석` 고지
- 서비스 링크

#### 기본 제외 정보

- 이름
- 출생일
- 출생시각
- 출생지와 좌표
- 전통 계산용 성별값
- 내부 결과 ID
- 상세 차트 원본
- 결제 상태

#### 사용자 선택

- 별칭 추가
- 체계별 작은 기호 표시
- 배경 테마 선택
- 하나의 상세 문장 추가

민감 정보 포함 옵션을 만들 경우 기본값은 항상 꺼짐이어야 하고, 공유 직전 전체 미리보기를 제공해야 한다.

### 10.8 기록과 데이터 관리

- 기존 기록 목록에서 `개인 사주`, `커플 사주`, `네 전통 비교`를 유형 배지로 구분한다.
- 비교 기록은 하나의 번들과 그 안의 불변 체계별 결과를 참조한다.
- 체계별 결과 하나만 삭제하면 해당 결과를 참조한 비교를 `부분 비교`로 다시 표시한다. 새 비교 내용을 자동 생성하지 않는다.
- `전체 삭제`는 프로필, 결과, 비교, 공유 토큰, 동기화 사본을 포함한다.
- 내보내기는 원 입력, 변환된 입력, 버전, 사실, 해석, 비교를 구조화된 JSON으로 제공한다.

---

## 11. 시각·상호작용 시스템

### 11.1 전체 방향

기존의 `조선의 저녁 달빛`, 한지, 먹빛 남색, 주홍 인장, 연속된 책장 같은 인상을 유지한다. 새 비교 기능의 확장 문장은 다음과 같다.

> 아시아의 네 밤하늘이 한 책상 위에서 서로 다른 언어로 같은 삶을 읽는다.

네 체계를 서로 다른 앱처럼 꾸미지 않는다. 공통 한지 표면과 타이포그래피 위에 체계별 작은 색과 기호만 부여한다.

### 11.2 체계별 의미 색

기존 디자인 토큰에 의미 별칭을 추가한다. 새 원시 hex 값을 컴포넌트에 직접 쓰지 않는다.

| 체계 | 권장 기존 토큰 계열 | 보조 구분 |
| --- | --- | --- |
| 사주 | vermilion | 인장형 사각 기호 |
| 호라삿 | gold/amber | 태양 궤도형 원 기호 |
| 뜨비 | jade | 궁판형 격자 기호 |
| 마하보테 | sky | 일곱 칸형 점 기호 |

색만으로 구분하지 않고 항상 체계명, 기호, 패턴 가운데 둘 이상을 같이 쓴다.

### 11.3 비교 의미 스타일

| 의미 | 라벨 | 형태 |
| --- | --- | --- |
| 공통 | `공통으로 보는 점` | 겹치는 고리 |
| 차이 | `다르게 보는 점` | 갈라지는 두 선 |
| 고유 | `이 체계만 보는 점` | 하나의 인장 |
| 부분 | `일부 체계만 계산됨` | 끊긴 테두리 |
| 근거 누락 | `비교에서 제외됨` | 점선과 설명 |

`좋음/나쁨`을 색으로 단정하지 않는다. 경고와 안전 메시지는 체계 색과 별개의 기존 상태 토큰을 쓴다.

### 11.4 신규 컴포넌트

| 컴포넌트 | 책임 | 필수 상태 |
| --- | --- | --- |
| `system-pill` | 체계명과 상태 표시 | active, draft, complete, partial, failed |
| `system-eligibility-strip` | 입력 중 네 체계 자격 요약 | 모든 자격 상태 |
| `input-requirement-card` | 추가 입력 이유와 행동 | missing, satisfied, optional |
| `bundle-progress-list` | 체계별 계산 진행 | queued부터 complete/failed까지 |
| `comparison-card` | 공통·차이·고유 내용 | default, expanded, evidence-open |
| `system-source-row` | 비교에 참여한 체계와 근거 링크 | complete, partial, unavailable |
| `evidence-drawer` | 사실·정책·버전 표시 | loading, ready, error |
| `system-detail-sheet` | 차트와 장별 해석 | complete, partial |
| `privacy-share-preview` | 공유 전 포함 정보 확인 | safe-default, custom |

### 11.5 레이아웃

- 기존 최대 폭 1180px을 유지한다.
- 비교 카드의 본문 최대 읽기 폭은 720px을 넘기지 않는다.
- 데스크톱 비교 개요는 본문 2/3, 체계 상태·바로가기 1/3의 고정 보조 열을 사용할 수 있다.
- 모바일은 모든 콘텐츠를 단일 열로 표시한다.
- 900px 아래에서는 보조 열을 본문 위의 상태 스트립으로 이동한다.
- 640px 아래에서는 표를 카드형 목록으로 바꾼다.
- 터치 대상은 최소 44×44px을 유지한다.

### 11.6 동작

- 카드 펼침은 150~220ms 범위의 단순 높이·불투명도 전환만 사용한다.
- 차트 자체가 장식적으로 회전하거나 자동 재생되지 않는다.
- 결과가 추가로 도착해도 사용자가 읽는 위치를 강제로 이동하지 않는다.
- 새 결과 도착은 상태 스트립과 라이브 영역으로 알리고 사용자가 눌러 반영한다.

---

## 12. 비교 의미론

### 12.1 기본 원칙

각 체계는 독립된 사실과 해석을 만든다. 비교기는 원본 사실을 섞어 새로운 점성술 사실을 만들지 않는다. 비교기는 승인된 정규화 규칙이 만든 `comparisonClaim`만 분류한다.

```text
출생 프로필
  -> 체계별 엔진
      -> 체계별 사실
          -> 체계별 결정론적 해석 규칙
              -> 정규화된 비교 주장
                  -> 비교 분류기
```

### 12.2 비교 영역

v1의 고정 영역은 다음 여섯 개다.

| `domainId` | 한국어 | 범위 |
| --- | --- | --- |
| `identity` | 나의 기질 | 성향, 동기, 강점, 주의 경향 |
| `work` | 일과 역할 | 일 방식, 책임, 협업, 성장 방식 |
| `resources` | 자원과 돈 | 소유·소비·축적에 대한 성찰적 경향 |
| `relationships` | 관계 | 친밀감, 소통, 경계, 상호작용 |
| `wellbeing` | 몸과 마음 | 생활 리듬과 자기 돌봄에 한정하며 진단 금지 |
| `timing` | 시기 | 각 정책이 지원하는 변화 시기와 주기 |

사용자에게는 쉬운 제목을 보여주지만 저장에는 고정 `domainId`를 사용한다.

### 12.3 주제 사전

`themeId`는 번역 문구가 아니라 버전된 의미 식별자다.

예시:

```text
identity.self_direction
identity.sensitivity_to_context
work.structure_preference
work.independent_initiative
resources.steady_accumulation
relationships.direct_communication
relationships.need_for_space
wellbeing.rhythm_consistency
timing.period_of_expansion
```

- 신규 `themeId`는 비교 사전 버전을 올린다.
- 서로 비슷해 보인다는 이유로 실행 중 새 주제를 생성하지 않는다.
- 하나의 체계 고유 개념을 억지로 일반 주제에 넣지 못하면 `systemSpecificConcept`로 남긴다.
- 번역 문구를 바꿔도 `themeId`는 바뀌지 않는다.

### 12.4 방향

```text
supports    해당 경향이나 기회를 강조
cautions    해당 경향의 부담이나 주의를 강조
mixed       지원과 주의가 함께 있고 분리할 수 없음
neutral     방향 없이 특성만 기술
unavailable 근거 부족으로 비교하지 않음
```

`supports`는 좋은 운, `cautions`는 나쁜 운이라는 뜻이 아니다. 방향은 같은 주제를 어떻게 서술하는지 구분하기 위한 비교 메타데이터다.

### 12.5 비교 분류 규칙

#### 공통으로 보는 점 `common`

아래 조건을 모두 만족해야 한다.

1. 서로 다른 체계 둘 이상이 같은 `themeId`를 가진다.
2. 참여 주장 모두 `evidenceStatus = complete`다.
3. 방향이 모두 `supports`, 모두 `cautions`, 또는 모두 `neutral`이다.
4. 같은 주제에 반대 방향의 완전한 주장이 없다.
5. 각 주장의 `evidenceFactIds`가 실제 체계 결과에 존재한다.

#### 다르게 보는 점 `different`

아래 중 하나를 만족하면 된다.

- 같은 `themeId`에 `supports`와 `cautions`가 함께 존재한다.
- 같은 `themeId`에 `mixed`와 단일 방향 주장이 함께 존재한다.
- 비교 사전에 명시된 상호 배타 하위 주제가 서로 다른 체계에서 나타난다.

차이 카드는 어느 체계가 맞는지 결론 내리지 않고, 각 체계가 무엇을 강조하는지 나란히 설명한다.

#### 이 체계만 보는 점 `unique`

아래 조건을 모두 만족해야 한다.

1. 하나의 체계만 해당 `themeId` 또는 `systemSpecificConceptId`를 가진다.
2. 근거 상태가 완전하다.
3. 다른 체계의 실패나 입력 누락 때문에 우연히 하나만 남은 것이 아니다.

완료되지 않은 체계가 있으면 `고유` 대신 `현재 계산된 체계 중 이 관점만 있어요`라는 부분 결과 라벨을 쓴다.

저장 계약에서 엄격한 고유 항목은 `classification: unique`, 부분 범위 항목은 `classification: partial-unique`다. 화면의 세 번째 `sections.unique` 배열은 두 분류를 담을 수 있지만, `partial-unique`가 하나라도 있으면 제목과 각 항목에 부분 범위 라벨을 표시한다.

### 12.6 분류 우선순위와 중복

하나의 정규화 주제는 한 비교 번들 안에서 하나의 기본 분류에만 들어간다.

```text
different > common > unique > excluded
```

- 반대 방향이 하나라도 있으면 `common`과 `different`에 동시에 넣지 않고 `different`에 넣는다.
- `mixed`만 둘 이상 있다고 공통으로 분류하지 않는다. 비교 사전이 하위 방향을 분해할 수 있을 때만 다시 판정한다.
- 근거가 불완전한 주장은 비교 카드에 넣지 않고 체계별 상세에만 표시한다.

### 12.7 비교 생성 의사코드

```js
function buildComparisonBundle(systemResults, comparisonClaims, dictionary) {
  const completed = systemResults.filter(
    result => result.status === 'ready' || isComparisonPermittedPartial(result)
  );
  if (completed.length < 2) return unavailableComparison('NEEDS_TWO_SYSTEMS');

  const completedIds = new Set(completed.map(result => result.resultId));
  const claims = comparisonClaims.filter(
    claim =>
      completedIds.has(claim.resultId) &&
      validateClaimEvidence(claim, resultById(systemResults))
  );

  const groups = groupClaimsByNormalizedTheme(claims, dictionary);

  return groups.map(group => {
    if (hasOpposedDirections(group, dictionary)) return asDifferent(group);
    if (hasCommonDirection(group) && hasAtLeastTwoSystems(group)) return asCommon(group);
    if (hasExactlyOneSystem(group) && allSystemsCompleted(systemResults)) return asUnique(group);
    if (hasExactlyOneSystem(group)) return asPartialUnique(group);
    return asExcluded(group);
  });
}
```

### 12.8 종합 문장

상단의 한 문장 요약은 분류 결과에서 결정론적으로 조합한다.

- 가장 높은 표시 우선순위의 `common` 1개
- 없으면 가장 높은 `different` 1개
- 둘 다 없으면 `네 전통의 원본 결과는 준비됐지만 억지로 같은 뜻으로 묶지 않았어요.`

요약은 새로운 주장이나 예측을 추가할 수 없다.

### 12.9 점수 금지

다음 값을 만들거나 표시하지 않는다.

- 체계 간 일치율
- 사용자와 체계의 적합도
- 결과 정확도
- 체계 순위
- 믿을 만함의 백분율
- 운의 총점

입력 완전성은 점수가 아니라 `완전`, `부분`, `입력 필요` 상태로 표시한다. 근거 개수는 디버그나 검증에 사용할 수 있지만 사용자에게 진실의 무게처럼 노출하지 않는다.

---

## 13. 결정론적 계산 경계

### 13.1 논리 모듈

현재 바닐라 ES module 구조 안에서 다음 책임을 분리한다. 실제 폴더명은 기존 구조를 따르되 경계는 유지한다.

| 모듈 | 책임 | 금지 |
| --- | --- | --- |
| Profile Normalizer | 입력 검증, 시각대·달력 변환 요청, 공통 표현 생성 | 체계 사실 계산 |
| Policy Registry | 활성 정책, 필수 입력, 지원 범위, 버전 노출 | 해석 문구 생성 |
| Eligibility Resolver | 체계별 실행 가능 여부와 이유 계산 | 임의 기본값 주입 |
| System Engine Adapter | 공통 입력을 해당 엔진에 전달하고 사실 봉투 반환 | 다른 체계 사실 참조 |
| Fact Validator | 스키마, 참조, 버전, 범위 검증 | 문구 미화 |
| Interpretation Projector | 승인 규칙으로 사실을 체계별 문장과 주장으로 변환 | 차트 계산 변경 |
| Comparison Projector | 승인된 주장 분류 | 원본 사실 혼합, 승자 선택 |
| Presentation Mapper | 한국어 문구와 UI 모델 생성 | 계산 또는 비교 의미 변경 |
| Persistence Adapter | 불변 결과와 사용자 동의 저장 | 조용한 재계산 |

### 13.2 엔진 인터페이스

```ts
interface AstrologyEngine {
  readonly systemId: 'saju' | 'horasat' | 'tu-vi' | 'mahabote';
  readonly policyId: string;
  readonly policyVersion: string;
  readonly engineVersion: string;

  getDescriptor(): SystemPolicyDescriptorV1;
  resolveEligibility(profile: NormalizedBirthProfileV2): EligibilityV1;
  calculate(
    profile: NormalizedBirthProfileV2,
    signal: AbortSignal
  ): Promise<SystemFactResultV1>;
  validate(result: SystemFactResultV1): ValidationReportV1;
}
```

TypeScript 표기는 계약 설명용이다. 현재 앱은 동일한 shape를 JSDoc typedef와 런타임 검증기로 구현할 수 있다.

### 13.3 기존 사주 어댑터

- 기존 사주 엔진은 계산 결과를 바꾸지 않는다.
- 어댑터가 기존 `natal-chart.v1` 결과를 `SystemFactResultV1` 안에 넣는다.
- 기존 사실 ID가 없다면 버전된 결정 규칙으로 안정적인 ID를 생성한다.
- 기존 결과와 새 어댑터 결과의 핵심 사실이 같은지 회귀 픽스처로 확인한다.
- 어댑터 출시 때문에 기존 개인·커플 사주 URL이나 저장 기록을 강제 마이그레이션하지 않는다.

### 13.4 생성형 AI 경계

P0에서는 생성형 AI 없이 계산과 비교가 완성되어야 한다.

추후 AI 문장 다듬기를 도입하더라도 다음 계약을 지킨다.

- AI에 원출생정보 대신 승인된 구조화 주장만 전달한다.
- AI는 `themeId`, 방향, 참여 체계, 근거 참조를 추가·삭제·변경할 수 없다.
- 출력은 스키마 검증과 금지 문구 검사를 통과해야 한다.
- 검증 실패 시 승인된 템플릿 문구로 돌아간다.
- AI를 끄더라도 동일한 계산 사실과 비교 분류를 볼 수 있어야 한다.

---

## 14. 버전된 데이터 계약

아래 계약은 JSON 저장·전송 기준이다. 알 수 없는 필드는 무시할 수 있지만 필수 필드 누락은 실패로 처리한다.

### 14.1 `NormalizedBirthProfileV2`

```json
{
  "schemaVersion": "birth-profile.v2",
  "profileId": "uuid",
  "inputCalendar": {
    "type": "gregorian",
    "date": "1990-01-01",
    "isLeapMonth": null
  },
  "birthTime": {
    "status": "exact",
    "localTime": "12:00",
    "uncertaintyMinutes": 0
  },
  "place": {
    "label": "서울특별시, 대한민국",
    "countryCode": "KR",
    "latitude": 37.5665,
    "longitude": 126.978,
    "timezoneId": "Asia/Seoul",
    "timezoneConfidence": "confirmed",
    "legacyKoreanPlaceCode": null
  },
  "resolvedInstant": {
    "utc": "1990-01-01T03:00:00Z",
    "timezoneDataVersion": "required-version",
    "resolutionStatus": "exact"
  },
  "traditionalSexParameter": "female",
  "interestDomains": ["work", "relationships"],
  "createdAt": "2026-08-23T00:00:00Z"
}
```

규칙:

- `profileId`는 무작위 UUID이며 출생 정보에서 해시로 만들지 않는다.
- `resolvedInstant`는 시각이 `unknown`이면 `null`이다.
- `traditionalSexParameter`는 `female | male | not_provided`다. 계정 성별이나 이름에서 추론하지 않는다.
- 관심 주제는 계산 입력에 포함하지 않는다.
- 이름은 계산 프로필의 필드가 아니다. 별칭은 별도 로컬 메타데이터로 둔다.

### 14.2 `SystemPolicyDescriptorV1`

```json
{
  "schemaVersion": "system-policy-descriptor.v1",
  "systemId": "horasat",
  "policyId": "TH-HORASAT-1.0",
  "policyVersion": "1.0.0",
  "status": "active",
  "engineVersion": "1.0.0",
  "factSchemaVersion": "horasat-facts.v1",
  "sourceSetVersion": "th-horasat-sources.v1",
  "calendarDataVersion": "calendar-data-version",
  "requiredInputs": [
    "inputCalendar.date",
    "birthTime.exact",
    "place.coordinates",
    "place.timezoneId"
  ],
  "optionalInputs": [],
  "supportedRange": {
    "dateFrom": "policy-defined",
    "dateTo": "policy-defined",
    "countries": "policy-defined"
  },
  "supportsPartial": false,
  "loadedAt": "2026-08-23T00:00:00Z",
  "integrity": {
    "algorithmDigest": "sha256-required",
    "tableDigest": "sha256-required"
  }
}
```

문서 예시의 `active`는 최종 계약 모양을 보여주기 위한 값이다. 현재 호라삿 정책 상태가 활성이라는 뜻이 아니다.

### 14.3 `EligibilityV1`

```json
{
  "schemaVersion": "eligibility.v1",
  "systemId": "tu-vi",
  "policyId": "VN-TUVI-1.0",
  "policyVersion": "0.1.0-draft.1",
  "status": "policy_unverified",
  "reasons": [
    {
      "code": "POLICY_NOT_ACTIVE",
      "field": null,
      "messageKey": "eligibility.policyNotActive"
    }
  ],
  "missingInputs": [],
  "canCalculate": false,
  "calculationPrecision": "none",
  "permittedOutputScopes": []
}
```

`EligibilityV1`의 필드와 의미는 `CALCULATION-POLICY-REGISTRY.md` 4.3절과 동일한 단일 wire/storage 계약이다. `messageKey`만 저장하며 사용자 문구는 표시 계층에서 번역한다.

### 14.4 `SystemFactResultV1`

```json
{
  "schemaVersion": "system-fact-result.v1",
  "resultId": "uuid",
  "bundleId": "uuid",
  "profileId": "uuid",
  "systemId": "saju",
  "status": "ready",
  "inputRef": "opaque-local-input-ref",
  "normalizedInputHash": "sha256-canonical-nonreversible-input",
  "policy": {
    "id": "KR-CIVIL-1.0",
    "version": "1.0.0",
    "decisionRecordId": "kr-civil-1.0-decision"
  },
  "engine": {
    "id": "gyeol-natal-core",
    "version": "1.0.0"
  },
  "sourceAssets": [],
  "systemResultSchemaVersion": "natal-chart.v1",
  "facts": [],
  "nativeChart": {
    "schemaVersion": "natal-chart.v1",
    "data": {}
  },
  "warnings": [],
  "unsupportedStates": [],
  "boundarySensitivity": [],
  "calculatedAt": "2026-08-23T00:00:00Z",
  "fingerprint": {
    "algorithm": "sha256",
    "canonicalization": "JCS",
    "value": "sha256-required"
  }
}
```

규칙:

- `normalizedInputHash`는 캐시·무결성 확인용이며 분석이나 공개 식별자로 전송하지 않는다.
- `facts[]`의 각 항목은 안정적인 `factId`, `factType`, 구조화 값, 표시용 키, 출처 규칙 참조를 가진다.
- `partial` 결과는 변하지 않는 사실과 불확실한 사실을 구분하고 `warnings[]`에 범위를 명시한다.
- 계산 실패를 `facts: []`, `status: ready`로 저장하지 않는다.

### 14.5 `ComparisonClaimV1`

```json
{
  "schemaVersion": "comparison-claim.v1",
  "claimId": "uuid",
  "resultId": "uuid",
  "systemId": "saju",
  "domainId": "work",
  "themeId": "work.structure_preference",
  "systemSpecificConceptId": null,
  "stance": "supports",
  "titleKey": "claims.work.structurePreference.title",
  "summaryKey": "claims.work.structurePreference.supports",
  "evidenceFactIds": ["saju.fact.example"],
  "evidenceStatus": "complete",
  "displayPriority": 60,
  "interpretationVersion": "saju-interpretation.v1",
  "projectionRule": {
    "id": "saju.work.structure-preference",
    "version": "1.0.0"
  }
}
```

규칙:

- 텍스트 자체가 아니라 키와 파라미터를 저장한다.
- `evidenceFactIds`가 비어 있으면 `evidenceStatus`는 `missing`이며 비교에서 제외한다.
- `displayPriority`는 0~100의 콘텐츠 정렬값이지 진실 점수가 아니다.
- 다른 체계의 `claimId`나 `factId`를 참조할 수 없다.

### 14.6 `ComparisonBundleV1`

`systemRuns[]`는 아래 단일 계약을 사용한다.

`CalculationRunState`와 `CalculationErrorCode`의 허용값은 `CALCULATION-POLICY-REGISTRY.md` 11절이 단일 정의다. 구현에서 별도 enum을 다시 선언하지 않는다.

```ts
type SystemRunV1 = {
  runId: string;
  systemId: "saju" | "horasat" | "tu-vi" | "mahabote";
  state: CalculationRunState;
  eligibilityRef: string;
  attempt: number;
  resultId: string | null;
  errorCode: CalculationErrorCode | null;
  updatedAt: string;
};
```

```json
{
  "schemaVersion": "comparison-bundle.v1",
  "bundleId": "uuid",
  "comparisonId": "uuid",
  "supersedesComparisonId": null,
  "profileId": "uuid",
  "requestedSystems": ["saju", "horasat", "tu-vi", "mahabote"],
  "systemRuns": [
    {
      "runId": "uuid",
      "systemId": "saju",
      "state": "complete",
      "eligibilityRef": "eligibility:saju:v1",
      "attempt": 1,
      "resultId": "uuid",
      "errorCode": null,
      "updatedAt": "2026-08-23T00:00:00Z"
    },
    {
      "runId": "uuid",
      "systemId": "horasat",
      "state": "failed",
      "eligibilityRef": "eligibility:horasat:v1",
      "attempt": 1,
      "resultId": null,
      "errorCode": "CALCULATION_FAILED",
      "updatedAt": "2026-08-23T00:00:00Z"
    },
    {
      "runId": "uuid",
      "systemId": "tu-vi",
      "state": "complete",
      "eligibilityRef": "eligibility:tu-vi:v1",
      "attempt": 1,
      "resultId": "uuid-tu-vi",
      "errorCode": null,
      "updatedAt": "2026-08-23T00:00:00Z"
    },
    {
      "runId": "uuid",
      "systemId": "mahabote",
      "state": "blocked",
      "eligibilityRef": "eligibility:mahabote:v1",
      "attempt": 0,
      "resultId": null,
      "errorCode": "POLICY_NOT_ACTIVE",
      "updatedAt": "2026-08-23T00:00:00Z"
    }
  ],
  "sourceResults": [
    {
      "systemId": "saju",
      "resultId": "uuid",
      "fingerprint": "sha256-saju-result"
    },
    {
      "systemId": "tu-vi",
      "resultId": "uuid-tu-vi",
      "fingerprint": "sha256-tu-vi-result"
    }
  ],
  "sourceFingerprintSetHash": "sha256-sorted-source-fingerprints",
  "comparisonVersion": "comparison.v1",
  "dictionaryVersion": "comparison-dictionary.ko.v1",
  "status": "partial",
  "sections": {
    "common": [],
    "different": [],
    "unique": [],
    "excluded": []
  },
  "comparisonFingerprint": "sha256-comparison-contract",
  "createdAt": "2026-08-23T00:00:00Z"
}
```

위 JSON은 wire shape 예시일 뿐 현재 뜨비 정책이 활성이라는 뜻이 아니다. 실제 런타임은 `active` 정책의 결과만 `sourceResults`에 넣으며, `systemRuns`에는 `requestedSystems`의 모든 체계를 고정 순서로 한 번씩 포함한다.

`status`는 `complete | partial | unavailable | failed`다.

- 네 요청 체계가 모두 완료되고 비교가 생성되면 `complete`다.
- 둘 이상 완료되었지만 일부가 실패·누락이면 `partial`이다.
- 하나만 완료되면 `unavailable`이며 원 결과는 유효하다.
- 아무 체계도 완료되지 않으면 `failed`다.

### 14.7 `ComparisonSectionItemV1`

```json
{
  "itemId": "uuid",
  "classification": "different",
  "domainId": "relationships",
  "themeId": "relationships.need_for_space",
  "participatingClaims": [
    {
      "systemId": "saju",
      "claimId": "uuid",
      "stance": "supports"
    },
    {
      "systemId": "tu-vi",
      "claimId": "uuid",
      "stance": "cautions"
    }
  ],
  "titleKey": "comparison.relationships.needForSpace.different.title",
  "summaryTemplateKey": "comparison.different.twoDirections",
  "displayPriority": 70,
  "coverage": "complete"
}
```

`classification`은 `common | different | unique | partial-unique`이고 `coverage`는 `complete | partial`이다. `partial-unique`는 반드시 `coverage: partial`이다. 요약 템플릿은 참여 주장에 없는 내용을 추가할 수 없다.

---

## 15. 서비스와 API 계약

P0는 로컬 어댑터로 구현할 수 있다. 서버를 사용하더라도 UI는 동일한 인터페이스를 호출해야 한다.

### 15.1 서비스 인터페이스

```ts
interface ComparisonService {
  listPolicies(): Promise<SystemPolicyDescriptorV1[]>;
  normalizeProfile(input: BirthProfileInputV1): Promise<NormalizedBirthProfileV2>;
  resolveAllEligibility(profile: NormalizedBirthProfileV2): Promise<EligibilityV1[]>;
  createBundle(request: CreateBundleRequestV1): Promise<ComparisonBundleV1>;
  getBundle(bundleId: string): Promise<ComparisonBundleV1>;
  retrySystem(bundleId: string, systemId: SystemId): Promise<ComparisonBundleV1>;
  deleteBundle(bundleId: string): Promise<void>;
}
```

### 15.2 선택적 HTTP 매핑

| 메서드 | 경로 | 성공 | 책임 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/astrology/policies` | 200 | 활성·준비 중 정책 목록 |
| `POST` | `/api/v1/astrology/profile/normalize` | 200 | 입력 검증과 공통 표현 |
| `POST` | `/api/v1/astrology/eligibility` | 200 | 네 체계 자격 판정 |
| `POST` | `/api/v1/astrology/bundles` | 202 또는 200 | 번들 생성 및 계산 시작 |
| `GET` | `/api/v1/astrology/bundles/{bundleId}` | 200 | 체계별 진행과 결과 조회 |
| `POST` | `/api/v1/astrology/bundles/{bundleId}/systems/{systemId}/retry` | 202 | 실패 체계만 재실행 |
| `DELETE` | `/api/v1/astrology/bundles/{bundleId}` | 204 | 번들과 비공유 사본 삭제 |
| `POST` | `/api/v1/astrology/shares` | 201 | 비식별 공유 스냅샷 생성 |
| `DELETE` | `/api/v1/astrology/shares/{shareId}` | 204 | 공유 링크 폐기 |

### 15.3 번들 생성 요청

```json
{
  "schemaVersion": "create-bundle-request.v1",
  "profile": {},
  "requestedSystems": ["saju", "horasat", "tu-vi", "mahabote"],
  "consents": {
    "persistLocally": false,
    "syncToAccount": false,
    "analytics": false
  },
  "client": {
    "locale": "ko-KR",
    "timezone": "Asia/Seoul"
  }
}
```

서버는 `requestedSystems`에 `active`가 아닌 체계가 포함되면 가짜 결과를 만들지 않고 해당 체계의 자격 상태를 반환한다.

### 15.4 오류 봉투

```json
{
  "schemaVersion": "astrology-error.v1",
  "error": {
    "code": "POLICY_NOT_ACTIVE",
    "messageKey": "errors.policyNotActive",
    "systemId": "horasat",
    "retryable": false,
    "fieldErrors": [],
    "correlationId": "random-non-pii-id"
  }
}
```

### 15.5 오류 코드

| 코드 | 재시도 | 사용자 행동 |
| --- | --- | --- |
| `INVALID_BIRTH_DATE` | 아니오 | 날짜 수정 |
| `AMBIGUOUS_PLACE` | 아니오 | 위치 후보 선택 |
| `TIMEZONE_UNRESOLVED` | 아니오 | 시각대 확인 |
| `REQUIRED_TIME_UNKNOWN` | 아니오 | 정확한 시각 입력 또는 체계 제외 |
| `POLICY_NOT_ACTIVE` | 아니오 | 준비 상태 확인 |
| `UNSUPPORTED_DATE_RANGE` | 아니오 | 지원 범위 확인 |
| `ENGINE_LOAD_FAILED` | 예 | 해당 체계 재시도 |
| `CALCULATION_FAILED` | 조건부 | 해당 체계 재시도 또는 신고 |
| `FACT_VALIDATION_FAILED` | 아니오 | 결과 미노출, 오류 신고 |
| `COMPARISON_NEEDS_TWO_SYSTEMS` | 아니오 | 한 체계 추가 계산 |
| `VERSION_CHANGED` | 예 | 새 버전으로 전체 재계산 |
| `STORAGE_QUOTA_EXCEEDED` | 조건부 | 기록 정리 또는 내보내기 |

내부 스택, 원출생정보, 계산 테이블 행은 오류 응답이나 분석 로그에 넣지 않는다.

---

## 16. 계산 실행과 부분 실패

### 16.1 실행 모델

- 체계별 작업은 독립 Promise 또는 Web Worker 작업으로 실행한다.
- 한 체계가 다른 체계의 완료를 기다리지 않는다.
- 각 결과는 `Fact Validator`를 통과한 뒤에만 `complete`가 된다.
- 비교는 현재 완료된 불변 결과 스냅샷을 입력으로 만든다.
- 나중에 체계가 더 완료되면 새 비교 리비전을 만들고 이전 리비전을 덮어쓰지 않는다.

### 16.2 취소

- 사용자 취소는 아직 완료하지 않은 엔진에 `AbortSignal`을 전달한다.
- 완료된 결과는 취소로 삭제하지 않는다.
- 서버 계산이면 동일한 취소 의도를 전달하되 완료 여부를 다시 조회한다.
- 앱을 떠날 때 네트워크 요청이 중단되더라도 서버에 원출생정보가 불필요하게 남지 않도록 보존 정책을 적용한다.

### 16.3 캐시

캐시 키는 다음을 포함한다.

```text
inputFingerprint
+ systemId
+ policyId
+ engineVersion
+ sourceSetVersion
+ calendarDataVersion
+ timezoneDataVersion
```

어느 하나라도 바뀌면 기존 계산 캐시를 재사용하지 않는다.

### 16.4 무결성

- 정책 번들과 표 데이터는 배포 시 digest를 고정한다.
- 로드한 digest가 레지스트리와 다르면 엔진을 실행하지 않는다.
- 결과 digest는 저장 시 계산하고 읽을 때 검증한다.
- 무결성 실패 결과는 화면에 표시하지 않고 재계산을 안내한다.

---

## 17. 체계별 출력 계약

각 엔진 정책 문서는 최소한 아래 항목을 채워야 한다. 이 문서만으로 신규 전통의 계산 공식을 추정해서는 안 된다.

### 17.1 공통 필수 출력

- 입력 해석 요약
- 체계 고유 핵심 사실 목록
- 차트 또는 구조도 데이터
- 사실별 안정적 `factId`
- 사실을 만든 규칙 참조
- 계산 완전성
- 지원 범위 경고
- 장별 해석 키
- 비교용 정규화 주장
- 정책·엔진·출처·표·달력·시각대 버전

### 17.2 사주

- 현재 구현된 네 기둥과 관련 사실을 보존한다.
- 기존 계산 정책과 결과 스키마를 어댑터가 감싼다.
- 비교용 주장은 별도 결정론적 해석 규칙에서 만든다.
- 기존 커플 결과는 개인 비교 번들에 넣지 않는다.

### 17.3 호라삿

활성화 전 정책 문서가 확정해야 할 것:

- 채택할 태국 점성술 학파와 범위
- 천체 위치 계산 기준과 기준 좌표계
- 세차·아야남샤 등 항성 기준을 사용하는 경우 정확한 규칙
- 하우스와 상승점 규칙
- 지역 민간시각과 좌표 처리
- 경계 시각 반올림 규칙
- 차트 구성과 해석 규칙
- 기준 오라클과 허용 오차

`horasat.kr`에서 관찰한 설정을 자동으로 채택하지 않는다.

### 17.4 뜨비

활성화 전 정책 문서가 확정해야 할 것:

- 채택할 베트남 Tử Vi 학파와 표 체계
- 입력 달력과 베트남 달력 변환 규칙
- 날짜와 시각 경계
- 전통 계산용 성별값 사용 규칙
- 궁 배치와 별 배치에 필요한 전체 표
- 변환·주기·시기 규칙
- 동명이규칙이나 지역 변형의 선택
- 기준 오라클과 골든 판 예시

다른 지역의 자미 계열 규칙을 이름이 비슷하다는 이유로 섞지 않는다.

### 17.5 마하보테

활성화 전 정책 문서가 확정해야 할 것:

- 채택할 미얀마 달력 변환 규칙과 지원 기간
- 출생 요일과 요일 경계
- 수요일을 세분하는 정책인지 여부와 필요한 시각 정확도
- 일곱 위치 또는 하우스 배치 규칙
- 행성·숫자 대응 규칙
- 시기 또는 주기 해석 범위
- 윤일·달력 개정·지역 시각대 경계 처리
- 기준 오라클과 골든 예시

공개 코드나 상용 결과 하나만으로 규칙을 확정하지 않는다.

---

## 18. 신규 엔진 출처·오라클 게이트

세 신규 엔진은 각각 아래 게이트를 통과해야 `active`가 된다.

### Gate 1. 전통과 변형의 범위 고정

- 어떤 학파와 규칙 집합을 구현하는지 한 문장으로 정의한다.
- 포함하지 않는 변형을 적는다.
- 사용자 표시명을 확정한다.

### Gate 2. 출처 집합 승인

- 1차 자료, 전문 연구, 검토 가능한 규칙서의 우선순위를 기록한다.
- 각 자료의 저자, 판본, 연도, 페이지 또는 규칙 위치를 기록한다.
- 사용 라이선스와 코드·표 전재 가능성을 확인한다.
- 상용 앱은 보조 대조 자료로만 분류한다.

### Gate 3. 계산 정책 완성

정책 문서에 다음이 누락되면 안 된다.

- 입력과 지원 범위
- 달력·시각대·위치 변환
- 모든 핵심 공식과 표
- 반올림과 경계 규칙
- 결과 사실 스키마
- 알려진 변형과 선택 이유
- 실패 및 부분 결과 규칙

### Gate 4. 독립 오라클 준비

- 구현 코드와 별도로 기대 결과를 만든 오라클이 있어야 한다.
- 동일 코드를 호출해 만든 기대값은 오라클이 아니다.
- 상용 사이트 한 곳과 일치하는 것만으로 통과하지 않는다.
- 불일치 사례는 숨기지 않고 정책 차이인지 결함인지 분류한다.

### Gate 5. 골든 픽스처

각 엔진은 최소 다음 범주를 포함한다.

- 일반적인 완전 입력
- 날짜 경계 직전·직후
- 시각 단위 경계 직전·직후
- 달력 윤일·윤달 또는 해당 체계의 특수일
- 지원 시작·종료 날짜
- 시각대 오프셋 변경 전·후
- 같은 지명 다른 좌표
- 시각 미상과 대략 시각
- 정책이 사용하는 성별 파라미터의 각 값과 미입력
- 알려진 전통 변형이 결과를 다르게 만드는 사례

### Gate 6. 이중 검토

- 규칙 구현자가 아닌 검토자가 계산 정책과 픽스처를 검토한다.
- 가능하면 해당 전통 전문가가 대표 결과와 용어를 검토한다.
- 번역 검토와 계산 검토를 분리한다.

### Gate 7. 출시 검증

- 골든 픽스처 100% 통과
- 결정론 반복 실행 결과 동일
- 정책 digest 일치
- 지원 범위 밖 입력 거부
- 실패 시 다른 엔진 보존
- 근거 없는 비교 주장 0건
- 개인정보가 로그와 분석 이벤트에 없음

### 18.1 활성화 체크리스트

```text
[ ] 전통 범위가 한 문장으로 고정됨
[ ] 출처 집합과 라이선스 승인
[ ] 정책 문서 완성
[ ] 독립 오라클 준비
[ ] 골든 픽스처 검토
[ ] 경계값 테스트 통과
[ ] 한국어 용어 검토
[ ] 결과 스키마 검증
[ ] 비교 주장 사전 검토
[ ] 접근성·성능·개인정보 검증
[ ] 정책 상태를 active로 변경하는 별도 승인
```

---

## 19. 저장, 마이그레이션, 동기화

### 19.1 기본 저장 원칙

- 계산 전 민감 입력 초안은 메모리에만 둔다. 탭 복구용 영속 초안이 필요하면 같은 고지·삭제 계약을 가진 IndexedDB `profiles` 초안 상태를 사용한다.
- 계산 결과 확인 후 `이 기기에 저장`을 사용자가 선택할 때 IndexedDB에 보존한다.
- `localStorage`와 `sessionStorage`에는 평문·암호문 여부와 관계없이 출생 프로필, 계산 결과, 비교 결과, 동의 영수증, 인증 토큰을 두지 않는다. 비민감 UI 환경설정만 허용한다.
- 계정 동기화는 별도 동의를 받아야 한다.
- 결제를 위해 출생정보를 계정 프로필에 영구 결합하지 않는다.

### 19.2 저장 단위

```text
profiles
eligibilityDecisions
systemResults
comparisonResults
shareArtifacts
purposeReceipts
syncOutbox
```

- `systemResults`는 불변이다.
- `comparisonResults`는 `ComparisonBundleV1`의 영속 이름이며 정확한 결과 ID·fingerprint 집합을 참조한다.
- 새 체계 결과나 비교 규칙이 추가되면 새 `comparisonResults` 행을 만들고 `supersedesComparisonId`로 이전 결과를 가리킨다. 별도 `comparisonRevisions` 저장소를 만들지 않는다.
- `shareArtifacts`는 비식별 문구와 시각 스타일만 복사하며 원 결과를 역참조하지 않아도 되게 한다.
- `purposeReceipts`는 선택적 계정 동기화·외부 처리 등 목적별 영수증만 저장한다. 로컬 계산 허가처럼 오해되는 포괄 동의는 만들지 않는다.
- `policyManifests`는 사용자 저장소가 아니라 버전된 애플리케이션 자산이다. 각 결과는 사용한 manifest fingerprint만 보존한다.

### 19.3 기존 기록 마이그레이션

- 기존 개인 사주 기록을 즉시 변환하지 않는다.
- 사용자가 기존 기록에서 `네 전통으로 비교`를 선택하면 먼저 원 입력의 충분성을 검사한다.
- 충분하면 기존 사주 결과를 어댑터 결과로 참조하고 나머지 활성 체계만 계산한다.
- 기존 기록에 좌표, 시각대 또는 원입력이 없으면 사용자에게 추가 입력을 요청한다.
- 마이그레이션은 원 기록을 수정하지 않고 새 번들을 만든다.

### 19.4 내보내기

내보내기 JSON에는 다음이 포함된다.

- 스키마 설명과 생성 시각
- 사용자 원입력과 변환된 입력
- 모든 버전 식별자
- 체계별 사실, 해석 키, 경고
- 비교 주장과 분류
- 동의 기록

분석 이벤트, 결제 토큰, 서버 내부 상관 ID는 포함하지 않는다.

### 19.5 삭제

- 번들 삭제와 계정 전체 삭제를 구분한다.
- 번들 삭제는 연결된 비교 리비전과 비공개 결과를 함께 삭제한다.
- 다른 번들이 같은 결과를 참조하면 참조 수를 확인하고 사용자에게 범위를 설명한다.
- 공유 링크는 별도로 폐기할 수 있다.
- 서버 동기화가 있으면 삭제 요청 상태와 완료 시각을 보여준다.

---

## 20. 개인정보와 보안

출생일, 출생시각, 출생지 좌표는 결합될 때 개인을 식별할 수 있는 민감 정보로 취급한다.

### 20.1 수집 최소화

- 계산에 필요하지 않은 실명, 전화번호, 주소를 묻지 않는다.
- 관심 주제는 선택이며 계산에 사용하지 않는다.
- 계정 없이 무료 핵심 계산을 허용한다.
- 위치 검색 제공자에게 전체 프로필을 보내지 않는다.

### 20.2 동의

동의를 분리한다.

```text
필수 계산 처리
기기 내 기록 저장
계정 동기화
비식별 제품 분석
마케팅 수신
```

하나의 전체 동의 상자로 묶지 않는다. 마케팅 거부가 계산을 막으면 안 된다.

### 20.3 로그

로그에 넣지 않는 값:

- 출생일 원값
- 출생시각 원값
- 위치 문자열과 좌표
- 전통 계산용 성별값
- 차트 전체 JSON
- 비교 문장 전체
- 공유 이미지 원본

오류 로그는 무작위 상관 ID, 시스템 ID, 정책 버전, 오류 코드만으로 진단할 수 있어야 한다.

### 20.4 공유 보안

- 공유 ID는 추측 불가능한 무작위 값이다.
- 원 번들 ID를 URL에 노출하지 않는다.
- 공유 스냅샷은 원 프로필 API에 접근할 권한을 갖지 않는다.
- 사용자가 폐기하면 이후 요청은 404 또는 410으로 응답한다.
- 검색 엔진 색인을 기본 차단한다.

### 20.5 유료 기능 보안

- 결제 권한은 계산 사실을 변경하지 않는다.
- 클라이언트 가격이나 권한 플래그만 믿지 않는다.
- 영수증·구독 상태와 출생정보를 분석 목적으로 결합하지 않는다.
- 결제 실패가 이미 계산된 무료 결과를 삭제하면 안 된다.

---

## 21. 해석 안전과 콘텐츠 정책

### 21.1 기본 고지

첫 결과와 공유물에 다음 의미의 고지를 제공한다.

> 이 결과는 여러 전통의 상징 체계를 바탕으로 한 성찰·오락용 해석입니다. 건강, 법률, 금융 등 중요한 결정은 관련 전문가와 실제 정보에 근거해 판단하세요.

### 21.2 금지 표현

- 사망 시기나 수명 단정
- 질병 진단 또는 치료 중단 권고
- 임신 여부·성별·유산 예측
- 범죄, 사고, 재난이 반드시 일어난다는 단정
- 투자 종목, 대출, 도박 행동 지시
- 이혼, 퇴사, 소송 같은 중대 결정을 즉시 하라는 지시
- 특정 성별, 국적, 장애, 종교를 열등하게 묘사
- `나쁜 팔자`, `저주`, `피할 수 없음`으로 공포 유도

### 21.3 문장 규칙

- `반드시` 대신 `이 전통에서는 ... 경향을 강조합니다`를 쓴다.
- 부정적 해석에는 현실에서 관찰할 수 있는 질문이나 안전한 성찰 행동을 붙인다.
- 서로 다른 체계의 차이는 모순이나 오류가 아니라 관점과 정책의 차이로 설명한다.
- 사용자의 실제 경험이 결과보다 우선한다는 선택권을 준다.
- 체계 고유 개념을 현대 심리학 진단명으로 번역하지 않는다.

### 21.4 사용자가 결과에 동의하지 않을 때

각 상세 화면에 `내 경험과 달라요`를 제공할 수 있다. 이 입력은 계산 결과를 자동 수정하지 않는다.

- 로컬 저널에 메모
- 콘텐츠 품질 피드백 전송
- 번역 문제와 계산 의심을 구분해 신고

피드백을 적중률 점수로 공개하거나 다음 사용자의 계산 가중치로 쓰지 않는다.

---

## 22. 유료화 계약

최신 인기 앱에서 확인되는 `무료 첫 개인 가치 -> 더 깊은 읽기·관계·지속 콘텐츠` 순서를 참고하되, 공포와 불투명한 계산을 유료화 장치로 사용하지 않는다.

### 22.1 무료

- 프로필 입력과 자격 판정
- 활성 체계별 핵심 차트·사실
- 기본 장별 해석
- 공통점·차이점·고유 관점의 핵심 비교
- 계산 정책·근거·한계
- 결과 1건의 기기 내 저장
- 비식별 공유 카드
- 데이터 내보내기와 삭제

### 22.2 향후 Plus 후보

- 체계별 심화 장
- 시기 흐름의 더 긴 범위
- 여러 기록 저장과 기기 동기화
- 비교 저널과 과거 기록 대조
- 오디오 읽기
- 관계 비교

### 22.3 영구 무료여야 하는 것

- 사용한 정책과 버전
- 입력이 어떻게 해석되었는지
- 부분 결과와 불확실성 표시
- 안전 고지
- 데이터 삭제·내보내기
- 이미 구매한 리포트의 접근

### 22.4 업셀 위치

- 홈 첫 화면 금지
- 입력 도중 금지
- 계산 오류 화면 금지
- 공통 비교 핵심 카드를 최소 하나 읽은 뒤 허용
- `불운을 피하려면 결제` 같은 문구 금지
- CTA 닫기와 무료 결과 계속 읽기가 동일하게 쉬워야 한다.

가격과 상품 수는 이 명세에서 정하지 않는다. 권한 모델은 계산과 분리한다.

---

## 23. 재방문과 기록 루프

P0에서 과도한 일일 운세를 만들지 않는다. 결과 이후 아래의 작은 성찰 루프만 제공할 수 있다.

```text
비교 카드 읽기
-> 오늘 실제 경험과 맞았는지 한 줄 메모
-> 사용자가 선택한 날짜에 다시 보기
```

규칙:

- 알림은 명시적 동의 후에만 보낸다.
- 불안 문구로 클릭을 유도하지 않는다.
- 스트릭이 끊겼다고 벌을 주지 않는다.
- 저널 내용은 기본 로컬 저장이며 분석에 전송하지 않는다.
- 점술 결과와 사용자의 실제 경험을 구분해 표시한다.

---

## 24. 접근성 요구

목표는 WCAG 2.2 AA 수준이다.

### 24.1 키보드와 포커스

- 모든 입력, 카드 펼침, 탭, 근거 서랍, 공유 설정을 키보드로 조작할 수 있다.
- 화면 전환 후 제목으로 포커스를 이동한다.
- 모달을 닫으면 열었던 버튼으로 포커스를 돌린다.
- 시각적 포커스 링을 제거하지 않는다.
- 차트 영역에는 `차트 내용을 표로 보기`를 제공한다.

### 24.2 의미 구조

- 화면당 하나의 `h1`을 사용한다.
- 공통·차이·고유 섹션은 각각 제목이 있는 `section`이다.
- 카드 목록은 목록 의미를 사용한다.
- 비교 체계 표는 열·행 머리글을 연결한다.
- SVG 차트는 제목과 설명을 가지며 장식 요소는 스크린리더에서 숨긴다.

### 24.3 색과 대비

- 본문과 컨트롤은 AA 대비를 충족한다.
- 체계, 상태, 방향을 색만으로 구분하지 않는다.
- 고대비 모드에서도 테두리와 포커스가 남는다.
- 한지 질감이 본문 대비를 낮추면 텍스트 표면에는 단색 배경을 둔다.

### 24.4 확대와 텍스트

- 400% 확대에서 가로 스크롤 없이 핵심 흐름을 사용할 수 있다. 차트 표는 예외적으로 내부 스크롤을 허용한다.
- 기존 큰 글씨 모드는 신규 화면 전체에 적용한다.
- 텍스트 크기를 키워도 카드 높이를 고정하지 않는다.
- 베트남어 발음기호와 영문 체계명이 잘리지 않게 폰트 폴백을 확인한다.

### 24.5 오류와 진행

- 오류는 색, 아이콘, 텍스트로 함께 표시한다.
- 입력 오류 요약은 해당 필드로 이동할 수 있다.
- 계산 진행은 시각적 목록과 라이브 텍스트를 함께 제공한다.
- 자동 갱신으로 읽던 포커스를 빼앗지 않는다.

---

## 25. 성능과 오프라인 요구

### 25.1 예산

| 항목 | 목표 |
| --- | --- |
| 초기 HTML·CSS·공통 JS | gzip 합계 250KB 이하, 엔진 표 데이터 제외 |
| 첫 의미 콘텐츠 LCP | 중급 모바일 4G 기준 p75 2.5초 이하 |
| 입력 반응 INP | p75 200ms 이하 |
| 레이아웃 이동 CLS | 0.1 이하 |
| 입력 자격 재판정 | 일반 입력에서 50ms 이하 |
| 메인 스레드 단일 계산 작업 | 100ms를 넘으면 Worker 또는 분할 실행 |
| 결과 저장 | 일반 번들에서 500ms 이하 목표 |

이는 출시 품질 목표이며 계산 정확도를 희생해 달성하면 안 된다.

### 25.2 로딩 전략

- 홈과 입력에는 공통 셸만 로드한다.
- 사용자가 선택했고 자격이 있는 엔진만 동적 로드한다.
- 체계별 큰 규칙 표는 별도 버전 파일로 분리한다.
- 정책 manifest를 먼저 검증하고 digest가 맞는 엔진만 로드한다.
- 차트 렌더러는 상세 화면 진입 시 지연 로드할 수 있다.

### 25.3 Web Worker

- 큰 달력 변환, 천체 계산, 표 배치, 비교 생성을 Worker 후보로 둔다.
- Worker 메시지는 버전된 JSON 계약을 사용한다.
- 원출생정보는 필요한 Worker에만 전달하고 완료 뒤 참조를 해제한다.
- Worker 실패는 해당 체계 실패로 격리한다.

### 25.4 오프라인

- 기존 사주 오프라인 동작을 훼손하지 않는다.
- 신규 엔진은 첫 성공 로드 뒤 정책 manifest와 무결성이 확인된 번들만 캐시한다.
- 업데이트는 모든 파일을 받은 뒤 원자적으로 교체한다.
- 오래된 캐시로 계산하면 결과에 정확한 과거 정책 버전을 남긴다.
- 필요한 위치·시각대 데이터가 없으면 추정하지 말고 온라인 연결을 요청한다.

---

## 26. 분석 이벤트

분석은 명시적 비식별 분석 동의가 있을 때만 전송한다.

### 26.1 이벤트 목록

| 이벤트 | 허용 속성 |
| --- | --- |
| `comparison_home_viewed` | locale, appVersion |
| `comparison_started` | entryPoint |
| `profile_step_completed` | stepId, timeStatus, placeProvided, traditionalParameterProvided |
| `eligibility_resolved` | system별 상태 코드, eligibleCount |
| `bundle_calculation_started` | requestedSystemIds, activePolicyIds |
| `system_calculation_completed` | systemId, policyId, durationBucket, precision |
| `system_calculation_failed` | systemId, policyId, errorCode, retryable |
| `comparison_viewed` | completedSystemCount, bundleStatus |
| `comparison_section_opened` | classification, domainId |
| `system_detail_opened` | systemId, fromClassification |
| `evidence_opened` | systemId, domainId |
| `result_saved_locally` | bundleStatus |
| `share_preview_opened` | classification |
| `share_created` | templateId, includedSystemCount |
| `upgrade_offer_viewed` | placement, entitlementId |
| `upgrade_started` | entitlementId |

### 26.2 금지 속성

- 출생일과 출생연도
- 출생시각
- 출생지 문자열, 국가보다 세밀한 위치, 좌표
- 시각대와 결합된 출생 정보
- 전통 계산용 성별 원값
- 이름과 별칭
- `profileId`, `resultId`, `bundleId`, `shareId`
- 사실 값, 해석 문장, 저널 내용
- 결제 영수증 원문

### 26.3 제품 지표

- 첫 입력 시작률
- 공통 입력 완료율
- 체계별 `needs_input` 비율
- 체계별 계산 성공률
- 2개 이상 결과 도달률
- 비교 카드에서 상세 근거로 이동한 비율
- 안전한 공유 생성률
- 무료 핵심 결과를 본 뒤의 유료 제안 반응

`결과가 맞았다` 같은 적중률을 핵심 성장 지표로 사용하지 않는다.

---

## 27. 콘텐츠와 번역 운영

### 27.1 문구 저장

- 계산 결과에 긴 한국어 문장 자체보다 `messageKey`와 파라미터를 저장한다.
- 번역 카탈로그는 `locale`과 `contentVersion`으로 버전 관리한다.
- 계산 버전과 문구 버전을 분리한다.
- 문구 수정이 계산 결과를 바꾸지 않아야 한다.

### 27.2 용어집

체계별 용어는 다음 열을 가진 용어집으로 관리한다.

```text
termId
systemId
nativeTerm
romanization
koreanPreferred
koreanAlternatives
shortDefinition
longDefinition
sourceReference
reviewStatus
```

- 한국에서 익숙한 기존 용어가 있으면 근거 없이 새 번역어를 만들지 않는다.
- 같은 한자 계열이라도 전통별 의미가 다르면 `termId`를 분리한다.
- 번역 검토가 끝나지 않은 용어는 사용자 UI에 자동 노출하지 않는다.

### 27.3 비교 문구 템플릿

```text
common:
  `{systems}는 모두 {theme}을 중요하게 봅니다. {sharedMeaning}`

different:
  `{systemA}는 {meaningA}을 강조하고, {systemB}는 {meaningB}을 더 조심스럽게 봅니다.`

unique:
  `{system}에서만 두드러진 관점입니다. {meaning}`
```

- `{sharedMeaning}`은 승인된 동일 방향 주장에만 근거한다.
- 템플릿은 참여하지 않은 체계를 `침묵`이나 `반대`로 표현하지 않는다.
- `다르게 본다`를 `서로 모순된다`로 자동 번역하지 않는다.

---

## 28. 테스트 전략

### 28.1 계층

| 계층 | 대상 | 핵심 증거 |
| --- | --- | --- |
| 정책 단위 | 달력·경계·공식·표 | 승인 골든 픽스처 |
| 엔진 단위 | 공통 입력에서 체계 사실 생성 | 결정론과 스키마 검증 |
| 어댑터 회귀 | 기존 사주 결과 감싸기 | 기존 사실 불변 |
| 비교 단위 | 주장 그룹과 분류 | common/different/unique 규칙 |
| 저장 통합 | 불변 결과, 리비전, 삭제 | 재현성과 개인정보 |
| 화면 통합 | 입력·자격·진행·부분 실패 | DOM 상태와 접근성 |
| E2E | 시작부터 비교·상세·공유·삭제 | 실제 사용자 흐름 |
| 시각 QA | 모바일·데스크톱·큰 글씨·고대비 | 렌더링 캡처와 수동 검토 |

### 28.2 비교 단위 테스트 필수 사례

1. 같은 주제에 두 체계가 `supports`이면 `common`이다.
2. 같은 주제에 두 체계가 `cautions`이면 `common`이다.
3. 같은 주제에 `supports`와 `cautions`가 있으면 `different`다.
4. 반대 주장이 있으면 같은 항목이 `common`에도 중복되지 않는다.
5. 하나의 완전 주장만 있고 네 체계가 모두 완료되면 `unique`다.
6. 하나의 주장만 있지만 다른 체계가 실패했다면 `partialUnique`다.
7. 근거 사실 ID가 없으면 비교에서 제외된다.
8. 존재하지 않는 사실 ID를 가리키면 비교 생성이 검증 실패한다.
9. 완료 결과가 하나면 비교 상태는 `unavailable`이다.
10. 완료 결과가 둘이면 부분 비교가 생성된다.
11. `mixed` 둘을 자동 공통으로 묶지 않는다.
12. 표시 우선순위가 진실 점수나 체계 가중치에 영향을 주지 않는다.

### 28.3 입력과 자격 테스트 필수 사례

1. 정확한 날짜·시각·위치가 있고 네 정책이 활성일 때 네 자격 결과가 반환된다.
2. 출생시각 `unknown`에서 시각 필수 체계는 `needs_input`이다.
3. 대략 시각을 정확 시각으로 취급하지 않는다.
4. 정책이 부분 계산을 명시한 체계만 `partial`이 된다.
5. `draft` 정책은 입력이 충분해도 `policy_unverified`다.
6. 같은 지명 후보가 여러 개면 위치 선택 전 계산할 수 없다.
7. IANA 시각대가 해결되지 않으면 시각대 필요 체계를 실행하지 않는다.
8. 음력 윤달 플래그 모순을 거부한다.
9. 지원 범위 밖 날짜를 명시적 코드로 거부한다.
10. 전통 계산용 성별값 미입력은 그 값을 요구하는 체계만 막는다.

### 28.4 부분 실패 테스트 필수 사례

1. 네 엔진 중 하나가 로드 실패해도 나머지 완료 결과를 보존한다.
2. 한 엔진 재시도가 다른 결과를 다시 계산하지 않는다.
3. 사실 검증 실패 결과는 사용자에게 노출되지 않는다.
4. 두 체계 완료 후 비교를 보고 있는 동안 세 번째 결과가 도착해도 스크롤과 포커스를 빼앗지 않는다.
5. 새 결과 반영은 새 비교 리비전을 만든다.
6. 계산 취소가 완료 결과를 삭제하지 않는다.

### 28.5 개인정보 테스트 필수 사례

1. 분석 이벤트에 출생일·시각·좌표·ID가 없다.
2. 공유 기본 미리보기에 원출생정보가 없다.
3. 공유 ID로 원 결과 API에 접근할 수 없다.
4. 번들 삭제 후 연결된 비공개 결과를 조회할 수 없다.
5. 공유 폐기 후 링크가 더 이상 작동하지 않는다.
6. 동의하지 않은 사용자의 기록이 새 세션에서 복원되지 않는다.

### 28.6 접근성 테스트 필수 사례

1. 키보드만으로 프로필 입력부터 비교 상세까지 이동한다.
2. 오류 후 첫 오류 필드로 이동한다.
3. 계산 상태가 스크린리더에 중복 과다 없이 전달된다.
4. 체계 색을 제거해도 상태와 분류를 이해할 수 있다.
5. 400% 확대에서 핵심 작업을 완료한다.
6. 큰 글씨 모드에서 카드 문구가 잘리지 않는다.
7. 모션 감소 설정에서 반복 애니메이션이 없다.

---

## 29. 인수 조건

### AC-01 한 번의 입력

사용자가 하나의 출생 프로필을 제출하면 동일한 정규화 프로필을 참조하는 체계별 자격 결과 네 개가 생성된다. 각 엔진은 자체 정책 입력으로 다시 변환할 수 있지만 사용자에게 같은 정보를 반복 입력시키지 않는다.

### AC-02 점진적 요구

공통 필드만 먼저 보이며, 추가 필드는 활성 정책이 요구할 때 이유와 함께 나타난다. 비활성 정책 때문에 불필요한 민감 정보를 미리 받지 않는다.

### AC-03 미상 시각

출생시각을 모른다고 선택하면 임의 시각을 주입하지 않는다. 가능한 체계와 불가능한 체계를 각각 정확한 이유와 함께 보여준다.

### AC-04 정책 게이트

세 신규 엔진은 승인 전 `policy_unverified`이며 실제 결과를 반환하지 않는다. 기능 플래그도 이 규칙을 우회할 수 없다.

### AC-05 독립 실패

한 체계 계산이 실패해도 성공한 체계 결과를 읽고 저장할 수 있다. 해당 체계만 재시도할 수 있다.

### AC-06 비교 최소 조건

완료된 체계 결과가 둘 이상이고 유효한 정규화 주장이 있을 때만 비교 섹션이 생성된다.

### AC-07 공통·차이·고유

12장의 규칙대로 분류되며 한 주제가 중복 기본 분류에 들어가지 않는다. 모든 비교 카드는 참여 체계와 근거 사실로 이동할 수 있다.

### AC-08 점수 없음

제품 UI, 저장 스키마, 분석 이벤트에 정확도·일치율·승자 점수가 없다.

### AC-09 근거

체계별 상세에서 정책 ID, 엔진 버전, 입력 완전성, 사실 근거를 확인할 수 있다. 근거가 깨진 주장은 비교에서 제외된다.

### AC-10 기존 사주 회귀 없음

새 어댑터 전후의 기존 사주 골든 입력에서 핵심 사실이 동일하다. 기존 개인·커플 사용자 흐름이 유지된다.

### AC-11 저장 동의

사용자가 저장에 동의하지 않으면 새 세션에서 프로필과 결과가 복원되지 않는다.

### AC-12 안전한 공유

기본 공유물에는 출생일, 시각, 위치, 좌표, 원 결과 ID가 없다. 공유 전 미리보기와 폐기 기능이 있다.

### AC-13 접근성

키보드, 스크린리더, 큰 글씨, 모션 감소, 400% 확대의 핵심 흐름이 동작하고 의미를 색만으로 전달하지 않는다.

### AC-14 성능

25장의 예산을 측정하며 큰 신규 엔진은 초기 셸에서 분리 로드된다. 성능 최적화로 계산 정확도나 정책 검증을 생략하지 않는다.

### AC-15 결제 독립성

결제 권한을 바꿔도 동일 입력·정책의 계산 사실과 기본 비교 분류는 바뀌지 않는다.

### AC-16 삭제

기기 기록, 서버 동기화, 공유 스냅샷의 삭제 범위와 상태를 사용자가 확인할 수 있다.

---

## 30. 단계별 구현 순서

새 전통의 계산 검증과 플랫폼 공사를 분리한다.

### Phase 0. 문서와 정책 레지스트리

- 이 제품 명세 승인
- 체계 식별자와 상태 모델 확정
- 계산 정책 레지스트리 문서 작성
- 세 신규 체계의 출처 조사 책임자 지정

완료 조건: 코드가 아니라 승인된 계약과 조사 게이트가 있다.

### Phase 1. 공통 셸과 사주 어댑터

- 공통 프로필 v2
- 정책 레지스트리 런타임 shape
- 자격 판정기
- 기존 사주 어댑터
- 번들·저장 스키마
- 입력, 진행, 체계 상세 공통 화면

완료 조건: 기존 사주 사실이 변하지 않고 `saju` 한 체계 번들을 만들 수 있다. 이 단계에서는 비교를 만들지 않는다.

### Phase 2. 마하보테 내부 엔진

첫 신규 엔진 후보로 삼되, 18장 게이트를 통과한 뒤에만 구현·활성화한다.

완료 조건: 승인 정책, 독립 오라클, 골든 픽스처, 접근성·성능 검증을 통과하고 내부 플래그에서 체계별 결과를 볼 수 있다.

### Phase 3. 뜨비 내부 엔진

표와 변형이 많은 영역을 정책 데이터로 분리하고 전체 근거 참조를 만든다.

완료 조건: 18장 게이트와 체계별 상세·근거 검증을 통과한다.

### Phase 4. 호라삿 내부 엔진

위치·시각대·천체 계산 경계를 포함한 정책을 확정하고 무결성 검증을 연결한다.

완료 조건: 18장 게이트와 체계별 상세·근거 검증을 통과한다.

### Phase 5. 비교 프로젝터

- 비교 주제 사전 v1
- 체계별 주장 프로젝터
- common/different/unique 분류기
- 근거 서랍과 부분 비교
- 비교 리비전

완료 조건: 28장의 비교 테스트와 29장의 비교 인수 조건을 모두 만족한다.

### Phase 6. 공개 4체계 출시

- 네 정책 `active`
- 전체 E2E와 시각 QA
- 개인정보·안전 검토
- 성능 예산 확인
- 운영 모니터링과 롤백 manifest

공개 홈에서 `네 전통 비교`를 약속하려면 네 체계가 모두 실제로 활성화되어야 한다. 그 전의 체계별 내부 베타를 4체계 완성처럼 홍보하지 않는다.

### Phase 7. 유료 심화와 재방문

무료 핵심 결과와 데이터 권리는 그대로 둔 채 심화 장, 저널, 동기화를 추가한다.

---

## 31. 출시 게이트와 롤백

### 31.1 공개 전 필수 게이트

```text
[ ] 기존 개인·커플 사주 회귀 없음
[ ] 네 정책 상태 active
[ ] 각 엔진 골든 픽스처 100% 통과
[ ] 정책·표 digest 검증 통과
[ ] 공통·차이·고유 비교 테스트 통과
[ ] 부분 실패와 재시도 E2E 통과
[ ] 공유 개인정보 검토 통과
[ ] 데이터 내보내기·삭제 검증
[ ] 키보드·스크린리더·큰 글씨·모션 감소 검증
[ ] 모바일·태블릿·데스크톱 시각 QA
[ ] 성능 예산 측정
[ ] 안전 문구 및 번역 검토
[ ] 오류율과 엔진별 비활성화 운영 절차 준비
```

### 31.2 체계별 킬 스위치

- 운영 중 결함이 확인되면 해당 정책만 `active -> deprecated` 또는 비활성 manifest로 내릴 수 있어야 한다.
- 다른 체계와 기존 사주는 계속 사용할 수 있어야 한다.
- 이미 저장된 결과는 정책 버전과 함께 읽을 수 있지만 `현재 정책이 중단됨`을 표시한다.
- 비활성 체계가 빠진 비교는 자동 재작성하지 않는다. 새 리비전을 사용자가 요청할 때 만든다.

### 31.3 롤백 금지 사항

- 결과를 임의 문구로 대체
- 실패를 성공으로 표시
- 이전 정책 ID로 새 알고리즘 실행
- 정책 digest 검증 생략
- 출처·오라클 게이트를 기능 플래그로 우회

---

## 32. 구현 결정 기록

이 문서에서 확정된 결정은 다음과 같다.

| 결정 | 선택 | 이유 |
| --- | --- | --- |
| 기본 사용자 단위 | 개인 1명 | 네 체계 비교의 의미를 먼저 검증 |
| 입력 방식 | 한 번 입력 + 점진적 추가 | 불필요한 민감 정보와 반복 입력 감소 |
| 엔진 구조 | 체계별 독립 | 전통과 정책을 섞지 않고 실패 격리 |
| 비교 방식 | 공통·차이·고유 | 점수 없이 차이를 읽기 쉬움 |
| 비교 입력 | 근거가 잠긴 정규화 주장 | 원본 사실 혼합과 AI 환각 차단 |
| 기본 계산 | 결정론 | 재현성과 검증 가능성 |
| AI | P0 계산·비교에 사용 안 함 | 계산 정확성과 근거 보존 |
| 정책 버전 | 결과에 고정 | 과거 결과 재현 |
| 저장 | 동의 기반 로컬 우선 | 출생 정보 최소 보존 |
| 공유 | 비식별 스냅샷 | 원 프로필 노출 방지 |
| 유료화 | 무료 핵심 가치 뒤 심화 | 신뢰와 사용자 선택권 보존 |
| 공개 출시 | 네 체계 모두 active 후 | 제품 약속과 실제 기능 일치 |

### 32.1 구현 전에 아직 채워야 하는 외부 결정

아래는 제품 설계 미결이 아니라 계산 권위가 필요한 차단 항목이다.

- 호라삿의 채택 학파, 천체·하우스·세차 정책과 독립 오라클
- Tử Vi의 채택 학파, 달력·궁·별·주기 표와 독립 오라클
- Mahabote의 달력·요일 경계·배치 정책과 독립 오라클
- 세 체계 출처의 사용 라이선스
- 전문가 검토 책임자와 승인 기록

이 항목이 비어 있어도 공통 UI, 자격 판정, 결과 봉투, 저장, 비교 프로젝터의 구조는 구현할 수 있다. 그러나 해당 체계의 실제 계산 결과를 구현 완료로 선언할 수는 없다.

---

## 33. 구현 완료의 정의

문서 작성, 화면 껍데기, 샘플 JSON, 상용 사이트와 비슷한 출력만으로 완료라고 하지 않는다.

4체계 비교 v1은 다음을 모두 만족할 때만 완료다.

1. 한국 사주 기준선이 유지된다.
2. 세 신규 체계가 각각 출처·오라클 게이트를 통과한다.
3. 네 엔진이 동일 프로필에서 독립 결과를 만든다.
4. 입력 부족과 부분 결과를 추정 없이 처리한다.
5. 비교는 근거가 잠긴 주장만으로 만들어진다.
6. 공통·차이·고유가 규칙대로 분류된다.
7. 점수와 승자 없이 차이를 설명한다.
8. 사용자가 체계별 원본 사실과 정책으로 돌아갈 수 있다.
9. 저장·공유·삭제가 개인정보 기본값을 지킨다.
10. 접근성·성능·안전·회귀 검증이 통과한다.
11. 공개 제품 문구와 실제 활성 체계가 일치한다.

---

## 34. 문서 간 우선순위

충돌 시 다음 순서로 해석한다.

1. `CALCULATION-POLICY-REGISTRY.md`, 체계별 승인 계산 정책 문서, 정책 manifest: 활성 상태, 계산 공식, 입력, 지원 범위, 공통 enum
2. 이 문서: 다전통 제품 흐름, 공통 계약, 비교 의미론
3. `PRD.md`: 전체 제품 우선순위와 출시 범위
4. `DATA-ARCHITECTURE.md`: 저장·전송 구현 상세
5. `DESIGN.md`, `DESIGN-SYSTEM.md`: 시각·상호작용 상세
6. `PROJECT_STATUS.md`: 현재 실제 구현 상태

`PROJECT_STATUS.md`가 이 문서보다 기능 수가 적더라도 모순이 아니다. 이 문서는 목표 계약이고, `PROJECT_STATUS.md`는 현재 증거를 기록한다.

---

## 35. 참고 링크

### 제품·UX 참고

- [Horasat](https://horasat.kr/): 한국어 다전통 점성술 제품 흐름 참고. 계산 권위 자료로 사용하지 않는다.
- [Co-Star - App Store](https://apps.apple.com/us/app/co-star-personalized-astrology/id1264782561): 개인 결과, 비교, 재방문, 심화 콘텐츠 구조 참고.
- [CHANI - App Store](https://apps.apple.com/us/app/chani-your-astrology-guide/id1532791252): 무료 첫 가치와 깊은 콘텐츠 계층 참고.
- [Finch - App Store](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748): 짧은 체크인과 기록 기반 재방문 루프 참고.

### 계산 출처

이 문서에는 세 신규 엔진의 계산 권위 자료를 확정해 넣지 않았다. 각 체계의 승인 출처, 판본, 규칙 위치, 라이선스, 오라클은 별도 계산 정책 레지스트리와 체계별 정책 문서에 기록해야 한다. 제품 참고 링크를 계산 출처로 승격해서는 안 된다.
