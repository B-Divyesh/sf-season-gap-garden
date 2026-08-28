import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('plans a follow-on crop and survives offline reload', async ({ page, context }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Season Gap Garden/);
  await expect(page.locator('h1')).toHaveCount(1);

  await page.getByRole('button', { name: 'Add a bed' }).first().click();
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
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'hidden');
});

test('supports the keyboard dialog path and restores focus to its trigger', async ({ page }) => {
  await page.goto('/');
  const addBed = page.getByRole('button', { name: 'Add a bed' }).first();
  await addBed.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Bed name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(addBed).toBeFocused();
});

test('legal pages are available as static offline-friendly routes', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { name: 'Privacy, in plain soil' })).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { name: 'Terms of use' })).toBeVisible();
});

test('rejects a malformed backup and keeps the existing notebook after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a bed' }).first().click();
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
