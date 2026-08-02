# Saju App Reference Review

Date: 2026-08-01  
Scope: product behavior, calculation architecture, verification quality, and reuse risk for four references.

## Executive decision

None of the reviewed projects should be treated as an unquestioned calculation oracle.

- **Use Orrery as the primary product and interaction reference.** It is the most complete implementation and the deployed `sky.told.me` site is built from the reviewed Orrery revision. Direct reuse in a closed-source commercial product is not recommended without resolving AGPL obligations and upstream provenance.
- **Use `be-realdeveloper/saju` as an interpretation-flow reference.** Its deterministic-chart-first, structured reading, and follow-up consultation design are valuable. Its calculation wrapper is too weak to be the authoritative engine.
- **Do not use `sajupy` as the production engine in its current form.** It has reproducible leap-month and solar-term-boundary defects, weak correctness tests, and undocumented calendar-data provenance.
- **Build a separately validated deterministic core.** Keep calculation, interpretation rules, and optional LLM narration as three explicit layers.

## Comparison

| Reference | What it is | Best reusable idea | Fresh verification | Main blocker | Recommended role |
|---|---|---|---|---|---|
| [sky.told.me](https://sky.told.me/) | Deployed Orrery web app | Input flow, chart presentation, profiles, AI export | Live form, calculation, tabs, local profile behavior, console, and network inspected | Same reuse constraints as Orrery | UX benchmark |
| [rath/orrery](https://github.com/rath/orrery) | React/TypeScript app plus `@orrery/core` | Local-first multi-chart product and typed calculation boundary | 180 tests passed; production build passed; lint reported 41 errors and 1 warning | AGPL, unclear upstream source rights, boundary accuracy, lint debt | Product reference; possible base only for an AGPL-compatible product after provenance review |
| [be-realdeveloper/saju](https://github.com/be-realdeveloper/saju) | Claude Code/Codex reading skill with a Node wrapper | Grounded reading outline, safety rules, post-report Q&A | CLI smoke calculation passed; no test suite or CI | Leap flag ignored, incomplete solar-time model, simplistic yongsin/gyeokguk, malformed first daewoon item | Interpretation and prompt reference |
| [0ssw1/sajupy](https://github.com/0ssw1/sajupy) | Python library backed by a 1900–2100 CSV | Simple API shape and potential fixture format | 13 tests passed in an isolated environment, but correctness defects reproduced | Wrong leap-month detection, wrong pre-Lichun year pillar, undocumented CSV provenance, packaging mismatch | Do not adopt as production engine |

## 1. `sky.told.me` and Orrery

### Product behavior

The live site identifies itself as **혼천의(渾天儀)** and exposes three result modes: Saju, Ziwei Doushu, and a Western natal chart. The Saju result includes pillars, ten gods, hidden stems, relations, sinsal, daewoon, and future transits. Birth profiles are stored locally, and the observed calculation flow did not call a remote calculation API.

The “Copy all for AI reading” feature exports structured chart data for an external model rather than generating a reading inside the site. This is a strong product signal: deterministic calculation and generative interpretation should remain separate.

The current Orrery source revision was `c76b69f01c37d294053b11767600d5017e7a8dbc`. A fresh local production build emitted the same JavaScript and CSS asset names as the live deployment, providing strong evidence that the site and reviewed source correspond.

Relevant source:

- [Orrery README at the reviewed revision](https://github.com/rath/orrery/tree/c76b69f01c37d294053b11767600d5017e7a8dbc)
- [Application composition](https://github.com/rath/orrery/blob/c76b69f01c37d294053b11767600d5017e7a8dbc/src/components/App.tsx)
- [Local profile storage](https://github.com/rath/orrery/blob/c76b69f01c37d294053b11767600d5017e7a8dbc/src/utils/profiles.ts)

### Calculation model

Orrery has the cleanest architecture of the reviewed projects. `@orrery/core` is separately packaged and the UI consumes structured results. The Korean birth path normalizes historical clock offsets to KST and intentionally skips longitude/equation-of-time correction. Non-Korean time zones use an approximate equation of time and longitude correction.

Sources:

- [Korean and non-Korean time path](https://github.com/rath/orrery/blob/c76b69f01c37d294053b11767600d5017e7a8dbc/packages/core/src/saju.ts#L25-L39)
- [Solar-time approximation and Korean exception](https://github.com/rath/orrery/blob/c76b69f01c37d294053b11767600d5017e7a8dbc/packages/core/src/timezone.ts#L204-L269)
- [Half-hour branch boundaries](https://github.com/rath/orrery/blob/c76b69f01c37d294053b11767600d5017e7a8dbc/packages/core/src/pillars.ts#L291-L337)

Two calculation-policy issues need independent oracle testing:

1. The non-Korean path converts to apparent solar time, while the downstream hour-branch implementation still uses half-hour boundaries described as a 127.5° correction. This combination may apply overlapping correction assumptions.
2. For Korean locations, longitude does not affect the Saju calculation as long as the time zone is `Asia/Seoul`, although the birthplace UI can imply a broader effect. Longitude still matters for the natal chart.

### Boundary accuracy

For 2024-02-04, Orrery changed the Lichun-dependent pillar at approximately 17:00 KST. The Korea Astronomy and Space Science Institute calendar lists Lichun at **17:27 KST**. A birth in that 27-minute interval can therefore receive a different year/month boundary result. This is an accuracy limitation, not a cosmetic discrepancy.

Primary reference: [KASI calendar data](https://astro.kasi.re.kr/life/post/calendarData) and the [2024 KASI almanac](https://astro.kasi.re.kr/file/astro_almanac_pdf/20231023135218580.pdf).

### Verification status

At the reviewed revision:

- `bun install --frozen-lockfile`: passed.
- `bun test`: **180 passed, 0 failed**, across five test files.
- `bun run build`: passed; the main JavaScript bundle was about 1.045 MB before compression and triggered Vite's chunk-size warning.
- `bun run lint`: failed with **41 errors and 1 warning**, including conditional React hooks, state updates in effects, unused variables, and numeric precision findings.
- The deployment workflow builds and deploys but does not run tests or lint: [deploy workflow](https://github.com/rath/orrery/blob/c76b69f01c37d294053b11767600d5017e7a8dbc/.github/workflows/deploy.yml).

The passing tests show meaningful engineering effort, but they do not establish astronomical or calendrical truth at policy boundaries.

### Reuse and provenance risk

Orrery and `@orrery/core` declare `AGPL-3.0-only`: [license](https://github.com/rath/orrery/blob/c76b69f01c37d294053b11767600d5017e7a8dbc/LICENSE). Incorporating the code into a networked product requires an AGPL-compatible distribution strategy or separate permission; a closed-source commercial design needs legal review before reuse.

There is an additional upstream issue. Orrery describes its Saju lineage as a port through `OOPS-ORG-PHP/Lunar`. That upstream project states that the original `진짜만세력` portion has no precise license policy and cautions against commercial-package inclusion. It also documents approximation differences from KASI data: [OOPS-ORG-PHP/Lunar](https://github.com/OOPS-ORG-PHP/Lunar). Orrery's AGPL declaration does not by itself clarify rights to uncertain upstream material.

Practical conclusion: copy neither Orrery's core code nor its derived tables into a closed-source product until both license layers are cleared. Its high-level interaction patterns remain useful as design reference.

## 2. `be-realdeveloper/saju`

The reviewed revision was `25a5547b9ef1262cb8210abff8ecc7adfe5be8b5`. This repository is a coding-agent skill, not a standalone app. It wraps vendored [`lunar-javascript`](https://github.com/6tail/lunar-javascript), computes a structured chart, and asks the model to produce an 18-chapter Korean reading followed by conversational Q&A.

### What is worth adopting

- Calculate first and narrate second.
- Require every narrative section to be grounded in computed chart facts.
- Offer follow-up consultation after the report.
- Prohibit categorical claims about death, severe illness, divorce, bankruptcy, or guaranteed outcomes.
- Avoid fear-based sales for talismans, rituals, or expensive renaming.
- Include a clear entertainment/decision-support disclaimer.

These are better product assets than the repository's calculation code.

### Reproduced calculation problems

- The CLI smoke test completed, but there is no automated test suite or CI.
- The parsed `isLeap` value is never applied to `Lunar.fromYmdHms`, so the documented leap-month support is not implemented: [engine code](https://github.com/be-realdeveloper/saju/blob/25a5547b9ef1262cb8210abff8ecc7adfe5be8b5/.claude/skills/saju/engine/saju.js#L118-L143).
- The first daewoon result can have an empty `ganZhi` because the library's index-zero item is not filtered.
- “True solar time” is implemented as longitude × four minutes only. It omits the equation of time and historical/DST clock rules: [CLI correction](https://github.com/be-realdeveloper/saju/blob/25a5547b9ef1262cb8210abff8ecc7adfe5be8b5/.claude/skills/saju/engine/manse.cjs#L44-L135).
- Gyeokguk and yongsin are inferred with short element-count heuristics rather than a transparent, validated school-specific rule set: [heuristics](https://github.com/be-realdeveloper/saju/blob/25a5547b9ef1262cb8210abff8ecc7adfe5be8b5/.claude/skills/saju/engine/saju.js#L203-L243).
- Its effective 2024 Lichun boundary under the default Seoul correction was also approximately 17:00, earlier than KASI's 17:27.

The repository is MIT-licensed, and `lunar-javascript` is also MIT-licensed. That makes the narrative workflow much easier to reuse than Orrery, but license compatibility does not make the calculations correct.

## 3. `0ssw1/sajupy`

The reviewed revision was `071c80da720c837f93bfda52ae2cb162d9a4fa07`. It uses pandas/geopy and a bundled 73,442-row CSV covering 1900–2100.

### Fresh verification

- Normal project resolution failed because `requires-python >=3.7` conflicts with supported pandas versions across the declared Python range: [packaging metadata](https://github.com/0ssw1/sajupy/blob/071c80da720c837f93bfda52ae2cb162d9a4fa07/pyproject.toml).
- In an isolated compatible environment, all **13 tests passed**.
- The tests mostly check return shape and field presence rather than authoritative known-answer fixtures: [tests](https://github.com/0ssw1/sajupy/blob/071c80da720c837f93bfda52ae2cb162d9a4fa07/tests/test_sajupy.py).

### Reproduced correctness defects

- Leap-month detection compares the Gregorian day-of-month to a Gregorian value from the month's thirtieth table row. For the 2023 leap second lunar month, 2023-03-22 was marked leap, while 2023-04-01 and 2023-04-19 were incorrectly marked non-leap: [conversion code](https://github.com/0ssw1/sajupy/blob/071c80da720c837f93bfda52ae2cb162d9a4fa07/src/sajupy/core.py#L576-L628).
- At 2024-02-04 16:59, before KASI's 17:27 Lichun, the library returned the new-year pillar `甲辰`. Its month pillar considers term time, but the year pillar is taken directly from the daily table row: [pillar selection](https://github.com/0ssw1/sajupy/blob/071c80da720c837f93bfda52ae2cb162d9a4fa07/src/sajupy/core.py#L493-L502).
- The bundled table records 2024 Lichun at 17:00, also differing from KASI.
- The README's 1990-10-10 14:30 example reports `己未` day and `辛未` hour, while the code, Orrery, and `lunar-javascript` agree on `戊申` day and `己未` hour.
- Longitude correction uses a manually supplied fixed UTC offset and omits equation-of-time and IANA historical rules. Optional city resolution calls public Nominatim, adding network, privacy, and reproducibility concerns.

The repository is MIT-licensed, but no source or license is documented for the bundled calendar CSV. That dataset needs independent provenance and correctness validation before any reuse.

## 4. What the projects do and do not prove

All three calculation implementations agreed on a normal, non-boundary fixture:

```text
1990-10-10 14:30
Year 庚午 · Month 丙戌 · Day 戊申 · Hour 己未
```

Agreement on one ordinary date does not validate edge behavior. The meaningful disagreements appear near solar terms, leap months, historical clock rules, and day/hour transitions.

## Recommended product architecture

```text
Birth input
  -> normalized instant + place + explicit calculation policy
  -> deterministic, versioned chart engine
  -> structured facts with provenance
  -> interpretation rule layer
  -> optional LLM narration and follow-up chat
```

### Engine contract

Persist the original civil input and the normalized instant. Make these choices visible and versioned:

- civil time zone and historical offset source;
- standard time versus mean/apparent solar time;
- longitude and equation-of-time formula;
- day boundary and `자시` convention;
- solar-term data source and precision;
- lunar leap-month representation;
- daewoon direction and start-age method;
- interpretation school/version.

The LLM must never calculate pillars. It should receive only structured, engine-produced facts and must cite which facts support each interpretation.

### Required golden tests

- Every 24-term boundary at `-1`, `0`, and `+1` minute, checked against KASI or another declared authoritative ephemeris.
- 23:00, 23:30, midnight, 00:30, and 01:30 day/hour-policy boundaries.
- Korean historical offset changes and overseas DST transitions.
- Lunar new year, leap-month entry/exit, and month-end conversions.
- Longitude extremes and dates where solar correction crosses a civil date.
- Cross-implementation fixtures are useful only as secondary evidence; authoritative expected values must be independently sourced.

## MVP recommendation

Start Korean-first and Saju-only instead of shipping Saju, Ziwei, and natal astrology simultaneously.

1. Birth input, profile, and an explicit method summary.
2. Pillars and a compact set of traceable chart facts.
3. Five to eight useful reading sections rather than a fixed 18-section report padded with generic prose.
4. Evidence chips that reveal which pillar, ten-god, relation, or cycle supports a sentence.
5. Follow-up chat constrained to the calculated facts.
6. Local-first calculation; explicit consent and retention policy before any birth data is sent to an LLM service.

This path combines Orrery's product clarity with the Saju skill's consultation flow while avoiding dependence on an unverified third-party engine.

## Final adoption matrix

| Asset | Adopt | Adapt | Reject until resolved |
|---|---|---|---|
| Orrery input/result UX |  | Yes |  |
| Orrery source/core in a closed product |  |  | AGPL and upstream provenance |
| Orrery local-first calculation boundary | Yes |  |  |
| `be-realdeveloper/saju` report/Q&A pattern |  | Yes, reduce and ground it |  |
| `be-realdeveloper/saju` calculation heuristics |  |  | Accuracy and missing edge support |
| `sajupy` API/data-fixture idea |  | Only after independent validation |  |
| `sajupy` current engine or CSV |  |  | Reproduced defects and data provenance |
| Independent deterministic core with golden fixtures | Yes |  |  |

## Legal note

This review identifies engineering and licensing risks; it is not legal advice. Before commercial distribution, have counsel or the relevant rights holders confirm the exact obligations and provenance of any copied code or data.
