# A-Phase Plan Audit

## Audit recovery

Two independent read-only code-review agents were assigned the same audit packet. Both failed before returning findings because their encrypted tool-output streams could not be decoded. Under the documented two-agent failure recovery rule, the leader reclaimed the audit and compared the plan directly with Issue #1, all three owner review comments on PR #2, the current branch, source modules, tests, schema, and documentation.

## Verdict

**NEAR-PASS**

The plan closes every validated merge blocker and keeps the implementation within the approved v1 scope. No production-code work may begin outside the file/change map or without a red test for the affected contract.

## Coverage findings

- Ephemeris: the plan narrows the enabled target range to `2024..2026`, checks in exact KST fixtures through the 2027 closing Ipchun, tests `-1`/exact/`+1` minute for every enabled year, and rejects incomplete or unsupported fixture ranges.
- Interpretation: annual and monthly rules become structured, versioned, priority-aware, suppressible contracts whose output carries fact and rule traces.
- Provenance: natal engine/version, annual policy, ephemeris source/version, interpretation profile, and rule-set versions cross creation, API, hashing, persistence, export, and display boundaries.
- Persistence: SQLite and PostgreSQL evolve additively, preserve queryable fields, store the complete annual object, and cover exact round-trip, withdrawal, and cascade deletion.
- Browser lifecycle: IndexedDB operations move to an injectable module, while real-browser verification covers save/reopen/delete, focus, document order, reduced motion, print privacy, responsiveness, and console errors.
- Safety/scope: hidden-stem annual activation remains excluded; raw birth input and exact location remain outside exported cards and training projections; tampered payloads are recomputed and rejected.
- Delivery: documentation, service-worker cache, full tests, security checks, independent C-phase review, atomic commits, push, CI, and PR resolution comment are explicit completion gates.

## Residual risks accepted for build

- The exact minute fixtures are transcribed from the KASI year-table surface and tied to the authoritative annual almanac publication records; the implementation must not describe the general-purpose year-table page itself as a legal approval artifact.
- PostgreSQL remains a reviewed schema contract only; no production deployment or live PostgreSQL migration is in scope.
- Automated markup and adapter tests do not replace the required real-browser accessibility and IndexedDB walkthrough.
