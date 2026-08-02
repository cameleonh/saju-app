---
name: 결 사주앱
colors:
  primary: "#14162A"
  accent: "#F5E5B4"
  background: "#14162A"
typography:
  heading: { fontFamily: "Noto Serif KR, Noto Sans KR, sans-serif", fontSize: "32px" }
  body: { fontFamily: "Noto Sans KR, Pretendard, sans-serif", fontSize: "16px" }
iconography:
  system: "custom orbit line"
  weight: "regular"
  domain: "astronomical calculation mark plus simple line icons"
---

# Design Read

## Product reading

This is a Korean consumer calculation tool, not a generic AI workspace. The core feeling is a small 만세력 desk after sunset: a deep indigo room, warm hanji sheets, restrained ink, a low moon, and enough density to inspect a birth input without turning the result into a dramatic prediction.

## Reference distillation

- `https://sky.told.me/`: a quiet moon-and-orbit atmosphere, compact calculation controls, and clear birthplace/time-zone metadata. We borrow its calm entry rhythm and astronomical cue, not its exact composition or assets.
- `https://github.com/be-realdeveloper/saju`: a deep reading model with a clear sequence from 명식 to 오행·십신·대운 and then 상담. We borrow the information depth, not its code or copy.
- `https://github.com/0ssw1/sajupy`: birthplace, longitude/solar-time correction, and solar-term precision are visible calculation concerns. These become method metadata and boundary explanations.
- `https://github.com/rath/orrery`: browser-first calculation and explicit chart inspection are useful trust patterns. The repository's implementation and assets remain out of scope for reuse.

## Component-source review (2026-08-02)

- `https://ui.shadcn.com/docs/components`: use its Accordion, Combobox/Command, Drawer, Field, and Separator interaction patterns as references. Do not migrate this zero-dependency prototype to React or Tailwind solely to import them.
- `https://ui.aceternity.com/categories`: reserve expressive background effects for a single intro-stage atmosphere. Spotlight, meteors, pointer effects, 3D cards, and animated borders do not belong in birth forms or reading results.
- `https://magicui.design/docs/components`: Blur Fade is the only relevant motion family, and only as a short one-time reveal with a reduced-motion fallback. Shimmer, rainbow, border-beam, dock, and particle treatments would reduce trust here.
- `https://21st.dev/`: treat the marketplace as a pattern search and comparison tool. Community code must not enter the app without an accessibility, dependency, provenance, and visual-consistency review.
- `https://www.reactbits.dev/`: borrow the restraint of Animated Content or a soft static/noise background, not the React implementation. Cursor effects, WebGL scenes, scrambled text, and perpetual motion conflict with this product's quiet reading posture.

The active application remains vanilla HTML, CSS, and JavaScript. A future React migration must be justified by product complexity, not by access to decorative components.

## Direction lock

The product uses a **조선의 저녁 달빛** direction: a deep indigo evening sky, warm hanji calculation sheets, a low moon, roofline silhouettes, muted ink typography, and one moon-gold action color. The chart is presented like a quiet evening desk where a person checks a 만세력 by lamplight. Dark dashboard chrome, metric-card grids, and AI-chat visual language are deliberately removed from the primary flow.

Couple mode keeps the same desk metaphor. The user's and partner's input sheets sit side by side from 1000px and stack on narrower screens; the result sheets follow the same left-self/right-partner order. A small relationship-state note and a paired orbit glyph establish that this is comparison, not a compatibility score. Shared elements and distribution gaps are rendered as evidence chips that lead into questions, never into “match” or “mismatch” verdicts. Partner input authority is acknowledged in the start-stage storage disclosure and is not repeated as a second checkbox at the end of the form.

The result report is one continuous hanji document with collapsible chapters, not a stack of independent feature cards. The first chapter opens by default, later chapters remain scannable, and evidence uses small seal-like footnote controls rather than generic green pills. Each chapter follows the same reading order: one-glance summary, plain-language explanation, one action, then two reflection questions. Default reading copy is 17px and a user-controlled large-text mode raises it to 19px.

The start disclosure separates a required service-storage acknowledgement from an optional, initially unselected product-learning choice. Both controls are stacked as full-width labels for older readers and touch use; declining learning does not reduce the reading. The result keeps routine storage, training, external-AI, and engine diagnostics out of the reading column. Saved readings live in the data screen as calm record cards with open, export, withdrawal when applicable, and confirmed delete controls. The question area is labeled as a rule-based organizer, not an AI conversation.

Navigation is treated as stage movement rather than a filter. The selected method, data, or home action carries a current-page state; each transition scrolls to the start and places focus on the new screen heading. Mobile bottom actions mirror the desktop navigation without changing this focus contract.

Birthplace selection reveals a filtered native `select` directly below each self or partner search field. The catalog combines the Ministry of the Interior and Safety `KIKcd_H` and `KIKcd_B` snapshots effective 2026-07-20 into 21,836 unique current administrative and legal locality names without mounting the full catalog in the DOM. Search keys are prepared once and keystrokes use bounded ranked buckets instead of sorting the full catalog. Short unique names such as `문현동` resolve to their full address, ambiguous names such as `삼성동` show every matching city and district, and broad district terms such as `해운대` show the first 20 results with narrowing guidance. The interface stores the official 10-digit code and full current name and keeps `Asia/Seoul` visible as the current calculation-time policy.

## Dials

DESIGN_VARIANCE: 5
MOTION_INTENSITY: 2
Product density profile: D5 (consumer calculation tool with dense result inspection)
Reasoning: the service needs a recognizable astronomical signature and rich chart depth, but repeated calculation and privacy decisions should remain quiet, readable, and low-motion.

## Do / do not

- Do show the four pillars, birthplace, time treatment, solar-term warning, and evidence links as first-class information.
- Do use Korean labels and a small amount of technical metadata only where it helps reproducibility.
- Do keep the first action obvious: enter birth information, then inspect the chart.
- Do not use English eyebrow labels, fake AI status badges, generic dark dashboard cards, colorful SaaS gradients, or decorative feature-card grids. A restrained static moon glow is part of the scene, not a marketing effect.
- Do not copy third-party screenshots, logos, assets, fonts, code, or content into the app.
