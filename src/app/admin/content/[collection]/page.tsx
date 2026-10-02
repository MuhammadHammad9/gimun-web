import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import { ExternalLink, FileText, Plus, Search } from 'lucide-react';
import { registry } from '@shared/lib/content/registry';
import { BulkContentEditor } from '../../BulkContentEditor';
import type { Schema } from '../../SchemaForm';
import { notFound } from 'next/navigation';
import { copyPages, isCollection } from '@shared/lib/content/registry';
import { requirePermission } from '@backend/server/admin/auth';
import { can } from '@backend/server/admin/permissions';
import { database } from '@backend/server/supabase';
import { EmergencyEditor } from '../../EmergencyEditor';
import { AdminNav } from '../../AdminNav';
import { AdminPageHeader } from '../../AdminPageHeader';
import { COLLECTION_INFO, entrySummary, entryTitle } from '../../collection-info';
import { toSerializable } from '../../serializable';

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

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ collection: string }>; searchParams: Promise<{ page?: string | string[]; q?: string | string[]; section?: string | string[] }> }) {
  const { collection } = await params;
  if (!isCollection(collection)) notFound();
  const user = await requirePermission(collection);
  const info = COLLECTION_INFO[collection];
  // A repeated parameter (?q=a&q=b) arrives as an array; use the first value.
  const raw = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  const query = { page: one(raw.page), q: one(raw.q), section: one(raw.section) };
  const page = Math.max(0, Math.min(100000, Math.floor(Number(query.page) || 0)));
  let entries = database().from('content_entries').select('*', { count: 'exact' }).eq('collection', collection);
  const search = (query.q || '').replace(/[%_,()]/g, '').slice(0, 100);
  const copyPage = collection === 'copy' && (copyPages as readonly string[]).includes(query.section || '') ? query.section! : '';
  if (copyPage) entries = entries.eq('data->>page', copyPage);
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
  const pageQuery = (n: number) => `?page=${n}&q=${encodeURIComponent(search)}&section=${copyPage}`;

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

      {rows.length ? <ul className="admin-rows">
        {rows.map((row) => {
          const state = standing(row, liveVersions.get(row.id));
          const picture = info.media ? row.data[info.media] : undefined;
          const title = collection === 'copy' && typeof row.data.label === 'string' ? row.data.label : entryTitle(row.data, row.id);
          return <li key={row.id}>
            <Link className="admin-row" href={`/admin/content/${collection}/${row.id}`}>
              {info.media && <span className="admin-row__thumb">{looksLikeImage(picture) ? <Image src={String(picture)} alt="" aria-hidden="true" fill sizes="64px" unoptimized /> : <FileText size={20} aria-hidden="true" />}</span>}
              <span className="admin-row__text"><strong>{title}</strong><small>{entrySummary(collection, row.data)}</small></span>
              <span className={`admin-pill admin-pill--${state.tone}`}>{state.text}</span>
            </Link>
          </li>;
        })}
      </ul> : <div className="admin-empty">
        <p><strong>{search || copyPage ? 'Nothing matches that search.' : `No ${info.label.toLowerCase()} yet.`}</strong></p>
        {!search && !copyPage && write && <p>Add the first {info.singular}; it appears on the website once you publish it.</p>}
        {!search && !copyPage && write && <Link className="admin-button" href={`/admin/content/${collection}/new`}><Plus size={16} aria-hidden="true" /> Add {info.singular}</Link>}
      </div>}

      {(page > 0 || (count || 0) > (page + 1) * 50) && <nav className="admin-pagination" aria-label="Pages">
        {page > 0 && <Link href={pageQuery(page - 1)}>Previous page</Link>}
        <span>Page {page + 1}</span>
        {(count || 0) > (page + 1) * 50 && <Link href={pageQuery(page + 1)}>Next page</Link>}
      </nav>}
    </section>
  </>;
}
