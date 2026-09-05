# Season Gap Garden — review 2 handoff

## Current result

Strict review 2 on 2026-09-05 **FAILed with 1 Medium finding and 0 untested
public claims**. No product code changed.

- **Implementation reviewed:** `846153e152da8d352fde49b9b40e2ef10b8b57a3`
- **Documentation reviewed:** `38d2da83e75bd48088793c1d18499f13df4e4930`
- **Live URL:** <https://season-gap-garden.sociobot.in>
- **Full report:** `.factory/review-2.md`

The live root and a fresh candidate build are byte-identical at SHA-256
`6ed61ff4b7c1d256b8f4b671e237233898fce049cf107b3748bbfcbd1b8ccde5`.
Commits after the implementation candidate and before this review changed only
documentation and verification records.

## What was verified

Fresh desktop and 390px phone contexts confirmed the direct job, audience,
three plain facts, and first sample action before scrolling. The one-click
sample showed 3 beds, 5 dated entries, and 7 open windows. Planning **Quick
leaves**, sample reset, demo namespace removal, and return to unchanged real
data all passed.

Normal entry, equal-date validation, season-boundary validation, malformed
backup rejection, and post-reload recovery passed live. Keyboard focus,
reduced motion, Axe, legal routes, styled HTTP 404, internal
links, same-origin privacy behavior, service-worker control, offline reload,
headers, PWA metadata, and immutable versioned assets also passed. The supplied
URL verifier reported no console or page errors.

One earlier mobile-target defect remains partly open. At 390px, the inline
email links on Privacy and Terms are each 20 CSS pixels high, below the required
44px touch target. Root, header, footer, and 404 links pass. The product needs a
small legal-page CSS repair and a browser assertion for both email links before
it can pass strict review.

Fresh mobile Lighthouse results: Performance 99, Accessibility 100, Best
Practices 100, SEO 100; FCP 1.50s, LCP 1.65s, TBT 0ms, CLS 0.039.

## Clean verification

From a separate clean clone with Node 22 and the documented `npm ci` setup:

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run check
npm audit --omit=dev
```

All passed: 9 unit tests, 11 non-claim browser tests, 22 total browser tests,
and 0 package vulnerabilities. Every one of the 11 commands declared in
`.factory/claims.json` was also run separately and passed.

## Remaining work

One Medium product defect remains: make the Privacy and Terms email targets at
least 44px high on phone and cover both with a 390px test. No public claim is
untested. This static PWA has no backend or checkout, so tenant, restart,
health, 429, and purchase-return checks do not apply.
