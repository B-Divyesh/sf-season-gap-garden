# Season Gap Garden

Plan follow-on crops from your bed dates. It is for small-space food gardeners
who want to see an open bed window and decide what comes next.

Try the one-click sample at
[season-gap-garden.sociobot.in/demo](https://season-gap-garden.sociobot.in/demo).
The sample uses a separate browser store and never changes a real garden.

Season Gap Garden records beds and dated crop or rest entries. It shows open
windows, lets you choose a follow-on crop from saved duration notes, and
exports a season CSV or full JSON backup. Garden records stay in the browser.
After the first online visit, the app works offline and can be installed as a
PWA. It arranges dates that users enter; it does not give climate, pesticide,
food-safety, or planting advice.

## Run

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

The static production build is `dist/`, with `dist/index.html` at its root. No
environment variables are needed.

## Verify

From a clean checkout:

```sh
npm ci
npm test
npm run build
npm run test:e2e  # desktop and mobile browser paths
npm run test:claims  # every declared public claim in the demo sandbox
npm run test:browser  # all browser paths and claims used by the full check
npm run check
```

Every visitor-facing claim is listed in `.factory/claims.json`. Run one claim
by copying its documented command, or run the tagged Chromium claims together:

```sh
npm run test:claims
```

Playwright is pinned to 1.58.2. In the factory image its Chromium browser is
already installed at `$PLAYWRIGHT_BROWSERS_PATH`; elsewhere, run
`npx playwright install chromium` once.

## Data, privacy, and scope

- Garden data is stored locally in IndexedDB. Export a CSV or JSON backup before
  clearing browser data or moving to another device.
- The sample is isolated in `demo:season-gap-garden`; real data uses
  `season-gap-garden`. See `.factory/demo.md` for reset behavior.
- The current release has no checkout. You can add beds without a purchase.
- During normal planning, the app makes no request beyond this site. It has no
  ads, analytics, tracking pixels, third-party fonts, or third-party runtime
  scripts.
- The tool uses only the dates and crop durations that the gardener enters. It
  does not predict weather or recommend crops.

See the [researched brief](.factory/brief.json), [visual thesis](.factory/design.md),
[claims registry](.factory/claims.json), and [handoff](.factory/handoff.md).
The code is MIT licensed.
