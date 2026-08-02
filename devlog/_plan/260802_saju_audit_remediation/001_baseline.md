# Verified Baseline — 2026-08-02

## Current implementation

- The application is a monolithic vanilla web UI in `index.html` served by `server/http.mjs`.
- Durable development persistence is SQLite through `server/storage/sqlite.mjs`; browser persistence uses IndexedDB version 1.
- `service-worker.js` pre-caches the birthplace catalog.
- The intro synchronously loads `data/admin-areas.js`, creating an avoidable first-view transfer.
- `shell()` renders both desktop and mobile navigation.
- `introView()`, `inputView()`, and `resultView()` are the only primary screens.
- `onAction()` routes both `nav-method` and `nav-data` back to the same disclosure area.
- The start button is disabled unless both service and model-training checkboxes are selected.
- `persistRecord()` and `deleteRecord()` use the fixed IndexedDB key `latest`.
- The server accepts submissions but exposes neither deletion nor training-withdrawal endpoints.
- `onChatSubmit()` returns a generic deterministic answer under consultation-like framing.

## Verified failures

- Desktop and mobile `계산 원칙` and `데이터 안내` do not represent distinct destinations.
- A lower-page start action renders the next stage while preserving a large previous scroll offset.
- Model-training use is mandatory in the UI even though the server domain already treats training as purpose-specific eligibility.
- The first CTA is disabled before the below-fold reason is visible.
- Initial HTML references the 1.6 MB birthplace catalog, while external Korean font resources add roughly another 1.8 MB in the audited load.
- Several important labels render at 10–14 px.
- No user-facing saved-record lifecycle exists.
- The question surface suggests consultation value but returns generic canned text.

## Fresh regression evidence

```text
node tests/smoke.mjs
exit 1: ReferenceError: buildReflectionAnswer is not defined

node tests/server/ingestion.mjs
exit 1: AssertionError: 404 !== 200 at training-withdrawal endpoint
```

The local-port sandbox error from the first server-test attempt was environmental. The permitted rerun reached the application and produced the expected `404`, so the endpoint failure is the actionable baseline.

## Pre-loop worktree note

The two failing regression expectations were drafted immediately before the CXC FSM was armed. They are baseline evidence only and are not counted as implementation progress in the documentation-only work phase. Each expectation belongs to the implementation phase named in the decade documents.
