# Training Data Policy

| Field | Value |
|---|---|
| Status | Internal draft v0.1; legal review required before collection |
| Date | 2026-08-01 |
| Applies to | Birth submissions, chart results, readings, conversations, feedback, labels, datasets, and model runs |

## Product Decision

The service will centrally retain submitted inputs and generated outputs so that calculation quality, interpretation quality, safety, and AI models can improve over time.

Central retention does not create blanket permission for model training. Operational storage, third-party AI processing, human review, and first-party model training are separate processing purposes with separate records and controls.

## Non-Negotiable Rules

1. Every centrally stored record has a declared purpose, consent or other approved lawful basis, retention rule, data owner, and deletion path.
2. Model-training consent is optional, specific, versioned, and revocable. Refusal does not reduce deterministic chart functionality.
3. A training job can read only an approved pseudonymized projection, never the production PII vault or an ad hoc database export.
4. Exact account identity, profile labels, raw birthplace text, and exact birth fields are excluded from interpretation-model datasets by default.
5. Data entered about another person is excluded from training unless authority and applicable consent are established.
6. Minor data is excluded until an approved age/guardian process exists.
7. Unreviewed AI responses are not gold labels. User ratings are weak signals until quality checks establish otherwise.
8. Every dataset member is traceable to source, consent, transformation, quality decision, dataset version, and model run.
9. Withdrawal immediately blocks future dataset exports and triggers dataset/model impact review.
10. Passwords, tokens, secrets, payment data, permanent raw IP addresses, and unrelated device data are never training data.

## Data Purpose Matrix

| Data category | Service operation | External AI processing | First-party training | Human review |
|---|---|---|---|---|
| Original birth input | Stored encrypted | Not sent by default | Excluded from interpretation training | Only for approved calculation investigation |
| Structured chart facts | Stored | Sent when AI consultation starts | Eligible with training consent | Eligible in pseudonymized review view |
| Deterministic reading | Stored | May be supplied as context | Eligible with training consent | Eligible |
| User question | Stored encrypted | Sent to selected provider | Eligible after consent and PII/safety filtering | Separate human-review disclosure required |
| AI answer | Stored encrypted | Produced by provider | Weak candidate only; requires quality gate | Eligible for evaluation |
| Rating/correction | Stored | Not required | Preferred learning signal with consent | Eligible |
| Account/contact data | Stored separately | Never sent | Never included | Never shown |
| Consent/processing evidence | Stored | Never sent | Used only for eligibility/lineage | Privacy operators only |

## Consent Experience

### Required service-storage notice

Before the first central submission, show:

- exact collected categories;
- service purpose;
- whether an account is required;
- storage location/processor;
- retention and deletion rules;
- consequences of declining;
- export, correction, and deletion rights.

### Optional model-training consent

Present a separate unchecked choice that names:

- training objective;
- eligible data categories;
- whether human reviewers may see pseudonymized content;
- retention and withdrawal behavior;
- limits of removing influence from an already trained model;
- whether data may be transferred to another country or processor.

The consent event must record the disclosure version and apply only to data captured under a compatible purpose. Material policy expansion requires renewed consent.

### Third-party AI processing

Before sending a question to an external model provider, disclose provider, transferred categories, purpose, region/cross-border handling, retention, provider-training setting, and deletion/support path. Provider processing consent does not grant this product permission to train its own model.

## Training Eligibility

The training projection includes a record only when:

- current model-training permission covers the target objective;
- the data subject and authority state are valid;
- minor and third-party exclusions pass;
- no deletion, withdrawal, correction, dispute, or legal conflict is active;
- direct identifiers and unnecessary quasi-identifiers are removed;
- free text passes PII, secret, toxicity, and third-party-content filters;
- engine, calculation policy, prompt, model, and safety versions are known;
- the label quality state meets the dataset's threshold;
- source, consent, transformation, and row hashes are recorded.

Training eligibility is evaluated again when a dataset is built. Capture-time consent alone is insufficient.

## Preferred Learning Record

The most useful learning unit is not raw birth data:

```text
versioned ChartFact set
+ user question
+ evidence-grounded answer
+ user/reviewer feedback
+ safety and quality labels
+ engine/policy/prompt/model versions
```

This supports interpretation, ranking, correction, and safety training without exposing exact birth identity fields.

High-value labels include:

- factual chart error and corrected fact;
- unsupported interpretation and missing evidence;
- helpful/not-helpful rating with a reason code;
- tone, clarity, repetition, fatalism, and safety judgments;
- human-preferred answer between controlled candidates;
- boundary-sensitive cases and the correct uncertainty explanation.

## Dataset Governance

- Build immutable versioned snapshots in encrypted object storage.
- Keep schema, transformation code, consent policy, privacy filter, quality rules, source window, row count, and checksum in the manifest.
- Split train/validation/test by pseudonymous data subject to prevent one person's records crossing splits.
- Deduplicate repeated profiles, copied questions, and near-identical model answers.
- Keep evaluation sets isolated from training.
- Require dataset review before a model run can reference a snapshot.
- Register every model run and artifact; prohibit untracked local exports.

## Withdrawal and Deletion

Withdrawal means:

- the source becomes immediately ineligible for future datasets;
- pending and unused snapshots containing it are invalidated or rebuilt;
- existing dataset memberships identify affected model runs;
- the model owner evaluates retraining or another approved mitigation;
- operational source data follows its own retention/deletion basis;
- completion and any technical limitation are documented.

The service must not claim that a single row can always be removed instantly from the learned parameters of a deployed model. It must disclose the verified withdrawal and model-impact process.

## Prohibited Uses

- Selling individual birth profiles or conversations.
- Targeted advertising based on chart, relationship, health, finance, or emotional content.
- Training a general-purpose model unrelated to the disclosed Saju product purpose.
- Inferring medical, criminal, fertility, sexuality, political, religious, or financial-risk traits.
- Publishing raw or merely pseudonymized records as open data.
- Re-identifying a data subject or joining datasets to recover identity.
- Using fear-based or categorical outcomes as optimization labels.

## Launch Gates

- Korean privacy counsel approves purpose, consent, retention, minors, third-party, provider, cross-border, and withdrawal handling.
- Privacy impact/risk assessment is completed and owned.
- User-facing privacy notice and consent screens match implemented flows.
- PII vault, encryption keys, RLS, least privilege, audit, backup, and restore tests pass.
- Training eligibility rejects every non-consented and revoked fixture.
- Dataset inspection confirms zero direct identifiers and complete lineage.
- End-to-end deletion and model-impact tracing pass with fresh evidence.

## Legal and Guidance Basis

The Korean Personal Information Protection Act permits collection and use only under an applicable basis and within the purpose scope. Article 28-2 permits certain uses of pseudonymized information for statistics, scientific research, and public-interest archiving, but this product must not assume that ordinary commercial model improvement automatically qualifies. The default product rule is separate model-training consent until a purpose-specific legal review approves another basis.

Primary references:

- [Personal Information Protection Act, Article 15](https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029335387)
- [Personal Information Protection Act, Article 28-2](https://law.go.kr/LSW/lsInfoP.do?lsiSeq=270351)
- [PIPC Generative AI Personal Data Processing Guide](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=G010030000&nttId=11439)
- [PIPC AI Privacy Risk Management Model](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=G010030000&nttId=11014)

This document is an engineering and product-governance draft, not legal advice or a substitute for the final privacy notice.
