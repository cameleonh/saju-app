# Saju App

Korean-first personal and couple Saju web app focused on transparent calculation, readable evidence-linked interpretation, pragmatic DDD boundaries, and purpose-specific data controls.

## Current State

- **Intended:** One responsive web app/PWA with mobile-first UX, full desktop support, an approved deterministic chart engine, evidence-linked reading, and governed production storage under purpose-specific controls.
- **Implemented:** A zero-dependency mobile-first web/PWA prototype in `index.html` with `내 사주` and `커플 사주`, relationship state, start-stage partner-authority disclosure, wide-screen left/right couple input, stacked mobile input, paired deterministic demo charts, method provenance, boundary warnings, evidence controls, a deterministic rule-based question helper, IndexedDB record/outbox, JSON export, deletion, clear-all, optional-training withdrawal, manifest, and service worker.
- **Implemented:** A central-ingestion server in `server/` with purpose/authority validation, lunar conversion, durable local SQLite storage (`data/saju.sqlite`), training projection minimization, HTTP contract tests, and a versioned PostgreSQL schema contract in `db/migrations/`.
- **Implemented:** Searchable birthplace selection with 21,836 unique current 행정동 and 법정동·리 names from the official 2026-07-20 snapshot, automatic resolution for unique names such as `문현동`, and an explicit city/district selector for ambiguous names such as `삼성동`. Search avoids sorting the full catalog on each keystroke and broad terms such as `해운대` show the first 20 matches with narrowing guidance. The app persists the full name and 10-digit code. Reading copy is 17px by default with a 19px large-text mode, and routine storage metadata stays out of the reading screen while record deletion remains available.
- **Implemented:** Copyguard hardening in `robots.txt`, `ai.txt`, response security headers, a content canary, rate-limited ingestion endpoints, and a copyright notice. This raises scraping/clone cost and improves evidence; it does not make rendered browser content impossible to copy.
- **Consent behavior:** The service-storage acknowledgement is required. Product-improvement learning is optional, starts unchecked, and declining it provides the same chart and reading. No question is sent to an external AI provider.
- **Verified:** The 1990-10-10 14:30 golden fixture renders `庚午 · 丙戌 · 戊申 · 己未`. The full local suite currently covers 113 chart/UI smoke assertions, 33 record-lifecycle assertions, and 34 ingestion assertions.
- **Prototype boundary:** Local development persists accepted submissions to `data/saju.sqlite` and returns `durable: true`; production PostgreSQL/KMS/identity wiring remains pending. The UI posts one stable submission per calculation, retains failed requests in the IndexedDB outbox, and patches the same record when questions are added. Couple submissions require separate partner subject/authority data and are not eligible for the self-only training projection. Lunar conversion is pinned to `lunar-javascript@1.7.7` with source/version stored alongside the original lunar input.
- **Open prerequisites:** Approve the launch calculation policy, calendar-data provenance, privacy/legal basis, consent text, retention, minors/third-party rules, and first training objective.

## Documents

- [Product Requirements Document](PRD.md)
- [Design System](DESIGN-SYSTEM.md)
- [Design Direction](DESIGN.md)
- [Project Status and Decisions](PROJECT_STATUS.md)
- [Reference and Engine Review](docs/reference-review.md)
- [Data Architecture](docs/DATA-ARCHITECTURE.md)
- [Training Data Policy](docs/TRAINING-DATA-POLICY.md)
- [Copyguard Hardening](docs/COPYGUARD.md)

## Next Required Action

Replace the demo chart engine with the approved calendrical oracle and migrate the durable local SQLite store to managed PostgreSQL/KMS/identity for production.

## Run locally

Run the combined local app and ingestion adapter:

```bash
npm start
```

Then open `http://127.0.0.1:4174/`. Add `?demo` to open the result screen with the golden fixture. The adapter health endpoint is `http://127.0.0.1:4174/health`.

Run all local checks with `npm test`.

### Local data and management routes

- Browser records and pending submissions: IndexedDB database `saju-trace`.
- Development server records: `data/saju.sqlite`.
- Create one submission: `POST /v1/submissions`.
- Delete that submission: `DELETE /v1/submissions/:submissionId`.
- Withdraw its optional training receipt: `POST /v1/submissions/:submissionId/training-withdrawal`.

These routes are deliberately submission-scoped for local development. They do not provide production account authentication, subject-level authorization, retention automation, backup policy, or cross-device synchronization.

The birthplace file is generated from the Ministry of the Interior and Safety `KIKcd_H` and `KIKcd_B` text files. After downloading and extracting a newer snapshot, regenerate it with:

```bash
node scripts/build-admin-areas.mjs /path/to/KIKcd_H.YYYYMMDD /path/to/KIKcd_B.YYYYMMDD data/admin-areas.js
```
