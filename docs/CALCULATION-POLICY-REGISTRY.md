# Calculation Policy Registry

| Field | Value |
|---|---|
| Status | Proposed multi-system contract v0.1 |
| Date | 2026-08-23 |
| Runtime scope | Korean Saju only; the other entries are non-runnable drafts |
| Applies to | Saju, Thai Horasat, Vietnamese Tử Vi, Myanmar Mahabote, and their comparison projection |

## 1. Purpose and non-implementation boundary

This registry is the single routing and activation contract for calculation policies. It separates four concerns that must never be collapsed:

1. a tradition shown in the product;
2. a selected school and its locked conventions;
3. a deterministic engine that implements those conventions;
4. an interpretation or cross-system comparison derived from immutable calculated facts.

Only `KR-CIVIL-1.0@1.0.0` is active and implemented today. The Thai Horasat, Vietnamese Tử Vi, and Myanmar Mahabote identifiers below reserve stable integration boundaries; they do **not** claim that a school, formula, source table, engine, or expected result has been approved or implemented.

The application MUST reject a non-active policy at the calculation boundary. It MUST NOT substitute another school, call an LLM to fill a missing calculation, emit placeholder facts as a result, or silently reinterpret an older saved result under a newer policy.

Normative words `MUST`, `MUST NOT`, `SHOULD`, and `MAY` describe implementation requirements.

## 2. Registry states and activation flow

### 2.1 State machine

```text
draft
  -> source-locked
  -> fixture-locked
  -> implemented
  -> verified
  -> active
  -> deprecated
```

| State | Meaning | Production calculation allowed |
|---|---|---|
| `draft` | Integration identifier and unresolved decision list exist | No |
| `source-locked` | One documented school and all normative sources are approved | No |
| `fixture-locked` | Independent expected-value fixtures and boundary coverage are approved | No |
| `implemented` | Deterministic engine and result verifier exist | No |
| `verified` | Required tests, independent review, and browser/server parity pass | No |
| `active` | Release owner has signed the readiness checklist | Yes |
| `deprecated` | Existing results remain readable, but new calculations are disabled | No |

Skipping a state is prohibited. A policy may move backward when a source, license, fixture, or correctness issue is found. Moving to `active` requires a committed decision record and release evidence; a status string changed in application code is not sufficient.

### 2.2 Current registry

| `systemId` | Product label | Policy family | Policy version | Engine | Result schema | State |
|---|---|---|---|---|---|---|
| `saju` | 한국 사주 | `KR-CIVIL-1.0` | `1.0.0` | `gyeol-natal-core@1.0.0` | `natal-chart.v1` | `active` |
| `horasat` | 태국 호라삿 | `TH-HORASAT-1.0` | `0.1.0-draft.1` | Not selected | Not locked | `draft` |
| `tu-vi` | 베트남 뜨비 | `VN-TUVI-1.0` | `0.1.0-draft.1` | Not selected | Not locked | `draft` |
| `mahabote` | 미얀마 마하보테 | `MM-MAHABOTE-1.0` | `0.1.0-draft.1` | Not selected | Not locked | `draft` |

The draft policy family names do not select a school by themselves. A future source-lock decision may retain the family name and define its conventions, or create a more specific family when two schools must coexist. The product MUST never use the bare tradition name as proof that a convention is universal.

The active Saju policy is specified in [NATAL-CALCULATION-POLICY.md](./NATAL-CALCULATION-POLICY.md). Its dependent daewoon policy remains separately versioned in [DAEWOON-CALCULATION-POLICY.md](./DAEWOON-CALCULATION-POLICY.md).

## 3. Policy registry entry contract

The committed registry source SHOULD be machine-readable even when this document remains the human approval surface. Each entry MUST satisfy this logical contract:

```ts
type PolicyState =
  | "draft"
  | "source-locked"
  | "fixture-locked"
  | "implemented"
  | "verified"
  | "active"
  | "deprecated";

type CalculationPolicyEntry = {
  systemId: "saju" | "horasat" | "tu-vi" | "mahabote";
  policy: { id: string; version: string };
  state: PolicyState;
  selectedSchool: null | {
    id: string;
    displayName: string;
    decisionRecordId: string;
  };
  inputSchemaVersion: null | string;
  resultSchemaVersion: null | string;
  engine: null | { id: string; version: string };
  sourceManifestVersion: null | string;
  oracleFixtureSetVersion: null | string;
  comparisonProjectionVersion: null | string;
  supportedRange: null | { start: string; end: string };
  activatedAt: null | string;
  deprecatedAt: null | string;
};
```

Draft entries MUST keep unresolved fields `null`. Fake version values such as `TBD-implemented`, guessed source names, or an unreviewed third-party calculator ID are prohibited.

Shape-only example; this is not evidence of a Horasat implementation:

```json
{
  "systemId": "horasat",
  "policy": { "id": "TH-HORASAT-1.0", "version": "0.1.0-draft.1" },
  "state": "draft",
  "selectedSchool": null,
  "inputSchemaVersion": null,
  "resultSchemaVersion": null,
  "engine": null,
  "sourceManifestVersion": null,
  "oracleFixtureSetVersion": null,
  "comparisonProjectionVersion": null,
  "supportedRange": null,
  "activatedAt": null,
  "deprecatedAt": null
}
```

## 4. Raw input to normalized-profile adapter

### 4.1 Preserve original input and normalized values separately

`BirthProfileInputV1` is the UI-boundary shape that preserves what the user entered. It is not an alternative engine or storage schema. `ProfileNormalizerV2` MUST deterministically map it to the canonical `NormalizedBirthProfileV2` defined in `MULTI-ASTROLOGY-COMPARISON-SPEC.md`; every engine and eligibility resolver accepts only that normalized shape, then derives its own policy-specific projection.

```ts
type BirthProfileInputV1 = {
  schemaVersion: "birth-profile-input.v1";
  calendarInput: {
    system: "gregorian" | "korean-lunar" | "other-declared";
    date: string;                  // as entered; YYYY-MM-DD when applicable
    isLeapMonth: boolean | null;
  };
  timeInput:
    | { status: "exact"; localTime: string }
    | { status: "approximate"; localTime: string; precisionMinutes: number }
    | { status: "unknown"; localTime: null };
  placeInput: {
    label: string;
    latitude: number | null;
    longitude: number | null;
    timeZone: string | null;       // IANA identifier, not only a UTC offset
    provenance: string | null;
  };
  calculationParameters: {
    sexParameter: "female" | "male" | "not_provided";
  };
};
```

The adapter mapping is fixed:

| `BirthProfileInputV1` | `NormalizedBirthProfileV2` | Rule |
|---|---|---|
| `calendarInput.system/date/isLeapMonth` | `inputCalendar.type/date/isLeapMonth` | Preserve the declared calendar and leap state; conversion adds provenance without overwriting the raw input |
| `timeInput.status/localTime/precisionMinutes` | `birthTime.status/localTime/uncertaintyMinutes` | `unknown` maps to `localTime: null`; approximate never maps to exact |
| `placeInput.label/latitude/longitude/timeZone` | `place.label/latitude/longitude/timezoneId` | Resolve `countryCode`, `timezoneConfidence`, and legacy Korean place code through versioned adapters |
| normalization output | `resolvedInstant` | Set only when civil time and IANA zone resolve; record tzdb and adapter versions |
| `calculationParameters.sexParameter` | `traditionalSexParameter` | Preserve `female`, `male`, or `not_provided`; never infer |
| generated local UUID | `profileId` | Random UUID, never a birth-data hash |

`interestDomains` and display aliases are presentation metadata. They are not engine inputs and are added only after the normalized calculation fields are complete. Storage retains both the original `BirthProfileInputV1` envelope and canonical `NormalizedBirthProfileV2` without renaming fields again.

`sexParameter` is a traditional calculation parameter only where the selected policy explicitly requires it. The UI MUST explain that purpose and MUST NOT infer gender identity from name, account data, or other fields. If a selected policy has only binary traditional branches, `not_provided` produces a transparent eligibility failure rather than an inferred value.

The original calendar, leap-month declaration, civil clock, place string, coordinates, time zone, conversion result, and conversion provenance MUST remain distinct fields. Normalization MUST NOT overwrite what the user entered.

### 4.2 Input and unknown-time eligibility matrix

| System | Minimum policy projection | `exact` time | `approximate` time | `unknown` time |
|---|---|---|---|---|
| Saju | Supported Korean date, calendar-conversion provenance, `Asia/Seoul`; time when supplied | `eligible` | `needs_input` in shared v1; the existing engine accepts exact or unknown time, so approximate time MUST NOT be relabeled as exact | `partial`; suppress hour pillar and time-dependent interpretation under `KR-CIVIL-1.0` |
| Thai Horasat | Civil date, exact civil time, IANA time zone, latitude, longitude, and every selected-school parameter | `eligible` only after policy activation | `needs_input` for the first active policy unless the decision record defines a bounded partial mode | `needs_input` for the first active policy |
| Vietnamese Tử Vi | Inputs required by the selected calendar, hour, palace/star-table, cycle-direction, and intercalation conventions; IANA time zone for civil-to-policy conversion | `eligible` only after policy activation | `needs_input` for the first active policy unless a source-locked hour-window mode is approved | `needs_input` for the first active policy |
| Myanmar Mahabote | Civil date and IANA time zone sufficient to resolve the selected policy's local day; any time-of-day subdivision required by that policy | `eligible` only after policy activation | `partial` only when the active policy proves all candidate times yield the same supported facts; otherwise `needs_input` | `partial` only if the active policy proves time is not required and the local date is unambiguous; otherwise `needs_input` |

The Thai, Vietnamese, and Myanmar rows define conservative eligibility behavior, not their formulas. Their source decision records MUST resolve whether a value is required and why. Until then, the registry returns `POLICY_NOT_ACTIVE` before accepting a calculation request.

### 4.3 Eligibility response

Eligibility is deterministic and evaluated per system before calculation:

```ts
type EligibilityV1 = {
  schemaVersion: "eligibility.v1";
  systemId: CalculationPolicyEntry["systemId"];
  policyId: string;
  policyVersion: string;
  status:
    | "eligible"
    | "partial"
    | "needs_input"
    | "policy_unverified"
    | "engine_unavailable"
    | "unsupported_range"
    | "invalid_input";
  reasons: Array<{
    code: CalculationErrorCode;
    field: string | null;
    messageKey: string;
  }>;
  missingInputs: string[];
  canCalculate: boolean;
  calculationPrecision: "complete" | "partial" | "none";
  permittedOutputScopes: string[];
};
```

Shape-only unknown-time response for a non-active policy:

```json
{
  "schemaVersion": "eligibility.v1",
  "systemId": "horasat",
  "policyId": "TH-HORASAT-1.0",
  "policyVersion": "0.1.0-draft.1",
  "status": "policy_unverified",
  "reasons": [
    {
      "code": "POLICY_NOT_ACTIVE",
      "field": null,
      "messageKey": "eligibility.policyNotActive"
    },
    {
      "code": "INPUT_EXACT_TIME_REQUIRED",
      "field": "birthTime.localTime",
      "messageKey": "eligibility.exactTimeRequired"
    }
  ],
  "missingInputs": ["birthTime.localTime"],
  "canCalculate": false,
  "calculationPrecision": "none",
  "permittedOutputScopes": []
}
```

The presentation layer maps the domain statuses to the five Korean-facing states used throughout the product: `eligible → ready`, `partial → partial`, `needs_input → needs-input`, `unsupported_range|invalid_input → unsupported`, and `policy_unverified|engine_unavailable → policy-blocked`. Runtime `calculation_failed` is not an eligibility state.

## 5. System source-lock decisions

### 5.1 Decisions required for every policy

Before `source-locked`, a domain-expert decision record MUST identify:

- the selected school, regional lineage, and intended audience;
- every normative source and the exact section, table, or rule it supports;
- translation rules and retained native terms;
- calendar, time-zone, local-day, and boundary conventions;
- all required user parameters and the reason each affects calculation;
- supported date range and why the underlying data covers it;
- source conflicts, the chosen resolution, rejected alternatives, and consequences;
- table/data asset provenance, transformation steps, license, and permitted product use;
- facts the engine will emit and facts intentionally unsupported;
- the independent oracle-fixture creation method;
- names and dates of domain, engineering, content, and license review approvals.

No single source should be described as universally authoritative for a whole tradition unless the decision record establishes that claim. The goal is a reproducible product policy for one named school, not a claim that every practitioner agrees.

### 5.2 Thai Horasat decision topics

`TH-HORASAT-1.0` MUST remain a draft until the record locks at least:

- astronomical/calendar basis and the exact Suriyayatra or other selected computational lineage;
- zodiac/reference frame, epoch, precession or ayanamsa convention if applicable;
- planetary-position source data and precision;
- ascendant calculation and coordinate requirements;
- house system and cusp/boundary inclusivity;
- civil-time, historical time-zone, daylight-saving, and ambiguous/nonexistent-time handling;
- supported celestial bodies, nodes, lots, dignity/aspect tables, and exclusions;
- regional or contemporary adaptations that differ from the selected source lineage;
- supported date and coordinate range.

[horasat.kr](https://horasat.kr/) is a product and reference implementation. It may inform information architecture, terminology discovery, and candidate-policy questions. It is **not** an authoritative calculation oracle for this project, and agreement with its output is neither necessary nor sufficient for activation unless its exact rules, sources, expected values, and reuse rights are independently documented and approved.

### 5.3 Vietnamese Tử Vi decision topics

`VN-TUVI-1.0` MUST remain a draft until the record locks at least:

- civil-to-selected-lunisolar-calendar conversion and source data;
- new-year, month, intercalary-month, day, and hour boundaries;
- timezone and local-day treatment for births outside Vietnam;
- Mệnh/Thân and twelve-palace placement conventions;
- main-star, auxiliary-star, transformation, and state tables, each with versioned provenance;
- `sexParameter` use, cycle direction, and any yin/yang branch convention;
- age/cycle counting and boundary inclusivity;
- supported and intentionally omitted schools, stars, transformations, and readings;
- supported date range.

The engine MUST NOT mix tables from different schools merely because their labels match. A table conflict creates a new decision record or policy family, not a silent fallback.

### 5.4 Myanmar Mahabote decision topics

`MM-MAHABOTE-1.0` MUST remain a draft until the record locks at least:

- Myanmar/Burmese-era conversion and new-year boundary;
- civil date, local weekday, and local-day boundary;
- whether and how any weekday time subdivision applies;
- planetary/weekday numbering and remainder convention;
- house placement order, names, and boundary rules;
- supported calendar eras, historical time zones, and locations;
- school variants, spelling/transliteration policy, and omitted extensions;
- supported date range.

A short formula found in a code repository, blog, or calculator is discovery material only. It MUST NOT become the production policy without source traceability, domain review, license review, and independent expected-value fixtures.

## 6. Source hierarchy, provenance, and license gate

### 6.1 Source hierarchy

Use the highest available source that actually supports the selected policy decision:

1. a named primary treatise, reviewed critical edition, or institutional calendar/astronomical dataset applicable to the selected lineage;
2. peer-reviewed scholarship or a scholarly translation used to resolve context and variants;
3. a domain-expert-approved contemporary school manual that explicitly documents the operational rule;
4. an independently licensed implementation used only as a cross-check after its provenance is inspected;
5. commercial product sites, practitioner pages, videos, blogs, and search snippets used only for discovery and UX comparison.

A higher category label does not prove that a source supports a specific proposition. Each decision MUST cite the precise location that supports it. Search results and HTTP success are not substantive evidence.

### 6.2 Source asset manifest

Every runtime table, ephemeris snapshot, conversion map, generated asset, or fixture source MUST have a manifest record:

```ts
type SourceAssetManifestEntry = {
  assetId: string;
  version: string;
  role: "normative" | "generated" | "cross-check" | "fixture-source";
  title: string;
  creator: string | null;
  sourceUri: string;
  retrievedAt: string;
  supportingLocator: string;
  licenseId: string | null;
  copyrightNotice: string | null;
  commercialUseApproved: boolean;
  transformationDescription: string | null;
  generatorVersion: string | null;
  sha256: string;
  reviewedBy: string[];
  decisionRecordIds: string[];
};
```

Unknown provenance or license sets `commercialUseApproved: false` and blocks `source-locked`. Copying visible output from another calculator does not create a licensed source asset.

Generated data MUST retain both the generator version and input-asset digests. A generated snapshot is reviewed as a release artifact and checked in or distributed immutably; runtime fetching from an undocumented mutable source is prohibited.

## 7. Domain-expert decision record

Each policy requires a signed record stored with the project documentation or governance artifacts:

```ts
type PolicyDecisionRecord = {
  recordId: string;
  policyId: string;
  policyVersion: string;
  selectedSchool: { id: string; name: string; scope: string };
  questions: Array<{
    id: string;
    decision: string;
    normativeSourceLocators: string[];
    alternativesRejected: string[];
    rationale: string;
    affectedFactNamespaces: string[];
  }>;
  unresolvedQuestions: string[];
  sourceManifestVersion: string;
  oracleFixtureSetVersion: string | null;
  approvals: Array<{
    role: "domain" | "engineering" | "content" | "license";
    approver: string;
    approvedAt: string;
    evidenceRef: string;
  }>;
};
```

`unresolvedQuestions` MUST be empty before `source-locked`. Approval names and evidence references must identify actual review artifacts; placeholders do not pass the gate. Material convention changes require a new policy version and a new approval record.

## 8. Independent oracle fixtures

### 8.1 Independence rule

An oracle fixture is an expected-value record approved before, or independently from, the runtime implementation. It MUST NOT be generated solely by the engine it tests. Valid expected values may come from a precisely located normative worked example, a domain expert's documented manual derivation, or an independently implemented and provenance-reviewed calculator, with conflicts adjudicated in the decision record.

horasat.kr and other product calculators cannot be the sole fixture oracle. Two products agreeing may share the same undocumented assumption or defect.

### 8.2 Fixture format

```ts
type OracleFixtureV1 = {
  schemaVersion: "oracle-fixture.v1";
  fixtureId: string;
  policy: { id: string; version: string };
  purpose: "ordinary" | "boundary" | "historical-time" | "range" | "invalid";
  originalInput: BirthProfileInputV1;
  normalizedInput: NormalizedBirthProfileV2 | null;
  expectedEligibility: EligibilityV1;
  expectedFacts: Array<{
    factId: string;
    factType: string;
    value: unknown;
    sourceLocators: string[];
    derivationNote: string;
  }>;
  expectedWarnings: string[];
  expectedUnsupportedStates: string[];
  derivedBy: string;
  reviewedBy: string[];
  reviewEvidenceRef: string;
};
```

`normalizedInput` is `null` only for fixtures whose purpose is to prove that invalid raw input cannot be normalized. Every ordinary, boundary, historical-time, and supported-range fixture uses the canonical `NormalizedBirthProfileV2` shape.

Personally identifying real-user data MUST NOT be used as a committed fixture. Fixture profiles must be published source examples or synthetic boundary inputs.

### 8.3 Required coverage

Before `fixture-locked`, the coverage matrix MUST include:

- ordinary examples covering every normative table branch that can change output;
- before / exact / after fixtures for every calculation-changing date or time boundary;
- supported calendar conversion, leap/intercalary, new-year, month, day, and hour cases applicable to the policy;
- historical time-zone offset transitions and ambiguous/nonexistent civil times within the supported range;
- coordinate edge cases for any coordinate-dependent calculation;
- exact minimum and maximum supported dates plus one input outside each edge;
- `exact`, `approximate`, and `unknown` time eligibility;
- every required-parameter omission and malformed input class;
- host-time-zone and locale independence;
- serialization round-trip and canonical fingerprint stability;
- server-side rejection of modified facts, versions, source digests, and fingerprints;
- at least one fixture for each explicitly unsupported state.

Every normative decision-table branch needs at least one independent expected-value fixture. Boundary rules need three fixtures: immediately before, exact boundary, and immediately after, at the policy's declared precision. A domain reviewer signs the coverage matrix; a raw fixture count alone is not a coverage argument.

## 9. Calculation result and fact contract

### 9.1 Immutable result envelope

All active engines MUST return the same outer envelope while keeping facts namespaced by system:

```ts
type SystemFactResultV1 = {
  schemaVersion: "system-fact-result.v1";
  resultId: string;
  bundleId: string;
  profileId: string;
  systemId: CalculationPolicyEntry["systemId"];
  status: "ready" | "partial";
  inputRef: string;
  normalizedInputHash: string;
  policy: { id: string; version: string; decisionRecordId: string };
  engine: { id: string; version: string };
  sourceAssets: Array<{ id: string; version: string; sha256: string }>;
  systemResultSchemaVersion: string;
  facts: CalculationFactV1[];
  nativeChart: { schemaVersion: string; data: unknown };
  warnings: Array<{ code: string; messageKey: string; factIds: string[] }>;
  unsupportedStates: Array<{ code: string; reasonKey: string }>;
  boundarySensitivity: Array<{
    boundaryId: string;
    precision: string;
    alternatives: Array<{ condition: string; affectedFactIds: string[] }>;
  }>;
  fingerprint: { algorithm: "sha256"; canonicalization: "JCS"; value: string };
  calculatedAt: string;
};

type CalculationFactV1 = {
  factId: string;
  factType: string;
  value: unknown;
  displayKey: string;
  sourceRuleIds: string[];
  sourceAssetIds: string[];
  completeness: "complete" | "partial";
};
```

Allowed fact namespaces begin with the system ID's stable prefix:

| System | Required prefix | Illustrative category only |
|---|---|---|
| Saju | `saju.` | pillars, elements, branches |
| Thai Horasat | `horasat.` | chart points, houses, relationships |
| Vietnamese Tử Vi | `tuvi.` | palaces, stars, transformations |
| Myanmar Mahabote | `mahabote.` | weekday/planet inputs and house placements |

The illustrative categories do not lock a formula or guarantee that every selected school supports them. Exact fact types are approved with the policy's result schema. A consumer MUST NOT infer one system's fact from another system's namespace.

### 9.2 Verification boundary

The browser and server MUST use the same framework-independent engine or produce byte-equivalent canonical facts. The submission adapter MUST recalculate and verify:

- normalized input;
- policy, engine, source-asset, and schema versions;
- every fact value and source-rule link;
- warnings, unsupported states, and boundary sensitivity;
- the canonical fingerprint.

Any mismatch is a hard 422-class verification failure. The server MUST NOT store user-submitted calculated facts as verified merely because their schema is valid.

## 10. Version and fingerprint rules

### 10.1 What changes a version

| Change | Required action |
|---|---|
| Selected school, boundary, calendar, table, precision, or another meaning-changing convention | New policy version; existing results remain immutable |
| Correctness fix that can change any fact | New engine version and policy review; regenerate independent regression evidence |
| Source table, ephemeris, or generated asset changes | New source-asset version/digest; recalculate fingerprint |
| Additive optional result field | New result-schema version; maintain explicit reader support |
| Fact rename, value-shape change, or removed fact | New incompatible result-schema version and migration/read strategy |
| Interpretation wording only | New interpretation profile; do not change calculation fingerprint |
| Comparison mapping or aggregation rule | New comparison-projection version; do not rewrite source calculation results |

### 10.2 Fingerprint payload

The SHA-256 fingerprint MUST cover canonical JSON containing:

```json
{
  "systemId": "<system-id>",
  "normalizedInputHash": "<sha256>",
  "policy": { "id": "<id>", "version": "<version>" },
  "engine": { "id": "<id>", "version": "<version>" },
  "sourceAssets": [{ "id": "<id>", "version": "<version>", "sha256": "<sha256>" }],
  "systemResultSchemaVersion": "<version>",
  "normalizationAdapterVersions": ["<adapter>@<version>"]
}
```

Angle-bracket values describe the contract and are not runtime values. Object keys use a documented canonicalization profile; source assets sort by `id`, and adapters sort lexicographically. Time, locale, object insertion order, and display wording MUST NOT affect the fingerprint.

Recalculation under a new fingerprint creates a new result linked to the prior result. It never updates the old result in place.

## 11. Runtime state and error contract

### 11.1 Per-system state

```ts
type CalculationRunState =
  | "not-requested"
  | "checking-eligibility"
  | "blocked"
  | "queued"
  | "loading-engine"
  | "calculating"
  | "verifying"
  | "complete"
  | "partial"
  | "failed"
  | "cancelled"
  | "stale"
  | "skipped-by-user";
```

Normative transitions are `not-requested -> checking-eligibility -> blocked|queued|skipped-by-user`, then `queued -> loading-engine -> calculating -> verifying -> complete|partial|failed`. A queued or running attempt may become `cancelled`; `failed` or `cancelled` may retry as a new attempt from `queued`. A stored `complete` or `partial` run may become `stale` for current-policy comparison while its immutable result remains readable.

The four systems advance independently. One blocked, cancelled, stale, or failed system MUST NOT erase successful immutable results from another system. A `complete` run references a `SystemFactResultV1` with `status: ready`; a `partial` run references a policy-permitted result with `status: partial`. The comparison layer receives only those referenced results and visibly lists excluded systems and reasons.

### 11.2 Stable error codes

```ts
type CalculationErrorCode =
  | "POLICY_NOT_ACTIVE"
  | "POLICY_SOURCE_UNAPPROVED"
  | "POLICY_FIXTURES_UNAPPROVED"
  | "INPUT_DATE_REQUIRED"
  | "INPUT_EXACT_TIME_REQUIRED"
  | "INPUT_PLACE_REQUIRED"
  | "INPUT_COORDINATES_REQUIRED"
  | "INPUT_TIMEZONE_REQUIRED"
  | "INPUT_SEX_PARAMETER_REQUIRED"
  | "INPUT_CALENDAR_UNSUPPORTED"
  | "INPUT_AMBIGUOUS_CIVIL_TIME"
  | "INPUT_NONEXISTENT_CIVIL_TIME"
  | "INPUT_OUT_OF_RANGE"
  | "SOURCE_ASSET_UNAVAILABLE"
  | "CALCULATION_FAILED"
  | "RESULT_VERIFICATION_FAILED";
```

Each error response includes `systemId`, `policyId`, `code`, `messageKey`, `recoverableByUser`, and `fieldPaths`. User-correctable input errors are separate from deployment/integrity failures. Internal stack traces, source paths, and raw user input are excluded from the public response.

The UI MUST show `POLICY_NOT_ACTIVE` as “준비 중인 계산 체계” rather than as bad user input. It MUST NOT retry integrity failures with a different policy.

## 12. Comparison-claim projection

### 12.1 Boundary

Comparison is not a fifth calculation engine. It is a separately versioned deterministic projection from each immutable system result into a small shared vocabulary. Raw facts remain in their native namespaces, and the projection stores evidence links back to those facts.

An LLM MAY rewrite an already validated claim into natural language, but MUST NOT calculate a chart, create a missing fact, select evidence, change stance, or decide that systems agree. The validated structured claim remains the source of truth.

### 12.2 Projection contract

```ts
type ComparisonDomain =
  | "identity"
  | "work"
  | "resources"
  | "relationships"
  | "wellbeing"
  | "timing";

type ComparisonClaimV1 = {
  schemaVersion: "comparison-claim.v1";
  claimId: string;
  resultId: string;
  systemId: CalculationPolicyEntry["systemId"];
  domainId: ComparisonDomain;
  themeId: string;
  systemSpecificConceptId: string | null;
  stance: "supports" | "cautions" | "mixed" | "neutral" | "unavailable";
  titleKey: string;
  summaryKey: string;
  evidenceFactIds: string[];
  evidenceStatus: "complete" | "partial" | "missing" | "blocked";
  displayPriority: number;
  interpretationVersion: string;
  projectionRule: { id: string; version: string };
};
```

Every non-`unavailable` claim MUST have at least one valid `evidenceFactId` in its own `resultId`. The projection validator rejects cross-result fact references, missing facts, inactive source policies, and interpretation/projection rule versions not approved for that policy.

There is no numeric metaphysical certainty, accuracy, destiny, compatibility, or “which tradition is right” score. `evidenceStatus` describes evidence availability only and MUST NOT be rendered as predictive confidence. `displayPriority` is presentation order only.

### 12.3 Aggregation rules

For each `domainId + themeId`:

- **공통으로 보는 점** requires at least two independent systems with valid evidence and the same non-`mixed`, non-`unavailable` stance. `neutral` may match only another `neutral` claim.
- **다르게 보는 점** requires at least two valid claims whose stances conflict or include a meaningful `mixed` relation defined by the projection rule.
- **이 체계만 보는 점 (`unique`)** contains one valid system claim only when every requested comparable system completed and no other completed system emits that theme.
- **현재 계산된 체계에서만 보인 점 (`partial-unique`)** contains one valid system claim when at least one other requested comparable system is blocked, failed, cancelled, or stale. It is stored as `classification: partial-unique` inside the UI's unique section and MUST NOT use strict unique wording.
- **비교 불가** is returned when fewer than two systems provide eligible claims for the requested comparison scope.

The aggregator MUST NOT weight a tradition, declare a winner, average stances, convert missing claims to neutral, or treat duplicated interpretations from one system as independent agreement. A partial result can contribute only to themes explicitly permitted by its `permittedOutputScopes`.

Aggregation output stores source claim IDs, classification (`common | different | unique | partial-unique`), projection version, available/excluded systems, and exclusion reasons. Re-projecting after rule changes creates a new comparison result; it does not mutate the source results or previous comparison.

## 13. Implementation sequence

Each new policy follows this order:

1. Create the decision record and unresolved-question matrix.
2. Approve normative sources, translations, source assets, and licenses.
3. Lock exact input and result schemas.
4. Create and independently review expected-value and boundary fixtures.
5. Implement a framework-independent deterministic engine.
6. Implement the server verifier from the same policy contract.
7. Pass unit, property, boundary, tamper, browser/server parity, and serialization tests.
8. Add the system-specific comparison projection rules and evidence-link validator.
9. Run domain, engineering, content, privacy, and license release review.
10. Change registry state to `active` in a dedicated reviewed release.

UI shells, sample cards, and routing MAY be implemented earlier, but they MUST render the policy as `준비 중` and MUST NOT contain fabricated chart values.

## 14. Release-readiness checklist

A new policy cannot move to `active` until every item is evidenced:

### Policy and source

- [ ] The selected school and intended scope are named.
- [ ] Every decision topic for the system is resolved in a signed decision record.
- [ ] Precise source locators support every normative rule and table.
- [ ] Conflicts and rejected alternatives are documented.
- [ ] All runtime data assets have hashes, transformations, and approved commercial-use status.
- [ ] Supported range follows from source/data coverage rather than a UI assumption.

### Oracle and correctness

- [ ] Independent expected-value fixtures exist for every normative branch.
- [ ] Before / exact / after fixtures exist for every calculation-changing boundary.
- [ ] Calendar, intercalation, historical-time, coordinate, unknown-time, and range coverage applicable to the policy passes.
- [ ] A domain expert has signed the fixture coverage matrix.
- [ ] The fixture set is not derived solely from the runtime engine or horasat.kr.

### Engine and contracts

- [ ] The deterministic engine has no network or LLM dependency.
- [ ] Browser and server produce canonical-equivalent facts.
- [ ] The server rejects modified inputs, facts, versions, source digests, and fingerprints.
- [ ] Input, result, error, unsupported-state, and boundary-sensitivity schemas are versioned.
- [ ] Fingerprints are stable across host time zone, locale, process, and serialization order.
- [ ] Old result versions remain readable and immutable.

### Comparison and content

- [ ] Projection rules cite approved native facts and have independent tests.
- [ ] Every comparison claim validates its evidence references.
- [ ] Missing or blocked systems remain visible and are never treated as neutral agreement.
- [ ] No winner, predictive-confidence, accuracy, destiny, or compatibility score is emitted.
- [ ] Natural-language rendering cannot add claims beyond the validated structure.
- [ ] Native terminology, Korean labels, safety framing, and source disclosure have domain/content approval.

### Operations and governance

- [ ] Registry activation, rollback, and deprecation paths are tested.
- [ ] Source/fixture/engine/schema versions are stored with every result.
- [ ] Logs and analytics exclude raw birth details and exact coordinates.
- [ ] Privacy, retention, export, correction, and deletion behavior covers each per-system result and comparison.
- [ ] License and attribution obligations are represented in release artifacts and the user-facing method disclosure where required.
- [ ] The release owner records the activation evidence reference and activation time.

## 15. Done definition for the four-system calculation layer

The calculation layer is complete only when:

- `KR-CIVIL-1.0` remains regression-locked;
- all three new policies individually reach `active` through the gates above;
- one shared profile produces explicit eligibility for all four systems;
- each eligible system produces an independently verifiable immutable result;
- incomplete systems fail closed with stable reasons;
- comparison claims are reproducible from evidence-linked facts;
- a saved comparison can always identify the exact input hash, policy, engine, source assets, result schema, and projection versions that produced it.

Documentation, a polished UI, agreement with a reference site, or a passing happy-path demo alone does not satisfy this definition.
