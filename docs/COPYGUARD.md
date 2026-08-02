# Copyguard Hardening

Applied from [`cameleonh/copyguard`](https://github.com/cameleonh/copyguard), MIT licensed.

## Applied controls

- `robots.txt` and `ai.txt` opt out major compliant AI crawlers.
- `index.html` declares `noai,noimageai` and carries the unique canary `cg-saju-joseon-8b6c2e41`.
- The rendered shell repeats the canary in a visually hidden footer span for clone discovery.
- The server adds `Content-Security-Policy: frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy` to JSON and static responses.
- `copyright.html` provides a visible ownership notice and a deployment-time contact placeholder.
- The ingestion adapter has no read/list endpoint for stored birth records; accepted records remain server-side in SQLite and are never returned by a public API.

## Deliberately not applied

Right-click blocking, global `user-select: none`, and copy-event cancellation are not security controls. They would make the Saju result harder to read, copy for personal records, or use with assistive technology. The canary and server boundary provide better evidence and protection.

## Operational follow-up

The canary is evidence, not prevention. Monitor public search results for `cg-saju-joseon-8b6c2e41`, configure a production WAF/rate limit, keep the production SQLite-to-PostgreSQL migration behind authentication, and replace the placeholder contact before public launch.
