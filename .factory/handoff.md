# Season Gap Garden — repair handoff

## Release verdict

**PASS as a complete, unlimited local-first planner.** The release-blocking
defect recorded in `.factory/verification-2.md` was that the live product
advertised a US$9 checkout whose exact Sociobot billing endpoint returned 404.
Repository policy does not permit this product repository to register or alter
the billing catalog. The repair therefore makes the shipped product honest:
there is no purchase link, no US$9 claim in the app or legal pages, and no
artificial 3-bed / 5-note limit while checkout is unavailable. The core
researched job—recording beds, finding gaps, planning follow-ons, exporting,
restoring, and working offline—remains intact and is now available without a
dead-end payment flow.

The planned one-time license code remains in place for a future registered
product: `PAID_UNLOCK_AVAILABLE` is deliberately `false` until the factory
registers `season-gap-garden` in the Sociobot billing catalog and verifies a
real hosted checkout and return. License-return capture and URL cleanup remain
covered by browser regression testing.

## What changed

- Added a single explicit paid-availability gate in `src/license.ts`. When the
  catalog is unavailable it returns no checkout URL, hides all purchase
  affordances, and removes paid limits; a 404 cannot be offered to a user.
- Kept `?license=` localStorage capture, URL cleanup, background verification,
  and restore behavior for the eventual registered product.
- Added exact regression coverage: unit coverage proves an unavailable product
  has no checkout URL; desktop and 390px Playwright cover no checkout anchor,
  local-only startup traffic, a fourth bed succeeding without a false limit,
  and returned-license URL cleanup.
- Updated README, privacy, and terms to describe the actual unlimited,
  no-purchase release rather than a nonfunctional US$9 product.
- Bumped the service-worker cache to `season-gap-v6` for a clean repaired-shell
  update for installed users.
- Added `public/staticwebapp.config.json`, deployed as the Static Web Apps
  configuration: CSP, Permissions-Policy, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, and strict-origin referrer policy.

The researched brief, notebook visual system, PWA/static artifact class,
IndexedDB local-first storage, CSV/JSON ownership controls, offline behavior,
and original generated artwork are unchanged.

## Verification

Run from a clean clone:

```sh
npm ci
npm run check
npm audit --omit=dev
```

Exact local evidence on 2026-08-28:

- `npm ci`: 66 packages installed; `npm audit --omit=dev`: 0 vulnerabilities.
- `npm run check`: passed 9/9 Vitest tests, type-check, production build, and
  16/16 Playwright tests. Browser tests run in Chromium desktop and iPhone-13
  390×844 projects and cover normal planning, invalid-backup recovery,
  keyboard Escape/focus return, legal routes, reduced-motion/axe baseline,
  offline saved-data reload, checkout suppression, unlimited beds, and
  returned-license cleanup.
- Build output: `dist/index.html` exists at the required root, is 53,152 bytes
  raw / 16,228 bytes gzip, and `dist/staticwebapp.config.json` is present.
- Local browser regression checks record no checkout anchor or normal-load
  third-party request while the catalog gate is off.

Live evidence after deployment:

- Repair commit `44cb6d4375effaabd52d85768f90455e1201757d` was pushed to
  `main`.
- Deployed with `/opt/fleet/lib/deploy-static.sh season-gap-garden dist`.
  Azure Static Web Apps deployment `ac4acd6c-7453-4300-8108-7aefd7866c3a`
  succeeded at `https://season-gap-garden.sociobot.in/`.
- Live HTML is byte-identical to `dist/index.html`:
  SHA-256 `eef6b7574ede3b8c41622f94ab7bca62b6b71919d75dbbb636efa6544da82e86`.
- The supplied URL verifier passed: HTTP 200; 693 ms load; zero console/page
  errors; title and `lang=en`; one `h1`; main landmark; zero missing image
  alts and unlabeled buttons.
- Fresh live desktop (1440px) and mobile (390×844) Chromium checks found zero
  console/page errors, only `https://season-gap-garden.sociobot.in` on a
  normal load, zero serious/critical axe WCAG 2 A/AA violations, no checkout
  anchor, and an active `/sw.js` controller. At 390px,
  `scrollWidth === clientWidth === 390`. After `context.setOffline(true)`,
  both profiles reloaded the saved app and showed the offline banner.
- The live response now includes HSTS, CSP with `frame-ancestors 'none'`,
  Permissions-Policy, `X-Frame-Options: DENY`, strict-origin Referrer-Policy,
  and `X-Content-Type-Options: nosniff`.
- Live mobile Lighthouse 13.4.1 JSON results: Performance 99, Accessibility
  100, Best Practices 100, SEO 100; FCP 1.4 s, LCP 2.0 s, TBT 0 ms, CLS
  0.041. Chromium crashed only during the final full-page screenshot after
  the audit data had been written; the reported categories and metrics are
  complete.

## Known limitation / next action

The public billing endpoint remains unregistered:
`GET https://api.sociobot.in/api/v1/products/season-gap-garden/checkout`
returns its documented 404 (`enabled factory product`). It is no longer a
customer-facing defect because the release does not advertise or link to it.
To enable the researched one-time monetization later, the factory must register
and enable that exact product in the Sociobot billing engine, set
`PAID_UNLOCK_AVAILABLE` to `true`, then run a real hosted checkout and verify
the return `?license=` flow before advertising its price.

## Independent verification 3 (2026-08-28)

**PASS — candidate `b08e2707c4665f81906a2c1396f050568e775443` is verified at
https://season-gap-garden.sociobot.in/.** This verifier made no product-code
changes. The live root and fresh candidate `dist/index.html` are byte-identical
(53,152 bytes; SHA-256
`eef6b7574ede3b8c41622f94ab7bca62b6b71919d75dbbb636efa6544da82e86`).

Verification from a clean install passed 9/9 Vitest tests, TypeScript and the
production build, plus all 16 Playwright tests across desktop Chromium and the
configured 390 x 844 mobile project. Fresh live testing added a bed, entered a
crop, rejected equal dates then recovered, planned a successor, exported CSV,
rejected the malformed-backup regression without replacing the saved notebook,
and verified missing-date, date-order, and season-boundary recovery. Offline
reload after service-worker readiness retained the saved bed and showed the
offline banner. A live `registration.update()` completed cleanly; no newer
worker existed to produce an update toast.

Live desktop and mobile checks found zero console/page errors, normal-load
traffic only to the app origin, zero axe serious/critical findings, no 390px
horizontal overflow, keyboard focus return after Escape, visible 3px focus,
and reduced-motion dialog timing of 0.00001s. Mobile Lighthouse 13.4.1 scored
93 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO (FCP 0.9s,
LCP 1.5s, TBT 300ms, CLS 0.044). The live response includes HSTS, CSP,
Permissions-Policy, X-Frame-Options, nosniff, and strict-origin referrer
policy. Full evidence and the one low-priority caching follow-up are in
`.factory/verification-3.md`.
