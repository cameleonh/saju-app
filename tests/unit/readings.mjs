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

// 8. buildAnnualCardsFromDB with non-matching pattern
{
  const mockFacts = [
    { id: 'annual.year.stem', value: '甲', detail: '甲辰의 천간은 甲입니다.' },
    { id: 'annual.year.branch', value: '辰', detail: '甲辰의 지지는 辰입니다.' },
    { id: 'annual.stem.tenGodToDayMaster', value: '비견', detail: '일간 甲을 기준으로 연간 甲은 비견 관계입니다.' },
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

console.log(`\n${passed} assertions passed.`);
