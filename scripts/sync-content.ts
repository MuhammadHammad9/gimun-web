/**
 * Makes the CMS match the bundled content files: settings and the listed
 * collections. Unlike `content:seed`, it overwrites existing entries and
 * archives entries that are no longer in the files.
 *
 * Dry run by default; pass --apply to write. Every write goes through the
 * same save_content function as the admin, so revisions and the audit log are
 * kept and any change can be restored from the admin.
 *
 *   npx tsx scripts/sync-content.ts            # show what would change
 *   npx tsx scripts/sync-content.ts --apply    # write it
 */
import * as nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { registry, siteSchema, type Collection } from '../src/lib/content/registry';

nextEnv.loadEnvConfig(process.cwd());

const COLLECTIONS: Collection[] = ['committees', 'schedule', 'faq', 'copy', 'announcements', 'resources', 'team-groups', 'team', 'moot-categories', 'clarifications'];
const apply = process.argv.includes('--apply');

type Row = { id: string; data: Record<string, unknown>; version: number; status: string; sort_order: number; deleted_at: string | null };

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Configure Supabase before syncing.');
  const db = createClient(url, key, { auth: { persistSession: false } });

  // Writes are attributed to an active owner, as if saved in the admin.
  const { data: owner, error: ownerError } = await db.from('admin_users').select('user_id,email').eq('role', 'owner').eq('active', true).limit(1).maybeSingle();
  if (ownerError || !owner) throw new Error('No active owner account to attribute the changes to.');

  const changes: { label: string; entry: Record<string, unknown> }[] = [];

  const site = siteSchema.parse(JSON.parse(await readFile('content/site.json', 'utf8')));
  const { data: current, error: siteError } = await db.from('site_settings').select('data,version').eq('id', 'site').maybeSingle();
  if (siteError) throw siteError;
  if (!current || !isDeepStrictEqual(current.data, site)) {
    changes.push({ label: 'settings: update', entry: { collection: 'site', id: 'site', data: site, version: current?.version ?? 0 } });
  }

  for (const collection of COLLECTIONS) {
    const items = registry[collection].array().parse(JSON.parse(await readFile(`content/${collection}.json`, 'utf8'))) as { id: string }[];
    const { data: rows, error } = await db.from('content_entries').select('id,data,version,status,sort_order,deleted_at').eq('collection', collection);
    if (error) throw error;
    const existing = new Map((rows as Row[]).map((row) => [row.id, row]));
    items.forEach((data, sort_order) => {
      const row = existing.get(data.id);
      // Someone moved it to Trash in the admin: leave that decision alone.
      if (row?.deleted_at) { console.log(`  ${collection}/${data.id}: in Trash in the admin, skipped`); return; }
      const entry = { collection, id: data.id, status: 'published', sort_order, publish_at: null, expire_at: null, data, version: row?.version ?? 0 };
      if (!row) changes.push({ label: `${collection}/${data.id}: add`, entry });
      else if (row.status !== 'published' || row.sort_order !== sort_order || !isDeepStrictEqual(row.data, data)) changes.push({ label: `${collection}/${data.id}: update`, entry });
    });
    const wanted = new Set(items.map((item) => item.id));
    for (const row of existing.values()) {
      if (wanted.has(row.id) || row.status === 'archived' || row.deleted_at) continue;
      changes.push({ label: `${collection}/${row.id}: archive`, entry: { collection, id: row.id, status: 'archived', sort_order: row.sort_order, publish_at: null, expire_at: null, data: row.data, version: row.version } });
    }
  }

  if (changes.length === 0) return console.log('The CMS already matches the content files.');
  for (const change of changes) console.log(`  ${change.label}`);
  console.log(`${changes.length} change(s).`);
  if (!apply) return console.log('Dry run: nothing written. Run again with --apply to write.');

  let failed = 0;
  for (const change of changes) {
    const { error } = await db.rpc('save_content', { p_entry: change.entry, p_actor: owner.user_id });
    if (error) {
      failed += 1;
      console.error(`  FAILED ${change.label}: ${error.message}`);
    }
  }
  console.log(failed ? `${changes.length - failed} saved, ${failed} failed.` : `All ${changes.length} saved as ${owner.email}.`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
