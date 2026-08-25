# Product Requirements Document: Four Traditions Astrology Comparison

| Field | Value |
|---|---|
| Working title | Saju App (final expansion name undecided) |
| Status | Draft v0.4 — four-tradition implementation contract |
| Date | 2026-08-23 |
| Product shape | Korean-first responsive web app/PWA; one birth profile, four independent traditions, one evidence-bound comparison |
| Implemented baseline | Personal/couple Saju with deterministic natal, annual, and daewoon calculation |
| Expansion target | Korean Saju, Thai Horasat, Vietnamese Tử Vi, and Myanmar Mahabote for one person |
| Primary market | Korean-speaking adults who want to inspect and compare Asian astrology traditions |

## Executive Summary

Saju App helps a user enter one birth profile and inspect four distinct interpretive systems without hiding calculation methods or presenting prose as deterministic truth. The implemented Saju baseline combines a versioned deterministic chart engine, traceable interpretation rules, and an in-app rule-based question helper. The expansion adds Thai Horasat, Vietnamese Tử Vi, and Myanmar Mahabote as separately versioned engines, then projects their supported interpretations into a bounded comparison layer. A generative model may word an already validated claim later, but it never calculates a chart, invents a missing system, or decides that one tradition is more correct.

The target expansion has one primary mode: **네 전통 비교** for a single subject. Existing **내 사주** and **커플 사주** remain available as the implemented baseline, but two-person × four-tradition compatibility is not part of the expansion P0. The comparison presents three evidence-bound groups: themes at least two systems support in the same direction, themes the systems frame differently, and themes unique to one system. It never creates an accuracy, fate, compatibility, or consensus score. Missing input produces an explicit unavailable state instead of guessed values. Each system keeps its own native fact model, policy, source-data version, method disclosure, and detail view.

The product's main differentiator is **traceable comparison**: every interpretation points back to system-native facts; every cross-system claim points back to the contributing interpretations; and a disagreement remains visible rather than being flattened into one universal answer. Births near a calendar, time, place, solar-term, star-placement, or weekday boundary are visibly marked according to the applicable policy.

## Implemented Saju Baseline Snapshot — 2026-08-04

- Mobile-first responsive PWA with separate personal and couple flows; wide couple input places self left and partner right, while narrow screens stack them in that order.
- Required service-storage acknowledgement and an initially unselected, optional product-learning choice. Declining learning use does not reduce chart or reading quality.
- Solar and lunar input, explicit leap-month handling, unknown-time behavior, and lazy-loaded search across 21,836 current Korean administrative and legal localities.
- Deterministic `KR-CIVIL-1.0` natal chart shared by browser and server, eight personal or seven couple reading chapters, stable evidence identifiers, large-text mode, and a rule-based question helper that does not call an external AI service.
- Minute-precision year/month boundaries, IANA `Asia/Seoul` 2026c historical legal-time rules, civil-midnight day rollover, explicit Zi-hour behavior, unknown-time suppression, offline ephemeris data, and server-side recalculation against tampered submissions.
- One stable browser record per calculation with reopen, JSON export, deletion, clear-all, optional-training withdrawal, IndexedDB outbox, and durable local SQLite submission storage.
- Submission-level local development delete and training-withdrawal endpoints. Account ownership, production subject-level authorization, managed PostgreSQL/KMS, retention jobs, and model-lineage execution are not implemented.

The snapshot above describes the existing Saju runtime. Horasat, Tử Vi, Mahabote, the shared eligibility flow, and the cross-system comparison are documentation targets only as of 2026-08-23. Their implementation and release gates are defined in `docs/MULTI-ASTROLOGY-COMPARISON-SPEC.md` and `docs/CALCULATION-POLICY-REGISTRY.md`.

## Problem Statement

People who are curious about Asian astrology usually face one or more of these problems:

- Different services return different pillars without explaining why.
- Each tradition lives in a separate service, so users repeatedly enter sensitive birth data and then compare prose by memory.
- Similar words such as career, relationships, or timing can hide fundamentally different calculation objects and schools.
- Calculation conventions such as solar-term timing, time zone, solar-time correction, day boundary, and leap month are hidden.
- Long readings contain generic prose that cannot be traced to the user's chart.
- AI chat may invent pillars or change its interpretation between messages.
- Birth date, time, place, and sensitive questions may be retained or sent to third parties without a clear explanation.
- Services may use categorical predictions or fear to sell additional products.

The user needs four charts they can inspect independently, a comparison they can understand, and a clear distinction between calculated facts, tradition-specific interpretation, cross-system synthesis, and generated language.

## Solution

Saju App will provide:

1. A progressive birth-profile flow that captures common data once, asks only for fields needed by the selected systems, and previews which systems are eligible before calculation.
2. Four deterministic, versioned calculation boundaries: implemented Korean Saju plus release-gated Thai Horasat, Vietnamese Tử Vi, and Myanmar Mahabote.
3. One immutable result per system, each recording its own policy, engine, source-data, schema, time/calendar treatment, warnings, and native facts.
4. A responsive comparison that groups evidence-backed themes into **공통으로 보는 점**, **다르게 보는 점**, and **이 체계만 보는 점**, with direct links to each contributing system result.
5. A full detail view for every completed system. Saju retains its pillars and cycles; the other systems receive their own native chart structures instead of being reshaped into Saju columns.
6. Explicit partial and unavailable states. Unknown time, missing location, unsupported dates, or a draft policy never cause guessed output.
7. Existing single/couple Saju records and privacy controls remain intact. Four-system records are additive, versioned aggregates; optional account sync remains fail-closed behind its existing legal and security gates.
8. A rule-based question helper constrained to fixed facts and comparison claims; any later external-AI wording requires a separate just-in-time processing boundary and output validation.

## Product Principles

- **Calculation before narration:** an LLM never calculates pillars or silently changes chart facts.
- **Parallel traditions, not one merged doctrine:** each system retains its own inputs, facts, school decisions, and detail result.
- **Unavailable is valid:** insufficient input or an unapproved policy produces an explicit unavailable state, never an inferred chart.
- **Comparison is a trace, not a vote:** agreement means multiple supported claims share a domain, theme, and direction; it does not mean scientific truth or majority accuracy.
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

### Not targeted in the expansion P0

Professional practitioners managing clients, API customers, schools requiring their own proprietary rules, users seeking Western astrology, and users seeking two-person compatibility across all four traditions.

## Jobs to Be Done

- When I enter my birth information, help me obtain a chart whose calculation method I can inspect.
- When I read an interpretation, show me which chart facts support it.
- When my birth is close to a boundary, explain the uncertainty instead of hiding it.
- When I ask a follow-up question, answer from my fixed chart without inventing new facts.
- When I provide sensitive birth data, let me understand and control where it is stored or transmitted.
- When I enter my birth information once, tell me which of the four traditions can be calculated without asking me to guess missing fields.
- When traditions agree, differ, or discuss a unique theme, let me open the exact system claims and native facts behind the comparison.
- When a tradition is unavailable, tell me the missing input or release gate instead of silently omitting it.

## Goals and Success Metrics

### Product goals

- Establish user trust through transparent and reproducible chart calculation.
- Make four distinct traditions comparable without erasing their differences or ranking their truth.
- Make Saju concepts understandable without flattening them into generic personality copy.
- Provide useful reflection without presenting tradition or model output as scientific certainty.
- Improve the product from centrally retained inputs, outputs, and feedback without hiding training use or weakening user rights.

### Launch metrics

| Metric | Target |
|---|---|
| Valid birth-input to chart completion rate | At least 85% |
| Eligible-system calculation completion rate | At least 95% per active system, excluding declared unsupported inputs |
| Comparison claims with valid contributing system-claim references | 100% |
| Comparison claims that include fewer than two independent systems in the common/different groups | 0 occurrences |
| Draft or blocked policies exposed as completed results | 0 occurrences |
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

### P0: Required for the four-tradition public launch

- Responsive Korean web/PWA behavior from 360 px mobile through wide desktop, with the existing Saju flows preserved.
- A canonical birth profile containing original calendar input, normalized civil date/time, time-knowledge state, place label, latitude/longitude, IANA time zone, traditional sex parameter, and provenance for every normalization step.
- Progressive input that asks common fields once, exposes why a system needs each additional field, and shows `ready`, `partial`, `needs-input`, `unsupported`, or `policy-blocked` before calculation.
- An active, deterministic, versioned policy and independently reviewed fixture suite for each publicly completed system. `KR-CIVIL-1.0` is the only currently implemented policy; the other policies remain blocked until the registry gates pass.
- One immutable result envelope per system with native chart facts, warnings, interpretation claims, calculation fingerprint, policy/engine/source/schema versions, and sensitivity metadata.
- A comparison result built only from completed, validated system claims. At least two contributing systems are required for a common or different theme; unique themes remain labeled with their single source.
- Comparison domains fixed to identity, work, resources, relationships, wellbeing, and timing for P0. A domain can be unavailable without blocking other domains.
- Mobile comparison cards and a desktop master-detail layout with direct navigation to each native chart and evidence item.
- A method drawer that distinguishes calculation fact, traditional interpretation, cross-system synthesis, and optional generated wording.
- Privacy-safe share output that omits exact birth date, time, coordinates, profile name, record identifier, and unsupported claims by default.
- Versioned IndexedDB records and JSON export for the aggregate profile, per-system results, and comparison result. Existing account persistence remains disabled unless its separate launch gates pass.
- Safety notices, non-fatalistic language, data-use disclosure, accessible error/retry states, and per-system report feedback.

### Existing Saju baseline that must not regress

- Solar/lunar input, leap-month handling, unknown time, Korean place search, four pillars, daewoon, annual reading, couple mode, evidence chips, rule-based follow-up, local records, export, and deletion.
- `KR-CIVIL-1.0`, `KR-ANNUAL-IPCHUN-1.1`, and `KR-DAEWOON-1.0` remain versioned independently of the new registry entries.
- Existing couple and under-19 privacy restrictions remain intact. A four-tradition single-person record does not silently loosen them.

### P1: After launch validation

- PDF and image export.
- Approved pseudonymization, labeling, dataset snapshot, lineage, and model-run registry pipeline.
- Saved profiles and optional account sync after the existing legal/security launch gates pass.
- Additional documented calculation-policy presets.
- Annual and monthly cycle views.
- Advanced history filters, dataset-use visibility, and deletion-status tracking.
- A two-person × four-tradition relationship view, separately scoped and consented.
- Daily/weekly reflective check-ins derived from active policies, with notification consent and no alarming urgency.
- Optional external-AI conversation only after provider, payload, retention, safety, and separate-consent gates are approved.

### P2: Future consideration

- Practitioner workspace.
- Public calculation API.
- Native iOS and Android shells.
- Additional languages.
- Western natal chart, tarot, numerology, naming, or practitioner-marketplace modules.

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
46. As a first-time comparison user, I want to enter my profile once and see which systems are ready before I submit, so that I do not discover missing fields after a long wait.
47. As a user with an unknown birth time, I want Mahabote or any other eligible result to complete while time-dependent systems remain clearly unavailable, so that I am not forced to guess.
48. As a user, I want each system to keep its native chart and terminology, so that the comparison does not disguise one tradition as another.
49. As a comparison reader, I want common, different, and unique themes separated, so that disagreement is useful instead of confusing.
50. As a skeptical reader, I want every comparison sentence to open the contributing system claims and facts, so that I can audit the synthesis.
51. As a returning user, I want old results to retain their original system-policy fingerprints after an engine update, so that history is not silently rewritten.
52. As a user sharing a result, I want a compact card that excludes my exact birth data by default, so that I can share an insight without sharing the profile.
53. As a user, I want a blocked or unsupported system to show a specific reason and next action, so that an empty card is not mistaken for a failed prediction.

## Functional Requirements

### Four-system orchestration and eligibility

- The system registry must use stable IDs: `saju`, `horasat`, `tu-vi`, and `mahabote`. Display names and translations must not be used as storage keys.
- Each registry entry must declare policy status, required and optional inputs, supported range, engine/schema versions, source-data dependencies, unknown-time behavior, and native detail route.
- Eligibility must be derived before engine invocation and must not depend on narrative generation. The result is one of `ready`, `partial`, `needs-input`, `unsupported`, or `policy-blocked`, with a machine-readable reason code and Korean recovery copy.
- Calculation orchestration must run eligible systems independently. One system failure must not erase successful results from another system.
- `policy-blocked` systems must never call an engine or display a synthetic chart. A product demo may show a clearly labeled static explanation only, never a personalized result.
- The aggregate record must retain the original profile, normalized profile, per-system eligibility decisions, per-system immutable results, and an independently versioned comparison result.

### Cross-system comparison

- Every system interpretation claim must declare `systemId`, `domain`, `theme`, `stance`, plain-language summary, and valid native fact references.
- P0 stance values are `supports`, `cautions`, `mixed`, `neutral`, and `unavailable`. They describe how an interpretation frames a theme, not a probability or confidence in fate.
- A common theme requires at least two independent completed systems with the same domain, normalized theme, and compatible stance.
- A different theme requires at least two independent completed systems with the same domain/theme and opposing or materially mixed stances.
- A strict unique theme belongs to one system only after every requested comparable system has completed. If another requested system is blocked, failed, cancelled, or stale, the item is `partial-unique` and must be labeled `현재 계산된 체계에서만 보인 점`, not as a universal unique finding or system victory.
- The comparison engine must reject missing fact references, duplicate contributions from the same system, stale result fingerprints, and claims from inactive policies.
- The UI must show contributor count and system labels, but it must not show a consensus percentage, accuracy score, winner, ranking, compatibility score, or weighted truth claim.
- When fewer than two systems complete, the comparison is unavailable while the completed native result remains readable.
- The normative schemas, reason codes, route contracts, state transitions, and examples are defined in `docs/MULTI-ASTROLOGY-COMPARISON-SPEC.md`.

### Birth input and normalization

- The shared profile may accept any date that at least one active policy supports. Eligibility must evaluate the supported range per system; it must not reuse Saju's `1900-01-01..2100-12-31` range as a silent global rule.
- Lunar input must require an explicit regular/leap-month choice when both are possible.
- The app must preserve the original user input separately from normalized calculation values.
- The app must not infer a missing birth time.
- The app must explain the purpose of the traditional sex parameter and allow the user to omit it.
- The app must reject impossible dates and unsupported ranges before calculation.
- Korean birthplace selection must continue to resolve a full current official administrative or legal locality name, its 10-digit area code, coordinates, and `Asia/Seoul`. International input requires a display label, latitude, longitude, IANA time zone, and source provenance; ambiguous names must require a place choice.
- The result must keep routine storage, training, external-AI, and engine-version diagnostics out of the reading surface while retaining record deletion and calculation-source access.
- Before the first central submission, the app must display the service-storage categories, purpose, retention, processor, rights, and consequence of declining.
- A submission must identify whether the account user is the data subject or is entering another person's information.
- Original and normalized birth input must be stored separately with envelope encryption, integrity hashes, purpose-authorization receipt, and schema version.

### Calculation result

- One orchestration request may invoke several engines, but each engine call must independently produce one complete native result from normalized input plus exactly one active calculation-policy identifier.
- Every result must contain `systemId`, engine version, policy version, source-data version, result-schema version, input fingerprint, normalized inputs actually consumed, warnings, and native fact identifiers.
- The Saju result continues to include four pillars, supported ten-god relationships, hidden stems, five-element distribution, relations, and eligible cycles. Horasat, Tử Vi, and Mahabote must use their own policy-approved native structures defined by their result schemas.
- A required-input-dependent field or section must be omitted or marked unavailable when inputs are missing; a different system's result must not be used as a substitute.
- Unsupported or disputed derived concepts must not be represented as universally correct. If added, their rule set and school must be named.
- Recalculating identical input under identical versions must produce byte-equivalent structured facts.

### Boundary sensitivity

- Each engine must detect the calendar, time, place, day, star-placement, weekday, and other sensitivity boundaries declared by its active policy. Saju's solar-term and hour-branch boundaries remain one system-specific case.
- The UI must identify which output fields can change and why.
- When a nearby alternative produces a different chart, the user must be able to compare the changed fields without creating a second profile.
- The product must never hide a known boundary condition behind a generic confidence score.

### Reading

- Each native system report must contain a compact overview plus policy-approved sections selected from identity, work, resources, relationships, wellbeing, and timing. Native chart explanation may use additional system-specific sections.
- Each material sentence must reference at least one immutable fact identifier from the same system result.
- A user must be able to open an evidence chip and see the underlying fact in plain language.
- The renderer must distinguish calculated fact, traditional interpretation, product synthesis, and user-facing reflection.
- Time-dependent and daewoon-dependent sections must be suppressed or qualified when inputs are missing.
- The report must avoid medical, legal, financial, or mental-health diagnosis and categorical future claims.

### Annual reading and card-news output

- A single-chart user may choose an enabled target year from 2024 through 2026. A target is enabled only when reviewed KST minute fixtures cover its Ipchun, twelve month starts, next-year Xiaohan, and closing Ipchun. The annual year never silently begins on January 1.
- `ziping-annual-basic@1.1.0` uses only the natal day stem, natal month branch as context, visible annual/monthly stem ten-god relations, and the explicitly supported clash/six-harmony branch pairs.
- Gyeokguk, yongsin, strength scoring, johu, punishment/destruction/harm, special combinations, annual hidden-stem activation/weighting, and high-consequence predictions remain visibly excluded.
- Annual and monthly facts must use stable IDs and record label, value, detail, actual source kind/ID/version, and support status. Every interpretation rule records its required facts, prohibited/conflicting states, priority, claim categories, copy variants, and safety/suppression behavior. Missing facts suppress only dependent rules.
- A valid default deck contains exactly eight renderer-independent `annual-card.v1` objects in the order cover, overall, work, money, relationships, growth, action, and method.
- Monthly flow is a separate 12-entry solar-term disclosure. Every entry carries pillar/boundary/interpretation evidence IDs, rule provenance, boundary sensitivity, and an explicit unsupported state; it is not appended to the default eight-card deck.
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

- IndexedDB is the canonical guest/local profile history. The governed PostgreSQL account path is optional, feature-gated, and must remain `local-only` until the separate legal/security launch gates pass.
- Stored profiles must include original input, calculation versions, source authorization/consent evidence, data-subject relationship, and processing state.
- Deleting a profile must remove local data immediately and start an idempotent server deletion workflow covering derived content, processors, datasets, and model-impact review.
- Structured export must separate chart facts from optional narrative content.
- Export must not include analytics identifiers or hidden model metadata.

## Calculation Policy Requirements

The implemented Saju baseline uses `KR-CIVIL-1.0`, a named Korean legal civil-time policy with no hidden longitude correction. The locked conventions and source evidence are recorded in `docs/NATAL-CALCULATION-POLICY.md`.

The expansion uses `docs/CALCULATION-POLICY-REGISTRY.md` as the only activation registry. A Horasat, Tử Vi, or Mahabote entry remains `draft` or `blocked` until its calculation school, inputs, transformations, source/license provenance, independent expected-value fixtures, boundary tests, and qualified review are approved. A live third-party result may be a comparison fixture or UX reference, but it cannot be the sole calculation oracle.

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

- The product will have five strict layers: shared input normalization, independent deterministic system engines, system-native interpretation facts/rules, deterministic cross-system comparison, and optional generative wording.
- The calculation core will be framework-independent and executable in both the browser and a test runner.
- The natal web interface calls its calculation core locally. The annual slice uses the same-origin deterministic `/v1/annual-readings` adapter so the pinned ephemeris implementation and content hash remain centralized; cached saved results and client rendering remain available offline.
- A high-level orchestrator accepts a normalized profile plus requested system IDs, derives eligibility, invokes only active eligible policies, and returns independent versioned result envelopes without merging native facts.
- Structured chart facts will have stable identifiers so the report, AI output, feedback, and regression tests can reference the same evidence.
- Source calendar or ephemeris data must carry provenance, license, version, covered range, and generation method. An undocumented CSV cannot be a production source.
- AI access will pass through a server-side narration gateway so provider credentials, consent enforcement, payload minimization, safety checks, and retention controls remain centralized.
- The narration gateway will reject responses that mutate immutable chart facts or omit required evidence references.
- IndexedDB will provide a versioned cache and purpose-receipt-bound submission outbox. `localStorage` will not hold birth profiles, content, authorization evidence, or tokens.
- The implemented governed account path uses PostgreSQL behind an explicit fail-closed feature boundary. Local IndexedDB remains sufficient for the guest comparison experience; enabling account persistence does not change calculation semantics.
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
| Chart Calculation | System registry, normalized profile projection, calculation policy, native system result, native fact, boundary sensitivity | Pure deterministic engines; cannot call an LLM or depend on UI/database frameworks |
| Interpretation | System-specific rule-set version, native reading block, evidence link, uncertainty marker | Can reference immutable facts from the same system but cannot mutate them |
| Comparison | Normalized domain/theme taxonomy, system claim, comparison group, contributing evidence | Cannot calculate native facts, rank systems, or accept claims without valid immutable references |
| Consultation | Conversation, AI request/response, prompt/model version, safety outcome | Must use the fixed chart-fact contract and pass through consent/policy gates |
| Privacy and Governance | Consent, purpose, retention, processing event, deletion workflow, privileged audit | Authoritative for whether processing is allowed; does not own model quality labels |
| Learning and Model Governance | Feedback, review label, dataset snapshot/member, model run and artifact decision | Can read only approved projections; never reads the production PII vault directly |

Each context exposes application commands, queries, and versioned events. Cross-context code passes stable identifiers and immutable facts rather than reaching into another context's tables. Events that leave their originating transaction use a transactional outbox and idempotent consumers. A shared kernel is limited to identifiers, timestamps, version references, and error/result primitives. The first deployment remains one repository and one server application unless measured scaling or isolation needs justify extraction.

## Data Storage Architecture

The product uses three storage boundaries:

| Boundary | Technology | Stores | Must not store |
|---|---|---|---|
| User device | IndexedDB | Canonical guest profile, eligibility decisions, independent system results, comparison result, purpose receipt, optional sync outbox, settings | Server credentials or unregistered training exports |
| Operational server | Managed PostgreSQL | Encrypted birth records, results, readings, conversations, feedback, purpose authorization/consent, processing, deletion, and dataset/model metadata | Plaintext secrets or browser-readable vault data |
| Training storage | Encrypted object storage | Approved pseudonymized immutable dataset snapshots and manifests | Account identity or unregistered raw database exports |

Calculation engines, policies, lookup tables, and ephemeris assets remain versioned application artifacts. A local calculation is a durable local record once its IndexedDB transaction commits. If account sync is enabled later, local and remote persistence states are shown separately and a failed sync does not invalidate a completed deterministic result.

The optional account schema remains standard PostgreSQL and must preserve existing encryption, RLS, ownership, restore, deletion, and fail-closed controls. Provider selection is operational and must not leak into the domain result contracts.

Stored operational data is not automatically training data. Eligibility is re-evaluated when a dataset is built using current purpose consent, data-subject authority, age/minor rules, correction/deletion state, PII and safety screening, quality status, and model objective.

Detailed external, conceptual, and internal schemas, retention, indexes, concurrency, capacity, and recovery targets are defined in `docs/DATA-ARCHITECTURE.md`.

## Data Model Decisions

The product will maintain these conceptual records:

- **Birth Input:** original calendar type, date, time or unknown flag, place identifier, time-zone identifier, optional coordinates, and optional traditional sex parameter.
- **Normalized Birth:** resolved civil time, UTC instant when available, conversion metadata, and validation warnings.
- **System Registry Entry:** stable system ID, display metadata, policy status, required inputs, supported range, detail route, and active policy reference.
- **Eligibility Decision:** profile fingerprint, system ID, state, missing fields, reason codes, policy status, and evaluation version.
- **Calculation Policy:** stable identifier, version, named conventions, and source-data versions.
- **System Result:** immutable system-native chart, facts, sensitivity findings, interpretation claims, engine/policy/source/schema versions, calculation fingerprint, and creation timestamp.
- **Native Fact:** system-scoped stable fact identifier, category, structured value, dependencies, and provenance.
- **System Claim:** domain, normalized theme, stance, system-native summary, evidence fact identifiers, and interpretation rule version.
- **Comparison Result:** source result fingerprints, taxonomy/comparison versions, common/different/unique groups, rejected-claim diagnostics, and creation timestamp.
- **Comparison Item:** group, domain, theme, neutral summary, contributing system claim references, and unavailable-system context.
- **Chart Result / Chart Fact:** retained aliases for the existing Saju result contract during migration; new cross-system code must use the system-scoped records above.
- **Annual Reading:** target year, Ipchun range and boundary flags, natal chart engine/policy provenance, annual policy/ephemeris source, interpretation profile/rule-set versions, annual and monthly facts, eight cards, separate monthly flow, claim trace, suppressed/unsupported states, and content hash. It extends rather than overwrites a natal chart result and round-trips as one complete versioned object.
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

Raw birth data, coordinates, native chart strings, comparison prose, and AI free text are prohibited from analytics records.

## Safety and Trust Requirements

- The service must state that Saju, Horasat, Tử Vi, and Mahabote are traditional interpretive practices, not scientific predictions or substitutes for professional advice.
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

- Registry tests proving only `active` policies can execute and draft/blocked policies return stable reason codes.
- Eligibility matrix tests for exact time, unknown time, missing coordinates, calendar variants, sex-parameter omission, unsupported ranges, and Wednesday time distinctions where an approved Mahabote policy requires them.
- Independent golden and boundary fixture suites for every active system. Cross-library agreement or matching `horasat.kr` alone is not sufficient expected-value evidence.
- Orchestration tests proving one engine error does not discard other completed results and retries do not duplicate immutable result envelopes.
- Comparison tests for same theme/same stance, same theme/opposing stance, mixed stance, unique theme, unavailable systems, duplicate contributors, invalid evidence IDs, stale fingerprints, and fewer than two completed systems.
- Contract tests proving a common/different item has at least two distinct contributing system IDs and every contribution resolves to a native fact chain.
- Negative tests proving no score, percentage, winner, ranking, or generated substitute appears in structured output or rendered comparison states.
- Authoritative golden fixtures for ordinary dates.
- All 12 policy-changing `jie` term boundaries at minus one minute, exact boundary, and plus one minute; the complete 24-term authoritative fixture set remains source-versioned and integrity-checked for the annual engine.
- Every enabled annual target's Ipchun at minus one minute, exact boundary, and plus one minute, plus the next-year Xiaohan-to-Ipchun closing month.
- Lichun cases where year and month pillars can change.
- Lunar new year, regular/leap month entry and exit, and lunar month-end conversion.
- 23:00, 23:30, midnight, 00:30, and 01:30 cases under the approved day/hour policy.
- Historical Korean clock-offset transitions covered by the supported date range.
- Unknown birth time and omitted traditional sex parameter.
- Determinism across browser locale, host time zone, and repeated execution.
- Boundary-sensitivity warnings and alternative-result comparisons through the rendered user flow.
- Local cache/outbox creation, migration, clearing, and offline restoration against the canonical server profile.
- IndexedDB schema upgrade and rollback behavior, including interruption during migration.
- Lossless annual-result round-trip through IndexedDB, SQLite compatibility migration, and privacy-safe JSON export.
- Per-rule missing-fact suppression, clash-over-harmony priority, rule-version fingerprint changes, and complete card/month claim traces.
- Annual training withdrawal preserving the service result and submission deletion cascading to the annual row.
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

Allowed events include onboarding viewed, system explainer opened, eligibility evaluated, missing-field prompt viewed, system calculation started/completed/failed by system ID and coarse reason, comparison completed, comparison group opened, native detail opened, method panel opened, evidence chip opened, privacy-safe share invoked, AI consent accepted or declined, profile saved, and profile deleted.

Events may contain only coarse product state such as requested/eligible/completed system IDs, calendar type, unknown-time flag, boundary-warning flag, engine version, policy version, comparison group, and coarse failure category. They must not contain exact dates, exact times, places, coordinates, names, free text, native chart strings, comparison prose, or device-local profile identifiers.

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
20. One profile submission produces an eligibility state and reason code for all four registered systems before calculation begins.
21. No draft or blocked policy can produce a personalized completed result through UI, API, cached record, import, or retry.
22. Every eligible active engine passes its own independent ordinary and boundary fixture suite and returns a schema-valid immutable result envelope.
23. One engine failure leaves other successful native results readable and makes retry scope explicit.
24. Every common or different comparison item references at least two distinct completed systems; every contribution resolves through a system claim to native facts in the same immutable result.
25. Fewer than two completed systems yields no comparison result and does not hide the available native result.
26. No comparison screen, export, API response, share image, or analytics event contains an accuracy, fate, consensus, compatibility, or confidence score.
27. Unknown time and missing place/coordinate fixtures produce the documented per-system eligibility states without inferred inputs.
28. A shared result excludes exact birth date, time, coordinates, profile label, and record ID by default.
29. The complete mobile and desktop journey in `docs/MULTI-ASTROLOGY-COMPARISON-SPEC.md` passes manual matching-surface QA with four completed systems, partial eligibility, one engine error, and all-policy-blocked states.

## Out of Scope

- Western natal astrology, tarot, numerology, naming, practitioner matching, and fear-based remedies.
- Two-person × four-tradition compatibility, social feeds, public birth profiles, and daily notification loops in expansion P0.
- A marketplace for practitioners, talismans, rituals, or paid fear-based remedies.
- Medical, legal, financial, fertility, or mental-health diagnosis.
- A promise of scientific validity or universally correct Saju interpretation.
- Multiple simultaneous schools within one tradition at initial expansion launch; P0 activates one explicitly named policy per system.
- Social feeds, public profile sharing, and user-generated public readings.
- Native mobile applications, subscriptions, and payment processing.
- Copying Orrery's AGPL source or calendar data with unresolved provenance into a closed-source product.
- Training a general-purpose model unrelated to the disclosed Saju product purposes.
- Training directly from production tables, backups, logs, analytics, or unregistered local exports.

## Dependencies and Launch-Blocking Decisions

- Seek an additional qualified-domain review before introducing daewoon, apparent-solar-time, or school-specific calculation variants; `KR-CIVIL-1.0` deliberately excludes them.
- Name a qualified reviewer and approve an explicit calculation-school decision record for Horasat, Tử Vi, and Mahabote separately.
- Acquire or create independently reviewable expected-value fixtures and boundary cases for each new policy; product screenshots and agreement between consumer apps are secondary evidence only.
- Resolve source-code and table-data licenses before copying any implementation or lookup table. Product flows and visual grammar may be referenced without copying assets or proprietary calculation data.
- Add another official fixture range before claiming authoritative solar-term validation outside 2024–2027.
- Decide whether the product will remain closed source; this determines which external code can be reused.
- Select an AI provider and confirm payload retention, regional processing, and deletion terms before enabling chat.
- Keep the existing governed PostgreSQL/KMS/Cognito account path fail-closed until its named operator, legal, security, region, retention, RLS/grant, and restore-test gates pass.
- Approve the purpose-specific service storage, external AI, human review, and model-training notices after Korean privacy counsel review.
- Approve retention, minors, third-party data, cross-border transfer, withdrawal, deletion, dataset, and model-impact policies.
- Select encrypted object storage, KMS ownership, pseudonymization pipeline, and isolated review/training environment.
- Define the first model objective and the exact labels required; raw collection alone is not a training strategy.
- Approve the final product name and brand tone before public launch.

`Saju App` remains a working product name. The Korean legal civil-time and no-longitude-correction conventions are versioned `KR-CIVIL-1.0` product decisions rather than hidden assumptions.

## Delivery Milestones

### Milestone 0: Registry, source, and oracle lock

- Stable system IDs, shared profile schema, eligibility states, native result envelope, comparison-claim schema, and error codes frozen.
- Horasat, Tử Vi, and Mahabote each have a named policy decision owner, approved school/conventions, source/license manifest, independent expected-value fixtures, and boundary-test plan.
- No draft policy is callable from production or demo personalization routes.

### Milestone 1: Shared profile and orchestration shell

- Existing Saju regression suite stays green while the shared normalized profile and system registry are introduced.
- Progressive input, eligibility preview, independent task states, partial success, retry, cancellation, and IndexedDB aggregate migration are implemented.
- Method disclosure and policy-blocked screens work on mobile and desktop without pretending that the new engines exist.

### Milestone 2: Native engines and detail views

- Each new engine is implemented behind its registry status and activated one at a time only after its own oracle suite passes.
- Each system has immutable native facts, evidence-linked interpretation claims, sensitivity states, method panel, export contract, and responsive native detail view.
- Failure or rollback of one system does not mutate Saju or another system's saved result.

### Milestone 3: Evidence-bound comparison

- Domain/theme taxonomy, deterministic grouping, rejected-claim diagnostics, provenance drawer, and common/different/unique views are implemented.
- Schema, unit, integration, property, and rendered-state tests prove every comparison item resolves to immutable system evidence and contains no scoring or ranking.
- Privacy-safe sharing and JSON export pass forbidden-field scans.

### Milestone 4: Closed beta and public gate

- Four-complete, partial-input, one-engine-failure, stale-policy, imported-old-record, and all-blocked journeys pass matching-surface QA at representative mobile/tablet/desktop widths.
- Domain reviewers sign the active policy decisions; accessibility, privacy, performance, security, provenance, rollback, and content-safety gates pass with fresh evidence.
- The existing account-storage legal/security launch gate remains independent; the four-system local experience must not silently enable cloud persistence.

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
| False equivalence across traditions | Misleading comparison and loss of domain meaning | Preserve native facts; compare only normalized interpretation claims with visible contributors |
| Unverified new calculation rules | Personalized but incorrect charts | Keep policies blocked until source, license, expert decision, independent oracle, and boundary gates pass |
| Partial input silently filled | Fabricated certainty and irreproducible results | Per-system eligibility reasons; never infer time/place/sex/calendar state |
| Comparison becomes a popularity vote | Users mistake agreement for truth | No scores, weights, winners, percentages, or truth language; retain disagreements |
| Four engines overwhelm the first result | High abandonment | Progressive input, eligibility preview, fast comparison overview, then opt-in native detail |

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
- Which named school and source hierarchy will the first active Horasat, Tử Vi, and Mahabote policy use?
- Who signs each new policy decision and independently reviews expected-value fixtures?
- Which Korean product name communicates comparison without implying that four traditions are scientifically equivalent?
- Is the free value the complete comparison overview, with paid products limited to deeper native reports and time-cycle content rather than withheld method evidence?

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
- [Horasat live reference](https://horasat.kr/) — product and interaction reference only, not a calculation oracle
- [Co–Star App Store](https://apps.apple.com/us/app/co-star-personalized-astrology/id1264782561) — personalized result, social comparison, daily return, and paid depth reference
- [CHANI App Store](https://apps.apple.com/us/app/chani-your-astrology-guide/id1532791252) — accessible explanation, reflective routine, audio/content-depth reference
- [Finch App Store](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748) — adjacent-category quick check-in and gentle return-loop reference
- [포스텔러 Google Play](https://play.google.com/store/apps/details?hl=ko&id=com.un7qi3.forceteller) — Korean multi-content catalog and onboarding-loop reference
- [점신 Google Play](https://play.google.com/store/apps/details?hl=ko&id=handasoft.mobile.divination) — Korean daily report and relationship-record reference

The detailed engine review is stored in `docs/reference-review.md`; the central storage design is in `docs/DATA-ARCHITECTURE.md`; training-use rules are in `docs/TRAINING-DATA-POLICY.md`.

## Definition of Done

This PRD documentation phase is complete when the product, design, data, comparison, and policy-registry documents use the same system IDs, states, contracts, and release gates; every P0 requirement maps to a screen/API/schema/test item; and no implementation work needs to invent product behavior. Runtime completion is a later milestone and requires all three new calculation policies, engines, fixtures, comparison behavior, accessibility, privacy, and matching-surface QA to pass.
