import { expect, test } from '@playwright/test';

function runOnRepresentativeViewports(testInfo: { project: { name: string } }) {
  test.skip(!['desktop-1440','mobile-375'].includes(testInfo.project.name), 'Forms run on desktop and phone profiles; route rendering runs across the full matrix.');
}

test.describe('public form interaction coverage', () => {
  test('switches between both registration tracks', async ({ page }, testInfo) => {
    runOnRepresentativeViewports(testInfo);

    await page.goto('/register');
    await page.getByRole('button', { name: 'Apply for GIMUN' }).click();
    await expect(page.getByRole('heading', { name: 'Delegate Application Form' })).toBeVisible();
    await page.getByRole('button', { name: 'Change Competition Track' }).click();
    await page.getByRole('button', { name: 'Apply for GMC' }).click();
    await expect(page.getByRole('heading', { name: 'Law Team Registration Form' })).toBeVisible();
  });

  test('shows client validation for every registration mode', async ({ page }, testInfo) => {
    runOnRepresentativeViewports(testInfo);

    await page.goto('/register?track=gimun');
    await page.getByRole('button', { name: 'Submit Individual Application' }).click();
    // Each message appears under its field and again in the error summary.
    await expect(page.locator('#field-fullName-error')).toHaveText('Full Name is required');
    await expect(page.getByRole('link', { name: 'Full Name is required' })).toBeVisible();

    await page.getByRole('button', { name: 'Delegation (Group)' }).click();
    await page.getByRole('button', { name: /Submit Delegation Roster/ }).click();
    await expect(page.locator('#field-delegationHeadName-error')).toHaveText('Head of Delegation Name is required');

    await page.goto('/register?track=moot-cup');
    await page.getByRole('button', { name: /Submit Law Team Registration/ }).click();
    await expect(page.locator('#field-teamName-error')).toHaveText('Team Name is required');
  });

  test('shows contact and clarification validation feedback', async ({ page }, testInfo) => {
    runOnRepresentativeViewports(testInfo);

    await page.goto('/contact');
    await page.getByRole('button', { name: 'Send Direct Message' }).click();
    await expect(page.locator('#field-name-error')).toHaveText('Your Name is required');

    await page.goto('/moot-cup/clarifications');
    // The page now renders the shared ClarificationForm rather than its own
    // inline copy, so the control and message come from that component.
    await page.getByRole('button', { name: 'Submit question' }).click();
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: 'Team ID, email, case-problem section and your question are all required.' }),
    ).toBeVisible();
  });

  test('renders with reduced motion enabled', async ({ page }, testInfo) => {
    runOnRepresentativeViewports(testInfo);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Delegate & Team Registration' })).toBeVisible();
  });
});
