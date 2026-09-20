'use server';
import { updateTag } from 'next/cache';
import { requirePermission } from '@/lib/server/admin/auth';
import { requireAdmin } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { validateEntry, siteSchema, isCollection } from '@/lib/content/registry';

export async function saveContent(input: unknown) {
  try {
    const entry = validateEntry(input);
    const user = await requirePermission(entry.collection, true);
    const { error } = await database().rpc('save_content', { p_entry: entry, p_actor: user.user_id });
    if (error) return { error: error.message.includes('changed') ? error.message : 'Unable to save. Check for a conflicting ID or pinned announcement.' };
    updateTag(`content:${entry.collection}`);
    return { version: entry.version + 1, entry: { ...entry, version: entry.version + 1 } };
  } catch { return { error: 'Invalid content or insufficient permission. Check all fields.' }; }
}
export async function saveSettings(input: unknown, version: number) {
  try {
    const user = await requirePermission('settings', true);
    const data = siteSchema.parse(input);
    if (data.eventDates.end < data.eventDates.start) return { error: 'Event end must be after the start.' };
    if(data.mootScoring && data.mootScoring.memorialWeight+data.mootScoring.oralWeight!==100)return {error:'Moot scoring weights must total 100.'};
    if(data.gimunRubric?.length && data.gimunRubric.reduce((n,r)=>n+r.weight,0)!==100)return {error:'GIMUN rubric weights must total 100.'};
    const { error } = await database().rpc('save_content', { p_entry: { collection: 'site', id: 'site', data, version }, p_actor: user.user_id });
    if (error) return { error: 'Settings changed or could not be saved. Reload and try again.' };
    updateTag('content:site');
    return { version: version + 1, data };
  } catch { return { error: 'Invalid settings or insufficient permission.' }; }
}
export async function restoreRevision(id: number, version: number) {
  await requireAdmin();
  const { data, error } = await database().from('content_revisions').select('*').eq('id', id).single();
  if (error || !data) return { error: 'Revision unavailable.' };
  await requirePermission(data.collection === 'site' ? 'settings' : data.collection, true);
  if (data.collection === 'site') return saveSettings(data.snapshot.data, version);
  if (!isCollection(data.collection)) return { error: 'Invalid collection.' };
  return saveContent({ ...data.snapshot, version });
}
export async function saveContentBatch(input: unknown[]) {
  if(!Array.isArray(input)||!input.length||input.length>100)return {error:'Save between 1 and 100 entries per batch.'};
  try{
    const entries=input.map(validateEntry);const collection=entries[0].collection;
    if(entries.some(e=>e.collection!==collection))return {error:'Batch must belong to one section.'};
    const user=await requirePermission(collection,true);
    const {error}=await database().rpc('save_content_batch',{p_entries:entries,p_actor:user.user_id});
    if(error)return {error:'Batch not saved. Check IDs, versions and pin conflicts.'};
    updateTag(`content:${collection}`);return {success:true};
  }catch{return {error:'Invalid batch or insufficient permission.'};}
}
