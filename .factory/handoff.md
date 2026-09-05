# Season Gap Garden — independent verification 5 handoff

## Result

**FAIL — 2 findings and 0 untested public claims.**

The independently reviewed implementation is
`299c0b422ef4d2e4aae16fdbd6db730bfa1996d6`. The documentation base was
`547daf7947161c2b308b71275d7eaf47e3e72806`. No product code was changed in
this verification.

The live PWA completes the bed-gap planning job, demo isolation works, every
declared claim passes, the legal email repair is live, and the deployed root
is byte-identical to the fresh candidate build. It does not pass the full
contract because populated phone controls and legal-route footer layout still
have defects. Full evidence is in `.factory/verification-5.md`.

## Findings to repair

1. **Medium:** on a 390px demo, 12 interactive timeline spans are 30px high
   and 14 **Choose a crop** / **Mark as rest** actions are 40px high. Every
   touch target must be at least 44 × 44 CSS pixels.
2. **Low:** Privacy, Terms, and 404 footers keep three grid columns at 390px.
   Their first sentence is forced into a 40px-wide column and wraps one word
   per line.

Add measured phone regressions covering all visible populated-demo targets
and each static-route footer after repair.

## Verification completed

- `npm ci`, `npm test`, `npm run build`, `npm run test:e2e`,
  `npm run test:browser`, `npm run test:claims`, `npm run check`, and
  `npm audit --omit=dev` passed.
- All 11 exact commands in `.factory/claims.json` were run separately and
  passed. Untested claim count is zero.
- Fresh live desktop and phone contexts covered the cold first screen,
  one-click sample, populated results, follow-on crop, intentional rest,
  sample reset, unchanged real data, invalid input recovery, malformed backup,
  keyboard focus, reduced motion, offline reload, update check, legal pages,
  expected HTTP 404, request privacy, headers, caching, and route titles.
- Axe found zero WCAG 2 A/AA violations on root, demo, Privacy, Terms, and 404.
  The supplied URL verifier recorded no console or page errors.
- Mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.5s, LCP 2.0s, TBT 0ms, CLS 0.039.
- Fresh `dist/index.html` and live `/` share SHA-256
  `6ed61ff4b7c1d256b8f4b671e237233898fce049cf107b3748bbfcbd1b8ccde5`.

## Scope notes

The current release has no advertised checkout. This static PWA has no
backend, tenant, shared database, health endpoint, or rate-limited product API,
so backend isolation, restart persistence, and 429 checks do not apply.

After repairing both findings, rebuild and redeploy through the factory, then
repeat the full command and live evidence set in `.factory/verification-5.md`.
