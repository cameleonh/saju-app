# Reading Pattern DB · 설계 문서

> 결정일: 2026-08-05
> 방향: 혜민 샘플 기반 자연어 리딩 DB (deterministic, LLM 사전 생성, DB pinned)
> 프로토타입: `prototype/reading-natural.html` (무토×기해년)

## 1. 아키텍처 개요

```
┌──────────────────────────────────────────────────────────┐
│ Layer 0: Engine (기존, 변경 없음)                         │
│   chart/natal-engine.mjs → 명식 계산                      │
│   chart/daewoon-engine.mjs → 대운 계산                     │
│   server/domain/annual.mjs → 연운 facts 계산               │
│   출력: { dayMaster, yearStem, yearBranch, tenGod, ... }  │
└──────────────────────┬───────────────────────────────────┘
                       ▼ 패턴 키
┌──────────────────────────────────────────────────────────┐
│ Layer 1: Pattern Lookup (신규)                            │
│   pattern_id = f(dayMaster, yearStem, yearBranch)         │
│   → content.pattern_keys에서 조회                          │
│   → content.card_modules + domain_modules + monthly_slots │
└──────────────────────┬───────────────────────────────────┘
                       ▼ 텍스트 모듈
┌──────────────────────────────────────────────────────────┐
│ Layer 2: Composer (신규, 기존 buildAnnualCards 대체)       │
│   카드 8장 조립 (Layer 1 카드뉴스)                         │
│   13항목 + 24슬롯 조립 (Layer 2 정밀 리딩)                 │
│   → 기존 annual-card.v1 스키마 출력 (UI 변경 불필요)       │
└──────────────────────────────────────────────────────────┘
```

## 2. 패턴 키 구조

```
pattern_id = "{day_master}_{year_stem}_{year_branch}"
예: "무_기_해"  (무토 × 기해년)

조회 차원:
  day_master    ∈ {갑,을,병,정,무,기,경,신,임,계}  (10)
  year_stem     ∈ {갑,을,병,정,무,기,경,신,임,계}  (10)
  year_branch   ∈ {자,축,인,묘,진,사,오,미,신,유,술,해}  (12)

이론적 최대: 10 × 10 × 12 = 1,200 패턴
실제 유효 조합(60갑자 × 10간): 600 패턴
```

## 3. 데이터 규모 추정

| 레이어 | 항목 수 | 패턴 수 | 텍스트/항목 | 총 분량 |
|---|---|---|---|---|
| Layer 1 카드 | 8장 | 600 | ~500자 | ~2.4 MB |
| Layer 2 항목 | 13개 | 600 | ~800자 | ~6.2 MB |
| 월별 슬롯 | 24개 | 600 | ~200자 | ~2.9 MB |
| **합계** | | | | **~11.5 MB** |

SQLite에 여유. PostgreSQL 마이그레이션 시에도 부담 없음.

## 4. 기존 코드 통합 지점

### 교체 대상: `server/domain/annual-rules.mjs`

```javascript
// 현재 (before):
export const TEN_GOD_GUIDANCE = Object.freeze({
  비견: { theme: '...', keywords: [...], ... },  // 10개 × 5줄 = 50줄
});

export function buildAnnualCards(facts, targetYear, profile, ruleSet) {
  // TEN_GOD_GUIDANCE[tenGod] → 템플릿 fill → 8 cards
}

// 목표 (after):
export async function buildAnnualCards(facts, targetYear, profile, readingStore) {
  const patternId = derivePatternId(facts);  // "무_기_해"
  const modules = await readingStore.getCardModules(patternId);
  // modules → 8 cards (DB pinned 텍스트)
}
```

### 변경 범위
- `server/domain/annual-rules.mjs` — `TEN_GOD_GUIDANCE` 제거, DB 조회로 교체
- `server/domain/annual.mjs` — `buildAnnualCards` 호출 시 readingStore 주입
- `server/http.mjs` — `/v1/annual-readings` 핸들러에 readingStore 연결
- `server/storage/sqlite.mjs` — reading_patterns 테이블 쿼리 메서드 추가
- **변경하지 않음**: `annual/client.mjs`, `index.html`, 카드 스키마, UI 렌더링

### 새 파일
- `server/storage/readings.mjs` — readingStore 어댑터 (SQLite 우선)
- `server/domain/reading-composer.mjs` — Layer 2 정밀 리딩 조립

## 5. 데이터 생성 전략

### Phase 1: 시드 패턴 (1개, 완료)
- 무토 × 기해년 — 프로토타입 `reading-natural.html`의 텍스트
- 검수 기준점 확립

### Phase 2: 일간별 시드 (10개)
- 10간 각각에 대해 대표 연운 1패턴씩 작성
- 일간별 기조 톤 확립 (무토=산/묵직, 갑목=나무/성장, 병화=태양/밝음, ...)

### Phase 3: 십신별 확장 (~20패턴)
- 일간 × 십신 10조합의 대표 패턴
- 같은 일간이라도 십신에 따라 톤이 어떻게 바뀌는지 검증

### Phase 4: 전체 패턴 (600개)
- LLM(Qwen)으로 60갑자 × 10간 일간 생성
- 각 패턴별 검수 → 승인(approved) 상태만 서비스

### 생성 방식
```
LLM 프롬프트:
  system: "명리학 전문가 톤, 한자 최소화, 2인칭 처방적, ~하셔야 합니다"
  user:   "일간={day_master}, 연간={year_stem}(십신={ten_god}),
           연지={year_branch}(의미={meaning})에 대한 2019년 풀이를 작성"
  → card_modules 8개 + domain_modules 13개 + monthly_slots 24개
```

## 6. 품질 관리

- `review_status`: draft → reviewed → approved → (rejected)
- approved 상태만 런타임에 서비스
- `content_version`: 텍스트 개정 시 버전 증가
- `reviewer`: 검수자 기록
- 샘플 기준점: 혜민 원본 (`자료/전윤경 戊土 2019년 신수.docx`)

## 7. 프라이버시 보장

- 이 DB에는 **사용자 개인정보가 한 글자도 없습니다**
- 오직 "패턴 → 텍스트" 매핑
- 런타임에 외부 API 호출 0
- 생년월시는 로컬에서만 처리, 패턴 키만 DB로 전달
- PIPA / 크로스보더 이전 리스크 제로
