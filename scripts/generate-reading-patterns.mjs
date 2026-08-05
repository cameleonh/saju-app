#!/usr/bin/env node
// scripts/generate-reading-patterns.mjs
// LLM(Qwen)을 이용한 리딩 패턴 일괄 생성 파이프라인
//
// 사용법:
//   node scripts/generate-reading-patterns.mjs --day-master=무 --year-stem=갑 --year-branch=진
//   node scripts/generate-reading-patterns.mjs --all          # 30패턴 전체
//   node scripts/generate-reading-patterns.mjs --dry-run      # 프롬프트만 출력, 실행 안 함
//
// 생성된 패턴은 server/storage/seeds/ 아래에 .mjs 파일로 저장됩니다.
// 이후 seed-loader.mjs를 통해 DB에 일괄 적재됩니다.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DAY_MASTER_PROFILES, YEAR_CONTEXTS, generatePatternMatrix, tenGodFor } from '../server/storage/day-master-profiles.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedsDir = path.join(projectRoot, 'server', 'storage', 'seeds');

// ============================================================
// 프롬프트 템플릿
// ============================================================

function buildSystemPrompt() {
  return `당신은 사주명리 전문가입니다. 다음 규칙을 지키며 리딩 텍스트를 작성하세요:

1. 한자 최소화: 무토, 기토, 해수 등 한글로 표기. 한자는 괄호 안 첫 등장 시만.
2. 톤: 2인칭 처방적 ("~하세요", "~하셔야 합니다", "~피하세요"). 친근하고 따뜻하되 전문성 유지.
3. 명리학 용어를 일상어로 풀어쓰기.
4. 사건 예측 금지: 단정적 미래 예측 불가. "조심하세요", "유의하세요" 수준.
5. 모든 텍스트는 한국어.
6. 각 패턴의 일간과 십신 특성이 분명히 드러나야 함. Generic 텍스트 금지.`;
}

function buildUserPrompt(pattern) {
  const dm = DAY_MASTER_PROFILES[pattern.day_master];
  const tenGod = pattern.ten_god;
  const tenGodMeaning = TENGOD_MEANINGS[tenGod] || '';

  return `다음 사주 패턴에 대한 연운 리딩을 작성해주세요.

## 패턴 정보
- 일간: ${dm.hangul} (${dm.stem}) — ${dm.image}
- 일간 성향: ${dm.nature}
- 강점: ${dm.strengths.join(', ')}
- 주의점: ${dm.watchpoints.join(', ')}
- 연도: ${pattern.target_year}년 ${pattern.year_stem}${pattern.year_branch} (${dm.hangul}일간 기준 십신: ${tenGod})
- 십신 의미: ${tenGodMeaning}
- 연도 이미지: ${pattern.year_label}

## 작성해야 할 내용

### 1. 카드 8장 (JSON 배열)
각 카드는 다음 필드를 가집니다:
- card_type: "cover" | "overall" | "work" | "money" | "relationships" | "growth" | "action" | "method"
- card_index: 1~8
- title: 카드 제목 (10~20자)
- summary: 핵심 요약 (2~3문장, 50~100자)
- keywords: 키워드 3개 (배열)
- bullets: 핵심 포인트 3개 (배열, 각 20~40자)
- action: "해볼 일" (1~2문장)
- watch: "주의" (1~2문장)

### 2. 정밀 항목 13개 (JSON 배열)
각 항목은 다음 필드를 가집니다:
- domain_key: "mindset" | "relationships" | "health" | "career" | "family" | "romance" | "wealth" | "fashion" | "season" | "purchases" | "avoid" | "favorable" | "must_do"
- domain_index: 1~13
- domain_label: 한국어 항목명
- points: 3~5개 처방 (배열, 각 20~60자)

### 3. 월별 24슬롯 (JSON 배열)
각 슬롯:
- lunar_month: 1~12
- half: "first" | "second"
- guidance: 1~2문장 (20~50자)

## 출력 형식
아래 JSON 구조로 응답하세요:
\`\`\`json
{
  "cards": [...],
  "domains": [...],
  "monthly": [...]
}
\`\`\``;
}

const TENGOD_MEANINGS = {
  '비견': '같은 기운이 겹침 — 동료, 경쟁, 자기 주장이 강해짐',
  '겁재': '같은 기운이 부딪힘 — 답답함, 경쟁, 자원 분배 필요',
  '식신': '자기 표현과 결과물 — 창작, 완성, 생활의 즐거움',
  '상관': '불편함을 개선하는 제안 — 비판, 혁신, 표현이 앞섬',
  '편재': '새로운 기회와 기회비용 — 넓은 탐색, 현금흐름 주의',
  '정재': '안정적인 운영과 수입 — 예산, 신뢰, 꾸준함',
  '편관': '책임과 긴장감 — 압박, 과제, 집중 필요',
  '정관': '기준과 신뢰 — 절차, 역할, 안정적 성장',
  '편인': '낯선 관점과 생각 — 재해석, 실험, 아이디어',
  '정인': '배움과 지원 — 체계화, 학습, 준비',
};

// ============================================================
// 메인 로직
// ============================================================

function parseArgs() {
  const args = { all: false, dryRun: false, dayMaster: null, yearStem: null, yearBranch: null };
  for (const arg of process.argv.slice(2)) {
    if (arg === '--all') args.all = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg.startsWith('--day-master=')) args.dayMaster = arg.split('=')[1];
    else if (arg.startsWith('--year-stem=')) args.yearStem = arg.split('=')[1];
    else if (arg.startsWith('--year-branch=')) args.yearBranch = arg.split('=')[1];
  }
  return args;
}

async function ensureSeedsDir() {
  await fs.mkdir(seedsDir, { recursive: true });
}

function filterPatterns(matrix, args) {
  if (args.all) return matrix;
  if (args.dayMaster) return matrix.filter((p) => p.day_master === args.dayMaster);
  return matrix;
}

function patternToSeedObject(pattern, llmOutput) {
  const cards = llmOutput.cards.map((c, i) => ({
    module_id: `${pattern.pattern_id}_${c.card_type}`,
    pattern_id: pattern.pattern_id,
    card_type: c.card_type,
    card_index: c.card_index || (i + 1),
    title: c.title,
    summary: c.summary,
    keywords: c.keywords || [],
    bullets: c.bullets || [],
    action: c.action,
    watch: c.watch,
    evidence: [],
    tone: 'natural',
    review_status: 'draft',
  }));

  const domains = llmOutput.domains.map((d, i) => ({
    module_id: `${pattern.pattern_id}_${d.domain_key}`,
    pattern_id: pattern.pattern_id,
    domain_key: d.domain_key,
    domain_label: d.domain_label,
    domain_index: d.domain_index || (i + 1),
    points: d.points || [],
    closing: d.closing || null,
    tone: 'natural',
    review_status: 'draft',
  }));

  const monthly = llmOutput.monthly.map((m) => ({
    slot_id: `${pattern.pattern_id}_m${m.lunar_month}${m.half === 'first' ? 'f' : 's'}`,
    pattern_id: pattern.pattern_id,
    lunar_month: m.lunar_month,
    month_pillar: MONTH_PILLARS[m.lunar_month - 1],
    half: m.half,
    guidance: m.guidance,
    tone: 'natural',
    review_status: 'draft',
  }));

  return {
    pattern_id: pattern.pattern_id,
    day_master: pattern.day_master,
    year_stem: pattern.year_stem,
    year_branch: pattern.year_branch,
    ten_god_stem: pattern.ten_god,
    branch_relation: 'none',
    label: `${DAY_MASTER_PROFILES[pattern.day_master].image} × ${pattern.year_label}`,
    cards,
    domains,
    monthly,
  };
}

const MONTH_PILLARS = ['병인월', '정묘월', '무진월', '기사월', '경오월', '신미월', '임신월', '계유월', '갑술월', '을해월', '병자월', '정축월'];

async function callLLM(systemPrompt, userPrompt) {
  // TODO: Qwen API 연동 (또는 로컬 Ollama)
  // 현재는 stub — 실제 구현 시 아래를 교체:
  //
  // const response = await fetch('http://localhost:11434/api/generate', {
  //   method: 'POST',
  //   headers: { 'content-type': 'application/json' },
  //   body: JSON.stringify({
  //     model: 'qwen2.5:32b',
  //     system: systemPrompt,
  //     prompt: userPrompt,
  //     format: 'json',
  //     stream: false,
  //   }),
  // });
  // const data = await response.json();
  // return JSON.parse(data.response);

  throw new Error('LLM 호출이 아직 구현되지 않았습니다. --dry-run 모드를 사용하세요.');
}

async function generateForPattern(pattern, dryRun) {
  const system = buildSystemPrompt();
  const user = buildUserPrompt(pattern);

  if (dryRun) {
    console.log(`\n=== ${pattern.pattern_id} (DRY RUN) ===`);
    console.log('System prompt length:', system.length);
    console.log('User prompt length:', user.length);
    console.log('User prompt preview:', user.slice(0, 200) + '...');
    return null;
  }

  const llmOutput = await callLLM(system, user);
  return patternToSeedObject(pattern, llmOutput);
}

async function main() {
  const args = parseArgs();
  await ensureSeedsDir();

  const matrix = generatePatternMatrix();
  const targets = filterPatterns(matrix, args);

  console.log(`대상 패턴: ${targets.length}개${args.dryRun ? ' (DRY RUN)' : ''}`);

  const results = [];
  for (const pattern of targets) {
    try {
      const seed = await generateForPattern(pattern, args.dryRun);
      if (seed) results.push(seed);
    } catch (error) {
      console.error(`✗ ${pattern.pattern_id}: ${error.message}`);
    }
  }

  if (results.length > 0) {
    const batchName = args.dayMaster
      ? `${args.dayMaster}-seeds`
      : 'all-seeds';
    const outputPath = path.join(seedsDir, `${batchName}-${Date.now()}.mjs`);
    const exportName = batchName.toUpperCase().replace(/-/g, '_');
    const content = `// Auto-generated by scripts/generate-reading-patterns.mjs
// Generated: ${new Date().toISOString()}
// Patterns: ${results.length}

export const ${exportName} = {
  patterns: ${JSON.stringify(results, null, 2)},
};
`;
    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`\n✓ ${results.length} patterns saved to ${outputPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
