import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  LOADING_LINES,
  LOADING_LINE_INTERVAL_MS,
  loadingNarrativeMarkup,
  loadingSceneSvg,
  pickLoadingLine,
} from '../../web/loading-narrative.mjs';

let passed = 0;
const ok = (label) => { passed++; console.log(`  ✓ ${label}`); };

// 1. 문구 목록 — 서생 테마, 비어 있지 않음, 중복 없음, 결정론(고정 배열)
{
  assert.ok(Array.isArray(LOADING_LINES) && LOADING_LINES.length >= 5, 'at least five narrative lines');
  assert.ok(new Set(LOADING_LINES).size === LOADING_LINES.length, 'no duplicate lines');
  assert.ok(LOADING_LINES.every((line) => typeof line === 'string' && line.length > 5), 'all lines are non-trivial strings');
  assert.ok(Object.isFrozen(LOADING_LINES), 'the line array is frozen — deterministic');
  ok('line list: frozen, unique, non-trivial');
}

// 2. 로테이션 순환 — 음수·과잉 인덱스가 배열 길이로 안전하게 순환
{
  assert.equal(pickLoadingLine(0).line, LOADING_LINES[0]);
  assert.equal(pickLoadingLine(LOADING_LINES.length).line, LOADING_LINES[0], 'wraps to the first line');
  assert.equal(pickLoadingLine(LOADING_LINES.length + 2).line, LOADING_LINES[2]);
  assert.equal(pickLoadingLine(-1).line, LOADING_LINES[LOADING_LINES.length - 1], 'negative index wraps backward');
  assert.equal(pickLoadingLine(1.5).index, 0, 'non-integer index falls back to 0');
  assert.equal(typeof LOADING_LINE_INTERVAL_MS, 'number');
  ok('rotation: deterministic wraparound for any index');
}

// 3. 마크업 — 접근성 속성, 캐릭터 표기, 진행 점, 외부 자산 없음
{
  const markup = loadingNarrativeMarkup({ lineIndex: 2, variant: 'overlay', label: '테스트 <설명>' });
  assert.match(markup, /role="status"/);
  assert.match(markup, /aria-live="polite"/);
  assert.ok(markup.includes(LOADING_LINES[2]), 'the requested rotation line is rendered');
  assert.ok(loadingNarrativeMarkup({ lineIndex: 0 }).includes(LOADING_LINES[0]), 'line 0 carries the scholar copy');
  assert.match(markup, /書生/);
  assert.ok((markup.match(/<i class="ln-dot[ "]/g) || []).length === LOADING_LINES.length, 'one progress dot per line');
  assert.ok(markup.includes('class="ln-dot active"'), 'exactly one active dot is marked');
  assert.match(markup, /테스트 &lt;설명&gt;/, 'label is HTML-escaped');
  assert.doesNotMatch(markup, /https?:\/\//, 'no external assets in the loading markup');
  assert.doesNotMatch(markup, /<img/, 'no image requests — SVG only');
  ok('markup: accessible, escaped, zero external requests');
}

// 4. 패널 변형 — 오버레이와 본문 클래스가 구분된다
{
  const panel = loadingNarrativeMarkup({ variant: 'panel' });
  const overlay = loadingNarrativeMarkup({ variant: 'overlay' });
  assert.match(panel, /ln-panel-body/);
  assert.match(overlay, /ln-overlay-body/);
  assert.doesNotMatch(panel, /ln-overlay-body/);
  ok('variants: panel and overlay bodies are distinct');
}

// 5. SVG 장면 — 달·별·먹선이 모두 있고 애니메이션 클래스로 꾸며진다
{
  const svg = loadingSceneSvg();
  assert.match(svg, /class="ln-moon"/);
  assert.match(svg, /ln-star/);
  assert.match(svg, /class="ln-ink"/);
  assert.match(svg, /aria-hidden="true"/, 'the decorative scene is hidden from assistive tech');
  ok('scene: moon, stars, and ink strokes with animation hooks');
}

// 6. index.html 통합 — 오버레이 컨테이너, 키프레임, reduced-motion 규칙 공존
{
  const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  assert.match(html, /loadingNarrativeMarkup/);
  assert.match(html, /beginCalculationLoading\(\)/, 'the annual wait starts the narrative overlay');
  assert.match(html, /endCalculationLoading\(\)/, 'the overlay is always torn down (finally)');
  assert.match(html, /@keyframes ln-ink-trace/);
  assert.match(html, /@keyframes ln-moon-glow/);
  assert.match(html, /prefers-reduced-motion: reduce/, 'reduced-motion globally caps animation durations');
  assert.match(html, /loading: state\.calcLoading/, 'the annual panel mirrors the loading state');
  ok('integration: overlay wiring, keyframes, and reduced-motion guard');
}

// 7. annual/client.mjs — 로딩 분기가 테마 마크업을 쓴다(구문 평가 포함)
{
  const client = fs.readFileSync(new URL('../../annual/client.mjs', import.meta.url), 'utf8');
  assert.match(client, /loadingNarrativeMarkup\(\{ lineIndex: 0, variant: 'panel'/, 'the annual loading branch renders the themed panel');
  const { renderAnnualReading } = await import('../../annual/client.mjs');
  const loadingMarkup = renderAnnualReading(null, { loading: true });
  assert.match(loadingMarkup, /ln-panel-body/);
  assert.match(loadingMarkup, /서생/);
  assert.equal(renderAnnualReading(null, {}), '', 'no annual and no loading renders nothing');
  ok('annual client: themed loading branch without regressions');
}

console.log(`✓ loading-narrative: ${passed} assertions passed`);
