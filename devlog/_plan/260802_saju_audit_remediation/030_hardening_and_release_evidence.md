# Phase 3 — Integrated Hardening and Release Evidence

## Dependency declaration

- Depends on: completed and individually verified Phase 1 and Phase 2 behavior.
- Produces: integrated release evidence, synchronized canonical documents, and a clean completion audit.

## Scope

### MODIFY implementation files only when observed verification exposes a defect

- Candidate paths: `index.html`, `service-worker.js`, `server/http.mjs`, `server/storage/sqlite.mjs`, `tests/smoke.mjs`, and `tests/server/ingestion.mjs`.
- Before: each earlier phase has focused evidence but cross-feature behavior may still reveal responsive, focus, stale-cache, or lifecycle integration defects.
- After: repair only failures reproduced in this phase; add the smallest regression assertion that proves each repair.
- Any materially new feature is not absorbed here. It is appended as a new goalplan work phase.

### MODIFY `PRD.md`

- Align required service acknowledgement, optional training, distinct information views, record lifecycle, rule-based question guidance, and local-development infrastructure limitations with shipped behavior.

### MODIFY `DESIGN-SYSTEM.md` and `DESIGN.md` where applicable

- Record the final moonlit Joseon visual tokens, minimum readable helper sizes, responsive two-column couple input, navigation state, focus/scroll contract, disclosure hierarchy, reduced-motion behavior, record card controls, and restrained animation policy.
- Preserve the existing aesthetic direction; do not import generic component-library styling or new dependencies.

### MODIFY `README.md`

- Document the exact local start/test commands, storage locations, optional-training semantics, management endpoints, and prototype-versus-production boundary.

### MODIFY `PROJECT_STATUS.md`

- Record objective, implemented versus verified behavior, fresh command outputs, browser evidence paths, remaining infrastructure limitations, and exact completion state.

### MODIFY this devlog unit and goalplan evidence

- Capture screenshots and QA evidence under this unit.
- Record architect verdict, ai-slop-cleaner findings and repairs, full post-cleanup verifier output, dead hypotheses, and final terminal outcome.

## Integrated verification matrix

- Static/logic: `node tests/smoke.mjs`.
- API/storage: `node tests/server/ingestion.mjs` with local-port permission.
- Full suite: `npm test`.
- Health: local `/health` returns 200 and identifies durable SQLite when started through the project command.
- Mobile browser: approximately 390 × 844, including intro, missing-service guard, service-only flow, birthplace load, calculation, question, records, method, and data navigation.
- Desktop browser: 1280 × 720 or wider, including responsive couple input with self left and partner right.
- Accessibility: keyboard-only primary flow, focus after stage navigation, labels, 44 px targets, contrast spot-check, reduced-motion behavior, and no uncaught console errors.
- Performance: compare initial request list and bytes against the baseline; confirm no intro catalog request and reduced font resources.
- Destructive controls: confirmations observed; test fixtures only.

## Independent gates

- A fresh architect reviews boundaries, data lifecycle honesty, consent semantics, API contracts, and remaining production risks.
- `$oh-my-codex:ai-slop-cleaner` reviews changed files for generic AI copy, unnecessary abstractions, duplicated behavior, and style inconsistency.
- All tests and browser scenarios are rerun after cleanup. Pre-cleanup evidence cannot close the goal.

## Acceptance evidence

- No unresolved Critical or High architect blocker.
- No stale canonical document contradicts code.
- Full post-cleanup test suite exits zero.
- Mobile and desktop screenshots are opened and visually inspected, not merely generated.
- Console and network evidence confirm the main conditional branches fired.
- Goalplan validation passes with every work phase done and every criterion met with non-empty captured evidence.

## Pessimist check

- A smaller initial transfer does not prove faster interaction on every device; network request and UI readiness observations are required.
- Passing static assertions does not prove focus, scroll, confirmation, or responsive layout; browser activation is required.
- Local deletion endpoints do not provide production privacy compliance without identity, authorization, retention jobs, and audit controls; documents must keep that limitation explicit.
- If cleanup changes behavior or a post-cleanup gate regresses, the direction is wrong until the failing delta is repaired and reverified.

## Phase 3 cleanup plan

### Behavior lock before cleanup

- Fresh baseline: `npm test` passes 108 chart/UI smoke assertions, 33 browser-record lifecycle assertions, and 34 ingestion assertions.
- Browser behavior already locked in earlier phases: optional training does not block entry, one calculation creates one stable record, questions update that record instead of posting again, record open/export/delete/clear/withdrawal work, and stage navigation restores heading focus at scroll position zero.
- Cleanup is limited to changed release surfaces: `index.html`, `service-worker.js`, `server/storage/sqlite.mjs`, relevant regression tests, and canonical documents.

### Fallback and duplication inventory

- **Masking slop — remove:** `polishCopy()` walks every rendered text node to repair source copy after rendering. Put the final Korean copy in the templates and delete the walker.
- **Masking slop — remove:** result templates create storage/training/engine status blocks that `enhanceResultView()` immediately deletes. Stop rendering those blocks and retain only the actionable record-delete control under calculation principles.
- **Grounded compatibility — keep:** browser UUID fallback supports environments without `crypto.randomUUID`; birthplace loading keeps an actionable retry path; offline IndexedDB/outbox behavior is part of the product contract.
- **Grounded migration — tighten:** legacy SQLite column migration remains idempotent, but only the expected duplicate-column error may be ignored. Unexpected migration failures must propagate.
- **Release defect — repair:** bump the service-worker cache after the shipped shell changes and use the canonical cached app shell as the offline navigation fallback instead of looking up only the exact request URL.

### Ordered cleanup passes

1. Repair the service-worker fallback and add a regression assertion.
2. Remove post-render copy and result-panel deletion work while preserving final visible copy.
3. Narrow the SQLite migration exception boundary.
4. Synchronize PRD, design, README, and status claims with verified behavior.
5. Run the full automated suite, then repeat mobile/desktop browser, keyboard/focus, network, and console checks.

### Dead hypothesis: system-font-only first paint

- Removing the two remote Noto font weights eliminated the initial font waterfall in a live network trace.
- The resulting mobile and desktop screenshots rendered Korean text as missing-glyph boxes in the verification environment because no usable Korean system font was installed.
- The change was reverted. The legibility baseline keeps Noto Sans KR 400 and Noto Serif KR 600; adding more weights remains prohibited. A production self-hosted subset needs its own cross-platform glyph and transfer-size test rather than an unverified font removal.

### Independent-review infrastructure note

The Phase 3 repository-mapping subagent failed with the same native transport error seen in earlier phases: `Encrypted function output content could not be decrypted or decoded.` A fresh architect gate will still be retried after the integrated diff; until then, this is a review-infrastructure gap rather than product evidence.

## Implemented hardening

- `service-worker.js` now uses `saju-app-shell-v7`, removes older shell caches, keeps navigation network-first, and falls back to the exact cached route, canonical `index.html`, then the root shell. The 1.6 MB birthplace catalog is not precached.
- `index.html` no longer walks rendered text nodes through `polishCopy()`. Final Korean stage labels, result headings, birthplace labels, and button copy are present in the templates.
- Personal and couple result templates no longer create storage/training/external-AI status cards or calculation-engine rows only to remove them after rendering. The actionable record-delete control remains under calculation principles.
- Toasts are DOM-only status announcements; a render cannot duplicate them or erase stage-heading focus.
- Lunar buttons and birthplace field labels/placeholders are final at render time rather than enabled or renamed by a cleanup pass.
- Couple service-storage disclosure copy is generated by mode instead of replacing label children after rendering.
- Legacy SQLite column upgrades ignore only the expected duplicate-column error. Unexpected migration errors propagate. Training withdrawal also rejects malformed purpose-receipt storage instead of silently replacing it with an empty array.

## `$oh-my-codex:ai-slop-cleaner` report

- **Removed masking behavior:** post-render copy localization, post-render removal of user-visible diagnostics, redundant toast state/rendering, redundant consent-class mutation, lunar-button enabling, and birthplace label/placeholder mutation.
- **Kept grounded compatibility:** UUID fallback, lazy birthplace retry, IndexedDB outbox, SQLite compatibility columns, lunar conversion boundary, and explicit local-versus-production storage copy.
- **Kept grounded structural enhancement:** the couple input wrapper and birthplace result panel are created after render because they depend on mode and lazy catalog state; neither masks a failure or changes the final product contract.
- **No new dependency or abstraction:** cleanup reduced code paths and preserved the vanilla stack.
- **Regression reinforcement:** smoke assertions now reject English fallback labels, result-side storage/engine markup, `polishCopy`, consent child replacement, lunar post-enable behavior, stale cache v6, and missing canonical offline fallback.

## Fresh automated evidence

- `npm test` exited 0 after all cleanup and document edits.
- `saju smoke: 113 assertions passed`.
- `lifecycle smoke: 33 assertions passed`.
- `ingestion smoke: 34 assertions passed`.
- Total: 180 assertions.
- After restarting the combined server from the final source, `GET /health` returned `{"status":"ok","service":"saju-ingestion-adapter","persistence":"sqlite","durable":true}`.

## Post-cleanup browser evidence

### Mobile — 390 × 844

- A clean introduction made one same-origin application request before optional Google Fonts unicode subsets; the birthplace catalog was absent.
- Pressing the first CTA without service acknowledgement stayed on the introduction, announced the exact correction, focused `notice-title`, and revealed the details. Training remained unchecked.
- Service acknowledgement alone entered the form with `input-title` focused at `scrollY = 0`; the lazy catalog then made exactly one `data/admin-areas.js?v=5` request.
- `문현동` produced one labeled option and resolved to `부산광역시 남구 문현동`.
- One calculation made one `POST /v1/submissions` request, focused `result-title` at zero, rendered eight chapters with one open, kept reading copy at 17px, and had no horizontal overflow, storage-status panel, or engine row.
- The large-text control changed reading copy to 19px. A work question returned the conditional sentence beginning `이직 여부를 대신 정하지는 않아요`; it made no network request.
- Reopening the record restored both conversation turns. Method and data navigation set the current-page action, focused their headings, and reset scroll to zero.
- Keyboard traversal reached the brand, personal mode, couple mode, and 48px primary CTA in order. Enter on the unacknowledged CTA triggered the same focused disclosure guard.
- Confirmed clear-all sent two successful DELETE requests. A fresh adult personal record with optional learning enabled exposed one withdrawal control; withdrawal sent 200, removed the control while preserving the record, and deletion then sent 200 and restored the empty state. Focus returned to `data-title` at zero after each mutation.

### Desktop — 1280 × 720

- Couple input rendered `내 출생 정보` at left 77px and `상대방 출생 정보` at left 649px, each 554px wide, with no duplicate authority checkbox or overflow.
- Couple service copy named both subjects and training remained initially unchecked. The stage eyebrow is `두 사람 입력`, not an English fallback.
- `삼성동` revealed five city/district choices and selected `서울특별시 강남구 삼성동`.
- One couple calculation made one submission POST and rendered two side-by-side chart sheets, seven reading chapters with one open, no compatibility-score copy, no storage-status panel, no engine row, no overflow, and no console error.

### Visual artifacts opened and inspected

- `phase3-mobile-result.png`: readable Korean headings, 44–48px actions, hanji chart surface, visible pillars, and no glyph loss.
- `phase3-mobile-records.png`: two compact record cards with clear open/export/delete actions and the active mobile records tab.
- `phase3-desktop-couple-input.png`: self-left/partner-right form with Korean stage label and quiet moonlit desk composition.
- `phase3-desktop-couple-result.png`: paired charts, relationship boundary note, combined element bars, readable contrast, and restrained information density.

All inspected browser runs ended with zero console errors. The live network trace confirmed one submission per calculation and no external-AI question request.

## Independent final review

- A fresh final `architect` agent was assigned the integrated implementation and canonical documents with explicit checks for consent, data honesty, lifecycle boundaries, PWA caching, focus, and production risks.
- It failed before returning a verdict with the recurring native transport error: `stream disconnected before completion: Encrypted function output content could not be decrypted or decoded.`
- The earlier Phase 3 `explore` and plan-critic attempts failed the same way; external Claude/Gemini probes in earlier phases also did not produce a bounded review result.
- No independent PASS is claimed. The residual is an unavailable review channel, compensated by a fresh 180-assertion suite, endpoint/browser branch evidence, screenshot inspection, stale-claim scanning, and this explicit limitations record.

## Residual production risks — intentionally out of this goal

- The chart engine remains a demo policy until calendrical conventions, source provenance, and a qualified golden suite are approved.
- Local SQLite has no production identity, subject ownership, KMS/envelope encryption, retention automation, backup/restore policy, or cross-device synchronization.
- Submission-level deletion and withdrawal are not account-wide, partner-subject-wide, processor-wide, dataset-wide, or model-lineage erasure.
- Korean privacy notices, legal basis, minor/third-party handling, controller/processor roles, hosting region, and the first specific product-learning objective require approval before public data collection.

## Terminal outcome

- Final-source `npm test`: 113 + 33 + 34 assertions passed, exit 0.
- Final-source health: durable local SQLite, exit 0.
- Critical stale-claim scan: no matches.
- `cxc loop validate --slug complete-and-verify-the-full-saju-web-app-remedi`: `OK — complete + all met criteria carry evidence`.
- PABCD advanced `C → D → IDLE` with exit code 0.
- Outcome: **DONE** for every in-scope local remediation. Remaining items above are production launch prerequisites, not unfinished work in this goal.
- Host goal was marked `complete` after the Ralph completion audit read-back. Final goal usage: 1,476,365 tokens and 10,097 seconds.
- Ralph cleanup was scope-safe and preserved the audit: `active=false`, `current_phase=cancelled`, `completion_audit.passed=true`.
