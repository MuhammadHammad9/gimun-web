'use client';
import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RotateCcw, Trash2 } from 'lucide-react';
import { emptyTrash, purgeItem, restoreItem } from './trash-actions';
import { useConfirm } from './ui/ConfirmDialog';
import { useNotice } from './ui/Notice';
import { useStepUp } from './ui/StepUp';
import type { TrashItem } from '@/lib/server/admin/trash';

const pkt = (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' });
const EVENTS: Record<string, string> = { gimun: 'GIMUN', 'moot-cup': 'GMC' };

/** Trash: restore an item, or delete it permanently (owners and admins). */
export function TrashList({ items, trashDays }: { items: TrashItem[]; trashDays: number }) {
  const [type, setType] = useState('');
  const [pending, start] = useTransition();
  const [confirm, confirmDialog] = useConfirm();
  const [guard, stepUpDialog] = useStepUp();
  const notice = useNotice();
  const router = useRouter();
  const types = useMemo(() => [...new Set(items.map((i) => i.type))].sort(), [items]);
  const shown = type ? items.filter((i) => i.type === type) : items;
  const purgeable = items.filter((i) => i.canPurge).length;
  const autoDelete = (deletedAt: string) => trashDays > 0 ? pkt(new Date(new Date(deletedAt).getTime() + trashDays * 86400000).toISOString()) : null;

  const report = (result: { error?: string; result?: string } | null) => {
    if (!result) return;
    notice({ text: result.error ?? result.result ?? 'Done.', tone: result.error ? 'error' : 'success' });
    if (!result.error) router.refresh();
  };
  async function purge(item: TrashItem) {
    if (!(await confirm({ title: `Delete “${item.title}” permanently?`, tone: 'danger', confirmLabel: 'Delete forever', typeToConfirm: item.title,
      body: 'This cannot be undone: it is removed from the database for good. The activity log keeps one line saying what was deleted and by whom.',
      impact: item.kind === 'content' ? ['Removes every saved version and its publication history'] : item.kind === 'media' ? ['Removes the stored file'] : item.kind === 'inbox' ? ['Removes the message and the emails sent about it'] : undefined }))) return;
    start(async () => report(await guard(() => purgeItem(item.kind, item.key, item.title))));
  }
  async function empty() {
    if (!(await confirm({ title: 'Empty Trash?', tone: 'danger', confirmLabel: 'Delete all permanently', typeToConfirm: 'Empty Trash',
      body: `Deletes ${purgeable} ${purgeable === 1 ? 'item' : 'items'} permanently. Items still used elsewhere stay in Trash. This cannot be undone.` }))) return;
    start(async () => report(await guard(() => emptyTrash('Empty Trash'))));
  }

  return <>
    {confirmDialog}{stepUpDialog}
    <div className="admin-list__tools admin-trash-tools">
      <label className="admin-list__filter"><span className="sr-only">Type</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="">Everything ({items.length})</option>{types.map((t) => <option key={t} value={t}>{t} ({items.filter((i) => i.type === t).length})</option>)}</select></label>
      {purgeable > 0 && <button type="button" className="secondary is-danger" disabled={pending} onClick={empty}><Trash2 size={14} aria-hidden="true" /> Empty Trash</button>}
    </div>
    {shown.length ? <div className="admin-card admin-table admin-datatable" role="region" aria-label="Items in Trash" tabIndex={0}>
      <table>
        <thead><tr><th scope="col">Item</th><th scope="col">Type</th><th scope="col">Event</th><th scope="col">Moved by</th><th scope="col">When</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{shown.map((item) => <tr key={`${item.kind}:${item.key.collection ?? ''}:${item.key.id}`}>
          <td data-label="Item"><strong>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</strong></td>
          <td data-label="Type">{item.type}</td>
          <td data-label="Event">{item.event ? EVENTS[item.event] : 'Shared'}</td>
          <td data-label="Moved by">{item.deletedBy}</td>
          <td data-label="When">{pkt(item.deletedAt)}{autoDelete(item.deletedAt) && <small><br />Deleted for good on {autoDelete(item.deletedAt)}</small>}</td>
          <td className="admin-datatable__actions">
            {item.canRestore && <button type="button" className="secondary" disabled={pending} onClick={() => start(async () => report(await restoreItem(item.kind, item.key)))}><RotateCcw size={14} aria-hidden="true" /> Restore</button>}
            {item.canPurge && <button type="button" className="secondary is-danger" disabled={pending} onClick={() => purge(item)}><Trash2 size={14} aria-hidden="true" /> Delete permanently</button>}
          </td>
        </tr>)}</tbody>
      </table>
    </div> : <div className="admin-empty"><p><strong>Trash is empty.</strong></p><p>Things you move to Trash wait here, so a mistake can be undone.</p></div>}
  </>;
}
