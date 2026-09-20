import 'server-only';
import { unstable_cache } from 'next/cache';
import { database, hasDatabase } from '@/lib/server/supabase';
import { registry, siteSchema, type Collection } from './registry';

// Empty collections are intentional (e.g. all entries unpublished), not a reason
// to resurrect bundled data. Missing settings indicates the CMS was never seeded.
export async function contentHealth() {
  if (!hasDatabase()) return { fallback: true, reason: 'Database is not configured.' };
  try {
    const { data, error } = await database().from('site_settings').select('id').eq('id', 'site').maybeSingle();
    return { fallback: Boolean(error || !data), reason: error ? 'CMS is unavailable.' : !data ? 'CMS has not been seeded.' : '' };
  } catch { return { fallback: true, reason: 'CMS is unavailable.' }; }
}
export async function readCollection<T>(collection: Collection, seed: T[]): Promise<T[]> {
  return unstable_cache(async () => {
    if ((await contentHealth()).fallback) return seed;
    try {
      const now = new Date().toISOString();
      const data: {data:unknown;publish_at:string|null;expire_at:string|null}[]=[];
      for(let offset=0;;offset+=500){
        const result=await database().from('content_entries').select('data,publish_at,expire_at').eq('collection',collection).eq('status','published').order('sort_order').order('id').range(offset,offset+499);
        if(result.error)throw result.error;data.push(...result.data);if(result.data.length<500)break;
      }
      return (data || []).filter(e => (!e.publish_at || e.publish_at <= now) && (!e.expire_at || e.expire_at > now)).map(e => registry[collection].parse(e.data)) as T[];
    } catch { console.warn(`[CMS] Serving seed fallback for ${collection}`); return seed; }
  }, ['cms', collection], { tags: [`content:${collection}`, 'content:site'], revalidate: 60 })();
}
export async function readSite(seed: unknown) {
  return unstable_cache(async () => {
    if (hasDatabase()) {
      try {
        const { data, error } = await database().from('site_settings').select('data').eq('id', 'site').maybeSingle();
        if (!error && data) return siteSchema.parse(data.data);
      } catch { console.warn('[CMS] Serving seed settings'); }
    }
    return siteSchema.parse(seed);
  }, ['cms', 'site'], { tags: ['content:site'], revalidate: 60 })();
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
