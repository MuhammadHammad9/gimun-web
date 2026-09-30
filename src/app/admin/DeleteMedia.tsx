'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteMedia } from './media-actions';

/** Deletes an unused file after confirmation. The server refuses files still in use. */
export function DeleteMedia({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState('');
  const router = useRouter();
  return <>
    <button type="button" className="secondary is-danger" disabled={pending} onClick={() => {
      if (!confirm('Delete this file for good? This cannot be undone.')) return;
      start(async () => {
        const result = await deleteMedia(id);
        if ('error' in result) setMessage(result.error);
        else router.refresh();
      });
    }}><Trash2 size={15} aria-hidden="true" /> {pending ? 'Deleting…' : 'Delete'}</button>
    {message && <span role="status" className="admin-field-error">{message}</span>}
  </>;
}
