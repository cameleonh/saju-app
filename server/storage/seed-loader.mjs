// server/storage/seed-loader.mjs
// 10간 × 3연도 시드 데이터를 통합 로드하는 모듈
// 각 seeds/*.mjs 파일에서 패턴을 모아 readingStore에 일괄 적재

import { MU_GI_HAE_SEED } from './seed-mu-gi-hae.mjs';

// 동적 import (에이전트가 파일을 작성 중일 수 있으므로 try-catch)
async function tryImport(path) {
  try { return await import(path); } catch { return null; }
}

export async function loadAllSeeds(db) {
  if (!db) throw new Error('db handle is required');

  const modules = await Promise.all([
    tryImport('./seeds/gap-eul-seeds.mjs'),
    tryImport('./seeds/byeong-jeong-seeds.mjs'),
    tryImport('./seeds/mu-gi-seeds.mjs'),
    tryImport('./seeds/gyeong-sin-seeds.mjs'),
    tryImport('./seeds/im-gye-seeds.mjs'),
  ]);

  const allPatterns = [];

  // 기존 무토×기해년 시드 (레거시 호환)
  allPatterns.push({
    pattern_id: MU_GI_HAE_SEED.pattern.pattern_id,
    day_master: MU_GI_HAE_SEED.pattern.day_master,
    year_stem: MU_GI_HAE_SEED.pattern.year_stem,
    year_branch: MU_GI_HAE_SEED.pattern.year_branch,
    ten_god_stem: MU_GI_HAE_SEED.pattern.ten_god_stem,
    branch_relation: MU_GI_HAE_SEED.pattern.branch_relation || 'none',
    label: MU_GI_HAE_SEED.pattern.label,
    cards: MU_GI_HAE_SEED.cards,
    domains: MU_GI_HAE_SEED.domains,
    monthly: MU_GI_HAE_SEED.monthly,
  });

  // 각 에이전트가 생성한 시드 파일에서 패턴 수집
  const exportNames = [
    'GAP_EUL_SEEDS',
    'BYEONG_JEONG_SEEDS',
    'MU_GI_SEEDS',
    'GYEONG_SIN_SEEDS',
    'IM_GYE_SEEDS',
  ];

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    if (!mod) continue;
    const exportName = exportNames[i];
    const seedData = mod[exportName];
    if (!seedData?.patterns) continue;
    for (const p of seedData.patterns) {
      allPatterns.push(p);
    }
  }

  return allPatterns;
}

export function insertPatterns(db, patterns) {
  const stmts = {
    insertPattern: db.prepare(`INSERT OR IGNORE INTO reading_pattern_keys (pattern_id, day_master, year_stem, year_branch, ten_god_stem, branch_relation, label) VALUES (?, ?, ?, ?, ?, ?, ?)`),
    insertCard: db.prepare(`INSERT OR IGNORE INTO reading_card_modules (module_id, pattern_id, card_type, card_index, title, summary, keywords, bullets, action, watch, evidence, tone, review_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    insertDomain: db.prepare(`INSERT OR IGNORE INTO reading_domain_modules (module_id, pattern_id, domain_key, domain_label, domain_index, points, closing, tone, review_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    insertMonthly: db.prepare(`INSERT OR IGNORE INTO reading_monthly_slots (slot_id, pattern_id, lunar_month, month_pillar, half, guidance, tone, review_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    patternCount: db.prepare('SELECT COUNT(*) as n FROM reading_pattern_keys'),
  };

  let inserted = { patterns: 0, cards: 0, domains: 0, monthly: 0 };

  for (const p of patterns) {
    const before = stmts.patternCount.get().n;
    stmts.insertPattern.run(p.pattern_id, p.day_master, p.year_stem, p.year_branch, p.ten_god_stem, p.branch_relation || 'none', p.label);
    if (stmts.patternCount.get().n > before) inserted.patterns++;

    for (const c of (p.cards || [])) {
      const result = stmts.insertCard.run(
        c.module_id, c.pattern_id, c.card_type, c.card_index,
        c.title, c.summary,
        JSON.stringify(c.keywords || []), JSON.stringify(c.bullets || []),
        c.action, c.watch, JSON.stringify(c.evidence || []),
        c.tone || 'natural', c.review_status || 'approved'
      );
      if (result.changes > 0) inserted.cards++;
    }

    for (const d of (p.domains || [])) {
      const result = stmts.insertDomain.run(
        d.module_id, d.pattern_id, d.domain_key, d.domain_label, d.domain_index,
        JSON.stringify(d.points || []), d.closing || null,
        d.tone || 'natural', d.review_status || 'approved'
      );
      if (result.changes > 0) inserted.domains++;
    }

    for (const m of (p.monthly || [])) {
      const result = stmts.insertMonthly.run(
        m.slot_id, m.pattern_id, m.lunar_month, m.month_pillar, m.half,
        m.guidance, m.tone || 'natural', m.review_status || 'approved'
      );
      if (result.changes > 0) inserted.monthly++;
    }
  }

  return inserted;
}
