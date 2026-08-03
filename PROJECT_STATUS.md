# Project Status: Saju App

| Field | Value |
|---|---|
| Status date | 2026-08-04 |
| Project root | `D:\\codings\\260801_saju-app` |
| Current phase | PR #2 annual-reading implementation complete and merge-ready; launch-policy prerequisites remain |
| Application code | Implemented in `index.html` with PWA shell |

## Current Objective

Complete and verify Issue #1: a bounded Ziping-derived annual profile, deterministic Ipchun facts, evidence-linked eight-card output, separate monthly flow, privacy-safe export, and compatible browser/server storage contracts.

## Decisions in Force

- Deliver one responsive web application/PWA with mobile-first UX and deliberate desktop layouts.
- Begin with a modular monolith and pragmatic DDD boundaries for identity/profile, chart calculation, interpretation, consultation, privacy/governance, and learning/model governance.
- Treat PostgreSQL as the production canonical operational store; use local SQLite for development durability and browser IndexedDB as cache/offline outbox.
- Centrally retain submitted inputs, calculated facts, readings, conversations, feedback, consent evidence, and processing lineage under declared purposes and retention rules.
- Keep service operation, external AI processing, first-party model training, and human review as separate purposes.
- Require specific, versioned, optional, revocable permission before a record becomes eligible for first-party product-learning use. The prototype starts that choice unchecked and provides the same chart and reading when it is declined.
- Build training datasets only from approved pseudonymized projections. Raw production tables and ad hoc exports are not training interfaces.
- Keep the chart engine deterministic and versioned. An LLM may explain fixed chart facts but must not calculate or mutate the four pillars.
- Trace every material interpretation to immutable chart-fact identifiers.
- Preserve source-to-dataset-to-model lineage and make withdrawal/deletion trigger dataset and model-impact review.

## State by Evidence Level

### Intended

- Responsive web/PWA product behavior, personal/couple user flows, calculation contract, and acceptance criteria in the PRD.
- PostgreSQL, encrypted PII vault, object-storage dataset snapshots, key management, row-level security, backup, restore, and deletion architecture.
- Consent, training eligibility, pseudonymization, labeling, dataset review, model registry, and withdrawal controls.

### Implemented

- Product, reference-review, data-architecture, training-governance, and design-system documents are present.
- `DESIGN.md` records the locked 조선의 저녁 달빛 direction; the implementation uses an indigo evening sky, warm hanji sheets, a low moon, roofline silhouette, moon-gold actions, 천간·지지 labels, and Korean-first copy.
- The superseded browser-only data architecture is retained in `docs/archive/` for decision history.
- `index.html`, `manifest.webmanifest`, `service-worker.js`, `icon.svg`, and `DESIGN-SYSTEM.md` implement the first runnable product slice.
- The first CTA remains actionable before consent. If the required service-storage acknowledgement is missing, it stays on the introduction, exposes the detailed notice, announces a specific error, and focuses the notice heading. Product-learning use is a separate optional choice.
- Calculation creates one stable IndexedDB record and one `/v1/submissions` request. Rule-based follow-up questions update that same record without another submission request. The data screen lists saved readings and supports reopen, JSON export, confirmed single delete, confirmed clear-all, and optional-training withdrawal.
- `index.html` now exposes explicit `내 사주` and `커플 사주` modes. Couple mode captures relationship state, separate self/partner birth inputs, a start-stage partner-authority disclosure, paired chart sheets, and descriptive comparison evidence without a compatibility score. The repeated partner checkbox was removed from the birth form, the submit action now reads `두 사람의 사주풀이 시작하기`, and input sections sit side by side from 1000px while stacking on smaller screens.
- `server/` implements a dependency-free HTTP ingestion adapter with purpose, authority, and training-projection gates.
- `server/` exposes submission-scoped `DELETE /v1/submissions/:id` and `POST /v1/submissions/:id/training-withdrawal` operations for the local SQLite development store. Missing records return 404 and non-durable adapters reject lifecycle mutation.
- `server/` now exposes `/v1/calendar/convert` using pinned `lunar-javascript@1.7.7`, accepts lunar/윤달 input through the UI, and persists accepted submissions to local `data/saju.sqlite` with original and normalized birth payloads.
- `server/` validates `partnerSubject`, `partnerBirthInput`, and a separate partner service-storage receipt for couple submissions, and keeps couple records out of the self-only training projection until a separate partner-purpose policy exists.
- Copyguard hardening is implemented: compliant AI crawler opt-out files, `noai` metadata, canary fingerprint, copyright notice, frame-embedding headers, restrictive response headers, and a bounded in-memory rate limit on ingestion endpoints.
- Birthplace input now combines the Ministry of the Interior and Safety `KIKcd_H` and `KIKcd_B` snapshots effective 2026-07-20 into 21,836 unique current administrative and legal locality names. Each field reveals a filtered native selection control below the search input. Search keys are precomputed and results are collected in ranked bounded buckets, so typing no longer sorts the whole catalog on every keystroke. Unique short names such as `문현동` resolve automatically, ambiguous names such as `삼성동` expose every matching city/district, and broad queries such as `해운대` explain that the first 20 results are shown. The stored value includes the full name and official 10-digit code. The current chart policy still records `Asia/Seoul`.
- Deterministic readings now provide eight single-chart chapters and seven couple-chart chapters. Visible-stem ten-god relationships and branch hidden stems are calculated relative to each day stem and linked through stable fact identifiers. Daewoon remains explicitly unavailable until its direction and start-age policy are approved.
- The result reading is one continuous hanji report with native collapsible chapters and seal-style evidence controls. The first chapter opens by default, disclosure state survives evidence inspection, and mobile long-value wrapping no longer expands the page horizontally.
- Reading chapters now use a fixed reader-first order: `한눈에 보기`, `쉽게 풀어보면`, `오늘 해볼 일`, and `생각해볼 질문`. The Korean copy uses shorter direct sentences and calculated particles for dynamic stems/elements. Reading text is 17px by default and 19px in the user-controlled large-text mode.
- Routine storage, training, external-AI, and engine-version metadata no longer appears as a result-side status card. Record deletion remains available under `계산 원칙`, and storage behavior is unchanged.
- The question area is a deterministic rule-based organizer, not an AI chat. It produces conditional, reader-first prompts for work, relationship, money, health, or general questions and does not send the question to an external provider.
- Navigation now has distinct method and data screens, active current-page states, and a stage contract that restores heading focus at scroll position zero. The service worker uses cache `saju-app-shell-v9`, precaches both annual client modules, retains network-first navigation and a canonical offline shell fallback, and does not eagerly precache the birthplace catalog.
- Start-screen consent controls now appear as two full-width cards stacked vertically. Each entire card is clickable, the checkbox target is 22px, and keyboard focus receives a visible ring.
- The official shadcn/ui, Aceternity UI, Magic UI, 21st.dev, and React Bits catalogs were reviewed. Their interaction and motion patterns are recorded in `DESIGN.md`; no React/Tailwind migration or decorative dependency was added to the vanilla prototype.
- `db/migrations/001_initial_contract.sql` defines the PostgreSQL bounded-context storage contract, encrypted vault boundary, governance receipts, processing lineage, transactional outbox, and training lineage tables.
- `server/domain/annual-ephemeris.mjs` implements the source-versioned 2024–2027 KST minute fixtures that enable target years 2024–2026. `server/domain/annual.mjs` and `annual-rules.mjs` implement `KR-ANNUAL-IPCHUN-1.1`, `ziping-annual-basic@1.1.0`, structured annual/monthly facts and rules, selective suppression, clash priority, claim traces, explicit hidden-stem exclusion, and a version-sensitive SHA-256 content hash.
- `annual/client.mjs` keeps annual request construction, lossless privacy-safe export, programmatically focusable card/document/monthly rendering, and evidence controls outside the inline natal engine. `annual/storage.mjs` owns injectable IndexedDB transactions. Single-chart input selects only 2024–2026; couple mode remains natal-only.
- `server/http.mjs`, `server/domain/submission.mjs`, SQLite, and the PostgreSQL contract require complete chart/annual provenance and persist the full annual object without replacing the natal chart result. SQLite compatibility migration is additive, foreign-key cascade is active, and withdrawal removes only the training projection.
- `tests/server/ingestion.mjs` verifies the adapter contract without requiring a live database.

### Verified

- Active product documents consistently define PostgreSQL as the canonical store and IndexedDB as cache/outbox.
- Active documents separate required service storage from optional product-learning permission. Declining learning use follows the same deterministic path.
- The data architecture contains external, conceptual, browser, and PostgreSQL schemas plus domain ownership, integrity, indexing, RLS, retention, capacity, backup, security, and delivery gates.
- The PRD and data architecture agree on the six pragmatic DDD bounded contexts and transactional-outbox rule.
- The prototype renders the reference golden fixture `1990-10-10 14:30` as `庚午 · 丙戌 · 戊申 · 己未`.
- Mobile, tablet, and desktop screenshots were inspected after loading the local web server.
- The training policy defines eligibility, prohibited uses, dataset lineage, withdrawal, and model-impact handling.
- The active documents consistently require a canonical central store and governed, stateful AI records.
- The browser outbox calls `/v1/submissions`; the local SQLite adapter returns `durable: true` after persistence, while an adapter without storage still returns `durable: false` and leaves the record in the outbox.
- Couple mode was smoke-tested through the browser flow with authority acknowledged at the start gate and no repeated form checkbox; the adapter contract test accepts the separate partner payload and returns `trainingEligible: false`.
- Copyguard verification checked the live `/health` response headers and served `robots.txt`/`copyright.html`; no public read/list endpoint exposes stored birth records.
- The live mobile flow verified an initially empty birthplace field, dynamic search across 21,836 current localities, `문현동` resolving to `부산광역시 남구 문현동`, and `삼성동` revealing five labeled choices before `서울특별시 강남구 삼성동` was selected. The selected value persisted after another control re-rendered and appeared in the result without horizontal overflow.
- Live browser QA measured the synchronous `해운대` input update at 3.6ms on the 390px test viewport, showed the first 20 results immediately, and reported zero horizontal overflow. The same flow verified two-column couple input at 1024px, stacked input at 390px, the revised submit label, two result charts, seven reading chapters, and no console error.
- Consent-card QA at 1280px and 390px verified vertically stacked full-label controls, 22px checkbox targets, entry after service acknowledgement alone, an initially unchecked optional-learning choice, zero horizontal overflow, and no console error.
- Browser flows verified single and couple calculation at 390px: eight and seven reading chapters respectively, one chapter open by default, two couple chart sheets, ten-god/hidden-stem evidence, no compatibility score, and `scrollWidth === clientWidth` after expanding long evidence.
- Browser QA also verified lunar input conversion, the calculation/data/new-start navigation actions, 48px birthplace input height, no console errors, and readable ink contrast on the hanji chart at 390px and 1280px.
- Durable visual evidence is stored under `/home/honey/.gstack/projects/260801-saju-app/designs/design-audit-20260802/screenshots/`.
- Browser QA verified 17px reading copy, 19px large-text mode, no storage-status panel, one retained delete control, and zero horizontal overflow at 320px, 390px, 768px, 1024px, and 1440px. Single and couple flows rendered eight and seven chapters with no console errors.
- Fresh post-cleanup `npm test` passed: chart/UI smoke (113 assertions), record lifecycle (33 assertions), and ingestion/storage contract (34 assertions), for 180 assertions total.
- Annual unit tests verify every enabled target's Ipchun at -1 minute, exact, +1 minute, and closing boundary; the following-year Xiaohan month; `甲子` across a 60-year boundary; structured rule fields; per-rule suppression; clash priority; annual/month fact/rule/claim traces; mandatory chart provenance; hidden-stem exclusion; deterministic hash behavior; focusable markup; and privacy-safe lossless export.
- Fresh 2026-08-04 `npm test` passed 315 assertions: annual policy/client (82), chart/UI smoke (128), record lifecycle (44), and HTTP/SQLite ingestion (61). The run includes exact annual object round-trips through the injected IndexedDB boundary and SQLite, legacy SQLite additive migration, annual training withdrawal retention, and deletion cascade.
- Implementation commit `127c99a` was pushed to PR #2; GitHub Actions `verify` passed and GitHub reported the PR as mergeable. Parallel native standards/spec reviewers failed at the encrypted tool-output transport boundary, so the leader completed the documented fallback review against Issue #1 and the three owner review comments without finding a remaining code blocker.
- Fresh Chromium QA created, saved, reopened, and deleted the 2026 annual reading. The IndexedDB object and reopened UI retained the same content hash; next-card navigation moved focus to the active card with a visible gold focus ring; reduced-motion computed a 0.01ms transition; print hid natal/monthly/private content; and no console errors occurred.
- Live overflow checks returned zero at 320, 390, 768, 1024, and 1440px. Mobile exposed one active card, while tablet/desktop exposed all eight in document order. Detailed evidence is in `devlog/_plan/260804_pr2_annual_reading_completion/030_browser_qa.md`.
- A freshly restarted local server returned `{"status":"ok","service":"saju-ingestion-adapter","persistence":"sqlite","durable":true}`.
- Post-cleanup browser QA verified one initial application request before optional font subsets, one lazy birthplace-catalog request only after entering birth input, one submission POST per calculation, no network request for rule-based questions, and no console errors.
- Mobile QA verified the missing-service guard, service-only calculation, `문현동` resolution, 17px/19px reading modes, one reopened conversation record, method/data/home focus at scroll zero, confirmed clear-all, training withdrawal, and deletion. Desktop QA verified self-left/partner-right input and result sheets, `삼성동` ambiguity selection, seven couple chapters, no compatibility score, and no result-side storage/engine panel.
- Phase 3 screenshots were opened and visually inspected: `devlog/_plan/260802_saju_audit_remediation/phase3-mobile-result.png`, `phase3-mobile-records.png`, `phase3-desktop-couple-input.png`, and `phase3-desktop-couple-result.png`.

### Not Yet Verified

- No managed PostgreSQL/KMS/identity provider, production AI provider, or training pipeline has been implemented. Local SQLite is durable for development but is not production infrastructure.
- The current chart engine is an explicitly labeled demo policy and must not be treated as the production calendrical oracle.
- Annual targets outside 2024–2026 are deliberately unavailable. A later year requires a complete reviewed target/closing fixture set before the enabled range changes. `lunar-javascript@1.7.7` remains only for the separate lunar-date conversion path.
- The birthplace catalog represents current administrative and legal 동·읍·면·리 names as of 2026-07-20. Historical boundary/name resolution and overseas birthplace support remain outside this prototype policy.
- Couple storage is structurally separated and local SQLite submissions can be deleted. Production account ownership, partner-subject authorization, subject-wide deletion/withdrawal, durable PostgreSQL, and downstream processor/dataset erasure are not implemented.
- Legal references are source-backed, but the resulting product rules still require Korean privacy counsel review before collection begins.
- Natal calculation conventions and launch golden fixtures have not been approved. The bounded 2024–2026 annual Ipchun fixture set is reviewed and implemented separately.

## Open Launch Prerequisites

1. Approve the natal calculation policy: calendar conversion, civil/solar time, day boundary, hour boundary, daewoon direction, and supported birth-date range.
2. Approve data-controller/processor roles, hosting region, retention periods, minor handling, third-party data rules, cross-border transfers, and user-facing notices.
3. Select the first training objective and its eligible feature/label schema; do not collect an undefined blanket training grant.
4. Select PostgreSQL, object storage, key-management, identity, AI-provider, and observability vendors.
5. Wire the adapter to managed PostgreSQL/KMS/identity, then add idempotent durable persistence and deletion workflows.

## Verification Evidence

- Document structure and cross-document terminology checked on 2026-08-01.
- Active-document stale-claim scanning excludes the archived v0.1 design and checks for superseded storage and AI-retention requirements.
- Required architecture and training-governance sections are present.
- Verification includes fresh automated tests, local-server annual rendering, evidence/card/monthly interactions, privacy checks, responsive overflow measurements, and mobile/desktop screenshots; it is not evidence of production infrastructure.
- Central-ingestion verification includes `npm test`, which runs the chart smoke test and HTTP purpose/authority validation against an ephemeral local adapter.

## Exact Next Required Action

Review and merge PR #2, then resolve the remaining natal calculation and legal/data-controller choices before wiring `server/` to PostgreSQL/KMS/identity and freezing a specific product-learning objective.
