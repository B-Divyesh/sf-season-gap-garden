# Repair 4 verification — PASS

**Work order:** `season-gap-garden-repair-4`  
**Verified:** 2026-09-05  
**Implementation deployed:** `299c0b422ef4d2e4aae16fdbd6db730bfa1996d6`  
**Live URL:** <https://season-gap-garden.sociobot.in>

## Result

**PASS — 0 current findings and 0 untested public claims.** The Privacy and
Terms contact links are now usable at the required phone touch size. The
implementation versions the immutable legal stylesheet as `legal-v2.css` and
updates the service-worker cache to `season-gap-v8`, so a current legal page
cannot keep the old cached 20px targets.

## Repair and regression coverage

- The two main-content `mailto:` links use 44px minimum width and height.
- The 390px Playwright regression measures both live link boxes, rather than
  asserting a CSS implementation detail.
- Legal-route browser coverage now includes Axe WCAG 2 A/AA serious/critical
  scans for Privacy and Terms.

## Clean local verification

After `npm ci` on Node 22:

| Command | Result |
| --- | --- |
| `npm test` | PASS — 9 tests |
| `npm run build` | PASS — `dist/index.html`, 63.08 kB raw / 18.63 kB gzip |
| `npm run test:e2e` | PASS — 11 non-claim browser tests |
| `npm run test:browser` | PASS — 22 browser tests |
| `npm run test:claims` | PASS — 11 demo-sandbox claim tests |
| `npm run check` | PASS — unit, build, and all 22 browser tests |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

Every one of the 11 commands declared in `.factory/claims.json` was run
separately and passed. The claims still enter through the isolated demo store;
no claim test reads or writes a real garden.

## Live HTTPS evidence

`/opt/fleet/lib/deploy-static.sh season-gap-garden dist` completed against the
existing static app and custom domain. The deployed `legal-v2.css` returns
`Cache-Control: public, max-age=31536000, immutable`; the root passes the
provided URL verifier with no console/page errors and the required title,
language, one h1, main landmark, alternatives, and labels.

Fresh browser contexts found, before scrolling:

- **Job:** Plan follow-on crops from your bed dates.
- **Audience:** small-space food gardeners who want to see open bed windows
  and decide what to grow or rest next.
- **First action:** Try it with sample data (bottom edge: 628px desktop,
  369.31px on a 390×844 phone).

The live demo showed three populated beds, five dated entries, an open-window
card, and the persistent sample label. A temporary demo bed was removed by
Reset demo; Start for real returned to an unchanged real-garden marker. Its
requests stayed on the product origin.

At 390px, `privacy@sociobot.in` measured 137×44px and
`support@sociobot.in` measured 143×44px. Both legal routes had zero serious or
critical Axe findings. There was no horizontal overflow. The styled unknown
route returned the expected HTTP 404. A fresh controlled service worker
completed an update check and reloaded the demo offline with the sample bed
and connection status visible.

Mobile Lighthouse wrote a complete report at
`/work/.evidence/season-gap-garden-repair-4/lighthouse-mobile.json`: Performance
99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.5s, LCP 1.6s, TBT
0ms, CLS 0.039. The Lighthouse CLI reported a browser-tab crash after writing
that valid report, so the metrics—not a successful CLI exit—are the evidence.

## Earlier findings

The malformed-backup recovery, absent demo/claims registry, cold-phone copy,
404, site shell/metadata, security headers, immutable assets, and prior mobile
link targets remain resolved. The last remaining target gap was the two legal
email links, resolved here.

## Known scope note

The current release advertises no checkout or paid offer, so no
`billing-offer.json` is written. The researched one-time monetization remains
a future billing-registration dependency; the free local-first core and data
export are available without it. This static product has no backend, tenant,
health, or rate-limit surface.
