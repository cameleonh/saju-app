// tests/unit/destined-match.mjs
import assert from 'node:assert/strict';
import { deriveDestinedMatch, MATCH_ARCHETYPES } from '../../chart/destined-match.mjs';
import { renderDestinedMatch } from '../../web/destined-match.mjs';

// 1. Archetype Data Integrity Check
const elements = ['목', '화', '토', '금', '수'];
for (const el of elements) {
  const arc = MATCH_ARCHETYPES[el];
  assert.ok(arc, `archetype for ${el} must exist`);
  assert.equal(arc.element, el);
  assert.ok(arc.title.length > 0, 'title must be non-empty');
  assert.ok(arc.tagline.length > 0, 'tagline must be non-empty');
  assert.ok(arc.impressions.length >= 3, 'must have at least 3 impressions');
  assert.ok(arc.personality.length >= 2, 'must have at least 2 personality traits');
  assert.ok(arc.avatarMale.includes('male'), 'male avatar must be linked');
  assert.ok(arc.avatarFemale.includes('female'), 'female avatar must be linked');
  assert.ok(arc.photoPool.startsWith('images/matches/pool/'), 'photo pool base must be linked');
  assert.ok(arc.synergy.length > 0, 'synergy must be present');
}

// 2. Deterministic Derivation Tests
// Test case A: Missing Fire in chart (Mock chart with Wood/Earth/Metal/Water)
const mockChartNoFire = {
  pillars: [
    { stem: '甲', element: '목', branchElement: '목' },
    { stem: '戊', element: '토', branchElement: '토' },
    { stem: '庚', element: '금', branchElement: '금' },
    { stem: '壬', element: '수', branchElement: '수' },
  ],
};

const matchNoFire = deriveDestinedMatch(mockChartNoFire);
assert.equal(matchNoFire.targetElement, '화', 'chart lacking Fire must match Fire archetype');
assert.equal(matchNoFire.archetype.element, '화');
assert.match(matchNoFire.reason, /화\(火\)/);

// Test case B: Missing Wood in chart
const mockChartNoWood = {
  pillars: [
    { stem: '丙', element: '화', branchElement: '화' },
    { stem: '戊', element: '토', branchElement: '토' },
    { stem: '庚', element: '금', branchElement: '금' },
    { stem: '壬', element: '수', branchElement: '수' },
  ],
};

const matchNoWood = deriveDestinedMatch(mockChartNoWood);
assert.equal(matchNoWood.targetElement, '목', 'chart lacking Wood must match Wood archetype');
assert.equal(matchNoWood.archetype.element, '목');

assert.ok(Number.isInteger(matchNoFire.photoVariant) && matchNoFire.photoVariant >= 0 && matchNoFire.photoVariant < 10, 'photo variant stays inside the pool bounds');
assert.equal(deriveDestinedMatch(mockChartNoFire).photoVariant, matchNoFire.photoVariant, 'photo variant is deterministic for the same chart');

// 3. UI Markup Rendering Tests
const femaleHtml = renderDestinedMatch(matchNoFire, { selectedGender: 'female' });
assert.match(femaleHtml, /class="panel match-panel"/, 'renders match panel container');
assert.match(femaleHtml, /src="images\/matches\/pool\/fire_female_\d{2}\.jpg"/, 'prefers a female fire pool photo');
assert.match(femaleHtml, /data-fallback-src="images\/matches\/match_fire_female\.svg"/, 'keeps the female fire SVG fallback');
assert.match(femaleHtml, /onerror="this\.onerror=null;this\.src=this\.dataset\.fallbackSrc;"/, 'falls back to the SVG when the photo is missing');
assert.match(femaleHtml, /여성 인연 보기/, 'renders female gender toggle button');
assert.match(femaleHtml, /data-action="match-card-png"/, 'renders card PNG download action');
assert.match(femaleHtml, /따뜻한 모닥불 같은 화\(火\)의 인연/, 'renders correct title');

const maleHtml = renderDestinedMatch(matchNoFire, { selectedGender: 'male' });
assert.match(maleHtml, /src="images\/matches\/pool\/fire_male_\d{2}\.jpg"/, 'prefers a male fire pool photo');
assert.match(maleHtml, /data-fallback-src="images\/matches\/match_fire_male\.svg"/, 'keeps the male fire SVG fallback');
assert.match(maleHtml, /남성 인연 보기/, 'renders male toggle button active');

console.log('✓ destined-match: 18 assertions passed');
