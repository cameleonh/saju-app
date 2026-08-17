# Gap Analysis: Doryeong Benchmark — What Is Missing Before Borrowing

> Audit date: 2026-08-17 · READ-ONLY analysis (no code was modified)
> Sources inspected: `PROJECT_STATUS.md` (2026-08-06, partly stale — see §2), `PRD.md` v0.3, `DESIGN.md`, `DESIGN-SYSTEM.md`, `DEPLOYMENT.md`, `docs/` (incl. `docs/legal/`), `annual/`, `chart/`, `server/` (domain, storage, auth), `db/migrations/`, `tests/`, `index.html` (client), seed files.
> External references (user-captured): `.dashboard-orchestrator/prompts/saju-doryeong-terms-reference.md`, `saju-doryeong-daily-result.md` (on the operator machine, outside this repo).

---

## 1. Benchmark: what Doryeong ships

| Area | Doryeong | saju-app today |
|---|---|---|
| Free | Today's energy (일운), character typing ("나는 무슨 형"), 귀인지도 | Full natal + annual + daewoon + couple readings, all free |
| Paid | 9 products @ KRW 990 each (사주풀이, 애정운, 직업운, 궁합, 한해운세, 대운, 택일, 소개팅…) + 고민상담 @ KRW 330 | No paid products; PRD explicitly excludes payment processing from MVP |
| Model | Question-ticket purchases, per-item unlock | Free, no billing code at all (verified: zero `payment/billing/결제` matches in app, server, scripts) |
| Accounts | Social login (Kakao/Naver), 14+ signup gate, profile menu (tickets, payments, 사주관리) | Cognito email/password + **required TOTP MFA**, optional accounts, single consent checkbox, no age gate |
| Voice/character | "도령" character (청염이) with a separate casual-voice commentary layer | No character; consistent 존댓말 expert tone |
| Trust posture | AI-generated content disclosed, refund clauses, operator identity published | Deterministic engines, evidence chips, KMS encryption — but operator/legal sign-off all BLOCKED |

**Core asymmetry:** saju-app is engine-rich and product-poor; Doryeong is product-rich with thinner calculation transparency. The borrowing strategy should be *packaging, gating, and voice* — not engine work.

---

## 2. Verified state of existing features

Note: `PROJECT_STATUS.md` (2026-08-06) says Layer A = 31 patterns. The seed files now contain **40 annual patterns** (10 day masters × 4 target years 2024–2027; 8 keys per seed file × 5 files, all `review_status: approved`) and **120 month-branch patterns** (10 day masters × 12 branches; A2 of `docs/FULL-PERSONALIZATION.md` is complete). Layer B composer (`server/domain/reading-composer.mjs`) injects month-branch seasonal context, daewoon ten-god themes, clash/harmony modifiers, and tone adjustments; `reading-enrichment.mjs` deterministically derives colors, directions, numbers, organs, and seasonal timing per element/ten-god.

### Feature × completeness matrix

| Feature | Engine | Content depth | UI | Verdict |
|---|---|---|---|---|
| **Natal (명식)** | ✅ `KR-CIVIL-1.0`, golden + boundary fixtures, 1900–2100 | ⚠️ Medium — 8 static client chapters (element/ten-god/hidden-stem guides + reflection questions) + 10 day-master profile hints (`day-master-profiles.mjs`: image/romance/career/health hints). No Doryeong-grade per-day-master natal prose | ✅ Pillar aperture, boundary warnings, evidence chips, large-text mode | **(a) engine yes, content shallow** — natal reading is the *least* personalized surface even though Layer A/B machinery exists |
| **Annual (연운)** | ✅ `KR-ANNUAL-IPCHUN-1.1` + `ziping-annual-basic@1.1.0`, 2024–2026 enabled (fixtures to 2027) | ✅ Deep — 40 Layer A patterns × (8 cards + 13 domain modules + 24 monthly slots) = 1,800 approved modules + A2 month 120 patterns + Layer B personalization + deterministic enrichment | ✅ `annual/client.mjs`: 8-card deck, 13-domain collapsible grid, 12-month flow, PNG export | **Strongest asset.** Not packaged as a product (free flow only; no teaser/paid split, no share URL, no grade badges) |
| **Daewoon (대운)** | ✅ `KR-DAEWOON-1.0` + branch analysis (6 clash, 6 harmony, 3 three-harmony, punishment, harm, resentment) | ✅ Deep — 130 modules (10 ten-gods × 13 domains, `daewoon-domains.mjs`) + tone summaries | ✅ Interactive timeline (current-cycle marker) + per-cycle detail panel with domain grid + interaction chips | **Complete.** Easily re-packageable as the Doryeong-style "대운" paid item |
| **Couple/궁합** | ✅ Two-chart comparison, relationship-state input | ⚠️ Medium — 7 static chapters + rule-based couple Q&A; shared-element/distribution-gap facts; deliberately no scores (product principle) | ✅ Side-by-side sheets, warnings, combined elements panel | **(a) engine yes, content shallow** — vs. Doryeong's paid 궁합 item, ours lacks per-combination interpretation depth (day-master-pair, branch-repair/clash narrative). Score-free framing is a *differentiator to keep*, not a gap |
| **Love (애정운)** | ◐ Partial — romance exists as a domain inside daewoon (130-module set) and annual (13-domain set) + `romance_hint` per day master | ⚠️ Domain-level only; no standalone love product (single-year romance arc, partner-search timing) | ❌ No standalone surface | **(a/c) hybrid** — content exists as a *slice* of other products; needs standalone packaging + love-specific depth |
| **Career (직업운)** | ◐ Same pattern — career domain in daewoon/annual + `career_hint` | ⚠️ Domain-level; no job-fit/transition-period narrative | ❌ No standalone surface | **(a/c) hybrid** — same as love |
| **Date selection (택일)** | ◐ Primitive — day-pillar computation exists in the natal engine for arbitrary dates; month/day term data 2024–2027 in `annual-ephemeris` | ❌ No selection rules (avoid/clash/grade for candidate dates) | ❌ None | **(c) absent** (PRD explicitly excludes; engine primitive is reusable) |
| **Dating intro (소개팅)** | ❌ | ❌ | ❌ | **(c) absent entirely** |
| **Worry counseling (고민상담)** | ◐ Rule-based question helper (`buildReflectionAnswer`) is live in both single and couple flows | ⚠️ Templated reflective answers by category (work/relationship/money/health); deterministic, non-AI | ✅ Chat-style card, "AI 예측 아님" labeling | **(b/c) hybrid** — UI exists and is honest, but depth is far below a paid counseling item. Local-Ollama LLM pipeline (`scripts/llm-generate-reading.mjs`) exists for *content generation*, not runtime chat |
| **Daily fortune (일운/오늘의 기운)** | ◐ Primitives — day pillar for any date computable; clash/harmony interactions computable via `daewoon-branch-analysis`; **no 신살 (천을귀인 등) module** | ❌ No daily content rules, no grade rubric | ❌ None | **(c) absent** with reusable engine primitives (see §7 for the captured Doryeong daily-result pattern) |
| **Character product ("나는 무슨 형")** | ❌ | ❌ | ❌ | **(c) absent entirely** — needs character system + deterministic typing rule (e.g., day-master × month-branch) |
| **Payments** | — | — | ❌ Zero billing code; PRD excludes; no PG, no refund terms in `terms.html` | **(c) absent** — largest single build |
| **Accounts** | ✅ Cognito auth-code + PKCE, required TOTP, opaque 1h sessions, deletion lifecycle, RLS, KMS envelopes | — | ✅ Login/logout in topbar | Complete but **email/password only** (see §5 social login); production storage fail-closed local-only pending legal gates |

### Three-bucket gap classification (per spec)

- **(a) Engine present, content shallow:** natal reading depth; couple interpretation depth; love/career as standalone items (content exists only as domains inside daewoon/annual).
- **(b) UI incomplete only:** no major case — both annual and daewoon render paths are live. Minor UI gaps: no themed loading narrative, no result share URL, no grade badges, no profile menu (needs accounts/products first).
- **(c) Absent entirely:** 택일 (rules), 소개팅, daily fortune (product + 신살), character typing, payments, onboarding consent gate, social login.

---

## 3. Payments & account state (detail)

- **Payments:** none. No PG integration, no ticket/entitlement model, no refund/consumer-protection clauses anywhere in `terms.html` or `docs/legal/`. Doryeong's reference clauses (전자상거래법 §17(2)⑤ auto-refund on failed generation, bundle partial rules) are in the terms-reference capture — structure only, never copy.
- **Accounts:** Cognito authorization-code + PKCE, **TOTP MFA required**, verified ID tokens + nonce, opaque sessions, full deletion lifecycle with 7-day backup-expiry evidence. Cloud save remains `SAJU_STORAGE=local-only` and fails closed until `docs/legal/LAUNCH-SIGNOFF.md` gates complete — **all 7 gates BLOCKED** (operator identity, rights contact, AWS processor/transfer, legal-basis/retention, infrastructure, security, product-truth).
- **Implication for borrowing Doryeong's model:** question-tickets require (i) a PG (KakaoPay/PortOne decision), (ii) entitlement storage in `ops` schema, (iii) refund terms, (iv) the same legal sign-offs already blocking cloud save. Payments are the *longest-lead* item; product packaging (§8) can land before payments exist.

---

## 4. Legal document assets (`docs/legal/`) — status for the terms-rewrite work

Existing (all English, internal): `DATA-MAP.md`, `LEGAL-BASIS-MATRIX.md`, `RETENTION-DELETION-SCHEDULE.md`, `PROCESSOR-TRANSFER-REGISTER.md`, `RIGHTS-PROCEDURE.md`, `INCIDENT-BREACH-RUNBOOK.md`, `PRIVACY-RISK-ASSESSMENT.md`, `LAUNCH-SIGNOFF.md`. Public Korean pages: `terms.html`, `privacy.html`, `copyright.html` — accurate for the current free/local-first service.

For the Doryeong-structured rewrite (11-article terms / 10-section privacy, structure only):

- **Already stronger than Doryeong (write as advantages):** KMS envelope encryption of birth input with authorized-decrypt-only reconstruction; **no cross-border AI transfer** (LLM generation runs on local Ollama, offline); domain-separated keyed HMAC email evidence (no plaintext emails in DB); deterministic engines with versioned evidence.
- **Gaps to add when features land:** payment/refund articles (none exist), social-login identity disclosure (Cognito + Kakao/Naver/Google as identity sources), 14+/19+ age statements (see §6), operator identity row (blocked gate), and processor-register additions for any PG. Doryeong's actual clauses must never be copied — only the section skeleton.

---

## 5. Social login (Kakao/Naver/Google via Cognito OIDC)

**Current state:** `server/auth/cognito.mjs` implements a single `/auth/login` → Cognito hosted UI (email/password, required TOTP). `db/migrations/002_identity_sessions_rls.sql` hardcodes `identity_provider = 'cognito'` in four places: the CHECK constraint on `ops.identity_links`, its PK/unique keys, and four literals inside `ops.auth_upsert_cognito(...)`.

**Schema impact — two options:**

1. **Federate through Cognito (recommended).** Add Kakao/Naver/Google as Cognito identity providers; all federated logins still arrive as Cognito-issued ID tokens with a Cognito `sub`. `identity_provider` correctly stays `'cognito'` — **no CHECK change, no migration strictly required.** Optionally add one nullable `upstream_provider` column (display "가입방식: 네이버" like Doryeong) — one small additive migration.
2. Extend the CHECK to `kakao|naver|google|cognito` and generalize the upsert function. Only needed if a provider is ever verified *outside* Cognito. More invasive (function rename, re-grants, test churn) with no near-term benefit. Not recommended.

**Cognito setup facts:** Google (and Facebook) are native Cognito providers; **Kakao and Naver must be added as custom OIDC providers** using their discovery documents:
- Kakao issuer: `https://kauth.kakao.com/.well-known/openid-configuration`
- Naver issuer: `https://nid.naver.com/.well-known/openid-configuration`

**User actions required (cannot be automated):**

| Provider | Where | What to obtain |
|---|---|---|
| Google | Google Cloud Console → APIs & Services → Credentials | OAuth client ID + secret (web application), callback = Cognito domain |
| Kakao | Kakao Developers → 애플리케이션 | REST API key (client ID) + client secret, **OIDC 활성화**, allowed redirect to Cognito |
| Naver | 네이버 개발자센터 → 애플리케이션 등록 | Client ID + secret, callback URL = Cognito domain |

**Code work (small):** login buttons per provider (authorize URL gains the `identity_provider` param or per-IdP `x-client-id`), pass-through of the upstream provider label into `/v1/me` + records UI, tests. Estimate **~1–2 dev-days + user console work**.

**Policy decisions needed (flag for operator):**

- **Account linking:** same verified email via two providers → Cognito default creates *separate* users. Choose: auto-link by verified email (alias-based, frictionless, standard for consumer apps — matches Doryeong behavior) vs. separate accounts vs. Lambda pre-signup linking. Auto-link by verified email is recommended; our callback already rejects unverified emails.
- **MFA friction:** TOTP is currently *required*. Social sign-in users will be forced into TOTP enrollment — a significant drop-off point for a consumer fortune app. Decide: keep required (security-first, differentiated), or make TOTP optional-when-social (risk accepted). This is the single biggest UX decision in the social-login scope.
- **Deletion path:** unchanged — Cognito identity deletion already covers federated users.

---

## 6. Onboarding consent gate (Doryeong signup pattern)

**Current state:** one required checkbox ("저장 안내/이용약관 확인" — couple mode adds partner-authority wording) shown *before birth input*, with links to `/privacy.html` and `/terms.html`. No age confirmation, no one-time gate persisted, no profile menu. Full-text pages exist and are accurate.

**Doryeong pattern to adopt:** a once-per-user gate with three required items — [필수] 이용약관 동의, [필수] 개인정보처리방침 동의, [필수] 만 14세 이상 확인 (radio: 만 14세 이상 / 미만; "미만" blocks service use).

**Age-threshold options (decision for operator):**

| Option | Rule | Fit |
|---|---|---|
| A (recommended) | **Two-tier: service 14+, cloud save 19+** | Matches PIPA 만-14 consent age *and* our existing under-19-local-only storage policy; smallest legal delta. Gate copy: "서비스는 만 14세 이상, 계정 저장은 만 19세 이상 본인만" |
| B | Single 19+ gate | Simplest, but blocks 14–18 from a read-only local service for no privacy benefit and diverges from market norm (Doryeong 14+) |
| C | Single 14+ gate with 19+ notice only | Weakest — the 19+ storage restriction would rely on prose |

**Work:** extend the existing consent-list component to three items (two checkbox links + age radio), persist gate-passed in IndexedDB (and as an account attribute when logged in), keep the current storage notice as a separate second step. **~0.5–1 dev-day.** No schema change required for the local gate; one optional account attribute when accounts are involved.

---

## 7. Result-page pattern (daily) — from the captured Doryeong "오늘의 기운" result

Captured structure: grade-badge headline → chart table (pillars + ten-god labels + zodiac note) → element counts → evidence flow diagram (today's 일진 → ten-god meeting natal chart → 합충 → 신살) → 4 domain cards with grade badges → lucky item (element-linked) → today's quest → timed benefactor (시간대) → character's one-liner (casual voice) → share link + 4-product upsell.

**What existing Layer A/B data already supports vs. what needs new generation rules:**

| Doryeong element | saju-app readiness |
|---|---|
| Evidence flow (일진 → ten-god → 합충) | ✅ Computable today: day pillar for any date (natal engine), ten-god (composer), clash/harmony (`daewoon-branch-analysis`) |
| Domain cards (분위기/성공/연애/에너지) | ✅ Layer A domain modules + enrichment provide domain prose with colors/timing/organs |
| Lucky item (오행 소품) | ✅ `reading-enrichment` colors/directions/numbers map directly; item list is a small deterministic table |
| Grade badges ("아주 좋아요") | ⚠️ **New deterministic rubric needed** (ten-god + interaction scoring) + a product-principle decision — PRD bans compatibility *scores*; qualitative tone badges are adjacent and need an explicit operator call |
| 2-tier voice (polite body + character line) | ◐ Composer already does tone adjustment; a character-voice variant is a new deterministic template set |
| Today's quest | ⚠️ New rule templates keyed by ten-god/interaction (deterministic, feasible) |
| Timed benefactor (시간대 귀인) | ❌ Requires a **신살 module** (천을귀인 etc.) — new engine piece; hour-branch math exists |
| Share URL | ❌ Needs a privacy review first: results are local today; sharing implies either privacy-safe client export or server-hosted result pages (new surface + legal review) |
| Upsell curation | ❌ Blocked on payments (§3) |

---

## 8. UX patterns to adopt

- **Themed loading narrative** — Doryeong wraps waits in character-world copy ("도령이 풀이를 적어 내려가는 중", "하늘의 기운을 읽는 중…"). Our DESIGN-SYSTEM already mandates text + skeleton (never a bare spinner); add a themed copy line for the annual-fetch and any future generation waits. Character name pending (§9). Small effort, big perceived-quality gain.
- **Profile menu** (tickets, payments, 사주관리, 문의, logout, withdrawal) — relevant once accounts/products land; Doryeong's menu map is in the terms-reference capture.
- **`/daily` page itself** could not be verified directly (HTTP 429 at capture time); the result-page pattern above substitutes for it. Mark "needs verification" if exact page flow matters later.
- **Result share + upsell** — see §7 blockers.

---

## 9. Visual design reference

**Current identity (keep):** "조선의 저녁 달빛 명식대" — deep indigo `#14162A` evening shell, warm hanji paper tokens (`--paper-50…300`), moon-gold single action accent, seal-style evidence controls (`證`), 17px/19px reading sizes, WCAG 2.2 AA focus, self-hosted Noto Sans/Serif KR (no third-party font/analytics requests), zero-dependency vanilla stack. DESIGN_VARIANCE 5 / MOTION_INTENSITY 2.

**Doryeong reference (borrow selectively):**

| Borrow | Keep ours |
|---|---|
| Hanji-bright content surfaces — use the existing paper tokens more generously on result grids so product cards read light/warm against the indigo shell | The indigo evening brand shell and moon/orbit signature (more distinctive than Doryeong's generic light theme) |
| Card-first product/result layouts (domain cards, daily cards) — we already have `reading-domain-card` / `daewoon-domain-card` grids to extend | Continuous hanji document report with collapsible chapters (trust posture) |
| Generous whitespace + friendly headline patterns ("{name}님의 …") | Evidence-seal system — our core differentiator vs. Doryeong's AI prose |
| Grade-badge component styling (pending the §7 principle decision) | Accessibility baseline, large-text mode, reduced-motion rules |

**Character concept (replacement required — never "도령/청염이").** Candidates for operator selection:

1. **서생 (Joseon scholar-scribe)** — fits the existing 달빛 명식대 desk metaphor; voice: quiet scholarly warmth; lowest brand disruption. *Recommended.*
2. **신점 할머니 (fortune-teller grandmother)** — warm, folksy, strong divination archetype; shifts tone more casual/marketplace; pairs well with a brighter hanji look.
3. **무녀 (mudang shaman)** — distinctive and atmospheric; carries religious/cultural-sensitivity risk and a heavier illustration budget.

Naming, tone rules, and the 2-tier voice split (§7) are decided with the character choice. Screenshots will be compared live in a browser during implementation — no capture needed now.

---

## 10. Recommended borrowing priority (for operator decision)

Ranked by impact × readiness (assets that exist today rank higher):

| # | Item | Bucket | Leverages | Est. effort | Blocks |
|---|---|---|---|---|---|
| 1 | **Onboarding consent gate (14+/19+ two-tier)** | §6 | Existing consent-list UI, terms/privacy pages | 0.5–1 d | — |
| 2 | **Themed loading narrative** | §8 | DESIGN-SYSTEM loading rules | 0.5 d | Character choice |
| 3 | **Annual/daewoon product packaging** (grade-badge decision, card presentation polish, brighter hanji surfaces) | §7/§9 | Complete Layer A/B + live UIs | 1–2 d | Badge principle call |
| 4 | **Natal reading depth** — day-master natal modules through the existing composer (10 patterns × 13 domains, mirroring the A2 pipeline) | (a) | Composer, enrichment, LLM seed pipeline | 2–4 d (incl. review) | — |
| 5 | **Social login** (Kakao/Naver/Google via Cognito federation, option A) | §5 | Cognito auth stack | 1–2 d + user console keys | MFA-friction + linking decisions |
| 6 | **Daily (일운) product** — day-pillar + interactions + grade rubric + quest/lucky-item rules; 신살 module optional for v1 | (c) | Engine primitives, enrichment | 4–8 d | Badge rubric; 신살 for timed benefactor |
| 7 | **Love/career standalone products** — repackaged domain slices with added depth | (a/c) | Daewoon/annual domain sets | 3–5 d each | — |
| 8 | **Couple depth** — day-master-pair and branch-interaction narratives (score-free) | (a) | Couple flow, branch analysis | 2–4 d | — |
| 9 | **Worry counseling upgrade** — deeper deterministic rules or local-LLM drafts behind the honest "rule-based" framing | (b/c) | Question helper, Ollama pipeline | 3–6 d | Privacy/purpose review if LLM at runtime |
| 10 | **Payments (question tickets) + refund terms** | (c) | Nothing yet | 1–2 w + PG signup | Legal sign-offs (same gates as cloud save) |
| 11 | **택일 / 소개팅 / character typing** | (c) | Partial primitives (택일 only) | 1–2 w each | Character choice (for typing) |

Suggested sequencing: **1→2→3** are cosmetic/UX quick wins; **4→5** deepen trust and access; **6→7→8** build the Doryeong-style product line on existing engines; **10** unlocks monetization last, in step with the legal gates.

---

## 11. Audit corrections & open items

- `PROJECT_STATUS.md` understates Layer A (31 → actual 40 approved patterns; A2 month-branch 120/120 complete). Status doc should be refreshed at next touch (not done here — read-only).
- Doryeong `/daily` page flow: unverified (429); captured result page used instead.
- Decisions parked with the operator: grade-badge principle (PRD score ban adjacency), MFA-for-social, account-linking rule, age-gate option (A/B/C), character concept (1/2/3), PG selection.
