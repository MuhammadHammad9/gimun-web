import 'server-only';
import { isCollection } from '@/lib/content/registry';
import { COLLECTION_INFO, entryTitle } from '@/app/admin/collection-info';
import { database } from '../supabase';
import { can, canPurge, type AdminUser, type EventId } from './permissions';
import { eventOfEntry, eventOfTrack, scopeEvent } from './scope';
import { readAll } from './read-all';

/** What can go to Trash, besides website content (kind "content"). */
export const TRASH_KINDS = {
  inbox: { label: 'Message', section: 'inbox', table: 'contact_messages', title: 'name', scoped: true },
  template: { label: 'Email template', section: 'email', table: 'email_templates', title: 'subject', scoped: false },
  survey: { label: 'Survey question', section: 'feedback', table: 'survey_questions', title: 'label', scoped: false },
  archive: { label: 'Archive snapshot', section: 'close-out', table: 'event_archives', title: 'name', scoped: false },
  media: { label: 'File', section: 'media', table: 'media_assets', title: 'alt', scoped: false },
  certificate: { label: 'Revoked certificate', section: 'certificates', table: 'certificates', title: 'serial', scoped: true },
} as const;
export type TrashKind = 'content' | keyof typeof TRASH_KINDS;
export const isTrashKind = (kind: string): kind is TrashKind => kind === 'content' || Object.hasOwn(TRASH_KINDS, kind);
export type TrashKey = { collection?: string; id: string };

/** The section whose permissions govern an item. */
export function trashSection(kind: TrashKind, key: TrashKey) {
  if (kind === 'content') return key.collection && isCollection(key.collection) ? key.collection : null;
  return TRASH_KINDS[kind].section;
}

export type TrashItem = { kind: TrashKind; key: TrashKey; title: string; type: string; event: EventId | null; deletedAt: string; deletedBy: string; canRestore: boolean; canPurge: boolean; href?: string };

/** Everything in Trash this admin may see, newest first. */
export async function listTrash(user: AdminUser): Promise<TrashItem[]> {
  const staff = new Map((await readAll('admin_users', 'user_id,display_name', 'user_id')).map((u) => [String(u.user_id), String(u.display_name)]));
  const who = (id: unknown) => (id ? staff.get(String(id)) ?? 'A removed account' : 'Unknown');
  const items: TrashItem[] = [];

  let base = database().from('content_entries').select('collection,id,data,deleted_at,deleted_by');
  base = scopeEvent(base, user, 'data->>track');
  const { data: found } = await base.not('deleted_at', 'is', null).order('deleted_at', { ascending: false }).limit(500);
  const entries = (found ?? []) as unknown as Record<string, unknown>[];
  for (const e of entries) {
    const collection = String(e.collection);
    if (!isCollection(collection) || !can(user, collection)) continue;
    const data = (e.data ?? {}) as Record<string, unknown>;
    const event = eventOfEntry(collection, data);
    items.push({ kind: 'content', key: { collection, id: String(e.id) }, title: entryTitle(data, String(e.id)), type: COLLECTION_INFO[collection].label, event, deletedAt: String(e.deleted_at), deletedBy: who(e.deleted_by), canRestore: can(user, collection, true), canPurge: canPurge(user, collection, event), href: `/admin/content/${collection}/${encodeURIComponent(String(e.id))}` });
  }

  for (const [kind, info] of Object.entries(TRASH_KINDS) as [keyof typeof TRASH_KINDS, (typeof TRASH_KINDS)[keyof typeof TRASH_KINDS]][]) {
    if (!can(user, info.section)) continue;
    let query = database().from(info.table).select(`id,${info.title},deleted_at,deleted_by${info.scoped ? ',event' : ''}`).not('deleted_at', 'is', null).order('deleted_at', { ascending: false }).limit(500);
    if (info.scoped) query = scopeEvent(query, user, 'event', kind === 'inbox');
    const { data } = await query;
    for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
      const event = info.scoped ? eventOfTrack(row.event) : null;
      items.push({ kind, key: { id: String(row.id) }, title: String(row[info.title] || row.id), type: info.label, event, deletedAt: String(row.deleted_at), deletedBy: who(row.deleted_by), canRestore: can(user, info.section, true), canPurge: canPurge(user, info.section, event), href: kind === 'inbox' ? `/admin/inbox/${row.id}` : undefined });
    }
  }
  return items.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}
