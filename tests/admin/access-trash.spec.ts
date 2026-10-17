import { test, expect, type Page } from '@playwright/test';

const base = 'http://127.0.0.1:54329/rest/v1';
const headers = { apikey: 'fixture-service' };

async function signIn(page: Page, email: string, code?: string) {
  await page.goto('/admin/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('fixture-password-123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  if (code) {
    await expect(page).toHaveURL(/\/admin\/mfa/);
    await page.getByLabel('6-digit code').fill(code);
    await page.getByRole('button', { name: 'Verify' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Event dashboard' })).toBeVisible();
}

test('admins of one event never see the other event', async ({ browser, request }) => {
  const now = new Date().toISOString();
  for (const [id, type, name] of [['INQ-E2E-GIMUN', 'gimun', 'Gimun Asker'], ['INQ-E2E-GMC', 'moot-cup', 'Moot Asker']]) {
    await request.post(`${base}/contact_messages`, { headers, data: { id, submitted_at: now, name, email: `${type}@example.test`, query_type: type, message: `A question about ${type}`, kind: 'contact' } });
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await signIn(page, 'gimun-desk@example.test');
    await page.goto('/admin/inbox');
    await expect(page.getByText('Gimun Asker')).toBeVisible();
    await expect(page.getByText('Moot Asker')).toHaveCount(0);
    await page.goto('/admin/inbox/INQ-E2E-GMC');
    await expect(page.getByText('Moot Asker')).toHaveCount(0);
    const csv = await page.evaluate(async () => (await fetch('/admin/export?type=contact_messages')).text());
    expect(csv).toContain('Gimun Asker');
    expect(csv).not.toContain('Moot Asker');
    await page.goto('/admin');
    await expect(page.getByRole('link', { name: 'Country allocation' })).toBeVisible();
    await page.goto('/admin/workspace');
    await expect(page.getByRole('heading', { name: 'Admin settings' })).toHaveCount(0);
  } finally { await context.close(); }

  const gmc = await browser.newContext();
  const gmcPage = await gmc.newPage();
  try {
    await signIn(gmcPage, 'gmc-desk@example.test');
    await expect(gmcPage.getByRole('link', { name: 'Country allocation' })).toHaveCount(0);
    await gmcPage.goto('/admin/inbox');
    await expect(gmcPage.getByText('Moot Asker')).toBeVisible();
    await expect(gmcPage.getByText('Gimun Asker')).toHaveCount(0);
  } finally { await gmc.close(); }
});

test('trash, undo, restore and permanent delete with a two-step code', async ({ browser }) => {
  const plain = await browser.newContext();
  const page = await plain.newPage();
  let title = '';
  try {
    await signIn(page, 'owner@example.test');
    await page.goto('/admin/content/faq/new');
    title = `Trash test question ${Date.now()}`;
    await page.getByLabel('Question', { exact: true }).fill(title);
    await page.getByLabel('Answer', { exact: true }).fill('An answer that will be deleted.');
    await page.getByRole('button', { name: /^Publish (to website|changes)$/ }).click();
    await expect(page.getByText('Live on the website')).toBeVisible();
    await page.getByRole('button', { name: 'More' }).click();
    await page.getByRole('button', { name: 'Move to Trash' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Move to Trash' }).click();
    await expect(page).toHaveURL(/\/admin\/content\/faq$/);
    await expect(page.getByRole('link', { name: new RegExp(title) })).toHaveCount(0);
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByText('Restored.')).toBeVisible();
    await page.reload();
    await page.getByRole('link', { name: new RegExp(title) }).click();
    await page.getByRole('button', { name: 'More' }).click();
    await page.getByRole('button', { name: 'Move to Trash' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Move to Trash' }).click();
    await page.goto('/admin/trash');
    const row = page.getByRole('row').filter({ hasText: title });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Delete permanently' }).click();
    await page.getByRole('dialog').getByRole('textbox').fill(title);
    await page.getByRole('dialog').getByRole('button', { name: 'Delete forever' }).click();
    // Without an authenticator the delete stops and asks the owner to set one up.
    await expect(page.getByRole('heading', { name: 'Two-step sign-in needed' })).toBeVisible();
    await page.getByRole('button', { name: 'Not now' }).click();
    await expect(row).toBeVisible();
  } finally { await plain.close(); }

  const secure = await browser.newContext();
  const owner = await secure.newPage();
  try {
    await signIn(owner, 'secure-owner@example.test', '123456');
    await owner.goto('/admin/trash');
    const row = owner.getByRole('row').filter({ hasText: title });
    await row.getByRole('button', { name: 'Delete permanently' }).click();
    const dialog = owner.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Delete forever' })).toBeDisabled();
    await dialog.getByRole('textbox').fill(title);
    await dialog.getByRole('button', { name: 'Delete forever' }).click();
    await expect(owner.getByText(`“${title}” was deleted permanently.`)).toBeVisible();
    await expect(owner.getByRole('row').filter({ hasText: title })).toHaveCount(0);
    await owner.goto('/admin/audit?security=');
    await expect(owner.getByText('Deleted permanently').first()).toBeVisible();
  } finally { await secure.close(); }
});

test('team categories: add one, move a member into it, and it heads the Team page', async ({ page }) => {
  await signIn(page, 'secure-owner@example.test', '123456');
  await page.goto('/admin/content/team-groups/new');
  const name = `Advisory Board ${Date.now() % 10000}`;
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByRole('button', { name: /^Publish (to website|changes)$/ }).click();
  await expect(page.getByText('Live on the website')).toBeVisible();
  await page.goto('/admin/content/team/team-ayaan-omer');
  await page.getByLabel('Category').selectOption({ label: name });
  await page.getByRole('button', { name: /^Publish (to website|changes)$/ }).click();
  await expect(page.getByRole('status', { name: 'Save status' })).toContainText('Published.');
  await page.goto('/about/team');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  // A category with members cannot be deleted permanently.
  await page.goto('/admin/content/team-groups');
  await page.getByRole('link', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByRole('button', { name: 'Move to Trash' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Move to Trash' }).click();
  await page.goto('/admin/trash');
  await page.getByRole('row').filter({ hasText: name }).getByRole('button', { name: 'Delete permanently' }).click();
  await page.getByRole('dialog').getByRole('textbox').fill(name);
  await page.getByRole('dialog').getByRole('button', { name: 'Delete forever' }).click();
  await expect(page.getByText(/Still used by Ayaan Omer/)).toBeVisible();
});

test('people import from a Google Forms CSV reaches check-in', async ({ page }) => {
  await signIn(page, 'gimun-desk@example.test');
  await page.goto('/admin/people');
  const csv = 'Timestamp,Full Name,Email Address,Institution,Committee Preference\n2026/10/01,"Khan, Imported",imported.one@example.test,NUST,UNSC\n2026/10/02,Second Import,imported.two@example.test,FAST,DISEC\n';
  await page.getByLabel('CSV file').setInputFiles({ name: 'responses.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.getByText(/ready to import/)).toContainText('2');
  await page.getByRole('button', { name: /Import 2 to GIMUN/ }).click();
  await expect(page.getByText('2 added and 0 updated on the GIMUN roster.')).toBeVisible();
  const row = page.getByRole('row').filter({ hasText: 'Khan, Imported' });
  await expect(row).toBeVisible();
  const reference = (await row.locator('code').textContent())!.trim();
  expect(reference).toMatch(/^REG-GIMUN-/);
  await page.goto('/admin/event-day');
  await page.getByLabel('Ticket token or registration reference').fill(reference);
  await page.getByRole('button', { name: 'Look up roster' }).click();
  await expect(page.getByRole('button', { name: 'Check in', exact: true })).toBeVisible();
});
