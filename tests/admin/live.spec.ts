import { test, expect } from '@playwright/test';

test('published changes reach another admin and public page; dirty drafts survive', async ({ browser }) => {
  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext()]);
  const [editor, observer, website] = await Promise.all(contexts.map(c => c.newPage()));
  try {
    for (const page of [editor, observer]) {
      await page.goto('/admin/login');
      await page.getByLabel('Email', { exact: true }).fill('owner@example.test');
      await page.getByLabel('Password', { exact: true }).fill('fixture-password-123');
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Event dashboard' })).toBeVisible();
      await page.goto('/admin/content/announcements/ann-01');
    }
    await website.goto('/announcements');
    editor.on('dialog', d => d.accept());
    const title = `Live synchronization ${Date.now()}`;
    await editor.getByLabel('title', { exact: true }).fill(title);
    await editor.getByRole('combobox', { name: 'Save action', exact: true }).selectOption('publish');
    await editor.getByRole('button', { name: 'Publish now', exact: true }).click();
    await expect(editor.getByRole('status', { name: 'Save status' })).toContainText('Published.');
    const committed = Date.now();
    await Promise.all([
      expect(website.getByRole('heading', { name: title, exact: true })).toBeVisible({ timeout: 10000 }),
      expect(observer.getByLabel('title', { exact: true })).toHaveValue(title, { timeout: 10000 }),
    ]);
    expect(Date.now() - committed).toBeLessThan(10000);
    await observer.getByLabel('title', { exact: true }).fill('My unsaved draft');
    await editor.getByLabel('title', { exact: true }).fill(`${title} updated`);
    await editor.getByRole('button', { name: 'Publish now', exact: true }).click();
    await expect(editor.getByRole('status', { name: 'Save status' })).toContainText('Published.');
    await expect(observer.getByText('Changes available · your unsaved work is preserved', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(observer.getByLabel('title', { exact: true })).toHaveValue('My unsaved draft');
    await expect(website.getByRole('heading', { name: `${title} updated`, exact: true })).toBeVisible({ timeout: 10000 });
  } finally { await Promise.all(contexts.map(c => c.close())); }
});

test('scheduled publication and expiry update an open public page without another write', async ({ page, request }) => {
  const base='http://127.0.0.1:54329/rest/v1';const headers={apikey:'fixture-service'};
  const users=await (await request.get(`${base}/admin_users`,{headers})).json();
  const entries=await (await request.get(`${base}/content_entries?collection=eq.announcements&id=eq.ann-01`,{headers})).json();
  const entry=entries[0];const title=`Scheduled browser release ${Date.now()}`;
  await page.goto('/announcements');
  const release=Date.now()+3000;
  const result=await request.post(`${base}/rpc/save_content`,{headers,data:{p_actor:users[0].user_id,p_entry:{...entry,id:'scheduled-browser-test',version:0,status:'published',publish_at:new Date(release).toISOString(),expire_at:new Date(release+12000).toISOString(),data:{...entry.data,id:'scheduled-browser-test',pinnedFlag:false,title}}}});
  expect(result.ok()).toBeTruthy();
  await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible({timeout:13000});
  expect(Date.now()-release).toBeLessThan(10000);
  await expect(page.getByRole('heading',{name:title,exact:true})).toHaveCount(0,{timeout:22000});
  expect(Date.now()-(release+12000)).toBeLessThan(10000);
});

// Publishes an announcement straight through the fixture database (no save action).
async function publishAnnouncement(request: import('@playwright/test').APIRequestContext, id: string, title: string, status: 'published' | 'draft' = 'published') {
  const base='http://127.0.0.1:54329/rest/v1';const headers={apikey:'fixture-service'};
  const users=await (await request.get(`${base}/admin_users`,{headers})).json();
  const entries=await (await request.get(`${base}/content_entries?collection=eq.announcements&id=eq.ann-01`,{headers})).json();
  const entry=entries[0];
  const result=await request.post(`${base}/rpc/save_content`,{headers,data:{p_actor:users[0].user_id,p_entry:{...entry,id,version:0,status,publish_at:null,expire_at:null,data:{...entry.data,id,pinnedFlag:false,title}}}});
  expect(result.ok()).toBeTruthy();
}

test('a visitor part-way through a form is offered the update instead of losing their place', async ({ page, request }) => {
  await page.goto('/contact');
  const name = page.getByLabel(/Your Full Name/);
  await name.fill('Half-written message');
  await page.getByRole('heading', { level: 1 }).click();
  await publishAnnouncement(request, `hold-${Date.now()}`, `Held update ${Date.now()}`);
  const chip = page.getByRole('button', { name: 'This page has updates. Show them' });
  await expect(chip).toBeVisible({ timeout: 25000 });
  await expect(name).toHaveValue('Half-written message');
  await chip.click();
  await expect(page.getByText('Updated just now')).toBeVisible({ timeout: 10000 });
});

test('a live refresh marks the content that changed', async ({ page, request }) => {
  await page.goto('/announcements');
  const id = `changed-${Date.now()}`;
  const title = `Freshly changed notice ${Date.now()}`;
  await publishAnnouncement(request, id, title);
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible({ timeout: 10000 });
  await expect(page.locator(`[data-live-key="announcement-${id}"]`)).toHaveAttribute('data-live-changed', '');
  await expect(page.getByText('Updated just now')).toBeVisible();
});

test('an editor previews a draft on the real page; visitors never see it', async ({ browser, request }) => {
  const [editorContext, visitorContext] = await Promise.all([browser.newContext(), browser.newContext()]);
  const [editor, visitor] = await Promise.all([editorContext.newPage(), visitorContext.newPage()]);
  try {
    const id = `preview-${Date.now()}`;
    const title = `Unpublished preview notice ${Date.now()}`;
    await publishAnnouncement(request, id, title, 'draft');
    await editor.goto('/admin/login');
    await editor.getByLabel('Email', { exact: true }).fill('owner@example.test');
    await editor.getByLabel('Password', { exact: true }).fill('fixture-password-123');
    await editor.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(editor.getByRole('heading', { name: 'Event dashboard' })).toBeVisible();
    await editor.goto(`/admin/content/announcements/${id}`);
    const [previewTab] = await Promise.all([editorContext.waitForEvent('page'), editor.getByRole('link', { name: 'Preview on site' }).click()]);
    await expect(previewTab).toHaveURL(/\/announcements$/);
    await expect(previewTab.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(previewTab.getByRole('complementary', { name: 'Draft preview' })).toBeVisible();
    await visitor.goto('/announcements');
    await expect(visitor.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
    await expect(visitor.getByRole('complementary', { name: 'Draft preview' })).toHaveCount(0);
    await previewTab.getByRole('button', { name: 'Exit preview' }).click();
    await expect(previewTab.getByRole('complementary', { name: 'Draft preview' })).toHaveCount(0);
    await expect(previewTab.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
    expect(new URL(previewTab.url()).pathname).toBe('/announcements');
  } finally { await Promise.all([editorContext.close(), visitorContext.close()]); }
});

test('preview cannot be switched on without signing in', async ({ page, request }) => {
  const id = `orphan-${Date.now()}`;
  const title = `Orphaned draft ${Date.now()}`;
  await publishAnnouncement(request, id, title, 'draft');
  const denied = await request.get(`/admin/preview?collection=announcements&id=${id}`, { maxRedirects: 0 });
  expect(denied.status()).toBeGreaterThanOrEqual(300);
  expect(denied.headers()['set-cookie'] ?? '').not.toContain('__prerender_bypass');
  await page.goto('/announcements');
  await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
});
