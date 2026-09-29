import { expect, test } from '@playwright/test';

// The motion layer on one wide desktop project: the globe and the corridor
// only run on the full tier, and the behaviour does not change with width.
test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1440', 'Motion checks run on the wide desktop project.');
});

/** The site's first-intent gate: nothing animates by script before this. */
async function showIntent(page: import('@playwright/test').Page) {
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 5);
}

test('a committee placard morphs into its page, without the curtain, and focus moves', async ({ page }) => {
  await page.goto('/gimun');
  await page.waitForSelector('html[data-transitions="ready"]');
  await page.evaluate(() => {
    const curtain = document.querySelector('[data-curtain]');
    const log: string[] = [];
    (window as unknown as { __curtain: string[] }).__curtain = log;
    new MutationObserver(() => log.push(curtain?.getAttribute('data-curtain') ?? '')).observe(curtain!, { attributes: true, attributeFilter: ['data-curtain'] });
  });
  await page.getByRole('link', { name: /: committee page$/ }).first().click();
  await expect(page).toHaveURL(/\/gimun\/committees\/[\w-]+$/);
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.evaluate(() => (window as unknown as { __curtain: string[] }).__curtain)).toEqual([]);
});

test('the committees globe comes alive after the first intent and turns', async ({ page }) => {
  await page.goto('/gimun/committees');
  const globe = page.locator('.live-globe');
  await expect(globe).not.toHaveAttribute('data-live', '');
  await showIntent(page);
  // The globe's code is fetched only after the first intent; allow for a busy machine.
  await expect(globe).toHaveAttribute('data-live', '', { timeout: 15000 });
  const lit = () =>
    page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('.live-globe canvas')!;
      const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
      let sum = 0;
      for (let i = 3; i < data.length; i += 4) sum += data[i] * i;
      return sum;
    });
  const first = await lit();
  await page.waitForTimeout(500);
  expect(first).toBeGreaterThan(0);
  expect(await lit()).not.toBe(first);
});

test('the clock counts down to the next deadline and draws its rail as it arrives', async ({ page }) => {
  await page.goto('/');
  const timer = page.getByRole('timer');
  // The rolling digits are visual; the timer's text says it in words.
  await expect(timer.locator('.countdown__digits')).toHaveAttribute('aria-hidden', 'true');
  await expect(timer).toContainText(/\d+ days?, \d+ hours? and \d+ minutes? until .+ at 23:59 Pakistan time\./);
  await expect(page.locator('.rail')).toHaveAttribute('aria-hidden', 'true');
  await page.mouse.move(700, 450);
  for (let i = 0; i < 80; i++) {
    await page.mouse.wheel(0, 180);
    await page.waitForTimeout(60);
    if ((await page.locator('.rail').getAttribute('data-state')) === 'drawn') break;
  }
  await expect(page.locator('.rail')).toHaveAttribute('data-state', 'drawn');
  await expect(page.locator('.clock')).toHaveAttribute('data-rolling', '');
});

test('the home marquee can be paused', async ({ page }) => {
  await page.goto('/');
  const pause = page.getByRole('button', { name: 'Pause the moving list' });
  await pause.click();
  await expect(page.getByRole('button', { name: 'Play the moving list' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('.marquee__track').evaluate((track) => track.getAnimations()[0]?.playState)).toBe('paused');
  await expect(page.getByRole('list', { name: 'Countries represented in committee' })).toBeVisible();
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the globe stays a drawing and the marquee stands still', async ({ page }) => {
    await page.goto('/gimun/committees');
    await showIntent(page);
    await page.waitForTimeout(800);
    await expect(page.locator('.live-globe')).not.toHaveAttribute('data-live', '');
    await expect(page.locator('.live-globe__fallback svg')).toBeVisible();
    await page.goto('/');
    expect(await page.locator('.marquee__track').evaluate((track) => track.getAnimations().length)).toBe(0);
    await expect(page.getByRole('button', { name: 'Pause the moving list' })).toBeHidden();
  });
});
