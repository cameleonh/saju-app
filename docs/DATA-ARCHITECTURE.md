# Data Architecture: Four Traditions, Local Records, and Governed Optional Storage

| Field | Value |
|---|---|
| Status | v0.3 documentation contract; Saju storage baseline implemented, four-tradition extension not implemented |
| Date | 2026-08-23 |
| Product | Responsive web app/PWA for mobile, tablet, and desktop |
| Operational database | Optional governed PostgreSQL account path; production remains fail-closed/local-only until launch sign-off |
| Local database | IndexedDB canonical guest record plus SQLite development adapter |
| Training storage | Encrypted object storage plus PostgreSQL lineage metadata |
| Vector database | Not required for collection or model training |

## Database Decision Summary

- IndexedDB is the canonical store for the guest/local product. A user can calculate, compare, save, reopen, export, and delete without central persistence or an account.
- The governed PostgreSQL/KMS/Cognito path is optional and fail-closed. It becomes authoritative only for records a signed-in adult explicitly saves after every existing legal and security launch gate passes.
- Local calculation and account sync are separate states. A valid deterministic result does not become invalid because sync is unavailable, pending, or failed.
- Service storage, model training, human review, analytics, and external AI processing remain separate purposes. No local or centrally stored record is automatically training-eligible.
- Exact birth data and account identity are encrypted in a restricted vault when account save is enabled. Training jobs never query the live vault directly.
- Dataset membership and model lineage are retained as future governed capabilities; they do not justify collection in the four-tradition P0.
- The existing Saju result contract remains immutable. The expansion adds a system registry, shared normalized profile, per-system eligibility, independent native results, and an independently versioned comparison result.
- Horasat, Tử Vi, and Mahabote data cannot be persisted as completed results while their policies are draft or blocked. A cached explanation screen is not a personalized system result.
- Immutable training snapshots, if later enabled, are written to encrypted object storage only after eligibility, pseudonymization, safety, quality, and per-system policy checks.

## Four-Tradition Extension Contract

The normative product journey and wire-level examples are in `MULTI-ASTROLOGY-COMPARISON-SPEC.md`; activation rules are in `CALCULATION-POLICY-REGISTRY.md`. This section fixes the storage invariants that implementations must not reinterpret.

### Stable identifiers and ownership

| Record | Owner | Required identity/version fields |
|---|---|---|
| System registry entry | Chart Calculation | `system_id`, policy state, active policy, eligibility-contract version, native result-schema version |
| Birth profile | Identity/Profile | `profile_id`, original-input schema, normalized-profile schema, subject reference, local/account storage state |
| Eligibility decision | Chart Calculation | profile fingerprint, `system_id`, evaluator version, state, reason codes, missing fields, policy status |
| System result | Chart Calculation | `result_id`, `system_id`, profile fingerprint, policy/engine/source/schema versions, calculation fingerprint, native facts, sensitivities |
| System claim | Interpretation | `claim_id`, `system_id`, result fingerprint, domain, theme, stance, native fact references, rule version |
| Comparison result | Comparison | `comparison_id`, exact source result fingerprints, taxonomy/comparison versions, common/different/unique groups, rejection diagnostics |
| Share artifact | Presentation | comparison/result fingerprint, included fields, excluded-field contract version, renderer version, content hash |

System IDs are fixed to `saju`, `horasat`, `tu-vi`, and `mahabote`. Translated labels are presentation data and must never become keys. IDs inside native facts and claims are system-scoped with the registry prefixes `saju.`, `horasat.`, `tuvi.`, and `mahabote.`; IDs cannot collide or be joined by suffix.

### Aggregate boundary

```text
BirthProfile
  ├─ originalInput
  ├─ normalizedProfile
  ├─ eligibility[system_id]
  ├─ systemResults[result_id]      # zero or more immutable versions per system
  ├─ currentResultBySystem         # references only
  ├─ comparisons[comparison_id]    # references exact result fingerprints
  ├─ shareArtifacts                # derived, reproducible, privacy-minimized
  └─ storageState                  # local and optional account sync tracked separately
```

The aggregate does not contain one merged `chart`. Existing Saju records may retain the legacy `chart` field during migration, but new reads project it into a `systemResult` with `system_id: saju`; new writes use the multi-system shape. A comparison references immutable result fingerprints and cannot float to a later recalculation automatically.

### Eligibility and execution states

Persist the evaluator output so a reopened record can explain why a system did or did not run. Domain eligibility states are `eligible`, `partial`, `needs_input`, `policy_unverified`, `engine_unavailable`, `unsupported_range`, and `invalid_input`. The UI maps them to `ready`, `partial`, `needs-input`, `policy-blocked`, and `unsupported` as defined in `CALCULATION-POLICY-REGISTRY.md`. Runtime states use the single `CalculationRunState` contract: `not-requested`, `checking-eligibility`, `blocked`, `queued`, `loading-engine`, `calculating`, `verifying`, `complete`, `partial`, `failed`, `cancelled`, `stale`, and `skipped-by-user`.

`policy-blocked` is not a runtime failure. It records the registry entry and policy status that prevented invocation. `failed` requires an active eligible policy plus a sanitized error code; raw input must never enter error text or logs. Retrying creates a new task attempt and, on success, a new immutable system result. It never overwrites an older completed result.

### Comparison integrity

- A system claim references facts from exactly one system result and the same `system_id`.
- A common or different comparison item references claims from at least two distinct systems.
- A strict `unique` item references exactly one system claim only after every requested comparable system completed. If another requested system is blocked, failed, cancelled, or stale, store `classification: partial-unique` with `coverage: partial` and render the partial-scope label instead of strict unique wording.
- Comparison generation rejects inactive policies, stale fingerprints, missing fact references, duplicate contributions from one system, and unsupported domain/theme/stance values.
- Numeric fate, accuracy, compatibility, consensus, or metaphysical confidence scores have no column or JSON field.
- Comparison confidence may not be repurposed as a probability. Operational diagnostics use explicit completeness/rejection fields instead.

### Browser schema target

The next IndexedDB schema migration adds stores atomically; the exact version number is chosen at implementation time after inspecting the live schema:

| Object store | Key | Required indexes | Contents |
|---|---|---|---|
| `profiles` | `profileId` | `updatedAt`, `subjectKind` | Original input envelope, normalized profile, display metadata, local/account storage state |
| `eligibilityDecisions` | `[profileId, systemId, evaluatorVersion]` | `profileId`, `state`, `policyStatus` | Per-system eligibility and recovery reasons |
| `systemResults` | `resultId` | `[profileId, systemId]`, `calculationFingerprint`, `createdAt` | Immutable native result envelopes |
| `comparisonResults` | `comparisonId` | `profileId`, `createdAt`, `sourceFingerprintSetHash` | Immutable comparison groups and rejected-claim diagnostics |
| `shareArtifacts` | `artifactId` | `profileId`, `contentHash` | Privacy-minimized derived previews; safe to regenerate/delete |
| `purposeReceipts` | `receiptId` | `profileId`, `purposeCode`, `recordedAt` | Optional account sync/external-processing authorization; never required for local calculation |
| `syncOutbox` | `operationId` | `state`, `nextAttemptAt` | Optional account-sync commands with purpose receipt and idempotency key |

`comparisonResults` is the persistence name for `ComparisonBundleV1`. Each recalculation or newly available system creates a new immutable row with `supersedesComparisonId`; there is no separate `comparisonBundles` or `comparisonRevisions` object store. Migration reads the legacy `records` store, retains it until the new aggregate passes count/hash verification in the same upgrade transaction, and records `migrationSource: legacy-record.v1`. A failed or interrupted upgrade leaves the old database readable. Destructive cleanup of the legacy store requires a later release and separate verified migration; it is not part of the first schema change.

### Optional PostgreSQL extension

Do not mutate the existing Saju `ops.chart_results` JSON shape. Additive target tables are:

- `ops.system_registry_snapshots` — immutable registry metadata used for an account-saved calculation;
- `ops.profile_eligibility_decisions` — per-profile/system/evaluator outcomes and reason codes;
- `ops.system_results` — immutable native result envelopes and unique calculation fingerprints;
- `ops.system_claims` — structured interpretation claims with same-result fact references validated at the application boundary and by stored hashes;
- `ops.comparison_results` — exact source fingerprint set, versioned groups, rejections, and content hash;
- `ops.share_artifacts` — optional minimized metadata only; image bytes belong in an approved object boundary, not the PII vault;
- `ops.system_result_feedback` — typed correction/quality targets without polymorphic dangling references.

Every row remains account/profile/data-subject owned through explicit foreign keys and RLS. System/result/comparison JSON is immutable after insert. Correction or policy upgrade creates new rows and moves an explicit current-reference pointer in one transaction; history remains inspectable.

## Domain Ownership

The MVP is a modular monolith with pragmatic DDD boundaries. Logical ownership is separated even while the contexts share one PostgreSQL cluster and one deployable server application.

| Bounded context | Canonical records | Allowed dependency |
|---|---|---|
| Identity and Profile | Account, data subject, profile, authority relationship | References governance decisions and opaque vault record identifiers |
| Chart Calculation | System registry, normalized profile projections, eligibility, calculation policy, native result/fact, sensitivity | Depends only on versioned source assets and explicit input contracts |
| Interpretation | System-native rule set, claim, reading block, evidence link, uncertainty | Reads immutable facts from one named system result |
| Comparison | Domain/theme taxonomy, comparison groups, contribution/rejection trace | Reads validated system claims; cannot calculate facts, rank systems, or rewrite native results |
| Consultation | Conversation, turn, prompt/model/safety version | Reads approved chart facts and current governance decisions |
| Privacy and Governance | Purpose authorization, consent, processing event, retention, deletion, audit | Evaluates all processing requests; emits versioned decisions/events |
| Learning and Model Governance | Feedback, labels, dataset snapshots/members, model runs | Reads only eligibility-approved pseudonymized projections |

Contexts exchange stable identifiers, immutable facts, application commands, and versioned events. They do not join another context's private tables from domain code. Database foreign keys may enforce same-cluster integrity, but they do not transfer business ownership. Events that leave their originating transaction use a transactional outbox and idempotent consumers. Shared code is limited to identifiers, timestamps, version references, and error/result primitives.

## What the Optional Governed Data Program May Store

The four-tradition P0 does not require central collection or training. If the optional governed account/learning program is later activated after its separate approvals, it may centrally store only the data needed for the accepted purposes, including:

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
| `service_storage` | No for local calculation; yes only when the user explicitly invokes governed account save | No |
| `ai_processing` | Only when the user starts AI consultation | No by itself |
| `product_analytics` | No; coarse events only | No |
| `model_training` | No; optional, separately disclosed, and disabled until the governed learning path is approved | Yes only after all other gates |
| `human_quality_review` | No; separate disclosure/consent when content is readable by a reviewer | Can create approved labels |
| `third_party_ai_transfer` | Only for the selected external provider path | Does not grant first-party training rights |

Refusing `service_storage` or `model_training` must not remove local calculation, native charts, or comparison functionality or create a lower-quality deterministic result. Consent is append-only, versioned, revocable, and attached to each centrally captured record through a receipt identifier.

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

- Writes one local aggregate containing original input, normalized profile, four eligibility decisions, and a device-generated request ID. Optional account sync adds the applicable purpose receipt and idempotency key.
- Writes one immutable deterministic system result per `system_id` and engine/policy/source-data/schema version set.
- Writes comparison output only after every contributing claim and native fact reference validates against the exact source result fingerprint.
- Never invokes a draft/blocked policy or stores its explanation screen as a personalized result.
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
- **System Registry Snapshot:** immutable record of the active/draft policy metadata used to evaluate eligibility.
- **Eligibility Decision:** system-specific ready/partial/missing/unsupported/policy-blocked outcome for one profile fingerprint.
- **System Result:** immutable native result for one system, one policy/version set, and one profile fingerprint.
- **System Claim:** interpretation-layer projection from one native result into one comparison domain/theme/stance with fact evidence.
- **Comparison Result:** immutable common/different/unique grouping over an exact set of system result fingerprints.
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
profiles 1 --- * eligibility_decisions
profiles 1 --- * system_results
system_results 1 --- * system_claims
system_results * --- * comparison_results through comparison_contributions
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

- A calculation can run and remain valid offline. Local persistence and optional account-sync state are displayed separately; `pending sync` never means `pending calculation`.
- The outbox item includes the purpose-authorization receipt, purpose version, payload version, and idempotency key.
- Sync retries use exponential backoff and never create duplicate submissions.
- A withdrawn, expired, or incompatible authorization prevents an unsynchronized outbox item from uploading until the user resolves the new notice or choice.
- Local deletion transactionally removes the local aggregate and derived share artifacts. If an account-saved copy exists, the UI must separately invoke and track the server deletion request.
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
- This remains the legacy Saju result table. The multi-system extension uses additive `ops.system_results`; do not overload `chart_results` with a discriminator and four incompatible JSON shapes.

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
