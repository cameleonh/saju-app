# Phase 2 — Record Lifecycle and Honest Question Guidance

## Dependency declaration

- Depends on: Phase 1 screen routing, consent semantics, stage helper, and lazy catalog state.
- Produces: user-manageable local records, durable development deletion/withdrawal contracts, and an accurately framed deterministic guidance surface.

## Scope

### MODIFY `index.html`

1. IndexedDB record identity
   - Before: `persistRecord()` writes both stores with key `latest`; `deleteRecord()` removes only that key and resets the current screen.
   - After: create `clientRequestId` once per calculated chart, use it as the stable local key, track `currentRecordId`, store returned `serverSubmissionId`, and preserve multiple records. Question-message updates reuse the current local record and never create a second submission for the same chart.
   - Add `records`, `recordsLoading`, and `recordsError` UI states plus `loadRecords()` ordered by creation time.
   - Field chain: create IDs immediately after a successful calculation -> serialize into `records` and `submissionOutbox` values -> IndexedDB returns plain objects without a custom reviver -> consume in list keys, open, export, delete, clear, withdrawal, current-result updates, chat-message updates, and server URL construction.
   - Submission response chain: save the pending local record -> POST once -> patch that same IndexedDB record with `serverSubmissionId`, durable state, and synchronized status -> remove or mark the matching outbox item. Failed POST keeps the same record and outbox identity for retry.
   - Existing `latest` rows are legacy-compatible: list or delete them without destructive migration, and use a generated fallback ID when opening incomplete historical data.

2. Data and record-management view
   - Before: data navigation has no independent view and saved-state technical copy is later removed from the result DOM.
   - After: `dataView()` explains local browser storage and development SQLite honestly, then shows record cards with open, export, delete, and eligible training-withdrawal actions; add refresh and clear-all controls.
   - Confirm per-record delete and clear-all before mutation. Explain that production account identity and cross-device synchronization are not connected.
   - Keep result panels focused on interpretation instead of exposing outbox and engine debug details.

3. Server lifecycle calls
   - Add `deleteSavedRecord(record)` and `withdrawTrainingUse(record)` client functions.
   - Local deletion must still work when a record never reached the server; a server failure leaves an actionable local status instead of falsely claiming remote deletion.
   - Withdrawal clears the local training flag only after a successful durable response or when the record is confirmed local-only.

4. Training eligibility reachability
   - Before: the browser always submits `dataSubject.minor: 'unknown'`, so even an adult self record with a positive training receipt can never satisfy the server's existing `minor === false` rule.
   - After: derive `minor` deterministically from the required normalized birth date at submission time using the current date and the service's 19-year threshold; submit `true` or `false` for self records. Couple mode remains ineligible by the existing relationship rule.
   - Field chain: birth date created by validated form/calendar conversion -> age decision serialized into `payload.dataSubject.minor` -> ordinary JSON deserialization on the server -> consumed by `isTrainingEligible`, projection creation, UI eligibility status, and withdrawal-control rendering.

5. Question guidance
   - Before: `onChatSubmit()` uses generic canned copy under consultation-like labels.
   - After: introduce pure `buildReflectionAnswer(question, chart)` before the engine test boundary, categorize career/work, relationship, money, health, and general prompts, and return bounded Korean templates grounded in known chart elements.
   - Career answers explicitly state `이직 여부를 대신 정하지는 않아요` and offer concrete condition comparisons.
   - Rename the surface `규칙 기반 질문 정리`; state that it organizes reflection from calculated facts and is not an AI prediction or professional decision.

### MODIFY `server/storage/sqlite.mjs`

- Add prepared deletion and training-withdrawal updates.
- `deleteSubmission(submissionId)` returns a boolean based on affected rows.
- `withdrawTraining(submissionId, recordedAt)` clears `training_projection_json`, removes or marks the positive model-training receipt while preserving service-storage receipts, and returns the updated row or null.
- No schema migration is required; withdrawal reuses existing JSON and status columns.

### MODIFY `server/http.mjs`

- Parse exact submission resource routes without accepting path traversal or extra segments.
- Add `DELETE /v1/submissions/:id`: 200 with `{ deleted: true }` when removed, 404 otherwise.
- Add `POST /v1/submissions/:id/training-withdrawal`: parse bounded JSON, call storage, return 200 with `trainingEligible: false`, or 404 when absent.
- Apply existing rate limiting to mutating lifecycle routes and retain security/no-store headers.
- Without configured storage, return a clear 409 or 501 development-adapter response instead of claiming durable mutation.

### MODIFY `tests/server/ingestion.mjs`

- Preserve existing acceptance, consent, data-minimization, malformed-body, calendar, and durable persistence assertions.
- Activate and prove withdrawal by creating an eligible durable record, calling the endpoint, and reading back a null training projection.
- Activate and prove deletion by creating a durable record, calling delete, and reading back no row.
- Add missing/not-durable route assertions if required by the implementation contract.

### MODIFY `tests/lifecycle.mjs`

- Turn the Phase-2 red contract green with pure category guidance, stable record identity, server-response patching, management-action assertions, absence of legacy consultation labels, and presence of the honest surface label.

### MODIFY `package.json`

- Extend `npm test` to run the chart/foundation smoke suite, the lifecycle client suite, and the server ingestion suite in dependency order.

## Acceptance and activation evidence

- Two calculations create two visible local records instead of replacing `latest`.
- Opening a record restores the result; exporting produces that record's JSON.
- Deleting one record keeps the other; clear-all prompts before deleting.
- Durable withdrawal returns 200 and the SQLite row has no training projection.
- Durable deletion returns 200 and the SQLite row is absent; missing IDs return 404.
- A service-only record does not display an actionable training-withdrawal control.
- An adult single self record with optional training selected reaches `trainingEligible: true`; an under-19 record, unknown/invalid date, and every couple record remain ineligible.
- Career and relationship questions yield different templates and never claim to make a decision or use AI.

## Verifiers

- `node tests/server/ingestion.mjs` — directly imports the server and storage targets; baseline permitted run exits 1 on the absent withdrawal route.
- `node tests/smoke.mjs` — directly exercises the chart engine and Phase-1 UI/source contracts that Phase 2 must preserve.
- `node tests/lifecycle.mjs` — directly reads record and guidance client code and evaluates the pure answer builder.
- Browser automation — directly drives IndexedDB-backed list, open, export, confirmation, delete, clear, and withdrawal states.

## Rollback boundary

Revert the client record functions and data-view controls together with the two server lifecycle methods and routes. Existing submission creation and chart calculation remain compatible.

## 2026-08-02 execution stale check and audit

- The dependency contract still holds after Phase 1: `method`/`data` routing, optional training consent, focus helpers, and lazy birthplace loading are present and passing 108 smoke assertions.
- Fresh red evidence remains activated: `node tests/lifecycle.mjs` exits 1 at the missing record controls; `node tests/server/ingestion.mjs` exits 1 because training withdrawal returns 404.
- Current client identity is still `id: 'latest'`; every `persistRecord()` call creates a new `clientRequestId`, so a guidance question can create a duplicate submission. The implementation must split first submission from later local record updates.
- Current browser payload still sends `dataSubject.minor: 'unknown'`. Phase 2 will derive a boolean from the already validated normalized self birth date using a 19th-birthday cutoff; malformed dates remain ineligible in the pure helper.
- Existing IndexedDB schema version 1 already supports arbitrary keys, so no destructive migration is needed. Legacy `latest` records remain listable and deletable.
- Remote deletion failure will retain the local card with an actionable error instead of claiming success. Local-only records can be deleted or withdrawn without a remote call.
- Withdrawal will preserve the `service_storage` receipt, mark the accepted `model_training` receipt withdrawn, and clear `training_projection_json`; it does not delete the service record.
- Exact lifecycle route matching will reject extra path segments and apply the existing mutation rate limit. Adapter-only servers return 409 for durable lifecycle mutations.
- Three independent read-only audit dispatches (repository map, test review, architecture audit) failed with the same encrypted-output transport error before returning findings. Main-agent reclaim completed the data-chain and boundary audit above; no unresolved High or Critical design blocker remains. Verdict: GO-WITH-FIXES, with every listed fix folded into this phase.
