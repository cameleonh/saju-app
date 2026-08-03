# Check Evidence

Date: 2026-08-04 KST

## Automated gates

- `npm test`: 315 assertions passed.
  - annual policy/client: 82
  - chart/UI smoke: 128
  - record lifecycle: 44
  - HTTP/SQLite ingestion: 61
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `git diff --check`: passed.
- Stale-policy scan found no active claim that annual readings support 1900–2099 or use `lunar-javascript` as the annual boundary oracle. The remaining matches are a negative regression assertion and an explicit statement that the dependency is used only for lunar-date conversion.
- `gitleaks` and `semgrep` were unavailable. A repository scan found no private-key blocks or common GitHub, OpenAI, or AWS credential formats in tracked and untracked project files.

## Requirement activation matrix

| Risk or branch | Evidence |
|---|---|
| Unsupported target year | Domain and HTTP tests reject years outside 2024–2026. |
| Missing ephemeris fixture | Annual tests remove the closing fixture and require explicit failure. |
| Ipchun edge | Every supported year is checked at -1 minute, exact instant, +1 minute, and end-exclusive closing instant. |
| Missing required fact | Only dependent rules are suppressed; independent cards remain. |
| Clash and harmony conflict | Default clash priority and an alternate declared priority both change the selected variant deterministically. |
| Unknown birth time | Time-dependent state is unsupported while the eight v1 cards remain because they do not use the hour branch. |
| Hash or content tampering | Server ingestion recomputes the annual result and rejects modified content. |
| Missing provenance | Domain and HTTP tests reject incomplete natal chart policy/source fields. |
| Legacy SQLite schema | Additive migration upgrades an old annual table and then round-trips the complete object. |
| Training withdrawal | Projection is removed while the service annual result remains intact. |
| Submission deletion | Foreign-key cascade removes the annual row. |
| IndexedDB reopen/delete | Browser and injected-adapter tests preserve the exact annual object/hash and delete both record and outbox state. |
| Focus/reduced motion | Chromium moved focus to the selected card, showed a 3px gold ring, and reduced transition duration to 0.01ms. |
| Responsive/document/print privacy | Chromium found zero overflow at five required widths; print exposed the ordered annual document but no natal, monthly, birth, place, record, or consent content. |

## Review axes

The standards-axis and spec-axis native review agents both failed before returning content because their encrypted function output could not be decoded. This was a transport failure, not a code verdict. After two distinct reviewer failures, the leader reclaimed the check and reviewed the entire `add6849`-to-working-tree delta against Issue #1 and all three owner review comments.

The leader review found and repaired two final traceability issues before this evidence was recorded:

- card conflict selection now consumes the rule set's declared `relationPriority` instead of duplicating that order in evaluator code;
- the cover card now has exactly three required facts and every displayed material claim is covered by its one-to-three visible evidence references.

Fresh automated and browser gates passed after those repairs. Verdict: **PASS**.
