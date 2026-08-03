# PR #2 Annual Reading Completion Plan

## Loop specification

- Loop archetype: repair-to-spec.
- Trigger: PR #2 follow-up reviews found policy, provenance, persistence, lifecycle, and accessibility gaps at commit `add6849`.
- Goal: make the enabled annual-reading range fully fixture-backed, make every material annual and monthly claim rule-traceable, preserve the complete `annual-reading.v1` object through storage/export, and verify the accessible browser lifecycle.
- Non-goals: add new astrology schools, hidden-stem weighting, generative narration, image export, production PostgreSQL deployment, or broader natal-engine changes.
- Verifier: `npm test` (exit 0 at baseline; `package.json` runs every `tests/*.mjs` suite that will own this change), targeted Node suites, migration/schema inspection, and a real-browser annual save/reopen/focus/print flow.
- Stop condition: all reviewed blockers are implemented, targeted and full gates pass, browser evidence is clean, source-of-truth documents agree, PR #2 is updated, and no known merge blocker remains.
- Memory artifact: this implementation unit plus `PROJECT_STATUS.md`.
- Expected terminal outcomes: `DONE` if every gate passes; `BLOCKED` only if an authoritative fixture or required external service cannot be obtained after fallback investigation.
- Escalation condition: a destructive schema contraction, production credential, or new astrology-policy choice beyond the reviewed v1 exclusions becomes necessary.

## Scope

### In

- 2024-2026 target-year support backed by KASI/KASA exact-minute solar-term fixtures through the 2027 closing boundary.
- Structured annual and monthly fact/rule contracts, conflict priority, suppression, safety metadata, and claim trace.
- Mandatory natal chart-policy provenance.
- Lossless browser/SQLite/PostgreSQL annual-result storage and lifecycle coverage.
- Focusable card navigation, document-order, reduced-motion, print/privacy, and responsive browser verification.
- README, PRD, policy, data architecture, project status, service-worker, PR, and issue alignment.

### Out

- 1900-2099 annual output without an independently reviewed official fixture set.
- Hidden-stem annual activation or weighting; it remains explicitly excluded in v1.
- Gyeokguk, yongsin, strength scoring, johu, special combinations, deterministic event predictions, or generative copy.
- PNG/JPEG export and production database rollout.

## Dependency-ordered build

1. Replace the third-party annual runtime oracle with checked-in, source-versioned KASI/KASA fixtures and derive enabled years from complete target/start/end coverage.
2. Introduce structured annual/monthly rules and evidence-addressable monthly facts, then generate the existing eight-card/12-month outputs from those contracts.
3. Enforce chart provenance and the complete annual-result boundary contract at API, storage, export, and training-projection seams.
4. Extract browser record storage into a testable ES module, wire focus behavior, and verify the real browser lifecycle.
5. Synchronize documentation, run all gates, perform independent code review, and update PR #2.

## Structural decision

- Context: `server/domain/annual.mjs` already owns ephemeris adaptation, facts, rules, copy, monthly flow, and hashing; adding the missing contracts in place would exceed the repository's 400-line split threshold and preserve the existing primitive/data-clump problem.
- Rejected alternative: continue adding constants and conditionals to `annual.mjs`. This keeps policy, rule definitions, and orchestration coupled and makes independent rule tests difficult.
- Chosen move: extract `annual-ephemeris.mjs` and `annual-rules.mjs` as domain-owned modules; keep `annual.mjs` as the annual-reading orchestrator. Extract IndexedDB record operations to `annual/storage.mjs`, a browser infrastructure adapter consumed by `index.html`.
- Consequences: domain dependencies remain inward and acyclic; API and persisted payload shape become stricter but keep schema version `annual-reading.v1`; SQLite/PostgreSQL evolution is additive and backward-compatible.

## Baseline evidence

- `npm test` exited 0 on 2026-08-04: 42 annual, 120 smoke, 33 lifecycle, and 48 ingestion assertions.
- Git branch: `feat/issue-1-annual-reading` at `add6849`; worktree clean before this implementation unit.
- PR #2 is open and mechanically mergeable; CI `verify` is green for `add6849`, but the three owner review comments list unresolved merge blockers.

