# Independent verification 4 — PASS

**Work order:** `season-gap-garden-verify-4`  
**Verified:** 2026-09-05  
**Implementation candidate:** `846153e152da8d352fde49b9b40e2ef10b8b57a3`  
**Documentation candidate:** `d209544bc09ae9c9f2a269863fb7b38c2669de66`  
**Live URL:** <https://season-gap-garden.sociobot.in>

## Verdict

**PASS — 0 findings and 0 untested public claims.**

Season Gap Garden does the intended job: a small-space food gardener can use
their own bed dates and crop-duration notes to see open windows, plan a
follow-on crop or rest, and keep portable local records.

## First screen and live product

Fresh desktop and 390 × 844 phone Chromium contexts opened the live root. The
first screen states:

- **Job:** “Plan follow-on crops from your bed dates.”
- **Audience:** “For small-space food gardeners who want to see open bed
  windows and decide what to grow or rest next.”
- **First action:** **Try it with sample data**; its bottom edge is at 369 CSS
  pixels on the 844-pixel phone screen, before scrolling.

The phone has no horizontal overflow (`scrollWidth = clientWidth = 390`). The
live root has the correct title, one h1, the sample action, and no console or
page errors. Its SHA-256 is
`6ed61ff4b7c1d256b8f4b671e237233898fce049cf107b3748bbfcbd1b8ccde5`,
byte-identical to a fresh `dist/index.html` built from the implementation
candidate.

## Demo, normal, invalid, boundary, and recovery paths

The fresh live demo at `/?demo=1` showed the persistent **Demo — sample data,
nothing is saved to your real garden** label, three realistic beds, five dated
entries, and seven open-window cards. It planned **Quick leaves** from a saved
crop note. Reset removed a temporary demo bed. A real-garden marker was hidden
while in the demo and returned after **Start for real**; the demo label was
gone. Request capture during that flow contained only
`https://season-gap-garden.sociobot.in`.

In a separate live context, the normal path added a bed and crop. Equal crop
start and clear dates correctly returned **Expected clear date must be after
the crop starts.** Correcting the date saved the crop. A malformed backup was
rejected with the bed-ID error before confirmation; after reload the saved bed
remained. This confirms the earlier destructive-restore finding is resolved.

An independent fresh demo context waited for service-worker readiness, went
offline, and reloaded successfully with **Patio salad bed** visible and the
offline connection banner displayed.

## Accessibility, routes, privacy, and PWA

- Fresh live Axe WCAG 2 A/AA scans on desktop and phone found zero serious or
  critical violations.
- The keyboard dialog path and focus restoration are covered in the clean
  browser suite. Live reduced-motion dialog duration is `1e-05s`.
- `/privacy/` and `/terms/` return 200 and have route-specific titles.
  `/does-not-exist-verify-4` returns the expected HTTP 404 with the styled
  **Page not found** page and a return link.
- Root, demo, query-demo, legal pages, manifest, robots, sitemap, service
  worker, icons, legal stylesheet, and versioned artwork returned expected
  statuses. All internal site links resolve; `mailto:` links are explicit.
- The manifest is standalone and lists 192px, 512px, and maskable icons. The
  live service worker controls the offline demo.
- Normal planning traffic is same-origin only. The product uses local
  IndexedDB, has no analytics or external runtime assets, and its privacy and
  terms pages describe that behavior.
- The live CSP, HSTS, nosniff, referrer, frame, and permissions headers are
  present. Versioned artwork returns `Cache-Control: public, max-age=31536000,
  immutable`.

This is a static PWA with no backend, tenant boundary, health endpoint, or
rate-limited product API. Backend tenant/restart/429 checks do not apply.

## Clean checkout and public claims

From a clean checkout after `npm ci`:

| Command | Result |
| --- | --- |
| `npm test` | PASS — 3 files, 9 tests |
| `npm run build` | PASS — TypeScript and Vite; `dist/index.html` produced |
| `npm run test:e2e` | PASS — 11 non-claim browser tests |
| `npm run check` | PASS — unit, build, and all 22 browser tests |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The fresh build is 63,075 bytes raw and 18,481 bytes gzip. Initial app code is
below the static budget; versioned self-hosted fonts total 109,664 bytes and
the hero artwork is 93,012 bytes.

All 11 entries in `.factory/claims.json` have exactly one matching tagged
Playwright outcome test. Every declared command was run separately and passed:

| Claim | Result |
| --- | --- |
| `demo-isolation` | PASS |
| `open-windows` | PASS |
| `follow-on-crop` | PASS |
| `local-data` | PASS |
| `offline-reload` | PASS |
| `csv-export` | PASS |
| `json-restore` | PASS |
| `validated-restore` | PASS |
| `pwa-install` | PASS |
| `no-tracking` | PASS |
| `no-purchase` | PASS |

## Earlier findings and disposition

| Earlier finding | Current disposition |
| --- | --- |
| Malformed backup could replace the notebook | Resolved; live malformed restore is rejected and existing data survives reload. |
| Nested backup/reference/date validation and last-known-good recovery | Resolved; unit tests and live recovery exercise pass. |
| Advertised checkout returned 404 | Resolved honestly; no checkout or purchase promise is rendered, and unlimited beds pass the claim test. |
| Missing one-click isolated demo and claims registry | Resolved; live demo is isolated and all 11 claims are tested. |
| Cold-phone job/copy/action order | Resolved; the job, audience, and sample action are before scrolling. |
| Missing designed HTTP 404 | Resolved; an unknown URL returns styled HTTP 404. |
| Missing metadata/site shell/mobile target sizes | Resolved; route titles, metadata, legal shell, headers/footers, and mobile target tests pass. |
| Missing browser-security headers | Resolved; live headers are present. |
| Immutable asset caching | Resolved for versioned assets; the live versioned artwork is immutable. |
| Update transition could not be induced without a newer deployment | Checked; service worker controls the page and offline reload works. This is not a public claim failure. |

## Evidence

- Live SHA and header/route checks were made against the URL above.
- Fresh live desktop/phone/demo/offline interaction evidence was produced with
  Chromium using new browser contexts.
- Local quality gates and each declared claim command were run in this checkout.
