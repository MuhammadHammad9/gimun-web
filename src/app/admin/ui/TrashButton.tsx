'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Trash2 } from 'lucide-react';
import { restoreItem, trashItem } from '../trash-actions';
import { useConfirm } from './ConfirmDialog';
import { useNotice } from './Notice';

/**
 * Moves one item to Trash after a short confirmation, then offers Undo.
 * Certificates are "revoked" rather than trashed, in the same way.
 */
export function TrashButton({ kind, itemKey, title, after, compact = false }: { kind: string; itemKey: { collection?: string; id: string }; title: string; after?: string; compact?: boolean }) {
  const [pending, start] = useTransition();
  const [confirm, dialog] = useConfirm();
  const notice = useNotice();
  const router = useRouter();
  const revoke = kind === 'certificate';
  return <>
    {dialog}
    <button type="button" className={`secondary is-danger${compact ? ' admin-compact' : ''}`} disabled={pending} onClick={async () => {
      if (!(await confirm(revoke
        ? { title: `Revoke certificate ${title}?`, body: 'Its verification link will say it was revoked. You can undo this from Trash.', confirmLabel: 'Revoke', tone: 'danger' }
        : { title: `Move “${title}” to Trash?`, body: 'It disappears from the admin lists and the website. You can restore it from Trash.', confirmLabel: 'Move to Trash', tone: 'danger' }))) return;
      start(async () => {
        const result = await trashItem(kind, itemKey);
        if (result.error) { notice({ text: result.error, tone: 'error' }); return; }
        notice({ text: result.result ?? 'Moved to Trash.', action: { label: 'Undo', run: async () => {
          const undone = await restoreItem(kind, itemKey);
          notice({ text: undone.error ?? (revoke ? 'Certificate valid again.' : 'Restored.'), tone: undone.error ? 'error' : 'success' });
          router.refresh();
        } } });
        if (after) router.push(after); else router.refresh();
      });
    }}>{revoke ? <Ban size={14} aria-hidden="true" /> : <Trash2 size={14} aria-hidden="true" />} {revoke ? 'Revoke' : compact ? 'Trash' : 'Move to Trash'}</button>
  </>;
}
