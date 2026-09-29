'use client';
import { useActionState, useState, useTransition } from 'react';
import { startEnrolment, verifyCode } from './mfa-actions';
export function MfaForm({ mode }: { mode: 'code' | 'enrol' }) {
  const [error, action, pending] = useActionState(verifyCode, '');
  const [setup, setSetup] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [setupError, setSetupError] = useState('');
  const [starting, start] = useTransition();
  if (mode === 'enrol' && !setup) {
    return <div className="admin-card max-w-md space-y-4"><h1>Set up two-factor sign-in</h1><p>Admin accounts can see applicants&apos; personal data, so sign-in needs a code from an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password or similar).</p><button disabled={starting} onClick={() => start(async () => { const r = await startEnrolment(); if ('error' in r) setSetupError(r.error ?? ''); else setSetup(r); })}>{starting ? 'Please wait…' : 'Start setup'}</button>{setupError && <p role="alert">{setupError}</p>}</div>;
  }
  return <form action={action} className="admin-card max-w-md space-y-4"><h1>{mode === 'code' ? 'Enter your sign-in code' : 'Scan and confirm'}</h1>
    {setup && <>
      {/* eslint-disable-next-line @next/next/no-img-element -- Supabase returns an SVG data URI */}
      <img src={setup.qr} alt="QR code for your authenticator app" width={200} height={200} />
      <p>Can&apos;t scan? Enter this key manually: <code>{setup.secret}</code></p><input type="hidden" name="factorId" value={setup.factorId} /></>}
    <label>6-digit code<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required /></label>
    {error && <p role="alert">{error}</p>}<button disabled={pending}>{pending ? 'Checking…' : 'Verify'}</button></form>;
}
