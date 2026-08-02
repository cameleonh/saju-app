# Deployment

The Saju app is deployed as a static frontend plus a small Node.js ingestion service:

- Apache serves the files in `/var/www/saju-app`.
- Apache reverse-proxies `/health` and `/v1/*` to Node on `127.0.0.1:4174`.
- The Node service uses Node.js 22 because the SQLite adapter imports `node:sqlite`.
- SQLite runtime data lives outside releases at `/var/lib/saju-app/saju.sqlite`.
- GitHub Actions runs `npm test` on every pull request and push to `main`.
- A Lightsail systemd timer pulls `main` every five minutes and atomically deploys new commits.

## DNS

The domain can stay at Spaceship; Route 53 is not required. Point these records to the Lightsail static IP:

| Name | Type | Value |
| --- | --- | --- |
| `@` | `A` | `43.201.117.119` |
| `www` | `CNAME` | `saju.blog` |

After DNS propagates, issue the certificate for `saju.blog` and `www.saju.blog` with certbot, then enable `deploy/apache/saju.blog-le-ssl.conf`.

## Deployment updates

The Lightsail firewall does not accept SSH connections from GitHub-hosted runner addresses, so deployment uses an outbound pull from the public GitHub repository. The timer runs `deploy/bin/update-saju-app.sh`, keeps the last five releases, and rolls back the symlink if the service health check fails.

## Prototype boundary

This release still uses the local SQLite ingestion adapter and demo chart policy documented in `PROJECT_STATUS.md`. Do not treat it as a production personal-data service until the documented PostgreSQL, key management, identity, backup, and privacy-policy work is complete.
