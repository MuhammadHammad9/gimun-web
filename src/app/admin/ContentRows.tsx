'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, EyeOff, FileText, Send } from 'lucide-react';
import { bulkStatus, reorderContent } from './content-actions';
import { useConfirm } from './ui/ConfirmDialog';
import { useNotice } from './ui/Notice';

export type ContentRow = { id: string; title: string; summary: string; picture: string | null; hasMedia: boolean; tone: string; state: string };

/**
 * The entries of one content section: open one to edit it, tick several to
 * publish or take them off together, and drag (or use the arrows) to change
 * their order on the website.
 */
export function ContentRows({ collection, rows, write, singular, reorderable }: { collection: string; rows: ContentRow[]; write: boolean; singular: string; reorderable: boolean }) {
  const [order, setOrder] = useState(rows.map((r) => r.id));
  const [source, setSource] = useState(rows.map((r) => r.id).join());
  const [selected, setSelected] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [confirm, dialog] = useConfirm();
  const notice = useNotice();
  const router = useRouter();
  // New rows from the server (a save elsewhere, paging) reset the local order.
  const incoming = rows.map((r) => r.id).join();
  if (incoming !== source) { setSource(incoming); setOrder(rows.map((r) => r.id)); setSelected((s) => s.filter((id) => rows.some((r) => r.id === id))); }
  const byId = new Map(rows.map((r) => [r.id, r]));
  const moved = order.join() !== incoming;
  const plural = (n: number) => `${n} ${n === 1 ? singular : `${singular}s`}`;

  function move(id: string, to: number) {
    setOrder((list) => {
      const next = list.filter((x) => x !== id);
      next.splice(Math.max(0, Math.min(next.length, to)), 0, id);
      return next;
    });
  }
  function saveOrder() {
    start(async () => {
      const result = await reorderContent(collection, order);
      if (result.error) { notice({ text: result.error, tone: 'error' }); return; }
      notice({ text: result.waiting ? `Order saved. ${plural(result.waiting)} with unpublished changes move on the website when published.` : 'Order saved. The website shows the new order.' });
      router.refresh();
    });
  }
  async function setStatus(mode: 'publish' | 'archive') {
    const count = selected.length;
    if (mode === 'archive' && !(await confirm({ title: `Take ${plural(count)} off the website?`, body: 'Visitors stop seeing them. They stay here, and you can publish them again later.', confirmLabel: 'Take them off', tone: 'danger' }))) return;
    if (mode === 'publish' && !(await confirm({ title: `Publish ${plural(count)}?`, body: 'Their saved versions go on the website now, including any draft changes.', confirmLabel: 'Publish' }))) return;
    start(async () => {
      const result = await bulkStatus(collection, selected, mode);
      if (result.error) { notice({ text: result.error, tone: 'error' }); return; }
      notice({ text: mode === 'publish' ? `${plural(result.count ?? count)} published.` : `${plural(result.count ?? count)} taken off the website.` });
      setSelected([]);
      router.refresh();
    });
  }
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const canMove = write && reorderable && !pending;

  return <>
    {dialog}
    {write && rows.length > 1 && <p className="admin-row-select"><label><input type="checkbox" checked={selected.length === rows.length} onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])} /> Select all on this page</label></p>}
    <ul className="admin-rows">
      {order.map((id, index) => {
        const row = byId.get(id);
        if (!row) return null;
        return <li key={id} draggable={canMove} className={`${dragging === id ? 'is-dragging' : ''} ${over === id && dragging !== id ? 'is-drop-target' : ''}`}
          onDragStart={(e) => { setDragging(id); e.dataTransfer.effectAllowed = 'move'; }}
          onDragOver={(e) => { if (!dragging) return; e.preventDefault(); setOver(id); }}
          onDrop={(e) => { e.preventDefault(); if (dragging && dragging !== id) move(dragging, order.indexOf(id)); setDragging(null); setOver(null); }}
          onDragEnd={() => { setDragging(null); setOver(null); }}>
          <div className="admin-row-line">
            {write && <input type="checkbox" className="admin-row-check" aria-label={`Select ${row.title}`} checked={selected.includes(id)} onChange={() => toggle(id)} />}
            <Link className="admin-row" href={`/admin/content/${collection}/${encodeURIComponent(id)}`} draggable={false}>
              {row.hasMedia && <span className="admin-row__thumb">{row.picture ? <Image src={row.picture} alt="" aria-hidden="true" fill sizes="64px" unoptimized /> : <FileText size={20} aria-hidden="true" />}</span>}
              <span className="admin-row__text"><strong>{row.title}</strong><small>{row.summary}</small></span>
              <span className={`admin-pill admin-pill--${row.tone}`}>{row.state}</span>
            </Link>
            {canMove && <span className="admin-reorder">
              <button type="button" aria-label={`Move ${row.title} up`} disabled={index === 0} onClick={() => move(id, index - 1)}><ChevronUp size={14} aria-hidden="true" /></button>
              <button type="button" aria-label={`Move ${row.title} down`} disabled={index === order.length - 1} onClick={() => move(id, index + 1)}><ChevronDown size={14} aria-hidden="true" /></button>
            </span>}
          </div>
        </li>;
      })}
    </ul>
    {moved && <div className="admin-bulkbar" role="region" aria-label="Order">
      <strong>The order changed</strong>
      <button type="button" className="secondary" disabled={pending} onClick={() => setOrder(rows.map((r) => r.id))}>Undo</button>
      <button type="button" disabled={pending} onClick={saveOrder}>{pending ? 'Saving…' : 'Save order'}</button>
    </div>}
    {!moved && selected.length > 0 && <div className="admin-bulkbar" role="region" aria-label="Selected entries">
      <strong>{plural(selected.length)} selected</strong>
      <button type="button" disabled={pending} onClick={() => setStatus('publish')}><Send size={14} aria-hidden="true" /> Publish</button>
      <button type="button" className="secondary" disabled={pending} onClick={() => setStatus('archive')}><EyeOff size={14} aria-hidden="true" /> Take off website</button>
      <button type="button" className="secondary" disabled={pending} onClick={() => setSelected([])}>Clear</button>
    </div>}
  </>;
}
