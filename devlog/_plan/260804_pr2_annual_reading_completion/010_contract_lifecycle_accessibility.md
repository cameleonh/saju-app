# Phase 1 — Contract, Lifecycle, and Accessibility Completion

## File change map

- NEW `server/domain/annual-ephemeris.mjs`: own versioned KASI/KASA source metadata, 2024-2027 KST fixtures, supported-target derivation, Ipchun ranges, and 12 solar-term month ranges.
- NEW `server/domain/annual-rules.mjs`: own structured annual/monthly rule catalogs, required/prohibited/conflicting states, priority, claim categories, copy variants, safety actions, suppression, and deterministic evaluation.
- MODIFY `server/domain/annual.mjs`: remove third-party ephemeris adaptation and nine-argument card construction; build facts, cards, and monthly output through the new contracts; require normalized chart policy; include boundary/unsupported states and claim traces in the hashed result.
- MODIFY `server/domain/submission.mjs`: validate the enabled-year range and complete annual/chart/rule provenance; recompute with normalized chart policy; keep training projection free of birth input while carrying the versioned annual contract.
- NEW `annual/storage.mjs`: own browser IndexedDB open/get/put/list/delete/outbox operations with injectable `indexedDB` for automated tests.
- MODIFY `index.html`: import the storage adapter, use 2024-2026 input bounds/default clamping, emit explicit natal engine/version fields, use the adapter, and keep next/previous focus on a programmatically focusable card.
- MODIFY `annual/client.mjs`: validate request provenance, export the full safe annual contract, add `tabindex=-1`/active-state semantics, and expose monthly evidence/status.
- MODIFY `server/storage/sqlite.mjs`: add an additive `annual_result_json` column plus compatibility migration and exact-result loader while retaining existing queryable columns.
- MODIFY `db/migrations/001_initial_contract.sql`: add explicit `reading_scope`, `schema_version`, `annual_result`, and boundary/unsupported contract checks; narrow the target-year constraint to the enabled range.
- MODIFY `service-worker.js`: cache new browser module and advance cache version.
- MODIFY `tests/annual.mjs`: add all enabled-year -1/exact/+1 minute fixtures, source/provenance, rule suppression/conflict/version/claim-trace, monthly fact/rule/range, hidden-stem exclusion, export, and focusable-markup tests.
- MODIFY `tests/lifecycle.mjs`: test the extracted IndexedDB adapter using a deterministic in-memory IndexedDB boundary and exact annual save/reopen/export/delete behavior.
- MODIFY `tests/server/ingestion.mjs`: test missing chart provenance, lossless SQLite round-trip, annual withdrawal projection removal, and annual deletion cascade.
- MODIFY `tests/smoke.mjs`: align supported-year and policy UI assertions.
- MODIFY `README.md`, `PRD.md`, `PROJECT_STATUS.md`, `docs/ANNUAL-READING-POLICY.md`, `docs/DATA-ARCHITECTURE.md`: synchronize enabled range, source decision, hidden-stem exclusion, rule schema, persistence contract, verification, and remaining limitations.

## Whole-field chains

### `chartPolicy.version`, `chartPolicy.engine`, `chartPolicy.engineVersion`

- Creation: `index.html` natal chart policy and test chart factories.
- Serialization: `annual/client.mjs::buildAnnualRequest`, annual result, submission payload, SQLite `annual_result_json`, PostgreSQL `annual_result`.
- Deserialization: API boundary validation; SQLite exact-result loader; IndexedDB object record (structured clone, no custom reviver).
- Consumers: annual fact provenance, content hash, server recomputation, export, training projection, UI policy line.

### `boundaryFlags`, `unsupportedStates`, `claimTrace`, monthly `rule`/`boundarySensitive`

- Creation: annual ephemeris/rule evaluation.
- Serialization: annual result, privacy-safe JSON export, IndexedDB record, SQLite/PostgreSQL annual-result JSON, training projection where policy-safe.
- Deserialization: API validation/recomputation, SQLite exact-result loader, IndexedDB reopen.
- Consumers: card/month UI, evidence tests, lifecycle tests, documentation. No unknown enum values are accepted at the API boundary.

## Conditional-path activation scenarios

- Unsupported year: request 2023 or 2027; API/domain rejects before calculation and exposes the 2024-2026 range.
- Missing next-year fixture: call the ephemeris range builder with an incomplete injected fixture set; it returns/throws the explicit unavailable state instead of approximating.
- Missing rule fact: remove a required fact; only dependent rules are suppressed and record the rule ID/reason.
- Conflicting relations: construct natal branches that yield at least one clash and one harmony with the annual branch; the `clash` summary variant wins while both relation facts remain traceable.
- Unknown birth time: provide only three natal branches with `unknownTime=true`; time-dependent rule state is unsupported while the eight v1 cards remain available.
- Tampered payload: change a material claim without recomputing; submission validation rejects the content hash/recalculation mismatch.
- Missing natal provenance: omit engine version; annual API/submission validation rejects it.
- Legacy SQLite file: open a database without `annual_result_json`; additive compatibility migration succeeds and new saves round-trip exactly.
- Annual training withdrawal: save an annual training-eligible submission, withdraw, and observe `training_projection_json = NULL` while the service record/annual result remains.
- Annual deletion: delete the submission and observe both submission and cascaded annual row disappear.
- Card focus: activate next/previous in a real browser and observe `document.activeElement` move to the target article with a visible focus style.
- Reduced motion/print privacy: emulate reduced motion and print media; observe no animation dependence and no raw birth/place/record/consent content in the printable annual document.

## Acceptance checks

- `node tests/annual.mjs` reads the domain/client modules and proves fixture/rule/monthly/provenance/hash behavior.
- `node tests/lifecycle.mjs` reads the storage adapter and proves browser-record behavior through its public API.
- `node tests/server/ingestion.mjs` reads API/domain/SQLite and proves validation, exact persistence, withdrawal, and deletion.
- `node tests/smoke.mjs` reads `index.html`, service worker, and policy copy for integration regressions.
- `npm test` runs all four suites and must exit 0.
- Real browser QA reads the rendered page and changed interaction targets; viewport/focus/IndexedDB/print/reduced-motion observations are persisted in this implementation unit.
- `git diff --check`, a source secret scan, and dependency audit complete without blocking findings.

## Enforcement/bypass record

- Tier: E4 application boundary plus E5 persistence contract; E7 browser/manual verification for rendered focus/print behavior.
- Executing surface: API validator/domain constructor, SQLite/PostgreSQL schema, browser adapter, and CI test script.
- Known bypass: direct database writes or a modified client can skip browser checks; PostgreSQL contract is not executed against a live production database in this repository.
- Residual risk: exact KST fixtures cover only 2024-2027, so target years outside 2024-2026 remain unavailable; screen-reader behavior is browser/AT dependent beyond semantic/document-order checks.
- Wording downgrade: UI/docs say “enabled 2024-2026 fixture range,” not universal ephemeris support or scientific validation.
- Final enforcement layer: server recomputation/hash validation for submitted annual results; no final layer exists for a production PostgreSQL deployment that is out of scope.

