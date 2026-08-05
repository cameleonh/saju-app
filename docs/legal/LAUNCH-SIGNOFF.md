# Cloud-Save Launch Sign-off

Cloud save is **blocked** until every row has a named owner, evidence link, date, and approval.

| Gate | Required evidence | Owner | Status |
|---|---|---|---|
| Operator identity | Exact legal/registered name in privacy policy and terms | Product operator | BLOCKED |
| Rights contact | Working dedicated privacy channel tested end to end | Product operator | BLOCKED |
| AWS processor/transfer | Contracting entity, DPA, subprocessor and Article 28-8 notice review | Counsel | BLOCKED |
| Legal basis/retention | Signed review of basis matrix, adult-only scope, seven-day backup expiry, 90-day logs | Korean privacy counsel | BLOCKED |
| Infrastructure | Private Lightsail PostgreSQL 16, KMS key, Cognito, TLS, PITR, budget alarm | Infrastructure owner | BLOCKED |
| Security | RLS isolation, KMS tamper test, runtime access-key rotation drill, secret scan, restore drill, incident contacts | Security/incident owner | BLOCKED |
| Product truth | UI, API policy, public documents, deployment config have no contradictions | Product owner | BLOCKED |

An AI-generated name, signature, or legal conclusion is not accepted as evidence. Until this file is complete, production must run local-only behavior and must not set `SAJU_STORAGE=postgres`.
