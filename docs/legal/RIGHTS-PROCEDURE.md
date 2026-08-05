# Data-Subject Rights Procedure

1. Browser records are viewed, exported, and deleted in the Data screen without contacting the operator.
2. Cloud records require an authenticated session. The API scopes deletion by internal account UUID and PostgreSQL RLS; a submission ID alone is insufficient.
3. Account closure first blocks all authenticated work, deletes active submissions/vault rows and revokes sessions in one database transaction, then deletes the Cognito identity.
4. The system records only the deletion workflow state needed to prove active deletion and backup-expiry completion.
5. Active records must be deleted within 24 hours. The request remains `backup_expiry_pending` until the seven-day PITR deadline has elapsed; a root-only daily job then records completion only when external identity deletion has also succeeded.
6. Requests received through the future dedicated privacy channel must be identity-verified without collecting unnecessary identity documents.
7. Access, correction, deletion, suspension, and withdrawal outcomes must be logged with the legal reason for any refusal and an escalation path.

Launch gate: the operator legal identity, dedicated rights channel, response owner, and response SLA must be published before cloud save is enabled.
