# Project Status: Saju App

| Field | Value |
|---|---|
| Status date | 2026-08-05 |
| Project root | `D:\\codings\\260801_saju-app` |
| Current phase | Managed AWS resources, recovery, and credential-rotation drills verified; production remains local-only pending operator-controlled legal and security sign-off |
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

- `npm test`: 752 assertions passed plus 48 official solar-term boundary loops across the full unit/HTTP/lifecycle suite.
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

## Exact next action

The operator must register root MFA and complete the named-owner legal/security rows in `docs/legal/LAUNCH-SIGNOFF.md`. Only then may the root-managed production environments be installed and the final synthetic account lifecycle run; do not enable cloud save before those real approvals exist.
