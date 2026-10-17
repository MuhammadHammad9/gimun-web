'use client';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

export type ConfirmOptions = {
  title: string;
  body?: ReactNode;
  /** What else changes, one line each ("Removes 1 allocation"). */
  impact?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  /** For actions that cannot be undone: the person types this exact text first. */
  typeToConfirm?: string;
};

/**
 * A promise-based confirmation in a native modal <dialog>. Cancel has focus,
 * so Enter or Escape never confirms by accident.
 *   const [confirm, dialog] = useConfirm();
 *   if (!(await confirm({ title: 'Remove?' }))) return;
 *   ...render {dialog} once.
 */
export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const confirm = useCallback((next: ConfirmOptions) => new Promise<boolean>((resolve) => {
    resolver.current?.(false);
    resolver.current = resolve;
    setOptions(next);
  }), []);
  const settle = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  }, []);
  return [confirm, options ? <ConfirmDialog key={options.title} options={options} onSettle={settle} /> : null];
}

function ConfirmDialog({ options, onSettle }: { options: ConfirmOptions; onSettle: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const [typed, setTyped] = useState('');
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    cancel.current?.focus();
  }, []);
  const ready = !options.typeToConfirm || typed.trim() === options.typeToConfirm.trim();
  const danger = options.tone === 'danger';
  return <dialog ref={ref} className="admin-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-body`} onCancel={(e) => { e.preventDefault(); onSettle(false); }}>
    <form method="dialog" onSubmit={(e) => { e.preventDefault(); if (ready) onSettle(true); }}>
      <h2 id={`${id}-title`}>{danger && <AlertTriangle size={18} aria-hidden="true" />} {options.title}</h2>
      <div id={`${id}-body`} className="admin-dialog__body">
        {options.body && <div>{options.body}</div>}
        {options.impact?.length ? <ul className="admin-dialog__impact">{options.impact.map((line) => <li key={line}>{line}</li>)}</ul> : null}
        {options.typeToConfirm && <label className="admin-dialog__type">
          Type <strong>{options.typeToConfirm}</strong> to confirm
          <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
        </label>}
      </div>
      <div className="admin-dialog__actions">
        <button ref={cancel} type="button" className="secondary" onClick={() => onSettle(false)}>{options.cancelLabel ?? 'Cancel'}</button>
        <button type="submit" className={danger ? 'is-danger-solid' : undefined} disabled={!ready}>{options.confirmLabel ?? 'Continue'}</button>
      </div>
    </form>
  </dialog>;
}
