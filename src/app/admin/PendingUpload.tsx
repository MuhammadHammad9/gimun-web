'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { abandonUpload, finishUpload } from './media-actions';

/** An upload that never finished: check it again, or remove it. */
export function PendingUpload({ path }: { path: string }) {
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();
  const router = useRouter();
  function run(verify: boolean) {
    start(async () => {
      const result = verify ? await finishUpload(path) : await abandonUpload(path);
      if ('error' in result) return setMessage(result.error);
      setMessage(verify ? 'Checked. The file is now in the library.' : 'Unfinished upload removed.');
      router.refresh();
    });
  }
  return <div className="media-pending__actions">
    <button type="button" disabled={pending} onClick={() => run(true)}>Check again</button>
    <button type="button" disabled={pending} className="secondary" onClick={() => run(false)}>Remove</button>
    {message && <p role="status">{message}</p>}
  </div>;
}
