# Independent verification 2 — FAIL

**Work order:** `season-gap-garden-verify-2`  
**Verified:** 2026-08-28  
**Candidate:** `3c0953485a52b9559d3ad33069766152c3e17fb3`  
**Live URL:** https://season-gap-garden.sociobot.in/

## Verdict

**FAIL — do not release the advertised paid product yet.** The candidate is deployed and the free local-first garden planner works end to end, but the app advertises a US$9 one-time unlock whose real checkout URL returns HTTP 404. A customer cannot buy the advertised feature.

## Release-blocking defect

### High — paid checkout is not registered/enabled

The unlock dialog's **Buy the one-time unlock** link resolves to:

```
https://api.sociobot.in/api/v1/products/season-gap-garden/checkout
```

A fresh read-only `GET` on 2026-08-28 returned:

```
HTTP/2 404
content-type: application/json

{"error":"enabled factory product","status":404}
```

This contradicts the live UI and terms, both of which offer a US$9 one-time license. The integration URL is correctly limited to the Sociobot billing API and invalid-license verification does return the expected `200` JSON result, but checkout itself is unavailable. Register/enable the `season-gap-garden` product in the billing engine, then verify an actual checkout redirect and post-purchase license return before release.

## Passing evidence

### Clean checkout and local gates

- Repository was clean and at the requested SHA before testing.
- `npm ci` completed: 66 packages installed; npm reported 0 vulnerabilities.
- `npm test`: **PASS**, 2 Vitest files / 8 tests.
- `npm run build`: **PASS** (`tsc --noEmit` plus exact Vite build). `dist/index.html` was produced at the required root: 53,599 bytes raw / 16.51 kB gzip. There is no separate lint script; the build's TypeScript check is the available static check.
- `npx playwright test --workers=1`: **PASS**, 10/10. This covers Chromium desktop and 390×844 mobile: bed/crop/follow-on planning, offline reload, axe serious/critical checks, keyboard dialog focus return, legal routes, and malformed-backup recovery.

### Independent live product exercise

In a new 390×844 Chromium profile at the live URL, the verifier:

1. Created `QA north bed`; recorded a normal crop and a second crop.
2. Entered equal start/clear dates and received `Expected clear date must be after the crop starts.`; corrected the form and saved without data loss.
3. Omitted both sow and in-bed date and received `Add a sow date or a transplant / in-bed date.`; corrected the form and saved.
4. Entered equal season dates and received `Season end must be after its start.`; corrected the season and saved.
5. Downloaded season CSV (contained the bed, crop, and `expected_clear_date` fields) and full JSON backup (parsed and contained the new bed).
6. Uploaded `{"version":1,"beds":[{}],"plantings":[],"templates":[],"settings":{"seasonStart":"2026-03-01","seasonEnd":"2026-11-01"}}`. It was rejected before confirmation with `This backup has an invalid bed 1 ID.` The existing data survived reload.
7. Waited for service-worker readiness, went offline, reloaded, and confirmed the saved bed remained visible with the offline banner. The active controller was `https://season-gap-garden.sociobot.in/sw.js` and the 390px document had `scrollWidth === clientWidth === 390`.

The service worker declares versioned static/runtime caches (`season-gap-v5`), precaches the shell/assets, calls `skipWaiting()` and `clients.claim()`, and contains the in-app update-notice handling. There was no newer production worker available to force a real update transition during this verification.

### Accessibility, privacy, browser behavior, and visual review

- The supplied live URL verifier passed: 1.236 s load; no console/page errors; title, `lang="en"`, exactly one `h1`, main landmark, image alt, and labeled buttons all present.
- Fresh axe WCAG 2 A/AA scans had **zero serious/critical** findings at desktop (1440px) and 390px mobile.
- Keyboard-only check: Enter opened the Add bed dialog, Escape closed it, and focus returned to its trigger. The designed focus indicator is a visible 3px outline. With reduced motion, computed dialog transition duration was `0.00001s`.
- Normal-load request capture made requests only to `https://season-gap-garden.sociobot.in`; there were no analytics, pixels, third-party fonts, or runtime CDN calls. The only external code endpoint is action-triggered billing. Garden records use IndexedDB; the privacy and terms routes are present.
- Desktop and 390px screenshots show the intentional handwritten-notebook layout, legible working text, and mobile stacking consistent with `.factory/design.md`.

### Performance and deployment parity

- Fresh `dist/index.html` and live `/` are byte-identical: 53,599 bytes, SHA-256 `4446dabbb1ef27a5dd15abe390c9e5a0233c91b6a05a501d20693897b59674c6`.
- The application is inlined in the 16.51 kB-gzip HTML, well within the 200 kB initial-JS budget. CSS is inlined; self-hosted font payload is 109,664 bytes and the WebP study is 93,012 bytes, within stated budgets.
- Live mobile Lighthouse 13.4.1: **Performance 99, Accessibility 100, Best Practices 100, SEO 100**; FCP 1.5 s, LCP 2.0 s, TBT 0 ms, CLS 0.043.
- Root responses include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`.

## Non-blocking deployment follow-ups

### Medium — browser hardening headers and immutable caching are absent

Live responses have no Content-Security-Policy, Permissions-Policy, or frame-embedding policy (`X-Frame-Options`/`frame-ancestors`). Root and static assets use `Cache-Control: public, must-revalidate, max-age=30`, rather than long-lived immutable caching for versioned assets. These are hosting configuration/performance follow-ups, not code changes made by this verification.

## Required release action

1. Register/enable the paid product in the Sociobot billing engine.
2. Re-run a real checkout through hosted payment and verify the return `?license=` capture, URL cleanup, and unlock.
3. Configure the documented response-policy and asset-cache hardening, then re-run this verification.
