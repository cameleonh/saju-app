# Daewoon (Major Cycle) Calculation Policy

Status: implemented and regression-locked on 2026-08-05

Policy: `KR-DAEWOON-1.0@1.0.0`

Engine: `gyeol-daewoon-core@1.0.0`

Depends on: `KR-CIVIL-1.0@1.0.0` (natal pillars), `KR-ANNUAL-IPCHUN-1.1@1.1.0` (annual boundary convention)

## Scope

This policy calculates the ten-year daewoon (大運) cycles for a natal chart computed under `KR-CIVIL-1.0`. Each cycle consists of a heavenly stem and earthly branch pair, a start age, and an exact start instant in Korean civil time. The browser and server import the same framework-independent module.

Daewoon direction, start-age computation, and boundary convention are deterministic. This policy does not interpret daewoon meaning (strength analysis, yongsin interaction, gyeokguk transformation) — that remains a future interpretation layer.

## Locked conventions

| Decision | `KR-DAEWOON-1.0` rule |
|---|---|
| Direction | Standard ziping: year-stem yang → forward, year-stem yin → backward (順行/逆行) |
| Start point | Month pillar of the natal chart (月柱) |
| Step | Advance or retreat one stem-branch pair per 10-year cycle (天干地支 각각 1보씩) |
| Start age | 3-day-to-1-year convention: count days from birth to the nearest direction-dependent solar term boundary, divide by 3, round down to whole years. Minimum start age is 0 (birth year). |
| Direction-dependent boundary | Forward direction: next solar term (節) after birth. Backward direction: previous solar term (節) before birth. |
| Solar terms used | The twelve `jie` (節) terms from `KR-CIVIL-1.0`: Xiaohan, Ipchun, Jingzhe, Qingming, Lixia, Mangzhong, Xiaoshu, Liqiu, Bailu, Hanlu, Lidong, Daxue. |
| Cycle boundary | Exact instant of Ipchun (立春) in the cycle's start year, matching `KR-ANNUAL-IPCHUN-1.1` |
| Age counting | Korean age (만나이 is not used); cycle start age = Korean age at which the cycle begins |
| Precision | Day-level for start-age calculation; minute-level for boundary instants |
| Unknown time | If birth time is unknown, start age uses noon (12:00) as the proxy birth time |
| Range | 1900–2100 (same as natal ephemeris) |

This is a product calculation policy, not a claim that all Saju schools use the same conventions. Saved results retain their policy and engine versions.

## Algorithm

1. Compute the natal month pillar under `KR-CIVIL-1.0`.
2. Determine direction from the year stem: 甲丙戊庚壬 (yang) → forward; 乙丁己辛癸 (yin) → backward.
3. Find the direction-dependent jie boundary:
   - Forward: the next jie term after the birth date.
   - Backward: the previous jie term before the birth date.
4. Count days from birth to that boundary (forward = boundary − birth; backward = birth − boundary).
5. Start age = floor(days / 3). Minimum 0.
6. First cycle = month pillar (age = start age).
7. Each subsequent cycle = month pillar advanced (forward) or retreated (backward) by one stem-branch pair, for 8 cycles total (covering ages ~0–80).
8. Each cycle's start year = birth year + (start age + cycle_index × 10).

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
- range rejection (out of 1900–2100).

Daewoon interpretation (strength, yongsin, gyeokguk, interaction with annual readings) is intentionally not implied by passing daewoon tests.
