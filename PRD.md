# Product Requirements Document: Saju App

| Field | Value |
|---|---|
| Working title | Saju App |
| Status | Draft v0.3 — verified prototype contract |
| Date | 2026-08-02 |
| Product shape | Korean-first responsive web app/PWA; mobile-first UX with full desktop web support |
| Initial release | Personal Saju and couple Saju chart with evidence-grounded reading |
| Primary market | Korean-speaking adults with Korean birth records |

## Executive Summary

Saju App helps a user calculate and understand a Saju chart without hiding the calculation method or presenting interpretive prose as deterministic truth. The verified prototype combines a versioned deterministic chart engine, traceable interpretation rules, and an in-app rule-based question helper. A separately consented generative-AI conversation layer is a future capability, not a current feature. One responsive web codebase supports phone browsers, an installable PWA experience, tablets, and desktop browsers; installation is optional.

The first release focuses on Korean Saju only, with two explicit modes: **내 사주** for one person and **커플 사주** for a potential or current partner. Couple mode keeps the two subjects separate and includes partner-input authority in the required start-stage service disclosure without repeating another checkbox in the birth form. It describes differences without compatibility scores or deterministic relationship claims. Ziwei Doushu, Western natal astrology, professional practitioner tools, and fear-based paid remedies are excluded. Chart calculation remains deterministic in the browser. The prototype stores records in browser IndexedDB and the local development server's SQLite database; managed central storage, identity, encryption key management, and cross-device sync remain production work. Service storage is required for this flow, while first-party product-learning use is optional and independently revocable. Third-party AI processing and human review are not enabled.

The product's main differentiator is **traceable trust**: every interpretation must point back to chart facts, and births near a solar-term, day, or hour boundary must be visibly marked as sensitive instead of silently returning one absolute answer.

## Verified Prototype Snapshot — 2026-08-02

- Mobile-first responsive PWA with separate personal and couple flows; wide couple input places self left and partner right, while narrow screens stack them in that order.
- Required service-storage acknowledgement and an initially unselected, optional product-learning choice. Declining learning use does not reduce chart or reading quality.
- Solar and lunar input, explicit leap-month handling, unknown-time behavior, and lazy-loaded search across 21,836 current Korean administrative and legal localities.
- Deterministic demo chart, eight personal or seven couple reading chapters, stable evidence identifiers, large-text mode, and a rule-based question helper that does not call an external AI service.
- One stable browser record per calculation with reopen, JSON export, deletion, clear-all, optional-training withdrawal, IndexedDB outbox, and durable local SQLite submission storage.
- Submission-level local development delete and training-withdrawal endpoints. Account ownership, production subject-level authorization, managed PostgreSQL/KMS, retention jobs, and model-lineage execution are not implemented.

## Problem Statement

People who are curious about Saju usually face one or more of these problems:

- Different services return different pillars without explaining why.
- Calculation conventions such as solar-term timing, time zone, solar-time correction, day boundary, and leap month are hidden.
- Long readings contain generic prose that cannot be traced to the user's chart.
- AI chat may invent pillars or change its interpretation between messages.
- Birth date, time, place, and sensitive questions may be retained or sent to third parties without a clear explanation.
- Services may use categorical predictions or fear to sell additional products.

The user needs a chart they can inspect, a reading they can understand, and a clear distinction between calculated facts, interpretive tradition, and generated language.

## Solution

Saju App will provide:

1. A guided birth-input flow supporting solar and lunar dates, leap months, unknown birth time, and the traditional sex parameter used by some daewoon methods.
2. A deterministic and versioned calculation result that records the time policy, data source, engine version, and any boundary sensitivity.
3. A couple flow that captures relationship state (`getting-to-know`, `dating`, `partner`), separates self and partner birth inputs, and requires explicit partner authority in the start-stage service disclosure before comparison or storage without repeating the checkbox in the birth form.
4. A responsive chart showing four pillars, ten gods, hidden stems, five-element distribution, major relations, and daewoon when enough input is available, optimized first for mobile and expanded deliberately for desktop. Couple inputs and results place self on the left and partner on the right on wide screens, then stack in the same order on narrower screens. Shared elements and distribution gaps remain observation prompts, not a score.
5. A concise reading of five to eight sections, with evidence chips linking each material statement to structured chart facts.
6. A rule-based question helper constrained to calculated facts and non-directive safety copy; optional external-AI conversation may be added later behind a separate just-in-time consent boundary.
7. Versioned browser records and a local SQLite ingestion adapter with purpose-specific receipts, export, deletion, and training-withdrawal controls. Managed encrypted central profiles and cross-device sync remain the production target.

## Product Principles

- **Calculation before narration:** an LLM never calculates pillars or silently changes chart facts.
- **Methods are visible:** the result names the calculation policy and relevant boundary rules.
- **Evidence before confidence:** interpretations show their supporting facts and avoid false precision.
- **Sensitivity is a result:** near-boundary inputs trigger an explanation and alternative-case comparison where appropriate.
- **Purpose before reuse:** operational storage does not automatically authorize model training, external AI transfer, or human review.
- **Traceable learning:** every training row must link to source, consent, transformation, quality decision, dataset version, and model run.
- **Respect, not fear:** no categorical claims about death, severe illness, divorce, bankruptcy, criminality, or guaranteed outcomes.
- **No coercive monetization:** the product does not use alarming predictions to sell talismans, rituals, naming, or urgent consultations.

## Target Users

### Primary: Curious newcomer

A Korean-speaking adult who knows their birth information, wants an understandable reading, and has limited knowledge of stems, branches, or calculation schools.

### Secondary: Informed enthusiast

A user who already knows their chart and wants to inspect calculation conventions, compare boundary-sensitive results, and verify why a reading was produced.

### Not targeted in the MVP

Professional practitioners managing clients, API customers, schools requiring their own proprietary rules, and users seeking Western astrology or Ziwei Doushu.

## Jobs to Be Done

- When I enter my birth information, help me obtain a chart whose calculation method I can inspect.
- When I read an interpretation, show me which chart facts support it.
- When my birth is close to a boundary, explain the uncertainty instead of hiding it.
- When I ask a follow-up question, answer from my fixed chart without inventing new facts.
- When I provide sensitive birth data, let me understand and control where it is stored or transmitted.

## Goals and Success Metrics

### Product goals

- Establish user trust through transparent and reproducible chart calculation.
- Make Saju concepts understandable without flattening them into generic personality copy.
- Provide useful reflection without presenting tradition or model output as scientific certainty.
- Improve the product from centrally retained inputs, outputs, and feedback without hiding training use or weakening user rights.

### Launch metrics

| Metric | Target |
|---|---|
| Valid birth-input to chart completion rate | At least 85% |
| Calculation golden-fixture pass rate | 100% for all launch fixtures |
| Boundary sensitivity detection pass rate | 100% for all defined boundary fixtures |
| Material interpretation claims carrying at least one evidence link | 100% |
| Unsupported chart facts in evaluated AI responses | Less than 1% and no critical pillar mutation |
| Users who can identify the selected calculation method after viewing the method panel | At least 80% in usability testing |
| Raw birth data present in analytics or application logs | 0 occurrences |
| Centrally stored source records linked to a valid service-storage receipt | 100% |
| Training dataset rows linked to a valid current training consent and source lineage | 100% |
| Direct account identifiers or exact birth fields in interpretation-training snapshots | 0 occurrences |
| Withdrawal/deletion fixtures traced through affected datasets and model runs | 100% |
| Mobile and desktop accessibility audit | WCAG 2.2 AA for all critical flows |

Engagement and retention are secondary during the first beta. They must not be improved by increasing fatalistic language, artificial urgency, or generic report length.

## MVP Scope

### P0: Required for launch

- Responsive Korean web app supporting mobile, tablet, and desktop browsers, optionally installable as a PWA.
- Feature parity between the mobile browser, installed PWA, and desktop web experience.
- Solar and lunar birth-date input, including explicit leap-month selection.
- Birth time with an “unknown” option.
- Searchable selection from the current official Korean administrative and legal 동·읍·면·리 catalog, persisted with its 10-digit area code and handled in `Asia/Seoul` civil time.
- Optional traditional binary sex parameter, with an explanation of why it affects some daewoon methods.
- Four pillars and core structured chart facts.
- Calculation-method and source panel.
- Boundary-sensitivity warning and alternative result when the selected policy can produce a material change.
- Five to eight evidence-grounded reading sections written in plain Korean, with a 17px minimum reading size and a user-controlled 19px large-text mode.
- Versioned central profile, submission, result, reading, conversation, and feedback storage with encryption and deletion workflows.
- Versioned IndexedDB cache and purpose-receipt-bound offline submission outbox.
- Required service-storage notice plus a separately recorded, optional model-training choice. Human review and third-party AI processing are disabled; either capability requires its own just-in-time disclosure and choice before use.
- Start-stage data-subject and authority declaration when a user enters another person's birth information; do not repeat the same control inside the birth form.
- Structured chart copy/export.
- Rule-based follow-up question helper constrained to the chart-fact contract and non-directive language.
- Safety notices, data-use disclosure, and report feedback.

### P1: After launch validation

- PDF and image export.
- Approved pseudonymization, labeling, dataset snapshot, lineage, and model-run registry pipeline.
- International birthplace and IANA time-zone support.
- Additional documented calculation-policy presets.
- Annual and monthly cycle views.
- Advanced history filters, dataset-use visibility, and deletion-status tracking.
- A comparison view for two profiles.
- Optional external-AI conversation only after provider, payload, retention, safety, and separate-consent gates are approved.

### P2: Future consideration

- Practitioner workspace.
- Public calculation API.
- Native iOS and Android shells.
- Additional languages.
- Ziwei Doushu or Western natal chart modules.

## User Stories

1. As a first-time visitor, I want a brief explanation of what the app calculates, so that I understand its purpose before entering personal data.
2. As a privacy-conscious user, I want to know which data is stored centrally and for which purpose, so that I can make an informed decision before submission.
3. As a user with a solar birth date, I want to enter it directly, so that I do not need to convert calendars myself.
4. As a user with a lunar birth date, I want to identify it as lunar, so that the correct date is used.
5. As a user born in a leap lunar month, I want to select leap month explicitly, so that my chart is not calculated from the corresponding regular month.
6. As a user who knows my birth time, I want to enter hours and minutes, so that the hour pillar can be calculated under the selected policy.
7. As a user who does not know my birth time, I want to continue without guessing, so that time-dependent claims are omitted or clearly limited.
8. As a user born in Korea, I want to select my birthplace without understanding time-zone identifiers, so that the correct civil-time policy is applied.
9. As a user asked for a sex parameter, I want to know that it is a traditional calculation input rather than an identity judgment, so that I can make an informed choice.
10. As a user who declines the sex parameter, I want to receive the chart sections that do not depend on it, so that the entire experience is not blocked.
11. As a user entering an invalid or impossible date, I want a specific correction message, so that I can fix the input.
12. As a returning user, I want my centrally stored profile and results cached on my device, so that I can resume quickly and work through temporary network loss.
13. As a profile owner, I want to rename, export, correct, and delete my stored profile, so that I remain in control of operational and derived data.
14. As a user, I want to see the normalized date, time zone, and calendar conversion before calculation, so that I can catch input mistakes.
15. As a user, I want to see my four pillars in one compact view, so that I can understand the chart structure at a glance.
16. As a newcomer, I want plain-language explanations for stems, branches, ten gods, and hidden stems, so that the result is not only specialist notation.
17. As an informed user, I want access to the exact calculation policy and engine version, so that I can reproduce or compare the result.
18. As a user born near Lichun or another solar term, I want a boundary warning, so that I know the chart may change under a nearby time or different convention.
19. As a boundary-sensitive user, I want to compare the affected pillars and downstream facts, so that I understand the practical impact.
20. As a user with an unknown birth time, I want hour-dependent content marked unavailable, so that the app does not fabricate certainty.
21. As a user, I want five-element distribution and key relations presented visually and textually, so that the result remains accessible.
22. As a user eligible for daewoon calculation, I want the direction and start-age method shown, so that the cycle result is auditable.
23. As a reader, I want a concise report organized by meaningful themes, so that I do not have to navigate repetitive filler.
24. As a skeptical reader, I want each material interpretation to link to one or more chart facts, so that I can inspect its basis.
25. As a user, I want calculated facts, traditional interpretation, and practical reflection visually distinguished, so that I do not confuse their certainty levels.
26. As a user, I want uncertainty and conflicting signals acknowledged, so that the reading does not force a single simplistic label.
27. As a user, I want to copy my structured chart, so that I can use it with another tool without copying hidden personal data.
28. As a user, I want separate choices for external AI processing, first-party model training, and human review, so that one action does not grant blanket permission.
29. As an AI-chat user, I want the assistant to retain the same fixed chart throughout the conversation, so that it does not contradict the report.
30. As an AI-chat user, I want answers to cite relevant chart facts, so that I can tell whether a response is grounded.
31. As an AI-chat user, I want the assistant to refuse catastrophic or guaranteed predictions, so that the experience does not manipulate me.
32. As a user discussing health, money, relationships, or career, I want reflective and conditional language, so that I am not given professional advice disguised as fate.
33. As a user, I want to report an incorrect calculation or unsupported interpretation, so that the product team can investigate with the engine and policy versions attached.
34. As a privacy-conscious user, I want analytics and logs to exclude my birth data and questions even though operational records are centrally stored, so that hidden copies are not created.
35. As a user leaving the service, I want to delete stored profiles and conversations and withdraw future training use, so that retention and model impact are handled transparently.
36. As a user on a mobile device, I want the chart and evidence panels to work at a narrow viewport, so that I do not need horizontal scrolling.
37. As a keyboard or screen-reader user, I want every input, chart label, warning, and disclosure to be accessible, so that the core experience is usable without pointer-only interaction.
38. As a user returning after the engine changes, I want old results labeled with their original version, so that a recalculation does not silently overwrite history.
39. As a desktop web user, I want chart facts, evidence, and reading content to use the wider screen effectively, so that I can compare information without navigating a stretched mobile column.
40. As a contributor to product improvement, I want to opt into model training separately, so that I understand how my data may be used.
41. As a user who declines model training, I want the same deterministic chart quality, so that optional consent is not coerced.
42. As a user, I want to see whether a record is operational-only, training-eligible, or already included in a dataset, so that learning use is traceable.
43. As a user correcting an error, I want the correction to invalidate affected training eligibility, so that known bad data is not reused.
44. As a person entering someone else's birth information, I want the authority requirement explained, so that third-party data is not silently treated as mine.
45. As a user withdrawing training permission, I want future datasets blocked immediately and affected model runs identified, so that the product can explain what happens next.

## Functional Requirements

### Birth input and normalization

- The app must accept solar or lunar dates from 1900-01-01 through the current date for the MVP.
- Lunar input must require an explicit regular/leap-month choice when both are possible.
- The app must preserve the original user input separately from normalized calculation values.
- The app must not infer a missing birth time.
- The app must explain the purpose of the traditional sex parameter and allow the user to omit it.
- The app must reject impossible dates and unsupported ranges before calculation.
- Korean birthplace selection must resolve a full current official administrative or legal locality name, its 10-digit area code, and `Asia/Seoul`. A unique short locality such as `문현동` may resolve automatically; ambiguous short names must require a city/district choice.
- The result must keep routine storage, training, external-AI, and engine-version diagnostics out of the reading surface while retaining record deletion and calculation-source access.
- Before the first central submission, the app must display the service-storage categories, purpose, retention, processor, rights, and consequence of declining.
- A submission must identify whether the account user is the data subject or is entering another person's information.
- Original and normalized birth input must be stored separately with envelope encryption, integrity hashes, purpose-authorization receipt, and schema version.

### Calculation result

- One deterministic calculation call must produce the full chart result from normalized input plus a calculation-policy identifier.
- Every result must contain engine version, policy version, source-data version, normalized instant, and warnings.
- The chart must include the four pillars, ten-god relationships, hidden stems, five-element counts or weights, and supported stem/branch relations.
- Daewoon must be omitted or marked incomplete when required inputs are unavailable.
- Unsupported or disputed derived concepts must not be represented as universally correct. If added, their rule set and school must be named.
- Recalculating identical input under identical versions must produce byte-equivalent structured facts.

### Boundary sensitivity

- The engine must detect proximity to solar-term, civil-day, and hour-branch boundaries relevant to the active policy.
- The UI must identify which output fields can change and why.
- When a nearby alternative produces a different chart, the user must be able to compare the changed fields without creating a second profile.
- The product must never hide a known boundary condition behind a generic confidence score.

### Reading

- The initial report must contain five to eight sections selected from overall pattern, temperament, strengths, work, relationships, resources, wellbeing habits, and current cycles.
- Each material sentence must reference at least one immutable chart-fact identifier.
- A user must be able to open an evidence chip and see the underlying fact in plain language.
- The renderer must distinguish calculated fact, traditional interpretation, product synthesis, and user-facing reflection.
- Time-dependent and daewoon-dependent sections must be suppressed or qualified when inputs are missing.
- The report must avoid medical, legal, financial, or mental-health diagnosis and categorical future claims.

### Annual reading and card-news output

- A single-chart user may choose a target year from 1900 through 2099. The annual year begins at the versioned Ipchun instant and ends immediately before the next Ipchun; it never silently begins on January 1.
- `ziping-annual-basic@1.0.0` uses only the natal day stem, natal month branch as context, annual-stem ten-god relation, and the explicitly supported clash/six-harmony branch pairs.
- Gyeokguk, yongsin, strength scoring, johu, punishment/destruction/harm, special combinations, and high-consequence predictions remain visibly excluded.
- Annual facts must use stable IDs and record label, value, detail, source/version, and support status. Missing required facts suppress dependent cards.
- A valid default deck contains exactly eight renderer-independent `annual-card.v1` objects in the order cover, overall, work, money, relationships, growth, action, and method.
- Monthly flow is a separate 12-entry solar-term disclosure. It is not appended to the default eight-card deck.
- Mobile provides previous/next card controls and position status. Desktop shows an overview. Keyboard focus, reduced motion, a full document view, and print/PDF remain available.
- Annual JSON and print output exclude raw birth input, exact location, record IDs, and consent metadata.

### Future AI conversation — not implemented in the verified prototype

- Any future AI chat must be opt-in and unavailable until its just-in-time data-use notice is accepted.
- The default AI payload must contain structured chart facts, fact identifiers, policy metadata, locale, and the user's question. Raw birth date, time, place, and profile name must be excluded unless a documented feature requires them.
- The model must not calculate or replace pillars.
- The response contract must associate material claims with chart-fact identifiers.
- Responses with unknown or unsupported facts must state the limitation instead of inventing an answer.
- The safety layer must block catastrophic certainty, professional diagnosis, guaranteed outcomes, and coercive upselling.
- The user must be able to clear the conversation and request deletion of centrally retained conversation data and its governed derivatives.
- User and assistant turns must be centrally stored with encryption, model/prompt/safety versions, and a retention deadline.
- External AI processing consent does not grant first-party model-training or human-review permission.

### Profiles and export

- PostgreSQL is the canonical profile/submission history; IndexedDB is a cache and offline outbox.
- Stored profiles must include original input, calculation versions, source authorization/consent evidence, data-subject relationship, and processing state.
- Deleting a profile must remove local data immediately and start an idempotent server deletion workflow covering derived content, processors, datasets, and model-impact review.
- Structured export must separate chart facts from optional narrative content.
- Export must not include analytics identifiers or hidden model metadata.

## Calculation Policy Requirements

The MVP will use a named Korean civil-time policy with no hidden longitude correction. Exact day and hour boundary conventions are launch-blocking domain decisions and must be recorded in an architecture decision before engine implementation is accepted.

The policy registry must make these choices explicit:

- civil time-zone and historical-offset source;
- standard, mean-solar, or apparent-solar time treatment;
- longitude and equation-of-time formula when applicable;
- year and month boundary source and precision;
- day boundary and early/late `자시` convention;
- hour-branch interval convention;
- lunar conversion and leap-month representation;
- daewoon direction and start-age method;
- interpretation school and rule-set version.

The UI must show the active policy in user-readable language. Marketing must not claim universal accuracy when schools legitimately differ.

## Implementation Decisions

- The product will have three strict layers: deterministic chart calculation, deterministic interpretation facts/rules, and optional generative narration.
- The calculation core will be framework-independent and executable in both the browser and a test runner.
- The natal web interface calls its calculation core locally. The annual slice uses the same-origin deterministic `/v1/annual-readings` adapter so the pinned ephemeris implementation and content hash remain centralized; cached saved results and client rendering remain available offline.
- A single high-level calculation contract will accept normalized birth input plus a policy identifier and return one versioned chart result.
- Structured chart facts will have stable identifiers so the report, AI output, feedback, and regression tests can reference the same evidence.
- Source calendar or ephemeris data must carry provenance, license, version, covered range, and generation method. An undocumented CSV cannot be a production source.
- AI access will pass through a server-side narration gateway so provider credentials, consent enforcement, payload minimization, safety checks, and retention controls remain centralized.
- The narration gateway will reject responses that mutate immutable chart facts or omit required evidence references.
- IndexedDB will provide a versioned cache and purpose-receipt-bound submission outbox. `localStorage` will not hold birth profiles, content, authorization evidence, or tokens.
- Managed PostgreSQL, with Supabase as the default candidate, will be the canonical operational store for encrypted birth input, normalized input, chart results, readings, conversations, feedback, purpose authorization/consent, processing lineage, and deletion state.
- Restricted PII/content will be envelope-encrypted in a vault schema separated from operational metadata and browser access.
- Model training will use purpose-specific pseudonymized dataset snapshots in encrypted object storage, never a direct query, replica, backup, log, or ad hoc export from production.
- Dataset membership and model-run junctions will preserve source-to-model lineage and withdrawal impact analysis.
- Every browser-exposed PostgreSQL table will use explicit grants and Row Level Security; service credentials remain server-side.
- Product analytics will use a redacted event schema and must technically prevent raw dates, times, places, profile names, and free-text questions from entering event properties.
- Results will retain their original engine and policy versions; recalculation creates a new versioned result rather than silently rewriting the old one.
- The MVP will begin as a modular monolith using pragmatic domain-driven design; bounded-context ownership is fixed even if deployment boundaries change later.
- Framework and hosting choices remain implementation decisions, but the domain and data boundaries in this PRD are fixed regardless of stack.

### Domain architecture: pragmatic DDD

DDD is used where business invariants are difficult and consequential. It is not a requirement to wrap simple UI, cache, or infrastructure code in domain abstractions.

| Bounded context | Owns | Boundary rule |
|---|---|---|
| Identity and Profile | Account, data subject, profile metadata, authority relationship | Cannot decrypt birth content or decide training eligibility |
| Chart Calculation | Normalized birth, calculation policy, chart result, chart fact, boundary sensitivity | Pure deterministic domain; cannot call an LLM or depend on UI/database frameworks |
| Interpretation | Rule-set version, reading block, evidence link, uncertainty marker | Can reference immutable chart facts but cannot mutate them |
| Consultation | Conversation, AI request/response, prompt/model version, safety outcome | Must use the fixed chart-fact contract and pass through consent/policy gates |
| Privacy and Governance | Consent, purpose, retention, processing event, deletion workflow, privileged audit | Authoritative for whether processing is allowed; does not own model quality labels |
| Learning and Model Governance | Feedback, review label, dataset snapshot/member, model run and artifact decision | Can read only approved projections; never reads the production PII vault directly |

Each context exposes application commands, queries, and versioned events. Cross-context code passes stable identifiers and immutable facts rather than reaching into another context's tables. Events that leave their originating transaction use a transactional outbox and idempotent consumers. A shared kernel is limited to identifiers, timestamps, version references, and error/result primitives. The first deployment remains one repository and one server application unless measured scaling or isolation needs justify extraction.

## Data Storage Architecture

The product uses three storage boundaries:

| Boundary | Technology | Stores | Must not store |
|---|---|---|---|
| User device | IndexedDB | Cache, result copy, purpose-authorization receipt, offline submission outbox, settings | Server credentials or unregistered training exports |
| Operational server | Managed PostgreSQL | Encrypted birth records, results, readings, conversations, feedback, purpose authorization/consent, processing, deletion, and dataset/model metadata | Plaintext secrets or browser-readable vault data |
| Training storage | Encrypted object storage | Approved pseudonymized immutable dataset snapshots and manifests | Account identity or unregistered raw database exports |

The chart engine, calculation policy, and ephemeris assets remain versioned application artifacts and run locally. During an outage, a calculation may complete and enter a visible `pending sync` state; the central submission must succeed before the record is considered durably stored.

Supabase is the recommended initial provider because it supplies portable PostgreSQL, Auth integration, Row Level Security, and managed backup options. The schema must remain standard PostgreSQL so the application can move providers.

Stored operational data is not automatically training data. Eligibility is re-evaluated when a dataset is built using current purpose consent, data-subject authority, age/minor rules, correction/deletion state, PII and safety screening, quality status, and model objective.

Detailed external, conceptual, and internal schemas, retention, indexes, concurrency, capacity, and recovery targets are defined in `docs/DATA-ARCHITECTURE.md`.

## Data Model Decisions

The product will maintain these conceptual records:

- **Birth Input:** original calendar type, date, time or unknown flag, place identifier, time-zone identifier, optional coordinates, and optional traditional sex parameter.
- **Normalized Birth:** resolved civil time, UTC instant when available, conversion metadata, and validation warnings.
- **Calculation Policy:** stable identifier, version, named conventions, and source-data versions.
- **Chart Result:** pillars, derived facts, cycle data, sensitivity findings, engine version, policy version, and creation timestamp.
- **Chart Fact:** stable fact identifier, category, structured value, dependencies, and provenance.
- **Annual Reading:** target year, Ipchun range, calculation policy, interpretation profile, rule-set version, annual facts, eight cards, separate monthly flow, unsupported flags, and content hash. It extends rather than overwrites a natal chart result.
- **Reading Block:** section, text, supporting fact identifiers, content source, and uncertainty markers.
- **Purpose Authorization:** purpose, disclosure version, lawful basis, consent decision when applicable, scope, state, and timestamp.
- **Feedback Record:** issue category, result versions, affected fact identifiers, and user comment only when explicitly submitted.
- **User Account:** server-issued anonymous or registered actor identity, locale, and ownership links to centrally stored profiles and submissions; sign-up is optional even though an ownership principal is required.
- **Profile:** centrally stored user-facing aggregate linking a data subject, encrypted birth record, current result references, revision, and lifecycle state.
- **Conversation:** centrally stored session and encrypted turns with chart-result, consent, prompt, model, and safety versions.
- **Deletion Job:** auditable asynchronous purge state across the database and external providers.
- **Data Subject:** the person described by a birth record, distinct from the account user when necessary.
- **Submission:** idempotent centrally stored capture of one birth-input action.
- **Processing Event:** source-to-output evidence for controlled collection, transformation, review, export, or deletion.
- **Dataset Snapshot:** immutable purpose-specific training/evaluation export with manifest and checksum.
- **Dataset Member:** lineage link between a source record, consent receipt, transformed row, and snapshot.
- **Model Run:** reproducible training execution tied to exact datasets and code/config versions.

Raw birth data and AI free text are prohibited from analytics records.

## Safety and Trust Requirements

- The service must state that Saju is a traditional interpretive practice and not a scientific prediction or substitute for professional advice.
- Language must be conditional, reflective, and agency-preserving.
- The app must not predict death dates, severe illness, crime, divorce, bankruptcy, infertility, or guaranteed success.
- Health, finance, legal, and mental-health questions must receive a bounded response and an appropriate professional-help reminder when risk is present.
- The app must not use fear, countdowns, or negative labels to sell a remedy or upgrade.
- A report must not assign moral worth, criminal tendency, disease, or relationship compatibility as an immutable trait.
- Safety rules apply equally to deterministic templates and AI-generated content.

## Privacy and Security Requirements

- The app must disclose central storage before the first submission and distinguish service storage, model training, human review, and external AI processing.
- Model-training consent must be separate, optional, versioned, revocable, and recorded independently. Declining it uses the same deterministic chart, reading, and rule-based question path.
- The app must distinguish the account user from the person described by the birth record and exclude unverified third-party/minor data from training.
- IndexedDB must disclose pending-sync state and must not imply that local deletion completed server deletion.
- The app must show a just-in-time disclosure before transmitting data for AI use.
- Birth input must not appear in URLs, client telemetry, server logs, crash payloads, or third-party analytics.
- Exact birth input, profile labels, and free text must be encrypted in transit and with application/vault-level protection at rest.
- Training projections must be purpose-minimized, pseudonymized, screened, versioned, and separated from account identity.
- Every retained server object must have a declared retention/deletion rule; indefinite unspecified retention is prohibited.
- Users must be able to export, correct, delete, and withdraw future training use, with dataset/model impact recorded.
- Browser-exposed tables must enforce explicit grants and per-user Row Level Security, with automated cross-user isolation tests.
- The product must publish provider, purpose, payload, retention, and deletion details in plain language.
- Secrets must remain server-side, and the web client must enforce a restrictive content security policy.
- Threat modeling must cover profile exposure on shared devices, prompt injection through user questions, log leakage, and unauthorized history access.

## Non-Functional Requirements

- Initial chart calculation should complete within 500 ms at the 95th percentile on a representative mid-range mobile device after assets load.
- The first usable mobile screen should render within 2.5 seconds at the 75th percentile on a typical 4G connection.
- The desktop web experience must provide the same product capabilities as mobile and use a multi-column or master-detail layout where it improves comparison and reading.
- Core calculation and cached profiles should remain usable offline after the PWA has loaded once; new submissions must be queued and visibly synchronized later.
- Critical flows must meet WCAG 2.2 AA, including keyboard navigation, screen-reader labels, focus order, color contrast, and non-color boundary indicators.
- Layouts must work from 360 px through 1920 px. Narrow screens must not require page-level horizontal scrolling, and wide screens must not merely center a phone-width column for the primary result flow.
- Critical flows must be verified at representative 360 px mobile, 768 px tablet, 1280 px desktop, and 1440 px wide-desktop viewports.
- Deterministic core output must not depend on browser locale, host time zone, or network availability.
- Production errors must include engine and policy versions without including birth data.
- The system must support rollback to a prior engine/policy version without corrupting saved profiles.

## Testing Decisions

### Primary test seam

The highest and primary seam is the external calculation behavior: normalized birth input plus calculation policy produces a complete, versioned chart result. Most correctness tests will target this contract instead of private stem, branch, or conversion helpers.

### Required test groups

- Authoritative golden fixtures for ordinary dates.
- All 24 solar-term boundaries at minus one minute, exact boundary, and plus one minute.
- Lichun cases where year and month pillars can change.
- Lunar new year, regular/leap month entry and exit, and lunar month-end conversion.
- 23:00, 23:30, midnight, 00:30, and 01:30 cases under the approved day/hour policy.
- Historical Korean clock-offset transitions covered by the supported date range.
- Unknown birth time and omitted traditional sex parameter.
- Determinism across browser locale, host time zone, and repeated execution.
- Boundary-sensitivity warnings and alternative-result comparisons through the rendered user flow.
- Local cache/outbox creation, migration, clearing, and offline restoration against the canonical server profile.
- IndexedDB schema upgrade and rollback behavior, including interruption during migration.
- PostgreSQL foreign-key, check-constraint, idempotency, and optimistic-concurrency behavior.
- RLS tests proving authenticated user A, authenticated user B, and an anonymous client cannot cross ownership boundaries.
- Central ingestion tests proving birth input, result, purpose authorization/consent, processing lineage, and integration event commit atomically and retries are idempotent.
- Training eligibility tests proving missing, withdrawn, expired, third-party, minor, disputed, corrected, or deletion-pending records are excluded.
- Pseudonymization tests proving interpretation-training snapshots contain no account identifiers, profile labels, raw location text, or exact birth fields.
- Dataset/model lineage tests tracing every included source through snapshot, transformation, model run, artifact, and deployment decision.
- End-to-end withdrawal and deletion tests covering the active database, object snapshots, providers, backups, and model-impact queue.
- AI contract tests that reject pillar mutation, unsupported fact identifiers, missing evidence links, and prohibited categorical claims.
- Privacy tests that scan analytics, URLs, logs, and AI payloads for forbidden raw fields.
- Accessibility tests plus manual screen-reader and keyboard verification for critical flows.
- Responsive behavior and visual-regression checks for mobile, tablet, and desktop result layouts.

### Oracle policy

- Golden values must come from documented primary or authoritative sources such as KASI solar-term data plus an independently implemented ephemeris or licensed calendar source.
- Agreement among third-party libraries is useful secondary evidence, not a sufficient oracle.
- Every fixture must record source, source version, expected policy, and why the case matters.
- No release may proceed with a known mismatch hidden by changing the expected test value.

## Analytics Events

Allowed events include onboarding viewed, input validation failed by category, chart completed, method panel opened, boundary warning viewed, evidence chip opened, AI consent accepted or declined, AI response rated, profile saved, and profile deleted.

Events may contain only coarse product state such as calendar type, unknown-time flag, boundary-warning flag, engine version, and policy version. They must not contain exact dates, exact times, places, coordinates, names, free text, chart strings, or device-local profile identifiers.

## Acceptance Criteria

The MVP is accepted only when all of the following are true:

1. A user can complete solar and lunar input, including a validated leap-month case, and obtain the same chart on both a 360 px mobile viewport and a 1280 px desktop viewport.
2. The chart records and displays engine version, calculation-policy version, source-data version, and normalized time treatment.
3. All approved golden fixtures and every launch boundary fixture pass without exceptions.
4. Unknown birth time never produces an unqualified hour pillar or hour-dependent reading.
5. A near-boundary fixture produces a visible warning and identifies the fields that can change.
6. Every material reading claim opens at least one valid supporting chart fact.
7. The same input and versions produce identical structured output across supported browsers and host time zones.
8. A user can create, load, rename, export, correct, and delete a centrally stored profile while using IndexedDB for caching and offline outbox behavior.
9. Every completed online submission is durably stored with encrypted original input, normalized input, versioned result, valid service-storage receipt, and processing event.
10. AI chat cannot start before third-party processing consent; first-party model training and human review remain separately controlled.
11. Automated AI contract evaluation finds no pillar mutation and less than 1% unsupported fact claims, with zero critical safety violations in the launch set.
12. Logs and analytics pass automated sensitive-field scans.
13. Critical flows pass accessibility automation and a manual keyboard and screen-reader check.
14. The service disclosure, privacy notice, AI data-use notice, and deletion behavior match the implemented system.
15. Live mobile and desktop artifacts are manually inspected; passing build and unit tests alone is not sufficient.
16. Every training snapshot row has current eligible consent, pseudonymous subject grouping, source hash, transformation version, quality state, and dataset membership.
17. Interpretation-training snapshots contain zero direct identifiers and zero exact birth fields in the launch inspection set.
18. Withdrawal immediately blocks future export and identifies all affected snapshots and model runs.
19. Data entered about another person or a minor cannot enter training without the approved authority/guardian path.

## Out of Scope

- Ziwei Doushu, Western natal astrology, tarot, naming, compatibility matching, and daily fortune notifications.
- A marketplace for practitioners, talismans, rituals, or paid fear-based remedies.
- Medical, legal, financial, fertility, or mental-health diagnosis.
- A promise of scientific validity or universally correct Saju interpretation.
- Multiple calculation schools at initial launch, beyond the one explicitly documented MVP policy.
- Overseas birthplace and historical global time-zone support in P0.
- Social feeds, public profile sharing, and user-generated public readings.
- Native mobile applications, subscriptions, and payment processing.
- Copying Orrery's AGPL source or calendar data with unresolved provenance into a closed-source product.
- Training a general-purpose model unrelated to the disclosed Saju product purposes.
- Training directly from production tables, backups, logs, analytics, or unregistered local exports.

## Dependencies and Launch-Blocking Decisions

- Approve the exact Korean day-boundary and hour-branch convention with a qualified domain reviewer.
- Select or implement an ephemeris/calendar data source with documented provenance, license, precision, and supported range.
- Build and independently review the initial golden-fixture set before interpreting chart results.
- Decide whether the product will remain closed source; this determines which external code can be reused.
- Select an AI provider and confirm payload retention, regional processing, and deletion terms before enabling chat.
- Accept Supabase or another managed PostgreSQL provider and approve its region, backup tier, RLS/grant model, and restore-test procedure before persistent server features launch.
- Approve the purpose-specific service storage, external AI, human review, and model-training notices after Korean privacy counsel review.
- Approve retention, minors, third-party data, cross-border transfer, withdrawal, deletion, dataset, and model-impact policies.
- Select encrypted object storage, KMS ownership, pseudonymization pipeline, and isolated review/training environment.
- Define the first model objective and the exact labels required; raw collection alone is not a training strategy.
- Approve the final product name and brand tone before public launch.

Until these decisions are made, `Saju App`, Korean civil-time policy, and no hidden longitude correction are working assumptions.

## Delivery Milestones

### Milestone 0: Domain and evidence lock

- Calculation policy decision record approved.
- Data provenance and license recorded.
- Golden fixtures independently reviewed.
- Core result and chart-fact contracts frozen for MVP.

### Milestone 1: Deterministic chart

- Birth input and normalization complete.
- Calculation core passes the full golden suite.
- Boundary sensitivity implemented.
- Method panel and structured chart available with responsive mobile and desktop layouts.
- Central encrypted submission, purpose authorization, processing lineage, IndexedDB outbox, and deletion request implemented.

### Milestone 2: Evidence-grounded reading

- Interpretation fact rules versioned.
- Five to eight reading sections rendered.
- Every material claim linked to chart facts.
- Unknown-time and missing-parameter behavior verified.
- Versioned reading output, user ratings, structured corrections, and label-quality states stored.

### Milestone 3: Governed profiles and optional AI

- Central profiles plus offline cache/outbox complete.
- Service-storage disclosure/lawful-basis receipt plus separate external-AI, training, and human-review permission controls implemented.
- AI grounding, encrypted content, safety, retention, correction, withdrawal, and deletion gates pass.

### Milestone 4: Closed beta

- Mobile, tablet, desktop, accessibility, privacy, and security validation complete.
- Boundary-sensitive users included in usability testing.
- Calculation and interpretation feedback triaged by version.
- Pseudonymized dataset snapshot, membership lineage, dataset review, and model-impact tracing verified.
- Launch acceptance criteria satisfied with fresh evidence.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Hidden disagreement between Saju schools | Users see conflicting charts | Name and version one launch policy; show boundary and method details |
| Approximate solar-term data | Wrong year or month pillar near boundaries | Use an authoritative ephemeris, minute-level fixtures, and sensitivity warnings |
| Undocumented calendar data license | Commercial or distribution risk | Require provenance and license before ingestion |
| Generic or contradictory readings | Low trust and possible harm | Stable fact identifiers, evidence chips, concise sections, evaluator tests |
| LLM invents chart facts | Incorrect personalized advice | Immutable chart contract, output validation, refusal and fallback behavior |
| Birth-data leakage | Severe privacy harm | Encrypted PII vault, strict roles, no raw-data telemetry, purpose separation, audited decryption, deletion controls |
| Blanket or coerced training consent | Legal and trust failure | Separate optional consent, equal deterministic service, versioned receipts, withdrawal controls |
| Unreviewed AI output reused as truth | Model degradation and repeated errors | Treat AI output as weak data; require quality labels, reviewer gates, and isolated evaluation sets |
| Withdrawal after model training | User-rights and operational risk | Dataset membership, model lineage, future exclusion, documented retraining/unlearning decision process |
| Fatalistic product language | Psychological harm and deceptive monetization | Uniform safety policy for templates and AI; manual rubric review |
| Scope expansion into multiple traditions | Delayed and untestable MVP | Korean Saju only until the core and trust model are validated |

## Open Product Questions

These questions do not block the PRD draft but must be answered before public launch:

- What is the final product name and visual tone?
- Will the application be open source, source-available, or closed source?
- Which qualified domain reviewer approves the calculation-policy decision?
- Is AI chat free, metered, or part of a later paid plan?
- What are the approved retention periods for birth records, conversations, labels, snapshots, and audit evidence?
- Are guest submissions permitted, and what authority/guardian flow applies to third-party and minor data?
- What is the first training objective: interpretation fine-tuning, preference ranking, safety classification, or calculation-quality analysis?
- What evidence threshold is required before adding sinsal, yongsin, gyeokguk, or compatibility features?

## Reference Basis

This PRD was informed by a fresh review of:

- [sky.told.me](https://sky.told.me/)
- [rath/orrery](https://github.com/rath/orrery)
- [be-realdeveloper/saju](https://github.com/be-realdeveloper/saju)
- [0ssw1/sajupy](https://github.com/0ssw1/sajupy)
- [KASI calendar data](https://astro.kasi.re.kr/life/post/calendarData)
- [OOPS-ORG-PHP/Lunar provenance notes](https://github.com/OOPS-ORG-PHP/Lunar)
- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Supabase PostgreSQL and RLS documentation](https://supabase.com/docs/guides/database/overview)
- [Korean Personal Information Protection Act, Article 15](https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029335387)
- [Korean Personal Information Protection Act, Article 28-2](https://law.go.kr/LSW/lsInfoP.do?lsiSeq=270351)
- [PIPC Generative AI Personal Data Processing Guide](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=G010030000&nttId=11439)
- [PIPC AI Privacy Risk Management Model](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=G010030000&nttId=11014)

The detailed engine review is stored in `docs/reference-review.md`; the central storage design is in `docs/DATA-ARCHITECTURE.md`; training-use rules are in `docs/TRAINING-DATA-POLICY.md`.

## Definition of Done

This PRD phase is complete when the document is reviewed, the launch-blocking calculation-policy decisions have named owners, and the next implementation plan can map each P0 requirement to a testable delivery item without inventing additional product behavior.
