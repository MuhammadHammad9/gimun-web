'use client';

import { useRef, useState, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CloudUpload, LoaderCircle, RotateCcw, TriangleAlert } from 'lucide-react';
import type { UploadedMedia } from './media-actions';
import { ACCEPTED_FILES, checkFile, describeFile, uploadFile } from './media-client';
import { useDirtyGuard } from './useDirtyGuard';

/** `fatal`: the file itself is unusable (wrong type, too large), so it cannot be retried. */
type Item = { key: string; file: File; alt: string; status: 'waiting' | 'uploading' | 'done' | 'error'; message?: string; fatal?: boolean };

/**
 * Drop files (or choose them), give each a short description, and they are
 * uploaded one by one, verified, and added to the library. Each file shows
 * its own progress and can be retried on its own.
 */
export function MediaUpload({ onUploaded }: { onUploaded?: (assets: UploadedMedia[]) => void } = {}) {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const waiting = items.some((i) => i.status === 'waiting' || i.status === 'error');
  useDirtyGuard(busy || items.some((i) => i.status === 'waiting'));

  const patch = (key: string, next: Partial<Item>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...next } : i)));

  function add(files: FileList | File[]) {
    const fresh = [...files].map((file, index) => {
      const problem = checkFile(file, ACCEPTED_FILES);
      return { key: `${Date.now()}-${index}-${file.name}`, file, alt: describeFile(file.name), status: problem ? 'error' : 'waiting', message: problem ?? undefined, fatal: Boolean(problem) } as Item;
    });
    setItems((list) => [...list.filter((i) => i.status !== 'done'), ...fresh]);
  }

  async function uploadAll(only?: string) {
    setBusy(true);
    const done: UploadedMedia[] = [];
    for (const item of items) {
      if (only ? item.key !== only : item.status !== 'waiting') continue;
      if (!item.alt.trim()) {
        patch(item.key, { status: 'error', message: 'Add a short description first.' });
        continue;
      }
      patch(item.key, { status: 'uploading', message: undefined });
      try {
        done.push(await uploadFile(item.file, item.alt));
        patch(item.key, { status: 'done' });
      } catch (error) {
        patch(item.key, { status: 'error', message: error instanceof Error ? error.message : 'The upload failed.' });
      }
    }
    setBusy(false);
    if (done.length) {
      onUploaded?.(done);
      router.refresh();
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) add(event.dataTransfer.files);
  }

  return (
    <section className="admin-panel upload" aria-labelledby="upload-title">
      <h2 id="upload-title">Upload files</h2>
      <div
        className="upload__drop"
        data-dragging={dragging ? '' : undefined}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <CloudUpload size={30} aria-hidden="true" />
        <p>
          <strong>Drag images or PDFs here</strong>
          <span>or</span>
        </p>
        <button type="button" onClick={() => input.current?.click()} disabled={busy}>
          Choose files
        </button>
        <small>JPEG, PNG and WebP up to 5 MB · PDF up to 25 MB</small>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          aria-label="Files to upload"
          accept={ACCEPTED_FILES}
          onChange={(event) => {
            if (event.target.files) add(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {items.length > 0 && (
        <>
          <ul className="upload__list" aria-label="Files to upload">
            {items.map((item) => (
              <li key={item.key} className={`upload__item is-${item.status}`}>
                <span className="upload__icon" aria-hidden="true">
                  {item.status === 'done' ? <CheckCircle2 size={18} /> : item.status === 'error' ? <TriangleAlert size={18} /> : item.status === 'uploading' ? <LoaderCircle size={18} className="upload__spin" /> : <CloudUpload size={18} />}
                </span>
                <div className="upload__body">
                  <span className="upload__name">{item.file.name}</span>
                  {item.status === 'waiting' || (item.status === 'error' && !item.fatal) ? (
                    <label>
                      Description
                      <input value={item.alt} maxLength={500} onChange={(event) => patch(item.key, { alt: event.target.value })} placeholder="What does it show?" />
                    </label>
                  ) : (
                    item.status !== 'error' && <small>{item.status === 'done' ? 'Uploaded and ready to use' : 'Uploading and checking…'}</small>
                  )}
                  {item.status === 'error' && item.message && <small className="upload__error">{item.message}</small>}
                </div>
                {item.status === 'error' && !item.fatal && (
                  <button type="button" className="secondary" disabled={busy} onClick={() => void uploadAll(item.key)}>
                    <RotateCcw size={14} aria-hidden="true" /> Retry
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="upload__actions">
            <p role="status" aria-label="Upload status">
              {busy ? 'Uploading…' : items.every((i) => i.status === 'done') ? 'All files uploaded. They are in the library below and in every image picker.' : ''}
            </p>
            {waiting && (
              <button type="button" disabled={busy || !items.some((i) => i.status === 'waiting')} onClick={() => void uploadAll()}>
                Upload {items.filter((i) => i.status === 'waiting').length} {items.filter((i) => i.status === 'waiting').length === 1 ? 'file' : 'files'}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
