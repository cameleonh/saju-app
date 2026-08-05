// server/storage/readings.mjs
// Reading Pattern DB 어댑터 (SQLite)
// content.pattern_keys / card_modules / domain_modules / monthly_slots 조회
// 자체 스키마를 초기화하고 시드 데이터를 로드합니다.

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
  day_master    TEXT NOT NULL,
  year_stem     TEXT NOT NULL,
  year_branch   TEXT NOT NULL,
  ten_god_stem  TEXT NOT NULL,
  branch_relation TEXT NOT NULL DEFAULT 'none',
  label         TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (day_master, year_stem, year_branch)
);

CREATE TABLE IF NOT EXISTS reading_card_modules (
  module_id      TEXT PRIMARY KEY,
  pattern_id     TEXT NOT NULL REFERENCES reading_pattern_keys(pattern_id),
  card_type      TEXT NOT NULL,
  card_index     INTEGER NOT NULL,
  title          TEXT NOT NULL,
  summary        TEXT NOT NULL,
  keywords       TEXT NOT NULL DEFAULT '[]',
  bullets        TEXT NOT NULL DEFAULT '[]',
  action         TEXT NOT NULL,
  watch          TEXT NOT NULL,
  evidence       TEXT NOT NULL DEFAULT '[]',
  tone           TEXT NOT NULL DEFAULT 'natural',
  review_status  TEXT NOT NULL DEFAULT 'draft',
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (pattern_id, card_type)
);

CREATE TABLE IF NOT EXISTS reading_domain_modules (
  module_id      TEXT PRIMARY KEY,
  pattern_id     TEXT NOT NULL REFERENCES reading_pattern_keys(pattern_id),
  domain_key     TEXT NOT NULL,
  domain_label   TEXT NOT NULL,
  domain_index   INTEGER NOT NULL,
  points         TEXT NOT NULL DEFAULT '[]',
  closing        TEXT,
  tone           TEXT NOT NULL DEFAULT 'natural',
  review_status  TEXT NOT NULL DEFAULT 'draft',
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (pattern_id, domain_key)
);

CREATE TABLE IF NOT EXISTS reading_monthly_slots (
  slot_id        TEXT PRIMARY KEY,
  pattern_id     TEXT NOT NULL REFERENCES reading_pattern_keys(pattern_id),
  lunar_month    INTEGER NOT NULL,
  month_pillar   TEXT NOT NULL,
  half           TEXT NOT NULL,
  guidance       TEXT NOT NULL,
  tone           TEXT NOT NULL DEFAULT 'natural',
  review_status  TEXT NOT NULL DEFAULT 'draft',
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (pattern_id, lunar_month, half)
);

CREATE INDEX IF NOT EXISTS idx_card_pattern ON reading_card_modules(pattern_id);
CREATE INDEX IF NOT EXISTS idx_domain_pattern ON reading_domain_modules(pattern_id);
CREATE INDEX IF NOT EXISTS idx_monthly_pattern ON reading_monthly_slots(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_lookup ON reading_pattern_keys(day_master, year_stem, year_branch);
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
  };

  const { n } = stmts.patternCount.get();
  if (n === 0) loadSeed(stmts);

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

  return {
    kind: 'reading-store',
    getPattern, getCardModules, getDomainModules, getMonthlySlots,
    hasReading, getFullReading, derivePatternId,
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
    stmts.insertCard.run(c.module_id, c.pattern_id, c.card_type, c.card_index, c.title, c.summary, JSON.stringify(c.keywords || []), JSON.stringify(c.bullets || []), c.action, c.watch, JSON.stringify(c.evidence || []), c.tone || 'natural', c.review_status || 'approved');
  }
  for (const d of (domains || [])) {
    stmts.insertDomain.run(d.module_id, d.pattern_id, d.domain_key, d.domain_label, d.domain_index, JSON.stringify(d.points || []), d.closing || null, d.tone || 'natural', d.review_status || 'approved');
  }
  for (const m of (monthly || [])) {
    stmts.insertMonthly.run(m.slot_id, m.pattern_id, m.lunar_month, m.month_pillar, m.half, m.guidance, m.tone || 'natural', m.review_status || 'approved');
  }
}
