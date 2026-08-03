# Annual Reading Policy v1

## Scope

`ziping-annual-basic@1.0.0` is a bounded, Ziping-derived annual interpretation profile. It uses the natal day stem, natal month branch as context, the target-year stem's ten-god relation to the day master, and explicitly enumerated target-year branch relations to natal branches.

It is not presented as a complete or scientifically validated implementation of Ziping astrology.

Included rules:

- day-master-relative ten-god for the annual stem;
- natal month branch as seasonal context without strength scoring;
- six clashes (`子午`, `丑未`, `寅申`, `卯酉`, `辰戌`, `巳亥`);
- six harmonies (`子丑`, `寅亥`, `卯戌`, `辰酉`, `巳申`, `午未`);
- clash before harmony if a future rule set permits a conflict.

Excluded rules:

- definitive structure (`gyeokguk`) classification;
- useful-god (`yongsin`) selection;
- strong/weak day-master scoring;
- johu, byeongyak, tonggwan, jeonwang, and jonggyeok decisions;
- punishment, destruction, harm, special combinations, and hidden precedence rules;
- deterministic health, death, litigation, investment, divorce, promotion, or other high-consequence predictions.

## Calculation Policy

`KR-ANNUAL-IPCHUN-1.0@1.0.0` defines one annual year as the instant of Ipchun in the target civil year through the instant immediately before the next Ipchun.

- Supported target labels: `1900..2099`.
- Display time zone: `Asia/Seoul`.
- Solar-term implementation source: `lunar-javascript@1.7.7`, which exposes the ShouXing-based JieQi table.
- Source wall-time assumption: UTC+08:00; the policy applies a recorded `+60 minute` conversion to `Asia/Seoul`.
- Golden boundary anchor: `2024-02-04T17:27:07+09:00`, tested at minus one minute, exact instant, and plus one minute.
- Unsupported years and missing ephemeris values are rejected; the engine does not fall back to February 4 or January 1.

The package is pinned and versioned, but it is not described as an official Korean government ephemeris. Before using the result as a production calendrical oracle, the supported range needs an independently reviewed Korean astronomical fixture set. The implementation source and this limitation stay visible in product and project documentation.

Reference sources:

- [lunar-javascript repository](https://github.com/6tail/lunar-javascript)
- [lunar-javascript 1.7.7 package](https://www.npmjs.com/package/lunar-javascript/v/1.7.7)
- [Korea Astronomy and Space Science Institute special-day API](https://www.data.go.kr/data/15012690/openapi.do)

## Fact and Rule Trace

The deterministic trace is:

```text
calculated fact -> versioned rule -> bounded card claim -> practical prompt
```

Every annual fact has a stable ID, Korean label, normalized value, detail, source policy/version, and status. Cards are suppressed when their required facts are missing. Valid readings produce exactly eight `annual-card.v1` objects in this order: cover, overall, work, money, relationships, growth, action, and method.

Monthly flow is a separate 12-entry disclosure. Each entry records its solar-term range, month pillar, theme, practical use, caution, evidence IDs, and support status. It is not appended to the default eight-card deck.

## Privacy and Safety

Annual card exports contain only the annual policy, profile, facts, cards, monthly flow, and content hash. They exclude raw birth input, exact location, local/server record IDs, and consent metadata.

All cards describe tendencies and reflection prompts. Medical, legal, financial, crisis, and other high-consequence decisions must use real-world evidence and qualified professionals. Unsupported predictions are suppressed rather than replaced with generic fortune prose.
