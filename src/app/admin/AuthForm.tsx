'use client';
import { useActionState, useEffect } from 'react';
import { login, changePassword } from './auth-actions';
import { useTurnstile } from '@/components/forms/Turnstile';

const REASONS: Record<string, string> = { idle: 'You were signed out after 30 minutes without activity. Sign in again to continue.', expired: 'Your session reached its time limit. Sign in again to continue.' };
export function AuthForm({ passwordOnly = false, reason }: { passwordOnly?: boolean; reason?: string }) {
  const [error, action, pending] = useActionState(passwordOnly ? changePassword : login, '');
  // The human check guards sign-in only; it is off until the Turnstile keys are set.
  const check = useTurnstile(!passwordOnly);
  const resetCheck = check.reset;
  // Turnstile tokens are single-use: a failed attempt needs a fresh check.
  useEffect(() => { if (error) resetCheck(); }, [error, resetCheck]);
  return <form action={action} className="admin-card admin-auth max-w-md space-y-4">
    <div className="admin-auth__brand">
      {/* eslint-disable-next-line @next/next/no-img-element -- the fixed-colour shield, also the site icon */}
      <img src="/icon.svg" alt="" aria-hidden="true" width={40} height={40} />
      <span>GIMUN 26 · GMC VII<small>Event administration</small></span>
    </div>
    <h1>{passwordOnly ? 'Set your password.' : 'Sign in.'}</h1>{!passwordOnly && reason && REASONS[reason] && !error && <p role="status" className="admin-callout">{REASONS[reason]}</p>}{!passwordOnly && <label>Email<input type="email" name="email" autoComplete="username" required /></label>}{passwordOnly && <label>Current password<input type="password" name="current_password" autoComplete="current-password" required /></label>}<label>{passwordOnly ? 'New password' : 'Password'}<input type="password" name="password" autoComplete={passwordOnly ? 'new-password' : 'current-password'} minLength={passwordOnly ? 12 : 1} required /></label>{check.widget}{error && <p role="alert">{error}</p>}<button disabled={pending}>{pending ? 'Please wait…' : passwordOnly ? 'Save password' : 'Sign in'}</button></form>;
}
