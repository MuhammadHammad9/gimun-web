import { expect, test } from '@playwright/test';

function runOnRepresentativeViewports(testInfo: { project: { name: string } }) {
  test.skip(!['desktop-1440','mobile-375'].includes(testInfo.project.name), 'Forms run on desktop and phone profiles; route rendering runs across the full matrix.');
}

test.describe('public form interaction coverage', () => {
  test('links every official registration form by name', async ({ page }, testInfo) => {
    runOnRepresentativeViewports(testInfo);

    await page.goto('/register');
    // Registration happens on the official forms: no form is submitted on this site.
    await expect(page.locator('main form')).toHaveCount(0);
    for (const name of ['Delegate Registration Form', 'Delegation Registration Form', 'Chair Call Application Form', 'Judge Registration Form']) {
      const link = page.getByRole('link', { name: new RegExp(`^${name}`) }).first();
      await expect(link).toHaveAttribute('href', /^https:\/\/docs\.google\.com\/forms\//);
      await expect(link).toHaveAttribute('target', '_blank');
    }
    await expect(page.locator('#pricing-gimun .pixel-card')).toHaveCount(3);
    await expect(page.locator('#pricing-gmc .pixel-card')).toHaveCount(3);
    await expect(page.locator('#payment dd').first()).not.toBeEmpty();
    await expect(page.locator('#registration-contacts a[href^="tel:"]').first()).toBeVisible();
    await expect(page.locator('#before dt')).toHaveCount(4);
    await expect(page.getByText('QR ticket by email')).toHaveCount(0);
  });

  test('shows contact validation feedback', async ({ page }, testInfo) => {
    runOnRepresentativeViewports(testInfo);

    await page.goto('/contact');
    await page.getByRole('button', { name: 'Send Direct Message' }).click();
    await expect(page.locator('#field-name-error')).toHaveText('Your Name is required');

  });

  test('renders with reduced motion enabled', async ({ page }, testInfo) => {
    runOnRepresentativeViewports(testInfo);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/register');
    await expect(page.getByRole('heading', { level: 1, name: /Register for GIMUN 26/ })).toBeVisible();
  });
});
