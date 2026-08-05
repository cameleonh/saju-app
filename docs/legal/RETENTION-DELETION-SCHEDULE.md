# Retention and Deletion Schedule

| Record | Retention criterion | Active deletion | Residual backup expiry |
|---|---|---|---|
| Browser chart | Until user deletes it or clears browser storage | Immediate browser deletion | None under operator control |
| Account chart and encrypted birth record | Until user deletes the chart or closes the account | Within 24 hours | Lightsail point-in-time backups expire within 7 days |
| Cognito account | Until account closure | Deactivate/revoke sessions before identity deletion | Cognito-managed service backup lifecycle |
| Opaque app session | One hour or logout | Immediate revocation | No plaintext token backup; hash follows DB backup expiry |
| Access/security logs | 90 days maximum | Scheduled rotation | Snapshot copies must follow the approved seven-day operational window unless an incident hold is documented |
| Deletion workflow evidence | Daily finalization after the seven-day deadline, then the minimum period counsel approves for dispute evidence | Remove direct identifiers; retain request state only | Defined by the approved evidence schedule |

No indefinite retention is allowed. A legal or incident hold must identify its owner, scope, start, review date, and release condition.
