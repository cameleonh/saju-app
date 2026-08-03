# Annual Reading Policy v1

## Scope

`ziping-annual-basic@1.1.0` is a bounded, Ziping-derived annual interpretation profile. It uses the natal day stem, natal month branch as context, the target-year stem's ten-god relation to the day master, and explicitly enumerated target-year branch relations to natal branches. It is not a complete or scientifically validated implementation of Ziping astrology.

Included rules:

- day-master-relative ten-god for the annual and monthly visible stems;
- natal month branch as seasonal context without strength scoring;
- six clashes (`子午`, `丑未`, `寅申`, `卯酉`, `辰戌`, `巳亥`);
- six harmonies (`子丑`, `寅亥`, `卯戌`, `辰酉`, `巳申`, `午未`);
- clash before harmony when both states are present, while both calculated relation facts remain visible.

Excluded rules:

- definitive structure (`gyeokguk`) classification or useful-god (`yongsin`) selection;
- strong/weak day-master scoring, johu, byeongyak, tonggwan, jeonwang, or jonggyeok;
- punishment, destruction, harm, special combinations, and unlisted precedence rules;
- annual hidden-stem activation or weighting. Natal hidden stems remain displayable chart facts only;
- deterministic claims about health, death, litigation, investment, promotion, divorce, or other consequential events.

## Annual boundary and fixture authority

`KR-ANNUAL-IPCHUN-1.1@1.1.0` defines an annual label from the exact Ipchun minute in the target civil year through, but excluding, the next Ipchun.

- Enabled target years: `2024..2026` only.
- Checked-in fixture years: `2024..2027`, because the 2026 annual range and twelfth solar month need 2027 closing boundaries.
- Time zone: `Asia/Seoul`; source precision: one minute.
- A year is enabled only when its Ipchun, all twelve month-start terms, the following year's Xiaohan, and the following year's Ipchun are present.
- The twelfth month correctly runs from the following year's Xiaohan to the following year's Ipchun.

The primary authority is the annually published Korean almanac requirement (`월력요항`). KASI/KASA describe it as the national calendar-making reference under the Astronomy Act. Exact KST minute values are transcribed into source-versioned fixtures from KASI's year-table surface. The general year-table page is a transcription surface, not itself described here as the legal approval artifact.

References:

- [KASI 2026 almanac announcement](https://www.kasi.re.kr/kor/post/newsMaterial/32031)
- [KASA 2027 almanac announcement](https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431)
- [KASI official almanac index](https://astro.kasi.re.kr/life/post/almanac)
- [KASI year tables](https://astro.kasi.re.kr/life/post/calendardata)

`lunar-javascript@1.7.7` remains pinned for lunar-to-solar conversion elsewhere in the product. It is not the annual boundary oracle.

## Fact, rule, and claim trace

The generation chain is:

```text
calculated fact -> versioned interpretation rule -> bounded claim -> practical prompt
```

Every fact has a stable ID, Korean label, normalized value, detail, status, and an actual source object with `kind`, `id`, and `version`. Boundary facts cite the ephemeris fixture source; interpretation facts cite the rule set; natal context cites the original chart policy and engine versions.

`ziping-annual-cards@1.1.0` stores each card rule as structured data with:

- rule ID/version and card type;
- required fact IDs;
- prohibited/conflicting states and priority;
- allowed claim categories and Korean copy variants;
- safety rewrite/suppression metadata.

Only the rule missing required facts is suppressed. Every rendered card and monthly entry carries rule provenance and claim trace. When clash and harmony coexist, the clash copy variant wins by documented priority without deleting the harmony fact.

## Output contract

A valid `annual-reading.v1` result contains:

- mandatory natal chart policy ID/version and engine ID/version;
- annual policy, ephemeris source, effective range, and `boundaryFlags`;
- interpretation profile and rule-set versions;
- annual plus evidence-addressable monthly facts;
- exactly eight ordered `annual-card.v1` cards;
- twelve separate solar-term monthly entries with pillar, range, rule, evidence, `boundarySensitive`, and explicit `unsupportedState`;
- result-level `claimTrace`, `suppressedRules`, `unsupportedStates`, and SHA-256 content hash.

Unknown natal time records an unsupported natal-hour state. It does not suppress the eight v1 cards because this profile has no hour-dependent card rule.

## Safety, privacy, and persistence

Cards describe a bounded tendency and pair it with a practical check. Unsupported or high-consequence claims are suppressed rather than replaced with generic prediction text. Medical, legal, financial, and crisis decisions are redirected to real evidence and qualified professionals.

Privacy-safe annual JSON and print/PDF exclude raw birth input, exact location, record identifiers, and consent metadata. The annual object itself contains no such fields, so its policy, facts, cards, monthly flow, boundary/unsupported states, and claim trace can round-trip without loss.

Browser IndexedDB stores natal and annual objects as separate properties. SQLite retains queryable annual columns and an additive complete `annual_result_json`; PostgreSQL retains the queryable columns and a complete `annual_result jsonb`. Training projection remains purpose-gated and excludes raw birth input and exact location. Withdrawing training use clears the projection while preserving the service record; deleting the submission cascades to its annual result.
