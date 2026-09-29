import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// One phone and one desktop project exercise the curtain; the behaviour is
// the same at every width in between.
test.beforeEach(async ({}, testInfo) => {
  test.skip(!['desktop-1440', 'mobile-390'].includes(testInfo.project.name), 'Transitions run on one phone and one desktop project.');
});

/** Starts recording the curtain's phases (data-curtain) for this document. */
async function recordCurtain(page: Page) {
  await page.waitForSelector('html[data-transitions="ready"]');
  await page.evaluate(() => {
    const curtain = document.querySelector('[data-curtain]');
    const log: string[] = [];
    (window as unknown as { __curtain: string[] }).__curtain = log;
    new MutationObserver(() => log.push(curtain?.getAttribute('data-curtain') ?? '')).observe(curtain!, {
      attributes: true,
      attributeFilter: ['data-curtain'],
    });
  });
}

const curtainLog = (page: Page) => page.evaluate(() => (window as unknown as { __curtain: string[] }).__curtain);
const curtainIdle = (page: Page) =>
  page.waitForFunction(() => document.querySelector('[data-curtain]')?.getAttribute('data-curtain') === 'idle');
const footerLink = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name, exact: true });

test('a page change runs the curtain and starts the reader at the new content', async ({ page }) => {
  await page.goto('/');
  await recordCurtain(page);
  await footerLink(page, 'Schedule').click();
  await expect(page).toHaveURL(/\/schedule$/);
  await curtainIdle(page);
  expect(await curtainLog(page)).toEqual(['covering', 'covered', 'revealing', 'idle']);
  await expect(page.locator('#main-content')).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(await page.locator('#main-content').evaluate((main) => (main as HTMLElement).inert)).toBe(false);
  await expect(page.locator('h1')).toHaveCount(1);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});

test('Back and Forward stay instant', async ({ page }) => {
  await page.goto('/about');
  await recordCurtain(page);
  await footerLink(page, 'FAQ').click();
  await expect(page).toHaveURL(/\/about\/faq$/);
  await curtainIdle(page);
  await page.evaluate(() => (window as unknown as { __curtain: string[] }).__curtain.splice(0));
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('#main-content')).toBeFocused();
  expect(await curtainLog(page)).toEqual([]);
});

test('a link to another part of the same page never runs the curtain', async ({ page }) => {
  await page.goto('/about/faq');
  await recordCurtain(page);
  await page.getByRole('contentinfo').getByRole('link', { name: 'Fees and payment' }).click();
  await expect(page).toHaveURL(/\/about\/faq#fees$/);
  expect(await curtainLog(page)).toEqual([]);
});

test('a link into another page lands on its anchor', async ({ page }) => {
  await page.goto('/');
  await recordCurtain(page);
  await page.getByRole('contentinfo').getByRole('link', { name: 'Fees and payment' }).click();
  await expect(page).toHaveURL(/\/about\/faq#fees$/);
  await curtainIdle(page);
  expect(await curtainLog(page)).toContain('covered');
  await expect(page.locator('#fees')).toBeInViewport();
});

test('document links load directly, without the curtain', async ({ page }) => {
  await page.goto('/');
  await recordCurtain(page);
  await page.evaluate(() => {
    const link = document.createElement('a');
    link.href = '/documents/example.pdf';
    link.textContent = 'Example PDF';
    link.id = 'pdf-probe';
    document.getElementById('main-content')?.prepend(link);
    // Registered after the provider's handler, so it sees that handler's
    // decision; then it stops the real navigation.
    window.addEventListener('click', (event) => {
      (window as unknown as { __intercepted: boolean }).__intercepted = event.defaultPrevented;
      event.preventDefault();
    });
  });
  await page.locator('#pdf-probe').click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { __intercepted: boolean }).__intercepted)).toBe(false);
  expect(await curtainLog(page)).toEqual([]);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('pages change without the curtain and focus still moves', async ({ page }) => {
    await page.goto('/');
    await recordCurtain(page);
    await footerLink(page, 'Resources').click();
    await expect(page).toHaveURL(/\/resources$/);
    await expect(page.locator('#main-content')).toBeFocused();
    expect(await curtainLog(page)).toEqual([]);
  });
});
