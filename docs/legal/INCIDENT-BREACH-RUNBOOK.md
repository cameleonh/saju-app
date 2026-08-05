# Privacy Incident and Breach Runbook

## Immediate actions

1. Preserve relevant system, KMS, Cognito, PostgreSQL, Apache, and deployment evidence without copying birth inputs into tickets or chat.
2. Revoke suspected sessions and deactivate the dedicated `saju-runtime` access key; restrict network access; do not delete the affected instance before evidence is preserved.
3. Identify affected data categories, accounts, time window, encryption state, key access, exfiltration evidence, and containment status.
4. Start a written incident timeline with one accountable incident owner.

## Assessment and notification

- Counsel determines the PIPA Article 34 rule effective on the incident date, including amendments effective from 2026-09-11.
- The operator documents whether notification/reporting thresholds are met, the decision time, recipients, required content, and any delay reason.
- User notices must be factual, describe protective actions, and avoid unsupported statements that encryption made the event harmless.

## Recovery

- Restore into an isolated environment, verify migration checksums, RLS, KMS decrypt permissions, and account isolation before reopening writes.
- Rotate affected secrets/keys according to evidence; do not schedule KMS key deletion while ciphertext or investigation evidence still depends on it.
- Record root cause, control repairs, retained evidence, and the date the incident hold is released.

Launch gate: name the 24/7 incident owner and counsel contact; verify the notification decision tree against the launch-date law.
