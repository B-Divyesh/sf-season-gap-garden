# Independent verification — FAIL

**Work order:** `season-gap-garden-verify-1`  
**Verified at:** 2026-08-28T00:00:10Z  
**Candidate:** `9f74422f00bb0f64e88cb946088044f1813e9952`  
**Live URL:** https://season-gap-garden.sociobot.in/

## Verdict

**FAIL — do not release this candidate.** The restore path accepts a structurally malformed JSON file, replaces the existing IndexedDB notebook, and leaves the app unable to reopen. This violates the local-first product's required invalid-input recovery and portable-data contract.

## Release-blocking defect

### High — malformed backup can destroy the local notebook

`validateGardenData` checks only the top-level version, arrays, and season ordering. It does not validate individual bed, planting, or template records before the restore confirmation and IndexedDB write.

Fresh Chromium reproduction against the live deployment:

1. Open the app in a new browser profile.
2. Select **Restore from backup** and upload this file, then accept the confirmation:

   ```json
   {"version":1,"beds":[{}],"plantings":[],"templates":[],"settings":{"seasonStart":"2026-03-01","seasonEnd":"2026-11-01"}}
   ```

3. The app accepts it and overwrites `season-gap-garden/garden/current` in IndexedDB.
4. It displays `Cannot read properties of undefined (reading 'replace')` while rendering the malformed bed.
5. Reloading shows the fatal screen, **“The notebook could not open”**, incorrectly blaming blocked local storage. The stored garden remains malformed; recovery requires clearing site data (and loses the prior notebook) or developer tooling.

Expected behavior is to reject the file before confirmation/write, explain which record is invalid, and preserve the existing notebook. This is high severity because a user can overwrite all local garden records through the advertised restore control.

## Passing evidence

### Clean local checkout and quality gates

- Checkout was clean and at the requested SHA before verification.
- `npm ci`: completed successfully; 0 package vulnerabilities reported.
- `npm run check`: **PASS**. It ran Vitest (**7/7**), `tsc --noEmit` plus the exact Vite production build, and Playwright (**6/6**) in desktop Chromium and the configured 390×844 mobile project.
- Production build output: `dist/index.html`, 50,849 bytes raw / 15.59 kB gzip. No separate lint command exists in `package.json`; type checking is part of `npm run build`.

### Product and recovery exercises

- On the live URL in a clean 390px profile: added a bed, entered a crop, exercised equal start/clear-date validation (`Expected clear date must be after the crop starts.`), corrected it, added a one-day user crop template, and exported CSV. The CSV contained the entered bed, crop, transplant, expected-clear date, and note columns.
- The missing start-date recovery path displays `Add a sow date or a transplant / in-bed date.` without losing the open form.
- Repository Playwright coverage also created a bed, recorded a crop, planned a follow-on crop from a detected gap, and preserved it after an offline reload.
- Destructive operations use named confirmation prompts. The one failing recovery path is the malformed JSON restore described above.

### Live parity, privacy, PWA, and browser behavior

- The live root document and locally built `dist/index.html` are byte-identical: 50,849 bytes, SHA-256 `42c463e86add2c8573312c495bbfa21a9ad51232a15d81c0e9f1b420a4235450`.
- Fresh-page request capture made no third-party request: only the live origin was requested for the document, self-hosted fonts, hero image, and service-worker-controlled reload. The source contains no analytics or runtime CDN; the only external endpoint is the documented Sociobot checkout/verify API, used only for a paid-license action.
- Service worker is active and controlling the live page at scope `/`, with `season-gap-v4-static` cache. Manifest has standalone display, `/?v=1` start URL, 192/512/maskable icons, and the visual-thesis colors. After waiting for service-worker readiness, offline reload retained the saved bed and showed the offline banner. An explicit `registration.update()` completed without browser error; the candidate has no newer worker available to exercise an actual update transition.
- Browser console and page-error capture were empty during normal desktop and mobile exercises and during offline reload.
- Headers on `/` include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`. The deployment does not provide CSP, `Permissions-Policy`, or `X-Frame-Options`; static assets are served with `Cache-Control: public, must-revalidate, max-age=30`. These are non-blocking deployment hardening/caching follow-ups, not the basis for this FAIL.

### Accessibility, responsive behavior, and performance

- Fresh axe-core WCAG 2 A/AA scans: **0 serious/critical findings** on desktop (1440px) and 390×844 mobile. Native landmarks, one h1, labels, skip link, and legal routes were present.
- At 390px, document `scrollWidth` equalled `clientWidth` (390px); no horizontal overflow. Keyboard testing exposed the skip link, opened the dialog with Enter, closed it with Escape, and restored focus to the invoking Add bed button. The designed visible focus outline measured `rgb(210, 109, 27) solid 3px`.
- Under `prefers-reduced-motion: reduce`, dialog transitions were `0.01ms` and document scrolling was `auto`.
- Visual review of captured desktop and 390px screens found the notebook layout legible, stacked intentionally on mobile, and consistent with `.factory/design.md`.
- Lighthouse 13.4.1 against live (mobile/default audit): Performance **92**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP **0.9 s**, LCP **1.7 s**, CLS **0.043**, TBT **330 ms**. The first document is 15.59 kB gzip; self-hosted fonts total 108,664 bytes and the hero WebP is 93,012 bytes, within the stated static budgets.

## Follow-up priorities

1. Validate every nested backup record (field type, required value, date shape/order, enum, ID/reference integrity, and duration bounds) before showing confirmation or writing IndexedDB.
2. Keep the existing notebook intact if validation or rendering fails; ideally validate a clone and retain/offer the last known-good data.
3. Add regression coverage for malformed nested records and an end-to-end restore/reload recovery test.
4. Deployment hardening: add a suitable CSP/Permissions-Policy/frame policy and immutable caching for versioned static assets where the hosting platform supports it.
