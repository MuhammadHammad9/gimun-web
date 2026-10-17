'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw, Trash2 } from 'lucide-react';
import { restoreItem } from './trash-actions';
import { useNotice } from './ui/Notice';

/** Shown on an item that is in Trash: it is read-only until restored. */
export function RestoreBanner({ kind, itemKey, canRestore }: { kind: string; itemKey: { collection?: string; id: string }; canRestore: boolean }) {
  const [pending, start] = useTransition();
  const notice = useNotice();
  const router = useRouter();
  return <section className="editor-status editor-status--warn" role="alert">
    <Trash2 size={20} aria-hidden="true" />
    <div><strong>This is in Trash</strong><p>It is off the website and cannot be edited. Restore it to work on it again, or delete it for good from <Link href="/admin/trash">Trash</Link>.</p></div>
    {canRestore && <div className="editor-status__links"><button type="button" disabled={pending} onClick={() => start(async () => {
      const result = await restoreItem(kind, itemKey);
      notice({ text: result.error ?? result.result ?? 'Restored.', tone: result.error ? 'error' : 'success' });
      if (!result.error) router.refresh();
    })}><RotateCcw size={14} aria-hidden="true" /> Restore</button></div>}
  </section>;
}
