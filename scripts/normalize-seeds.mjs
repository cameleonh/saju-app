#!/usr/bin/env node
// scripts/normalize-seeds.mjs
// 모든 시드 파일의 구조를 통일하고, 누락된 패턴을 식별합니다.
// 실행: node scripts/normalize-seeds.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePatternMatrix } from '../server/storage/day-master-profiles.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedsDir = path.join(projectRoot, 'server', 'storage', 'seeds');

const SEED_FILES = [
  { file: 'gap-eul-seeds.mjs', exportName: 'GAP_EUL_SEEDS', dayMasters: ['갑', '을'] },
  { file: 'byeong-jeong-seeds.mjs', exportName: 'BYEONG_JEONG_SEEDS', dayMasters: ['병', '정'] },
  { file: 'mu-gi-seeds.mjs', exportName: 'MU_GI_SEEDS', dayMasters: ['무', '기'] },
  { file: 'gyeong-sin-seeds.mjs', exportName: 'GYEONG_SIN_SEEDS', dayMasters: ['경', '신'] },
  { file: 'im-gye-seeds.mjs', exportName: 'IM_GYE_SEEDS', dayMasters: ['임', '계'] },
];

async function loadSeedFile(filePath, exportName) {
  try {
    const mod = await import(`file://${filePath}`);
    const data = mod[exportName];
    if (!data?.patterns) return null;
    return data.patterns;
  } catch { return null; }
}

function normalizePattern(p) {
  // 중첩 구조(pattern: {...})와 평면 구조 모두 처리
  if (p.pattern && !p.pattern_id) {
    return {
      pattern_id: p.pattern.pattern_id,
      day_master: p.pattern.day_master,
      year_stem: p.pattern.year_stem,
      year_branch: p.pattern.year_branch,
      ten_god_stem: p.pattern.ten_god_stem,
      branch_relation: p.pattern.branch_relation || 'none',
      label: p.pattern.label,
      cards: p.cards || [],
      domains: p.domains || [],
      monthly: p.monthly || [],
    };
  }
  // 이미 평면 구조
  return {
    pattern_id: p.pattern_id,
    day_master: p.day_master,
    year_stem: p.year_stem,
    year_branch: p.year_branch,
    ten_god_stem: p.ten_god_stem,
    branch_relation: p.branch_relation || 'none',
    label: p.label,
    cards: p.cards || [],
    domains: p.domains || [],
    monthly: p.monthly || [],
  };
}

async function main() {
  const matrix = generatePatternMatrix();
  const expectedIds = new Set(matrix.map((p) => p.pattern_id));
  const foundPatterns = new Map();
  const fileStatus = [];

  for (const { file, exportName, dayMasters } of SEED_FILES) {
    const filePath = path.join(seedsDir, file);
    const rawPatterns = await loadSeedFile(filePath, exportName);
    if (!rawPatterns) {
      fileStatus.push({ file, status: 'missing', count: 0 });
      continue;
    }

    const normalized = rawPatterns.map(normalizePattern);
    let valid = 0;
    for (const p of normalized) {
      if (!p.pattern_id || !p.cards?.length) continue;
      foundPatterns.set(p.pattern_id, p);
      valid++;
    }
    fileStatus.push({ file, status: 'loaded', count: valid, total: rawPatterns.length });
  }

  // 결과 출력
  console.log('=== 시드 파일 상태 ===');
  for (const s of fileStatus) {
    console.log(`  ${s.file}: ${s.status === 'missing' ? '❌ 없음' : `✓ ${s.count}/${s.total} 유효`}`);
  }

  const missing = matrix.filter((p) => !foundPatterns.has(p.pattern_id));
  console.log(`\n=== 패턴 커버리지 ===`);
  console.log(`  예상: ${expectedIds.size}패턴`);
  console.log(`  확보: ${foundPatterns.size}패턴`);
  console.log(`  누락: ${missing.length}패턴`);

  if (missing.length > 0) {
    console.log('\n누락된 패턴:');
    for (const m of missing) {
      console.log(`  ❌ ${m.pattern_id} (${m.day_master} × ${m.year_stem}${m.year_branch}, ${m.target_year}, ${m.ten_god})`);
    }
  }

  // 유효한 패턴들을 정규화된 파일로 저장
  if (foundPatterns.size > 0) {
    const allPatterns = [...foundPatterns.values()];
    const outputPath = path.join(seedsDir, '_normalized-all.mjs');
    const content = `// Auto-normalized by scripts/normalize-seeds.mjs
// Generated: ${new Date().toISOString()}
// Patterns: ${allPatterns.length} / ${expectedIds.size}

export const NORMALIZED_SEEDS = {
  patterns: ${JSON.stringify(allPatterns, null, 2)},
};
`;
    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`\n✓ 정규화된 ${allPatterns.length}패턴 저장: ${outputPath}`);
  }

  return { found: foundPatterns.size, expected: expectedIds.size, missing: missing.length };
}

main().then(({ found, expected, missing }) => {
  process.exit(missing === 0 ? 0 : 1);
}).catch((error) => {
  console.error(error);
  process.exit(2);
});
