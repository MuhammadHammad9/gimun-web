import { expect, test } from '@playwright/test';

// Notices and small feedback, on the 1440 px desktop project.
test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1440', 'Notices run on the 1440 px desktop project.');
});

// Which deadlines are announced, and when, is covered by tests/unit/notices.test.ts
// (the browser suite runs against the live content, whose dates move on).

test('losing and regaining the connection is announced, and Escape dismisses a notice', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForSelector('html[data-transitions="ready"]');
  // The toast is fetched once the visitor is here and the page is idle, so
  // it can still appear after the connection drops.
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(2500);
  await context.setOffline(true);
  const toast = page.locator('.site-toast [role="status"]');
  await expect(toast).toContainText("You're offline");
  await context.setOffline(false);
  await expect(toast).toContainText('Back online');

  await context.setOffline(true);
  await expect(toast).toContainText("You're offline");
  await toast.focus();
  await page.keyboard.press('Escape');
  await expect(toast).toHaveCount(0);
  await context.setOffline(false);
});

test('icon-only controls name themselves on hover and keyboard focus', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('button', { name: 'Jump to a page' });
  await expect(search).toHaveAttribute('data-tip', 'Search pages · Ctrl K');
  await search.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(400);
  const opacity = await search.evaluate((element) => getComputedStyle(element, '::after').opacity);
  expect(Number(opacity)).toBeGreaterThan(0.5);
});
