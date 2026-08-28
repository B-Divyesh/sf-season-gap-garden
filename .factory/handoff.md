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

- Repair commit `f5c4523516b5dfa73c2cc554d83af7b0f62c2092` was pushed to `main`.
- Deployed with the work-order static command: `/opt/fleet/lib/deploy-static.sh season-gap-garden dist`. Azure Static Web Apps deployment `a0242670-7e82-41ce-acef-6812a918ddbd` succeeded; the configured custom domain was `Ready` and HTTPS returned 200.
- Live parity: `https://season-gap-garden.sociobot.in/` and local `dist/index.html` have matching SHA-256 `4446dabbb1ef27a5dd15abe390c9e5a0233c91b6a05a501d20693897b59674c6` and 53,599 bytes.
- `/opt/fleet/lib/verify-url.sh` against the live URL passed: 826 ms load, zero console/page errors, title/lang, one h1, main landmark, zero missing image alts, and zero unlabeled buttons.
- Live 390px regression: the verifier JSON was rejected with `This backup has an invalid bed 1 ID.`, no confirmation appeared, the existing `Live-safe bed` survived reload, only the product origin was requested during normal load, the active service worker was `/sw.js`, and `scrollWidth === clientWidth === 390`.
- Response-policy check: HTTPS response includes HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`; CSP, Permissions-Policy, and frame policy remain hosting follow-ups.

## Known limitations

- The factory must still register the `season-gap-garden` paid product before live checkout can complete.
- Garden data remains intentionally local to one browser; JSON backup/restore is the portability path.
- Deployment-level CSP, Permissions-Policy, frame policy, and immutable asset caching remain factory-hosting follow-ups noted by the verifier; this repair does not alter infrastructure.
