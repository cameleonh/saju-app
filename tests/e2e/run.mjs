// tests/e2e/run.mjs
// 라이브(또는 로컬) 사이트 대상 e2e 매트릭스 실행기.
// 사용:
//   npm run test:e2e                                      (라이브 https://saju.blog, 4개 환경 전체)
//   npm run test:e2e -- --base=http://127.0.0.1:4174/     (로컬 서버)
//   npm run test:e2e -- --configs=chromium:desktop        (일부 환경만)
//
// 사전 요구: npx playwright install chromium webkit (또는 동일 버전의 브라우저 캐시)

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).flatMap((arg) => {
  const match = /^--([^=]+)(?:=(.*))?$/.exec(arg);
  return match ? [[match[1], match[2] ?? true]] : [];
}));
let base = String(args.base || 'https://saju.blog/');
if (!base.endsWith('/')) base += '/';
const configs = String(args.configs || 'chromium:desktop,webkit:desktop,chromium:mobile,webkit:mobile')
  .split(',').map((entry) => entry.split(':'));

function runScript(script, extraArgs) {
  const result = spawnSync(process.execPath, [path.join(here, script), ...extraArgs], { stdio: 'inherit' });
  return result.status === 0;
}

console.log(`=== e2e assets ${base} ===`);
let failures = runScript('assets.mjs', [`--base=${base}`]) ? 0 : 1;

for (const [browser, mode] of configs) {
  console.log(`=== e2e matrix ${browser}:${mode} ${base} ===`);
  if (!runScript('matrix.mjs', [`--base=${base}`, `--browser=${browser}`, `--mode=${mode}`])) failures += 1;
}

console.log(failures === 0 ? 'E2E ALL GREEN' : `E2E FAILURES: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
