# Review 1 — crop-turnover garden planner

**Work order:** `season-gap-garden-review-1`  
**Reviewed:** 2026-09-05  
**Live URL:** https://season-gap-garden.sociobot.in/  
**Implementation candidate:** `44cb6d4375effaabd52d85768f90455e1201757d`  
**Test candidate:** `b08e2707c4665f81906a2c1396f050568e775443`  
**Documentation checkout:** `815830a810a8bb84e59954ecd34ad00da651f317`

## Verdict

**FAIL — 7 findings, including 2 High, and 10 untested public claims.**

The core planner works when a gardener enters data manually. The required
one-click sample sandbox and claims registry do not exist. The live first
screen also fails the cold-phone copy and action requirements. This work order
permits a PASS only with zero findings at every severity and zero untested
claims.

No product code was changed during this review.

## Cold first screen

- **Job:** use personal bed dates to find an open growing window and plan a
  follow-on crop or rest period.
- **Audience:** small-space food gardeners planning real beds or containers.
- **First action shown without scrolling:** desktop shows **Add a bed**. At
  390×844, no task action is visible before scrolling because the illustration
  appears before the action row.

The intended job and audience above come from the brief and supporting copy.
The live heading, **“Find the space for what comes next,”** does not say garden,
bed, crop, dates, or planning. The live page does not state the audience in the
first screen.

## Findings

### F-01 — High — no one-click sample and no isolated demo

There is no **Try it with sample data** action on desktop or phone. A direct
visit to `/demo` returns HTTP 200 but renders the normal empty app with the
normal title and heading. It has no realistic sample, persistent **Demo —
sample data, nothing is saved** label, **Reset demo**, or **Start for real**.

Isolation also fails. In a fresh disposable browser context, the review added
`Review isolation marker` at `/`, then opened `/demo`; the same record remained
visible. The route therefore reads the normal `season-gap-garden` IndexedDB
namespace rather than a separate demo namespace. No existing user profile or
real user data was used in this test.

Required repair: add the first-screen sample action, seed realistic beds and
dated crops, keep demo storage separate, show the persistent label and controls,
and document it in `.factory/demo.md`.

### F-02 — High — claims registry is absent; 10 public claims are untested

`.factory/claims.json` is missing and the repository contains no
`@claim:<id>` tests. There are therefore no declared claim commands to run from
the clean checkout. Existing unit and browser tests pass, and this review
independently observed several outcomes, but none provides the required
one-claim/one-tagged-test mapping or clean demo sandbox.

The 10 distinct public claims without registered sandbox tests are:

1. Personal dates reveal open bed windows.
2. A follow-on crop can be planned from the gardener's saved duration notes.
3. Garden records stay in browser storage and are not received by the service.
4. The planner keeps working offline after an online visit.
5. Season data exports as CSV with the stated fields.
6. A complete JSON backup can restore the notebook.
7. Backup files are validated before local data is replaced.
8. The product is installable as a PWA.
9. The product has no ads, analytics, tracking pixels, third-party fonts,
   third-party runtime scripts, or current payment requests.
10. Beds, crop notes, entries, gap planning, and exports are unlimited without
    a purchase in the current release.

Required repair: create `.factory/claims.json`, add exactly one tagged test for
each retained public claim, and run every test only through the isolated sample
entry point. Remove or narrow any statement the sandbox cannot prove.

### F-03 — Medium — cold-phone copy and action order fail the plain-words contract

The heading and eyebrow use indirect phrases: **“Find the space for what comes
next”** and **“Your season, between the rows.”** Neither names the garden-planning
job. The first screen has no audience sentence and does not present three
separate plain facts about privacy, offline use, and price. On the 390×844 live
page, the generated illustration occupies the remaining first viewport and
pushes **Add a bed** and **Open the gap view** below the fold. The required sample
action is also absent as recorded in F-01.

The Privacy page heading, **“Privacy, in plain soil,”** is another metaphor where
the required heading is simply **Privacy**. `.factory/copy-audit.md` is absent,
so the required sentence and terminology audit was not supplied.

Required repair: use a heading such as **Plan follow-on crops from your bed
dates**, name small-space food gardeners in the next sentence, place the sample
action before the phone illustration, and replace metaphorical section labels.

### F-04 — Medium — unknown URLs do not return the required designed 404

`/does-not-exist-review` returns HTTP 200 and the home planner. There is no
`404.html`, 404 route, or Static Web Apps 404 response override. This is not a
finding about an expected deliberate HTTP 404; the required deliberate 404 is
missing entirely, so an invalid address is represented as a valid home page.

Required repair: ship a product-styled 404 with a link home and configure it to
return HTTP 404.

### F-05 — Medium — required site structure and metadata are incomplete

The live root has no canonical link, Open Graph image metadata, Twitter card,
or Apple touch icon declaration. The sitemap lists only `/`, `/privacy/`, and
`/terms/`; it cannot list the required demo and 404 routes because those routes
are absent. The landing page does not include the required three-step **How it
works** section or a clearly named product-boundaries/privacy section.

The root wordmark links to `#main`, not home; the header has no Privacy link.
Legal pages use a different reduced header/footer. Footers do not include
**Built by Param Factory** or a version/build ID. These items violate the
standard skeleton even though route titles for `/`, `/privacy/`, and `/terms/`
are present and correct.

### F-06 — Medium — several mobile link targets are below 44×44 CSS pixels

At 390px, the root wordmark measures 218×36, footer **Privacy** 43×22, and
footer **Terms** 39×22. On legal pages, the home link is 196×26 and navigation,
email, and return links are 19–26px high. These are below the attached
accessibility and design minimum even though keyboard focus, Axe checks, and
text contrast pass.

Required repair: give each interactive link a minimum 44×44 target without
merging adjacent targets.

### F-07 — Low — prior immutable-caching finding remains open

Root, service worker, and unversioned static assets still return
`Cache-Control: public, must-revalidate, max-age=30`. No content-hashed static
asset path has long-lived immutable caching. This is the Low follow-up recorded
in `.factory/verification-3.md`; it is not resolved in the reviewed live image.

## Clean-checkout commands

The documented prerequisite was installed before runtime tests.

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 66 packages, 0 vulnerabilities reported |
| `npm test` | PASS; 3 files, 9 tests |
| `npm run build` | PASS; TypeScript and Vite; `dist/index.html` produced |
| `npm run test:e2e` | PASS; 16/16 across desktop and 390×844 projects |
| `npm run check` | PASS; repeats unit, build, and all 16 browser tests |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities |
| claim commands | NONE; `.factory/claims.json` is missing |

The fresh build is 53,152 bytes raw and 16,228 bytes gzip. Its SHA-256 is
`eef6b7574ede3b8c41622f94ab7bca62b6b71919d75dbbb636efa6544da82e86`,
byte-identical to the live root HTML. Commit `44cb6d4` is the last commit that
changes runtime files. Commit `b08e270` changes tests and handoff evidence;
`815830a` changes documentation only.

## Live behavior that passed

- In a fresh desktop context, added `Review north bed`, recorded `Spring peas`
  from 2026-03-10 to 2026-05-10, opened a detected window, and planned the
  saved `Radishes` crop. The populated bed, both crops, and remaining gap cards
  rendered without console or page errors.
- CSV downloaded with the header
  `bed,entry_type,crop_or_rest,sow_date,transplant_date,expected_clear_date,notes`
  and one row per saved planting. The JSON backup contained one bed and two
  plantings.
- Equal crop dates produced **Expected clear date must be after the crop
  starts.** Correction succeeded without reopening the form. Equal season
  dates produced **Season end must be after its start.** Correction succeeded.
- The former malformed-backup payload was rejected before replacement with
  **This backup has an invalid bed 1 ID.** The existing bed survived reload.
- The live service worker controlled the page. `registration.update()`
  completed with no waiting update because no newer worker exists. Offline
  reload retained saved data and showed the offline status banner.
- Fresh normal flows requested only the product origin. No console or page
  errors occurred. `/privacy/` and `/terms/` return HTTP 200 with route-specific
  titles. Every live internal link found on those pages returned successfully;
  `mailto:` links were treated as explicit external actions.
- The supplied URL verifier passed: HTTP 200, `lang=en`, one `h1`, a main
  landmark, image alt text, labeled buttons, and no console errors.
- Fresh Axe WCAG 2 A/AA scans found zero violations on root, Privacy, and Terms
  at phone size, and zero serious/critical findings at desktop size. Tab first
  reaches the skip link with a 3px visible outline. Escape closes the editor
  and returns focus. Reduced-motion dialog duration is effectively zero.
- Fresh mobile Lighthouse audit data: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.50s, LCP 1.95s, TBT 0ms, CLS 0.044. Chromium
  crashed after writing the complete JSON, so the command exited nonzero after
  the audit results were saved.
- The response includes HSTS, CSP with `frame-ancestors 'none'`,
  Permissions-Policy, `X-Frame-Options: DENY`, strict-origin referrer policy,
  and `X-Content-Type-Options: nosniff`.

This is a static PWA with no backend, tenant, shared database, health endpoint,
or product API rate limit. Backend isolation, restart persistence, and
429/`Retry-After` checks are not applicable. The brief does not need an AI
feature; no missed AI step was found.

## Earlier findings and current disposition

| Earlier item | Current disposition | Evidence |
| --- | --- | --- |
| High: malformed backup overwrote IndexedDB | Resolved | Live malformed payload rejected; saved bed survived reload; unit and browser regressions pass. |
| Follow-up: nested field/reference/date validation | Resolved | `validateGardenData` checks nested records; 9/9 unit tests pass. |
| Follow-up: retain last known good data | Resolved | Live invalid restore left current notebook intact after reload. |
| High: advertised US$9 checkout returned 404 | Resolved for current release | No checkout anchor or price is shown; a fourth bed passes in repository browser coverage; current terms say no sale is offered. |
| Medium: CSP, permissions, and frame headers absent | Resolved | All documented security headers are present live. |
| Update transition not inducible without a newer worker | Checked, not a public-claim failure | `registration.update()` succeeds; source has update detection and reload UI; no newer deployed worker was available. |
| Low: no immutable asset caching | Open | F-07; live headers remain `max-age=30, must-revalidate`. |

## Evidence files

- `/work/.evidence/url-verifier/verify.json`
- `/work/.evidence/desktop-first-screen.png`
- `/work/.evidence/phone-first-screen.png`
- `/work/.evidence/demo-route-phone.png`
- `/work/.evidence/populated-desktop.png`
- `/work/.evidence/lighthouse-live.json`

