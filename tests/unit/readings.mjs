import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createReadingStore, derivePatternId } from '../../server/storage/readings.mjs';
import { createAnnualReading, buildAnnualCardsFromDB } from '../../server/domain/annual.mjs';

let passed = 0;

function ok(label) { passed++; console.log(`  ✓ ${label}`); }

console.log('Reading Pattern DB tests\n');

// 1. derivePatternId
{
  const id = derivePatternId({ dayStem: '戊', yearStem: '己', yearBranch: '亥' });
  assert.equal(id, '무_기_해');
  ok('derivePatternId: 戊己亥 → 무_기_해');

  const badId = derivePatternId({ dayStem: '?', yearStem: '己', yearBranch: '亥' });
  assert.equal(badId, null);
  ok('derivePatternId: invalid stem → null');
}

// 2. createReadingStore (in-memory SQLite)
const db = new DatabaseSync(':memory:');
const store = createReadingStore(db);
{
  assert.equal(store.kind, 'reading-store');
  ok('createReadingStore: returns store object');
}

// 3. Seed data
{
  const pattern = store.getPattern('무_기_해');
  assert.ok(pattern);
  assert.equal(pattern.day_master, '무');
  ok('seed pattern loaded');

  const cards = store.getCardModules('무_기_해');
  assert.equal(cards.length, 8);
  ok('seed cards: 8 modules');

  const domains = store.getDomainModules('무_기_해');
  assert.equal(domains.length, 13);
  ok('seed domains: 13 modules');

  const monthly = store.getMonthlySlots('무_기_해');
  assert.equal(monthly.length, 24);
  ok('seed monthly: 24 slots');
}

// 4. hasReading / getFullReading
{
  assert.equal(store.hasReading('무_기_해'), true);
  assert.equal(store.hasReading('갑_병_자'), false);
  ok('hasReading: correct for existing and missing');

  const full = store.getFullReading('무_기_해');
  assert.equal(full.cards.length, 8);
  assert.equal(full.domains.length, 13);
  assert.equal(full.monthly.length, 24);
  ok('getFullReading: complete package');
}

// 5. JSON fields parsed
{
  const cards = store.getCardModules('무_기_해');
  const cover = cards.find((c) => c.card_type === 'cover');
  assert.ok(Array.isArray(cover.keywords) && cover.keywords.length > 0);
  assert.ok(Array.isArray(cover.bullets) && cover.bullets.length > 0);
  ok('JSON fields: keywords/bullets are arrays');
}

// 6. buildAnnualCardsFromDB directly (bypasses year validation)
{
  const mockFacts = [
    { id: 'annual.year.pillar', value: '己亥', detail: '2019년 입춘부터 적용되는 연운 간지입니다.' },
    { id: 'annual.year.stem', value: '己', detail: '己亥의 천간은 己입니다.' },
    { id: 'annual.year.branch', value: '亥', detail: '己亥의 지지는 亥입니다.' },
    { id: 'annual.stem.tenGodToDayMaster', value: '겁재', detail: '일간 戊을 기준으로 연간 己은 겁재 관계입니다.' },
  ];
  const result = buildAnnualCardsFromDB(mockFacts, 2019, store);
  assert.ok(result, 'DB result should not be null');
  assert.ok(result.cards.length >= 8);
  assert.ok(result._dbDomains);
  assert.equal(result._dbDomains.length, 13);
  ok('buildAnnualCardsFromDB: 8+ cards + 13 domains from mock facts');
}

// 7. buildAnnualCardsFromDB with null store
{
  const result = buildAnnualCardsFromDB([], 2025, null);
  assert.equal(result, null);
  ok('buildAnnualCardsFromDB: null store → null');
}

// 8. buildAnnualCardsFromDB with non-matching pattern (계_임_자 — 존재하지 않는 조합)
{
  const mockFacts = [
    { id: 'annual.year.stem', value: '壬', detail: '壬子의 천간은 壬입니다.' },
    { id: 'annual.year.branch', value: '子', detail: '壬子의 지지는 子입니다.' },
    { id: 'annual.stem.tenGodToDayMaster', value: '비견', detail: '일간 壬을 기준으로 연간 壬은 비견 관계입니다.' },
  ];
  const result = buildAnnualCardsFromDB(mockFacts, 2024, store);
  assert.equal(result, null);
  ok('buildAnnualCardsFromDB: non-matching pattern → null');
}

// 9. Card schema compatibility (DB path)
{
  const mockFacts = [
    { id: 'annual.year.pillar', value: '己亥' },
    { id: 'annual.year.stem', value: '己', detail: '己亥의 천간은 己입니다.' },
    { id: 'annual.year.branch', value: '亥', detail: '己亥의 지지는 亥입니다.' },
    { id: 'annual.stem.tenGodToDayMaster', value: '겁재', detail: '일간 戊을 기준으로 연간 己은 겁재 관계입니다.' },
  ];
  const result = buildAnnualCardsFromDB(mockFacts, 2019, store);
  for (const card of result.cards) {
    assert.equal(card.schemaVersion, 'annual-card.v1');
    assert.ok(card.title.length > 0);
    assert.ok(card.summary.length > 0);
    assert.ok(Array.isArray(card.keywords));
    assert.ok(Array.isArray(card.bullets));
    assert.ok(card.action.length > 0);
    assert.ok(card.watch.length > 0);
  }
  ok('card schema: all DB cards match annual-card.v1');
}

// 10. createAnnualReading fallback (no DB, 2025)
{
  const input = {
    targetYear: 2025,
    chartPolicy: { id: 'test', version: '1.0.0', engine: 'test', engineVersion: '1.0.0' },
    natal: { dayStem: '甲', monthBranch: '寅', branches: ['午', '寅', '丑', '辰'] },
  };
  const result = createAnnualReading(input);
  assert.equal(result.readingSource, 'rule-engine');
  ok('createAnnualReading without store: rule-engine fallback');
}

// 11. Full annual pattern coverage — all 31 patterns load completely
{
  const DAY_MASTERS = ['갑','을','병','정','무','기','경','신','임','계'];
  const YEAR_BRANCHES_2024_2026 = ['진','사','오'];

  let annualChecked = 0;
  for (const dm of DAY_MASTERS) {
    for (const yb of YEAR_BRANCHES_2024_2026) {
      for (const ys of DAY_MASTERS) {
        const pid = `${dm}_${ys}_${yb}`;
        const pattern = store.getPattern(pid);
        if (!pattern) continue;
        annualChecked++;

        const cards = store.getCardModules(pid);
        assert.equal(cards.length, 8, `${pid}: expected 8 cards, got ${cards.length}`);

        const domains = store.getDomainModules(pid);
        assert.equal(domains.length, 13, `${pid}: expected 13 domains, got ${domains.length}`);

        const monthly = store.getMonthlySlots(pid);
        assert.equal(monthly.length, 24, `${pid}: expected 24 monthly slots, got ${monthly.length}`);
      }
    }
  }
  assert.ok(annualChecked >= 30, `expected at least 30 annual patterns, found ${annualChecked}`);
  ok(`full annual coverage: ${annualChecked} patterns × (8 cards + 13 domains + 24 monthly)`);
}

// 12. Full month-branch pattern coverage — all 120 patterns load completely
{
  const DAY_MASTERS = ['갑','을','병','정','무','기','경','신','임','계'];
  const MONTH_BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

  let monthChecked = 0;
  for (const dm of DAY_MASTERS) {
    for (const mb of MONTH_BRANCHES) {
      const result = store.getMonthModule(dm, mb);
      if (!result) {
        assert.fail(`missing month pattern: ${dm}_${mb}`);
        continue;
      }
      monthChecked++;
      assert.ok(result.modules.length === 8,
        `${dm}_${mb}: expected 8 modules, got ${result.modules.length}`);
      assert.ok(result.pattern.season.length > 0,
        `${dm}_${mb}: season must not be empty`);
      assert.ok(result.pattern.element_interaction.length > 0,
        `${dm}_${mb}: element_interaction must not be empty`);
    }
  }
  assert.equal(monthChecked, 120, `expected 120 month patterns, found ${monthChecked}`);
  ok(`full month-branch coverage: 120 patterns × 8 modules`);
}

// 13. review_status integrity — seed values must not be silently overridden
{
  const DAY_MASTERS = ['갑','을','병','정','무','기','경','신','임','계'];
  const YEAR_BRANCHES = ['진','사','오'];

  for (const dm of DAY_MASTERS) {
    for (const yb of YEAR_BRANCHES) {
      for (const ys of DAY_MASTERS) {
        const pid = `${dm}_${ys}_${yb}`;
        if (!store.getPattern(pid)) continue;

        // Query raw DB to check review_status is one of the valid values
        const cards = store.getCardModules(pid);
        for (const c of cards) {
          assert.ok(
            ['draft', 'reviewed', 'approved', 'rejected'].includes(c.review_status),
            `${pid} card ${c.card_type}: invalid review_status "${c.review_status}"`
          );
        }
      }
    }
  }
  ok('review_status integrity: all annual cards have valid status');
}

// 14. Month-branch pattern key uniqueness
{
  const DAY_MASTERS = ['갑','을','병','정','무','기','경','신','임','계'];
  const MONTH_BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

  for (const dm of DAY_MASTERS) {
    for (const mb of MONTH_BRANCHES) {
      const result = store.getMonthModule(dm, mb);
      if (!result) continue;
      // Each module must have a unique domain_key
      const keys = result.modules.map((m) => m.domain_key);
      const uniqueKeys = new Set(keys);
      assert.equal(uniqueKeys.size, keys.length,
        `${dm}_${mb}: duplicate domain_keys in month modules`);
    }
  }
  ok('month-branch uniqueness: all 120 patterns have unique domain_keys');
}

console.log(`\n${passed} assertions passed.`);
