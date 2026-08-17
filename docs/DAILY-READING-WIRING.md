# Daily Reading ("오늘의 기운") — Deferred UI Wiring Notes

> Deliverable of the daily-fortune worker on `feature/doryeong-packaging`.
> The seed DB, selection logic, and tests are committed; the index.html render
> hook is **deferred** to avoid conflicts with the packaging agent, which owns
> `index.html` / `web/*` / `annual/client.mjs` on this branch.

## What exists (committed)

| Piece | Location |
|---|---|
| Daily content DB (87 content modules, `review_status: draft`) | `server/storage/seeds/daily-readings.mjs` |
| Day-pillar resolution + deterministic selection | `server/domain/daily-reading-selection.mjs` |
| Unit tests (schema + day pillar + determinism + coverage) | `tests/unit/daily-reading.mjs` |

## Policy adaptation vs. doryeong.app

- **No grading words.** No "아주 좋아요" badges, no scores, stars, grades, or
  luck levels. Only 흐름/결/톤 language ("차분히 가려내는 날"). The test suite
  enforces this with a banned-pattern scan over every module and every
  generated output string.
- **Evidence-first.** The reading opens with a 4-step 근거 스트립 (오늘의 일진 →
  일간 대비 십신 → 오늘 유입 오행 → 원국과의 합·충) before any prose.
- **신살 excluded.** doryeong shows 천을귀인/도화/반안살; this repo has **no
  engine module that computes 신살** (see `docs/GAP-ANALYSIS-doryeong.md` §7).
  The constraint was "only what the KR-CIVIL engine already computes", so the
  daily reading omits 신살 and reports the exclusion explicitly in
  `unsupported_states` (`daily.sinsal`). Adding a 신살 engine module is a
  separate, engine-owning work item — never patch it into this selector.
- **캐릭터 톤.** Only the closing is character-voiced: 서생 반말
  (음이니/니라, per the Layer B composer conventions in
  `web/result-packaging.mjs`). Body prose stays 존댓말. Hanja appears only in
  parenthetical glosses (test-enforced).

## Engine reuse (read-only — engines were NOT modified)

| Fact | Source |
|---|---|
| Day pillar for any date 1900-2100 (KR-CIVIL civil-midnight boundary) | `chart/natal-engine.mjs` — `resolveDayPillar()` calls `calculateNatalChart({ unknownTime: true })` and reads `pillars[2]` |
| Branch relations 충·육합·삼합(반합)·형(3자)·해·원진 vs natal branches | `chart/daewoon-branch-analysis.mjs` — `analyzeDaewoonBranch(dayBranch, natalBranches, dayMasterElement)` |
| Natal features (day master, element counts, valid branches, …) | `server/domain/natal-chapter-selection.mjs` — `extractNatalFeatures()` (Stage 4, reused as-is) |
| Ten-god of today's stem vs day master | local `tenGodFor()` table (same convention as `annual.mjs`) |

Independent cross-check: the test suite validates `resolveDayPillar` against
`lunar-javascript` `getDayInGanZhi()` (civil-midnight split) for 40+ dates
across 2026–2027, plus golden values (2026-08-17 = 癸亥).

## Section/slot scheme

Render order is fixed: 근거 스트립 → 흐름 노트 → 4 sections → 소품 tip → 퀘스트 →
시간대 노트 → 서생의 한 마디.

| # | Slot | id | Selection axis | Variants | Mandatory |
|---|---|---|---|---|---|
| 0 | 근거 스트립 | `evidence` | computed data | — (4 steps) | always |
| 0.5 | 흐름 노트 | `flow` | today-branch × natal-branch relations | 6 충 + 6 육합 + 1 삼합 + 1 both + 1 friction | conditional (null when no relation) |
| 1 | 오늘의 결 (mood) | `mood` | `ten_god` | 10 | always |
| 2 | 일의 흐름 (work) | `work` | `ten_god` | 10 | always |
| 3 | 사람 사이 (relations) | `relations` | `ten_god` | 10 | always |
| 4 | 몸의 리듬 (energy) | `energy` | `day_branch_element` | 5 | always |
| 5 | 오행 소품 tip | `prop_tip` | incoming element rule (missing → bridge → stem) | 5 elements × 3 why-rules | always |
| 6 | 오늘의 퀘스트 | `quest` | `ten_god` | 10 | always |
| 7 | 시간대 노트 | `time_note` | `day_branch_hangul` (육합 window + 충 window) | 12 | always |
| 8 | 서생의 한 마디 | `closing` | `flow_key` (mixed/rough/smooth/friction/group:*/unknown) | 10 | always |

Module count: 10+10+10+5 (sections) + 15 (flow notes) + 5 (props) + 10
(quests) + 12 (time notes) + 10 (closings) = **87** (plus 3 prop why-strings).

Flow-key priority mirrors the packaging `flowBadge()`: 충+합 → `mixed`,
충 → `rough`, 합 → `smooth`, 형/해/원진 only → `friction`, else the ten-god
group (`group:resource|expression|wealth|power|self`). Day-master specificity
enters prose via `{day_master}` interpolation, so coverage of
(10 day masters × 10 ten-god relations × 4 sections) is total by construction —
the 60-day sweep test proves every ten god, branch element, branch, flow
family, and prop rule resolves with no empty slot and no unresolved
placeholder.

## Integration recipe (when index.html is free to edit)

The module is dependency-free ESM (imports only engines + seeds). Options:

**Option A — client-side daily panel (doryeong-style).** After a natal chart is
computed, call:

```js
import { buildDailyReading } from './server/domain/daily-reading-selection.mjs';
const daily = buildDailyReading(chart, new Date().toISOString().slice(0, 10)); // KST date
```

Render suggestions against existing patterns:

- `evidence[]` → reuse the `.evidence-flow` strip (`evidenceFlowMarkup` in
  `web/result-packaging.mjs`), one step per entry, ending on the flow note.
- `flow` → a `.flow-badge tone-caution|favorable|neutral` chip using
  `flow.label` + `flow.text` (label is already 서술형).
- `sections[]` → `.reading-card` collapsibles: `slot_index` → number chip,
  `kind` → eyebrow, `title` → heading, `lead`/`detail`/`practice` → body blocks.
- `prop_tip` → the `.lucky-props` block pattern (`element` + `items` + `why`).
- `quest` → the `.quest-chip` pattern (🎯 label + text).
- `time_note` → a small two-column time strip: `join_window` (label +
  start–end) and `clash_window`; `text` as the caption.
- `closing` → the `.saeseong-remark` aside (註 seal, character 서생, text).

Note: browsers cannot import the server module path directly unless the
deploy bundles it (the annual client inlines its seeds for the same reason).
Follow whichever technique `annual/client.mjs` lands on for seed inlining.

**Option B — server-side compose.** Attach `buildDailyReading(chart, today)` to
the stored reading server-side (same pipeline as the annual facts) and render
from the stored JSON. `today` must be the Asia/Seoul civil date, not UTC —
compute it with the engine's Seoul timezone snapshot, not
`new Date().toISOString()`.

## Review gate

All modules are `review_status: 'draft'` (newly written 서생-voice prose). An
operator review pass should flip to `approved` before UI exposure — same gate
as the natal-chapter seeds. Suggested checklist: grading-word scan (the test's
`BANNED_PATTERN` is the canonical list), hanja minimality, no fate-deterministic
claims, particle correctness around interpolated pillars.

## npm test wiring

`tests/unit/daily-reading.mjs` is appended to the `test` script after
`tests/unit/natal-chapter-selection.mjs`. It can also be run directly:
`node tests/unit/daily-reading.mjs`.
