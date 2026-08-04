# Deployment

The Saju app is deployed as a static frontend plus a small Node.js ingestion service:

- Apache redirects HTTP to HTTPS and reverse-proxies every HTTPS request to Node on `127.0.0.1:4174`.
- Node serves an explicit public-asset allowlist, so repository metadata, server source, tests, documents, and SQLite files cannot bypass the application boundary through Apache.
- The Node service uses Node.js 22 because the SQLite adapter imports `node:sqlite`.
- SQLite runtime data lives outside releases in the service-owned `/var/lib/saju-app/runtime/` directory. The root-owned source checkout remains a separate sibling and is not writable by the Node service.
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

This release uses the versioned `KR-CIVIL-1.0` natal calculation policy but still relies on the local SQLite ingestion adapter. Do not treat it as a production personal-data service until the documented PostgreSQL, key management, identity, backup, and privacy-policy work is complete.
