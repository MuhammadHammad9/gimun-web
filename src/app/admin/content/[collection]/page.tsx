import Link from 'next/link';
import { z } from 'zod';
import { ExternalLink, Plus, Search } from 'lucide-react';
import { registry } from '@/lib/content/registry';
import { BulkContentEditor } from '../../BulkContentEditor';
import type { Schema } from '../../SchemaForm';
import { notFound } from 'next/navigation';
import { copyPages, isCollection } from '@/lib/content/registry';
import { requirePermission } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { EmergencyEditor } from '../../EmergencyEditor';
import { AdminNav } from '../../AdminNav';
import { AdminPageHeader } from '../../AdminPageHeader';
import { COLLECTION_INFO, entrySummary, entryTitle } from '../../collection-info';
import { toSerializable } from '../../serializable';
import { scopeEvent } from '@/lib/server/admin/scope';
import { ContentRows, type ContentRow } from '../../ContentRows';
import { teamCategories } from '@/lib/server/admin/read-all';

/** Tabs over the stored status: what was last done to each entry. */
const TABS = [{ key: '', label: 'All' }, { key: 'published', label: 'On website' }, { key: 'draft', label: 'Drafts' }, { key: 'archived', label: 'Off website' }] as const;

type Row = { id: string; status: string; version: number; publish_at: string | null; updated_at?: string; data: Record<string, unknown> };

/** Where one entry stands relative to the public website, in plain words. */
function standing(row: Row, liveVersion: number | undefined) {
  if (row.status === 'published' && row.publish_at && new Date(row.publish_at) > new Date()) return { tone: 'info', text: 'Scheduled' };
  if (liveVersion && liveVersion >= row.version) return { tone: 'live', text: 'On website' };
  if (liveVersion) return { tone: 'warn', text: 'Changes not published' };
  if (row.status === 'archived') return { tone: 'neutral', text: 'Off website' };
  return { tone: 'warn', text: 'Draft' };
}

const looksLikeImage = (url: unknown) => typeof url === 'string' && /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(url);

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ collection: string }>; searchParams: Promise<{ page?: string | string[]; q?: string | string[]; section?: string | string[]; status?: string | string[]; group?: string | string[] }> }) {
  const { collection } = await params;
  if (!isCollection(collection)) notFound();
  const user = await requirePermission(collection);
  const info = COLLECTION_INFO[collection];
  // A repeated parameter (?q=a&q=b) arrives as an array; use the first value.
  const raw = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  const query = { page: one(raw.page), q: one(raw.q), section: one(raw.section), status: one(raw.status), group: one(raw.group) };
  const categories = collection === 'team' ? await teamCategories() : [];
  const group = categories.some((c) => c.id === query.group) ? query.group : '';
  const status = TABS.some((t) => t.key && t.key === query.status) ? query.status : '';
  const page = Math.max(0, Math.min(100000, Math.floor(Number(query.page) || 0)));
  // Entries with another event's track are outside this admin's access; shared ones stay.
  let entries = scopeEvent(database().from('content_entries').select('*', { count: 'exact' }).eq('collection', collection).is('deleted_at', null), user, 'data->>track');
  const search = (query.q || '').replace(/[%_,()]/g, '').slice(0, 100);
  const copyPage = collection === 'copy' && (copyPages as readonly string[]).includes(query.section || '') ? query.section! : '';
  if (copyPage) entries = entries.eq('data->>page', copyPage);
  if (status) entries = entries.eq('status', status);
  if (group) entries = entries.eq('data->>group', group);
  if (search) entries = entries.or(['title', 'name', 'label', 'question', 'awardName'].map((k) => `data->>${k}.ilike.%${search}%`).join(','));
  const { data, error, count } = await entries.order('sort_order').order('id').range(page * 50, page * 50 + 49);
  if (error) throw new Error('Unable to load content. Apply the CMS migrations and seed first.');
  const rows = (data ?? []) as Row[];
  const live = await database().from('effective_content').select('id,version').eq('collection', collection).in('id', rows.map((e) => e.id));
  const liveVersions = new Map((live.data ?? []).map((r) => [r.id as string, Number(r.version)]));
  const navigationLive = collection === 'navigation' ? (await database().from('effective_content').select('id', { count: 'exact', head: true }).eq('collection', 'navigation')).count : null;
  const activePin = collection === 'schedule' ? await database().from('effective_content').select('id').eq('collection', 'announcements').eq('data->>pinnedFlag', 'true').maybeSingle() : { data: null };
  const { data: pinned } = activePin.data ? await database().from('content_entries').select('*').eq('collection', 'announcements').eq('id', activePin.data.id).single() : { data: null };
  const write = can(user, collection, true);
  const onSite = rows.filter((r) => liveVersions.has(r.id)).length;
  const pageQuery = (n: number) => `?page=${n}&q=${encodeURIComponent(search)}&section=${copyPage}&status=${status}&group=${group}`;
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const tabCounts = await Promise.all(TABS.map(async (t) => {
    let q = database().from('content_entries').select('id', { count: 'exact', head: true }).eq('collection', collection).is('deleted_at', null);
    q = scopeEvent(q, user, 'data->>track');
    if (copyPage) q = q.eq('data->>page', copyPage);
    if (t.key) q = q.eq('status', t.key);
    return (await q).count ?? 0;
  }));
  const listRows: ContentRow[] = rows.map((row) => {
    const state = standing(row, liveVersions.get(row.id));
    const picture = info.media ? row.data[info.media] : undefined;
    const summary = collection === 'team' ? [entrySummary(collection, row.data), categoryName.get(String(row.data.group)) ?? 'No category'].filter(Boolean).join(' · ') : entrySummary(collection, row.data);
    return { id: row.id, title: collection === 'copy' && typeof row.data.label === 'string' ? row.data.label : entryTitle(row.data, row.id), summary, picture: looksLikeImage(picture) ? String(picture) : null, hasMedia: Boolean(info.media), tone: state.tone, state: state.text };
  });

  return <>
    <AdminNav user={user} />
    <AdminPageHeader
      title={info.label}
      description={info.description}
      actions={<>
        <a className="admin-button admin-button--ghost" href={info.path} target="_blank" rel="noopener"><ExternalLink size={15} aria-hidden="true" /> View on website</a>
        {write && <Link className="admin-button" href={`/admin/content/${collection}/new`}><Plus size={16} aria-hidden="true" /> Add {info.singular}</Link>}
      </>}
    />
    {navigationLive === 0 && <p className="admin-callout" role="note">No menu links are published, so the website is showing its built-in menu. Publish at least one link to use your own.</p>}
    {['results', 'gallery'].includes(collection) && write && <BulkContentEditor collection={collection} schema={toSerializable(z.toJSONSchema(registry[collection])) as Schema} />}
    {collection === 'schedule' && can(user, 'schedule', true) && can(user, 'announcements', true) && <EmergencyEditor sessions={data} pinned={pinned} />}

    <section className="admin-list" aria-label={`${info.label} entries`}>
      <form className="admin-list__tools" role="search">
        <label className="admin-search"><span className="sr-only">Search {info.label.toLowerCase()}</span><Search size={16} aria-hidden="true" /><input name="q" defaultValue={query.q} placeholder={`Search ${info.label.toLowerCase()}`} /></label>
        {collection === 'copy' && <label className="admin-list__filter"><span className="sr-only">Page</span><select name="section" defaultValue={copyPage}><option value="">All pages</option>{copyPages.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1).replaceAll('-', ' ')}</option>)}</select></label>}
        <button className="secondary">Search</button>
        <p className="admin-list__count">{count ?? 0} {count === 1 ? info.singular : `${info.singular}s`}{rows.length ? ` · ${onSite} on the website` : ''}</p>
      </form>

      <nav className="admin-status-tabs" aria-label="Filter by status">{TABS.map((t, i) => <Link key={t.key} href={`?q=${encodeURIComponent(search)}&section=${copyPage}&status=${t.key}&group=${group}`} aria-current={status === t.key ? 'page' : undefined}>{t.label}<small>{tabCounts[i]}</small></Link>)}</nav>
      {categories.length > 0 && <nav className="admin-status-tabs" aria-label="Filter by category"><Link href={`?q=${encodeURIComponent(search)}&status=${status}`} aria-current={!group ? 'page' : undefined}>All categories</Link>{categories.map((c) => <Link key={c.id} href={`?q=${encodeURIComponent(search)}&status=${status}&group=${c.id}`} aria-current={group === c.id ? 'page' : undefined}>{c.name}</Link>)}<Link href="/admin/content/team-groups">Manage categories</Link></nav>}
      {rows.length ? <ContentRows collection={collection} rows={listRows} write={write} singular={info.singular} reorderable={!search && !status} categories={categories} /> : <div className="admin-empty">
        <p><strong>{search || copyPage || status ? 'Nothing matches.' : `No ${info.label.toLowerCase()} yet.`}</strong></p>
        {!search && !copyPage && !status && write && <p>Add the first {info.singular}; it appears on the website once you publish it.</p>}
        {!search && !copyPage && !status && write && <Link className="admin-button" href={`/admin/content/${collection}/new`}><Plus size={16} aria-hidden="true" /> Add {info.singular}</Link>}
      </div>}

      {(page > 0 || (count || 0) > (page + 1) * 50) && <nav className="admin-pagination" aria-label="Pages">
        {page > 0 && <Link href={pageQuery(page - 1)}>Previous page</Link>}
        <span>Page {page + 1}</span>
        {(count || 0) > (page + 1) * 50 && <Link href={pageQuery(page + 1)}>Next page</Link>}
      </nav>}
    </section>
  </>;
}
