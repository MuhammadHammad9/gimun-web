'use server';
import { unstable_rethrow } from 'next/navigation';
import { updateTag, revalidatePath } from 'next/cache';
import { z } from 'zod';
import { checkContentLinks } from '@backend/server/admin/content-validation';
import { requirePermission } from '@backend/server/admin/auth';
import { requireAdmin } from '@backend/server/admin/auth';
import { database } from '@backend/server/supabase';
import { validateEntry, siteSchema, isCollection } from '@shared/lib/content/registry';

export async function saveContent(input: unknown) {
  try {
    const entry = validateEntry(input);
    const user = await requirePermission(entry.collection, true);
    try{await checkContentLinks(entry);}catch(error){return {error:error instanceof Error?error.message:'Check content references.'};}
    const { error } = await database().rpc('save_content', { p_entry: entry, p_actor: user.user_id });
    if (error) {console.error('[CMS save]',error);return {error:error.code==='P0001'?error.message:'Unable to save. Check for an existing identifier or contact an administrator.'};}
    updateTag(`content:${entry.collection}`);
    revalidatePath('/', 'layout');
    revalidatePath('/admin','layout');
    return { version: entry.version + 1, entry: { ...entry, version: entry.version + 1 } };
  } catch (error) { unstable_rethrow(error); return { fieldErrors:error instanceof z.ZodError?Object.fromEntries(error.issues.map(i=>[i.path.join('.').replace(/^data\./,''),i.message])):undefined, error: error instanceof z.ZodError ? error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ') : 'Invalid content or insufficient permission. Check all fields.' }; }
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
    revalidatePath('/', 'layout');
    return { version: version + 1, data };
  } catch (error) { unstable_rethrow(error); return { error: 'Invalid settings or insufficient permission.' }; }
}
export async function restoreRevision(id: number, version: number) {
  try {
    await requireAdmin();
    const { data, error } = await database().from('content_revisions').select('*').eq('id', id).single();
    if (error || !data) return { error: 'Revision unavailable.' };
    await requirePermission(data.collection === 'site' ? 'settings' : data.collection, true);
    // A revision whose snapshot is missing or malformed cannot be restored; say so instead of crashing the action.
    const snapshot = data.snapshot && typeof data.snapshot === 'object' ? data.snapshot as Record<string, unknown> : null;
    if (!snapshot) return { error: 'This revision has no restorable content.' };
    if (data.collection === 'site') return snapshot.data ? saveSettings(snapshot.data, version) : { error: 'This revision has no restorable settings.' };
    if (!isCollection(data.collection)) return { error: 'Invalid collection.' };
    return saveContent({ ...snapshot, version, status:'draft', publish_at:null, expire_at:null });
  } catch (error) { unstable_rethrow(error); return { error: 'Revision could not be restored. Check your permission and try again.' }; }
}
export async function saveContentBatch(input: unknown[]) {
  if(!Array.isArray(input)||!input.length||input.length>100)return {error:'Save between 1 and 100 entries per batch.'};
  try{
    const entries=input.map(validateEntry);const collection=entries[0].collection;
    if(entries.some(e=>e.collection!==collection))return {error:'Batch must belong to one section.'};
    const user=await requirePermission(collection,true);
    for(const entry of entries)await checkContentLinks(entry);
    const {error}=await database().rpc('save_content_batch',{p_entries:entries,p_actor:user.user_id});
    if(error)return {error:'Batch not saved. Check IDs, versions and pin conflicts.'};
    updateTag(`content:${collection}`);revalidatePath('/', 'layout');revalidatePath('/admin','layout');return {success:true};
  }catch(error){unstable_rethrow(error);return {error:'Invalid batch or insufficient permission.'};}
}

export async function cancelSchedule(collection:string,id:string,version:number){
 if(!isCollection(collection))return {error:'Unknown collection.'};
 try{
  const user=await requirePermission(collection,true);
  const {error}=await database().rpc('cancel_content_schedule',{p_collection:collection,p_id:id,p_version:version,p_actor:user.user_id});
  if(error)return {error:'The entry changed or its schedule could not be cancelled. Reload and try again.'};
  revalidatePath('/admin','layout');return {version:version+1};
 }catch(error){unstable_rethrow(error);return {error:'The schedule could not be cancelled. Check your permission and try again.'};}
}
