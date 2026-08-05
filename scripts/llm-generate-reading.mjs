#!/usr/bin/env node
// scripts/llm-generate-reading.mjs
// Windows Ollama를 통한 LLM 리딩 생성 (WSL → cmd.exe 경유)
//
// 사용법:
//   node scripts/llm-generate-reading.mjs --pattern=무_을_사
//   node scripts/llm-generate-reading.mjs --all-missing
//   node scripts/llm-generate-reading.mjs --dry-run
//
// WSL에서 Windows Ollama(localhost:11434)에 직접 접근할 수 없으므로
// cmd.exe를 통해 PowerShell curl을 실행합니다.

import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DAY_MASTER_PROFILES, YEAR_CONTEXTS, generatePatternMatrix, tenGodFor } from '../server/storage/day-master-profiles.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedsDir = path.join(projectRoot, 'server', 'storage', 'seeds');

const MODEL = 'gemma3:latest';
const OLLAMA_CALL = `cmd.exe /c "curl -s http://localhost:11434/api/generate -d \\"{\\\\\\"model\\\\\\":\\\\\\"${MODEL}\\\\\\",\\\\\\"stream\\\\\\":false,\\\\\\"format\\\\\\":\\\\\\"json\\\\\\"}\\""` ;

const TENGOD_MEANINGS = {
  '비견': '같은 기운이 겹침 — 동료, 경쟁, 자기 주장',
  '겁재': '같은 기운이 부딪힘 — 답답함, 경쟁, 자원 분배',
  '식신': '자기 표현과 결과물 — 창작, 완성, 생활의 즐거움',
  '상관': '불편함을 개선하는 제안 — 비판, 혁신',
  '편재': '새로운 기회 — 넓은 탐색, 현금흐름 주의',
  '정재': '안정적 운영과 수입 — 예산, 신뢰',
  '편관': '책임과 긴장감 — 압박, 과제, 집중',
  '정관': '기준과 신뢰 — 절차, 역할, 안정',
  '편인': '낯선 관점 — 재해석, 실험, 아이디어',
  '정인': '배움과 지원 — 체계화, 학습, 준비',
};

function buildSystemPrompt() {
  return `당신은 사주명리 전문가입니다. 규칙을 지키며 리딩을 작성하세요:
1. 한자 최소화 (한글 표기, 괄호 안 첫 등장 시만)
2. 2인칭 처방적 톤 ("~하세요", "~피하세요")
3. 명리학 용어를 일상어로
4. 사건 예측 금지
5. 한국어
6. JSON으로만 응답`;
}

function buildUserPrompt(pattern) {
  const dm = DAY_MASTER_PROFILES[pattern.day_master];
  const tenGod = pattern.ten_god;
  return `사주 패턴 리딩 작성:
- 일간: ${dm.hangul}(${dm.stem}) — ${dm.image}
- 성향: ${dm.nature}
- 강점: ${dm.strengths.join(', ')}
- 주의: ${dm.watchpoints.join(', ')}
- 연도: ${pattern.target_year}년 ${pattern.year_stem}${pattern.year_branch} (십신: ${tenGod})
- 십신의미: ${TENGOD_MEANINGS[tenGod] || ''}
- 연도이미지: ${pattern.year_label}

아래 JSON 구조로 응답:
{"cards":[{"card_type":"cover","card_index":1,"title":"","summary":"","keywords":["","",""],"bullets":["","",""],"action":"","watch":""}], "domains":[{"domain_key":"mindset","domain_index":1,"domain_label":"마음가짐","points":["","",""]}], "monthly":[{"lunar_month":1,"half":"first","guidance":""}]}

cards: 8장 (cover,overall,work,money,relationships,growth,action,method)
domains: 13개 (mindset,relationships,health,career,family,romance,wealth,fashion,season,purchases,avoid,favorable,must_do)
monthly: 24개 (1~12월 × first/second)`;
}

function callOllama(systemPrompt, userPrompt) {
  const payload = JSON.stringify({
    model: MODEL,
    system: systemPrompt,
    prompt: userPrompt,
    stream: false,
    format: 'json',
  });

  // cmd.exe를 통해 Windows curl 실행
  const escapedPayload = payload.replace(/"/g, '\\"').replace(/\\\\/g, '\\\\\\\\');
  const cmd = `cmd.exe /c curl -s http://localhost:11434/api/generate -H "Content-Type: application/json" -d "${escapedPayload}"`;

  try {
    const output = execSync(cmd, { encoding: 'utf8', timeout: 120000, maxBuffer: 10 * 1024 * 1024 });
    const data = JSON.parse(output);
    if (data.error) throw new Error(data.error);
    const response = data.response || '';
    return JSON.parse(response);
  } catch (error) {
    throw new Error(`Ollama call failed: ${error.message}`);
  }
}

function parseArgs() {
  const args = { pattern: null, allMissing: false, dryRun: false };
  for (const arg of process.argv.slice(2)) {
    if (arg === '--all-missing') args.allMissing = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg.startsWith('--pattern=')) args.pattern = arg.split('=')[1];
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const matrix = generatePatternMatrix();

  let targets = matrix;
  if (args.pattern) {
    targets = matrix.filter((p) => p.pattern_id === args.pattern);
  }

  console.log(`대상: ${targets.length}패턴${args.dryRun ? ' (DRY RUN)' : ''}`);

  if (args.dryRun) {
    for (const p of targets.slice(0, 2)) {
      console.log(`\n=== ${p.pattern_id} ===`);
      console.log('System:', buildSystemPrompt().slice(0, 80));
      console.log('User:', buildUserPrompt(p).slice(0, 120));
    }
    return;
  }

  for (const pattern of targets) {
    console.log(`\n생성 중: ${pattern.pattern_id}...`);
    try {
      const result = callOllama(buildSystemPrompt(), buildUserPrompt(pattern));
      console.log(`  ✓ cards: ${result.cards?.length}, domains: ${result.domains?.length}, monthly: ${result.monthly?.length}`);

      // 시드 파일로 저장
      const seedObj = {
        pattern_id: pattern.pattern_id,
        day_master: pattern.day_master,
        year_stem: pattern.year_stem,
        year_branch: pattern.year_branch,
        ten_god_stem: pattern.ten_god,
        branch_relation: 'none',
        label: `${DAY_MASTER_PROFILES[pattern.day_master].image} × ${pattern.year_label}`,
        cards: (result.cards || []).map((c, i) => ({
          module_id: `${pattern.pattern_id}_${c.card_type}`,
          pattern_id: pattern.pattern_id,
          card_type: c.card_type,
          card_index: c.card_index || (i + 1),
          title: c.title || '',
          summary: c.summary || '',
          keywords: c.keywords || [],
          bullets: c.bullets || [],
          action: c.action || '',
          watch: c.watch || '',
          evidence: [],
          tone: 'natural',
          review_status: 'draft',
        })),
        domains: (result.domains || []).map((d, i) => ({
          module_id: `${pattern.pattern_id}_${d.domain_key}`,
          pattern_id: pattern.pattern_id,
          domain_key: d.domain_key,
          domain_label: d.domain_label || '',
          domain_index: d.domain_index || (i + 1),
          points: d.points || [],
          closing: d.closing || null,
          tone: 'natural',
          review_status: 'draft',
        })),
        monthly: (result.monthly || []).map((m) => ({
          slot_id: `${pattern.pattern_id}_m${m.lunar_month}${m.half === 'first' ? 'f' : 's'}`,
          pattern_id: pattern.pattern_id,
          lunar_month: m.lunar_month,
          month_pillar: ['병인월','정묘월','무진월','기사월','경오월','신미월','임신월','계유월','갑술월','을해월','병자월','정축월'][m.lunar_month - 1],
          half: m.half,
          guidance: m.guidance || '',
          tone: 'natural',
          review_status: 'draft',
        })),
      };

      const outPath = path.join(seedsDir, `llm-${pattern.pattern_id}.mjs`);
      await fs.writeFile(outPath, `export const SEED = ${JSON.stringify(seedObj, null, 2)};\n`, 'utf8');
      console.log(`  저장: ${outPath}`);
    } catch (error) {
      console.error(`  ✗ ${error.message}`);
    }
  }
}

main().catch(console.error);
