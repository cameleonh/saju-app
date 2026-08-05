// server/storage/readings.mjs
// Reading Pattern DB 어댑터 (SQLite)
// content.pattern_keys / card_modules / domain_modules / monthly_slots 조회
// 자체 스키마를 초기화하고 시드 데이터를 로드합니다.
//
// 스키마 정합: db/migrations/004_reading_patterns.sql (연간 패턴) 및
// 005_month_branch_patterns.sql (월지 패턴)이 PostgreSQL 프로덕션 스키마를
// 정의합니다. 아래 DDL은 논리적으로 동일한 스키마를 SQLite 구문으로 표현하며,
// char_count / content_version / reviewer / reviewed_at 등 품질 관리 컬럼을 포함합니다.

const DAY_MASTER_HANGUL = Object.freeze({
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
  '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
});

const YEAR_BRANCH_HANGUL = Object.freeze({
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
  '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
});

export function derivePatternId({ dayStem, yearStem, yearBranch } = {}) {
  const dm = DAY_MASTER_HANGUL[dayStem];
  const ys = DAY_MASTER_HANGUL[yearStem];
  const yb = YEAR_BRANCH_HANGUL[yearBranch];
  if (!dm || !ys || !yb) return null;
  return `${dm}_${ys}_${yb}`;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS reading_pattern_keys (
  pattern_id    TEXT PRIMARY KEY,
  day_master    TEXT NOT NULL CHECK (day_master in ('갑','을','병','정','무','기','경','신','임','계')),
  year_stem     TEXT NOT NULL CHECK (year_stem in ('갑','을','병','정','무','기','경','신','임','계')),
  year_branch   TEXT NOT NULL CHECK (year_branch in ('자','축','인','묘','진','사','오','미','신','유','술','해')),
  ten_god_stem  TEXT NOT NULL CHECK (ten_god_stem in ('비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인')),
  branch_relation TEXT NOT NULL DEFAULT 'none',
  label         TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (day_master, year_stem, year_branch)
);

CREATE TABLE IF NOT EXISTS reading_card_modules (
  module_id      TEXT PRIMARY KEY,
  pattern_id     TEXT NOT NULL REFERENCES reading_pattern_keys(pattern_id),
  card_type      TEXT NOT NULL CHECK (card_type in ('cover','overall','work','money','relationships','growth','action','method')),
  card_index     INTEGER NOT NULL CHECK (card_index between 1 and 8),
  title          TEXT NOT NULL,
  summary        TEXT NOT NULL,
  keywords       TEXT NOT NULL DEFAULT '[]',
  bullets        TEXT NOT NULL DEFAULT '[]',
  action         TEXT NOT NULL,
  watch          TEXT NOT NULL,
  evidence       TEXT NOT NULL DEFAULT '[]',
  tone           TEXT NOT NULL DEFAULT 'natural' CHECK (tone in ('natural','formal','expert')),
  char_count     INTEGER NOT NULL DEFAULT 0,
  content_version TEXT NOT NULL DEFAULT '1.0.0',
  review_status  TEXT NOT NULL DEFAULT 'draft' CHECK (review_status in ('draft','reviewed','approved','rejected')),
  reviewer       TEXT,
  reviewed_at    TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (pattern_id, card_type),
  UNIQUE (pattern_id, card_index)
);

CREATE TABLE IF NOT EXISTS reading_domain_modules (
  module_id      TEXT PRIMARY KEY,
  pattern_id     TEXT NOT NULL REFERENCES reading_pattern_keys(pattern_id),
  domain_key     TEXT NOT NULL CHECK (domain_key in ('mindset','relationships','health','career','family','romance','wealth','fashion','season','purchases','avoid','favorable','must_do')),
  domain_label   TEXT NOT NULL,
  domain_index   INTEGER NOT NULL CHECK (domain_index between 1 and 13),
  points         TEXT NOT NULL DEFAULT '[]',
  closing        TEXT,
  tone           TEXT NOT NULL DEFAULT 'natural',
  char_count     INTEGER NOT NULL DEFAULT 0,
  content_version TEXT NOT NULL DEFAULT '1.0.0',
  review_status  TEXT NOT NULL DEFAULT 'draft' CHECK (review_status in ('draft','reviewed','approved','rejected')),
  reviewer       TEXT,
  reviewed_at    TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (pattern_id, domain_key)
);

CREATE TABLE IF NOT EXISTS reading_monthly_slots (
  slot_id        TEXT PRIMARY KEY,
  pattern_id     TEXT NOT NULL REFERENCES reading_pattern_keys(pattern_id),
  lunar_month    INTEGER NOT NULL CHECK (lunar_month between 1 and 12),
  month_pillar   TEXT NOT NULL,
  half           TEXT NOT NULL CHECK (half in ('first','second')),
  guidance       TEXT NOT NULL,
  tone           TEXT NOT NULL DEFAULT 'natural',
  char_count     INTEGER NOT NULL DEFAULT 0,
  content_version TEXT NOT NULL DEFAULT '1.0.0',
  review_status  TEXT NOT NULL DEFAULT 'draft' CHECK (review_status in ('draft','reviewed','approved','rejected')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (pattern_id, lunar_month, half)
);

CREATE INDEX IF NOT EXISTS idx_card_pattern ON reading_card_modules(pattern_id);
CREATE INDEX IF NOT EXISTS idx_domain_pattern ON reading_domain_modules(pattern_id);
CREATE INDEX IF NOT EXISTS idx_monthly_pattern ON reading_monthly_slots(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_lookup ON reading_pattern_keys(day_master, year_stem, year_branch);

CREATE TABLE IF NOT EXISTS reading_month_pattern_keys (
  month_pattern_id   TEXT PRIMARY KEY,
  day_master         TEXT NOT NULL CHECK (day_master in ('갑','을','병','정','무','기','경','신','임','계')),
  month_branch       TEXT NOT NULL CHECK (month_branch in ('자','축','인','묘','진','사','오','미','신','유','술','해')),
  season             TEXT NOT NULL CHECK (season in ('봄','여름','가을','겨울')),
  element_interaction TEXT NOT NULL,
  label              TEXT NOT NULL,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (day_master, month_branch)
);

CREATE TABLE IF NOT EXISTS reading_month_modules (
  module_id      TEXT PRIMARY KEY,
  month_pattern_id TEXT NOT NULL REFERENCES reading_month_pattern_keys(month_pattern_id),
  domain_key     TEXT NOT NULL CHECK (domain_key in ('mindset','health','career','romance','wealth','relationships','growth','must_do')),
  domain_label   TEXT NOT NULL,
  domain_index   INTEGER NOT NULL CHECK (domain_index between 1 and 8),
  points         TEXT NOT NULL DEFAULT '[]',
  closing        TEXT,
  tone           TEXT NOT NULL DEFAULT 'natural' CHECK (tone in ('natural','formal','expert')),
  char_count     INTEGER NOT NULL DEFAULT 0,
  content_version TEXT NOT NULL DEFAULT '1.0.0',
  review_status  TEXT NOT NULL DEFAULT 'draft' CHECK (review_status in ('draft','reviewed','approved','rejected')),
  reviewer       TEXT,
  reviewed_at    TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (month_pattern_id, domain_key),
  UNIQUE (month_pattern_id, domain_index)
);

CREATE INDEX IF NOT EXISTS idx_month_pattern_lookup ON reading_month_pattern_keys(day_master, month_branch);
CREATE INDEX IF NOT EXISTS idx_month_module_pattern ON reading_month_modules(month_pattern_id);
`;

import { MU_GI_HAE_SEED } from './seed-mu-gi-hae.mjs';

// 10간 시드 파일들 (에이전트가 작성, 없으면 자동 무시)
let _extraSeeds = [];
try { const m = await import('./seeds/gap-eul-seeds.mjs'); if (m.GAP_EUL_SEEDS?.patterns) _extraSeeds.push(...m.GAP_EUL_SEEDS.patterns); } catch {}
try { const m = await import('./seeds/byeong-jeong-seeds.mjs'); if (m.BYEONG_JEONG_SEEDS?.patterns) _extraSeeds.push(...m.BYEONG_JEONG_SEEDS.patterns); } catch {}
try { const m = await import('./seeds/mu-gi-seeds.mjs'); if (m.MU_GI_SEEDS?.patterns) _extraSeeds.push(...m.MU_GI_SEEDS.patterns); } catch {}
try { const m = await import('./seeds/gyeong-sin-seeds.mjs'); if (m.GYEONG_SIN_SEEDS?.patterns) _extraSeeds.push(...m.GYEONG_SIN_SEEDS.patterns); } catch {}
try { const m = await import('./seeds/im-gye-seeds.mjs'); if (m.IM_GYE_SEEDS?.patterns) _extraSeeds.push(...m.IM_GYE_SEEDS.patterns); } catch {}

export function createReadingStore(db) {
  if (!db) throw new Error('db handle is required for readingStore');

  db.exec(SCHEMA_SQL);

  // Additive columns for pre-existing DBs that were created before the
  // 004/005 migration alignment.  SQLite ALTER TABLE ... ADD COLUMN is safe
  // for additive changes and throws if the column already exists, so each
  // is wrapped in try/catch.
  const additiveColumns = [
    ['reading_card_modules', 'char_count', 'INTEGER NOT NULL DEFAULT 0'],
    ['reading_card_modules', 'content_version', "TEXT NOT NULL DEFAULT '1.0.0'"],
    ['reading_card_modules', 'reviewer', 'TEXT'],
    ['reading_card_modules', 'reviewed_at', 'TEXT'],
    ['reading_card_modules', 'updated_at', "TEXT NOT NULL DEFAULT (datetime('now'))"],
    ['reading_domain_modules', 'char_count', 'INTEGER NOT NULL DEFAULT 0'],
    ['reading_domain_modules', 'content_version', "TEXT NOT NULL DEFAULT '1.0.0'"],
    ['reading_domain_modules', 'reviewer', 'TEXT'],
    ['reading_domain_modules', 'reviewed_at', 'TEXT'],
    ['reading_domain_modules', 'updated_at', "TEXT NOT NULL DEFAULT (datetime('now'))"],
    ['reading_monthly_slots', 'char_count', 'INTEGER NOT NULL DEFAULT 0'],
    ['reading_monthly_slots', 'content_version', "TEXT NOT NULL DEFAULT '1.0.0'"],
    ['reading_monthly_slots', 'reviewer', 'TEXT'],
    ['reading_monthly_slots', 'reviewed_at', 'TEXT'],
    ['reading_monthly_slots', 'updated_at', "TEXT NOT NULL DEFAULT (datetime('now'))"],
    ['reading_month_pattern_keys', 'updated_at', "TEXT NOT NULL DEFAULT (datetime('now'))"],
    ['reading_month_modules', 'char_count', 'INTEGER NOT NULL DEFAULT 0'],
    ['reading_month_modules', 'content_version', "TEXT NOT NULL DEFAULT '1.0.0'"],
    ['reading_month_modules', 'reviewer', 'TEXT'],
    ['reading_month_modules', 'reviewed_at', 'TEXT'],
    ['reading_month_modules', 'updated_at', "TEXT NOT NULL DEFAULT (datetime('now'))"],
  ];
  for (const [table, column, def] of additiveColumns) {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`); } catch {}
  }

  const stmts = {
    patternCount: db.prepare('SELECT COUNT(*) as n FROM reading_pattern_keys'),
    insertPattern: db.prepare(`INSERT OR IGNORE INTO reading_pattern_keys (pattern_id, day_master, year_stem, year_branch, ten_god_stem, branch_relation, label) VALUES (?, ?, ?, ?, ?, ?, ?)`),
    insertCard: db.prepare(`INSERT OR IGNORE INTO reading_card_modules (module_id, pattern_id, card_type, card_index, title, summary, keywords, bullets, action, watch, evidence, tone, review_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    insertDomain: db.prepare(`INSERT OR IGNORE INTO reading_domain_modules (module_id, pattern_id, domain_key, domain_label, domain_index, points, closing, tone, review_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    insertMonthly: db.prepare(`INSERT OR IGNORE INTO reading_monthly_slots (slot_id, pattern_id, lunar_month, month_pillar, half, guidance, tone, review_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    pattern: db.prepare('SELECT * FROM reading_pattern_keys WHERE pattern_id = ?'),
    cards: db.prepare('SELECT * FROM reading_card_modules WHERE pattern_id = ? AND review_status = ? ORDER BY card_index ASC'),
    domains: db.prepare('SELECT * FROM reading_domain_modules WHERE pattern_id = ? AND review_status = ? ORDER BY domain_index ASC'),
    monthly: db.prepare('SELECT * FROM reading_monthly_slots WHERE pattern_id = ? AND review_status = ? ORDER BY lunar_month ASC, half ASC'),
    monthPattern: db.prepare('SELECT * FROM reading_month_pattern_keys WHERE day_master = ? AND month_branch = ?'),
    monthModules: db.prepare('SELECT * FROM reading_month_modules WHERE month_pattern_id = ? AND review_status = ? ORDER BY domain_index ASC'),
    insertMonthPattern: db.prepare(`INSERT OR IGNORE INTO reading_month_pattern_keys (month_pattern_id, day_master, month_branch, season, element_interaction, label) VALUES (?, ?, ?, ?, ?, ?)`),
    insertMonthModule: db.prepare(`INSERT OR IGNORE INTO reading_month_modules (module_id, month_pattern_id, domain_key, domain_label, domain_index, points, closing, tone, review_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    monthPatternCount: db.prepare('SELECT COUNT(*) as n FROM reading_month_pattern_keys'),
  };

  loadSeed(stmts);
  loadMonthSeeds(stmts);

  function parse(row) {
    if (!row) return null;
    const out = { ...row };
    for (const key of ['keywords', 'bullets', 'evidence', 'points']) {
      if (typeof out[key] === 'string') {
        try { out[key] = JSON.parse(out[key]); } catch { out[key] = []; }
      }
      if (!Array.isArray(out[key])) out[key] = [];
    }
    return out;
  }

  function getPattern(patternId) {
    if (!patternId) return null;
    return stmts.pattern.get(patternId) || null;
  }

  function getCardModules(patternId, reviewStatus = 'approved') {
    return stmts.cards.all(patternId, reviewStatus).map(parse);
  }

  function getDomainModules(patternId, reviewStatus = 'approved') {
    return stmts.domains.all(patternId, reviewStatus).map(parse);
  }

  function getMonthlySlots(patternId, reviewStatus = 'approved') {
    return stmts.monthly.all(patternId, reviewStatus).map(parse);
  }

  function hasReading(patternId) {
    if (!getPattern(patternId)) return false;
    return getCardModules(patternId).length > 0;
  }

  function getFullReading(patternId, reviewStatus = 'approved') {
    const pattern = getPattern(patternId);
    if (!pattern) return null;
    const cards = getCardModules(patternId, reviewStatus);
    if (cards.length === 0) return null;
    const domains = getDomainModules(patternId, reviewStatus);
    const monthly = getMonthlySlots(patternId, reviewStatus);
    return { pattern, cards, domains, monthly };
  }

  function getMonthModule(dayMaster, monthBranch, reviewStatus = 'approved') {
    const pattern = stmts.monthPattern.get(dayMaster, monthBranch);
    if (!pattern) return null;
    const modules = stmts.monthModules.all(pattern.month_pattern_id, reviewStatus).map(parse);
    if (modules.length === 0) return null;
    return { pattern, modules };
  }

  return {
    kind: 'reading-store',
    getPattern, getCardModules, getDomainModules, getMonthlySlots,
    hasReading, getFullReading, derivePatternId,
    getMonthModule,
  };
}

function loadSeed(stmts) {
  insertSeedPattern(stmts, MU_GI_HAE_SEED);
  for (const p of _extraSeeds) {
    insertSeedPattern(stmts, p);
  }
}

function insertSeedPattern(stmts, seed) {
  const isNested = !seed.pattern_id && seed.pattern;
  const meta = isNested ? seed.pattern : seed;
  const cards = isNested ? (seed.cards || []) : (seed.cards || []);
  const domains = isNested ? (seed.domains || []) : (seed.domains || []);
  const monthly = isNested ? (seed.monthly || []) : (seed.monthly || []);
  stmts.insertPattern.run(meta.pattern_id, meta.day_master, meta.year_stem, meta.year_branch, meta.ten_god_stem, meta.branch_relation || 'none', meta.label);
  for (const c of (cards || [])) {
    stmts.insertCard.run(c.module_id, c.pattern_id, c.card_type, c.card_index, c.title, c.summary, JSON.stringify(c.keywords || []), JSON.stringify(c.bullets || []), c.action, c.watch, JSON.stringify(c.evidence || []), c.tone || 'natural', c.review_status || 'draft');
  }
  for (const d of (domains || [])) {
    stmts.insertDomain.run(d.module_id, d.pattern_id, d.domain_key, d.domain_label, d.domain_index, JSON.stringify(d.points || []), d.closing || null, d.tone || 'natural', d.review_status || 'draft');
  }
  for (const m of (monthly || [])) {
    stmts.insertMonthly.run(m.slot_id, m.pattern_id, m.lunar_month, m.month_pillar, m.half, m.guidance, m.tone || 'natural', m.review_status || 'draft');
  }
}

// 월지 시드 파일들 동적 로드
let _monthSeeds = [];
try { const m = await import('./seeds/month-gap-eul.mjs'); if (m.MONTH_GAP_EUL?.patterns) _monthSeeds.push(...m.MONTH_GAP_EUL.patterns); } catch {}
try { const m = await import('./seeds/month-byeong-jeong.mjs'); if (m.MONTH_BYEONG_JEONG?.patterns) _monthSeeds.push(...m.MONTH_BYEONG_JEONG.patterns); } catch {}
try { const m = await import('./seeds/month-mu-gi.mjs'); if (m.MONTH_MU_GI?.patterns) _monthSeeds.push(...m.MONTH_MU_GI.patterns); } catch {}
try { const m = await import('./seeds/month-gyeong-sin.mjs'); if (m.MONTH_GYEONG_SIN?.patterns) _monthSeeds.push(...m.MONTH_GYEONG_SIN.patterns); } catch {}
try { const m = await import('./seeds/month-im-gye.mjs'); if (m.MONTH_IM_GYE?.patterns) _monthSeeds.push(...m.MONTH_IM_GYE.patterns); } catch {}

function loadMonthSeeds(stmts) {
  for (const p of _monthSeeds) {
    stmts.insertMonthPattern.run(p.month_pattern_id, p.day_master, p.month_branch, p.season, p.element_interaction, p.label);
    for (const m of (p.modules || [])) {
      stmts.insertMonthModule.run(m.module_id, p.month_pattern_id, m.domain_key, m.domain_label, m.domain_index, JSON.stringify(m.points || []), m.closing || null, m.tone || 'natural', m.review_status || 'draft');
    }
  }
}
