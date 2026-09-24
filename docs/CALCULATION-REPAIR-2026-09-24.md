# Calculation Repair — 2026-09-24

This change set replaces mismatched clock/calendar assumptions and suppresses forecast layers without a source-locked formula. It does not claim one universal school for all Saju or Southeast Asian astrology.

## Korean Saju and Daewoon

- Replaced the Chinese-calendar-based Korean lunar adapter with `korean-lunar-calendar@0.4.0`, whose upstream documentation identifies the KASI Korean calendar lineage. The supported lunar range is explicitly capped at 1900-01-01 through 2050-11-18; impossible dates and leap-month flags are rejected.
- Locked the 2017 Korean/Chinese divergence: Korean lunar leap fifth-month day 1 is 2017-06-24, while Chinese lunar date for that solar day is sixth-month day 1. The browser table and server converter use the same pinned Korean data source.
- `KR-CIVIL-1.0@1.2.0` compares the Korean civil birth instant and KASI/KASA Jie instant on the same UTC timeline. The previous birth-only `−30 minute` shift was removed; 2024 Ipchun now changes at the fixture's actual `17:27 KST`, not `17:57`.
- Day and hour pillars use the declared Asia/Seoul civil midnight and two-hour intervals. No birthplace-longitude or equation-of-time correction is applied by this policy.
- `KR-DAEWOON-1.0@1.3.0` requires exact birth time and the traditional sex parameter. It computes birth and Jie shichen in the same Asia/Seoul legal clock, clamps the age label at zero, and clamps Gregorian month-end dates during exact start-date conversion. Unknown time or unspecified sex no longer receives a guessed result.
- Regression: `2020-03-05 11:30` no longer returns a negative start age. Tests exercise both directions within ±60 minutes of every 12 Jie for 2024–2027.

## Thai Horasat subset

- Replaced static Gregorian sign-date bins with minute-resolution ingress data generated from Astronomy Engine apparent solar longitude and the versioned Lahiri reference (`23.853055°` at J2000; `50.290966″/year` precession).
- The birthday weekday ruler/color/Buddha table is kept. Exact birth time and a resolved Seoul instant are required for the enabled profile path.
- Annual output is limited to the pinned Jupiter ingress fact and its explicitly Sun-sign-based whole-sign offset. Unsupported fortune prose is removed. The policy is not a full Thai Lagna/planetary chart.

## Vietnamese Tử Vi

- Replaced the Chinese UTC+8 lunar-date adapter with the Hồ Ngọc Đức Vietnamese GMT+7/105°E lunisolar algorithm. The 1985 divergence is a locked regression: Vietnamese Tết 1985 is Jan 21, while the Chinese lunar year starts Feb 20.
- Exact birth time is required; noon is never inserted for unknown time. Đại Hạn uses the yang-year/gender direction matrix; Tiểu Hạn uses the male-reverse/female-forward matrix. The traditional sex input is preserved and never inferred.
- Annual output contains calculated year-palace, star, Đại Hạn, and Tiểu Hạn placements only. Daily palace rotation and event-prediction prose without a locked source are withheld.

## Myanmar Mahabote

- Validated and retained the published natal arithmetic: April 15 BE offset, remainder-to-first-house mapping, seven-planet sequence, and Wednesday-PM Rahu replacing Mercury.
- Invalid dates are rejected. An unknown Wednesday no longer invents a daytime birth planet; it returns both possible weekday labels while retaining the same Mercury/Rahu house.
- Annual and daily forecasts are withheld until a source-backed rule and independent fixtures are available.

## Verification

- `npm test` passes the complete unit, HTTP, submission, and lifecycle suite.
- `tests/natal.mjs` checks all 48 reviewed KASI/KASA Jie boundaries at their exact Asia/Seoul minute.
- `tests/unit/daewoon.mjs` checks the formerly negative Jingzhe edge and both directions around all reviewed Jie boundaries.
- `tests/unit/horasat.mjs` checks the generated Lahiri ingress at one minute before and at the exact minute.
- `tests/unit/tu-vi.mjs` checks Vietnamese 1985 new year/leap-month fixtures and gendered cycle directions.

## Sources

- [KASI almanac](https://astro.kasi.re.kr/life/post/almanac)
- [Korean lunar calendar package and KASI lineage notes](https://github.com/usingsky/korean_lunar_calendar_js)
- [Hồ Ngọc Đức Vietnamese lunar calendar rules](https://xemamlich.uhm.vn/calrules_en.html)
- [MyHora Thai sidereal calendar and sign boundaries](https://myhora.com/content?0045)
- [Astronomy Engine](https://github.com/cosinekitty/astronomy)
- [Dirah Mahabote Lesson 1](https://www.dirah.org/mahabote.htm)
- [Sage Asita Mahabote Part One](http://www.sageasita.com/mahabote-part-one.html)
