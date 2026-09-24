# Daewoon (Major Cycle) Calculation Policy

Status: implemented and regression-locked on 2026-09-24

Policy: `KR-DAEWOON-1.0@1.3.0`

Engine: `gyeol-daewoon-core@1.3.0`

Depends on: `KR-CIVIL-1.0@1.2.0` (natal pillars, historical Korean civil time, and jie ephemeris)

## Scope

This policy calculates the ten-year daewoon (大運) cycles for a natal chart computed under `KR-CIVIL-1.0`. Each cycle consists of a heavenly stem and earthly branch pair, a truncated start-age label, and a start year from the separately converted start date. The browser and server import the same framework-independent module. The server recalculates and verifies the daewoon result on submission.

Daewoon direction, start-age computation, and boundary convention are deterministic. This policy does not interpret daewoon meaning (strength analysis, yongsin interaction, gyeokguk transformation, daewoon × annual crossing) — that remains a future interpretation layer.

## Locked conventions

| Decision | `KR-DAEWOON-1.0` rule |
|---|---|
| Direction | Yang male / yin female → forward; yin male / yang female → backward (順行/逆行). Traditional sex parameter required. |
| Start point | Month pillar of the natal chart (月柱) |
| Step | Advance or retreat one stem-branch pair per 10-year cycle |
| Start age | 3-day-to-1-year convention: count the interval to the direction-dependent jie boundary, divide by 3, and truncate. Minimum start age is 0. |
| Direction-dependent boundary | Forward: next jie (節) after birth. Backward: previous jie (節) before birth. |
| Solar terms used | The twelve `jie` terms from `KR-CIVIL-1.0`: Xiaohan, Ipchun, Jingzhe, Qingming, Lixia, Mangzhong, Xiaoshu, Liqiu, Bailu, Hanlu, Lidong, Daxue. |
| Start year | Apply the traditional 1 day = 4 months and 1 shichen = 10 days conversion to the birth civil date; clamp month-end dates instead of allowing Gregorian date rollover. The displayed start year is the converted date's year, not necessarily birth year + truncated start age. |
| Cycle count | 1–8 cycles (ages startAge through startAge+70). The first cycle is retained once its birth-adjacent boundary is available; later cycles whose start year would exceed 2100 are omitted. The result includes `cycleCount` and `maxCycleCount` so consumers can detect truncation. |
| Age counting | `startAge` is the integer truncated offset used in the ten-year cycle labels. It is neither international age nor traditional Korean counting age; `startYear` uses the separate exact-date conversion above. |
| Precision | Jie instant is minute precision; the age label is integer years, truncated |
| Unknown time | Do not calculate daewoon. An unknown time is never replaced by noon because it changes the 절입-distance calculation. |
| Range | Birth dates 1900-01-01–2100-12-31. A generated 2101 Xiaohan sentinel is retained only to close the forward-boundary calculation for late-December 2100 births. |

This is a product calculation policy, not a claim that all Saju schools use the same conventions. Saved results retain their policy and engine versions.

## Algorithm

1. Determine direction from year-stem polarity and explicit sex: yang male / yin female → forward; yin male / yang female → backward. If the traditional sex parameter is absent, do not calculate daewoon.
2. Find the direction-dependent jie boundary (next for forward, previous for backward).
3. Resolve the birth civil time using the historical `Asia/Seoul` policy. Compare its UTC instant to the jie UTC instant to choose the boundary; when calculating the traditional shichen and calendar-day deltas, express both instants in the same `Asia/Seoul` legal civil clock. No longitude-only or mixed UTC+8/UTC+8:30 shift is applied.
4. Count the shichen and civil-day delta. Apply `monthDiff = floor(hourDiff * 10 / 30)` and `totalMonths = dayDiff * 4 + monthDiff`; if the shichen difference crosses midnight, normalize it by 12 shichen and one civil day. `startAge = max(0, floor(totalMonths / 12))`.
5. Convert the residual interval with 1 shichen = 10 days. Add converted years, months, and days to the birth civil date using month-end clamping.
6. Compute cycle count: retain the first cycle, then include up to seven more cycles whose converted start year does not exceed 2100.
7. First cycle = month pillar advanced or retreated by one sexagenary pair. Each subsequent cycle moves one pair in the same direction and starts ten years later.

## Verification

The server calls `verifyDaewoon()` on every submission that includes `chartResult.daewoon`. Verification checks:
- schemaVersion, policy id/version/engine/engineVersion/range
- direction, startAge, startAgeRule, boundaryTerm/Date/Direction
- cycleCount, maxCycleCount
- input fields (date, time, unknownTime, sex, yearStem, monthStem, monthBranch)
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
- unknown-time rejection (no noon proxy);
- historical Korean legal-civil-time handling rather than a fixed UTC+9 offset;
- identical time-axis handling for birth and jie instants;
- non-negative start ages at and within one hour of jie boundaries, including `2020-03-05 11:30` before Jingzhe;
- month-end clamping during the exact start-date conversion;
- calendar date and time validation (rejects Feb 30, 99:99);
- ephemeris range and dynamic cycle truncation;
- verifyDaewoon tamper detection on policy, boundary, sex, startYear, and cycle fields.

Daewoon interpretation (strength, yongsin, gyeokguk, interaction with annual readings) is intentionally not implied by passing daewoon tests.
