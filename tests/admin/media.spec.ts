import { test, expect, type Page } from '@playwright/test';

// A real 1x1 PNG, so storage, verification and rendering see a genuine image.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

async function signIn(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email', { exact: true }).fill('owner@example.test');
  await page.getByLabel('Password', { exact: true }).fill('fixture-password-123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Event dashboard' })).toBeVisible();
}

test('a photo uploaded while adding a team member is published and shows on the Team page', async ({ page }) => {
  await signIn(page);
  const name = `Ayesha Test ${Date.now()}`;
  await page.goto('/admin/content/team');
  await page.getByRole('link', { name: 'Add team member' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'New team member' })).toBeVisible();
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('Role', { exact: true }).fill('Under-Secretary-General');

  // Upload straight from the photo field; it becomes the chosen photo.
  const photo = page.locator('.media-field').filter({ hasText: 'Photo' }).first();
  await photo.locator('input[type=file]').setInputFiles({ name: 'delegate-portrait.png', mimeType: 'image/png', buffer: PNG });
  await expect(photo.locator('.media-field__chosen')).toBeVisible({ timeout: 15000 });
  await expect(photo.locator('.media-field__chosen')).toContainText('Delegate portrait');

  await page.getByRole('button', { name: 'Publish to website' }).click();
  await expect(page.getByRole('status', { name: 'Save status' })).toContainText('Published.');
  await expect(page.getByText('Live on the website')).toBeVisible({ timeout: 10000 });

  // The public Team page shows the member with the uploaded photo.
  await page.goto('/about/team');
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  const src = await page.locator(`img[alt="${name}"]`).first().getAttribute('src');
  expect(decodeURIComponent(src ?? '')).toContain('/storage/v1/object/public/media/');

  // The library lists the file and where it is used.
  await page.goto('/admin/media');
  const card = page.locator('.media-card').filter({ hasText: 'Delegate portrait' }).first();
  await expect(card).toContainText(name);
});

test('the media library uploads several files, checks each one, and refuses an oversized image', async ({ page }) => {
  await signIn(page);
  await page.goto('/admin/media');
  await expect(page.getByRole('heading', { level: 1, name: 'Media library' })).toBeVisible();
  const huge = Buffer.alloc(6 * 1024 * 1024, 1);
  await page.getByLabel('Files to upload').first().setInputFiles([
    { name: 'venue-map.png', mimeType: 'image/png', buffer: PNG },
    { name: 'too-large.png', mimeType: 'image/png', buffer: huge },
  ]);
  await expect(page.getByText(/too-large\.png is 6\.0 MB\. The limit is 5 MB/)).toBeVisible();
  await page.getByRole('button', { name: 'Upload 1 file' }).click();
  await expect(page.locator('.upload__item.is-done')).toContainText('venue-map.png', { timeout: 15000 });
  await page.reload();
  await expect(page.locator('.media-card').filter({ hasText: 'Venue map' }).first()).toBeVisible();
});
