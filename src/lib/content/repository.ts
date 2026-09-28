import 'server-only';
import { unstable_cache } from 'next/cache';
import { database, hasDatabase } from '@/lib/server/supabase';
import { registry, siteSchema, type Collection } from './registry';

/**
 * Content reads are built to degrade, not break:
 *
 * - No database configured, or the CMS never seeded: serve the bundled seed.
 *   That is a deliberate state, so it is cached like any other result.
 * - Database error: throw inside the cache. Next keeps serving the last good
 *   value (stale-while-revalidate) instead of replacing live content with the
 *   seed. Only a cold cache with a failing database falls back to the seed,
 *   and that fallback is not cached.
 * - One malformed entry is skipped and logged; it no longer swaps the whole
 *   collection for seed data.
 */
class ContentUnavailableError extends Error {}

type Health = { fallback: boolean; reason: string; transient: boolean };

// Empty collections are intentional (e.g. all entries unpublished), not a reason
// to resurrect bundled data. Missing settings indicates the CMS was never seeded.
export async function contentHealth(): Promise<Health> {
  if (!hasDatabase()) return { fallback: true, reason: 'Database is not configured.', transient: false };
  try {
    const { data, error } = await database().from('site_settings').select('id').eq('id', 'site').maybeSingle();
    if (error) return { fallback: true, reason: 'CMS is unavailable.', transient: true };
    return { fallback: !data, reason: data ? '' : 'CMS has not been seeded.', transient: false };
  } catch {
    return { fallback: true, reason: 'CMS is unavailable.', transient: true };
  }
}

async function withSeedFallback<T>(label: string, read: () => Promise<T>, seed: () => T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.error(`[CMS] ${label}: ${error instanceof Error ? error.message : 'read failed'}; serving bundled content for this request.`);
    return seed();
  }
}

export async function readCollection<T>(collection: Collection, seed: T[]): Promise<T[]> {
  const cached = unstable_cache(
    async () => {
      const health = await contentHealth();
      if (health.transient) throw new ContentUnavailableError(health.reason);
      if (health.fallback) return seed;
      const now = new Date().toISOString();
      const rows: { id?: string; data: unknown; publish_at: string | null; expire_at: string | null }[] = [];
      for (let offset = 0; ; offset += 500) {
        const result = await database()
          .from('content_entries')
          .select('id,data,publish_at,expire_at')
          .eq('collection', collection)
          .eq('status', 'published')
          .order('sort_order')
          .order('id')
          .range(offset, offset + 499);
        if (result.error) throw new ContentUnavailableError(result.error.message);
        rows.push(...result.data);
        if (result.data.length < 500) break;
      }
      const entries: T[] = [];
      for (const row of rows) {
        if ((row.publish_at && row.publish_at > now) || (row.expire_at && row.expire_at <= now)) continue;
        const parsed = registry[collection].safeParse(row.data);
        if (parsed.success) entries.push(parsed.data as T);
        else console.error(`[CMS] Skipping invalid ${collection} entry ${row.id ?? '(no id)'}: ${parsed.error.issues[0]?.message ?? 'invalid'}`);
      }
      return entries;
    },
    ['cms', collection],
    { tags: [`content:${collection}`, 'content:site'], revalidate: 60 }
  );
  return withSeedFallback(collection, cached, () => seed);
}

export async function readSite(seed: unknown) {
  const cached = unstable_cache(
    async () => {
      if (!hasDatabase()) return siteSchema.parse(seed);
      const { data, error } = await database().from('site_settings').select('data').eq('id', 'site').maybeSingle();
      if (error) throw new ContentUnavailableError(error.message);
      if (!data) return siteSchema.parse(seed);
      const parsed = siteSchema.safeParse(data.data);
      if (parsed.success) return parsed.data;
      // Settings are one document; a bad save must not blank the site. Keep
      // every valid field from the CMS and fill the rest from the seed.
      console.error(`[CMS] Stored settings are invalid (${parsed.error.issues[0]?.path.join('.')}); merging with bundled defaults.`);
      const clean = { ...(data.data as Record<string, unknown>) };
      for (const issue of parsed.error.issues) delete clean[String(issue.path[0])];
      const merged = siteSchema.safeParse({ ...(seed as object), ...clean });
      return merged.success ? merged.data : siteSchema.parse(seed);
    },
    ['cms', 'site'],
    { tags: ['content:site'], revalidate: 60 }
  );
  return withSeedFallback('settings', cached, () => siteSchema.parse(seed));
}

export async function readCountryAssignments() {
  return unstable_cache(async () => {
    if (!hasDatabase()) return null;
    const db=database();
    const all=async(table:string)=>{const rows:{committee_slug:string;country:string}[]=[];for(let offset=0;;offset+=500){const {data,error}=await db.from(table).select('committee_slug,country').order('committee_slug').order('country').range(offset,offset+499);if(error)throw error;rows.push(...data);if(data.length<500)break;}return rows;};
    try {
      const [allocations,reservations]=await Promise.all([all('allocations'),all('country_reservations')]);
      return {allocations,reservations};
    }catch{return null;}
  },['country-assignments'],{tags:['content:committees'],revalidate:60})();
}
