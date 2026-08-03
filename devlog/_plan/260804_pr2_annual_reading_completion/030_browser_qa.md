# Browser QA Evidence

Date: 2026-08-04 KST

Environment: local `npm start` server at `http://127.0.0.1:4174/`, headless Chromium from Playwright 1.58.2, fresh isolated browser context.

## Annual flow and lifecycle

- Started from the service-storage gate, selected `부산광역시 남구 문현동`, and created the 2026 `丙午` annual reading.
- The result rendered eight cards and twelve separate monthly entries with no console or page errors.
- The annual result area contained neither `1990-10-10` nor `문현동`.
- IndexedDB contained one `annual-reading.v1` record with hash `dd08d6c238bfb288ad6419363a3a1f8703d23a5123bdf4819ce469b865c315c4`.
- Reopening the record preserved the displayed hash prefix `dd08d6c238bf` and all eight cards.
- Confirmed deletion removed both the visible record and IndexedDB record; final record count was zero.

## Accessibility and responsive behavior

- Next-card activation changed `aria-current` from card 0 to card 1 and moved `document.activeElement` to card 1, whose programmatic target is `tabindex=-1`.
- The focused card computed a visible 3px gold focus box shadow.
- A reduced-motion Chromium context reported `prefers-reduced-motion: reduce = true` and computed button transition duration `0.00001s`.
- Horizontal overflow was zero at 320, 390, 768, 1024, and 1440 px.
- 320/390 px displayed one active card; 768/1024/1440 px displayed the eight-card overview.

## Print/privacy behavior

- Under print media, the natal chart computed `display:none`, the annual document view computed `display:block`, and the monthly disclosure remained hidden.
- No visible printable leaf text contained the raw birth date or locality.
- Chromium produced an A4 PDF without a page error.

## Local visual artifacts

The screenshots and PDF were visually inspected during the run and intentionally left outside Git because the desktop full-page PNG is 3.1 MB.

- `/tmp/saju-pr2-mobile.png`: `7a4d5572a62eedcb4e6f4fa4d24b7c144278c4b1027af1cce3cac6d49726cd7e`
- `/tmp/saju-pr2-desktop.png`: `1739aa4ec826c48fb53a48426e365476520cdcf0cc73bb659bb5fe12178e563a`
- `/tmp/saju-pr2-print.png`: `879741142991eee6378c6dd2cbe436e06fc37fb15e5db11cf6c067d7e67df39b`
- `/tmp/saju-pr2-print.pdf`: `186a814ea4759f737877a2b26efe5fba373d1067e9c3372ae59a9211ad5184bd`
