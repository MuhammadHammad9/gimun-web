'use server';
import { z } from 'zod';
import { revalidatePath, updateTag } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { requireAdmin, requirePermission, stepUpNeeded } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { someRow } from '@/lib/server/admin/read-all';
import { isTrashKind, listTrash, trashSection, type TrashKey, type TrashKind } from '@/lib/server/admin/trash';

type Result = { error?: string; result?: string; stepUp?: 'code' | 'enrol' };
const keySchema = z.object({ collection: z.string().max(60).optional(), id: z.string().min(1).max(200) });

/** The messages the database raises for people, passed through as they are. */
function message(error: { code?: string; message: string } | null, fallback: string) {
  return error?.code === 'P0001' && /permission|Trash|Still used|allocations|no longer exists|Only owners|Restore it/.test(error.message) ? error.message : fallback;
}
function parse(kind: string, key: unknown): { kind: TrashKind; key: TrashKey; section: string } {
  if (!isTrashKind(kind)) throw new Error('Unknown item.');
  const parsed = keySchema.parse(key);
  const section = trashSection(kind, parsed);
  if (!section) throw new Error('Unknown item.');
  return { kind, key: parsed, section };
}
function refresh(kind: TrashKind, key: TrashKey) {
  if (kind === 'content' && key.collection) { updateTag(`content:${key.collection}`); revalidatePath('/', 'layout'); }
  revalidatePath('/admin', 'layout');
}

/** A file still shown on the website cannot go to Trash; old revisions do not count. */
async function mediaInUse(id: string) {
  const { data: asset } = await database().from('media_assets').select('path').eq('id', id).maybeSingle();
  if (!asset) return false;
  const needle = String(asset.path);
  const uses = (row: Record<string, unknown>) => !row.deleted_at && JSON.stringify(row).includes(needle);
  for (const [table, select, order] of [['content_entries', 'collection,id,data,deleted_at', 'id'], ['site_settings', 'data', 'id'], ['effective_content', 'collection,id,data', 'id']] as const) {
    if (await someRow(table, select, order, uses)) return true;
  }
  return false;
}

export async function trashItem(kind: string, key: unknown): Promise<Result> {
  try {
    const item = parse(kind, key);
    const user = await requirePermission(item.section, true);
    if (item.kind === 'media' && await mediaInUse(item.key.id)) return { error: 'This file is used on the website. Replace it there first, then move it to Trash.' };
    const { error } = await database().rpc('trash_item', { p_kind: item.kind, p_key: item.key, p_actor: user.user_id });
    if (error) return { error: message(error, 'It could not be moved to Trash. Reload and try again.') };
    refresh(item.kind, item.key);
    return { result: item.kind === 'certificate' ? 'Certificate revoked. Its verification link now says so.' : 'Moved to Trash.' };
  } catch (error) { unstable_rethrow(error); return { error: 'It could not be moved to Trash. Check your permission.' }; }
}

export async function restoreItem(kind: string, key: unknown): Promise<Result> {
  try {
    const item = parse(kind, key);
    const user = await requirePermission(item.section, true);
    const { error } = await database().rpc('restore_item', { p_kind: item.kind, p_key: item.key, p_actor: user.user_id });
    if (error) return { error: message(error, 'It could not be restored. Reload and try again.') };
    refresh(item.kind, item.key);
    return { result: item.kind === 'content' ? 'Restored. It is off the website until you publish it.' : 'Restored.' };
  } catch (error) { unstable_rethrow(error); return { error: 'It could not be restored. Check your permission.' }; }
}

/** Deletes one item permanently: owners and in-scope admins, with a fresh code and the item's name typed. */
export async function purgeItem(kind: string, key: unknown, typed: string): Promise<Result> {
  try {
    const item = parse(kind, key);
    const user = await requirePermission(item.section, true);
    const step = await stepUpNeeded(); if (step) return { stepUp: step };
    const target = (await listTrash(user)).find((t) => t.kind === item.kind && t.key.id === item.key.id && (t.key.collection ?? '') === (item.key.collection ?? ''));
    if (!target) return { error: 'This item is not in Trash any more.' };
    if (!target.canPurge) return { error: 'Only owners, and admins for their own event, can delete permanently.' };
    if (typed.trim() !== target.title.trim()) return { error: 'Type the name exactly to confirm.' };
    const { data: path, error } = await database().rpc('purge_item', { p_kind: item.kind, p_key: item.key, p_actor: user.user_id });
    if (error) return { error: message(error, 'It could not be deleted. Reload and try again.') };
    if (typeof path === 'string' && path) {
      const removed = await database().storage.from('media').remove([path]);
      if (removed.error) console.error('[Trash] Stored file left behind', path);
    }
    refresh(item.kind, item.key);
    return { result: `“${target.title}” was deleted permanently.` };
  } catch (error) { unstable_rethrow(error); return { error: 'It could not be deleted. Check your permission.' }; }
}

/** Deletes everything in Trash the admin may delete; items still in use stay. */
export async function emptyTrash(typed: string): Promise<Result> {
  try {
    // Any admin may open Trash; each item's own rights decide what goes.
    const user = await requireAdmin();
    const step = await stepUpNeeded(); if (step) return { stepUp: step };
    if (typed.trim() !== 'Empty Trash') return { error: 'Type Empty Trash to confirm.' };
    const items = (await listTrash(user)).filter((t) => t.canPurge);
    if (!items.length) return { error: 'There is nothing in Trash you can delete permanently.' };
    let deleted = 0; const kept: string[] = [];
    for (const item of items) {
      const { data: path, error } = await database().rpc('purge_item', { p_kind: item.kind, p_key: item.key, p_actor: user.user_id });
      if (error) { kept.push(item.title); continue; }
      deleted++;
      if (typeof path === 'string' && path) await database().storage.from('media').remove([path]);
      if (item.kind === 'content' && item.key.collection) updateTag(`content:${item.key.collection}`);
    }
    revalidatePath('/', 'layout'); revalidatePath('/admin', 'layout');
    return kept.length ? { result: `${deleted} deleted permanently. Kept because they are still in use: ${kept.slice(0, 5).join(', ')}${kept.length > 5 ? ` and ${kept.length - 5} more` : ''}.` } : { result: `${deleted} ${deleted === 1 ? 'item' : 'items'} deleted permanently.` };
  } catch (error) { unstable_rethrow(error); return { error: 'Trash could not be emptied. Check your permission.' }; }
}
