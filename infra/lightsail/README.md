# Low-Cost Governed AWS Stack

The selected first-release stack keeps the existing Lightsail application instance and adds:

- Lightsail managed PostgreSQL 16, standard Micro plan, private mode (USD 15/month).
- One same-region customer-managed KMS key for application envelope encryption (about USD 1/month plus requests).
- Cognito Essentials email accounts with required TOTP MFA and a 14-character minimum password, expected to remain in the initial MAU free tier.

The Cognito domain uses managed login v2. `provision.sh` explicitly assigns the Cognito-provided default branding to the app client because an API-created client has no working login page until a branding style is associated with it.

This is deliberately not a high-availability database. Lightsail provides managed maintenance, encryption in transit/at rest, and seven-day point-in-time restore, but a standard plan can still have downtime. The release gate requires a restore drill and a documented upgrade trigger.

The USD 25 budget is an account-wide notification threshold, not a spending cap. It can include unrelated AWS usage and does not automatically stop resources; the operator must review each alert and the AWS Cost Explorer breakdown.

Do not self-host PostgreSQL on the current 1 GB application instance. The measured host already runs MariaDB, Next.js, Node, and Apache with no swap.

## Provisioning

Run `provision.sh` only from a scoped bootstrap/operator AWS principal. Lightsail does not support attaching an ordinary application IAM role to an instance, so the runtime uses a dedicated IAM user with no console access and only two capabilities: KMS envelope operations under the fixed non-PII encryption context, and `AdminDeleteUser` on this Cognito pool. Required environment variables:

```text
SAJU_DB_MASTER_PASSWORD
SAJU_COGNITO_DOMAIN_PREFIX
SAJU_BUDGET_EMAIL
```

On the first run, also set `SAJU_RUNTIME_CREDENTIALS_FILE` to a new path outside the repository. The script writes the one-time runtime access key there with mode `0600` and never prints it. If a key already exists, the script will not rotate or disclose it implicitly. Rotate it deliberately, verify the new key, and then deactivate/delete the old key.

Optional variables select names/region without changing the security model. The script creates or reuses named resources and never prints the database password or AWS secret.

After resource creation and legal sign-off, run `deploy/bin/configure-managed-data.sh` on the application host with the documented environment values and `SAJU_CLOUD_SAVE_APPROVED=yes`. The script also refuses to continue while `docs/legal/LAUNCH-SIGNOFF.md` contains a blocked row. Store the admin database URL only in `/etc/saju-app-migrate.env` (`0600`); the Node runtime receives only the limited `saju_runtime` URL from `/etc/saju-app.env` and the least-privilege AWS key from `/etc/saju-app-aws.env` (both `0640`, `root:www-data`). Database and session passwords must be base64url-safe so they cannot alter environment-file parsing.

Cloud save must remain `SAJU_STORAGE=local-only` until `docs/legal/LAUNCH-SIGNOFF.md` is complete.

If Cognito returns a transient error after active application data has been deleted, the account remains blocked and the deletion request records `external_identity_state=failed`. Run `scripts/retry-account-deletions.mjs` as root with the migration and runtime AWS environments loaded; it retries only pending/failed identities, treats an already-missing Cognito user as success, and prints counts rather than identifiers.
