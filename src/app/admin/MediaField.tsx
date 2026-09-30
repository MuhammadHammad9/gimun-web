'use client';

import { createContext, useContext, useId, useRef, useState, type DragEvent } from 'react';
import Image from 'next/image';
import { FileText, ImagePlus, Library, Search, Trash2, Upload, X } from 'lucide-react';
import type { UploadedMedia } from './media-actions';
import { ACCEPTED_FILES, ACCEPTED_IMAGES, describeFile, uploadFile } from './media-client';

/** The verified files an editor may pick from, and whether they may upload. */
export type MediaContextValue = { media: UploadedMedia[]; canUpload: boolean; add: (asset: UploadedMedia) => void };
export const MediaContext = createContext<MediaContextValue>({ media: [], canUpload: false, add: () => {} });

const isImage = (url: string, media?: UploadedMedia) => (media ? media.mime.startsWith('image/') : /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url));
const fileName = (url: string) => decodeURIComponent(url.split('/').pop() || url);
// <dialog> methods are missing before Safari 15.4; fall back to the open attribute.
const openDialog = (node: HTMLDialogElement | null) => { if (!node) return; if (typeof node.showModal === 'function') node.showModal(); else node.setAttribute('open', ''); };
const closeDialog = (node: HTMLDialogElement | null) => { if (!node) return; if (typeof node.close === 'function') node.close(); else node.removeAttribute('open'); };
const kb = (size: number) => (size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`);

/**
 * An image or document field: shows what is chosen, and lets an editor upload
 * a new file (button or drag and drop) or pick one already in the library,
 * right where the field is. Uploads go through the verified upload flow and
 * land in the library for reuse.
 */
export function MediaField({
  id,
  label,
  value,
  onChange,
  kind,
  required,
  error,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind: 'image' | 'file';
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  const { media, canUpload, add } = useContext(MediaContext);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState('');
  const [problem, setProblem] = useState('');
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState('');
  const helpId = useId();
  const accept = kind === 'image' ? ACCEPTED_IMAGES : ACCEPTED_FILES;
  const choices = media.filter((m) => kind === 'file' || m.mime.startsWith('image/'));
  const current = media.find((m) => m.url === value);

  async function upload(file: File | undefined) {
    if (!file || busy) return;
    setProblem('');
    setBusy(`Uploading ${file.name}…`);
    try {
      const asset = await uploadFile(file, describeFile(file.name));
      add(asset);
      onChange(asset.url);
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The upload failed. Try again.');
    } finally {
      setBusy('');
      if (input.current) input.current.value = '';
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (canUpload) void upload(event.dataTransfer.files[0]);
  }

  const shown = choices.filter((m) => !query || m.alt.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="media-field" data-error={error || problem ? '' : undefined}>
      <span className="media-field__label" id={`${id}-label`}>
        {label}
        {required && <span className="media-field__required"> (required)</span>}
      </span>
      {hint && (
        <small className="admin-field-hint" id={helpId}>
          {hint}
        </small>
      )}

      {value ? (
        <div className="media-field__chosen">
          <div className="media-field__thumb">
            {isImage(value, current) ? (
              <Image src={value} alt={current?.alt ?? ''} fill sizes="120px" unoptimized />
            ) : (
              <FileText aria-hidden="true" size={28} />
            )}
          </div>
          <div className="media-field__meta">
            <strong>{current?.alt || fileName(value)}</strong>
            <small>{current ? `${current.mime === 'application/pdf' ? 'PDF' : current.mime.replace('image/', '').toUpperCase()} · ${kb(current.size)}` : value}</small>
            <a href={value} target="_blank" rel="noreferrer">
              Open {kind === 'image' ? 'image' : 'file'}
            </a>
          </div>
          <div className="media-field__actions">
            {(canUpload || choices.length > 0) && (
              <button type="button" className="secondary" onClick={() => openDialog(dialog.current)} disabled={Boolean(busy)}>
                <Library size={15} aria-hidden="true" /> Change
              </button>
            )}
            {!required && (
              <button type="button" className="secondary" onClick={() => onChange('')} aria-label={`Remove ${label.toLowerCase()}`}>
                <Trash2 size={15} aria-hidden="true" /> Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="media-field__drop"
          data-dragging={dragging ? '' : undefined}
          onDragOver={(event) => {
            if (!canUpload) return;
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <ImagePlus aria-hidden="true" size={26} />
          <p>
            {busy ||
              (canUpload
                ? `Drag ${kind === 'image' ? 'an image' : 'a file'} here, or`
                : choices.length
                  ? `Choose ${kind === 'image' ? 'an image' : 'a file'} from the library`
                  : 'No files in the library yet. Ask someone with media access to upload one.')}
          </p>
          {!busy && (
            <div className="media-field__drop-actions">
              {canUpload && (
                <button type="button" onClick={() => input.current?.click()}>
                  <Upload size={15} aria-hidden="true" /> Upload new
                </button>
              )}
              {choices.length > 0 && (
                <button type="button" className="secondary" onClick={() => openDialog(dialog.current)}>
                  <Library size={15} aria-hidden="true" /> Choose from library
                </button>
              )}
            </div>
          )}
          <small>{kind === 'image' ? 'JPEG, PNG or WebP, up to 5 MB.' : 'PDF up to 25 MB, or an image up to 5 MB.'}</small>
        </div>
      )}

      {canUpload && (
        <input
          ref={input}
          type="file"
          accept={accept}
          hidden
          aria-labelledby={`${id}-label`}
          onChange={(event) => void upload(event.target.files?.[0])}
        />
      )}
      {(problem || error) && (
        <p className="admin-field-error" role="alert">
          {problem || error}
        </p>
      )}

      <details className="media-field__link">
        <summary>Use a link instead</summary>
        <label htmlFor={id}>
          Link to the {kind === 'image' ? 'image' : 'file'}
          <input
            id={id}
            value={value}
            aria-invalid={Boolean(error)}
            placeholder={kind === 'image' ? 'An uploaded image link, or /images/…' : '/documents/… or an uploaded file link'}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </details>

      <dialog ref={dialog} className="media-picker" aria-labelledby={`${id}-picker-title`} onClick={(event) => event.target === dialog.current && closeDialog(dialog.current)}>
        <div className="media-picker__head">
          <h2 id={`${id}-picker-title`}>Choose {kind === 'image' ? 'an image' : 'a file'}</h2>
          <button type="button" className="secondary media-picker__close" onClick={() => closeDialog(dialog.current)} aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <label className="media-picker__search">
          <span className="sr-only">Search the library</span>
          <Search size={15} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by description" />
        </label>
        {shown.length ? (
          <ul className="media-picker__grid">
            {shown.map((asset) => (
              <li key={asset.url}>
                <button
                  type="button"
                  className="media-picker__item"
                  aria-pressed={asset.url === value}
                  onClick={() => {
                    onChange(asset.url);
                    closeDialog(dialog.current);
                  }}
                >
                  <span className="media-picker__thumb">
                    {asset.mime.startsWith('image/') ? <Image src={asset.url} alt="" fill sizes="180px" unoptimized /> : <FileText size={30} aria-hidden="true" />}
                  </span>
                  <span className="media-picker__name">{asset.alt}</span>
                  <small>{kb(asset.size)}</small>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-muted">{query ? 'Nothing matches that search.' : 'The library is empty.'}</p>
        )}
        {canUpload && (
          <div className="media-picker__foot">
            <button
              type="button"
              onClick={() => {
                closeDialog(dialog.current);
                input.current?.click();
              }}
            >
              <Upload size={15} aria-hidden="true" /> Upload a new file instead
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
