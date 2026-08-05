# Daewoon (Major Cycle) Calculation Policy

Status: implemented and regression-locked on 2026-08-05

Policy: `KR-DAEWOON-1.0@1.0.0`

Engine: `gyeol-daewoon-core@1.0.0`

Depends on: `KR-CIVIL-1.0@1.0.0` (natal pillars), `KR-ANNUAL-IPCHUN-1.1@1.1.0` (annual boundary convention)

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
| Cycle count | Up to 8 cycles (ages startAge through startAge+70). Cycles are truncated when the last cycle's start year would exceed the 2100 ephemeris boundary. The result includes `cycleCount` and `maxCycleCount` so consumers can detect truncation. |
| Age counting | Korean age (만나이 is not used); cycle start age = Korean age at which the cycle begins |
| Precision | Day-level for start-age calculation |
| Unknown time | If birth time is unknown, start age uses noon (12:00) as the proxy birth time |
| Range | 1901–2100 (same ephemeris as natal) |

This is a product calculation policy, not a claim that all Saju schools use the same conventions. Saved results retain their policy and engine versions.

## Algorithm

1. Determine direction from the year stem: 甲丙戊庚壬 (yang) → forward; 乙丁己辛癸 (yin) → backward.
2. Find the direction-dependent jie boundary (next for forward, previous for backward).
3. Count days from birth to that boundary. Start age = floor(days / 3). Minimum 0.
4. Compute cycle count: 8 cycles, or fewer if the last cycle's start year exceeds 2100.
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
- unsupportedStates array (id, status)

Any mismatch produces a 422 rejection.

## Provenance

Daewoon boundaries reuse the same ephemeris as `KR-CIVIL-1.0` (`chart/natal-ephemeris-data.mjs`). No separate astronomical data is introduced.

## Verification contract

`tests/unit/daewoon.mjs` locks:

- direction (yang-forward, yin-backward);
- start age calculation (3-day-to-1-year);
- cycle sequence (stem-branch progression);
- boundary alignment with natal month pillar;
- consistency with `KR-CIVIL-1.0` solar-term boundaries;
- unknown-time handling (noon proxy);
- calendar date and time validation (rejects Feb 30, 99:99);
- ephemeris range and dynamic cycle truncation;
- verifyDaewoon tamper detection on policy, boundary, startYear, and cycle fields.

Daewoon interpretation (strength, yongsin, gyeokguk, interaction with annual readings) is intentionally not implied by passing daewoon tests.
