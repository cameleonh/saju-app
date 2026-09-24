# Thai Horasat Calculation Policy

Policy: `TH-HORASAT-1.0@1.2.0`
Engine: `gyeol-horasat-core@1.2.0`
Scope: weekday observances, Lahiri sidereal Sun sign, and selected astronomical transit facts.

## Selected rules

- Birth weekday is the Gregorian local date supplied by the birth profile.
- Wednesday is divided at 06:00 and 18:00 local time; Wednesday 18:00–05:59 is the Rahu period.
- Sun rasi is calculated from the apparent geocentric tropical Sun longitude minus the pinned Lahiri ayanamsa reference (`23.853055°` at J2000, precession `50.290966` arcseconds/year).
- Year-specific sign ingresses are generated to the minute with the pinned `astronomy-engine@2.1.19`; the checked-in table is `chart/horasat-rasi-data.mjs`.
- The annual transit fact is the first direct Jupiter sign ingress in the Gregorian target year from the pinned 2024–2035 table. Its displayed house offset is explicitly a whole-sign offset from the natal **Sun sign**.

## Scope limits

This is a source-bounded Hora subset, not a complete Thai birth chart. It does not calculate Lagna/ascendant, planetary placements in all houses, or a Thai Suriyayatra ephemeris. The Sun-sign Jupiter offset is a technical comparison fact; no event-prediction or annual advice prose is emitted. Daily output is limited to the weekday ruler, color, and Buddha posture table.

Exact birth time is required because it determines the instant used for Sun sign and Wednesday's day/night split. A non-Seoul IANA-time-zone profile is blocked unless it has a resolved UTC instant. Unknown time is never replaced by noon.

## Verification

`tests/unit/horasat.mjs` checks the weekday table, a standard natal fixture, the generated 2026 Lahiri Mesha ingress at one minute before/exact, and that annual output contains transit facts but no unsupported forecast text. The generated ingress data can be reproduced with `npm run generate:horasat-rasi`.

## References

- [MyHora: Thai astrology, Nirayana, and the different Lahiri/Suriyayatra calendars](https://myhora.com/content?0045)
- [Astronomy Engine](https://github.com/cosinekitty/astronomy), MIT, pinned generator version `2.1.19`
- [The Nation Thailand: Maha Songkran 2026](https://www.nationthailand.com/life/art-culture/40064982)
