import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function openDemo(page: Page): Promise<void> {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Season Gap Garden');
  await expect(page.getByText('Demo — sample data, nothing is saved to your real garden.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Patio salad bed', exact: true })).toBeVisible();
}

async function addBed(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Add bed', exact: true }).first().click();
  await page.getByLabel('Bed name').fill(name);
  await page.getByRole('dialog').getByRole('button', { name: 'Add bed', exact: true }).click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
}

test('plans a follow-on crop and survives offline reload', async ({ page, context }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Season Gap Garden/);
  await expect(page.locator('h1')).toHaveCount(1);

  await page.getByRole('button', { name: 'Start a real garden' }).click();
  await page.getByLabel('Bed name').fill('North bed');
  await page.getByRole('textbox', { name: /Bed note/ }).fill('The narrow raised bed');
  await page.getByRole('dialog').getByRole('button', { name: 'Add bed', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'North bed', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Add crop or rest' }).click();
  await page.getByLabel('Name').fill('Spring peas');
  await page.getByLabel('Transplant / in-bed date').fill('2026-03-10');
  await page.getByLabel('Expected clear date').fill('2026-05-10');
  await page.getByRole('dialog').getByRole('button', { name: 'Record entry' }).click();
  await expect(page.getByText('Spring peas').first()).toBeVisible();

  await page.locator('[data-action="fill-gap"]').last().click();
  await page.getByLabel('Crop note').selectOption({ index: 1 });
  await page.getByRole('dialog').getByRole('button', { name: 'Plan this crop' }).click();
  await expect(page.getByText('Radishes').first()).toBeVisible();

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'North bed', exact: true })).toBeVisible();
  await expect(page.locator('#connection-banner')).toBeVisible();
});

test('has no serious accessibility findings on a 390px screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'hidden');
});

test('supports the keyboard dialog path and restores focus to its trigger', async ({ page }) => {
  await page.goto('/');
  const addBed = page.getByRole('button', { name: 'Start a real garden' });
  await addBed.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Bed name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(addBed).toBeFocused();
});

test('reduces dialog motion when the operating system requests it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a bed' }).first().click();
  const duration = await page.getByRole('dialog').evaluate((dialog) => Number.parseFloat(getComputedStyle(dialog).transitionDuration) || 0);
  expect(duration).toBeLessThanOrEqual(0.001);
});

test('legal pages are available as static offline-friendly routes', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page).toHaveTitle('Privacy — Season Gap Garden');
  await expect(page.getByRole('heading', { name: 'Privacy' })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await page.goto('/terms/');
  await expect(page).toHaveTitle('Terms — Season Gap Garden');
  await expect(page.getByRole('heading', { name: 'Terms of use' })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});

test('does not advertise a checkout that the billing catalog has not enabled', async ({ page }) => {
  const requestOrigins = new Set<string>();
  page.on('request', (request) => requestOrigins.add(new URL(request.url()).origin));
  await page.goto('/');
  await expect(page.getByText('This release has no checkout.')).toBeVisible();
  await expect(page.locator('a[href*="api.sociobot.in/api/v1/products/season-gap-garden/checkout"]')).toHaveCount(0);
  expect([...requestOrigins]).toEqual(['http://127.0.0.1:4173']);

  for (let index = 1; index <= 4; index += 1) {
    await page.getByRole('button', { name: 'Start a real garden' }).click();
    await page.getByLabel('Bed name').fill(`Unlimited bed ${index}`);
    await page.getByRole('dialog').getByRole('button', { name: 'Add bed', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Unlimited bed 4', exact: true })).toBeVisible();
});

test('captures a returned license token and cleans the address bar', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/season-gap-garden/verify?license=returned-license', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok' }),
  }));
  await page.goto('/?license=returned-license');
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sb_license:season-gap-garden'))).toBe('returned-license');
});

test('rejects a malformed backup and keeps the existing notebook after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start a real garden' }).click();
  await page.getByLabel('Bed name').fill('Safe north bed');
  await page.getByRole('dialog').getByRole('button', { name: 'Add bed', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Safe north bed', exact: true })).toBeVisible();

  let confirmationShown = false;
  page.on('dialog', async (dialog) => {
    confirmationShown = true;
    await dialog.dismiss();
  });
  await page.locator('#import-file').setInputFiles({
    name: 'broken-garden.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":1,"beds":[{}],"plantings":[],"templates":[],"settings":{"seasonStart":"2026-03-01","seasonEnd":"2026-11-01"}}'),
  });

  await expect(page.locator('#toast')).toContainText('bed 1 ID');
  expect(confirmationShown).toBe(false);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Safe north bed', exact: true })).toBeVisible();
});

test('@claim:demo-isolation keeps the sample sandbox separate, resets it, and leaves real data unchanged', async ({ page }) => {
  await openDemo(page);
  await page.evaluate(async () => {
    const data = {
      version: 1,
      beds: [{ id: 'real-marker', name: 'Real garden marker', notes: '', createdAt: '2026-01-01T00:00:00.000Z' }],
      plantings: [], templates: [], settings: { seasonStart: '2026-03-01', seasonEnd: '2026-11-01' }, updatedAt: '2026-01-01T00:00:00.000Z',
    };
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('season-gap-garden', 1);
      open.onupgradeneeded = () => open.result.createObjectStore('garden');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const database = open.result;
        const transaction = database.transaction('garden', 'readwrite');
        transaction.objectStore('garden').put(data, 'current');
        transaction.oncomplete = () => { database.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });
  await expect(page.getByRole('heading', { name: 'Real garden marker', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Add bed', exact: true }).first().click();
  await page.getByLabel('Bed name').fill('Temporary sample bed');
  await page.getByRole('dialog').getByRole('button', { name: 'Add bed', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Temporary sample bed', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('heading', { name: 'Temporary sample bed', exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { name: 'Real garden marker', exact: true })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved to your real garden.')).toHaveCount(0);
});

test('opens the demo route and shows the designed not-found page', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Season Gap Garden');
  await expect(page.getByText('Demo — sample data, nothing is saved to your real garden.')).toBeVisible();
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Season Gap Garden');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to the garden planner' })).toBeVisible();
});

test('keeps named mobile links at least 44 pixels high', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const link of [
    page.getByRole('link', { name: 'Season Gap Garden' }),
    page.getByRole('link', { name: 'Privacy' }).last(),
    page.getByRole('link', { name: 'Terms' }),
  ]) {
    expect(await link.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  }
  await page.goto('/privacy/');
  expect(await page.getByRole('link', { name: 'Season Gap Garden' }).evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);

  for (const [route, email] of [
    ['/privacy/', 'privacy@sociobot.in'],
    ['/terms/', 'support@sociobot.in'],
  ]) {
    await page.goto(route);
    const box = await page.getByRole('link', { name: email }).boundingBox();
    expect(box, `${email} needs a measurable touch target`).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('puts the job, audience, and sample action in the first phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Plan follow-on crops from your bed dates' })).toBeVisible();
  await expect(page.getByText('For small-space food gardeners who want to see open bed windows and decide what to grow or rest next.')).toBeVisible();
  const sampleAction = page.getByRole('link', { name: 'Try it with sample data' });
  expect((await sampleAction.boundingBox())!.y + (await sampleAction.boundingBox())!.height).toBeLessThanOrEqual(844);
});

test.describe('declared demo claims', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Claim commands run once in a fresh Chromium demo context.');
  });

  test('@claim:open-windows shows open windows from dated sample beds', async ({ page }) => {
    await openDemo(page);
    expect(await page.locator('.gap-card').count()).toBeGreaterThan(0);
    await expect(page.getByText(/Patio salad bed has \d+ open days/).first()).toBeVisible();
  });

  test('@claim:follow-on-crop saves a crop selected from a duration note', async ({ page }) => {
    await openDemo(page);
    const before = await page.locator('.planting-list li').count();
    await page.locator('[data-action="fill-gap"]').last().click();
    await page.getByLabel('Crop note').selectOption({ index: 1 });
    await page.getByRole('dialog').getByRole('button', { name: 'Plan this crop' }).click();
    await expect(page.locator('.planting-list li')).toHaveCount(before + 1);
    await expect(page.locator('.planting-list li').filter({ hasText: 'Quick leaves' })).toHaveCount(1);
  });

  test('@claim:local-data keeps a demo save in the demo browser store', async ({ page }) => {
    const origins = new Set<string>();
    page.on('request', (request) => origins.add(new URL(request.url()).origin));
    await openDemo(page);
    await addBed(page, 'Demo storage check');
    const databaseNames = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
    expect(databaseNames).toContain('demo:season-gap-garden');
    expect(databaseNames).not.toContain('season-gap-garden');
    expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  });

  test('@claim:offline-reload keeps the sample usable after an online visit', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await openDemo(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Patio salad bed', exact: true })).toBeVisible();
    await expect(page.locator('#connection-banner')).toBeVisible();
    await context.close();
  });

  test('@claim:csv-export downloads the stated fields and one row per sample entry', async ({ page }) => {
    await openDemo(page);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Export season CSV/ }).click()]);
    const csv = await readFile(await download.path() as string, 'utf8');
    const rows = csv.trim().split('\n');
    expect(rows[0]).toBe('bed,entry_type,crop_or_rest,sow_date,transplant_date,expected_clear_date,notes');
    expect(rows).toHaveLength(6);
  });

  test('@claim:json-restore restores a complete downloaded notebook', async ({ page }) => {
    await openDemo(page);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Download full backup/ }).click()]);
    const backup = await readFile(await download.path() as string, 'utf8');
    await addBed(page, 'Extra sample bed');
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#import-file').setInputFiles({ name: 'sample-backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
    await expect(page.getByRole('heading', { name: 'Patio salad bed', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Extra sample bed', exact: true })).toHaveCount(0);
  });

  test('@claim:validated-restore rejects a malformed backup without replacing the sample', async ({ page }) => {
    await openDemo(page);
    let confirmed = false;
    page.once('dialog', (dialog) => { confirmed = true; return dialog.dismiss(); });
    await page.locator('#import-file').setInputFiles({ name: 'broken-garden.json', mimeType: 'application/json', buffer: Buffer.from('{"version":1,"beds":[{}],"plantings":[],"templates":[],"settings":{"seasonStart":"2026-03-01","seasonEnd":"2026-11-01"}}') });
    await expect(page.locator('#toast')).toContainText('bed 1 ID');
    expect(confirmed).toBe(false);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Patio salad bed', exact: true })).toBeVisible();
  });

  test('@claim:pwa-install has an installable manifest and active service worker', async ({ page }) => {
    await openDemo(page);
    const pwa = await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      const manifest = await fetch('/manifest.webmanifest').then((response) => response.json());
      return { display: manifest.display, icons: manifest.icons.map((icon: { sizes: string }) => icon.sizes), controller: Boolean(navigator.serviceWorker.controller) };
    });
    expect(pwa.display).toBe('standalone');
    expect(pwa.icons).toContain('192x192');
    expect(pwa.icons).toContain('512x512');
    expect(pwa.controller).toBe(true);
  });

  test('@claim:no-tracking makes no request beyond this site while using the demo', async ({ page }) => {
    const origins = new Set<string>();
    page.on('request', (request) => origins.add(new URL(request.url()).origin));
    await openDemo(page);
    await page.getByRole('button', { name: /Export season CSV/ }).click();
    await expect.poll(() => [...origins]).toEqual(['http://127.0.0.1:4173']);
  });

  test('@claim:no-purchase adds more beds without a purchase step', async ({ page }) => {
    await openDemo(page);
    for (const index of [1, 2, 3, 4]) await addBed(page, `No purchase bed ${index}`);
    await expect(page.getByRole('heading', { name: 'No purchase bed 4', exact: true })).toBeVisible();
    await expect(page.locator('a[href*="checkout"]')).toHaveCount(0);
  });
});
