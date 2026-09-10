import { expect, test } from '@playwright/test';

function runOnDesktopOnly(testInfo: { project: { name: string } }) {
  test.skip(testInfo.project.name !== 'desktop-1440', 'Form interaction coverage runs once on the desktop release profile; API and route behavior run across the full matrix.');
}

test.describe('public form interaction coverage', () => {
  test('switches between both registration tracks', async ({ page }, testInfo) => {
    runOnDesktopOnly(testInfo);

    await page.goto('/register');
    await page.getByRole('button', { name: 'Apply for GIMUN' }).click();
    await expect(page.getByRole('heading', { name: 'Delegate Application Form' })).toBeVisible();
    await page.getByRole('button', { name: 'Change Competition Track' }).click();
    await page.getByRole('button', { name: 'Apply for GMC' }).click();
    await expect(page.getByRole('heading', { name: 'Law Team Registration Form' })).toBeVisible();
  });

  test('shows client validation for every registration mode', async ({ page }, testInfo) => {
    runOnDesktopOnly(testInfo);

    await page.goto('/register?track=gimun');
    await page.getByRole('button', { name: 'Submit Individual Application' }).click();
    await expect(page.getByText('Full Name is required')).toBeVisible();

    await page.getByRole('button', { name: 'Delegation (Group)' }).click();
    await page.getByRole('button', { name: /Submit Delegation Roster/ }).click();
    await expect(page.getByText('Head of Delegation Name is required')).toBeVisible();

    await page.goto('/register?track=moot-cup');
    await page.getByRole('button', { name: /Submit Law Team Registration/ }).click();
    await expect(page.getByText('Team Name is required')).toBeVisible();
  });

  test('shows contact and clarification validation feedback', async ({ page }, testInfo) => {
    runOnDesktopOnly(testInfo);

    await page.goto('/contact');
    await page.getByRole('button', { name: 'Send Direct Message' }).click();
    await expect(page.getByText('Your Name is required')).toBeVisible();

    await page.goto('/moot-cup/clarifications');
    await page.getByRole('button', { name: 'Submit Inquiry to Bench' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Team code, contact email, and clarification question are required.' }),
    ).toBeVisible();
  });

  test('renders with reduced motion enabled', async ({ page }, testInfo) => {
    runOnDesktopOnly(testInfo);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Delegate & Team Registration' })).toBeVisible();
  });
});
