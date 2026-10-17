'use client';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { verifyStepUp } from '../mfa-actions';

type Step = 'code' | 'enrol';
type Result = { stepUp?: Step };

/**
 * Runs a risky action, asking for a fresh two-step code first when the server
 * says so, then retrying it once the code is confirmed.
 *   const [guard, stepUpDialog] = useStepUp();
 *   const result = await guard(() => purgeItem(...));
 */
export function useStepUp(): [<R extends Result>(action: () => Promise<R>) => Promise<R | null>, ReactNode] {
  const [step, setStep] = useState<Step | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const ask = useCallback((next: Step) => new Promise<boolean>((resolve) => { resolver.current = resolve; setStep(next); }), []);
  const settle = useCallback((ok: boolean) => { resolver.current?.(ok); resolver.current = null; setStep(null); }, []);
  const guard = useCallback(async <R extends Result>(action: () => Promise<R>): Promise<R | null> => {
    const first = await action();
    if (!first.stepUp) return first;
    if (!(await ask(first.stepUp))) return null;
    return action();
  }, [ask]);
  return [guard, step ? <StepUpDialog key={step} step={step} onSettle={settle} /> : null];
}

function StepUpDialog({ step, onSettle }: { step: Step; onSettle: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const id = useId();
  useEffect(() => { if (ref.current && !ref.current.open) ref.current.showModal(); input.current?.focus(); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await verifyStepUp(code);
    setPending(false);
    if ('error' in result) { setError(result.error); setCode(''); input.current?.focus(); return; }
    onSettle(true);
  }
  return <dialog ref={ref} className="admin-dialog" aria-labelledby={`${id}-title`} onCancel={(e) => { e.preventDefault(); onSettle(false); }}>
    {step === 'enrol' ? <div className="admin-dialog__form">
      <h2 id={`${id}-title`}><ShieldCheck size={18} aria-hidden="true" /> Two-step sign-in needed</h2>
      <p className="admin-dialog__body">This action can&apos;t be undone, so it needs a code from an authenticator app. Set up two-step sign-in once, then try again.</p>
      <div className="admin-dialog__actions">
        <button type="button" className="secondary" onClick={() => onSettle(false)}>Not now</button>
        <Link className="admin-button" href="/admin/mfa">Set up two-step sign-in</Link>
      </div>
    </div> : <form className="admin-dialog__form" onSubmit={submit}>
      <h2 id={`${id}-title`}><ShieldCheck size={18} aria-hidden="true" /> Confirm it&apos;s you</h2>
      <p className="admin-dialog__body">Enter the 6-digit code from your authenticator app. You won&apos;t be asked again for 15 minutes.</p>
      <label>Code<input ref={input} inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} required /></label>
      {error && <p role="alert">{error}</p>}
      <div className="admin-dialog__actions">
        <button type="button" className="secondary" onClick={() => onSettle(false)}>Cancel</button>
        <button type="submit" disabled={pending}>{pending ? 'Checking…' : 'Confirm'}</button>
      </div>
    </form>}
  </dialog>;
}
