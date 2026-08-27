# Season Gap Garden — build handoff

Build date: 2026-08-27  
Work order: `season-gap-garden-build-1`  
Deploy type: static PWA; publish `dist/`

## What shipped

- A complete local-first bed notebook backed by IndexedDB: create, edit, and delete beds; record crop or intentional-rest entries with sow, transplant/in-bed, expected-clear dates, and notes.
- A season timeline and gap ledger derived only from the gardener’s dates. Every open window shows its exact bounds and length.
- User-authored successor crop notes with a personal duration. Selecting one fills a gap and clearly reports when it runs beyond the available window; no climate or agronomic claims are made.
- Intentional rest periods, season-window editing, and a “followed on” metric aligned with the brief’s success measure.
- Season CSV export plus full JSON backup/validated restore. These remain free and work offline.
- Installable PWA manifest, 192/512/maskable icons, versioned service worker caches, cache-first assets, offline fallback, and an update-ready notice.
- A genuinely useful free tier (3 beds, 5 crop notes, unlimited entries/planning/exports) and a one-time US$9 license unlock for unlimited beds and notes. It uses only the Sociobot checkout/verify API, captures return tokens, caches verdicts for one day, restores pasted licenses, and never blocks the free first paint.
- Static `/privacy/` and `/terms/` routes with local-data, license verification, merchant-of-record, refund, and garden-advice boundaries.
- Distinct handwritten lab-notebook UI at desktop and 390px with keyboard-operable native controls/dialogs, explicit labels, 44px targets, designed focus states, reduced-motion behavior, empty/error/offline states, and no runtime CDN or analytics.

## Original artwork

`assets/src/garden-study.png` was generated through `/opt/fleet/lib/gen-image.sh` using the factory Azure `factory-image` deployment. The final prompt and generation metadata are in `assets/src/garden-study.prompt.json`; the generator’s sidecar is preserved alongside it. The candidate was manually checked for text artifacts, brands, anatomy, and palette consistency. Production uses `public/assets/garden-study.webp` (900×600, 93,012 bytes). Full art direction and provenance are in `.factory/design.md`.

## Verification

Run from a clean clone:

```sh
npm ci
npm run check
```

- `npm test`: 7/7 unit tests pass (date/gap arithmetic, rest coverage, CSV escaping, backup validation).
- `npm run build`: passes TypeScript and Vite; creates `dist/index.html` at the required root.
- `npm run test:e2e`: 6/6 Chromium tests pass across desktop and 390×844 mobile projects. The real flow creates a bed, records a crop, plans a successor from a gap, reloads offline, and confirms IndexedDB state remains. Axe WCAG A/AA scan has no serious or critical findings. Legal routes are covered.
- Console smoke test on desktop and mobile: no console or page errors; document width equals viewport width at 390px.
- `npm audit`: 0 vulnerabilities.
- Production payload: inlined app HTML/CSS/JS is 50.85 KB raw / 15.59 KB gzip; the pre-inline JS chunk is about 31 KB, CSS about 19 KB, self-hosted fonts total 114 KB, hero WebP 93 KB.
- Lighthouse 12.8.2, mobile default throttling: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**. FCP 1.1s, LCP 2.0s, TBT 0ms, CLS 0.04.
- Reduced motion is handled by CSS; all movement becomes effectively instant and transforms are removed.

## Known gaps and next steps

- The factory still needs to register the `season-gap-garden` paid product and price in the Sociobot billing engine before a live purchase can complete. No product ID or payment-provider code is hardcoded.
- Data deliberately stays on one device; there is no account or sync. Moving devices requires the included JSON backup/restore.
- The timeline supports overlapping entries as written and does not diagnose them; v1 treats the gardener’s notes as authoritative.
- Lighthouse is a lab measurement. INP needs field traffic to measure; TBT was 0ms and all mutations are short local operations.
