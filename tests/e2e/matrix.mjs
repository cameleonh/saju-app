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

async function enterCoupleInput(page) {
  await page.click('button[data-action="mode"][data-mode="couple"]');
  await page.waitForTimeout(200);
  await page.click('button[data-action="start"]');
  await page.waitForSelector('#birth-form', { timeout: 20000 });
}

async function enterSingleInput(page) {
  await page.click('button[data-action="start"]');
  await page.waitForSelector('#birth-form', { timeout: 20000 });
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
  await page.click('details[data-optional-owner="partner"] summary').catch(() => {});
  await page.waitForTimeout(200);
  await page.check('#partner-unknown-time').catch(async () => {
    await page.click('details[data-optional-owner="partner"] summary').catch(() => {});
    await page.waitForTimeout(200);
    await page.check('#partner-unknown-time');
  });
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
  await page.click('details[data-optional-owner="self"] summary').catch(() => {});
  await page.waitForTimeout(150);
  const selfSex = await page.$('#self-sex');
  if (selfSex) await selfSex.selectOption('male');
  await page.click('details[data-optional-owner="partner"] summary').catch(() => {});
  await page.waitForTimeout(150);
  const partnerSex = await page.$('#partner-sex');
  if (partnerSex) await partnerSex.selectOption('female');
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

// S18: 모바일 탭 제출 (모바일 모드에서만)
if (mode === 'mobile') {
  const page = await newPage();
  await gotoHome(page);
  await enterCoupleInput(page);
  await page.tap('#birth-form button[type="submit"]').catch(async () => { await page.click('#birth-form button[type="submit"]'); });
  await page.waitForTimeout(3500);
  const state = await page.evaluate(() => ({ heading: document.querySelector('h1')?.textContent?.trim() || '', error: document.querySelector('.error')?.textContent?.trim() || null }));
  record('S18 모바일 탭 제출', atResult(state) && !state.error, JSON.stringify(state));
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
