# Saju Audit Remediation Roadmap

## Objective

Finish the eight user-visible remediation areas identified by the 2026-08-02 design and behavior audit, then prove the integrated mobile-first web app in real browser flows.

## Work class and loop shape

- Work class: C4. The change crosses consent policy, client persistence, server persistence, navigation, performance, accessibility, and public product documentation.
- Loop archetype: spec-satisfaction repair.
- Trigger: verified UI defects and two intentionally failing regression suites.
- Goal: make the local product coherent, legible, honest, manageable, and responsive without pretending local prototype infrastructure is production-ready.
- Non-goals: production hosting, login or identity, cloud storage, KMS, external AI inference, remote deployment, Git initialization, and destructive migration of existing browser or SQLite data.
- Stop condition: all goalplan criteria have fresh captured evidence, the full test command exits zero, both responsive browser flows are observed, independent review has no unresolved critical blocker, and the post-cleanup verifier run remains green.
- Memory artifacts: this devlog unit, the bound `.codexclaw` goalplan and ledger, `PROJECT_STATUS.md`, and Ralph state under `.omx/state/`.
- Terminal outcomes: `DONE`, `NOOP`, `BLOCKED`, `UNSAFE`, `NEEDS_HUMAN`, or `BUDGET_EXHAUSTED` with evidence.

## Resource bounds

- Tools: local filesystem, local Node.js, local SQLite fixtures, local HTTP server, local browser automation, and read-only reference inspection.
- Credentials and external services: none.
- Write scope: `/mnt/d/codings/260801_saju-app` and its local evidence artifacts only.
- Network: local loopback for app and test servers; no remote mutation.
- Wall clock: one working session. A safe resumable checkpoint replaces any attempt to rush if the session boundary is reached.
- Escalation upward: main agent reclaims a bounded lane after two distinct agent packet failures or when a shared-file conflict appears.
- Delegation downward: only plan-audited, read-only review or disjoint verification packets may be delegated.

## Dependency-ordered work phases

1. `010_foundations.md` — establish screen, consent, loading, cache, focus, and typography foundations. These states are prerequisites for later record and question surfaces.
2. `020_record_lifecycle_and_guidance.md` — build record-management and server lifecycle contracts on top of the corrected screen and consent model, then replace misleading consultation framing.
3. `030_hardening_and_release_evidence.md` — run integrated browser and API validation, repair observed defects, synchronize the source-of-truth documents, complete independent review and cleanup, and capture final evidence.

## Baseline verifier reality

- `node tests/smoke.mjs` exists, directly reads `index.html`, `service-worker.js`, and the birthplace catalog, and exited `1` on 2026-08-02 because `buildReflectionAnswer` is intentionally absent.
- `node tests/server/ingestion.mjs` exists, imports `server/http.mjs` and `server/storage/sqlite.mjs`, and exited `1` with `404 !== 200` for the new training-withdrawal path when run with local-port permission.
- `npm test` exists in `package.json` and executes both targeted suites. It directly observes all implementation files through those suite imports and file reads.
- Browser QA observes rendered behavior that static tests cannot prove: scroll position, focus, active navigation, legibility, lazy resource timing, and responsive layout.

## Conditional-path activation map

- Missing service acknowledgement: click the first CTA with the required acknowledgement off; observe no screen change and focus on the service disclosure.
- Optional training declined: enable only service acknowledgement, complete a calculation, and observe a result and a service-only receipt.
- Birthplace load: open intro and observe no catalog request; enter input and observe one catalog request plus enabled search.
- Birthplace load failure: block or rename the catalog in a controlled browser run; observe an actionable retry/error state without a JavaScript crash.
- Record withdrawal: create a training-enabled durable submission, call the withdrawal endpoint, and observe the SQLite projection cleared.
- Record deletion: create a durable submission, call delete, and observe both HTTP success and no remaining row.
- Destructive local clear: invoke the UI action and observe confirmation before IndexedDB mutation.
- Category guidance: ask a career question and a relationship question; observe distinct bounded templates and no claim of AI prediction.

## Enforcement and bypass notes

- Service acknowledgement gate: E2 client guard plus E4 server validation. Executing surfaces are `onAction` and `validateSubmission`. Browser script modification or direct server calls can bypass the client, but not the server receipt check. Residual risk remains because this is a local prototype without authenticated identity. Wording is "required acknowledgement", not legal-consent enforcement. Final layer: server validation for accepted submissions.
- Optional model-training decision: no enforcement against declining. A positive receipt is required for eligibility and the server projection remains the final data-minimization layer. A caller can forge a receipt in this unauthenticated prototype; residual risk is disclosed and production identity is out of scope. Wording is "optional".
- Destructive record controls: confirmation is an E1 UI safeguard, bypassable through browser storage tools or direct API calls. Residual risk is limited to the user's local prototype data. Wording is "confirmation", not enforcement. Final layer: none.

## Known repository constraint

The project has no Git metadata. Small, reversible `apply_patch` changes and evidence checkpoints replace atomic commits. Git initialization is explicitly out of scope and will not be inferred from the request.
