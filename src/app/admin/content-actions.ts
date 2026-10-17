'use server';
import { unstable_rethrow } from 'next/navigation';
import { updateTag, revalidatePath } from 'next/cache';
import { z } from 'zod';
import { checkContentLinks } from '@/lib/server/admin/content-validation';
import { requirePermission } from '@/lib/server/admin/auth';
import { requireAdmin } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { validateEntry, siteSchema, isCollection } from '@/lib/content/registry';
import { canEvent } from '@/lib/server/admin/permissions';
import { eventOfEntry } from '@/lib/server/admin/scope';

const OUT_OF_SCOPE = 'This entry belongs to an event outside your access.';

export async function saveContent(input: unknown) {
  try {
    const entry = validateEntry(input);
    const user = await requirePermission(entry.collection, true);
    if (!canEvent(user, eventOfEntry(entry.collection, entry.data))) return { error: OUT_OF_SCOPE };
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
    if(entries.some(e=>!canEvent(user,eventOfEntry(e.collection,e.data))))return {error:OUT_OF_SCOPE};
    for(const entry of entries)await checkContentLinks(entry);
    const {error}=await database().rpc('save_content_batch',{p_entries:entries,p_actor:user.user_id});
    if(error)return {error:error.code==='P0001'?error.message:'Batch not saved. Check IDs, versions and pin conflicts.'};
    updateTag(`content:${collection}`);revalidatePath('/', 'layout');revalidatePath('/admin','layout');return {success:true};
  }catch(error){unstable_rethrow(error);return {error:'Invalid batch or insufficient permission.'};}
}

export async function cancelSchedule(collection:string,id:string,version:number){
 if(!isCollection(collection))return {error:'Unknown collection.'};
 try{
  const user=await requirePermission(collection,true);
  const {error}=await database().rpc('cancel_content_schedule',{p_collection:collection,p_id:id,p_version:version,p_actor:user.user_id});
  if(error)return {error:error.code==='P0001'&&/outside your access/.test(error.message)?OUT_OF_SCOPE:'The entry changed or its schedule could not be cancelled. Reload and try again.'};
  revalidatePath('/admin','layout');return {version:version+1};
 }catch(error){unstable_rethrow(error);return {error:'The schedule could not be cancelled. Check your permission and try again.'};}
}

type StoredEntry = { collection: string; id: string; status: string; sort_order: number; publish_at: string | null; expire_at: string | null; data: Record<string, unknown>; version: number };
/** The listed entries as stored, refusing any outside the admin's events. */
async function loadEntries(collection: string, ids: string[], user: Awaited<ReturnType<typeof requirePermission>>) {
  const { data, error } = await database().from('content_entries').select('collection,id,status,sort_order,publish_at,expire_at,data,version').eq('collection', collection).in('id', ids);
  if (error || !data || data.length !== new Set(ids).size) throw new Error('Some entries changed or are unavailable. Reload and try again.');
  const rows = data as StoredEntry[];
  if (rows.some((e) => !canEvent(user, eventOfEntry(collection, e.data)))) throw new Error(OUT_OF_SCOPE);
  return rows;
}
const publicFields = (e: StoredEntry) => ({ collection: e.collection, id: e.id, status: e.status, sort_order: e.sort_order, publish_at: e.publish_at, expire_at: e.expire_at, data: e.data, version: e.version });

/** Publishes or takes off the website several entries of one section at once. */
export async function bulkStatus(collection: string, ids: string[], mode: 'publish' | 'archive') {
  if (!isCollection(collection) || !Array.isArray(ids) || !ids.length || ids.length > 100 || !['publish', 'archive'].includes(mode)) return { error: 'Choose between 1 and 100 entries.' };
  try {
    const user = await requirePermission(collection, true);
    const entries = (await loadEntries(collection, ids, user)).map((e) => validateEntry({ ...publicFields(e), status: mode === 'publish' ? 'published' : 'archived', publish_at: null, expire_at: mode === 'publish' ? e.expire_at : null }));
    for (const entry of entries) await checkContentLinks(entry);
    const { error } = await database().rpc('save_content_batch', { p_entries: entries, p_actor: user.user_id });
    if (error) return { error: error.code === 'P0001' ? error.message : 'Not saved. Someone may have changed these entries; reload and try again.' };
    updateTag(`content:${collection}`); revalidatePath('/', 'layout'); revalidatePath('/admin', 'layout');
    return { count: entries.length };
  } catch (error) { unstable_rethrow(error); return { error: error instanceof Error && /changed|outside/.test(error.message) ? error.message : 'Not saved. Check your permission and try again.' }; }
}

/**
 * Saves a new order for the entries shown on one page. They keep the same set
 * of position numbers, so entries on other pages do not move. Published
 * entries move on the website at once; an entry with unpublished draft changes
 * moves when those are published.
 */
export async function reorderContent(collection: string, orderedIds: string[]) {
  if (!isCollection(collection) || !Array.isArray(orderedIds) || !orderedIds.length || orderedIds.length > 100) return { error: 'Nothing to reorder.' };
  try {
    const user = await requirePermission(collection, true);
    const stored = await loadEntries(collection, orderedIds, user);
    const byId = new Map(stored.map((e) => [e.id, e]));
    const numbers = stored.map((e) => e.sort_order).sort((a, b) => a - b);
    const distinct = new Set(numbers).size === numbers.length;
    const positions = distinct ? numbers : orderedIds.map((_, i) => (numbers[0] ?? 0) + i);
    const { data: live } = await database().from('effective_content').select('id,version').eq('collection', collection).in('id', orderedIds);
    const liveVersion = new Map((live ?? []).map((r) => [r.id as string, Number(r.version)]));
    let waiting = 0;
    const changed = orderedIds.map((id, i) => ({ entry: byId.get(id)!, position: positions[i] })).filter(({ entry, position }) => entry.sort_order !== position).map(({ entry, position }) => {
      // Each entry keeps its status: a published one is republished in place, a scheduled one keeps its time, a draft stays a draft.
      if (entry.status === 'draft' && liveVersion.has(entry.id)) waiting++;
      return validateEntry({ ...publicFields(entry), sort_order: position });
    });
    if (!changed.length) return { count: 0, waiting: 0 };
    const { error } = await database().rpc('save_content_batch', { p_entries: changed, p_actor: user.user_id });
    if (error) return { error: error.code === 'P0001' ? error.message : 'Order not saved. Someone may have changed these entries; reload and try again.' };
    updateTag(`content:${collection}`); revalidatePath('/', 'layout'); revalidatePath('/admin', 'layout');
    return { count: changed.length, waiting };
  } catch (error) { unstable_rethrow(error); return { error: error instanceof Error && /changed|outside/.test(error.message) ? error.message : 'Order not saved. Check your permission and try again.' }; }
}

/** Moves team members to another category, keeping each one's status (published ones update on the website). */
export async function setTeamCategory(ids: string[], group: string) {
  if (!Array.isArray(ids) || !ids.length || ids.length > 100 || typeof group !== 'string' || !group) return { error: 'Choose members and a category.' };
  try {
    const user = await requirePermission('team', true);
    const entries = (await loadEntries('team', ids, user)).filter((e) => e.data.group !== group).map((e) => validateEntry({ ...publicFields(e), data: { ...e.data, group } }));
    if (!entries.length) return { count: 0 };
    await checkContentLinks(entries[0]);
    const { error } = await database().rpc('save_content_batch', { p_entries: entries, p_actor: user.user_id });
    if (error) return { error: error.code === 'P0001' ? error.message : 'Not saved. Someone may have changed these members; reload and try again.' };
    updateTag('content:team'); revalidatePath('/', 'layout'); revalidatePath('/admin', 'layout');
    return { count: entries.length };
  } catch (error) { unstable_rethrow(error); return { error: error instanceof Error && /category|changed|outside/.test(error.message) ? error.message : 'Not saved. Check your permission and try again.' }; }
}
