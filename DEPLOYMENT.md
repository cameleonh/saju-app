# Deployment

The Saju app is deployed as a static frontend plus a small Node.js ingestion service:

- Apache serves the files in `/var/www/saju-app`.
- Apache reverse-proxies `/health` and `/v1/*` to Node on `127.0.0.1:4174`.
- The Node service uses Node.js 22 because the SQLite adapter imports `node:sqlite`.
- SQLite runtime data lives outside releases at `/var/lib/saju-app/saju.sqlite`.
- GitHub Actions runs `npm test` and deploys successful pushes to `main`.

## DNS

The domain can stay at Spaceship; Route 53 is not required. Point these records to the Lightsail static IP:

| Name | Type | Value |
| --- | --- | --- |
| `@` | `A` | `43.201.117.119` |
| `www` | `CNAME` | `saju.blog` |

After DNS propagates, issue the certificate for `saju.blog` and `www.saju.blog` with certbot, then enable `deploy/apache/saju.blog-le-ssl.conf`.

## GitHub Actions secrets

The workflow expects `LIGHTSAIL_HOST`, `LIGHTSAIL_USER`, `LIGHTSAIL_SSH_KEY`, and `LIGHTSAIL_KNOWN_HOSTS` repository secrets. Use a dedicated deploy key rather than the Lightsail bootstrap key.

## Prototype boundary

This release still uses the local SQLite ingestion adapter and demo chart policy documented in `PROJECT_STATUS.md`. Do not treat it as a production personal-data service until the documented PostgreSQL, key management, identity, backup, and privacy-policy work is complete.
