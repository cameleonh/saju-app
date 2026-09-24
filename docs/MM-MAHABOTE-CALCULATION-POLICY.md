# Myanmar Mahabote Calculation Policy

Policy: `MM-MAHABOTE-1.0@1.2.0`
Engine: `gyeol-mahabote-core@1.2.0`
Scope: natal weekday/BE/remainder/seven-house chart facts only.

## Selected birth-chart arithmetic

1. Convert the Gregorian year to the Mahabote Burmese year using the selected common rule: subtract 639 through April 15; subtract 638 from April 16 onward.
2. Take the Burmese year modulo 7. Remainders map to the first-house planet as `1 Sun, 2 Moon, 3 Mars, 4 Mercury, 5 Jupiter, 6 Venus, 0 Saturn`.
3. Fill the seven houses in the Mahabote sequence: Sun → Mercury → Saturn → Mars → Venus → Moon → Jupiter.
4. Mark the weekday planet. Wednesday after 12:00 uses Rahu in Mercury's house. If the birth time is unknown on Wednesday, the house remains calculable but the AM/PM birth-planet label is returned as ambiguous.

## Scope limits

The Gregorian year split and weekday/house arithmetic follow the cited worked methods. The repository does not have a locked source/oracle for the age-mod-7 annual-house rotation or daily fortune rule. Those annual and daily predictions are therefore suppressed. The output is a birth-chart calculation, not a complete predictive Mahabote reading.

## Verification

`tests/unit/mahabote.mjs` checks the published 1985-02-20 worked example (BE 1346, remainder 2), the seven-house planetary order, Wednesday AM/PM, an unknown-Wednesday partial, date validation, and the fact that unverified annual/daily forecasts return no result.

## References

- [Dirah: Learning Burmese Astrology (Mahabote), Lesson 1](https://www.dirah.org/mahabote.htm)
- [Sage Asita: Mahabote Part One](http://www.sageasita.com/mahabote-part-one.html)
- [Burmese calendar and Myanmar New Year background](https://en.wikipedia.org/wiki/Burmese_calendar)
