# Plan follow-on crops from bed dates — independent verification 5 — FAIL

**Work order:** `season-gap-garden-verify-5`

**Verified:** 2026-09-05

**Implementation candidate:** `299c0b422ef4d2e4aae16fdbd6db730bfa1996d6`

**Documentation base:** `547daf7947161c2b308b71275d7eaf47e3e72806`

**Live URL:** <https://season-gap-garden.sociobot.in>

## Verdict

**FAIL — 2 findings and 0 untested public claims.**

The product completes its main job and every declared claim passes. It is not
accepted because phone controls used to inspect and fill open windows remain
below the required 44 × 44 CSS pixel touch size. Legal and 404 footers also
fail to reflow cleanly on a 390px phone.

No product code was changed during this verification.

## Findings

### F-01 — Medium — open-window controls are below the phone touch minimum

In a fresh 390 × 844 touch context on the populated live demo, 26 visible
planning buttons are smaller than 44px in at least one dimension:

- 12 timeline crop/open-window buttons are 30px high. Short windows are also
  narrow; the nine-day window is 22.03 × 30px.
- 14 **Choose a crop** and **Mark as rest** buttons in the seven open-window
  cards are 148 × 40px.

These controls perform the product's main follow-on and rest actions. The
attached accessibility and design contracts require touch targets to be at
least 44 × 44 CSS pixels. Axe does not flag this measurement, and the controls
remain keyboard operable, but that does not satisfy the stated phone target.

Required repair: provide a 44px minimum hit area for every timeline and gap
card button without merging adjacent targets, then add a populated-demo phone
regression that measures every visible interactive target.

### F-02 — Low — legal and 404 footers do not stack on a phone

At 390px, the Privacy, Terms, and designed 404 pages keep their footer's
three-column grid. The first footer sentence is squeezed to a 40px-wide,
201.52px-tall column, so it renders one word per line. The content remains
available and has no horizontal overflow, but this is visibly broken phone
layout on required routes.

The mobile rule sets `flex-direction: column` on a footer that still uses
`display: grid`, so that declaration cannot change the grid. Required repair:
switch the legal footer to one column at the phone breakpoint and add a 390px
layout assertion for Privacy, Terms, and 404.

## First screen

Fresh 1440 × 1000 desktop and 390 × 844 phone contexts stated the following
before scrolling:

- **Job:** “Plan follow-on crops from your bed dates.”
- **Audience:** small-space food gardeners who want to see open bed windows
  and decide what to grow or rest next.
- **First action:** **Try it with sample data**, followed by what the sample
  contains.

The action's bottom edge was 628px on desktop and 369.31px on phone. Both
screens also showed the privacy, offline, and no-purchase facts. The phone had
no horizontal overflow (`scrollWidth = clientWidth = 390`). Visual review
confirmed the product-specific notebook design on desktop and phone.

## Demo and real-data isolation

A fresh real garden first created **Verify 5 real marker**. The first-screen
sample link then opened the live demo in one click. It showed the persistent
**Demo — sample data, nothing is saved to your real garden** label and this
populated output:

- 3 beds;
- 5 dated crop entries;
- 4 saved crop-duration notes;
- 7 open windows.

The review chose **Quick leaves** from a saved note and produced a sixth dated
entry. It also recorded an intentional rest. A temporary sample bed was added,
then **Reset demo** returned the sample to three beds and five entries. The
sample CSV had the stated seven-column header and one row for each of the five
entries. **Start for real** removed the demo label and returned to the unchanged
real marker. All captured requests used only the product origin.

## Normal, invalid, boundary, and recovery paths

In a separate clean live context, the review added **Verify recovery bed** and
tested a crop form through these recoverable errors:

- no sow or in-bed date: **Add a sow date or a transplant / in-bed date.**
- transplant before sow: **Transplant date cannot be before the sow date.**
- equal crop dates: **Expected clear date must be after the crop starts.**
- equal season dates: **Season end must be after its start.**

The form retained its values. Correcting the crop to a one-day date range and
the season to a one-day range saved both. The earlier malformed nested backup
payload was rejected with **This backup has an invalid bed 1 ID.** No replace
confirmation appeared, and the saved bed remained after reload.

## Accessibility, offline, privacy, routes, and performance

- Fresh Axe WCAG 2 A/AA scans on root, demo, Privacy, Terms, and the designed
  404 found zero violations. The supplied URL verifier passed with no console
  or page errors, one `h1`, `lang=en`, a main landmark, image alternatives,
  and labelled buttons.
- Tab first reached **Skip to garden plan** with a 3px solid focus outline and
  3px offset. Enter opened the bed dialog, focus moved to **Bed name**, Escape
  closed it, and focus returned to the trigger.
- With reduced motion requested, the dialog transition was `0.00001s`.
- A dedicated fresh phone demo was controlled by `/sw.js`. An explicit update
  check completed, `season-gap-v8-static` was active, and offline reload kept
  **Patio salad bed** and the offline status visible. No newer worker was
  waiting, which is expected for the current deployed version.
- Root, `/demo`, `/?demo=1`, Privacy, Terms, manifest, robots, sitemap, worker,
  legal CSS, artwork, and icons returned their expected successful statuses.
  An unknown path deliberately returned HTTP 404 with the correct title,
  heading, return link, and zero Axe violations. That expected 404 is not a
  defect; only its phone footer layout is F-02.
- Privacy and Terms email links now measure 137 × 44px and 143 × 44px. Normal
  and demo planning requests stayed same-origin. Records remained in local
  IndexedDB; no analytics, tracking, third-party fonts, or runtime scripts
  were observed.
- Live responses include CSP, HSTS, nosniff, strict-origin referrer, frame,
  and permissions policies. Versioned legal CSS and artwork return one-year
  immutable caching; documents and the service worker revalidate.
- Fresh mobile Lighthouse: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.5s, LCP 2.0s, TBT 0ms, CLS 0.039.

This is a static local-first PWA. It has no backend, tenant, shared database,
health route, or rate-limited product API, so tenant isolation, restart
persistence, and 429/`Retry-After` checks do not apply. Import/export already
meets the brief; an AI step would not improve the core date-arithmetic job.

## Clean checkout and deployment parity

The documented Node prerequisite was installed before runtime checks.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 3 files, 9 tests |
| `npm run build` | PASS — TypeScript and Vite; `dist/index.html` produced |
| `npm run test:e2e` | PASS — 11 non-claim browser tests |
| `npm run test:browser` | PASS — 22 browser tests |
| `npm run test:claims` | PASS — 11 claim tests |
| `npm run check` | PASS — unit, build, and all 22 browser tests |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `/opt/fleet/lib/verify-url.sh …` | PASS — no console/page errors |

The build is 63,075 bytes raw and 18.63 kB gzip. The three versioned production
fonts total 109,664 bytes and the hero artwork is 93,012 bytes. Fresh
`dist/index.html` and the live root are byte-identical with SHA-256
`6ed61ff4b7c1d256b8f4b671e237233898fce049cf107b3748bbfcbd1b8ccde5`.

The only commits after implementation `299c0b4` and before the reviewed
documentation base are report/README documentation changes. No source,
public runtime asset, or test change follows the implementation candidate.

## Declared public claims

The landing page, README, Privacy, Terms, demo guide, and copy audit were
cross-checked against `.factory/claims.json`. Each entry has exactly one
matching `@claim:<id>` test. Every declared command was run separately from
the clean checkout and passed.

| Claim | Result |
| --- | --- |
| `demo-isolation` | PASS — sample reset and unchanged real marker |
| `open-windows` | PASS — dated sample produced visible windows |
| `follow-on-crop` | PASS — saved duration note created an entry |
| `local-data` | PASS — demo save stayed in its separate IndexedDB store |
| `offline-reload` | PASS — fresh controlled context reloaded offline |
| `csv-export` | PASS — stated header and one row per sample entry |
| `json-restore` | PASS — complete downloaded backup restored the sample |
| `validated-restore` | PASS — malformed nested data was rejected safely |
| `pwa-install` | PASS — active worker and complete standalone manifest |
| `no-tracking` | PASS — demo requests remained same-origin |
| `no-purchase` | PASS — four extra beds required no checkout |

**Untested claim count: 0.** The two findings are contract and responsive
quality failures, not untested public claims.

## Earlier findings and current disposition

| Earlier finding or follow-up | Current disposition |
| --- | --- |
| Malformed backup could replace the notebook | Resolved. Live malformed data was rejected before confirmation; valid data survived reload. |
| Nested field/reference/date validation | Resolved. Unit tests and live missing/start/order/range paths pass. |
| Last-known-good recovery | Resolved. Saved records remained after rejected restore and reload. |
| Advertised checkout returned 404 | Resolved honestly. No checkout or price offer is rendered; no-purchase claim passes. |
| Missing one-click isolated demo | Resolved. Fresh one-click sample, mutation, reset, exit, and unchanged real marker pass. |
| Missing claims registry and tests | Resolved. All 11 entries map one-to-one to passing tests. |
| Cold-phone job, audience, facts, and action | Resolved. All appear before scrolling. |
| Missing designed HTTP 404 | Resolved. Unknown live URLs return the styled HTTP 404; F-02 concerns its phone footer only. |
| Incomplete metadata and common shell | Resolved for structure, titles, metadata, and links. F-02 records the remaining phone footer layout defect. |
| Mobile links below 44px | The previously named wordmark, footer, return, and legal email links are resolved. F-01 shows that the broader all-controls requirement is not yet met. |
| Missing browser security headers | Resolved. Required live policies are present. |
| Static assets lacked immutable caching | Resolved for versioned assets, including `legal-v2.css`. |
| Newer service-worker update could not be induced | Checked, not a defect or public claim. Update check, v8 cache, control, and offline reload pass. |

## Evidence

- `/work/.evidence/season-gap-garden-verify-5/live-qa.json`
- `/work/.evidence/season-gap-garden-verify-5/desktop-first-screen.png`
- `/work/.evidence/season-gap-garden-verify-5/phone-first-screen.png`
- `/work/.evidence/season-gap-garden-verify-5/phone-demo.png`
- `/work/.evidence/season-gap-garden-verify-5/phone-privacy.png`
- `/work/.evidence/season-gap-garden-verify-5/phone-terms.png`
- `/work/.evidence/season-gap-garden-verify-5/phone-offline-demo.png`
- `/work/.evidence/season-gap-garden-verify-5/styled-404.png`
- `/work/.evidence/season-gap-garden-verify-5/url-verifier/verify.json`
- `/work/.evidence/season-gap-garden-verify-5/lighthouse-mobile.json`
