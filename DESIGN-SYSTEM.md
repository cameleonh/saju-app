# Saju App Four-Tradition Design System

Status: v0.4 documentation contract. Existing Saju components are the verified implementation baseline; four-tradition components are specified but not implemented.

## Direction

The interface is **아시아 네 밤하늘이 한 책상에 모이는 명식대**: deep indigo sky, warm hanji calculation sheets, a low moon, roofline silhouettes, muted ink, and moon-gold actions. It should feel like one quiet library of four traditions rather than an AI dashboard or fortune-content mall.

Signature: four original geometric marks share one orbit above an airy comparison sheet. Each native result keeps profile/time treatment, method policy, sensitivity, and evidence links inspectable without implying that the four systems calculate the same object.

## Tokens

```css
--ink-950: #f5eee2;
--ink-800: #d7cfc4;
--ink-600: #a9a3ae;
--ink-400: #7d7b8e;
--paper-50: #faf3e7;
--paper-100: #eee4d4;
--paper-200: #d9cdbb;
--paper-300: #bcae9b;
--vermilion-600: #b55f4b;
--vermilion-100: #f3dfd3;
--jade-600: #718d82;
--jade-100: #e1ebe2;
--amber-600: #b48b4e;
--amber-100: #f2e5c9;
--sky-600: #8589ae;
--sky-100: #e6e3ee;
--gold-500: #d3ad5c;
--moon-300: #f5e5b4;
--system-saju: var(--vermilion-600);
--system-horasat: var(--gold-500);
--system-tu-vi: var(--jade-600);
--system-mahabote: var(--sky-600);
--state-ready: var(--jade-600);
--state-partial: var(--amber-600);
--state-needs-input: var(--vermilion-600);
--state-unsupported: var(--ink-400);
--state-policy-blocked: var(--ink-600);
--shadow: 0 18px 42px rgba(6, 8, 22, 0.28);
--radius-panel: 16px;
--radius-card: 10px;
--radius-control: 8px;
```

The base is an indigo evening sky with warm hanji sheets. Moon-gold is the single action accent. The four system aliases identify provenance, not truth or quality. Eligibility state always combines color with a glyph, label, border/pattern, and accessible text. The moon, stars, roofline, and original system marks are the only atmospheric decoration.

## Typography

- Korean-safe body stack: `"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", Pretendard, SUIT, system-ui, sans-serif`.
- Korean-safe display stack: `"Noto Serif KR", "AppleMyungjo", "Nanum Myeongjo", Batang, "Noto Serif CJK KR", serif`.
- The prototype requests only Noto Sans KR 400 and Noto Serif KR 600. Do not add whole weight families; Korean coverage can still split into multiple unicode-range files, so a future production build should benchmark self-hosted subsets before changing the legibility baseline.
- Technical values: `ui-monospace, SFMono-Regular, Consolas, monospace` with tabular numerals.
- Product title: 30 to 40px, weight 600-700, line-height 1.3, `text-wrap: balance`, `word-break: keep-all`.
- Section title: 18 to 24px, weight 700, line-height 1.35.
- Body: 17px by default, line-height 1.65 to 1.82, maximum width 65ch.
- Reading body: 17px by default and 19px in large-text mode. Keep paragraphs under 58ch and use Korean word keeping.
- Form labels: 15px. Helper text: 14px. Small technical labels may use 12 to 13px only when they are not required to complete a task.

## Layout

- Container max width: 1180px with 20px mobile and 32px desktop gutters.
- Mobile-first breakpoints: 640px, 900px, 1180px. A component may switch to master-detail at 1000px only when its container query proves the reading column remains at least 640px.
- Primary app layout: single reading flow on mobile; comparison index + reading sheet on desktop; optional evidence drawer on wide desktop.
- Sticky mobile action bar uses safe-area padding and three context actions.
- Minimum touch target: 44px.
- Comparison reading measure: 58ch maximum for prose. Native dense charts may use the full available sheet width and their own responsive overflow contract.

## Components

- `button.primary`: moon-gold fill, night-ink text, 48px minimum height.
- `button.secondary`: paper surface, ink border, 46px minimum height.
- `surface.panel`: paper surface, 1px paper-300 border, 22px radius, soft tinted shadow.
- `surface.chart-sheet`: paper surface, navy ink, 16px radius, thin blue-gray rule, reserved for chart summary and method data.
- `control.evidence-seal`: 44px minimum-height footnote control with a small `證` seal and an underlined text label. It opens the supporting chart fact without looking like a generic status pill.
- `report.chapter`: native `details`/`summary` chapter inside one continuous hanji report sheet. The first chapter opens by default, disclosure state survives evidence inspection, and the chapter title remains keyboard operable.
- `field.place-search`: native search input with a 48px touch target and an in-flow native `select` revealed directly below it. It searches 21,836 unique current administrative and legal 동·읍·면·리 names from the official 2026-07-20 `KIKcd_H` and `KIKcd_B` snapshots without mounting the entire catalog in the DOM. Precomputed short names and bounded rank buckets avoid a full-catalog sort while typing. Unique short names resolve automatically; ambiguous names such as `삼성동` expose the matching city/district options, while broad queries show the first 20 matches and ask for a narrower term. The stored value includes the full name and 10-digit area code.
- `control.reading-size`: a result-toolbar toggle labeled `글자 크게` / `기본 글자`. It changes the reading body from 17px to 19px without changing calculated content.
- `notice`: flat semantic tint with a 3px left accent bar. No gradient fills.
- `consent-list`: full-width consent cards stacked vertically with a 12px gap. Each label is one click target, uses a 22px checkbox, and exposes a visible focus-within ring.
- `mode-card`: paired choice for `내 사주` and `커플 사주`; the latter uses two orbit dots, never a “match” meter.
- `four-tradition-hero`: one dominant personalized artifact with an original four-mark orbit, a short product promise, primary CTA `한 번 입력하고 네 전통으로 보기`, method disclosure link, and no competing catalog grid above it.
- `system-mark`: glyph + Korean label + optional native-language label. It always exposes the system ID to assistive technology and never relies on accent color alone.
- `eligibility-list`: four fixed-order rows (`saju`, `horasat`, `tu-vi`, `mahabote`) showing one of `ready`, `partial`, `needs-input`, `unsupported`, or `policy-blocked`, plus reason and one recovery action. Rows are list items, not selectable cards unless the user can actually change selection.
- `system-requirement`: inline field disclosure with system marks, `왜 필요한가요?` help, and the consequences of leaving the value unknown. It never opens after calculation as a surprise blocker.
- `system-progress-rail`: per-system queued/calculating/complete/unavailable/failed/stale status with text and `aria-live` summary. Completed rows remain stable while another system retries.
- `comparison-hero`: one sentence of neutral synthesis, completed-system count stated as context rather than a percentage, boundary/missing-input note, and links to method and all native results.
- `comparison-section`: continuous report section for `common`, `different`, or `unique`; an empty group uses explanatory copy rather than disappearing.
- `comparison-item`: domain, normalized theme, neutral summary, two or more contributor marks for common/different (one for unique), and an evidence seal. It has no gauge, rank, score, or colored verdict background.
- `system-detail-index`: mobile tabs/list or desktop side index that changes the native volume while retaining the current comparison context. Tab semantics are used only when all panels are present; route navigation uses links and `aria-current`.
- `method-drawer`: source, policy, engine, schema, input treatment, sensitivity, and limitation disclosure. On mobile it is a modal drawer with focus trap/return; on desktop it may be an adjacent panel.
- `share-sheet`: privacy preview with included/excluded fields, theme selection, 720×1080 or responsive image preview, copy/download actions, and a safe default that omits exact profile data.
- `couple-input-pair`: self on the left and partner on the right from 1000px; the same sections stack in that order below 1000px with no duplicated authority control.
- `couple-chart-pair`: two chart sheets side by side above 900px and stacked below 640px.
- `relationship-note`: a sky-tinted explanation of the current relationship state and the non-deterministic comparison boundary.
- `record-card`: one saved personal or couple reading with date, full birthplace, local/development-server state, and explicit open, export, optional-training withdrawal, and delete controls. Routine receipt and engine diagnostics do not appear on the reading itself.
- `question-helper`: an in-app deterministic reflection helper. It uses the fixed chart and categories such as work, relationship, money, and health to organize conditions and questions; it is never styled or labeled as an AI chat.
- `field`: visible border, clear label, helper text, error text, and focus ring.
- `bottom-nav`: three 44px context targets on mobile; desktop uses the top navigation.

## Interaction rules

- One primary action per screen section.
- System order is always Saju → Horasat → Tử Vi → Mahabote across input, progress, results, records, exports, and method panels. Completion order never re-sorts the list.
- Eligibility is shown before the primary calculation action. Unknown time or missing place remains an explicit value; the UI never recommends a guessed value to unlock more systems.
- Per-system loading is independently announced. Partial success opens the comparison or native results that are valid and offers scoped retry only for failed systems.
- `policy-blocked` uses the copy `계산 정책 검증 중` and links to a plain-language reason. It must not use skeleton charts, demo personal text, or disabled controls that imply a transient network wait.
- Common/different groups require at least two distinct system marks. Unique items require one mark and the label `이 체계에서만 다뤄요`; none uses victory, accuracy, or consensus language.
- Evidence inspection follows `comparison item → system claim → native fact → method/source`. Back navigation and focus return to the originating evidence seal.
- Comparison domain navigation uses buttons or links with visible selected state and a complete non-tab reading fallback for print, large text, and assistive technologies.
- Share preview defaults to no exact birth data and requires a deliberate secondary opt-in before any additional profile field can be included. Coordinates and internal IDs are never shareable.
- Consent is explicit. The service-storage acknowledgement is required before birth input. Product-improvement learning starts unchecked, is optional, and does not change the deterministic chart or reading when declined.
- Couple mode includes the partner-authority statement in the start-stage service-storage disclosure. The birth form does not repeat that checkbox, while self and partner subjects and purpose receipts remain separate at the ingestion boundary.
- Couple comparison surfaces shared elements and distribution gaps as question prompts; it never emits a compatibility score or guaranteed relationship outcome.
- Any calculation boundary warning appears before the reading, not in a hidden details panel.
- Loading uses text and skeleton blocks. Never use a generic spinner as the only status.
- Errors state what happened and the next action.
- Do not show routine storage receipts, training flags, external-AI flags, or engine versions as a result-side status card. Keep deletion available under calculation principles and surface storage failures only when action is needed.
- Top and mobile navigation mark the current information screen with `aria-current="page"`. Entering intro, input, result, method, or data views scrolls to the stage start and moves programmatic focus to its heading; opening a toast must not steal or erase that focus.
- Destructive record actions require confirmation. After deletion, clear-all, or training withdrawal, the data-view heading regains focus and the user remains at the top of the record context.
- Reduced motion removes reveal transforms and long transitions.
- Marketing animation libraries are reference-only in the current vanilla stack. Intro ambience may use one short opacity/translate reveal; result content does not use perpetual motion, cursor effects, particle fields, shimmer, or animated borders.

## Accessibility

- All controls use native semantic elements.
- Every form control has a visible label.
- Focus is visible with a 3px vermilion outline and offset.
- Status announcements use `aria-live`.
- Color is never the only encoding for chart facts, system identity, eligibility, comparison group, or task state.
- The four-mark orbit has a text alternative naming all four traditions; decorative duplicates are `aria-hidden`.
- System progress announces a summarized status change once and does not create four competing live regions.
- Master-detail layouts preserve DOM reading order: overview, status, comparison, then native detail/evidence.
- Native Tử Vi/Horasat/Mahabote diagrams require an accessible table or ordered textual equivalent defined with the approved result schema before release.
- Korean labels are tested at 320px, 390px, 768px, 1024px, and 1440px.

## Data boundary

The default product remains local-first: IndexedDB stores the guest profile, eligibility decisions, independent system results, comparison result, and any optional sync outbox. Existing development and governed account adapters remain separate from the reading surface, and production account storage stays fail-closed until its launch sign-off is complete. The four-tradition documentation update adds no storage implementation.

UI state must distinguish `local saved`, `sync pending`, `sync failed`, and `account saved` without changing calculation validity. A record can contain completed and unavailable systems. Deleting the aggregate removes local profile, eligibility, native results, comparison, and share previews transactionally; account deletion remains a separately confirmed server workflow when that capability is enabled.
