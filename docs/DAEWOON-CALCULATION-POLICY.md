# Daewoon (Major Cycle) Calculation Policy

Status: implemented and regression-locked on 2026-08-05

Policy: `KR-DAEWOON-1.0@1.0.0`

Engine: `gyeol-daewoon-core@1.0.0`

Depends on: `KR-CIVIL-1.0@1.0.0` (natal pillars, historical Korean civil time, and jie ephemeris)

## Scope

This policy calculates the ten-year daewoon (大運) cycles for a natal chart computed under `KR-CIVIL-1.0`. Each cycle consists of a heavenly stem and earthly branch pair, a start age, and a start year (birth year + start age). The browser and server import the same framework-independent module. The server recalculates and verifies the daewoon result on submission.

Daewoon direction, start-age computation, and boundary convention are deterministic. This policy does not interpret daewoon meaning (strength analysis, yongsin interaction, gyeokguk transformation, daewoon × annual crossing) — that remains a future interpretation layer.

## Locked conventions

| Decision | `KR-DAEWOON-1.0` rule |
|---|---|
| Direction | Standard ziping: year-stem yang → forward, year-stem yin → backward (順行/逆行) |
| Start point | Month pillar of the natal chart (月柱) |
| Step | Advance or retreat one stem-branch pair per 10-year cycle |
| Start age | 3-day-to-1-year convention: count days from birth to the nearest direction-dependent jie boundary, divide by 3, round down. Minimum start age is 0. |
| Direction-dependent boundary | Forward: next jie (節) after birth. Backward: previous jie (節) before birth. |
| Solar terms used | The twelve `jie` terms from `KR-CIVIL-1.0`: Xiaohan, Ipchun, Jingzhe, Qingming, Lixia, Mangzhong, Xiaoshu, Liqiu, Bailu, Hanlu, Lidong, Daxue. |
| Start year | Birth year + start age. This is a calendar-year indicator, not an exact Ipchun instant. |
| Cycle count | 1–8 cycles (ages startAge through startAge+70). The first cycle is retained once its birth-adjacent boundary is available; later cycles whose start year would exceed 2100 are omitted. The result includes `cycleCount` and `maxCycleCount` so consumers can detect truncation. |
| Age counting | Policy year offset: `startAge` is the integer offset used by `startYear = birthYear + startAge`. It is neither international age nor traditional Korean counting age. |
| Precision | Day-level for start-age calculation |
| Unknown time | If birth time is unknown, start age uses noon (12:00) as the proxy birth time |
| Range | Birth dates 1900-01-01–2100-12-31. A generated 2101 Xiaohan sentinel is retained only to close the forward-boundary calculation for late-December 2100 births. |

This is a product calculation policy, not a claim that all Saju schools use the same conventions. Saved results retain their policy and engine versions.

## Algorithm

1. Determine direction from the year stem: 甲丙戊庚壬 (yang) → forward; 乙丁己辛癸 (yin) → backward.
2. Find the direction-dependent jie boundary (next for forward, previous for backward).
3. Resolve the birth input with the same historical `Asia/Seoul` legal-civil-time rules as `KR-CIVIL-1.0`, then count days to the boundary. Start age = floor(days / 3). Minimum 0.
4. Compute cycle count: retain the first cycle, then include up to seven more cycles whose start year does not exceed 2100.
5. First cycle = month pillar (age = start age).
6. Each subsequent cycle = month pillar advanced (forward) or retreated (backward) by one stem-branch pair.
7. Each cycle's start year = birth year + cycle start age.

## Verification

The server calls `verifyDaewoon()` on every submission that includes `chartResult.daewoon`. Verification checks:
- schemaVersion, policy id/version/engine/engineVersion/range
- direction, startAge, startAgeRule, boundaryTerm/Date/Direction
- cycleCount, maxCycleCount
- input fields (date, time, unknownTime, yearStem, monthStem, monthBranch)
- natalPolicy id/version
- every cycle (index, pillar, stem, branch, startAge, startYear, direction)
- unsupportedStates array (id, status, reason)

Any mismatch produces a 422 rejection.

## Provenance

Daewoon boundaries reuse the same ephemeris as `KR-CIVIL-1.0` (`chart/natal-ephemeris-data.mjs`). No separate astronomical data is introduced.
The checked-in snapshot includes the generated 2101 Xiaohan sentinel required to calculate the next jie boundary for the final supported birth dates; it does not expand the supported birth-date range beyond 2100-12-31.

## Verification contract

`tests/unit/daewoon.mjs` locks:

- direction (yang-forward, yin-backward);
- start age calculation (3-day-to-1-year);
- cycle sequence (stem-branch progression);
- boundary alignment with natal month pillar;
- consistency with `KR-CIVIL-1.0` solar-term boundaries;
- unknown-time handling (noon proxy);
- historical Korean legal-civil-time handling rather than a fixed UTC+9 offset;
- calendar date and time validation (rejects Feb 30, 99:99);
- ephemeris range and dynamic cycle truncation;
- verifyDaewoon tamper detection on policy, boundary, startYear, and cycle fields.

Daewoon interpretation (strength, yongsin, gyeokguk, interaction with annual readings) is intentionally not implied by passing daewoon tests.
