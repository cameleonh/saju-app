# Phase 1 — Interaction, Consent, Loading, and Readability Foundations

## Dependency declaration

- Depends on: locked `000_plan.md` and verified `001_baseline.md`.
- Produces: stable screen and consent states consumed by Phase 2 record and guidance surfaces.

## Scope

### MODIFY `index.html`

1. Navigation and view state
   - Before: `state.screen` effectively selects `intro`, `input`, or `result`; both informational nav actions return to the same intro disclosure.
   - After: add `method` and `data` screen values; implement `methodView()` and a Phase-1 data-information shell; map desktop and mobile active state to actual destinations.
   - Add a single navigation helper that renders a destination and then resets scroll and focuses the destination heading.

2. Stage transition and first CTA
   - Before: start buttons can be disabled before the reason is visible, and smooth scrolling runs too early after render.
   - After: leave the CTA actionable. If required service acknowledgement is missing, retain the screen and move focus to the disclosure. Otherwise render input, request birthplace data, then call `moveToStage('input-title')` after DOM replacement.
   - Add `tabindex="-1"` and `scroll-margin-top` to stage headings and honor `prefers-reduced-motion`.

3. Consent semantics
   - Before: service storage and model-training use are both mandatory.
   - After: vertically stack a required service-storage acknowledgement and a separately unchecked `제품 개선을 위한 학습 사용 (선택)` control. Only the service acknowledgement gates calculation. Keep generated purpose receipts separate and omit a positive training receipt when unchecked.
   - Replace any copy that implies optional training is necessary to provide the service.

4. Birthplace catalog lifecycle
   - Before: `<script src="data/admin-areas.js?v=5">` blocks every initial page load and immutable catalog indexes are built at script evaluation.
   - After: remove the eager tag; add mutable empty catalog indexes, `birthPlaceStatus: 'idle'`, `hydrateBirthPlaceCatalog(data)`, and idempotent `loadBirthPlaceData()` that injects the versioned script only when the input screen is entered.
   - At bootstrap, call `hydrateBirthPlaceCatalog(globalThis.SAJU_BIRTH_PLACES)` only when a catalog is already present. This preserves deterministic VM tests and file/embed consumers without causing a browser network request.
   - Render a disabled loading state while pending, an actionable retry state on error, and normal suggestions after hydration.
   - Field chain for `birthPlaceStatus`: creation in initial state -> serialization N/A because it is ephemeral UI state -> deserialization N/A -> consumers in input rendering, stage entry, and retry action.

5. Typography and technical copy
   - Before: Noto Sans and multiple Noto Serif weights are requested; important UI text is 10–14 px; several labels expose English or internal identifiers.
   - After: use the system sans stack for body copy and at most one remote serif weight for display accents; raise `.topnav button`, `.mode-card small`, and `.mobile-nav button` to 15 px and `.brand-copy small` to 13 px; keep minimum control height at 44 px.
   - Replace user-facing engine jargon with Korean-first labels. Preserve detailed identifiers only inside the calculation-principles view.

### MODIFY `service-worker.js`

- Before: cache name `saju-app-shell-v5` and precache list include `data/admin-areas.js?v=5`.
- After: bump to `saju-app-shell-v6`; remove the birthplace catalog from install precache so the intro cannot fetch it implicitly; retain runtime same-origin fetch behavior and `skipWaiting`.

### MODIFY `tests/smoke.mjs`

- Keep the already-drafted assertions for distinct views, stage helper, optional training, lazy catalog, cache v6, and raised font sizes.
- Move Phase-2-only record and guidance expectations out of this file into a new red `tests/lifecycle.mjs` contract so Phase 1 retains an independently passing targeted verifier without weakening earlier chart and birthplace coverage.

### ADD `tests/lifecycle.mjs`

- Carry the already-drafted `buildReflectionAnswer`, record-action, multi-record, and honest-label expectations forward as the intentional Phase 2 failure contract.
- Read `index.html` directly and evaluate only the pure guidance slice needed for these checks; do not duplicate the full chart golden suite.

## Acceptance and activation evidence

- Source test passes with service-only gating and no eager catalog script.
- Browser: start with acknowledgement off -> service disclosure receives focus and input does not appear.
- Browser: check only service acknowledgement -> input appears at the top heading and calculation can finish.
- Network: intro has no `admin-areas.js` request; input triggers exactly one request.
- Failure activation: block the catalog request -> visible retry copy, no uncaught exception; restore and retry -> usable field.
- Desktop and mobile: method and data buttons render distinct headings and correct active states.
- Visual inspection: important navigation and helper text are readable at audited widths.
- `node tests/smoke.mjs` passes at the end of Phase 1. `tests/lifecycle.mjs` and the lifecycle portion of `tests/server/ingestion.mjs` remain intentionally red until Phase 2 and are not misreported as Phase-1 regressions.

## Verifiers

- `node tests/smoke.mjs` — directly reads `index.html` and `service-worker.js`; baseline exit 1 confirms it observes the missing targets.
- Browser automation — directly exercises rendered DOM, focus, scroll, network requests, responsive layout, and console.

## Rollback boundary

Revert only `index.html`, `service-worker.js`, and Phase-1 test expectations. The birthplace data artifact and calculation engine remain unchanged.
