---
name: 결 사주앱 — 네 전통 비교
colors:
  primary: "#14162A"
  accent: "#F5E5B4"
  background: "#14162A"
typography:
  heading: { fontFamily: "Noto Serif KR, Noto Sans KR, sans-serif", fontSize: "32px" }
  body: { fontFamily: "Noto Sans KR, Pretendard, sans-serif", fontSize: "16px" }
iconography:
  system: "custom orbit line with four tradition marks"
  weight: "regular"
  domain: "astronomical calculation mark plus simple line icons"
---

# Design Read

## Product reading

This is a Korean-first comparison tool for four Asian astrology traditions, not a generic AI workspace or a fortune-content mall. The core feeling is one quiet desk where four night skies can be inspected side by side: a deep indigo room, warm hanji sheets, restrained ink, a low moon, and enough density to audit each result without turning the comparison into a dramatic prediction.

## Reference distillation

- `https://sky.told.me/`: a quiet moon-and-orbit atmosphere, compact calculation controls, and clear birthplace/time-zone metadata. We borrow its calm entry rhythm and astronomical cue, not its exact composition or assets.
- `https://github.com/be-realdeveloper/saju`: a deep reading model with a clear sequence from 명식 to 오행·십신·대운 and then 상담. We borrow the information depth, not its code or copy.
- `https://github.com/0ssw1/sajupy`: birthplace, longitude/solar-time correction, and solar-term precision are visible calculation concerns. These become method metadata and boundary explanations.
- `https://github.com/rath/orrery`: browser-first calculation and explicit chart inspection are useful trust patterns. The repository's implementation and assets remain out of scope for reuse.
- `https://horasat.kr/`: the live flow demonstrates a Korean-language entry point for Thai Horasat, Vietnamese Tử Vi, and Myanmar Mahabote. We use it to understand market vocabulary, input expectations, and native chart presentation; it is not the sole calculation oracle and its visual composition is not copied.
- `https://apps.apple.com/us/app/co-star-personalized-astrology/id1264782561`: a strong personalized artifact, dense chart inspection, friend comparison, and paid depth show how one result can lead to relationship and repeat-use journeys. We adopt the result-first hierarchy, not the monochrome brand or deterministic compatibility framing.
- `https://apps.apple.com/us/app/chani-your-astrology-guide/id1532791252`: accessible chart explanation, reflective daily/weekly routines, audio depth, and beginner-to-expert layering support progressive disclosure. We adopt the explanatory cadence, not its content or Western-astrology visual language.
- `https://apps.apple.com/us/app/finch-self-care-pet/id1528595748`: short check-ins, one manageable action, and gentle continuity are useful adjacent-category patterns for later reflection features. Gamified pet mechanics and streak pressure are not part of comparison P0.
- `https://play.google.com/store/apps/details?hl=ko&id=com.un7qi3.forceteller` and `https://play.google.com/store/apps/details?hl=ko&id=handasoft.mobile.divination`: Korean apps validate demand for a broad catalog, daily return, saved relationship data, and layered free/paid content. We reject their score-heavy, ad-dense, and content-catalog-first patterns for the first comparison result.

## Component-source review (2026-08-02)

- `https://ui.shadcn.com/docs/components`: use its Accordion, Combobox/Command, Drawer, Field, and Separator interaction patterns as references. Do not migrate this zero-dependency prototype to React or Tailwind solely to import them.
- `https://ui.aceternity.com/categories`: reserve expressive background effects for a single intro-stage atmosphere. Spotlight, meteors, pointer effects, 3D cards, and animated borders do not belong in birth forms or reading results.
- `https://magicui.design/docs/components`: Blur Fade is the only relevant motion family, and only as a short one-time reveal with a reduced-motion fallback. Shimmer, rainbow, border-beam, dock, and particle treatments would reduce trust here.
- `https://21st.dev/`: treat the marketplace as a pattern search and comparison tool. Community code must not enter the app without an accessibility, dependency, provenance, and visual-consistency review.
- `https://www.reactbits.dev/`: borrow the restraint of Animated Content or a soft static/noise background, not the React implementation. Cursor effects, WebGL scenes, scrambled text, and perpetual motion conflict with this product's quiet reading posture.

The active application remains vanilla HTML, CSS, and JavaScript. A future React migration must be justified by product complexity, not by access to decorative components.

## Direction lock

The product evolves **조선의 저녁 달빛** into **아시아 네 밤하늘이 한 책상에 모인다**. Deep indigo remains the room; warm hanji remains the reading surface; the low moon remains the main action cue. Four restrained system marks identify Korean Saju, Thai Horasat, Vietnamese Tử Vi, and Myanmar Mahabote without splitting the product into four branded microsites. Dark dashboard chrome, metric-card grids, crystal-ball clichés, national-flag decoration, and AI-chat visual language are deliberately removed from the primary flow.

The home screen has one dominant personalized action above all secondary content: **한 번 입력하고 네 전통으로 보기**. A four-mark orbit explains the product in one glance. System explainers sit below the CTA as editorial rows, not equal-weight feature cards. The user should encounter the value proposition before market content, subscriptions, daily feeds, or account prompts.

The comparison result is the hero artifact. It opens with a calm one-sentence synthesis, a four-system status rail, and three reading sections in this order: **공통으로 보는 점**, **다르게 보는 점**, **이 체계만 보는 점**. Each item shows contributing system marks and a seal-style **근거 보기** control. Contributor count is informational; percentages, radial scores, rankings, winners, and “정확도” meters are prohibited.

Native system detail remains one continuous document per tradition. Saju keeps its pillar sheet; Horasat gets its policy-approved wheel/table structure; Tử Vi gets its policy-approved palace board; Mahabote gets its policy-approved house/planet structure. These are not forced into one card template. Shared typography, spacing, method drawers, warnings, evidence seals, and navigation make them feel like volumes from one library.

Couple mode keeps the same desk metaphor. The user's and partner's input sheets sit side by side from 1000px and stack on narrower screens; the result sheets follow the same left-self/right-partner order. A small relationship-state note and a paired orbit glyph establish that this is comparison, not a compatibility score. Shared elements and distribution gaps are rendered as evidence chips that lead into questions, never into “match” or “mismatch” verdicts. Partner input authority is acknowledged in the start-stage storage disclosure and is not repeated as a second checkbox at the end of the form.

Couple Saju remains an existing secondary mode. It is never mixed with **네 전통 비교** in the same start choice, and the first expansion release does not imply two people × four traditions.

The result report is one continuous hanji document with collapsible chapters, not a stack of independent feature cards. The first chapter opens by default, later chapters remain scannable, and evidence uses small seal-like footnote controls rather than generic green pills. Each chapter follows the same reading order: one-glance summary, plain-language explanation, one action, then two reflection questions. Default reading copy is 17px and a user-controlled large-text mode raises it to 19px.

The start disclosure separates a required service-storage acknowledgement from an optional, initially unselected product-learning choice. Both controls are stacked as full-width labels for older readers and touch use; declining learning does not reduce the reading. The result keeps routine storage, training, external-AI, and engine diagnostics out of the reading column. Saved readings live in the data screen as calm record cards with open, export, withdrawal when applicable, and confirmed delete controls. The question area is labeled as a rule-based organizer, not an AI conversation.

Navigation is treated as stage movement rather than a filter. The selected method, data, or home action carries a current-page state; each transition scrolls to the start and places focus on the new screen heading. Mobile bottom actions mirror the desktop navigation without changing this focus contract.

The expansion stage order is fixed:

1. **소개** — value proposition, four systems, method/entertainment disclosure, primary CTA.
2. **프로필 입력** — common fields first; system-specific requirements appear only when needed.
3. **계산 가능 확인** — four eligibility rows with `준비됨`, `일부 가능`, `정보 필요`, `지원 안 함`, or `정책 준비 중` and exact recovery copy.
4. **계산 진행** — independent per-system states; one failure does not reset completed systems.
5. **비교 결과** — synthesis, status rail, common/different/unique sections, native-detail links.
6. **체계 상세** — native chart, interpretation chapters, method/evidence drawer.
7. **보관함·데이터** — local records, export, share, deletion, and optional sync status.

On mobile, the comparison is a single reading column with a horizontally scrollable but keyboard-operable system status rail and sticky bottom actions for **상세 보기** and **공유**. On desktop from 1000px, a 280–320px left index lists domains and systems while the 640–760px reading sheet remains the main measure; the evidence drawer occupies a right-side overlay or adjacent pane without compressing body text below 17px. No primary journey requires page-level horizontal scrolling.

## Four-system visual contract

The base palette remains shared. System identity uses one accent token plus a glyph and text label, never color alone:

| System ID | Korean label | Accent role | Mark direction |
|---|---|---|---|
| `saju` | 한국 사주 | vermilion seal | four-pillar grid |
| `horasat` | 태국 호라삿 | moon-gold line | orbit and horizon |
| `tu-vi` | 베트남 뜨비 | jade line | twelve-palace frame |
| `mahabote` | 미얀마 마하보테 | sky line | seven-house stepped mark |

The marks are original geometric UI symbols, not sacred replicas, national emblems, or copied app icons. A completed system uses solid ink plus its accent; partial uses a striped paper pattern; needs-input uses an outlined mark; unsupported uses muted ink; policy-blocked uses a lock label. The same state encoding is used in input, loading, result, saved records, and exports.

## Interaction and content rules

- Common fields render first. A system requirement appears inline with a short “왜 필요한가요?” explanation and never as a surprise modal after submission.
- Unknown time is a first-class choice. The next screen explains which systems remain possible; it does not pressure the user to estimate.
- Progress is per system: queued, calculating, complete, unavailable, failed, or stale. Motion is limited to one short orbit sweep and respects `prefers-reduced-motion`.
- A failed system card contains reason, preserved completed results, and a scoped retry. The global CTA never says “다시 시작” unless the normalized profile itself is invalid.
- Comparison copy uses “두 체계가 비슷하게 말해요”, “관점이 갈려요”, and “이 체계에서만 다뤄요”. It never uses “맞았다”, “더 정확하다”, “운명 일치율”, or “신뢰도 92%”.
- Share cards contain a title, selected theme, contributing system labels, reflection prompt, method/disclaimer mark, and product URL. Exact birth data, coordinates, profile label, record ID, and hidden systems are excluded by default.
- Monetization starts after free value is delivered. Method evidence, policy/version labels, unavailable reasons, privacy controls, and the comparison overview are never paywalled. Later paid depth may include longer native reports, annual timing, audio, or bounded Q&A.

Birthplace selection reveals a filtered native `select` directly below each self or partner search field. The catalog combines the Ministry of the Interior and Safety `KIKcd_H` and `KIKcd_B` snapshots effective 2026-07-20 into 21,836 unique current administrative and legal locality names without mounting the full catalog in the DOM. Search keys are prepared once and keystrokes use bounded ranked buckets instead of sorting the full catalog. Short unique names such as `문현동` resolve to their full address, ambiguous names such as `삼성동` show every matching city and district, and broad district terms such as `해운대` show the first 20 results with narrowing guidance. The interface stores the official 10-digit code and full current name and keeps `Asia/Seoul` visible as the current calculation-time policy.

## Dials

DESIGN_VARIANCE: 5
MOTION_INTENSITY: 2
Product density profile: D5 (consumer calculation tool with dense result inspection)
Reasoning: the service needs a recognizable astronomical signature and rich chart depth, but repeated calculation and privacy decisions should remain quiet, readable, and low-motion.

## Do / do not

- Do show per-system eligibility, native chart, input/time treatment, policy-specific boundary warnings, and evidence links as first-class information.
- Do use Korean labels and a small amount of technical metadata only where it helps reproducibility.
- Do keep the first action obvious: enter one profile, confirm eligible traditions, then inspect the comparison and native charts.
- Do retain disagreements and unavailable systems as useful information.
- Do not use English eyebrow labels, fake AI status badges, generic dark dashboard cards, colorful SaaS gradients, or decorative feature-card grids. A restrained static moon glow is part of the scene, not a marketing effect.
- Do not use gauges, percentages, winner medals, national flags, exoticized sacred imagery, or four competing brand palettes to represent system truth.
- Do not copy third-party screenshots, logos, assets, fonts, code, or content into the app.
