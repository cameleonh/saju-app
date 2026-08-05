-- Reading Pattern DB · 005_month_branch_patterns.sql
-- 월지 패턴 데이터베이스 스키마 (10 일간 × 12 월지 = 120 패턴)
-- 결정일: 2026-08-06
--
-- 핵심 원칙:
-- 1. 004_reading_patterns.sql과 동일한 원칙: 순수 콘텐츠 DB, 개인정보 없음.
-- 2. 월지 패턴은 (day_master, month_branch) 조합 → 8개 도메인 모듈.
-- 3. SQLite runtime DDL(readings.mjs)의 reading_month_pattern_keys / reading_month_modules와
--    논리 스키마가 1:1로 대응합니다.
-- 4. deterministic 정책: 같은 패턴 키 → 같은 텍스트 (DB pinned, 런타임 LLM 호출 없음).

-- ============================================================
-- 1. 월지 패턴 키 레지스트리 (month_pattern_keys)
-- ============================================================

create table if not exists content.month_pattern_keys (
  month_pattern_id    text primary key,
  day_master          text not null check (day_master in ('갑','을','병','정','무','기','경','신','임','계')),
  month_branch        text not null check (month_branch in ('자','축','인','묘','진','사','오','미','신','유','술','해')),
  season              text not null check (season in ('봄','여름','가을','겨울')),
  element_interaction text not null,
  label               text not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (day_master, month_branch)
);

-- ============================================================
-- 2. 월지 도메인 모듈 텍스트 (month_modules)
-- ============================================================
-- 8개 도메인: mindset / health / career / romance / wealth / relationships / growth / must_do
-- (연간 패턴의 13개 도메인과 다름 — 월지는 8개로 구성)

create table if not exists content.month_modules (
  module_id         text primary key,
  month_pattern_id  text not null references content.month_pattern_keys(month_pattern_id),
  domain_key        text not null check (domain_key in (
    'mindset','health','career','romance','wealth','relationships','growth','must_do'
  )),
  domain_label      text not null,
  domain_index      integer not null check (domain_index between 1 and 8),
  -- 내용
  points            jsonb not null default '[]',
  closing           text,
  -- 품질 관리
  tone              text not null default 'natural' check (tone in ('natural','formal','expert')),
  char_count        integer not null default 0,
  content_version   text not null default '1.0.0',
  review_status     text not null default 'draft' check (review_status in ('draft','reviewed','approved','rejected')),
  reviewer          text,
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (month_pattern_id, domain_key),
  unique (month_pattern_id, domain_index)
);

-- ============================================================
-- 인덱스
-- ============================================================
create index if not exists idx_month_pattern_lookup on content.month_pattern_keys(day_master, month_branch);
create index if not exists idx_month_module_pattern on content.month_modules(month_pattern_id);
create index if not exists idx_month_module_key on content.month_modules(domain_key);
create index if not exists idx_month_review on content.month_modules(review_status);
