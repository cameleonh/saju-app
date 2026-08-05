# Saju App

Korean-first personal and couple Saju PWA with deterministic, versioned natal, annual, and daewoon calculations. The product works locally without an account or central personal-data collection.

## Product behavior

- Single and couple calculations, evidence-linked readings, lunar conversion, searchable Korean birthplace data, local IndexedDB history, JSON export, and deletion.
- `KR-CIVIL-1.0`, `KR-ANNUAL-IPCHUN-1.1`, and `KR-DAEWOON-1.0` are shared by browser/server verification.
- Questions are organized by deterministic local rules and are not sent to an external generative-AI provider.
- Couple/partner records and under-19 records never enter central persistence.

## Governed account storage

The optional account path uses Cognito authorization-code + PKCE with required TOTP MFA, one-hour opaque app sessions, a private Lightsail managed PostgreSQL 16 Micro database, RLS, and KMS envelope encryption for birth input. Authenticated adults can save, reopen, export, delete, and close their own account. Product-learning, marketing, analytics, external AI, and human-review purposes are disabled.

Production fails closed to `local-only` unless every required PostgreSQL/KMS/Cognito environment value is installed. Cloud save must remain disabled until `docs/legal/LAUNCH-SIGNOFF.md` is complete.

## Run and verify

```bash
npm ci
npm test
npm audit --omit=dev
npm start
```

Open `http://127.0.0.1:4174/`; append `?demo` for the golden fixture. The health endpoint is `/health`.

Run the real PostgreSQL 16 integration suite against a disposable database:

```bash
TEST_POSTGRES_URL=postgresql://postgres:password@127.0.0.1:5432/saju npm run test:postgres
```

## Main routes

- Public calculation: `POST /v1/natal-charts`, `POST /v1/annual-readings`, `POST /v1/calendar/convert`
- Account: `GET /auth/login`, `GET /auth/callback`, `POST /auth/logout`, `GET /v1/me`, `DELETE /v1/account`
- Authenticated history: `GET /v1/submissions`, `POST /v1/submissions`, `GET /v1/submissions/:id`, `DELETE /v1/submissions/:id`

## Documents

- [Project status](PROJECT_STATUS.md)
- [Pre-launch decisions](docs/PRE-LAUNCH-DECISIONS.md)
- [Lightsail stack](infra/lightsail/README.md)
- [Deployment](DEPLOYMENT.md)
- [Privacy launch gate](docs/legal/LAUNCH-SIGNOFF.md)
- [Natal policy](docs/NATAL-CALCULATION-POLICY.md)
- [Annual policy](docs/ANNUAL-READING-POLICY.md)
- [Daewoon policy](docs/DAEWOON-CALCULATION-POLICY.md)
