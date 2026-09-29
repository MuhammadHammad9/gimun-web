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
