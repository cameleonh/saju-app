# Saju App: Four Traditions Comparison

Korean-first astrology PWA for Korean Saju plus explicitly scoped Thai weekday/sidereal Sun-rasi, Vietnamese Tử Vi, and Myanmar Mahabote natal calculations. Each policy states its calendar, time, source, and unsupported output layers; this is not a claim that every school's full astrology system is implemented.

## Product behavior

- Current implementation: single/couple Saju, annual and daewoon facts; Thai weekday symbols and ephemeris-based sidereal Sun sign; Tử Vi using the Vietnam GMT+7 lunar calendar and gender-aware timing; Mahabote birth-chart arithmetic; local IndexedDB history, JSON export, and deletion.
- `KR-CIVIL-1.0@1.2.0`, `KR-DAEWOON-1.0@1.3.0`, `TH-HORASAT-1.0@1.2.0`, `VN-TUVI-1.0@1.2.0`, and `MM-MAHABOTE-1.0@1.2.0` record the calculation policies.
- Source-unlocked Mahabote annual/daily forecasts, Tử Vi daily palace rotation, Thai full Lagna chart, and unverified Southeast Asian forecast prose are withheld rather than guessed.
- Questions are organized by deterministic local rules and are not sent to an external generative-AI provider.
- Couple/partner records and under-19 records never enter central persistence.
- Target experience: enter one birth profile, show which of the four systems can be calculated from the available input, inspect each tradition separately, and compare only evidence-backed common, different, and system-specific themes.
- Comparison never ranks a tradition, produces an accuracy or fate score, or fills a missing fact with generated text. Policy limits and unavailable inputs are surfaced in the result.

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

## Current implemented routes

- Public calculation: `POST /v1/natal-charts`, `POST /v1/annual-readings`, `POST /v1/calendar/convert`
- Account: `GET /auth/login`, `GET /auth/callback`, `POST /auth/logout`, `GET /v1/me`, `DELETE /v1/account`
- Authenticated history: `GET /v1/submissions`, `POST /v1/submissions`, `GET /v1/submissions/:id`, `DELETE /v1/submissions/:id`

The per-system eligibility and comparison contracts are implemented in `server/domain/astrology-comparison.mjs` and documented in `docs/MULTI-ASTROLOGY-COMPARISON-SPEC.md`.

## Documents

- [Project status](PROJECT_STATUS.md)
- [Four-tradition product and implementation specification](docs/MULTI-ASTROLOGY-COMPARISON-SPEC.md)
- [Calculation policy registry and release gates](docs/CALCULATION-POLICY-REGISTRY.md)
- [Product requirements](PRD.md)
- [Experience design](DESIGN.md)
- [Design system](DESIGN-SYSTEM.md)
- [Data architecture](docs/DATA-ARCHITECTURE.md)
- [Pre-launch decisions](docs/PRE-LAUNCH-DECISIONS.md)
- [Lightsail stack](infra/lightsail/README.md)
- [Deployment](DEPLOYMENT.md)
- [Privacy launch gate](docs/legal/LAUNCH-SIGNOFF.md)
- [Natal policy](docs/NATAL-CALCULATION-POLICY.md)
- [Korean lunar conversion policy](docs/KOREAN-LUNAR-CALENDAR-POLICY.md)
- [Annual policy](docs/ANNUAL-READING-POLICY.md)
- [Daewoon policy](docs/DAEWOON-CALCULATION-POLICY.md)
- [Thai Horasat policy](docs/TH-HORASAT-CALCULATION-POLICY.md)
- [Vietnamese Tử Vi policy](docs/VN-TUVI-CALCULATION-POLICY.md)
- [Myanmar Mahabote policy](docs/MM-MAHABOTE-CALCULATION-POLICY.md)
- [Calculation repair notes](docs/CALCULATION-REPAIR-2026-09-24.md)
