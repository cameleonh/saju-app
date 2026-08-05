# Pre-Launch Decisions

| Field | Decision |
|---|---|
| Status | Low-cost governed architecture selected; cloud-save release remains fail-closed |
| Date | 2026-08-05 |
| Compute | Existing Lightsail application instance |
| Database | Lightsail managed PostgreSQL 16, standard Micro plan, private mode |
| Database availability | Single-instance managed plan accepted to keep the fixed database cost at USD 15/month; seven-day PITR and restore drills mitigate but do not remove downtime risk |
| Field encryption | One same-region customer-managed AWS KMS key for application birth-data envelopes |
| Runtime AWS identity | Dedicated no-console IAM user; KMS context-bound and Cognito `AdminDeleteUser` only; root-protected access key rotation required because Lightsail does not support an attachable application role |
| Identity | Cognito email account with required TOTP MFA and 14-character minimum password, authorization code + PKCE, server-side token exchange, one-hour opaque HttpOnly session |
| Account key | Internal UUID; Cognito `sub` is a provider link, not a domain primary key |
| Cloud-save scope | Authenticated adults saving their own single chart |
| Local-only scope | Guests, under-19 subjects, couple/partner charts, and all third-party charts |
| Optional processing | Training, marketing, advertising, analytics, external AI, and human review disabled |
| Retention | Until user deletion/account closure; active deletion within 24 hours; Lightsail PITR expiry within seven days; security logs 90 days |
| Core processing basis | Working engineering position: necessary to provide the requested account save/delete service, subject to Korean privacy counsel review |

## Remaining non-technical launch gates

The code and infrastructure must not invent or silently infer these facts:

- Exact legal or registered name of the service operator.
- A working dedicated privacy-rights channel that does not expose deployment credentials or an unnecessary personal inbox.
- Named incident owner and Korean privacy counsel.
- Final AWS contracting entity/subprocessor/overseas-processing notice and launch-date Article 34 review.

Until these gates close, the public application stays local-first and `NODE_ENV=production` must not be paired with SQLite or an incomplete PostgreSQL configuration. See `docs/legal/LAUNCH-SIGNOFF.md`.

## Cost boundary

- Lightsail managed PostgreSQL Micro: USD 15/month fixed plan.
- One customer-managed KMS key: approximately USD 1/month plus requests; the KMS free request tier normally covers early usage.
- Cognito Essentials: expected within the direct/social sign-in free MAU tier for the initial release.
- Snapshot, log, email-delivery, transfer, and tax charges are monitored separately.

The existing 1 GB application instance is not used to self-host PostgreSQL: it already runs MariaDB, Next.js, Node, and Apache with no swap, so co-locating another database would create avoidable outage and recovery risk.
