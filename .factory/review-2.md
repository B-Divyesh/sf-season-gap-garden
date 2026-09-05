# Review 2 — plan follow-on crops from bed dates

**Work order:** `season-gap-garden-review-2`  
**Reviewed:** 2026-09-05  
**Implementation candidate:** `846153e152da8d352fde49b9b40e2ef10b8b57a3`  
**Documentation candidate:** `38d2da83e75bd48088793c1d18499f13df4e4930`  
**Live URL:** <https://season-gap-garden.sociobot.in>

## Verdict

**FAIL — 1 Medium finding and 0 untested public claims.**

Season Gap Garden completes the researched job. A small-space food gardener
can use their own bed dates and crop-duration notes to find open windows, plan
a follow-on crop or rest, and keep portable local records.

No product code was changed during this review.

## Finding

### F-01 — Medium — legal-page email links remain below the 44px phone target

At 390 × 844, the inline **privacy@sociobot.in** link on `/privacy/` and
**support@sociobot.in** link on `/terms/` each measure 20 CSS pixels high. The
attached accessibility and design contracts require every touch target to be
at least 44 × 44 CSS pixels. This also means the earlier F-06 finding is only
partly resolved: the root wordmark, footer links, legal wordmark, legal
navigation, and 404 return link were repaired, but the two main-content email
links were not.

Axe reports no violation because its automated rule does not enforce this
contract's 44px minimum. The links remain keyboard operable and visually
clear, but their phone touch areas are too small.

Required repair: give inline main-content email links a minimum 44px touch
height without merging them with nearby targets, then add a 390px browser
assertion for both legal routes.

## First screen

Fresh desktop and 390 × 844 phone Chromium contexts opened the live root.
Before scrolling, the page states:

- **Job:** “Plan follow-on crops from your bed dates.”
- **Audience:** “For small-space food gardeners who want to see open bed
  windows and decide what to grow or rest next.”
- **First action:** **Try it with sample data**, followed by “See three filled
  beds and their open windows.”

The action ended at 628 CSS pixels on the 1000-pixel desktop viewport and 369
pixels on the 844-pixel phone viewport. The phone had no horizontal overflow
(`scrollWidth = clientWidth = 390`). The same screen lists three direct facts:
records are private to this browser, offline use works after the first visit,
and adding beds does not require a purchase.

## Live job and demo sandbox

A fresh real-garden context created **Review 2 real marker**, then entered the
sample through the first-screen action. The live `/demo` route showed its
persistent **Demo — sample data, nothing is saved to your real garden** label
and realistic populated output:

- 3 beds: **Patio salad bed**, **South trough**, and **Kitchen box**;
- 5 dated crop entries;
- 4 personal crop-duration notes;
- 7 visible open-window cards.

The review chose **Quick leaves** from a saved 35-day crop note and confirmed a
sixth dated entry. It added a temporary sample bed and selected **Reset demo**;
the sample returned to 3 beds and 5 entries. **Start for real** removed the
`demo:season-gap-garden` IndexedDB database, opened the real
`season-gap-garden` database, and showed the unchanged real marker. The demo
flow made requests only to the product origin.

## Normal, invalid, boundary, and recovery paths

In another fresh live context, the review added **Review recovery bed** and
attempted a crop whose start and clear dates were equal. The form retained its
values and reported **Expected clear date must be after the crop starts.** A
one-day correction saved **Spring peas**.

Equal season boundaries reported **Season end must be after its start.** The
corrected range saved without reopening the form. A malformed nested backup
was then rejected with **This backup has an invalid bed 1 ID.** No replacement
confirmation appeared. Reloading retained both the bed and crop. This proves
the original destructive-restore issue remains resolved.

The repository browser suite also covers the empty state, missing crop start,
transplant-before-sow validation, JSON backup restore, CSV download, adding
more than the former bed limit, keyboard operation, and focus restoration.

## Accessibility, mobile, offline, and updates

- Fresh WCAG 2 A/AA Axe scans on the root, demo, phone root, Privacy,
  Terms, and designed 404 found zero violations and zero serious or critical
  issues.
- Tab first reached **Skip to garden plan**. Enter opened the bed dialog,
  initial focus moved to **Bed name**, Escape closed it, and focus returned to
  the trigger.
- The focus indicator measured a 3px solid outline with a 3px offset. Root
  wordmark and footer links were each at least 44px high. The two legal-page
  email links fail that requirement as F-01 records.
- With reduced motion requested, the dialog transition duration was
  `0.00001s`.
- A dedicated fresh phone context loaded `/?demo=1`, waited for the service
  worker, went offline, and reloaded. **Patio salad bed** and the offline status
  remained visible.
- The service worker controlled the page at `/sw.js`. An explicit update check
  completed without error. No newer deployed worker existed, so no waiting
  update was expected or claimed.
- The supplied `verify-url.sh` passed: HTTP 200, title, `lang=en`, one h1, main
  landmark, image alternatives, labelled buttons, and no console or page
  errors.

## Routes, privacy, security, and PWA

Root, `/demo`, `/?demo=1`, `/privacy/`, and `/terms/` returned 200 and exposed
their route-specific titles. `/does-not-exist-review-2` deliberately returned
HTTP 404 with the styled **Page not found** page and a return link. The browser
logged only the expected failed-resource message for that deliberate 404; no
unexpected console or page errors occurred.

All live internal links resolved. The manifest is standalone, starts at a
versioned root URL, and includes 192px, 512px, and maskable icons. Robots,
sitemap, manifest, service worker, legal styles, icons, fonts, and artwork are
available. Versioned artwork, fonts, icons, and legal CSS return
`Cache-Control: public, max-age=31536000, immutable`; the document and service
worker correctly revalidate.

The live root sends CSP, HSTS, nosniff, strict-origin referrer, frame, and
permissions headers. Fresh normal and demo request capture was same-origin
only. Records use local IndexedDB; there are no analytics, ads, tracking
pixels, third-party fonts, or third-party runtime scripts. Privacy and Terms
match the observed behavior.

This is a static local-first PWA. It has no backend, tenant boundary, shared
database, health endpoint, or rate-limited product API. Backend isolation,
restart persistence, and 429/`Retry-After` checks do not apply. The brief
already includes import/export and does not need an AI step; no missed-leverage
finding applies.

## Clean checkout and build parity

A separate clean clone at documentation commit `38d2da8` installed the
documented Node dependencies before runtime tests.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 3 files, 9 tests |
| `npm run build` | PASS — TypeScript and Vite; `dist/index.html` produced |
| `npm run test:e2e` | PASS — 11 non-claim browser tests |
| `npm run check` | PASS — unit, build, and all 22 browser tests |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The only changes after implementation commit `846153e` and before this review
were documentation and verification files. A fresh `dist/index.html` and the
live root are byte-identical, both with SHA-256
`6ed61ff4b7c1d256b8f4b671e237233898fce049cf107b3748bbfcbd1b8ccde5`.

The built app document is 63,075 bytes raw and 18,449 bytes gzip. App code and
CSS are in that single document. Versioned fonts total 109,664 bytes, and the
hero artwork is 93,012 bytes. A fresh mobile Lighthouse run scored Performance
99, Accessibility 100, Best Practices 100, and SEO 100, with FCP 1.50s, LCP
1.65s, TBT 0ms, and CLS 0.039.

## Declared public claims

The landing page, README, Privacy, Terms, demo guide, and copy audit were
cross-checked against `.factory/claims.json`. No missing or extra claim-like
promise was found. Each of the 11 entries has exactly one matching tagged
outcome test. Every declared command was run separately from the clean clone.

| Claim | Result |
| --- | --- |
| `demo-isolation` | PASS — separate store, reset, and unchanged real marker |
| `open-windows` | PASS — dated sample produces visible windows |
| `follow-on-crop` | PASS — saved crop note creates the next entry |
| `local-data` | PASS — demo save stays in its IndexedDB namespace |
| `offline-reload` | PASS — fresh service-worker context reloads offline |
| `csv-export` | PASS — required header and one row per seeded entry |
| `json-restore` | PASS — complete backup restores the sample |
| `validated-restore` | PASS — malformed record is rejected without loss |
| `pwa-install` | PASS — active worker and complete standalone manifest |
| `no-tracking` | PASS — demo use remains same-origin |
| `no-purchase` | PASS — four added beds require no checkout |

**Untested claim count: 0.**

## Earlier findings and current disposition

| Earlier finding or follow-up | Current disposition and fresh evidence |
| --- | --- |
| Malformed backup could replace the notebook | Resolved. Live malformed nested data was rejected before confirmation; valid data survived reload. |
| Nested field, date, and reference validation | Resolved. Unit tests passed; live bed ID and date-order checks produced specific errors. |
| Last-known-good recovery | Resolved. The saved bed and crop remained after invalid restore and reload. |
| Advertised US$9 checkout returned 404 | Resolved honestly. No checkout or price offer is rendered; the no-purchase claim passed. |
| Browser-security headers were absent | Resolved. Required CSP, frame, permissions, referrer, nosniff, and HSTS headers are live. |
| One-click sample and isolated demo were absent | Resolved. Fresh sample entry, mutation, reset, namespace deletion, and real-data return passed. |
| Claims registry and tagged tests were absent | Resolved. All 11 entries map one-to-one to passing tagged tests. |
| Cold-phone job, audience, facts, and first action were missing or below the fold | Resolved. The direct job, audience, facts, and sample action end at 369px on a 844px phone. |
| Designed HTTP 404 was absent | Resolved. An unknown live URL returns the styled page with HTTP 404. |
| Site structure, metadata, and common shell were incomplete | Resolved. Required sections, route titles, metadata, navigation, footers, sitemap, and social image are present. |
| Mobile links were below 44px | Partly resolved. Root, header, footer, and return links pass, but the Privacy and Terms email links remain 20px high; see F-01. |
| Static assets lacked immutable caching | Resolved. The live versioned artwork, fonts, icons, and legal CSS are immutable for one year. |
| A newer service-worker update could not be induced | Checked, not a defect or public-claim failure. The active worker and explicit update check passed; no newer worker was deployed. |

## Evidence

- `/work/.evidence/season-gap-garden-review-2/live-review.json`
- `/work/.evidence/season-gap-garden-review-2/desktop-first-screen.png`
- `/work/.evidence/season-gap-garden-review-2/phone-first-screen.png`
- `/work/.evidence/season-gap-garden-review-2/phone-privacy.png`
- `/work/.evidence/season-gap-garden-review-2/phone-terms.png`
- `/work/.evidence/season-gap-garden-review-2/demo-populated.png`
- `/work/.evidence/season-gap-garden-review-2/phone-offline-demo.png`
- `/work/.evidence/season-gap-garden-review-2/styled-404.png`
- `/work/.evidence/season-gap-garden-review-2/url-verifier/verify.json`
- `/work/.evidence/season-gap-garden-review-2/lighthouse.json`
