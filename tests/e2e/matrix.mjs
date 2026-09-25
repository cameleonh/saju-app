import { chromium, webkit, devices } from 'playwright';

const args = Object.fromEntries(process.argv.slice(2).flatMap((arg) => {
  const match = /^--([^=]+)(?:=(.*))?$/.exec(arg);
  return match ? [[match[1], match[2] ?? true]] : [];
}));
let base = String(args.base || 'https://saju.blog/');
if (!base.endsWith('/')) base += '/';
const browserName = String(args.browser || 'chromium');
const mode = String(args.mode || 'desktop');
const engine = browserName === 'webkit' ? webkit : chromium;
const browser = await engine.launch();
const contextOptions = mode === 'mobile'
  ? { ...devices['iPhone 13'] }
  : { viewport: { width: 1280, height: 900 } };
const context = await browser.newContext({ ...contextOptions, acceptDownloads: true });

const results = [];
const pageErrors = [];
const consoleErrors = [];
const badResponses = [];
const label = `${browserName}${mode === 'mobile' ? '-mobile' : ''}`;
function record(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} | [${label}] ${name} ${detail ? '| ' + detail : ''}`);
}

async function newPage() {
  const page = await context.newPage();
  page.on('pageerror', (e) => pageErrors.push(`${String(e).slice(0, 200)}`));
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(`${msg.text().slice(0, 200)}`); });
  page.on('response', (res) => { if (res.status() >= 400) badResponses.push(`${res.status()} ${res.url().slice(0, 140)}`); });
  return page;
}

async function gotoHome(page) {
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1100);
  if (await page.$('.gate-overlay')) {
    await page.check('input[data-gate-field="terms"]').catch(() => {});
    await page.check('input[data-gate-field="privacy"]').catch(() => {});
    await page.check('input[name="gate-age14"][value="over14"]').catch(() => {});
    await page.click('button[data-action="gate-confirm"]').catch(() => {});
    await page.waitForTimeout(500);
  }
}

async function waitForInputSettled(page) {
  // 출생지 목록 로드가 끝나면 폼이 한 번 더 렌더링된다. 그 전에 입력하면 값이 사라질 수 있어 기다린다.
  await page.waitForFunction(() => {
    const place = document.querySelector('#self-place');
    return place ? !place.disabled : true;
  }, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(250);
}

async function enterCoupleInput(page) {
  await page.click('button[data-action="mode"][data-mode="couple"]');
  await page.waitForTimeout(200);
  await page.click('button[data-action="start"]');
  await page.waitForSelector('#birth-form', { timeout: 20000 });
  await waitForInputSettled(page);
}

async function enterSingleInput(page) {
  await page.click('button[data-action="start"]');
  await page.waitForSelector('#birth-form', { timeout: 20000 });
  await waitForInputSettled(page);
}

async function submitAndRead(page, { waitMs = 3500 } = {}) {
  await page.click('#birth-form button[type="submit"]');
  await page.waitForTimeout(waitMs);
  return page.evaluate(() => ({
    heading: document.querySelector('h1')?.textContent?.trim() || '',
    error: document.querySelector('.error')?.textContent?.trim() || null,
  }));
}

async function avatarLoaded(page) {
  await page.evaluate(() => document.querySelector('.match-avatar-img')?.scrollIntoView({ block: 'center' }));
  await page.waitForFunction(() => {
    const img = document.querySelector('.match-avatar-img');
    return img && img.complete && img.naturalWidth > 0;
  }, { timeout: 15000 }).catch(() => {});
  return page.evaluate(() => {
    const img = document.querySelector('.match-avatar-img');
    return img ? { src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 } : null;
  });
}

const atResult = (s) => /근거|명식|카드|나란히/.test(s.heading) || s.hasResult === true;

// S1: 홈
{
  const page = await newPage();
  await gotoHome(page);
  record('S1 홈+게이트', (await page.$$('button[data-action="mode"]')).length === 2);
  await page.close();
}

// S2: 샘플 + 사진 로드
{
  const page = await newPage();
  await gotoHome(page);
  await page.click('button[data-action="sample"]');
  await page.waitForTimeout(1500);
  const avatar = await avatarLoaded(page);
  record('S2 샘플+인연사진', Boolean(avatar?.loaded && avatar.src.includes('images/matches/pool/')), JSON.stringify(avatar));
  await page.close();
}

// S3: 성별 토글
{
  const page = await newPage();
  await gotoHome(page);
  await page.click('button[data-action="sample"]');
  await page.waitForTimeout(1200);
  const before = await avatarLoaded(page);
  await page.click('button[data-action="match-gender"][data-gender="male"]');
  await page.waitForTimeout(800);
  const after = await avatarLoaded(page);
  record('S3 성별 토글', Boolean(before && after && before.src !== after.src && after.src.includes('_male_') && after.loaded), `${before?.src} → ${after?.src}`);
  await page.close();
}

// S4: PNG 저장
{
  const page = await newPage();
  await gotoHome(page);
  await page.click('button[data-action="sample"]');
  await page.waitForTimeout(1200);
  const dl = page.waitForEvent('download', { timeout: 25000 }).catch(() => null);
  await page.click('button[data-action="match-card-png"]');
  const download = await dl;
  let size = 0;
  if (download) {
    const fs = await import('node:fs');
    size = fs.statSync(await download.path()).size;
  }
  record('S4 카드뉴스 PNG', Boolean(download && size > 50000), `${Math.round(size / 1024)}KB`);
  await page.close();
}

// S5: 단일 + 시각/성별 입력 → 대운 표시
{
  const page = await newPage();
  await gotoHome(page);
  await enterSingleInput(page);
  await page.fill('#self-date', '1983-05-20');
  await page.fill('#self-time', '15:30');
  await page.click('details[data-optional-owner="self"] summary');
  await page.waitForTimeout(300);
  const sex = await page.$('#self-sex');
  if (sex) await sex.selectOption('female');
  const state = await submitAndRead(page, { waitMs: 4500 });
  const hasDaewoonDirection = await page.evaluate(() => /순행|역행/.test(document.body.textContent));
  const avatar = await avatarLoaded(page);
  record('S5 단일(성별 입력)', atResult(state) && !state.error, JSON.stringify(state));
  record('S5 대운 순행/역행 표시', hasDaewoonDirection);
  record('S5 인연사진 로드', Boolean(avatar?.loaded), JSON.stringify(avatar));
  await page.close();
}

// S6: 단일 + 시각 미상
{
  const page = await newPage();
  await gotoHome(page);
  await enterSingleInput(page);
  await page.fill('#self-date', '1990-10-10');
  await page.click('details[data-optional-owner="self"] summary').catch(() => {});
  await page.waitForTimeout(200);
  await page.check('#self-unknown-time').catch(async () => {
    await page.click('details[data-optional-owner="self"] summary');
    await page.waitForTimeout(200);
    await page.check('#self-unknown-time');
  });
  const state = await submitAndRead(page, { waitMs: 4000 });
  const warning = await page.evaluate(() => document.body.textContent.includes('대운 계산 입력이 더 필요해요') || document.body.textContent.includes('시각을 입력하지 않았어요'));
  record('S6 단일(시각 미상)', atResult(state) && !state.error, JSON.stringify(state));
  record('S6 시각 미상 안내 표시', warning);
  await page.close();
}

// S7: 단일 음력 입력
{
  const page = await newPage();
  await gotoHome(page);
  await enterSingleInput(page);
  await page.click('button[data-field="calendar"][data-owner="self"][data-value="lunar"]');
  await page.waitForTimeout(300);
  await page.fill('input[name="selfLunarYear"]', '1990');
  await page.fill('input[name="selfLunarMonth"]', '9');
  await page.fill('input[name="selfLunarDay"]', '14');
  await page.fill('#self-time', '12:00');
  const state = await submitAndRead(page, { waitMs: 4500 });
  record('S7 단일 음력 변환', atResult(state) && !state.error, JSON.stringify(state));
  await page.close();
}

// S8: 자시 경계 (23:30)
{
  const page = await newPage();
  await gotoHome(page);
  await enterSingleInput(page);
  await page.fill('#self-date', '1987-12-31');
  await page.fill('#self-time', '23:30');
  const state = await submitAndRead(page);
  record('S8 자시(23:30) 경계', atResult(state) && !state.error, JSON.stringify(state));
  await page.close();
}

// S9: 최소 날짜 (1900-01-01)
{
  const page = await newPage();
  await gotoHome(page);
  await enterSingleInput(page);
  await page.fill('#self-date', '1900-01-01');
  await page.fill('#self-time', '00:30');
  const state = await submitAndRead(page);
  record('S9 1900-01-01 하한', atResult(state) && !state.error, JSON.stringify(state));
  await page.close();
}

// S10: 커플 정상 → 4전통
{
  const page = await newPage();
  await gotoHome(page);
  await enterCoupleInput(page);
  const initialValues = await page.evaluate(() => ['#self-date', '#self-time', '#partner-date', '#partner-time'].map((selector) => document.querySelector(selector)?.value ?? null));
  record('S10 입력 폼에 예시 생년월일·시각 미리 채우지 않음', initialValues.every((value) => value === ''), JSON.stringify(initialValues));
  await page.fill('#self-date', '1990-10-10');
  await page.fill('#self-time', '14:30');
  await page.fill('#partner-date', '1992-02-14');
  await page.fill('#partner-time', '09:00');
  await page.waitForFunction(() => document.querySelector('#self-time')?.value === '14:30' && document.querySelector('#partner-time')?.value === '09:00');
  const entered = await page.evaluate(() => ({ selfDate: document.querySelector('#self-date')?.value, selfTime: document.querySelector('#self-time')?.value, partnerDate: document.querySelector('#partner-date')?.value, partnerTime: document.querySelector('#partner-time')?.value, selfUnknown: document.querySelector('#self-unknown-time')?.checked, partnerUnknown: document.querySelector('#partner-unknown-time')?.checked }));
  record('S10 양쪽 날짜·시각 명시 입력 확인', entered.selfDate === '1990-10-10' && entered.selfTime === '14:30' && entered.partnerDate === '1992-02-14' && entered.partnerTime === '09:00' && !entered.selfUnknown && !entered.partnerUnknown, JSON.stringify(entered));
  const state = await submitAndRead(page);
  const fourSystem = await page.evaluate(() => document.body.textContent.includes('미얀마 마하보테'));
  record('S10 커플(시각 입력)', atResult(state) && !state.error, JSON.stringify(state));
  record('S10 4전통 패널', fourSystem);
  await page.close();
}

// S11: 커플 상대 시각 미상
{
  const page = await newPage();
  await gotoHome(page);
  await enterCoupleInput(page);
  await page.fill('#self-date', '1990-10-10');
  await page.fill('#self-time', '14:30');
  await page.fill('#partner-date', '1992-02-14');
  await page.click('details[data-optional-owner="partner"] summary').catch(() => {});
  await page.waitForTimeout(200);
  await page.check('#partner-unknown-time').catch(async () => {
    await page.click('details[data-optional-owner="partner"] summary').catch(() => {});
    await page.waitForTimeout(200);
    await page.check('#partner-unknown-time');
  });
  await page.waitForFunction(() => document.querySelector('#self-date')?.value === '1990-10-10' && document.querySelector('#self-time')?.value === '14:30' && document.querySelector('#partner-date')?.value === '1992-02-14' && document.querySelector('#partner-unknown-time')?.checked);
  const entered = await page.evaluate(() => [...new FormData(document.querySelector('#birth-form')).entries()]);
  record('S11 상대 시각 미상 입력 상태 유지', entered.some(([key, value]) => key === 'selfDate' && value === '1990-10-10') && entered.some(([key, value]) => key === 'partnerDate' && value === '1992-02-14') && entered.some(([key, value]) => key === 'partnerUnknownTime'), JSON.stringify(entered));
  const state = await submitAndRead(page);
  const notice = await page.evaluate(() => [...document.querySelectorAll('.notice.amber h3')].some((h) => h.textContent.includes('4전통')));
  record('S11 커플(상대 미상)', atResult(state) && !state.error, JSON.stringify(state));
  record('S11 안내 카드', notice);
  await page.close();
}

// S12: 커플 본인 시각 미상
{
  const page = await newPage();
  await gotoHome(page);
  await enterCoupleInput(page);
  await page.fill('#self-date', '1990-10-10');
  await page.fill('#partner-date', '1992-02-14');
  await page.fill('#partner-time', '09:00');
  await page.check('#self-unknown-time').catch(async () => {
    await page.click('details[data-optional-owner="self"] summary').catch(() => {});
    await page.waitForTimeout(200);
    await page.check('#self-unknown-time');
  });
  const state = await submitAndRead(page);
  record('S12 커플(본인 미상)', atResult(state) && !state.error, JSON.stringify(state));
  await page.close();
}

// S13: 커플 성별값 입력
{
  const page = await newPage();
  await gotoHome(page);
  await enterCoupleInput(page);
  await page.fill('#self-date', '1990-10-10');
  await page.fill('#self-time', '14:30');
  await page.fill('#partner-date', '1992-02-14');
  await page.fill('#partner-time', '09:00');
  await page.click('details[data-optional-owner="self"] summary').catch(() => {});
  await page.waitForTimeout(150);
  const selfSex = await page.$('#self-sex');
  if (selfSex) await selfSex.selectOption('male');
  await page.click('details[data-optional-owner="partner"] summary').catch(() => {});
  await page.waitForTimeout(150);
  const partnerSex = await page.$('#partner-sex');
  if (partnerSex) await partnerSex.selectOption('female');
  const entered = await page.evaluate(() => [...new FormData(document.querySelector('#birth-form')).entries()]);
  record('S13 날짜·시각·성별 FormData 유지', entered.some(([key, value]) => key === 'selfDate' && value === '1990-10-10') && entered.some(([key, value]) => key === 'selfTime' && value === '14:30') && entered.some(([key, value]) => key === 'partnerDate' && value === '1992-02-14') && entered.some(([key, value]) => key === 'partnerTime' && value === '09:00') && entered.some(([key, value]) => key === 'selfSex' && value === 'male') && entered.some(([key, value]) => key === 'partnerSex' && value === 'female'), JSON.stringify(entered));
  const state = await submitAndRead(page, { waitMs: 4000 });
  record('S13 커플(성별값 입력)', atResult(state) && !state.error, JSON.stringify(state));
  await page.close();
}

// S14: 다시 입력(edit) → 재제출
{
  const page = await newPage();
  await gotoHome(page);
  await enterSingleInput(page);
  await page.fill('#self-date', '1990-10-10');
  await page.fill('#self-time', '14:30');
  await submitAndRead(page, { waitMs: 4000 });
  const hasEdit = await page.$('button[data-action="edit"]');
  let ok = false;
  if (hasEdit) {
    await page.click('button[data-action="edit"]');
    await page.waitForSelector('#birth-form', { timeout: 15000 });
    await page.fill('#self-date', '1995-03-03');
    const state = await submitAndRead(page, { waitMs: 4000 });
    ok = atResult(state) && !state.error;
  }
  record('S14 다시 입력 후 재계산', ok);
  await page.close();
}

// S15: 기록함 열기 → 저장 기록 열기
{
  const page = await newPage();
  await gotoHome(page);
  await enterSingleInput(page);
  await page.fill('#self-date', '1992-02-14');
  await page.fill('#self-time', '09:00');
  await submitAndRead(page, { waitMs: 4500 });
  await page.click('button[data-action="nav-data"]:visible');
  await page.waitForTimeout(2000);
  const openBtn = await page.$('button[data-action="record-open"]');
  let heading = '';
  if (openBtn) {
    await openBtn.click();
    await page.waitForTimeout(2500);
    heading = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || '');
  }
  record('S15 기록함에서 풀이 열기', Boolean(openBtn) && /근거|명식|카드/.test(heading), heading);
  await page.close();
}

// S16: 미래 날짜 → 검증 에러 표시 (멈춤 아님)
{
  const page = await newPage();
  await gotoHome(page);
  await enterSingleInput(page);
  await page.fill('#self-time', '12:00');
  await page.evaluate(() => { document.querySelector('#self-date').value = '2999-01-01'; });
  const state = await submitAndRead(page, { waitMs: 2000 });
  record('S16 미래 날짜 에러 표시', Boolean(state.error) && state.heading.includes('출생'), JSON.stringify(state));
  await page.close();
}

// S17: 새로고침(서비스워커) 후 재동작 + 샘플 중복 결정성
{
  const page = await newPage();
  await gotoHome(page);
  await page.click('button[data-action="sample"]');
  await page.waitForTimeout(1500);
  const first = await avatarLoaded(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800);
  const cards = (await page.$$('button[data-action="mode"]')).length;
  const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
  await page.click('button[data-action="sample"]');
  await page.waitForTimeout(1500);
  const second = await avatarLoaded(page);
  record('S17 새로고침 후 재동작', cards === 2, `mode cards ${cards}`);
  record('S17 서비스워커 제어 상태', controlled);
  record('S17 샘플 결정성(같은 사진)', Boolean(first && second && first.src === second.src), `${first?.src} / ${second?.src}`);
  await page.close();
}

// S18: 사용자 검산 프로필 — 같은 공통 기둥으로 비교하고 교차 지지 표식을 표시.
{
  const page = await newPage();
  await gotoHome(page);
  await enterCoupleInput(page);
  await page.fill('#self-date', '1983-06-14');
  await page.fill('#self-time', '06:30');
  await page.fill('#partner-date', '1994-05-14');
  await page.check('#partner-unknown-time');
  const timePolicyCopy = await page.textContent('#self-place-help');
  const state = await submitAndRead(page, { waitMs: 3500 });
  const facts = await page.evaluate(() => {
    const pillarGroups = [...document.querySelectorAll('.couple-chart-pair .chart-aperture')].map((section) => [...section.querySelectorAll('.pillar strong')].map((node) => node.textContent.trim()));
    const text = document.body.textContent;
    return {
      pillarGroups,
      hasCommonThreePillarBasis: text.includes('공통 년주·월주·일주 기둥'),
      excludesHiddenStemsFromCount: text.includes('지장간은 오행 개수에서 제외'),
      visibleCrossMarkers: ['子午', '巳亥', '子卯', '卯戌', '酉戌', '子酉'].filter((marker) => text.includes(marker)),
    };
  });
  record('S18 검산 명식 결과 표시', atResult(state) && !state.error, JSON.stringify(state));
  const pillarsMatch = JSON.stringify(facts.pillarGroups) === JSON.stringify([['乙卯', '癸酉', '戊午', '癸亥'], ['미상', '庚子', '己巳', '甲戌']]);
  record('S18 제공된 두 날짜의 4주 검산', pillarsMatch, JSON.stringify(facts.pillarGroups));
  record('S18 공통 3주 집계·지장간 기준 명시', facts.hasCommonThreePillarBasis && facts.excludesHiddenStemsFromCount, JSON.stringify(facts));
  record('S18 법정 민간시/보정 기준 고지', /Asia\/Seoul.*경도.*태양시 보정은 하지 않습니다/.test(timePolicyCopy || ''), timePolicyCopy || 'missing place help');
  record('S18 교차 지지 표식 6종', facts.visibleCrossMarkers.length === 6, facts.visibleCrossMarkers.join(' · '));

  const readEvidence = async (readingIndex, factId) => {
    const card = page.locator(`.reading-card[data-reading-key="couple-${readingIndex}"]`);
    if (!(await card.evaluate((element) => element.open))) await card.locator('summary').click();
    await card.locator(`[data-action="evidence"][data-fact="${factId}"]`).click();
    await page.waitForTimeout(150);
    return card.locator('.fact-detail').textContent();
  };
  const elementBasisDetail = await readEvidence(3, 'relationship.element.counts');
  record('S18 오행 수치·지장간 제외 근거 열기', /내 명식 목0 · 화1 · 토1 · 금1 · 수3 \/ 상대 목1 · 화1 · 토2 · 금1 · 수1/.test(elementBasisDetail || ''), elementBasisDetail || 'missing detail');
  const branchDetail = await readEvidence(3, 'relationship.branch.interactions');
  record('S18 지지 교차 관계 근거 열기', ['子午', '巳亥', '子卯', '卯戌', '酉戌', '子酉'].every((marker) => (branchDetail || '').includes(marker)), branchDetail || 'missing detail');
  const selfBranchDetail = await readEvidence(3, 'self.branch.interactions');
  record('S18 본인 명식 내부 지지 관계 근거', ['충(卯酉)', '파(卯午)'].every((marker) => (selfBranchDetail || '').includes(marker)), selfBranchDetail || 'missing detail');
  const hiddenStemDetail = await readEvidence(2, 'partner.hidden-stems');
  record('S18 지장간 선택 규칙 고지', /월률분야/.test(hiddenStemDetail || '') && /子.*癸.*壬/.test(hiddenStemDetail || ''), hiddenStemDetail || 'missing detail');
  await page.close();
}

// S19: 모바일 탭 제출 (모바일 모드에서만)
if (mode === 'mobile') {
  const page = await newPage();
  await gotoHome(page);
  await enterCoupleInput(page);
  await page.fill('#self-date', '1990-10-10');
  await page.fill('#self-time', '14:30');
  await page.fill('#partner-date', '1992-02-14');
  await page.fill('#partner-time', '09:00');
  await page.tap('#birth-form button[type="submit"]').catch(async () => { await page.click('#birth-form button[type="submit"]'); });
  await page.waitForTimeout(3500);
  const state = await page.evaluate(() => ({ heading: document.querySelector('h1')?.textContent?.trim() || '', error: document.querySelector('.error')?.textContent?.trim() || null }));
  record('S19 모바일 탭 제출', atResult(state) && !state.error, JSON.stringify(state));
  await page.close();
}

// S20: 빈 출생 시각은 정오로 몰래 대체하지 않고 입력 오류로 안내.
{
  const page = await newPage();
  await gotoHome(page);
  await enterCoupleInput(page);
  await page.fill('#self-date', '1990-10-10');
  await page.fill('#self-time', '14:30');
  await page.fill('#partner-date', '1992-02-14');
  await page.fill('#partner-time', '');
  const state = await submitAndRead(page, { waitMs: 1500 });
  record('S20 빈 시각의 임의 정오 대체 방지', Boolean(state.error?.includes('출생 시각을 입력하거나')) && !state.heading.includes('나란히 확인'), JSON.stringify(state));
  await page.close();
}

// S21: 홈 오늘의 운세 기준 명식 선택·최근 선택 지속.
{
  const page = await newPage();
  await gotoHome(page);
  let select = await page.$('#daily-teaser-select');
  if (!select) {
    await enterSingleInput(page);
    await page.fill('#self-date', '1990-10-10');
    await page.fill('#self-time', '14:30');
    await submitAndRead(page, { waitMs: 4500 });
    await page.click('button[data-action="nav-home"]');
    await page.waitForTimeout(2000);
    select = await page.$('#daily-teaser-select');
  }
  const optionCount = select ? await select.evaluate((element) => element.options.length) : 0;
  record('S21 일일운세 기준 명식 선택 노출', Boolean(select) && optionCount >= 2, `options ${optionCount}`);
  const buttonText = await page.evaluate(() => [...document.querySelectorAll('[data-action="daily-teaser-open"]')].map((element) => element.textContent.trim()).join('|'));
  record('S21 전체 보기 버튼 문구', buttonText.includes('오늘의 운세 전체 보기'), buttonText || 'missing');
  if (select && optionCount >= 2) {
    const current = await select.inputValue();
    const next = await select.evaluate((element, currentValue) => [...element.options].map((option) => option.value).find((value) => value !== currentValue), current);
    await select.selectOption(next);
    await page.waitForTimeout(1200);
    const afterChoice = await page.evaluate(() => ({ value: document.querySelector('#daily-teaser-select')?.value || '', flow: document.querySelector('.daily-strip-flow')?.textContent?.slice(0, 60) || '' }));
    record('S21 선택 변경 반영', afterChoice.value === next, JSON.stringify(afterChoice));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const afterReload = await page.evaluate(() => document.querySelector('#daily-teaser-select')?.value || '');
    record('S21 최근 선택 지속(새로고침)', afterReload === next, `${next} → ${afterReload || 'empty'}`);
  } else {
    record('S21 선택 변경 반영', false, 'selector not available');
    record('S21 최근 선택 지속(새로고침)', false, 'selector not available');
  }
  await page.close();
}

console.log('---');
const failed = results.filter((r) => !r.ok);
console.log(`SUMMARY [${label}] TOTAL ${results.length} PASS ${results.length - failed.length} FAIL ${failed.length}`);
if (pageErrors.length) console.log('pageErrors:', JSON.stringify([...new Set(pageErrors)].slice(0, 10)));
if (consoleErrors.length) console.log('consoleErrors:', JSON.stringify([...new Set(consoleErrors)].slice(0, 10)));
if (badResponses.length) console.log('badResponses:', JSON.stringify([...new Set(badResponses)].slice(0, 20)));
await browser.close();
process.exit(failed.length ? 1 : 0);
