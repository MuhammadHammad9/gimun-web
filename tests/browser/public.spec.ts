import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import committees from '../../content/committees.json';

const publicRoutes = [
  '/',
  '/gimun',
  '/gimun/committees',
  ...committees.map((committee) => `/gimun/committees/${committee.slug}`),
  '/gimun/rules',
  '/moot-cup',
  '/moot-cup/categories',
  '/moot-cup/rules',
  '/moot-cup/clarifications',
  '/schedule',
  '/resources',
  '/register',
  '/about',
  '/about/team',
  '/about/venue',
  '/about/faq',
  '/about/sponsors',
  '/about/gallery',
  '/announcements',
  '/results',
  '/contact',
  '/privacy',
];

test.describe('public route rendering', () => {
  for (const route of publicRoutes) {
    test(`${route} renders with one accessible heading`, async ({ page }) => {
      test.setTimeout(45_000);
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page).toHaveTitle(/GIMUN|GMC/);
    });
  }
});

for (const route of publicRoutes) {
  test(`${route} passes rendered axe checks`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toHaveCount(1);
    if (route === '/register') {
      await expect(page.getByText('GIMUN Track', { exact: true }).first()).toBeVisible();
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('.double-bezel.relative')).every((element) => getComputedStyle(element).opacity === '1'),
        undefined,
        { timeout: 30_000 },
      );
    }
    await page.waitForTimeout(1_000);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.map((node) => node.target),
      })),
      `${route} has accessibility violations`,
    ).toEqual([]);
  });
}

test('mobile navigation opens and closes with accessible state', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile-'), 'Mobile navigation is covered by mobile viewport projects only.');
  await page.goto('/');
  const openButton = page.getByRole('button', { name: 'Open navigation menu' });
  await openButton.click();
  await expect(page.getByRole('button', { name: 'Close mobile menu' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.getByRole('button', { name: 'Close mobile menu' }).click();
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
});

test('gallery lightbox is keyboard accessible and restores focus', async ({ page }) => {
  await page.goto('/about/gallery');
  const firstCard = page.getByRole('button').filter({ hasText: 'UNSC Midnight Crisis Directive Session' }).first();
  await firstCard.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(firstCard).toBeFocused();
});

test('required public infrastructure responds', async ({ request }) => {
  for (const path of ['/robots.txt', '/sitemap.xml', '/favicon.ico', '/apple-icon.png']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});
