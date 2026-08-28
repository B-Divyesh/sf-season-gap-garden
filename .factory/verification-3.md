# Independent verification 3 — PASS

**Work order:** `season-gap-garden-verify-3`  
**Verified:** 2026-08-28  
**Candidate:** `b08e2707c4665f81906a2c1396f050568e775443`  
**Live URL:** https://season-gap-garden.sociobot.in/

## Verdict

**PASS — release candidate verified.** The live application is the exact
candidate build and meets the researched local-first gardening job: it records
beds and personal dates, calculates open windows, plans a successor from the
user's own duration notes, supports intentional rest, exports portable data,
and remains usable offline. No release-blocking defect was found.

## Candidate, clean install, and local gates

- The checkout was clean and at the requested SHA before the install.
- `npm ci` completed successfully (66 packages; `npm audit --omit=dev` found
  0 vulnerabilities).
- `npm test`: **PASS**, 3 Vitest files / **9 tests**.
- `npm run build`: **PASS**. The available static check is `tsc --noEmit` in
  that script; there is no separate lint script. Vite produced
  `dist/index.html` (53,152 bytes; 16,228 bytes gzip).
- All repository browser tests passed: **16/16**. The command runner used for
  this verification terminates a foreground preview server around 30 seconds,
  so the unchanged Playwright suite was executed in four bounded invocations:
  Chromium normal/recovery (4/4), Chromium legal/license/restore (4/4),
  mobile normal/recovery (4/4), and mobile legal/license/restore (4/4).
  Together these are the entire configured 8-test suite in each of the two
  projects, including the configured 390 x 844 mobile project.

## Fresh live evidence

### Deployment parity and browser policy

- The live root document and freshly built `dist/index.html` are byte-for-byte
  identical: 53,152 bytes; SHA-256
  `eef6b7574ede3b8c41622f94ab7bca62b6b71919d75dbbb636efa6544da82e86`.
- Root, service-worker, and image responses were HTTP 200. The root response
  supplies HSTS, CSP (including `frame-ancestors 'none'`),
  Permissions-Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options:
  nosniff`, and strict-origin referrer policy.
- Current caching is deliberately short-lived / revalidated:
  `Cache-Control: public, must-revalidate, max-age=30` on the document,
  service worker, and static image. The versioned service-worker cache
  (`season-gap-v6`) precaches the app shell and assets. This is functional but
  is a low-priority deployment optimization opportunity for future genuinely
  versioned immutable assets.

### Real product exercise and recovery

In a fresh desktop Chromium profile against the live URL, the verifier:

1. Added `Verifier north bed`; recorded `Spring peas` from 2026-03-10 to
   2026-05-10; opened the resulting gap; and planned the saved `Radishes`
   follow-on crop.
2. Entered an equal start/clear date and received the retained-form error
   `Expected clear date must be after the crop starts.`, then corrected and
   saved it.
3. Exported CSV. Its header was
   `bed,entry_type,crop_or_rest,sow_date,transplant_date,expected_clear_date,notes`
   and it contained the new bed.
4. Uploaded the prior regression payload
   `{"version":1,"beds":[{}],"plantings":[],"templates":[],"settings":{"seasonStart":"2026-03-01","seasonEnd":"2026-11-01"}}`.
   It was rejected before replacement with `This backup has an invalid bed 1
   ID.`; reloading confirmed that `Verifier north bed` remained intact.
5. In a separate fresh profile, verified the missing-start-date error, the
   transplant-before-sow error, and equal-season-date error; each was specific
   and correction preserved the form:
   `Add a sow date or a transplant / in-bed date.`, `Transplant date cannot
   be before the sow date.`, and `Season end must be after its start.`

No console errors or page errors occurred during those desktop flows, normal
load made requests only to `https://season-gap-garden.sociobot.in`, and there
is no live checkout anchor. Source and request review found no analytics,
tracking pixels, third-party fonts, CDN runtime code, or routine external API
calls. Garden records are in IndexedDB; the local-first privacy statement and
static `/privacy/` and `/terms/` routes are present. The disabled paid catalog
is handled honestly: the notebook is unlimited and no unavailable billing
checkout is advertised.

### PWA and responsive/accessibility checks

- The live manifest has standalone display, versioned start URL, correct
  192/512/maskable icons, and visual-system theme/background colors. A live
  page was controlled by `https://season-gap-garden.sociobot.in/sw.js`.
- After service-worker readiness, `context.setOffline(true)` and reload kept
  the saved bed visible and displayed the offline status banner. Calling
  `registration.update()` completed without browser error and retained the
  active controller. No newer deployed worker existed, so an actual
  update-available transition could not be induced; the shipped worker and
  client code contain `skipWaiting`, `clients.claim`, and the update notice.
- Fresh axe WCAG 2 A/AA scans found **0 serious or critical violations** on
  desktop and 390 x 844 mobile. Mobile had one `h1`, a main landmark, and no
  horizontal overflow (`scrollWidth === clientWidth === 390`).
- Keyboard-only mobile use focused Add a bed, opened it with Enter, focused
  Bed name, closed with Escape, and returned focus to the trigger. The visible
  focus treatment was `rgb(210, 109, 27) solid 3px` with a 3px offset. Under
  reduced motion, the dialog transition was `0.00001s`.
- Visual inspection of fresh desktop and 390px screenshots found a legible,
  intentional notebook layout that matches `.factory/design.md`; mobile
  stacks content without clipping task controls.

### Performance and budgets

- Initial application JS and CSS are inlined in the 16,228-byte-gzip HTML,
  well below the 200 KB initial-JS and 50 KB CSS budgets. Self-hosted fonts
  total 109,664 bytes and the hero WebP is 93,012 bytes, within their stated
  budgets.
- Fresh mobile Lighthouse 13.4.1: **Performance 93, Accessibility 100, Best
  Practices 100, SEO 100**. FCP 0.9 s, LCP 1.5 s, TBT 300 ms, CLS 0.044.

## Defects and follow-up

No critical, high, or medium defects found.

### Low — static assets do not use long-lived immutable HTTP caching

The host returns 30-second revalidated cache headers for unversioned static
paths. The service worker prevents an offline or functional problem, but a
future deployment that emits content-hashed asset URLs can safely use
long-lived immutable cache headers for those assets.
