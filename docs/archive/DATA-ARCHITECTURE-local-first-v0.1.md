# Data Architecture: Local-First Web App

| Field | Value |
|---|---|
| Status | Proposed default v0.1 |
| Date | 2026-08-01 |
| Workload | Local deterministic calculation plus small relational OLTP services |
| Client store | IndexedDB |
| Server store | Managed PostgreSQL; Supabase is the default deployment candidate |
| Vector database | Not required |

## Database Decision Summary

- **Product:** One responsive web app for mobile, tablet, and desktop, designed mobile-first and optionally installable as a PWA.
- **Local source of truth for the MVP:** IndexedDB stores user profiles, original birth input, versioned chart results, local settings, and local consent state.
- **Calculation dependency:** The Saju engine runs in the browser. It must not require a database or network call.
- **Server source of truth:** PostgreSQL stores only relational service data such as accounts, consent receipts, AI usage metadata, opt-in history, feedback, deletion jobs, and later encrypted profile synchronization.
- **Default managed option:** Supabase PostgreSQL with Auth and Row Level Security. The schema remains portable PostgreSQL rather than depending on a proprietary database model.
- **Raw birth data:** Not stored on the server by default. The AI gateway receives structured chart facts rather than the original birth date, time, place, or profile name.
- **Consistency:** Strong local transactions in IndexedDB; ACID transactions and foreign-key integrity in PostgreSQL.
- **Availability:** Chart calculation and saved local profiles continue to work when the server is unavailable. AI, login, and cloud sync may degrade independently.
- **Server retention:** Purpose-specific and bounded; anonymous AI request bodies have zero application retention.
- **Production recovery target:** RPO of 15 minutes and RTO of 4 hours for server data once paid accounts or saved history launch. The closed beta may use daily backup recovery with a documented lower service tier.

## Why This Split

The highest-frequency and most sensitive product flow is local: enter birth data, calculate a chart, save a profile, and read the result. It requires offline behavior and does not require joins across users. IndexedDB fits that aggregate-oriented browser workload and avoids creating a central birth-data collection.

The server workload is different. Accounts, consent events, usage metering, deletion, feedback, and optional conversation history need referential integrity, auditable transactions, retention rules, and user-level authorization. PostgreSQL fits this relational OLTP workload better than a document or vector database.

The chart engine's ephemeris, calculation policy, and golden fixtures are versioned build artifacts with provenance and checksums. They are not mutable database rows and must not be fetched from an undocumented runtime table.

## Storage Boundary

```text
Browser / PWA
  IndexedDB
    profiles
    chartResults
    localConsents
    appSettings
         |
         | explicit AI consent; minimized structured facts only
         v
Server API / AI gateway
  PostgreSQL
    accounts and consent receipts
    AI usage metadata
    optional encrypted sync/history
    feedback and deletion workflow
         |
         v
Third-party AI provider
  request processing only under the declared provider policy
```

No browser request is allowed to send raw birth fields as telemetry, URL parameters, crash context, or default AI payload.

## External Schema

### Guest user view

- **Reads and writes:** Local profiles, chart results, settings, and local consent state in IndexedDB.
- **Network access:** Static application assets and an optional stateless AI narration endpoint.
- **Persistent server identity:** None.
- **AI request:** Structured chart facts, immutable fact identifiers, engine/policy versions, locale, and question.

### Authenticated user view

- **Reads and writes:** Account preferences, consent receipts, usage quota, and later encrypted sync or opt-in history.
- **Authorization:** The authenticated user can access only rows whose `user_id` matches the authenticated subject.
- **Deletion:** The user can request deletion and inspect completion state.

### AI gateway view

- **Reads:** Current consent state and usage quota for an authenticated user when applicable.
- **Writes:** Idempotent usage metadata, response status, and optional opt-in conversation rows.
- **Forbidden fields:** Original birth date/time/place, profile label, and unredacted chart input.

### Support and operations view

- **Reads:** Redacted account, version, status, quota, feedback category, and operational audit data.
- **Default restriction:** No access to encrypted profile or message bodies.
- **Privileged access:** Break-glass access must be time-bounded, reason-coded, and audited.

### Release client view

- The web app reads signed or checksummed calculation release manifests from versioned application assets.
- PostgreSQL may mirror release metadata for operations, but it is not the canonical calculation source.

## Conceptual Schema

### Local aggregates

- A **Local Profile** owns one original birth input and zero or more versioned chart results.
- A **Chart Result** contains immutable chart facts, calculation versions, sensitivity findings, and optional deterministic reading blocks.
- A **Local Consent** records the disclosure version accepted for an outbound feature.
- **App Settings** contain non-sensitive display and policy preferences.

### Server entities

- A **User Account** has zero or more consent receipts, usage ledger entries, opt-in conversations, encrypted sync profiles, and feedback reports.
- A **Consent Receipt** is append-only evidence of acceptance or revocation for one feature and disclosure version.
- An **AI Usage Entry** represents one idempotent provider request and contains metering metadata, not its question or answer.
- An **AI Conversation** owns ordered AI messages only when the user explicitly enables server history.
- An **Encrypted Sync Profile** is an opaque user-owned aggregate introduced after the MVP.
- A **Feedback Report** references engine/policy versions and optional chart-fact identifiers.
- A **Deletion Job** tracks asynchronous purge across the application database and providers.
- A **Privileged Audit Event** records administrative access or mutation without copying sensitive payloads.

### Relationships

```text
auth.users 1 --- 0..1 user_accounts
user_accounts 1 --- * consent_receipts
user_accounts 1 --- * ai_usage_ledger
user_accounts 1 --- * ai_conversations
ai_conversations 1 --- * ai_messages
user_accounts 1 --- * profile_sync_blobs
user_accounts 1 --- * feedback_reports
user_accounts 1 --- * deletion_jobs
```

Anonymous guest calculation creates none of these server relationships.

## Internal Schema: IndexedDB

Database name: `saju_app`  
Schema version: positive integer, migrated transactionally during app startup.

| Object store | Key | Indexes | Contents | Lifecycle |
|---|---|---|---|---|
| `profiles` | `id` UUID | `updatedAt`; normalized `labelSortKey` | Original birth input, label, schema version, timestamps | Until local deletion |
| `chartResults` | `id` UUID | `profileId`; `fingerprint` unique; `createdAt` | Immutable structured result, engine/policy/data versions, chart facts, sensitivity findings | Deleted with profile or by user |
| `localConsents` | `[feature, documentVersion]` | `decidedAt` | Accept/decline/revoke state for outbound features | Replaced by newer document decision; retained locally until app reset |
| `appSettings` | `key` text | None | Locale, theme, selected method display, accessibility settings | Until app reset |

### IndexedDB rules

- Profile creation and its initial result commit in one transaction across `profiles` and `chartResults`.
- Profile deletion removes the profile and all owned chart results in one transaction.
- A chart result is immutable. Recalculation creates a new result with a new fingerprint and versions.
- The fingerprint covers normalized input, calculation-policy version, engine version, and source-data version.
- Browser storage is best-effort and can be cleared or evicted. The app requests persistent storage where supported and clearly offers export before relying on local data as a long-term archive.
- Private-browsing behavior must be disclosed because local records may disappear when the session ends.
- `localStorage` is not used for birth profiles or chart results.

## Internal Schema: PostgreSQL

The design is normalized to 3NF except `profile_sync_blobs`, which is intentionally opaque and denormalized because the server must not inspect a client-encrypted profile aggregate.

Use three schemas:

- `api`: the narrow browser-visible surface protected by grants and RLS.
- `private`: service-only operational tables and functions.
- `audit`: append-only privileged events with restricted access.

### `api.user_accounts`

| Column | Rule |
|---|---|
| `id` | UUID primary key and foreign key to the authentication provider's user record |
| `locale` | Supported BCP 47 language tag; default `ko-KR` |
| `plan_code` | Controlled value; default `free` |
| `created_at`, `updated_at` | UTC `timestamptz` |
| `deleted_at` | Nullable soft-deletion timestamp pending purge |

Indexes: primary key; partial index on active accounts when operational queries require it.

### `api.consent_receipts`

| Column | Rule |
|---|---|
| `id` | UUID primary key |
| `user_id` | Required foreign key to `user_accounts` |
| `feature_code` | Controlled value such as `ai_narration`, `ai_history`, or `cloud_sync` |
| `document_version` | Immutable disclosure version |
| `decision` | `accepted` or `revoked` |
| `decided_at` | UTC `timestamptz` |

The table is append-only. Current consent is derived from the latest event for one user and feature. Index `(user_id, feature_code, decided_at desc)`.

### `private.ai_usage_ledger`

| Column | Rule |
|---|---|
| `request_id` | UUID primary key and idempotency key |
| `user_id` | Nullable authenticated user foreign key |
| `anonymous_rate_key` | Nullable HMAC token with short rotation; never a raw IP or device fingerprint |
| `provider_code`, `model_code` | Controlled operational identifiers |
| `input_units`, `output_units` | Non-negative integers |
| `status_code` | Controlled request outcome |
| `created_at` | UTC `timestamptz` |
| `purge_after` | Required retention deadline |

Indexes: `(user_id, created_at desc)`, `(anonymous_rate_key, created_at desc)`, and `purge_after`. Request content is prohibited.

### `api.ai_conversations` and `api.ai_messages`

These tables are disabled for the MVP and introduced only with explicit opt-in history.

- `ai_conversations`: UUID primary key, required `user_id`, engine/policy versions, created/updated timestamps, `retention_until`, and soft-deletion state.
- `ai_messages`: UUID primary key, required conversation foreign key, monotonic sequence, controlled role, encrypted content, chart-fact references, provider metadata limited to what is needed for troubleshooting, and creation timestamp.
- Unique constraint `(conversation_id, sequence)`.
- Index `(user_id, updated_at desc)` on conversations and `(conversation_id, sequence)` on messages.

### `api.profile_sync_blobs`

This P1 table stores client-encrypted sync aggregates.

| Column | Rule |
|---|---|
| `id` | Client-generated UUID primary key |
| `user_id` | Required owner foreign key |
| `ciphertext` | Non-empty binary encrypted payload |
| `payload_version` | Positive schema version |
| `revision` | Non-negative optimistic-concurrency counter |
| `content_hash` | Ciphertext integrity hash |
| `created_at`, `updated_at`, `deleted_at` | UTC timestamps |

Unique constraint `(user_id, id)` and index `(user_id, updated_at desc)`. The encryption key must not be stored alongside the ciphertext. Key recovery is a P1 design gate.

### `api.feedback_reports`

- UUID primary key; nullable authenticated user; controlled category and status.
- Engine, policy, and data-source versions plus a bounded list of chart-fact identifiers.
- Optional comment stored with application-layer encryption and a retention deadline.
- Index `(status_code, created_at)` for triage and `purge_after` for deletion.

### `private.deletion_jobs`

- UUID primary key, required user, requested/started/completed timestamps, state, retry count, and provider-deletion status.
- One active job per user enforced by a partial unique index.
- No copied message, profile, or birth payload.

### `audit.privileged_events`

- Append-only event identifier, actor, reason code, action, target type/identifier, redacted metadata, and event timestamp.
- Monthly partitioning is deferred until volume justifies it.
- Audit events never contain birth input, profile contents, or message text.

## Access Paths and Index Review

| Hot access pattern | Storage path |
|---|---|
| Load one local profile and latest result | IndexedDB `profiles` key plus `chartResults.profileId` index |
| Detect duplicate local calculation | IndexedDB unique `fingerprint` index |
| Read current consent | PostgreSQL `(user_id, feature_code, decided_at desc)` |
| Enforce AI quota | Usage index by user or short-lived anonymous rate key and time range |
| List opt-in conversations | `(user_id, updated_at desc)` under RLS |
| Load ordered messages | `(conversation_id, sequence)` under RLS |
| Sync one encrypted profile | Unique `(user_id, id)` plus revision check |
| Triage feedback | `(status_code, created_at)` with encrypted comment access separated |
| Purge expired rows | `purge_after` indexes in bounded batches |

No full-text or semantic search is required in the MVP. A vector database would add cost and privacy risk without a valid access pattern.

## Integrity

- **Entity integrity:** UUID primary keys on every server entity; IndexedDB keys generated before commit.
- **Domain integrity:** Controlled code sets, non-negative usage values, positive schema versions, and valid UTC timestamps enforced with checks.
- **Referential integrity:** Foreign keys for every user-owned server record; hard account purge cascades only after asynchronous provider deletion completes.
- **Business-rule integrity:** Immutable consent events, unique AI request idempotency keys, immutable chart-result fingerprints, one active deletion job per user, and opt-in requirements for history/sync.
- **Privacy integrity:** Database constraints and API validation reject forbidden raw birth fields from usage and analytics records.

## Concurrency and Transactions

| Critical flow | Boundary | Isolation/locking | Conflict behavior |
|---|---|---|---|
| Save or delete local profile | One IndexedDB transaction across owned stores | Browser transaction serialization | Abort the whole operation on failure |
| Accept or revoke consent | One append plus current-state read | PostgreSQL `READ COMMITTED`; append-only row | Retry idempotently with event key |
| Consume AI quota | Check-and-increment in one server function | Row lock on quota subject or atomic bucket update | Reject over quota; unique request ID prevents double charge |
| Save conversation turn | Usage row and optional message in one transaction | `READ COMMITTED` with unique sequence/request constraints | Retry safely by request ID |
| Sync encrypted profile | Compare revision and update in one statement | Optimistic concurrency | Return conflict; never silently last-write-wins |
| Delete account | State transition plus queued purge | Transactional state update, asynchronous idempotent workers | Retry until all dependent stores confirm deletion |

`SERIALIZABLE` is reserved for a flow that cannot be made correct with a row lock and unique constraint; it is not the global default.

## Row-Level Security and Privileges

- RLS is enabled on every browser-exposed table.
- User policies require `auth.uid() = user_id` for select, insert, update, and delete as applicable.
- Anonymous roles receive no direct grants on account, profile, consent, history, feedback-body, or usage tables.
- The browser never receives a service-role credential.
- AI usage and deletion functions are callable only through server-side identities with narrowly scoped grants.
- Default table/function privileges are revoked; every exposed grant is explicit and shipped in the same migration as its RLS policy.
- RLS tests run with two users and an anonymous role to prove cross-user reads and writes fail.
- Administrative access uses a separate role and produces a privileged audit event.

## Data Standards

| Standard item | Value |
|---|---|
| PostgreSQL names | Lowercase `snake_case`; plural table names; singular column names |
| Browser object fields | `camelCase` at the TypeScript boundary |
| Identifiers | UUID strings; no sequential user-facing identifiers |
| Time | UTC `timestamptz` on the server; original civil birth input preserved locally |
| Versions | Immutable semantic or dated version strings with validation |
| Code sets | Database check constraints or reference enums controlled by migrations |
| Nullability | Nullable only when absence has a defined product meaning |
| Deletion | Explicit `deleted_at` only for asynchronous purge flows; otherwise hard delete |
| Sensitive text | Minimized; encrypted at the application layer when retained |
| JSON | Allowed for immutable versioned aggregates or redacted metadata, not as a generic relational dumping ground |
| Logs | Identifiers and version metadata only; no birth input, profile label, question, answer, or ciphertext |

## Glossary

| Term | Definition | Avoid |
|---|---|---|
| Local Profile | User-owned birth input and preferences stored only in the browser | Cloud profile when it has not been synchronized |
| Chart Result | Immutable deterministic output for one input and version set | AI result |
| Chart Fact | Stable evidence item produced by the deterministic engine | Prediction |
| Calculation Policy | Versioned set of calendar and boundary conventions | Accuracy mode |
| Consent Receipt | Append-only evidence of an outbound feature decision | Blanket consent |
| AI Usage Entry | Non-content metering record for one provider request | Chat log |
| Sync Blob | Client-encrypted opaque profile aggregate | Plain profile row |
| Derived Data | Data that can be rebuilt from canonical input and versioned code | Source of truth |
| Purge | Irreversible deletion from active stores followed by backup expiry | Soft delete |

## Retention

| Data | Default retention |
|---|---|
| Local profile and chart result | Until the user deletes it or clears browser storage |
| Anonymous AI request/response body | No application retention after response completion |
| Anonymous rate-limit token | At most 24 hours |
| Authenticated AI usage metadata | 90 days unless billing law requires a different period |
| Consent receipts | Account lifetime plus a legally reviewed post-deletion period |
| Opt-in AI history | Off in the MVP; later user-controlled with a visible retention setting |
| Feedback metadata/comment | 180 days unless an unresolved ticket requires a documented extension |
| Privileged audit events | One year initially, subject to security policy review |
| Deleted server records in backups | Removed when the corresponding backup retention window expires |

Retention changes require a migration, updated disclosure, and deletion-path test.

## Capacity Estimate

Planning assumptions only: 100,000 registered users, 10,000 daily active users, 10,000 AI requests per day, three synced profiles per syncing user, and no server-side profile storage in the MVP.

| Object | Daily transactions | Approximate row size | Growth assumption | Retention | Estimated primary data |
|---|---:|---:|---:|---|---:|
| `user_accounts` | 300 writes | 0.5 KB | 100,000 accounts | Account lifetime | 50 MB |
| `consent_receipts` | 1,000 writes | 0.5 KB | 500,000 events | Policy dependent | 250 MB |
| `ai_usage_ledger` | 10,000 writes | 0.6 KB | 900,000 rows | 90 days | 540 MB |
| `feedback_reports` | 100 writes | 2 KB | 18,000 rows | 180 days | 36 MB |
| `profile_sync_blobs` P1 | 3,000 writes | 8 KB | 300,000 blobs | User controlled | 2.4 GB |
| `ai_messages` P1 | 10,000 writes | 2 KB | 300,000 retained rows | 30-day planning case | 600 MB |
| `privileged_events` | 1,000 writes | 0.7 KB | 365,000 rows | 1 year | 256 MB |

- Plan for roughly 5 GB of table data plus indexes in the first scaled deployment.
- Allocate at least 3× the primary-data estimate for indexes, temporary operations, growth, and maintenance headroom.
- The usage ledger and audit events are the first candidates for time-based partitioning only after measured query or maintenance pressure justifies it.
- Local IndexedDB is expected to remain under 5 MB for an ordinary user; the app should still display actual local usage and support export.
- Recalculate capacity from production telemetry before enabling cloud sync or persistent AI history.

## Backup and Recovery

### Local data

- IndexedDB has no central backup guarantee and may be cleared by the browser or user.
- P0 provides structured export/import as the recoverable backup path.
- P1 encrypted sync is optional and must not be described as enabled until its key-recovery design is complete.

### Server data

- Closed beta: managed daily database backup, at least seven days of retention, target RPO of 24 hours, and target RTO of 8 hours.
- Production with paid accounts, sync, or history: continuous WAL/PITR or equivalent incremental protection, target RPO of 15 minutes, and target RTO of 4 hours.
- Maintain an encrypted portable logical export on a separate schedule for vendor-exit recovery; access is restricted and audited.
- Test a full restore quarterly and before any migration that changes encryption, deletion, or ownership semantics.
- After restore, run automated checks for row counts, foreign keys, RLS enablement, consent state, and deletion-job continuity.
- Calculation assets and chart results are rebuildable; accounts, consent receipts, encrypted sync data, and opted-in history are not and receive recovery priority.

Managed backup completion is not evidence of recoverability until a restore test succeeds.

## Security and Control Notes

### Access and audit

- Separate browser, gateway, migration, operations, and break-glass roles under least privilege.
- Keep secrets and encryption keys outside source code, migrations, and database rows containing ciphertext.
- Export privileged audit events to a tamper-resistant operational sink.
- Require reviewed migrations and retain schema-change evidence.

### Encryption

- Use TLS for all database and API traffic and provider-managed disk encryption at rest.
- Use application-layer encryption for retained free text and synchronized profile blobs.
- Cloud sync keys must not be stored alongside encrypted payloads; recovery and rotation must be designed before P1 acceptance.

### Continuity

- Local calculation is deliberately independent of PostgreSQL failure.
- AI and account capabilities show a clear degraded state rather than blocking the chart.
- Recovery targets and restore evidence are reviewed whenever a paid or persistent feature changes database criticality.

These controls improve auditability and continuity but do not by themselves establish ISO 27001, ISO 27002, or ISO 22301 compliance.

## Anti-Pattern Decisions

- Do not store profiles in `localStorage`.
- Do not create one generic JSON/EAV table for accounts, consent, usage, and feedback.
- Do not store comma-separated chart-fact identifiers.
- Do not expose database service credentials to the browser.
- Do not rely on RLS without explicit grants, cross-user tests, and server-only separation.
- Do not store AI prompts or responses in request logs.
- Do not use IP addresses or persistent device fingerprints as permanent user identifiers.
- Do not make the runtime chart calculation depend on mutable database rows.
- Do not add a vector database without a measured semantic-retrieval use case.
- Do not claim a backup strategy is complete without restore validation.

## Delivery Sequence

### P0

1. Implement versioned IndexedDB stores and migrations.
2. Keep calculation, profiles, and deterministic reading fully local.
3. Implement a stateless AI gateway with zero request-body retention.
4. Store only short-lived anonymous rate-limit tokens or authenticated usage metadata.
5. Add RLS, grant, deletion, and privacy tests before exposing any PostgreSQL table.

### P1

1. Add authentication and append-only consent receipts.
2. Design cloud-sync key recovery, then add encrypted profile blobs with optimistic concurrency.
3. Add opt-in AI history only after encryption, retention, export, and deletion behavior pass acceptance tests.
4. Enable PITR when persistent user data raises the recovery requirement.

## Open Decisions

- Accept Supabase as the managed PostgreSQL/Auth provider or select another portable PostgreSQL host.
- Select the production region after privacy, latency, and provider-region review.
- Choose the cloud-sync encryption and key-recovery model before P1.
- Confirm legal retention for consent and billing metadata.
- Set the anonymous abuse-control mechanism without introducing durable device fingerprinting.

## Primary References

- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [Supabase PostgreSQL overview](https://supabase.com/docs/guides/database/overview)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase database backups](https://supabase.com/features/database-backups)
