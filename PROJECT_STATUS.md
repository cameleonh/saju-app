# Project Status: Saju App

| Field | Value |
|---|---|
| Status date | 2026-08-05 |
| Project root | `D:\\codings\\260801_saju-app` |
| Current phase | Governed cloud-save implementation verified; local-only production release deployed; AWS provisioning and legal sign-off remain |
| Production default | `SAJU_STORAGE=local-only` |

## Current objective

Keep the deterministic natal, annual, and daewoon product available without central collection, while preparing an operator-safe account save service on the lowest-cost managed AWS stack.

## Implemented

- `KR-CIVIL-1.0`, `KR-ANNUAL-IPCHUN-1.1`, and `KR-DAEWOON-1.0` deterministic engines, server verification, PWA shell, local IndexedDB history, single/couple flows, lunar conversion, and the reviewed 1900–2100 boundary behavior.
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

- `npm test`: 745 assertions passed plus 48 official solar-term boundary loops across the full unit/HTTP/lifecycle suite.
- Disposable PostgreSQL 16 integration: 42 assertions passed after applying all migrations twice, including keyed identity evidence, nested-birth plaintext exclusion, KMS envelopes, RLS ownership, individual/account deletion, and backup-expiry finalization.
- `npm audit --omit=dev`: 0 vulnerabilities. Node syntax checks, POSIX shell syntax checks, `git diff --check`, dependency-tree validation, and repository secret-pattern scan passed.
- GitHub `main` and the Lightsail release are aligned at `1426942`. The Node service, Apache configuration, and daily deletion-finalizer timer are active; `/health` reports `durable: false`, confirming that cloud save remains fail-closed.
- Production browser QA passed on desktop and mobile: Korean and Hanja render from the self-hosted Noto Sans KR files, the daewoon result is present, `/v1/me` quietly reports the unavailable account capability, there are no console errors, and all observed requests are same-origin.
- AWS resource provisioning is prepared but not yet executed. Root sign-in accepted the stored account credentials and is blocked at the emailed one-time verification-code step; no managed database, KMS key, Cognito pool, IAM runtime key, or budget was created during that attempt.

## Production launch gates

- Provision and verify the named AWS resources; complete TLS connection, key rotation, budget notification, restore, and synthetic account lifecycle drills.
- Publish the exact legal/registered operator name and a tested dedicated privacy-rights contact.
- Record the AWS contracting entity, processor/subprocessor and overseas-processing notice approved for the actual account.
- Obtain Korean privacy counsel sign-off and name the incident owner.

Until every gate in `docs/legal/LAUNCH-SIGNOFF.md` is complete, production stays local-only and must not set `SAJU_STORAGE=postgres`.

## Exact next action

Complete the AWS root email verification, run the idempotent provisioning script from an operator session, and perform the TLS/restore/key-rotation/account-lifecycle drills. Do not enable cloud save until the legal sign-off fields contain real operator-approved facts.
