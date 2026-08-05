# Privacy Risk Assessment

| Risk | Default control | Residual risk / release rule |
|---|---|---|
| Birth data reveals sensitive personal context | KMS field encryption, TLS, no body logging | KMS/runtime-credential compromise remains possible; monitor key use and rotate the dedicated access key |
| Submission-ID authorization bypass | Authenticated internal UUID plus ownership query and RLS | Negative cross-account tests required for every release |
| Partner data entered without permission | Couple flow local-only | Device owner remains responsible for lawful input; never centralize without a separate design |
| Minor data centrally stored | Under-19 cloud policy denial | Birth-date accuracy is user supplied; do not advertise minor accounts |
| Training/marketing purpose creep | No UI, no projection, server rejection | Any future purpose requires a new plan, notice, basis, and tests |
| Lost database or bad deployment | Managed seven-day PITR, migration ledger, restore drill | Standard Lightsail DB is single-instance; documented downtime risk is accepted for the low-cost release |
| Overseas support/subprocessors omitted | Cloud save stays gated | Counsel must finish Article 28-8 notice before launch |
| Operator personal contact exposed | Use a dedicated rights channel, not personal credentials | Cloud save stays gated until the dedicated channel works end to end |
