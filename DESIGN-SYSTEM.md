# Saju App Design System

Status: verified implementation baseline v0.3, aligned with `DESIGN.md`

## Direction

The interface is a 조선의 저녁 달빛 명식대: deep indigo sky, warm hanji calculation sheets, a low moon, roofline silhouettes, muted ink, and moon-gold actions. It should feel like a quiet evening 만세력 desk rather than an AI dashboard.

Signature: a small orbit mark and an airy calculation sheet that keeps the four pillars, birthplace/time treatment, method policy, and evidence links visible in one glance.

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
--shadow: 0 18px 42px rgba(6, 8, 22, 0.28);
--radius-panel: 16px;
--radius-card: 10px;
--radius-control: 8px;
```

The base is an indigo evening sky with warm hanji sheets. Moon-gold is the single action accent. Cinnabar, jade, amber, and blue-gray are reserved for chart states; the moon, stars, and roofline are the only atmospheric decoration.

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
- Mobile-first breakpoints: 640px, 900px, 1180px.
- Primary app layout: two-column product stage on desktop, single flow on mobile.
- Sticky mobile action bar uses safe-area padding and three context actions.
- Minimum touch target: 44px.

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
- `couple-input-pair`: self on the left and partner on the right from 1000px; the same sections stack in that order below 1000px with no duplicated authority control.
- `couple-chart-pair`: two chart sheets side by side above 900px and stacked below 640px.
- `relationship-note`: a sky-tinted explanation of the current relationship state and the non-deterministic comparison boundary.
- `record-card`: one saved personal or couple reading with date, full birthplace, local/development-server state, and explicit open, export, optional-training withdrawal, and delete controls. Routine receipt and engine diagnostics do not appear on the reading itself.
- `question-helper`: an in-app deterministic reflection helper. It uses the fixed chart and categories such as work, relationship, money, and health to organize conditions and questions; it is never styled or labeled as an AI chat.
- `field`: visible border, clear label, helper text, error text, and focus ring.
- `bottom-nav`: three 44px context targets on mobile; desktop uses the top navigation.

## Interaction rules

- One primary action per screen section.
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
- Color is never the only encoding for chart facts.
- Korean labels are tested at 320px, 390px, 768px, 1024px, and 1440px.

## Data boundary in the prototype

The prototype uses IndexedDB for the device record cache and purpose-receipt-bound outbox. The combined local server durably stores accepted submissions in `data/saju.sqlite` and supports submission-level deletion and optional-training withdrawal. This is development durability only: no production PostgreSQL, KMS, account identity, subject-level authorization, retention job, or cross-device synchronization is connected.
