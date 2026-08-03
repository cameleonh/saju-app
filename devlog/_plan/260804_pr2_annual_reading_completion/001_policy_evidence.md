# Policy Evidence

## Source decision

The enabled v1 target range is `2024..2026`. A target year is enabled only when the repository contains exact Korea Standard Time solar-term fixtures for that year and the following year's closing Ipchun. This yields three target years from four fixture years (`2024..2027`).

The primary authority is the annually published Korean almanac requirement (`월력요항`) under the Astronomy Act. KASA's 2026 and 2027 announcements describe it as the national calendar-making reference containing exact solar terms. KASI publishes the corresponding year tables and exact KST minute values.

Source records:

- KASA/KASI 2026 almanac announcement: https://www.kasi.re.kr/kor/post/newsMaterial/32031
- KASA 2027 almanac announcement: https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431
- KASI year tables used for checked-in values: https://astro.kasi.re.kr/life/post/calendardata
- KASI official almanac index: https://astro.kasi.re.kr/life/post/almanac

KASI table anchors observed on 2026-08-04:

- 2024 Ipchun: `2024-02-04 17:27 KST`.
- 2025 Ipchun: `2025-02-03 23:10 KST`.
- 2026 Ipchun: `2026-02-04 05:02 KST`.
- 2027 Ipchun: `2027-02-04 10:46 KST`.

The previous `lunar-javascript@1.7.7` path remains available for lunar/solar conversion elsewhere in the product, but it is no longer the annual policy oracle. Its Beijing-wall-time output is unsuitable as the independent Korean approval fixture.

## Product decisions resolved

- Annual labels use Ipchun-to-next-Ipchun ranges.
- V1 uses day master, month-command context, visible ten-god relation, and enumerated clash/six-harmony relations.
- Clash has priority over six-harmony when a summary rule sees both states; both raw relations remain visible as facts.
- Hidden stems remain visible in the natal chart but annual activation/weighting is explicitly excluded until a separately reviewed rule exists.
- Print/PDF and JSON are the v1 exports; raster image export remains out of scope.

## Threat model

- Assets: raw birth input, exact location, annual result integrity, purpose receipts, saved records, and training projections.
- Entrypoints: annual API JSON, submission API JSON, IndexedDB records, SQLite rows, and JSON export.
- Trust boundaries: browser to API, API to deterministic domain, API to SQLite/PostgreSQL contract, and saved record to reopened UI.
- Attacker capability: malformed/tampered annual payload, incomplete provenance, stale saved object, or attempted export/training leakage of raw birth data.
- Controls: strict required provenance, server recomputation and hash verification, versioned lossless result storage, additive migration, privacy-safe export allowlist, purpose-gated training projection, deletion cascade, and withdrawal removal.

