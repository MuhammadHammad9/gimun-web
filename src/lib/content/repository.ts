import 'server-only';
import { cache } from 'react';
import { database, hasDatabase } from '@/lib/server/supabase';
import { registry, siteSchema, type Collection } from './registry';

type Health = { fallback: boolean; reason: string; transient: boolean };
export const contentHealth = cache(async (): Promise<Health> => {
  if (process.env.CMS_BACKEND === 'bundled' || !hasDatabase()) return { fallback: true, reason: 'Demonstration mode: website content is bundled. Admin edits are not public.', transient: false };
  try {
    const { data, error } = await database().from('site_settings').select('id').eq('id','site').maybeSingle();
    return error ? { fallback:true, reason:'Website connection unavailable.', transient:true } : { fallback:!data, reason:data?'':'Content has not been seeded.', transient:false };
  } catch { return { fallback:true, reason:'Website connection unavailable.', transient:true }; }
});
// Last successful values are only an outage fallback, never the normal read path.
// React cache deduplicates within a request; no cross-request publication cache.
const lastGood = new Map<string, unknown>();
export const readCollection = cache(async <T,>(collection: Collection, seed: T[]): Promise<T[]> => {
  const health = await contentHealth();
  if (health.fallback) return health.transient ? (lastGood.get(collection) as T[] | undefined) ?? seed : seed;
  try {
    const entries:T[]=[];
    for(let offset=0;;offset+=500){
      const {data,error}=await database().from('effective_content').select('id,data,version').eq('collection',collection).order('sort_order').order('id').range(offset,offset+499);
      if(error)throw error;
      for(const row of data){const parsed=registry[collection].safeParse(row.data);if(parsed.success)entries.push({...parsed.data,...(collection==='announcements'?{publicationVersion:row.version}:{})} as T);else console.warn(`[CMS] Invalid ${collection} entry ${row.id}`);}
      if(data.length<500)break;
    }
    lastGood.set(collection,entries);return entries;
  } catch { console.warn(`[CMS] ${collection} unavailable; serving last known content.`);return (lastGood.get(collection) as T[] | undefined)??seed; }
});
export const readSite=cache(async(seed:unknown)=>{
  const health=await contentHealth();
  if(health.fallback)return siteSchema.parse(health.transient?lastGood.get('site')??seed:seed);
  try{
    const {data,error}=await database().from('site_settings').select('data').eq('id','site').single();
    if(error)throw error;
    const parsed=siteSchema.parse(data.data);lastGood.set('site',parsed);return parsed;
  }catch{return siteSchema.parse(lastGood.get('site')??seed);}
});
export const readCountryAssignments=cache(async()=>{
  if(!hasDatabase()||process.env.CMS_BACKEND==='bundled')return null;
  const all=async(table:string)=>{const rows:{committee_slug:string;country:string}[]=[];for(let offset=0;;offset+=500){const {data,error}=await database().from(table).select('committee_slug,country').order('committee_slug').order('country').range(offset,offset+499);if(error)throw error;rows.push(...data);if(data.length<500)break;}return rows;};
  try {const [allocations,reservations]=await Promise.all([all('allocations'),all('country_reservations')]);return {allocations,reservations};}catch{return null;}
});
