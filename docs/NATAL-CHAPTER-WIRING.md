# Natal Chapter Selection — Deferred UI Wiring Notes

> Stage 4 deliverable. The natal chapter DB and selection logic are committed;
> the index.html render hook is **deferred** to avoid conflicts with the
> packaging agent (consent gate / loading narrative / result packaging), which
> owns the result-screen markup on `feature/doryeong-packaging`.

## What exists (committed)

| Piece | Location |
|---|---|
| Chapter DB (16 slots, 80 content modules, `review_status: draft`) | `server/storage/seeds/natal-chapters.mjs` |
| Feature extraction + deterministic selection | `server/domain/natal-chapter-selection.mjs` |
| Unit tests (schema + selection) | `tests/unit/natal-chapter-selection.mjs` |

## What is deferred

1. **Client render hook** — index.html currently builds the 8 static chapters
   inline inside `calculateChart()` (the `reading = [...]` array, ~line 809-870).
   The new chapter list should replace that array once the packaging agent's
   result-packaging work lands.
2. **npm test wiring** — `tests/unit/natal-chapter-selection.mjs` is appended to
   the `test` script in the working tree's `package.json`. That file also carries
   the packaging agent's concurrent edits (`loading-narrative`, `result-packaging`),
   so the shared `package.json` is left for their commit; the entry string is:

   ```
   && node tests/unit/natal-chapter-selection.mjs
   ```

   inserted after `tests/unit/daewoon-domains.mjs`. The test can also be run
   directly: `node tests/unit/natal-chapter-selection.mjs`.

## Integration recipe (when index.html is free to edit)

The selection module is dependency-free ESM with the same shape as the
annual/daewoon domain modules. Two wiring options:

**Option A — server-side compose (recommended).** Follow the annual pipeline:
the server (or future import map entry) calls

```js
import { buildNatalChapters } from './server/domain/natal-chapter-selection.mjs';
const natalChapters = buildNatalChapters(chart); // chart = calculateNatalChart output
```

and attaches `natalChapters` to the stored reading. The client renders
`chapters[]` with the existing `.reading-card` collapsible pattern:
`domain_index` → chapter number chip, `kind` → eyebrow label, `title` →
chapter heading, `lead`/`detail`/`practice` → reading-body blocks,
`questions` → reading-prompts, `evidence[]` → evidence-row seals.

**Option B — client inline.** Extract the module's constants into the
index.html engine script (same technique the annual client uses for seeds) and
call `buildNatalChapters(chart)` inside `calculateChart()`; swap the static
`reading` array for the selected chapters, mapping each chapter's `evidence[]`
ids to the existing `facts[]` entries (note: `branch_clash`, `branch_harmony`,
`three_harmony` chapters have empty evidence arrays — render their pillar-pair
text from `matched` instead, or add facts `natal.clash` / `natal.harmony` /
`natal.triad` mirroring the couple-flow warnings pattern).

## Chapter scheme (feature → chapter)

| # | Chapter | Trigger | Variants |
|---|---|---|---|
| 1 | overview | always | — |
| 2 | day_master_image | always | 10 day masters |
| 3 | seasonal_root | always | 4 seasons |
| 4 | ten_god_structure | always | 10 month-stem ten gods |
| 5 | element_balance | always | 5 dominant elements |
| 6 | life_hints | always | 10 day masters |
| 7 | hour_rhythm | `time_known = true` | — |
| 8 | unknown_time | `time_known = false` | — |
| 9 | repeated_ten_god | repeated visible ten god ≥2 | 10 ten gods |
| 10 | missing_element | ≥1 element absent | 5 elements |
| 11 | dominant_skew | `dominant_count >= 4` | 5 elements |
| 12 | branch_clash | natal branch clash present | 6 clash pairs |
| 13 | branch_harmony | natal six-harmony present | 6 pairs |
| 14 | three_harmony | natal triad complete | 4 triads |
| 15 | boundary_sensitive | engine boundary flag | — |
| 16 | closing | always | — |

## Review gate

All modules are `review_status: 'draft'` (newly written 서생-voice prose, not
derived from approved text). Before exposing in the UI, an operator review pass
should flip them to `approved` — mirroring how the month-branch seeds were
gated. Suggested review checklist: hanja minimality, second-person prescription
style, no fate-deterministic claims, tone consistency with
`DAY_MASTER_PROFILES`.
