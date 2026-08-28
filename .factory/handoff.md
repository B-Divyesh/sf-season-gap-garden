# Season Gap Garden — repair handoff

## Release repair

This repair addresses the High release blocker in independent verification of candidate `9f74422f00bb0f64e88cb946088044f1813e9952` (`.factory/verification.md`): a JSON backup with `"beds":[{}]` passed top-level validation, overwrote IndexedDB, and then made the notebook fail to render.

- `validateGardenData` now validates every nested bed, entry, and crop-note record **before** the confirmation can be shown or any IndexedDB write occurs. It checks safe/unique IDs, required strings and length limits, ISO timestamps, date shape and chronology, crop/rest enum, bed references, and integer crop durations from 1–366 days.
- Saves validate the candidate before writing and retain the previous valid notebook as `last-known-good`; load recovers that snapshot if a current record is invalid. An unrepairable legacy invalid record is left untouched rather than silently erased.
- The restore UI test uploads the verifier's malformed shape, confirms no destructive confirmation is raised, sees the precise validation error, then reloads and proves the original bed remains present.
- The service-worker cache version is `season-gap-v5`, so installed copies receive this repaired shell.
- Dialog keyboard handling now restores focus to the invoking control on explicit close or Escape. The browser test covers that path on desktop and 390px mobile.

The brief, local-first storage model, free exports, paid-license model, visual thesis, static PWA artifact, and successful candidate behaviors are unchanged.

## Verification

Run from a clean clone:

```sh
npm ci
npm run check
```

Exact local evidence, 2026-08-28:

- `npm ci`: 66 packages installed; `npm audit --omit=dev`: 0 vulnerabilities.
- `npm test`: 8/8 Vitest assertions passed. Storage coverage includes malformed nested bed, reference, enum, calendar date, date-order, and template-duration records.
- `npm run build`: TypeScript check and Vite production build passed; `dist/index.html` is at the required root, 53,599 bytes raw / 16.51 kB gzip. The inlined application script remains well below the 200 kB JS budget.
- `npm run test:e2e`: 10/10 passed: real create/record/follow-on/offline-reload flow, desktop and 390×844 mobile axe WCAG A/AA scans (zero serious/critical), keyboard dialog focus/escape, static legal routes, and malformed-backup rejection with preserved data after reload.
- A fresh 390px production-browser smoke test recorded zero console/page errors, only the local origin in normal-load requests, `scrollWidth === clientWidth === 390`, and an active `/sw.js` controller.
- Local Lighthouse 13.4.1 mobile audit produced Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 2.5 s, TBT 0 ms, CLS 0.053. The Chromium process crashed while taking the post-audit full-page screenshot, after Lighthouse had written the complete result JSON; all reported category/audit results were present.
- Reduced-motion, offline saved-data reload, manifest/service-worker registration, title/lang/main/heading/alt semantics, and 390px overflow are exercised by the browser suite. No runtime CDN or analytics is introduced; license API use remains action-triggered only.

## Deployment

Static deploy is performed by pushing this commit to `main`; publish `dist/`. Record the resulting commit and live parity check here after push.

## Known limitations

- The factory must still register the `season-gap-garden` paid product before live checkout can complete.
- Garden data remains intentionally local to one browser; JSON backup/restore is the portability path.
- Deployment-level CSP, Permissions-Policy, frame policy, and immutable asset caching remain factory-hosting follow-ups noted by the verifier; this repair does not alter infrastructure.
