import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';
import { calculateDaewoon } from '../../chart/daewoon-engine.mjs';

// P0-2 — first-experience shortening: required core (생년월일 + 출생 시각(모름 포함)) with
// 출생지·성별·본인확인 collapsed behind "나중에 입력", plus the intro "샘플로 보기" sample mode.
const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const adminAreaSource = fs.readFileSync(new URL('../../data/admin-areas.js', import.meta.url), 'utf8');

// The inline module script must still parse — restructures of the birth form must not blank the app.
{
  const inlineModuleScript = /<script type="module">([\s\S]*?)<\/script>/.exec(html)?.[1];
  assert.ok(inlineModuleScript, 'the app ships an inline module script');
  const { spawnSync } = await import('node:child_process');
  const os = await import('node:os');
  const path = await import('node:path');
  const probeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saju-onboarding-'));
  const probeFile = path.join(probeDir, 'inline-check.mjs');
  fs.writeFileSync(probeFile, inlineModuleScript);
  try {
    const syntaxCheck = spawnSync(process.execPath, ['--check', probeFile], { encoding: 'utf8' });
    assert.equal(syntaxCheck.status, 0, `inline module script must parse as ESM: ${syntaxCheck.stderr}`);
  } finally {
    fs.rmSync(probeDir, { recursive: true, force: true });
  }
}

const engineStart = html.indexOf('const STEMS');
const engineEnd = html.indexOf('function getFact');
assert.ok(engineStart >= 0, 'engine constants are present');
assert.ok(engineEnd > engineStart, 'engine boundary is present');
const engineSource = html.slice(engineStart, engineEnd);

const sandbox = { calculateNatalChart, calculateDaewoon };
vm.runInNewContext(adminAreaSource, sandbox);
vm.runInNewContext(`${engineSource};
  globalThis.defaultPlace = resolveBirthPlace(DEFAULT_BIRTH_PLACE);
  globalThis.defaultPlaceCode = DEFAULT_BIRTH_PLACE_CODE;
  globalThis.sampleInput = SAMPLE_BIRTH_INPUT;
  globalThis.sampleChart = calculateChart({ ...SAMPLE_BIRTH_INPUT, sourceInput: { ...SAMPLE_BIRTH_INPUT, sample: true } });
`, sandbox);

// --- Form structure: required core + collapsed optional section -----------------
assert.match(html, /<details class="optional-birth-fields" data-optional-owner="\$\{prefix\}" \$\{form\.optionalOpen \? 'open' : ''\}>/, 'optional birth fields render in a per-owner collapsible <details>');
assert.match(html, /<summary><span>나중에 입력 <span class="tiny">선택<\/span><\/span>/, 'the collapsible section is labeled 나중에 입력 (선택)');
assert.match(html, /\$\{partner \? '출생지 · 성별' : '출생지 · 성별 · 본인 확인'\}/, 'the collapsed summary lists what it contains per form (partner omits the self attestation)');
assert.match(html, /name="\$\{prefix\}Place" type="search"(?![^>]*\brequired\b)/, 'the birth place input is no longer marked required');
assert.doesNotMatch(html, /name="\$\{prefix\}Place"[^>]*\brequired\b/, 'no required attribute survives on the place input');
assert.match(html, /비워 두면 서울 기준으로 계산해요/, 'the place helper explains the Seoul default (static copy)');
assert.match(html, /시·군·구를 확인해 골라 주세요\. 비워 두면 서울 기준으로 계산해요\./, 'the loaded-catalog helper also explains the Seoul default');
assert.match(html, /정확한 시각을 몰라요\. 시주는 계산하지 않습니다\./, 'unknown-time remains part of the required core');
assert.match(html, /name="\$\{prefix\}Date" type="date"[^>]*required/, 'the birth date stays a required input');

// The collapsed section must survive re-renders (segmented-button clicks re-render the form).
assert.match(html, /details\[data-optional-owner\]/, 'the collapsible open state is bound in bindEvents');
assert.match(html, /target\.optionalOpen = element\.open/, 'toggling the collapsible persists into form state');
assert.match(html, /optionalOpen: false/, 'both form states initialize the collapsible closed');

// --- Fail-closed validation gates preserved (re-order/default only) -------------
assert.match(html, /if \(!source\.place\) \{ source\.place = DEFAULT_BIRTH_PLACE; source\.placeDefaulted = true; \}/, 'a completely blank place falls back to the Seoul default');
assert.ok(html.indexOf("source.place = DEFAULT_BIRTH_PLACE") < html.indexOf('const placeResolution = resolveBirthPlace(source.place)'), 'the default is applied before resolution so the default itself passes the gate');
assert.match(html, /placeResolution\.status === 'ambiguous'/, 'ambiguous place names still fail closed');
assert.match(html, /placeResolution\.status !== 'matched'/, 'unmatched place names still fail closed');
assert.match(html, /내 명식은 본인 정보로 확인해 주세요\./, 'the self-attestation gate text is unchanged');
assert.match(html, /if \(!state\.form\.samePerson\) throw new Error\('내 명식은 본인 정보로 확인해 주세요\.'\)/, 'the self-attestation gate still throws');
assert.match(html, /1900년부터 오늘까지의 생년월일을 입력해 주세요\./, 'the date-range gate is unchanged');
assert.match(html, /입력 권한을 먼저 확인해 주세요/, 'the couple authority gate is unchanged');
assert.match(html, /기본값\(서울\)/, 'results rendered from a defaulted place say so next to the place');

// The default must be a real catalog entry so placeCode provenance stays intact.
assert.equal(sandbox.defaultPlace.status, 'matched', 'DEFAULT_BIRTH_PLACE resolves as an exact catalog entry');
assert.equal(sandbox.defaultPlace.code, sandbox.defaultPlaceCode, 'the hard-coded default code matches the live catalog');

// --- Sample mode ----------------------------------------------------------------
assert.match(html, /data-action="sample"/, 'the intro exposes a sample action');
assert.match(html, /샘플로 보기/, 'the sample button copy is present');
assert.equal(sandbox.sampleInput.date, '1990-10-10');
assert.equal(sandbox.sampleInput.time, '14:30');
assert.equal(sandbox.sampleInput.place, sandbox.defaultPlace.name);
assert.deepEqual(Array.from(sandbox.sampleChart.pillars, (pillar) => pillar.text), ['庚午', '丙戌', '戊申', '己未'], 'the fixed sample input reproduces the golden natal chart');
assert.equal(sandbox.sampleChart.input.sourceInput.sample, true, 'the sample provenance flag travels on sourceInput');
assert.equal(sandbox.sampleChart.input.sourceInput.placeDefaulted, undefined, 'the sample is an explicit place, not a defaulted one');

const sampleFnStart = html.indexOf('function openSampleChart');
const sampleFnEnd = html.indexOf('function openDataStage');
const sampleFn = html.slice(sampleFnStart, sampleFnEnd);
assert.ok(sampleFnStart >= 0 && sampleFnEnd > sampleFnStart, 'openSampleChart is defined before openDataStage');
assert.match(sampleFn, /SAMPLE_BIRTH_INPUT/, 'the sample chart is built from the frozen sample input');
assert.match(sampleFn, /state\.sample = true/, 'the sample flag is set');
assert.match(sampleFn, /state\.saveState = 'sample'/, 'the save state is marked sample');
assert.match(sampleFn, /screen = 'result'/, 'the sample opens directly in the result view');
assert.doesNotMatch(sampleFn, /persistRecord/, 'the sample flow never persists a record');
assert.doesNotMatch(sampleFn, /storeRecord|storePendingRecord/, 'the sample flow touches no storage API');

const persistCalls = html.match(/persistRecord\(\)/g) || [];
assert.equal(persistCalls.length, 2, 'persistRecord keeps exactly its definition + the one real submit call site');

assert.match(html, /샘플 명식입니다/, 'the result view labels sample charts with a banner');
assert.match(html, /기록함에 저장되지 않습니다/, 'the banner states the sample is not persisted');
assert.match(html, /const sampleBanner = state\.sample \?/, 'the banner is conditional on the sample flag');
assert.match(html, /\$\{state\.sample \? '샘플 명식 · ' : ''\}\$\{chart\.policy\.id\}/, 'the chart aperture carries a subtle sample watermark next to the policy id');
assert.match(html, /샘플 명식 · 실제 출생 정보 아님/, 'the exported card PNG carries a sample watermark');

// Sample flag lifecycle — every real-data entry point must clear it.
assert.match(html, /function enterInputStage\(\)[\s\S]{0,400}state\.sample = false/, 'entering the input stage clears the sample flag');
assert.match(html, /action === 'home' \|\| action === 'nav-home'[\s\S]{0,700}state\.sample = false/, 'returning home clears the sample flag');
assert.match(html, /state\.annual = null;\s*\n\s*state\.sample = false;/, 'submitting the real birth form clears the sample flag');
assert.match(html, /state\.serviceConsent = true;\s*\n\s*state\.sample = false;/, 'opening a saved record clears the sample flag');

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`saju onboarding: ${assertionCount} assertions passed`);
