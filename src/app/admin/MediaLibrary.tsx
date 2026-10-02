import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { PendingUpload } from './PendingUpload';
import { requirePermission } from '@/lib/server/admin/auth';
import { readAll } from '@/lib/server/admin/read-all';
import { database } from '@/lib/server/supabase';
import { can } from '@/lib/server/admin/permissions';
import { isCollection } from '@/lib/content/registry';
import { DeleteMedia } from './DeleteMedia';
import { CopyLink } from './CopyLink';
import { COLLECTION_INFO, entryTitle } from './collection-info';

const kb = (size: number) => (size >= 1048576 ? `${(size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`);

/** Every uploaded file as a card: what it is, where it is used, and what you can do with it. */
export async function MediaLibrary({ search = '' }: { search?: string }) {
  const user = await requirePermission('media');
  const write = can(user, 'media', true);
  const [assets, entries] = await Promise.all([readAll('media_assets'), readAll('content_entries', 'collection,id,data')]);
  const storage = database().storage.from('media');
  const q = search.trim().toLowerCase();
  const shown = assets
    .filter((asset) => !q || String(asset.alt).toLowerCase().includes(q))
    .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));
  const ready = shown.filter((asset) => asset.state === 'available');
  const unfinished = shown.filter((asset) => asset.state !== 'available');

  return <>
    {unfinished.length > 0 && <section className="admin-panel" aria-labelledby="pending-title">
      <h2 id="pending-title">Needs attention</h2>
      <p className="admin-muted">These uploads did not finish, so they cannot be used yet. Retry the check or remove them.</p>
      <ul className="media-pending">{unfinished.map((asset) => <li key={String(asset.id)}>
        <strong>{String(asset.alt)}</strong>
        {asset.uploaded_by === user.user_id && write ? <PendingUpload path={String(asset.path)} /> : <small className="admin-muted">Waiting for the person who uploaded it.</small>}
      </li>)}</ul>
    </section>}

    <section aria-labelledby="library-title">
      <h2 id="library-title" className="admin-section-title">{ready.length} {ready.length === 1 ? 'file' : 'files'} in the library</h2>
      {ready.length ? <ul className="media-grid">
        {ready.map((asset) => {
          const url = storage.getPublicUrl(String(asset.path)).data.publicUrl;
          const used = entries.filter((e) => isCollection(String(e.collection)) && can(user, String(e.collection)) && JSON.stringify(e.data).includes(url));
          const image = String(asset.mime).startsWith('image/');
          return <li key={String(asset.id)} className="media-card">
            <a className="media-card__thumb" href={url} target="_blank" rel="noreferrer" aria-label={`Open ${asset.alt}`}>
              {image ? <Image src={url} alt="" aria-hidden="true" fill sizes="(max-width: 700px) 50vw, 240px" unoptimized /> : <FileText size={34} aria-hidden="true" />}
            </a>
            <div className="media-card__body">
              <strong>{String(asset.alt)}</strong>
              <small>{String(asset.mime) === 'application/pdf' ? 'PDF' : String(asset.mime).replace('image/', '').toUpperCase()} · {kb(Number(asset.size))}</small>
              <small className="media-card__used">{used.length
                ? <>Used in {used.map((e, i) => <span key={`${e.collection}/${e.id}`}>{i > 0 && ', '}<Link href={`/admin/content/${e.collection}/${e.id}`}>{entryTitle(e.data as Record<string, unknown>, String(e.id))}</Link> <span className="admin-muted">({COLLECTION_INFO[e.collection as keyof typeof COLLECTION_INFO].singular})</span></span>)}</>
                : 'Not used yet'}</small>
            </div>
            <div className="media-card__actions">
              <CopyLink url={url} label={String(asset.alt)} />
              {write && !used.length && <DeleteMedia id={String(asset.id)} />}
            </div>
          </li>;
        })}
      </ul> : <div className="admin-empty"><p><strong>{q ? 'Nothing matches that search.' : 'No files yet.'}</strong></p>{!q && <p>Upload images and PDFs above. You can also upload straight from any image field while editing.</p>}</div>}
    </section>
  </>;
}
