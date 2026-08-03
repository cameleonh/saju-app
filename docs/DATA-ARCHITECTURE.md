# Data Architecture: Central Collection and Governed Training

| Field | Value |
|---|---|
| Status | Proposed default v0.2 |
| Date | 2026-08-01 |
| Product | Responsive web app/PWA for mobile, tablet, and desktop |
| Operational database | Managed PostgreSQL; Supabase remains the default candidate |
| Local database | SQLite durable development store plus IndexedDB cache/offline outbox |
| Training storage | Encrypted object storage plus PostgreSQL lineage metadata |
| Vector database | Not required for collection or model training |

## Database Decision Summary

- Every submitted birth record, deterministic chart, reading, AI turn, and feedback event is centrally persisted after the required service-storage disclosure and recording of the applicable lawful basis.
- Service storage and model-training use are separate purposes. A centrally stored record is not automatically eligible for training.
- Model training requires a separately recorded, revocable consent. The current prototype asks for that receipt before birth input begins; production launch must complete legal review before deciding whether to offer an operational-only path.
- Exact birth data and account identity are encrypted in a restricted PII vault. Training jobs never query the live vault directly.
- PostgreSQL is the canonical operational store. Immutable, versioned training snapshots are written to encrypted object storage only after eligibility, pseudonymization, safety, and quality checks.
- Dataset membership and model lineage make it possible to answer which source records were used by which dataset and model run.
- IndexedDB keeps responsive/offline behavior, but it is no longer the sole source of truth. Offline submissions enter a purpose-receipt-bound outbox and synchronize when connectivity returns.
- The repository contains a `/v1/submissions` adapter, `/v1/calendar/convert` endpoint, durable SQLite development store, and PostgreSQL migration contract. The local server returns `durable: true` after SQLite persistence; production PostgreSQL/KMS/identity remains the deployment boundary.
- Production recovery target: RPO of 15 minutes and RTO of 4 hours for operational data. Training snapshots are reproducible from eligible canonical records and versioned transformation code.

## Domain Ownership

The MVP is a modular monolith with pragmatic DDD boundaries. Logical ownership is separated even while the contexts share one PostgreSQL cluster and one deployable server application.

| Bounded context | Canonical records | Allowed dependency |
|---|---|---|
| Identity and Profile | Account, data subject, profile, authority relationship | References governance decisions and opaque vault record identifiers |
| Chart Calculation | Normalized birth, calculation policy, result, chart fact, sensitivity | Depends only on versioned source assets and explicit input contracts |
| Interpretation | Rule set, reading block, evidence link, uncertainty | Reads immutable chart facts |
| Consultation | Conversation, turn, prompt/model/safety version | Reads approved chart facts and current governance decisions |
| Privacy and Governance | Purpose authorization, consent, processing event, retention, deletion, audit | Evaluates all processing requests; emits versioned decisions/events |
| Learning and Model Governance | Feedback, labels, dataset snapshots/members, model runs | Reads only eligibility-approved pseudonymized projections |

Contexts exchange stable identifiers, immutable facts, application commands, and versioned events. They do not join another context's private tables from domain code. Database foreign keys may enforce same-cluster integrity, but they do not transfer business ownership. Events that leave their originating transaction use a transactional outbox and idempotent consumers. Shared code is limited to identifiers, timestamps, version references, and error/result primitives.

## What “Store Everything” Means

The application centrally stores the data needed to improve calculation, interpretation, safety, and conversation quality:

- original solar/lunar birth input, leap-month flag, birth time or unknown-time state, birthplace, time zone, and calculation parameter inputs;
- normalized birth representation and validation warnings;
- deterministic chart output, chart facts, boundary sensitivity, and all engine/policy/source-data versions;
- deterministic and AI-generated reading blocks, evidence links, model version, prompt version, and safety outcome;
- user questions and assistant responses when the applicable content-storage notice is accepted;
- user ratings, corrections, issue reports, and reviewer annotations;
- consent, purpose, retention, provenance, processing, deletion, dataset, and model-lineage records.

It explicitly does not mean collecting passwords, access tokens, payment secrets, provider credentials, permanent raw IP addresses, unnecessary device fingerprints, browser contents outside the app, or unrelated third-party data.

## Purpose Separation

| Purpose | Required to provide core service | Training eligibility |
|---|---|---|
| `service_storage` | Yes for submitted calculations under this product decision | No |
| `ai_processing` | Only when the user starts AI consultation | No by itself |
| `product_analytics` | No; coarse events only | No |
| `model_training` | Prototype: required to enter the flow; production: policy decision pending legal review | Yes after all other gates |
| `human_quality_review` | No; separate disclosure/consent when content is readable by a reviewer | Can create approved labels |
| `third_party_ai_transfer` | Only for the selected external provider path | Does not grant first-party training rights |

Refusing `model_training` must not remove core chart functionality or create a lower-quality deterministic result. Consent is append-only, versioned, revocable, and attached to each captured record through a receipt identifier.

Couple submissions are one service interaction with two distinct `data_subjects`: the account user's self subject and a partner subject. The partner birth record, authority proof, purpose receipts, correction path, and deletion scope remain separately addressable. A relationship label such as `getting-to-know`, `dating`, or `partner` is descriptive product context only; it never creates a compatibility score or authorizes training on the partner's data. The current adapter accepts the pair for service storage but keeps it out of the self-only training projection until a partner-specific training policy is approved.

## Storage and Processing Boundary

```text
Browser / PWA
  IndexedDB cache + purpose-receipt-bound outbox
       |
       | encrypted HTTPS submission
       v
Ingestion API
       |
       +--> PostgreSQL operational schemas
       |      ops: submissions, results, feedback
       |      vault: encrypted birth input and content
       |      governance: authorization, consent, processing, deletion
       |      audit: privileged access
       |
       +--> AI gateway and response capture
       |
       v
Training eligibility job
       |
       | consent + authority + age + privacy + safety + quality gates
       v
Pseudonymization / transformation zone
       |
       v
Encrypted versioned dataset snapshot in object storage
       |
       +--> dataset membership and checksum in PostgreSQL
       v
Model run --> evaluation --> artifact registry --> deployment decision
```

Training never reads directly from browser analytics, application logs, database backups, or production replicas without the same eligibility and lineage controls.

## External Schema

### End user

- Receives a clear notice before the first central submission.
- Sees a separate model-training receipt. The prototype requires an explicit acceptance before entering the birth-input flow; production may expose an operational-only branch after legal review.
- Can inspect, export, correct, delete, and withdraw future training use.
- Can see whether a record is operational-only, training-eligible, included in a dataset, or excluded.
- Must identify whether entered data belongs to them or to another person and confirm authority where applicable.

### Calculation application

- Writes one idempotent submission containing encrypted original input, normalized input, purpose-authorization receipts, and device-generated request ID.
- Writes one immutable deterministic chart result per engine/policy/source-data version set.
- Queues an offline submission locally and exposes pending/synchronized/failed status to the user.

### AI gateway

- Reads a fixed chart-fact snapshot and explicit conversation context.
- Writes encrypted user/assistant turns, model and prompt versions, provider processing metadata, evidence references, and safety outcomes.
- Does not decide training eligibility.

### Training pipeline

- Reads only the eligibility view and purpose-specific source projection.
- Produces pseudonymized, minimized records and an immutable dataset manifest.
- Writes membership, exclusion reason, transformation version, quality state, and checksums.
- Cannot read account authentication tables or decrypt identity mappings.

### Human reviewer

- Sees only pseudonymized, purpose-approved records in an isolated review interface.
- Adds structured labels and correction reasons.
- Cannot browse raw birth profiles or identify users.

### Privacy and support operator

- Processes correction, export, withdrawal, and deletion requests through audited workflows.
- Sees redacted metadata by default; any vault access requires a reason-coded break-glass path.

### Model owner

- Registers model objective, permitted dataset purpose, base model, code version, dataset snapshot, evaluation, and deployment state.
- Cannot use an unregistered local export as training data.

## Conceptual Schema

### Core entities

- **Account User:** the server-issued anonymous or registered actor principal operating the service; registration is optional.
- **Data Subject:** the person described by a birth record. This may differ from the account user.
- **Profile:** the centrally stored user-facing aggregate that links one owner, one data subject, encrypted private metadata, and versioned submissions/results.
- **Submission:** one user action that sends a birth record for calculation and storage.
- **Birth Record:** encrypted original and normalized birth information owned by one data subject.
- **Chart Result:** immutable deterministic calculation result for one submission and version set.
- **Reading Output:** deterministic or AI-generated content grounded in a chart result.
- **Conversation Turn:** ordered user or assistant content within one consultation.
- **Feedback Label:** user or reviewer assessment tied to a result, reading, turn, or chart fact.
- **Purpose Authorization Event:** append-only disclosure/basis record and, when consent is the basis, acceptance or withdrawal for one purpose and version.
- **Processing Event:** evidence that data passed through collection, decryption, transformation, review, export, deletion, or another controlled operation.
- **Integration Event:** transactional-outbox record for a versioned event that must cross a context or process boundary.
- **Dataset Snapshot:** immutable training/evaluation dataset with one declared purpose and transformation version.
- **Dataset Member:** lineage link between one source record and one dataset snapshot.
- **Model Run:** one training or fine-tuning execution tied to exact dataset snapshots and code/config versions.
- **Deletion Request:** idempotent lifecycle process covering operational rows, object storage, external processors, snapshots, and affected model lineage.

### Relationships

```text
account_users 1 --- * profiles
data_subjects 1 --- * birth_records
data_subjects 1 --- * profiles
profiles 1 --- * submissions
account_users 1 --- * submissions : actor
submissions 1 --- 1 birth_records
submissions 1 --- * chart_results
chart_results 1 --- * reading_outputs
chart_results 1 --- * feedback_labels
submissions 1 --- * conversations
conversations 1 --- * conversation_turns
account_users 1 --- * purpose_authorization_events
data_subjects 1 --- * purpose_authorization_events
source_records * --- * dataset_snapshots through dataset_members
dataset_snapshots * --- * model_runs through model_run_datasets
deletion_requests 1 --- * deletion_steps
```

Account ownership does not prove authority to grant model-training rights for a different data subject.

## Internal Schema: Browser

IndexedDB database: `saju_app`, migrated transactionally.

| Object store | Key/indexes | Purpose |
|---|---|---|
| `records` | client request UUID | Current local aggregate containing separate `chart` and lossless `annual` properties, messages, purpose receipts, and sync state |
| `submissionOutbox` | client request UUID | Purpose-receipt-bound submissions awaiting durable central persistence |

The prototype intentionally keeps this two-store schema small. The normalized `profiles`, `chartResults`, `purposeReceipts`, and `appSettings` stores remain a production evolution, not a claim about the current IndexedDB implementation. `annual/storage.mjs` owns the transaction boundary and accepts an injected IndexedDB factory for deterministic lifecycle tests.

Browser rules:

- A calculation can run offline, but the result is marked `pending sync` until the central submission succeeds.
- The outbox item includes the purpose-authorization receipt, purpose version, payload version, and idempotency key.
- Sync retries use exponential backoff and never create duplicate submissions.
- A withdrawn, expired, or incompatible authorization prevents an unsynchronized outbox item from uploading until the user resolves the new notice or choice.
- Local deletion does not represent server deletion; the UI must invoke and track a deletion request separately.
- `localStorage` remains prohibited for birth profiles, content, authorization evidence, and tokens.

## Internal Schema: PostgreSQL

### Annual reading extension

`ops.annual_readings` is a one-to-one extension of `ops.submissions`. It stores explicit `reading_scope` and `schema_version`, the target year, versioned annual calculation policy, interpretation profile, annual facts, exactly eight cards, twelve separate monthly-flow entries, a complete `annual_result jsonb`, and a SHA-256 content hash. The target-year check is `2024..2026`. The natal `ops.chart_results` row remains unchanged and independently addressable.

The development SQLite adapter mirrors this boundary in a separate `annual_readings` table. It retains the queryable policy/fact/card/month/hash columns and additively stores `reading_scope`, `schema_version`, and the complete `annual_result_json`; opening an older development file adds those columns without dropping data. SQLite foreign keys are enabled so submission deletion cascades to the annual row. Browser IndexedDB records keep `chart` and `annual` as separate properties, and submission payloads use `readingScope`, `targetYear`, and `annualResult` instead of mutating the natal chart contract.

Annual training projection is permitted only under the existing purpose and subject gates. It may include the safe annual facts/cards/monthly flow, effective range, policy/profile/rule versions, boundary/unsupported states, claim trace, and content hash, but it excludes raw birth input, exact location, record identifiers, and consent metadata. Withdrawal sets the stored training projection to `NULL` while preserving the service annual result; submission deletion removes the annual row through the foreign key.

The relational model is normalized to at least 3NF. Large immutable chart/read/content documents use versioned JSONB or encrypted binary aggregates because they are read and versioned as units; this is an explicit denormalization.

Use isolated schemas:

- `api`: narrowly exposed user-owned views/functions protected by grants and RLS.
- `ops`: canonical operational metadata and relationships.
- `vault`: encrypted PII/content with no direct browser grants.
- `governance`: purpose authorization, consent, processing, retention, and deletion control.
- `training`: dataset and model lineage metadata, not raw training files.
- `audit`: append-only privileged events.

### `ops.account_users`

- `user_id` UUID primary key linked to an anonymous or registered authentication-provider principal.
- Anonymous/registered state, locale, plan, account state, upgrade link, and creation/update/deletion timestamps.
- No birth information, profile label, or conversation content.

### `ops.profiles` and `vault.profile_private`

- Profile UUID primary key with required owner-user and data-subject foreign keys, lifecycle state, revision, current-result reference, and creation/update/deletion timestamps.
- `vault.profile_private` stores the encrypted user-facing label and any approved private profile metadata under a unique profile foreign key.
- Optimistic concurrency uses an integer revision; index `(owner_user_id, updated_at desc)` supports the profile list.
- Anonymous-to-registered upgrade transfers ownership through one audited idempotent transaction; it does not duplicate the profile or data subject.

### `ops.data_subjects`

- `data_subject_id` UUID primary key.
- `owner_user_id` nullable foreign key when the account user is the subject.
- Relationship/authority code, minor-state classification, and authority-attestation timestamp.
- No plaintext name or birth date.
- Index `(owner_user_id, created_at desc)`.

### `ops.submissions`

- `submission_id` UUID primary key and client idempotency key.
- Required profile, actor user, data subject, service-storage disclosure/lawful-basis receipt, payload version, status, and timestamps.
- Optional model-training consent receipt captured at submission time.
- Unique `(actor_user_id, client_request_id)`.
- Indexes `(data_subject_id, created_at desc)` and `(status_code, created_at)`.

### `vault.birth_records`

- `birth_record_id` UUID primary key and required unique submission foreign key.
- Envelope-encrypted original input and normalized input stored separately.
- Encryption-key identifier, payload version, integrity hash, creation timestamp, and purge deadline.
- No direct RLS/API exposure; decryption is available only to calculation verification, export/correction, deletion, and approved transformation jobs.

### `ops.chart_results`

- UUID primary key and required submission foreign key.
- Engine, calculation-policy, ephemeris/source-data, and schema versions.
- Immutable structured chart result and chart facts in versioned JSONB, plus content hash and boundary flags.
- Unique deterministic fingerprint over input hash and all calculation versions.
- GIN indexing is deferred until measured query needs justify it; ordinary access uses submission/version indexes.

### `vault.reading_outputs`

- UUID primary key and required chart-result foreign key.
- Content source (`deterministic`, `ai`, or `human_reviewed`), encrypted structured content, evidence references, prompt/model/safety-policy versions, quality state, and timestamps.
- Content is not treated as a gold training label unless approved through the labeling workflow.

### `ops.conversations` and `vault.conversation_turns`

- Conversation owns user, data subject, submission/chart snapshot, applicable purpose-authorization receipt set, and retention deadline.
- Turn has UUID, conversation, unique sequence, role, encrypted content, evidence references, model/prompt version, moderation result, and timestamp.
- Index `(conversation_id, sequence)` and `(user_id, updated_at desc)`.

### `ops.feedback_labels`

- UUID primary key with exactly one typed target enforced through explicit junction tables rather than a polymorphic foreign key.
- Rater type, structured label code, score, encrypted optional comment, quality state, and timestamps.
- User feedback is a weak label until reviewed or validated; model output alone cannot label itself.

### `governance.purpose_authorization_events`

- UUID primary key; account user, data subject, purpose code, disclosure version, lawful-basis code, consent decision when applicable, scope, source channel, recorded/effective/expiry timestamps, and request idempotency key.
- Append-only. Current authorization is derived from the latest compatible event per subject, purpose, basis, and scope.
- Index `(data_subject_id, purpose_code, recorded_at desc)`.
- Training eligibility requires a current compatible `model_training` authorization with explicit consent as the default basis and no later withdrawal.

### `governance.processing_events`

- Append-only event ID, source record, operation code, purpose, actor/service identity, transformation version, input/output hash, dataset/model reference, timestamp, and redacted metadata.
- Monthly partitioning begins when volume or maintenance measurements justify it.

### `ops.integration_outbox` and `ops.integration_inbox`

- Outbox rows contain event UUID, originating context, aggregate type/ID/version, event type/schema version, minimized payload, creation timestamp, publication state, and retry metadata.
- The outbox insert commits in the same transaction as the originating state change.
- Inbox receipts use `(consumer_name, event_id)` as a unique idempotency key so retries cannot duplicate downstream processing.
- Sensitive plaintext is prohibited in event payloads; consumers receive opaque vault references or an approved projection.

### `training.dataset_snapshots`

- UUID primary key, purpose, status, transformation code version, source window, consent-policy version, privacy-filter version, quality-policy version, object URI, row count, manifest checksum, creator, creation/finalization timestamps, and retention deadline.
- Object URI points to encrypted object storage with managed lifecycle and access logs.
- Finalized snapshots are immutable; correction creates a new snapshot.

### `training.dataset_members`

- Composite primary key `(dataset_id, source_type, source_id)`.
- Dataset-specific pseudonymous subject key, inclusion status, exclusion reason, consent receipt, source hash, transformed row hash, and timestamp.
- Enables withdrawal, impact analysis, duplicate detection, and reproducibility.
- Does not contain raw birth input or free text.

### `training.model_runs` and `training.model_run_datasets`

- Model run records objective, base model, training code/config hash, privacy/safety configuration, state, evaluation artifact, and artifact registry identifier.
- Junction table links every run to exact dataset snapshots and roles such as train/validation/test.
- Deployment records reference the run and approved evaluation decision.

### `governance.deletion_requests` and `governance.deletion_steps`

- Request identifies user/data subject, requested scope, legal hold if any, state, timestamps, and idempotency key.
- Steps cover active operational rows, vault content, external AI providers, object snapshots, dataset membership, backups, and model-impact review.
- One active request per data subject and scope enforced by a partial unique index.

### `audit.privileged_events`

- Append-only actor, reason, action, target identifier, approval reference, redacted metadata, and timestamp.
- Vault decryption, dataset export, review access, authorization override, and deletion exceptions always generate an audit event.

## Training Eligibility

A source record may enter a training snapshot only when all gates pass:

1. Current service-storage record is valid and uncorrupted.
2. Current model-training consent covers the exact purpose and data category.
3. The actor is the data subject or has an approved authority basis.
4. Minor-data requirements are satisfied; otherwise the record is excluded.
5. No deletion, withdrawal, legal hold conflict, or unresolved correction exists.
6. Direct identifiers, profile labels, raw location text, account identifiers, provider identifiers, and unnecessary timestamps are removed.
7. Free text passes PII, secret, safety, and third-party-content screening.
8. The data has a defined quality state and is not an unreviewed AI output presented as ground truth.
9. Source, consent, transformation, and row hashes are recorded in lineage metadata.
10. The target dataset purpose matches the consent and model objective.

The default interpretation-training projection contains chart facts, evidence links, pseudonymized question/answer content, feedback labels, engine/policy versions, and quality/safety metadata. Exact birth date, birth time, birthplace, account identity, and profile label are excluded because an interpretation model does not need them.

A separate calculation-quality dataset may use pseudonymized normalized birth input only after a distinct purpose review and access policy.

## Dataset and Model Lifecycle

1. Freeze a source window and consent-policy version.
2. Resolve current eligibility at export time, not only capture time.
3. Decrypt only inside the isolated transformation job.
4. Minimize, pseudonymize, scan, and label the source projection.
5. Write an encrypted immutable snapshot and manifest.
6. Persist every member and exclusion reason.
7. Run privacy, contamination, duplication, quality, and safety checks.
8. Approve the snapshot before any model run can reference it.
9. Register model run, code/config, datasets, evaluations, artifact, and deployment decision.
10. Re-evaluate impacted snapshots and models after consent withdrawal, deletion, or policy change.

No analyst-created spreadsheet, ad hoc SQL dump, or local JSONL file is an approved training dataset.

## Integrity and Concurrency

- **Entity integrity:** UUID or meaningful composite primary keys on every entity and junction.
- **Domain integrity:** Purpose, lawful basis, consent, state, quality, role, and operation codes are controlled and versioned.
- **Referential integrity:** Foreign keys connect profiles, submissions, subjects, results, content, labels, authorizations, datasets, runs, and deletion steps.
- **Business-rule integrity:** One original birth record per submission; immutable calculation result per fingerprint; append-only authorization events; training snapshot cannot finalize with ineligible members.
- **Privacy integrity:** Vault data cannot be selected by browser roles; training membership cannot exist without a valid consent reference and source hash.

Critical transactions:

| Flow | Isolation/control | Retry behavior |
|---|---|---|
| Online submission | One transaction for submission metadata, vault record, authorization links, and integration-outbox event | Unique client request ID makes retry idempotent |
| Offline outbox sync | Same server transaction after authorization revalidation | Duplicate returns existing submission |
| Chart result write | Unique deterministic fingerprint | Duplicate returns immutable existing result |
| Purpose authorization event | Append-only under `READ COMMITTED` | Unique event idempotency key |
| Dataset finalization | Advisory lock or state-row lock plus eligibility count/checksum validation | Failed finalization leaves draft snapshot |
| AI turn and usage | Conversation sequence constraint plus request ID | Safe replay returns existing turn |
| Deletion | State transition plus idempotent asynchronous steps | Retries until every processor reports terminal state |

`SERIALIZABLE` is used only if dataset finalization or quota enforcement cannot be made correct with explicit locks and uniqueness.

## Access Paths and Indexes

| Access pattern | Index/path |
|---|---|
| User submission history | `(actor_user_id, created_at desc)` |
| Data-subject history | `(data_subject_id, created_at desc)` |
| Result by deterministic version | Unique fingerprint plus submission/version index |
| Current purpose authorization | `(data_subject_id, purpose_code, recorded_at desc)` |
| Training eligibility scan | Materialized/controlled view by purpose, status, consent, correction, and deletion state |
| Conversation replay | `(conversation_id, sequence)` |
| Dataset lineage | `dataset_members` composite key and `source_id` reverse index |
| Model impact from source withdrawal | Source reverse index to dataset, then dataset-to-run junction |
| Retention purge | Indexed `purge_after`/`retention_until` columns in bounded batches |
| Unpublished integration event | Partial index `(created_at)` where `published_at is null` |

High-volume append tables are candidates for monthly time partitioning after one month of measured production data. Do not pre-partition small identity or authorization tables.

## Row-Level Security and Privileges

- Every browser-exposed view or table uses explicit grants and RLS ownership checks.
- Browser roles never access `vault`, `training`, `governance` internals, or `audit` directly.
- Separate service identities exist for ingestion, calculation verification, AI gateway, transformation, training, privacy operations, migrations, and break-glass administration.
- Dataset export requires purpose-bound authorization and produces an audit event.
- Decryption keys live in KMS/secret management and are never stored beside ciphertext or in migrations.
- Human reviewers receive dataset-specific, time-bounded access to pseudonymized projections only.
- RLS and privilege tests use two users, a guest, every service role, and negative cross-purpose cases.

## Data Standards

| Standard item | Rule |
|---|---|
| PostgreSQL naming | Lowercase `snake_case`; plural table names; descriptive keys |
| Browser fields | `camelCase` at the TypeScript boundary |
| Identifiers | UUID; dataset membership uses explicit composite identity |
| Time | UTC `timestamptz`; original civil time remains inside the encrypted birth payload |
| Purpose authorization | Purpose, disclosure version, lawful basis, scope, and consent decision when applicable; append-only events |
| Encryption | Envelope encryption with key identifier, payload version, and integrity hash |
| JSONB | Versioned immutable domain aggregates only, not generic EAV storage |
| Free text | Encrypted in operations; minimized and screened during approved export |
| Dataset files | Encrypted Parquet or JSONL with manifest, schema version, and checksum |
| Retention | Every retained object has a purpose and deletion rule |
| Logs | No birth input, free text, ciphertext, secrets, or training rows |

## Glossary

| Term | Definition | Avoid |
|---|---|---|
| Account User | Anonymous or registered server principal operating the service | Data subject |
| Profile | Central user-facing aggregate connecting one owner and data subject to versioned work | Browser cache entry |
| Data Subject | Person described by a stored birth record | Profile owner when they differ |
| Submission | Idempotent central capture of one birth-input action | Page view |
| Operational Record | Canonical service data retained under the service-storage purpose | Training data |
| Training-Eligible Record | Operational record that currently passes every consent, authority, privacy, safety, and quality gate | Collected data |
| Dataset Snapshot | Immutable approved export with one declared model purpose | SQL dump |
| Dataset Member | Traceable link from a source record to one snapshot | Anonymous row |
| Pseudonymization | Replacement/removal that requires separately controlled information to reconnect identity | Anonymization |
| Purpose Authorization Event | Versioned append-only disclosure/basis record and any applicable consent decision for one purpose | Blanket consent |
| Integration Event | Versioned transactional-outbox message crossing a context or process boundary | Unstructured application log |
| Processing Event | Auditable record of a controlled data operation | Application log |
| Model Run | Reproducible training execution tied to exact datasets and code/config | Experiment note |
| Withdrawal | Revocation of future processing permission for a purpose | Automatic model unlearning |

## Retention and Deletion

Exact durations require legal review and user-facing disclosure before launch. The architecture forbids indefinite unspecified retention.

Proposed working defaults:

| Data | Working retention |
|---|---|
| Account-linked birth record and chart history | Until user deletion or account termination, then active purge within 30 days |
| Guest submission | 90 days unless converted to an account or retained under valid model-training consent |
| AI conversation content | 90 days operationally; longer only under separately selected history/training purpose |
| Usage and safety metadata | 180 days |
| Feedback and reviewed labels | Three years or until purpose withdrawal, subject to legal review |
| Authorization, consent, and processing evidence | Policy-defined period needed to demonstrate processing basis |
| Approved training snapshot | Versioned policy; reevaluated after withdrawal and deleted when no valid run requires it |
| Privileged audit events | One year minimum working target |
| Backups | Seven to thirty days depending on production tier |

Deletion flow:

1. Stop new processing and mark the source ineligible.
2. Delete or anonymize active operational content under the approved policy.
3. Revoke access and notify external processors where applicable.
4. Locate dataset membership and invalidate/rebuild unused snapshots.
5. Identify model runs and deployed artifacts trained on affected snapshots.
6. Apply the approved model-impact response: exclude from all future runs, evaluate retraining/unlearning need, and document the decision.
7. Let encrypted backups expire under the disclosed schedule while preventing ordinary restoration of deleted data.
8. Record completion evidence visible to the user where appropriate.

The product must not promise instant removal from an already trained model unless that behavior is technically and operationally proven.

## Capacity Estimate

Planning assumptions: 100,000 registered users, 10,000 submissions/day, 30,000 conversation turns/day, 2,000 feedback events/day, one year online operational retention, and monthly training snapshots.

| Object | Daily writes | Approx. payload | One-year primary data |
|---|---:|---:|---:|
| Birth records | 10,000 | 2 KB | 7.3 GB |
| Chart results | 10,000 | 10 KB | 36.5 GB |
| Reading outputs | 10,000 | 8 KB | 29.2 GB |
| Conversation turns | 30,000 | 3 KB | 32.9 GB |
| Feedback labels | 2,000 | 1 KB | 0.7 GB |
| Purpose authorization events | 2,000 | 0.6 KB | 0.4 GB |
| Processing/audit events | 50,000 | 0.7 KB | 12.8 GB |
| Dataset/model metadata | Batch | Variable | 1–3 GB |

- Plan for approximately 125 GB/year of table payload before indexes, TOAST overhead, temporary space, and growth.
- Allocate at least 3× the table estimate for primary database disk planning.
- Plan an additional 50–150 GB/year for encrypted dataset snapshots depending on deduplication and retention.
- Separate hot operational storage, cold archived records, and training object storage.
- Recalculate from measured compression, message length, training-consent rate, and deletion rate before public launch.

## Backup and Recovery

- Closed beta: daily managed backup, at least seven-day retention, RPO 24 hours, RTO 8 hours.
- Production: PostgreSQL PITR/WAL or equivalent incremental protection, RPO 15 minutes, RTO 4 hours.
- Object storage: versioning, checksum verification, lifecycle policy, and recovery copy in an approved region.
- Encryption keys: separate backup and tested recovery procedure; loss of key means loss of encrypted data.
- Quarterly restore drill and pre-migration restore rehearsal for consent, encryption, dataset, and deletion schema changes.
- Restore validation covers foreign keys, RLS/grants, consent state, vault decryptability, dataset checksums, lineage completeness, and deletion exclusions.
- Restored systems reapply deletion and withdrawal tombstones before serving traffic or exporting training data.

## Security and Control Notes

- Classify exact birth input, profile labels, free-text questions, and relationship/authority information as restricted personal data.
- Apply privacy-by-design and an AI privacy impact/risk assessment before collection begins.
- Export privileged audit events to a tamper-resistant sink.
- Separate developer, reviewer, privacy operator, trainer, deployer, and administrator duties.
- Scan snapshots for direct identifiers, secrets, rare identifying combinations, and unauthorized third-party content.
- Treat pseudonymized data as protected data, not public or anonymous data.
- Maintain provider, region, subprocessors, cross-border transfer, retention, and deletion evidence.
- These controls support security and continuity but do not establish ISO 27001, ISO 27002, ISO 22301, or legal compliance by themselves.

## Anti-Pattern Decisions

- Do not equate “stored” with “consented for training.”
- Do not train directly from the production database, replica, backup, log system, or analytics warehouse.
- Do not put raw PII, chart data, labels, and consent into one generic JSON table.
- Do not use an AI model's own unreviewed output as a gold label.
- Do not call pseudonymized data anonymous.
- Do not allow ad hoc CSV/JSON exports outside dataset registration and lineage.
- Do not store permanent raw IP addresses or device fingerprints as user identity.
- Do not silently bundle model-training permission into service storage. The prototype uses an explicit start gate for both receipts; production must complete legal review before offering an operational-only branch.
- Do not promise full unlearning from deployed models without a proven process.
- Do not use a vector database as the canonical training corpus.

## Delivery Sequence

### Gate 0: Legal and governance

1. Approve purpose-specific collection, AI processing, human review, and model-training notices.
2. Approve retention, minors, third-party data, withdrawal, deletion, processor, and cross-border policies.
3. Complete privacy impact/risk assessment and assign accountable owners.

### Gate 1: Central operational capture

1. Implement purpose-authorization events, data-subject distinction, encrypted vault, idempotent submissions, and processing lineage.
2. Implement IndexedDB outbox and visible sync state.
3. Implement export, correction, withdrawal, deletion, and audit workflows.
4. Validate RLS, privileges, encryption, backup, restore, and forbidden-log scans.

### Gate 2: Feedback and labeling

1. Capture ratings, structured corrections, safety reports, and reviewer labels.
2. Separate weak user signals, unreviewed AI output, and approved ground truth.
3. Add reviewer access controls and quality agreement measurement.

### Gate 3: Training pipeline

1. Implement eligibility, pseudonymization, PII/safety filters, dataset manifests, and object-store lifecycle.
2. Register membership, exclusions, model runs, evaluations, and artifacts.
3. Test consent withdrawal, source correction, dataset rebuild, and model-impact tracing end to end.

## Open Decisions

- Final lawful basis and consent wording for each purpose after Korean privacy counsel review.
- Exact retention periods and whether guests are permitted without account creation.
- Rules for data entered about another person and for minors.
- External AI provider, region, subprocessors, retention, and provider-training settings.
- First training objective: interpretation fine-tuning, ranking/reward model, safety classifier, or calculation-quality analysis.
- Object-storage provider, encryption-key owner, and dataset review environment.
- Operational response when a valid withdrawal affects an already deployed model.

## Primary References

- [Korean Personal Information Protection Act, Article 15](https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029335387)
- [Korean Personal Information Protection Act, Article 28-2](https://law.go.kr/LSW/lsInfoP.do?lsiSeq=270351)
- [PIPC Generative AI Personal Data Processing Guide](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=G010030000&nttId=11439)
- [PIPC AI Privacy Risk Management Model](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=G010030000&nttId=11014)
- [Supabase PostgreSQL overview](https://supabase.com/docs/guides/database/overview)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
