# Algorithm Correctness Audit — 2026-08-28

Full audit of every calculation algorithm in the runtime against external oracles, official fixture tables, and independent reimplementations. Triggered by the user after the daewoon direction error was reported; every engine was re-verified end to end, four real defects were found and fixed (commit `8c26259`), and all fixes are deployed to production.

## Oracles and verification sources

| Oracle | Used for | Role |
|---|---|---|
| `lunar-javascript@1.7.7` (EightChar / Yun / DaYun / LunarUtil) | Korean saju pillars, ten-god table, hidden stems, daewoon conversion | Chinese-standard bazi implementation; same library that generated our lunar table |
| `tuvi-neo@1.0.7` | Tử Vi placement (Ming palace, bureau, 14 major stars), tu-hoa, minor stars | Independent Vietnamese Tử Vi implementation |
| `dirah.org` mahabote lesson | Mahabote house arithmetic (acquired in full) | Orthodox Burmese arithmetic source |
| Thai Wikipedia จักรราศี / Colors of the day | Horasat rasi boundaries, birthday colors, Buddha postures | Public reference tables |
| `astronomy-engine` + Lahiri ayanamsa | Horasat Jupiter ingress table (2024–2035) | Physical recomputation |
| KASI/KASA official fixture values (pre-existing tests) | Solar-term boundaries at ±1 minute | National-astronomy ground truth |
| Standard relation tables | 상생/상극/육합/상충/삼합, ten-god derivation | Textbook standards |

## Audit matrix and results

### A1 — Korean saju four pillars (1,531 random profiles)

Year/month/day/hour pillars compared against the lunar-javascript EightChar across 1901–2098 random births, excluding ±3 h around any solar-term boundary (timezone representation) and classifying 23:00–24:00 births separately.

- **Compared: 1,531 profiles → 0 pillar mismatches.**
- 56 late-zi births classified as the documented school difference: Korean practice changes the day pillar at midnight; the Chinese oracle rolls it at 23:00 (year and month pillars still verified matching on those profiles).
- 13 boundary-adjacent profiles skipped; oracle errors 0.

### A2 — Ten gods and hidden stems

- Ten-god derivation replicated from the app's `decoratePillars` and checked against an independent textbook algorithm: **10×10 matrix — 0 mismatches**; 500 random charts — clean.
- Hidden-stem table vs `LunarUtil.ZHI_HIDE_GAN` (12 branches exhaustive): **2 defects found and fixed**
  - 子 carried only 壬; Korean manseryeok standard is 본기 癸 + 여기 壬 → now `['癸','壬']`.
  - 巳 ordered 丙戊庚; strength convention (본기→중기→여기) is **丙庚戊** → reordered.

### A3 — Horasat weekday table (external)

Colors and Buddha postures checked against the Thai birthday table (en.wikipedia "Colors of the day in Thailand"):

- 6 of 8 weekday entries verified unchanged (including Wednesday AM/PM split, animals, directions).
- 2 label fixes: Sunday posture → ปางเปิดโลก (Pang Opan Lok); Friday color → Light Blue.
- Weekday rasi boundaries were already on the Thai Wikipedia sidereal table (verified earlier); Jupiter table physically recomputed for 2024–2035 (verified earlier, first-direct-ingress convention, 4/4 match on the pre-existing rows).

### A4 — Compatibility relation tables + couple saju reading

- Five tables (상생, 상극, 육합, 상충, 삼합) verified exhaustively against the standard — all match.
- **Real defect found**: `analyzeSajuCouple` read `stem.element` / `branch.hangul` off the natal engine's string pillars (`{stem:'戊', element:'토', branch:'申'}`), so every pairing silently fell back to `목/자` — day-element relation, six-harmony, clash, and trine readings were fictional. Fixed by reading `pillar.element` and mapping the day-branch hanja to hangul. Spot-verified: 1990-10-10 (戊申) × 1992-03-05 (?辰) now yields 토생금 상생 + 申辰 삼합(수국).

### A5 — Mahabote (400 random profiles)

Weekday (vs JS Date), Burmese-era year (April 15 split), remainder→first-house planet, mahabote planet-sequence fill, and birth-planet seat compared against an independent reimplementation of the dirah lesson: **400/400 clean**.

### A6 — Extended oracle parity

- **Daewoon: 193 mixed-gender charts — 0 mismatches** on direction, start age, first pillar, and every start year. This required porting the lunar-javascript 流派1 conversion exactly (see defects below); before the port, 42 charts disagreed.
- **Tử Vi: 941 charts — 0 mismatches** on lunar date, Ming palace, bureau, and all 14 major stars (calendar-boundary months excluded as documented).

### A7 — Ipchun and term boundaries

Covered by A1 (year pillar flips at Ipchun, month pillar at each jie, 1,531 profiles) plus the pre-existing KASI fixture tests that pin 48 official term boundaries at ±1 minute. No separate findings.

## Defects found and fixed (commit `8c26259`)

1. **Daewoon start-date conversion (3 sub-defects)** — the residual conversion did not follow the orthodox arithmetic. Now an exact port of lunar-javascript: calendar-day difference taken in CST; hour-pillar index computed from the birth wall clock (capped at 11 for 23:00) and the term instant expressed in CST; negative hour difference decrements the day count; `months = dayDiff*4 + floor(hourDiff*10/30)`; the residual day component `hourDiff*10 − monthDiff*30` (1 shichen = 10 days) is added after years and months. 42 → 0 mismatches on the 193-chart panel.
2. **Couple saju fallback** — see A4.
3. **Hidden-stem table (子, 巳)** — see A2.
4. **Horasat labels** — see A3.

## Known, documented school differences (not defects)

- Day pillar boundary for 23:00–24:00 births (Korean midnight school vs Chinese late-zi oracle).
- 대운수 truncation vs rounding schools: the start **age** label follows the oracle's floor; the start **year** follows the exact converted date, which is the convention that visibly matters.
- Daewoon direction for users who leave the sex field unset defaults to male (documented in policy).
- Tử Vi lunar source is Chinese-calendar data; the 6 documented CN/VN divergence months remain excluded from parity claims.

## Verification chain for this audit

npm test (33 suites) green after fixes → pushed (`8c26259`) → auto-deploy confirmed live (`daewoon-new=True couple-new=True` probes on production assets).
