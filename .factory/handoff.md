# Season Gap Garden — repair 3 handoff

## Release

- **Implementation SHA:** `846153e152da8d352fde49b9b40e2ef10b8b57a3`
- **Documentation SHA:** recorded by the following handoff-only commit.
- **Deployment:** Azure Static Web Apps deployment
  `50a74cb5-6cb5-4c29-b473-f27fda1faeb5` succeeded on 2026-09-05.
- **Live URL:** <https://season-gap-garden.sociobot.in>
- **Live parity:** `dist/index.html` and the live root have SHA-256
  `6ed61ff4b7c1d256b8f4b671e237233898fce049cf107b3748bbfcbd1b8ccde5`.

## What changed

This repair resolves all seven findings in `.factory/review-1.md`.

1. **Isolated sample demo:** `/demo` and `/?demo=1` open a populated three-bed
   sample. Demo state is in `demo:season-gap-garden`, never reads or writes the
   real `season-gap-garden` database, and has a persistent label, **Reset demo**,
   and **Start for real**.
2. **Claims:** `.factory/claims.json` now lists 11 visitor-facing claims. Each
   has exactly one `@claim:<id>` Playwright outcome test. Tests use the shipped
   demo sample; the privacy tests record outgoing requests and the offline test
   owns a dedicated browser context.
3. **First screen:** the root now names the job, audience, and first action in
   plain language. On a 390px phone, **Try it with sample data** is at CSS y=323
   with a 47px height, before any scroll. Three short privacy/offline/price facts
   appear before the illustration.
4. **Site structure:** added the three-step **How it works** section, product
   boundaries, privacy/data section, consistent headers and footers, route
   titles, canonical/OG/Twitter metadata, Apple touch icon, sitemap entries,
   social preview image, and a product-styled `404.html`.
5. **Accessibility:** root, footer, legal-header, and legal-footer links now
   have 44px minimum targets. Existing labels, focus treatment, skip link,
   dialog focus return, reduced motion, and semantic landmarks remain intact.
6. **Caching:** versioned fonts, icons, artwork, and legal stylesheet have
   immutable one-year headers. Documents and `sw.js` remain revalidated. The
   service worker is now `season-gap-v7` and precaches the updated demo shell.
7. **Copy and docs:** added the required copy audit, demo documentation, claims
   registry, catalog description, and a refreshed README. The catalog text is
   also copied to `/work/.evidence/catalog-description.txt`.

The earlier malformed-backup protection, recovery snapshot, disabled unavailable
checkout, no-third-party normal load, and local-first IndexedDB planner are
preserved. No AI or backend feature was added because the brief needs neither.

## Run and verify

From a clean checkout with Node 20+:

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:claims
npm run check
npm audit --omit=dev
```

`npm run check` passed: 9 Vitest tests, TypeScript/Vite build, and 22 Chromium
browser tests. Those browser tests include every 11 tagged public claim, normal
and invalid/recovery paths, 390px layout, keyboard and reduced-motion behavior,
service-worker offline reload, legal routes, the demo sandbox, and 404 design.
All 11 individual commands in `.factory/claims.json` were also run separately
and passed from this clean setup.

Build output exists at `dist/index.html`: 63,075 bytes raw and 18,481 bytes
when gzipped. `npm audit --omit=dev` reported 0 vulnerabilities.

## Live verification

- The supplied `verify-url.sh` passed against the HTTPS root: HTTP 200, 833ms
  load, no console/page errors, title/lang, one h1, main landmark, image alt
  text, and labelled buttons.
- Fresh desktop and phone Chromium contexts passed. The desktop first screen
  shows the job and sample action; the phone has no horizontal overflow
  (`390 === scrollWidth === clientWidth`) and the sample action is visible
  before scrolling.
- The live demo shows the persistent demo label, 3 populated beds, 7 open
  windows, reset control, and start-real control. Normal-load traffic stayed on
  `https://season-gap-garden.sociobot.in`; live desktop and phone had no console
  or page errors.
- Live AxeBuilder WCAG 2 A/AA found zero serious or critical violations. The
  standalone `@axe-core/cli` could not launch Selenium against the image's
  bundled Chrome, so the repository's Playwright Axe integration is the
  authoritative Axe run for this worker.
- A fresh live service-worker reload is controlled by `/sw.js`. The tagged
  offline claim verifies the demo after going offline in its own context.
- `/does-not-exist-repair-3` returns the expected HTTP 404 and the styled
  **Page not found** page. Root, demo, query demo, legal pages, 404 page,
  robots, sitemap, and manifest returned their expected statuses.
- Live response headers include CSP with `frame-ancestors 'none'`,
  `X-Frame-Options: DENY`, HSTS, nosniff, permissions policy, and strict-origin
  referrer policy. The versioned hero image returned
  `Cache-Control: public, max-age=31536000, immutable`.
- Lighthouse mobile output was written to
  `/work/.evidence/season-gap-garden-repair-3-live/lighthouse.json`: Performance
  99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.5s, LCP 2.0s,
  TBT 0ms, CLS 0.039. Lighthouse completed the audit data but its final
  full-page screenshot step crashed the tab; the JSON category and metric
  values were written before that tool-side crash.

## Remaining items

There are no known product defects or unmet findings. The product still has no
billing checkout because the factory has not registered the product in the
Sociobot billing catalog. The UI makes no purchase offer, so this is an
external dependency rather than a customer-facing failure.

