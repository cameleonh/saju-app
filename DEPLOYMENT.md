# Deployment

Apache terminates HTTPS and reverse-proxies all application traffic to Node on `127.0.0.1:4174`. Node serves an explicit public-asset allowlist. The Lightsail timer pulls `main`, builds an immutable release, runs checksum-locked PostgreSQL migrations when the root-only migration environment exists, atomically switches the symlink, and rolls back the application release if health fails.

## Safe default

`deploy/systemd/saju-app.service` starts with `SAJU_STORAGE=local-only`. A code deployment therefore cannot start central personal-data collection by itself. Managed account storage is enabled only when these root-managed files exist:

- `/etc/saju-app.env` (`0640`, `root:www-data`): limited runtime DB URL, KMS/Cognito identifiers, public URL, session secret.
- `/etc/saju-app-aws.env` (`0640`, `root:www-data`): dedicated no-console runtime access key with context-bound KMS and one-pool Cognito deletion permissions.
- `/etc/saju-app-migrate.env` (`0600`, `root:root`): database administrator URL used only by release migrations.

Use `infra/lightsail/provision.sh` to create the private PostgreSQL 16 Micro database, KMS key, Cognito resources, runtime IAM user, and budget. After every row in `docs/legal/LAUNCH-SIGNOFF.md` is approved, run `deploy/bin/configure-managed-data.sh` on the server with `SAJU_CLOUD_SAVE_APPROVED=yes`. The script refuses to enable managed persistence while any launch gate remains blocked.

## Updates

The update timer runs `deploy/bin/update-saju-app.sh`, retains five releases, validates Apache, performs additive migrations before switching code, verifies `/health`, and restores the previous symlink on application failure. Database migrations are not rolled back automatically; every release migration must remain compatible with the previous application release. A separate root-only daily timer marks deletion evidence complete after the managed seven-day restore deadline and only after active data and external identity deletion have succeeded.

## Apache ServerName

Use a non-public global name to avoid `AH00558` without colliding with the TLS virtual host:

```sh
printf '%s\n' "ServerName 127.0.0.1" | sudo tee /etc/apache2/conf-available/servername.conf
sudo a2enconf servername
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Do not set the global value to `saju.blog`; an unnamed Debian TLS site can inherit it and serve the wrong certificate.

## Required production drills

- Confirm the database is private and only reachable by Lightsail resources in the same region.
- Verify TLS with the AWS CA bundle and `verify-full`.
- Prove user A cannot list/read/delete user B's data at HTTP and RLS layers.
- Rotate the runtime access key without downtime, then deactivate the old key.
- Restore the previous seven-day point-in-time backup into an isolated database and re-run migration/RLS/KMS checks.
- Complete a synthetic login, save, second-browser reopen/export, record delete, account delete, and backup-expiry evidence check.
