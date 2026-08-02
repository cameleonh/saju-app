# Roadmap Audit and Fold-Back

## Dispatch evidence

Two distinct read-only `explore` reviewers were dispatched with the same bounded audit packet. Both failed before producing content with `stream disconnected before completion: Encrypted function output content could not be decrypted or decoded`. Per the registered upward-escalation rule, the main agent reclaimed the audit instead of silently treating the dispatch as a pass.

## Round 1 blockers

1. **High — training withdrawal was unreachable from the browser.** `index.html:1083` currently serializes `dataSubject.minor: 'unknown'`, while `server/domain/purpose.mjs:34` requires `minor === false`. A checked training control could therefore never create a projection or an actionable withdrawal state from the real UI. Fold-back: `020_record_lifecycle_and_guidance.md` now derives minor status from the required normalized birth date and enumerates the complete field chain and negative cases.
2. **High — Phase 1 had no independently green verifier.** The pre-loop draft mixes the Phase-2 guidance call at `tests/smoke.mjs:27` and record expectations at `tests/smoke.mjs:137-141` into the Phase-1 chart/foundation suite; `tests/server/ingestion.mjs:78-84` also contains the Phase-2 endpoint contract. Fold-back: `010_foundations.md` now separates Phase-2 client expectations into `tests/lifecycle.mjs`; Phase 1 closes on the chart/foundation smoke suite while the lifecycle contracts remain explicitly red.
3. **High — asynchronous record identity was underspecified.** `index.html:1046` persists after calculation, `index.html:1059` calls the same submission function again after every question, and `index.html:1072-1089` generates a new request ID each time without patching the pending local row from the response. Fold-back: `020_record_lifecycle_and_guidance.md` now fixes ID creation at calculation time, reuses it for chat updates, and describes the pending -> response patch -> outbox transition.
4. **Medium — lazy catalog hydration could break the VM verifier.** `index.html:378` consumes a pre-populated global at evaluation time, while `tests/smoke.mjs:6-15` injects that global before evaluating the engine slice. Fold-back: `010_foundations.md` now hydrates an already-present catalog without a network request and keeps browser loading lazy.

## Re-audit result

- Every path and named symbol exists in the baseline or is explicitly marked ADD.
- The roadmap remains dependency ordered: screen/consent/loading foundations -> persistence and lifecycle -> integrated hardening.
- Research and implementation diffs are lexicographically separated.
- New state and payload fields now include creation, serialization, deserialization, and consumer chains.
- The client gate, server receipt check, optional-training eligibility, and destructive confirmations name their bypasses and residual risk.
- Conditional paths have concrete activation scenarios, including missing service acknowledgement, service-only calculation, catalog failure/retry, training eligibility, withdrawal, deletion, and category-specific guidance.
- Verifier commands exist and their direct target relationship is recorded. Phase-local red tests are not represented as green.

No Critical or High blocker remains after fold-back. The only residual is the unavailable independent transport channel; this is an execution-environment limitation, not a roadmap ambiguity, and the final mandatory architect review remains registered as an independent completion gate.

VERDICT: GO-WITH-FIXES (blockers=4)
