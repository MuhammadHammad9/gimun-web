import { expect, test } from '@playwright/test';

// The chapter rail and the quick jump button exist from 1280 px; the copy
// button everywhere. One desktop project covers them; the dark desktop
// project repeats the visual states.
test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1440', 'Story interactions run on the 1440 px desktop project.');
});

test('the chapter rail lists the chapters and jumps to one', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('html[data-transitions="ready"]');
  // The rail appears after the first scroll.
  await page.mouse.wheel(0, 400);
  const rail = page.getByRole('navigation', { name: 'Chapters on this page' });
  await expect(rail).toBeVisible();
  await expect(rail.getByRole('link')).toHaveCount(7);

  await rail.getByRole('link', { name: /The clock/ }).click();
  await expect(page.locator('#dates-title')).toBeFocused();
  await expect(page).toHaveURL(/#dates-title$/);
  await expect(rail.getByRole('link', { name: /The clock/ })).toHaveAttribute('aria-current', 'location');
});

test('the quick jump opens with Ctrl+K, filters, goes with Enter and closes with Escape', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('html[data-transitions="ready"]');

  const button = page.getByRole('button', { name: 'Jump to a page' });
  await button.focus();
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Jump to a page' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();

  await page.keyboard.press('Control+k');
  await page.getByRole('combobox', { name: 'Page to jump to' }).fill('venue');
  await expect(page.getByRole('option')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/about\/venue$/);
});

test('copying a contact address confirms it to screen readers', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Copy the general questions address' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'copied' })).toHaveCount(1);
});
