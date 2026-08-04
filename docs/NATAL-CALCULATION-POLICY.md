# Natal Calculation Policy

Status: implemented and regression-locked on 2026-08-04

Policy: `KR-CIVIL-1.0@1.0.0`

Engine: `gyeol-natal-core@1.0.0`

## Scope

This policy calculates the four natal pillars for normalized solar dates from `1900-01-01` through `2100-12-31`. The browser and server import the same framework-independent module. The browser calculates locally and offline; the submission adapter recalculates the pillars and rejects tampered or stale-policy results.

Lunar input is converted to a normalized solar input by the separately versioned `lunar-javascript@1.7.7` adapter. The original lunar input, leap-month flag, conversion provenance, and normalized value remain distinct.

## Locked conventions

| Decision | `KR-CIVIL-1.0` rule |
|---|---|
| Input clock | Korean legal civil time in `Asia/Seoul` |
| Historical offsets | Embedded IANA tzdb `Asia/Seoul` 2026c transition snapshot |
| Repeated clock time | Use the earlier instant and emit a warning |
| Nonexistent clock time | Reject the input |
| Longitude / solar correction | None; do not silently convert to mean or apparent solar time |
| Year boundary | Exact minute of Ipchun (`LI_CHUN`), start-inclusive |
| Month boundaries | Twelve `jie` terms: Xiaohan, Ipchun, Jingzhe, Qingming, Lixia, Mangzhong, Xiaoshu, Liqiu, Bailu, Hanlu, Lidong, Daxue |
| Term precision | Minute |
| Day boundary | Civil midnight (`00:00`) |
| Zi hour | `23:00–00:59`; the hour branch spans midnight, while the day pillar changes only at midnight |
| Unknown time | Suppress the hour pillar and time-dependent interpretation |
| Daewoon | Unsupported until a direction and start-age policy receives separate domain approval |

This is a product calculation policy, not a claim that all Saju schools use the same conventions. Saved results retain their policy and engine versions; a future policy creates a new result instead of silently rewriting an old one.

## Ephemeris provenance

`chart/natal-ephemeris-data.mjs` is a generated, checked-in minute snapshot for 1899–2100. It contains only the twelve year/month boundary terms needed by this policy. `scripts/generate-natal-ephemeris.mjs` regenerates the snapshot from the pinned MIT-licensed `lunar-javascript@1.7.7` ShouXing implementation.

For 2024–2027, the generator replaces those calculated values with the reviewed KASI/KASA Korean almanac KST-minute fixtures already used by the annual engine. Across all 12 policy boundaries in those four years, the generated source differs from the reviewed fixtures by at most one minute before replacement. The authoritative fixtures therefore determine runtime results in the reviewed range; outside it, the result identifies the generated snapshot as its calculation source and the official range as validation evidence.

Primary references:

- KASI astronomical almanac and calendar data: <https://astro.kasi.re.kr/life/post/almanac>
- KASI calendar data service: <https://astro.kasi.re.kr/life/post/calendardata>
- IANA time-zone database 2026c: <https://data.iana.org/time-zones/tzdb-2026c/>

## Verification contract

`tests/natal.mjs` locks:

- the ordinary `1990-10-10 14:30` fixture (`庚午 · 丙戌 · 戊申 · 己未`);
- exact Ipchun and Jingzhe changes;
- all 12 natal-relevant official term boundaries for every fixture year 2024–2027;
- rendered before/after year-month alternatives for inputs within one hour of a policy-changing term;
- `23:00`, `23:30`, midnight, `00:30`, and `01:30` day/hour behavior;
- historical half-hour, daylight-saving, skipped, and repeated Korean civil times;
- unknown-time suppression, malformed dates/times, supported range, host-time-zone independence, and server-side tamper detection.

The annual suite separately covers Ipchun `-1 / exact / +1` behavior and its reviewed 12-month range. Lunar conversion tests cover the adapter path. Daewoon, longitude correction, apparent-solar time, overseas birthplaces, and school-specific strength/yongsin/gyeokguk rules are intentionally not implied by the passing natal tests.
