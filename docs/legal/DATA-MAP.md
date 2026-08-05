# Production Data Map

Status: engineering control baseline, not legal approval. Updated 2026-08-05.

| Flow | Data | Location | Protection | Release state |
|---|---|---|---|---|
| Guest/self calculation | Birth date, time, place, calculated chart | Browser IndexedDB | Same-origin browser storage | Enabled |
| Couple calculation | Both birth inputs and comparison | Browser IndexedDB | Same-origin browser storage; never sent to submission storage | Enabled local-only |
| Lunar/calendar API | Date/time conversion input | Lightsail application memory | No request-body logging; discarded after response | Enabled |
| Account identity | Verified email at Cognito; provider subject and keyed email HMAC in app DB | Cognito and Lightsail PostgreSQL, Seoul | Cognito controls; no plaintext or unkeyed email hash in app DB | Gated |
| Adult self cloud save | Birth input, chart, policy provenance, disclosure event | Lightsail PostgreSQL 16, Seoul | TLS plus KMS envelope encryption for birth fields; chart JSON excludes plaintext birth input; RLS by internal user UUID | Gated |
| Session | Opaque cookie in browser; SHA-256 token hash in DB | Browser and PostgreSQL | HttpOnly, Secure, SameSite=Lax; one-hour expiry | Gated |
| Request throttling | Process-local HMAC of connection address; no raw address retained by the app | Lightsail application memory | Random key per process; expired within two minutes; never logged or persisted | Enabled |
| Security logs | Time, HTTP method, path without query string, status, response size; no IP, user agent, referrer, cookie, authorization code, or request body | Lightsail journal/Apache logs | Restricted OS access; 90-day maximum | Enabled |
| Training/marketing | None | None | Server rejects enabled optional-purpose receipts in governed mode | Disabled |

Cloud save remains gated until the operator identity, dedicated privacy-rights channel, processor/transfer disclosure, and counsel review are complete.
