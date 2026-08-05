-- Reading Pattern DB · 004_reading_patterns.sql
-- 사주 리딩 패턴 데이터베이스 스키마
-- 결정일: 2026-08-05 · 방향: 혜민 샘플 기반 자연어 리딩 DB
--
-- 핵심 원칙:
-- 1. 이 스키마는 사용자 개인정보와 완전히 분리된 순수 콘텐츠 DB입니다.
-- 2. 생년월시, 이름, 계정 정보가 한 글자도 들어가지 않습니다.
-- 3. 오직 "패턴 키 → 리딩 텍스트" 매핑만 저장합니다.
-- 4. deterministic 정책: 같은 패턴 키 → 같은 텍스트 (DB pinned, 런타임 LLM 호출 없음)
-- 5. SQLite(개발) / PostgreSQL(프로덕션) 양쪽에서 동작하는 표준 SQL만 사용합니다.

create schema if not exists content;

-- ============================================================
-- 1. 패턴 키 레지스트리 (pattern_keys)
-- ============================================================
-- 모든 리딩 패턴의 "키"를 정의합니다.
-- 패턴 키는 명리학적 차원(일간, 연간, 연지, 십신, 충/합)의 조합입니다.

create table if not exists content.pattern_keys (
  pattern_id       text primary key,
  -- 명리학적 차원
  day_master       text not null check (day_master in ('갑','을','병','정','무','기','경','신','임','계')),
  year_stem        text not null check (year_stem in ('갑','을','병','정','무','기','경','신','임','계')),
  year_branch      text not null check (year_branch in ('자','축','인','묘','진','사','오','미','신','유','술','해')),
  -- 도출값 (엔진이 계산, DB에 pinned)
  ten_god_stem     text not null check (ten_god_stem in ('비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인')),
  branch_relation  text not null default 'none',
  -- 메타
  label            text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (day_master, year_stem, year_branch)
);

-- ============================================================
-- 2. Layer 1 — 카드뉴스 텍스트 모듈 (card_modules)
-- ============================================================
-- 기존 annual-rules.mjs의 카드 구조와 1:1 대응.
-- cardType: cover / overall / work / money / relationships / growth / action / method

create table if not exists content.card_modules (
  module_id        text primary key,
  pattern_id       text not null references content.pattern_keys(pattern_id),
  card_type        text not null check (card_type in (
    'cover','overall','work','money','relationships','growth','action','method'
  )),
  card_index       integer not null check (card_index between 1 and 8),
  -- 카드 필드 (기존 annual-card.v1 스키마와 동일)
  title            text not null,
  summary          text not null,
  keywords         jsonb not null default '[]',      -- ["경쟁·기싸움", "이동·변화", ...]
  bullets          jsonb not null default '[]',      -- ["...", "...", "..."]
  action           text not null,                     -- "해볼 일"
  watch            text not null,                     -- "주의"
  evidence         jsonb not null default '[]',      -- ["annual.year.pillar", ...]
  -- 품질 관리
  tone             text not null default 'natural' check (tone in ('natural','formal','expert')),
  char_count       integer not null default 0,
  -- 버전 관리
  content_version  text not null default '1.0.0',
  review_status    text not null default 'draft' check (review_status in ('draft','reviewed','approved','rejected')),
  reviewer         text,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (pattern_id, card_type),
  unique (pattern_id, card_index)
);

-- ============================================================
-- 3. Layer 2 — 정밀 리딩 항목 텍스트 (domain_modules)
-- ============================================================
-- 13개 항목: 마음가짐/인간관계/건강/직업/가족/애정/재물/패션/날씨/물품/피할기운/이로운기운/해야할일

create table if not exists content.domain_modules (
  module_id        text primary key,
  pattern_id       text not null references content.pattern_keys(pattern_id),
  domain_key       text not null check (domain_key in (
    'mindset','relationships','health','career','family','romance',
    'wealth','fashion','season','purchases','avoid','favorable','must_do'
  )),
  domain_label     text not null,
  domain_index     integer not null check (domain_index between 1 and 13),
  -- 항목 내용
  points           jsonb not null default '[]',      -- ["첫째, ...", "둘째, ..."]
  closing          text,                             -- 마무리 문장 (선택)
  -- 품질 관리
  tone             text not null default 'natural',
  char_count       integer not null default 0,
  content_version  text not null default '1.0.0',
  review_status    text not null default 'draft',
  reviewer         text,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (pattern_id, domain_key)
);

-- ============================================================
-- 4. Layer 2 — 월별 슬롯 텍스트 (monthly_slots)
-- ============================================================
-- 12개월 × 전반기/후반기 = 24슬롯
-- 월주(60갑자) × 일간 패턴별 텍스트

create table if not exists content.monthly_slots (
  slot_id          text primary key,
  pattern_id       text not null references content.pattern_keys(pattern_id),
  lunar_month      integer not null check (lunar_month between 1 and 12),
  month_pillar     text not null,                     -- 예: "병인월"
  half             text not null check (half in ('first','second')),
  -- 슬롯 내용
  guidance         text not null,                     -- 전반기/후반기 텍스트
  -- 품질 관리
  tone             text not null default 'natural',
  char_count       integer not null default 0,
  content_version  text not null default '1.0.0',
  review_status    text not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (pattern_id, lunar_month, half)
);

-- ============================================================
-- 5. 리딩 템플릿 메타 (reading_templates)
-- ============================================================
-- LLM 생성 시 사용한 프롬프트 템플릿 기록 (재현성 추적용)

create table if not exists content.reading_templates (
  template_id      text primary key,
  layer            text not null check (layer in ('card','domain','monthly')),
  system_prompt    text not null,
  user_prompt_tmpl text not null,                     -- {day_master}, {year_stem} 등 플레이스홀더
  model_id         text not null,
  model_version    text not null,
  seed             integer,                           -- 재현성용 (옵션)
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 인덱스
-- ============================================================
create index if not exists idx_card_pattern on content.card_modules(pattern_id);
create index if not exists idx_card_type on content.card_modules(card_type);
create index if not exists idx_domain_pattern on content.domain_modules(pattern_id);
create index if not exists idx_domain_key on content.domain_modules(domain_key);
create index if not exists idx_monthly_pattern on content.monthly_slots(pattern_id);
create index if not exists idx_monthly_month on content.monthly_slots(lunar_month);
create index if not exists idx_pattern_lookup on content.pattern_keys(day_master, year_stem, year_branch);
create index if not exists idx_pattern_tengod on content.pattern_keys(ten_god_stem);
create index if not exists idx_review_status on content.card_modules(review_status);
create index if not exists idx_domain_review on content.domain_modules(review_status);
create index if not exists idx_monthly_review on content.monthly_slots(review_status);
