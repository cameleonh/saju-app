# Pre-Launch Decisions Pending

| Field | Value |
|---|---|
| Status | Working staging-policy checklist — not a legal document |
| Date | 2026-08-05 |
| Owner | Product lead |
| Reviewer | Korean privacy counsel (required before production collection begins) |

This file tracks the four open launch prerequisites from `PROJECT_STATUS.md`. Nothing here is a legal determination. Every item is marked **[BLOCKED]** until the named reviewer or decision-maker signs off.

## 1. Data-controller and processor roles

| Decision | Default placeholder | Who must decide |
|---|---|---|
| Data controller | The product operator (to be named) | Product lead + counsel |
| Processor list | Managed PostgreSQL host, object-storage host, KMS host, AI inference provider — all unnamed until contracts are signed | Product lead + procurement |
| Hosting region | `ap-northeast-2` (Seoul) is the working assumption; no cross-border transfer until reviewed | Product lead + counsel |
| Retention periods | Service records: 36 months from last submission. Training projections: until withdrawal or dataset expiry. These are placeholders, not policy. | Counsel |
| Minor handling | Birth dates that resolve to under-19 at submission are flagged `minor: true` and excluded from training. Age-of-consent boundary must be confirmed by counsel. | Counsel |
| Third-party data | Partner submissions in couple mode require a separate `partner_purpose` receipt and are excluded from training until a separate partner-purpose policy exists. | Counsel |
| Cross-border transfers | None until counsel confirms adequacy or SCCs. AI inference provider, if any, must offer a Korea-region endpoint or be treated as a cross-border transfer. | Counsel + procurement |
| User-facing notices | The prototype exposes a service-storage acknowledgement and an optional product-learning choice. Production copy must be reviewed against the final retention/processor list. | Counsel |

**[BLOCKED]** This entire section is a placeholder. Production collection must not begin until counsel reviews and approves every row.

## 2. First training objective

| Decision | Default placeholder |
|---|---|
| Objective | Not yet selected. The prototype only collects a schema-versioned projection and gates it behind an opt-in receipt. |
| Feature/label schema | Defined in `server/domain/submission.mjs::buildTrainingProjection` as `training-projection.v1`. Includes chart facts, deterministic reading, annual facts/cards, policy provenance, and the consent receipt id. No raw birth input. |
| Eligibility gate | `server/domain/purpose.mjs::isTrainingEligible` — self, authority verified, not minor, not couple, and an active `model_training` receipt. |
| Withdrawal | `POST /v1/submissions/:id/training-withdrawal` sets the training receipt to `withdrawn` and clears the projection column while retaining the service record. |

**[BLOCKED]** No training job runs until (a) counsel approves collection, (b) a specific learning objective is written down, and (c) the feature schema is reviewed against that objective.

## 3. Infrastructure vendor selection

| Component | Working assumption | Status |
|---|---|---|
| Managed PostgreSQL | Supabase or AWS RDS for PostgreSQL 16+ in `ap-northeast-2` | Not contracted |
| Object storage | S3-compatible bucket in the same region for dataset snapshots | Not contracted |
| Key management | Cloud KMS for PII vault column encryption | Not contracted |
| Identity provider | Email/password or social login with managed identity | Not contracted |
| AI inference provider | Not selected; LLM explanations are not in the prototype calculation path | Not contracted |
| Observability | Structured logs plus a managed APM; no birth data in logs | Not contracted |

**[BLOCKED]** No code path depends on a specific vendor. The production PostgreSQL adapter must be written against `db/migrations/001_initial_contract.sql` when a vendor is contracted. The migration defines bounded-context schemas (`ops`, `vault`, `governance`, `training`) with encrypted PII vault columns (`bytea`), `jsonb` chart/reading columns, `uuid` primary keys, RLS prerequisites, foreign keys, and a transactional outbox. A correct adapter is a substantial implementation effort, not a configuration switch.

## 4. Adapter wiring to managed PostgreSQL/KMS/identity

| Step | Status |
|---|---|
| PostgreSQL storage adapter | **Not implemented.** A previous draft was removed because it used SQLite-style flat columns incompatible with the actual bounded-context migration. The migration's `ops.submissions` requires `profile_id`, `actor_user_id`, `data_subject_id`, and `service_storage_authorization_id` foreign keys; encrypted birth data lives in `vault.birth_records` as `bytea`; chart results and annual readings use `jsonb` with check constraints. Writing a correct adapter requires resolving identity, purpose-authorization events, and vault encryption first. |
| KMS vault | The migration contract defines the encrypted vault boundary (`vault.birth_records`, `vault.partner_birth_records` with `original_ciphertext bytea`, `normalized_ciphertext bytea`, `key_id text`, `integrity_hash text`, `purge_at timestamptz`). Actual encryption calls are deferred until a KMS vendor is selected. |
| Identity | The prototype has no authentication. `ops.account_users`, `ops.data_subjects`, and `ops.profiles` must be populated before submissions can be stored. Identity is a deployment concern that will wrap the existing ingestion endpoints. |
| Idempotent persistence | The SQLite adapter uses `client_request_id` as a `UNIQUE` constraint for development. The PostgreSQL migration declares `unique (actor_user_id, client_request_id)` on `ops.submissions`. A production adapter must implement idempotent `INSERT ... ON CONFLICT` semantics keyed on `(actor_user_id, client_request_id)`, not a blind INSERT. |
| Deletion workflows | `DELETE /v1/submissions/:id` and the annual cascade are implemented and tested against SQLite. The PostgreSQL adapter must implement subject-level deletion across all bounded contexts (`ops.submissions`, `vault.birth_records`, `vault.partner_birth_records`, `ops.chart_results`, `ops.annual_readings`, `governance.processing_events`, `training.dataset_members`) following the migration's foreign keys and retention rules. |
| HTTP async safety | `server/http.mjs` now `await`s all storage calls (`saveSubmission`, `deleteSubmission`, `withdrawTraining`) and returns 503 on storage failure. This ensures both the synchronous SQLite adapter and any future async adapter are handled correctly. |

**[BLOCKED]** The production adapter is a major implementation task that depends on vendor selection, identity provider, KMS, and legal review. It cannot be replaced by a stub or mock.

## Engineering state while decisions are pending

- The server boots with SQLite by default (`server/index.mjs`). No PostgreSQL adapter exists.
- `npm test` runs against the in-memory SQLite adapter and does not require a running PostgreSQL instance.
- `db/migrations/001_initial_contract.sql` defines the production schema contract and is the source of truth for any future adapter.
- `server/http.mjs` awaits all storage operations so that a future async PostgreSQL adapter will work without HTTP-layer changes.
