# Project Status: Saju App and Four-Tradition Expansion

| Field | Value |
|---|---|
| Status date | 2026-08-27 |
| Project root | `D:\\codings\\260801_saju-app` |
| Current phase | Four-tradition comparison runs in production with honest per-tradition verification labels: Korean Saju fully verified; Tử Vi placement oracle-verified (tuvi-neo parity); Horasat rasi on the Thai sidereal table with a bounded Jupiter table; Mahabote remains a labeled simplified model pending a source-locked rule |
| Production default | `SAJU_STORAGE=local-only` |

## Four-tradition verification status (2026-08-27)

The four-tradition comparison UI initially shipped with fabricated provenance strings and invented placement formulas. This was corrected in three passes:

1. **Honest labeling (all traditions)** — Policy `source` fields no longer cite institutions that were never consulted ("Royal Institute of Thailand", "Myanmar Standard Astronomical Calculation"). The method screen and both comparison panels state that Mahabote, Horasat, and Tử Vi are simplified beta models and the cross-tradition synthesis is a reading perspective, not proof. Couple-policy provenance carries the same label.
2. **Tử Vi placement rewritten and oracle-verified** — Ming/Than palaces via the orthodox month-forward/hour-wrapping procedure, bureau (Ngũ Hành Cục) via the nayin five elements of the Ming stem-branch with five-tiger-dun month stems, Zi Wei placement by the canonical quotient/difference rule, and the 14 major stars through the Zi Wei group (retrograde offsets) and Tian Fu group (direct offsets). Cross-checked against the independent Vietnamese library `tuvi-neo@1.0.7`: 246 sampled charts (1936–2004) agree on lunar date, Ming palace, bureau, and every star; 6 residual cases are known Chinese-vs-Vietnamese calendar boundary months (1984-11, 1996-07), which the policy already discloses as the Chinese-calendar substitute limitation. `tests/unit/tu-vi.mjs` pins the oracle fixtures. **Tứ hóa added (2026-08-27):** the four transformations follow the Quanshu-lineage table (verified per host star and palace on 213 charts, zero mismatches) with the four tu-hoa auxiliary stars (Văn Xương/Khúc by hour branch, Tả Phù/Hữu Bật by lunar month). **Minor stars added (2026-08-27):** all fourteen classical Phụ tinh placed by year stem, year branch (trio + yin/yang for Hỏa/Linh), hour branch, and lunar month — 695 sampled charts × 14 stars match the oracle with zero mismatches. Remaining gaps: leap-month handling detail, Đại hạn/Tiểu hạn timing cycles.
3. **Horasat rasi realigned** — Boundaries now follow the Thai Wikipedia chankrasi sidereal (นิรายนะ) table with before/exact/after boundary tests. The Jupiter annual table is explicitly bounded to 2024–2027; out-of-range years return null and the card is omitted instead of silently reusing 2026.
4. **Mahabote** — Weekday/planet/animal tables match public tradition descriptions, but no source-locked house-assignment rule was found; house and annual-cycle arithmetic stays a labeled simplified model until a Burmese primary source is documented.

## Documentation-only expansion update (2026-08-23)

## Current objective

Keep the deterministic natal, annual, and daewoon Saju product available without central collection while preparing a source-locked, independently testable expansion to Thai Horasat, Vietnamese Tử Vi, and Myanmar Mahabote. The target experience accepts one birth profile, calculates only eligible systems, preserves each tradition's own facts, and compares evidence-backed themes without ranking the traditions or presenting a certainty score.

## Documentation-only expansion update (2026-08-23)

- `PRD.md`, `DESIGN.md`, `DESIGN-SYSTEM.md`, and `docs/DATA-ARCHITECTURE.md` define the product, interaction, component, and data changes required for the four-system experience.
- `docs/MULTI-ASTROLOGY-COMPARISON-SPEC.md` is the implementation handoff for input eligibility, routes, screen states, comparison semantics, analytics, rollout, and acceptance tests.
- `docs/CALCULATION-POLICY-REGISTRY.md` keeps the implemented Saju policy separate from draft Horasat, Tử Vi, and Mahabote policies. A draft policy cannot be exposed as a completed result until sources, licensing, school decisions, independent oracle fixtures, and boundary tests pass.
- This update changes documentation only. It does not add routes, engines, schemas, UI, migrations, tests, deployments, or production capability.

## Reading pattern DB (2026-08-06)

- **Layer A (static pattern DB):** 31 reading patterns (10 day masters × 3 target years + 1 legacy), each with 8 cards + 13 domain modules + 24 monthly slots = 1,395 text modules total. Expert-grade Korean natural-language readings modeled on the Hyemin sample, with hanja minimized and prescriptions in second person.
- **Layer B (personalization composer):** `reading-composer.mjs` dynamically injects month-branch seasonal context, daewoon 10-god themes, clash/harmony modifiers, and age/gender tone adjustments on top of the Layer A base, producing a distinct reading for each natal chart.
- **LLM generation pipeline:** `scripts/llm-generate-reading.mjs` calls Windows Ollama (gemma3/GLM-4.6) via WSL→cmd.exe bridge, generates draft patterns with `review_status: 'draft'`, and saves to `server/storage/seeds/`. Dry-run and single-pattern generation verified.
- **UI rendering:** `annual/client.mjs` renders 13 domain modules in a collapsible `<details>` grid within the annual reading section, with print-friendly page breaks.
- **DB integration:** `createAnnualReading` uses DB patterns first (`readingSource: 'pattern-db'`) and falls back to the rule engine (`readingSource: 'rule-engine'`) when no pattern matches. Daewoon data is accepted and passed to the personalization composer.

## Implemented

- `KR-CIVIL-1.0`, `KR-ANNUAL-IPCHUN-1.1`, and `KR-DAEWOON-1.0` deterministic engines, server verification, PWA shell, local IndexedDB history, single/couple flows, lunar conversion, content-sized annual cards, privacy-safe 720×1080 annual-card PNG export, and the reviewed 1900–2100 boundary behavior.
- Production runtime configuration that rejects SQLite and fails closed to local-only mode unless the complete PostgreSQL/KMS/Cognito configuration is present.
- A real bounded-context PostgreSQL adapter against `ops`, `vault`, and `governance`, checksum-locked migrations, advisory locking, a non-owner runtime role, RLS, account-owned history/read/delete, and idempotent saves.
- KMS envelope encryption for original and normalized birth input using AES-256-GCM data keys. Plaintext birth input, including nested daewoon input, is removed from chart JSON storage and reconstructed only after an authorized vault decrypt; email evidence uses a domain-separated keyed HMAC.
- Cognito authorization-code + PKCE login, required TOTP MFA, verified ID tokens and nonce, opaque one-hour `Secure`/`HttpOnly`/`SameSite=Lax` app sessions, server-side session hashes, logout, and origin checks on authenticated mutations.
- Account deletion that blocks the account, removes active chart/vault data, revokes sessions, records seven-day backup-expiry evidence, deletes the Cognito identity, retains a retry state if Cognito deletion fails, and finalizes expired evidence through a root-only daily timer.
- Central persistence restricted to authenticated adults saving their own single chart. Guests, under-19 subjects, couple/partner records, training, marketing, analytics, external AI, and human review remain local-only or disabled.
- Public Korean privacy/terms pages and an internal data map, legal-basis matrix, retention schedule, processor register, rights procedure, incident runbook, privacy-risk assessment, and launch sign-off.
- Lightsail provisioning for a private PostgreSQL 16 Micro database, one application KMS key, Cognito, a cost budget, and a no-console least-privilege runtime IAM user. Lightsail cannot accept an ordinary application IAM role, so the runtime key is isolated in `/etc/saju-app-aws.env` and must be deliberately rotated.
- A pinned OFL-licensed Noto Sans KR webfont is self-hosted, with no third-party font requests, analytics, advertising, or external AI calls. The rate limiter stores only process-local salted HMAC buckets and expires them within two minutes.

## Fresh verification

- `npm test`: 776 assertions passed plus 48 official solar-term boundary loops across the full unit/HTTP/lifecycle suite (reading pattern DB tests included).
- Disposable PostgreSQL 16 integration: 42 assertions passed after applying all migrations twice, including keyed identity evidence, nested-birth plaintext exclusion, KMS envelopes, RLS ownership, individual/account deletion, and backup-expiry finalization.
- `npm audit --omit=dev`: 0 vulnerabilities. Node syntax checks, POSIX shell syntax checks, `git diff --check`, dependency-tree validation, and repository secret-pattern scan passed.
- GitHub `main` and the Lightsail release are kept on the same verified release. The Node service, Apache configuration, and daily deletion-finalizer timer are active; `/health` reports `durable: false`, confirming that cloud save remains fail-closed.
- Production browser QA passed on desktop and mobile: Korean and Hanja render from the self-hosted Noto Sans KR files, the daewoon result is present, `/v1/me` quietly reports the unavailable account capability, there are no console errors, and all observed requests are same-origin.
- AWS provisioning created the private PostgreSQL 16 Micro database, customer-managed KMS key with automatic rotation, Cognito Essentials pool and PKCE client with required TOTP MFA, no-console least-privilege runtime IAM user, and USD 25 account budget with three notifications. From the Lightsail application host, database TLS hostname verification, all three migrations and their idempotent replay, the limited runtime role, RLS isolation, KMS context enforcement, and Cognito deletion-only IAM boundary passed live checks.
- A point-in-time restore database was created in isolation, assigned an independent temporary master password, and verified from the Lightsail host with TLS, all three migrations, the non-owner runtime role, 12 RLS-protected tables, zero visible rows, and denied identity enumeration. The restored database was then deleted and deletion was confirmed.
- Cognito managed login v2 has the default branding associated with the selected app client. The production login page exposes email/password sign-in, password recovery, and account creation without browser console errors.
- A second runtime access key was created and tested from the Lightsail host for KMS round-trip encryption, strict encryption-context enforcement, denied KMS/Cognito enumeration, and the one-pool Cognito deletion boundary. The local `0600` operator file and CMS-encrypted offline backup were updated, the old key was deleted, exactly one active runtime key remains, and temporary CloudShell credentials were removed.

## Production launch gates

- Register root MFA on the operator's own authenticator and stop using the root session for routine work.
- Publish the exact legal/registered operator name and a tested dedicated privacy-rights contact.
- Record the AWS contracting entity, processor/subprocessor and overseas-processing notice approved for the actual account.
- Obtain Korean privacy counsel sign-off and name the incident owner.
- After those approvals, install the root-managed production environments, enable managed storage deliberately, and complete one synthetic login/save/reopen/export/delete/account-delete/backup-expiry lifecycle before admitting real account data.

Until every gate in `docs/legal/LAUNCH-SIGNOFF.md` is complete, production stays local-only and must not set `SAJU_STORAGE=postgres`.

## Exact next actions

1. For the existing production account path, the operator must register root MFA and complete the named-owner legal/security rows in `docs/legal/LAUNCH-SIGNOFF.md`. Only then may the root-managed production environments be installed and the final synthetic account lifecycle run; do not enable cloud save before those real approvals exist.
2. For the four-tradition product path, approve the three draft policy decision records and their independent oracle fixture sets before implementing or advertising a completed Horasat, Tử Vi, or Mahabote result. The first code change should introduce the system registry and shared normalized birth-profile contract without altering the active `KR-CIVIL-1.0` result.
