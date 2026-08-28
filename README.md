# Season Gap Garden

Season Gap Garden is a private, offline crop-turnover notebook for small-space food gardeners. Record when each real bed is occupied, see the windows between crops, and fill a window from your own duration notes or mark it as intentional rest. It does date arithmetic, not agronomic or climate recommendations.

The app is local-first: beds, plantings, crop notes, and settings live in IndexedDB. Users can export a season CSV or a complete JSON backup. It installs as a PWA and keeps working after the network disappears.

Live: <https://season-gap-garden.sociobot.in>

## Develop

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

The exact production build command is:

```sh
npm run build
```

The static deploy output is `dist/`, with `dist/index.html` at its root. No environment variables are needed. The factory must register a product in the Sociobot billing catalog before a paid unlock can be offered; until then the notebook is unlimited and has no purchase link.

## Verify

```sh
npm test          # unit tests
npm run build     # type-check and reproducible production bundle
npm run test:e2e  # desktop + 390px flow, axe, and offline reload
npm run check     # all of the above
```

Playwright is pinned to 1.58.2. In the factory image its Chromium browser is already installed at `$PLAYWRIGHT_BROWSERS_PATH`; elsewhere, run `npx playwright install chromium` once.

## Product boundaries

- Current availability: unlimited beds, successor notes, crop/rest entries, gap planning, offline use, CSV, and backup/restore. No purchase is currently offered.
- If the factory enables the planned one-time US$9 license, checkout and refunds will be handled by Sociobot / Dodo.
- No accounts, trackers, weather feed, plant encyclopedia, companion-plant claims, pesticide guidance, or food-safety advice.

See [the researched brief](.factory/brief.json), [visual thesis](.factory/design.md), and [handoff](.factory/handoff.md). The code is MIT licensed.
