import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { database, hasDatabase } from '@/lib/server/supabase';
import { previewSession } from './preview';
import { registry, siteSchema, type Collection } from './registry';

/**
 * Public content reads.
 *
 * Published content is cached across requests under the `content` tag plus a
 * per-source tag (`content:<collection>`, `content:site`, `content:allocations`).
 * Admin saves invalidate their tag at once (updateTag). Changes that happen
 * without a write, such as a scheduled release becoming visible, are caught by
 * /api/public/revision, which invalidates `content` when the published
 * revision moves. The hour-long revalidate is only a safety net.
 *
 * Failures are thrown inside the cached functions, so an outage is never
 * cached; the caller falls back to the last good value or the bundled seed.
 */
const SAFETY_REVALIDATE = 3600;

type Health = { fallback: boolean; reason: string; transient: boolean };
type Row = { id: string; data: unknown; version: number };

const seededSite = unstable_cache(
  async () => {
    const { data, error } = await database().from('site_settings').select('id').eq('id', 'site').maybeSingle();
    if (error) throw error;
    return Boolean(data);
  },
  ['cms-health'],
  { tags: ['content', 'content:site'], revalidate: SAFETY_REVALIDATE },
);

export const contentHealth = cache(async (): Promise<Health> => {
  if (process.env.CMS_BACKEND === 'bundled' || !hasDatabase()) return { fallback: true, reason: 'Demonstration mode: website content is bundled. Admin edits are not public.', transient: false };
  try {
    const seeded = await seededSite();
    return { fallback: !seeded, reason: seeded ? '' : 'Content has not been seeded.', transient: false };
  } catch {
    return { fallback: true, reason: 'Website connection unavailable.', transient: true };
  }
});

const collectionRows = (collection: Collection) =>
  unstable_cache(
    async (): Promise<Row[]> => {
      const rows: Row[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await database().from('effective_content').select('id,data,version').eq('collection', collection).order('sort_order').order('id').range(offset, offset + 499);
        if (error) throw error;
        rows.push(...(data as Row[]));
        if (data.length < 500) break;
      }
      return rows;
    },
    ['cms-collection', collection],
    { tags: ['content', `content:${collection}`], revalidate: SAFETY_REVALIDATE },
  )();

const siteRow = unstable_cache(
  async () => {
    const { data, error } = await database().from('site_settings').select('data').eq('id', 'site').single();
    if (error) throw error;
    return data.data as unknown;
  },
  ['cms-site'],
  { tags: ['content', 'content:site'], revalidate: SAFETY_REVALIDATE },
);

const assignmentRows = unstable_cache(
  async () => {
    const all = async (table: string) => {
      const rows: { committee_slug: string; country: string }[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await database().from(table).select('committee_slug,country').order('committee_slug').order('country').range(offset, offset + 499);
        if (error) throw error;
        rows.push(...data);
        if (data.length < 500) break;
      }
      return rows;
    };
    const [allocations, reservations] = await Promise.all([all('allocations'), all('country_reservations')]);
    return { allocations, reservations };
  },
  ['cms-assignments'],
  { tags: ['content', 'content:allocations'], revalidate: SAFETY_REVALIDATE },
);

// An editor previewing drafts sees the working copy of every entry that is not
// archived or expired, including scheduled ones. Draft mode already bypasses
// the caches above, so this read is always fresh.
async function draftRows(collection: Collection): Promise<Row[]> {
  const rows: Row[] = [];
  const now = new Date().toISOString();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await database().from('content_entries').select('id,data,version').eq('collection', collection).neq('status', 'archived').or(`expire_at.is.null,expire_at.gt.${now}`).order('sort_order').order('id').range(offset, offset + 499);
    if (error) throw error;
    rows.push(...(data as Row[]));
    if (data.length < 500) break;
  }
  return rows;
}

// Last successful values are only an outage fallback, never the normal read path.
const lastGood = new Map<string, unknown>();

export const readCollection = cache(async <T,>(collection: Collection, seed: T[]): Promise<T[]> => {
  const health = await contentHealth();
  if (health.fallback) return health.transient ? (lastGood.get(collection) as T[] | undefined) ?? seed : seed;
  try {
    const preview = await previewSession();
    const drafts = Boolean(preview?.canSee(collection));
    const entries: T[] = [];
    for (const row of drafts ? await draftRows(collection) : await collectionRows(collection)) {
      const parsed = registry[collection].safeParse(row.data);
      if (parsed.success) entries.push({ ...parsed.data, ...(collection === 'announcements' ? { publicationVersion: row.version } : {}) } as T);
      else console.warn(`[CMS] Invalid ${collection} entry ${row.id}`);
    }
    if (!drafts) lastGood.set(collection, entries);
    return entries;
  } catch {
    console.warn(`[CMS] ${collection} unavailable; serving last known content.`);
    return (lastGood.get(collection) as T[] | undefined) ?? seed;
  }
});

export const readSite = cache(async (seed: unknown) => {
  const health = await contentHealth();
  if (health.fallback) return siteSchema.parse(health.transient ? lastGood.get('site') ?? seed : seed);
  try {
    const parsed = siteSchema.parse(await siteRow());
    lastGood.set('site', parsed);
    return parsed;
  } catch {
    return siteSchema.parse(lastGood.get('site') ?? seed);
  }
});

export const readCountryAssignments = cache(async () => {
  if (!hasDatabase() || process.env.CMS_BACKEND === 'bundled') return null;
  try {
    return await assignmentRows();
  } catch {
    return null;
  }
});
