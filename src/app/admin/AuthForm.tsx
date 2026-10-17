'use client';
import { useActionState } from 'react';
import { login, changePassword } from './auth-actions';
export function AuthForm({ passwordOnly = false }: { passwordOnly?: boolean }) {
  const [error, action, pending] = useActionState(passwordOnly ? changePassword : login, '');
  return <form action={action} className="admin-card admin-auth max-w-md space-y-4">
    <div className="admin-auth__brand">
      {/* eslint-disable-next-line @next/next/no-img-element -- the fixed-colour shield, also the site icon */}
      <img src="/icon.svg" alt="" aria-hidden="true" width={40} height={40} />
      <span>GIMUN 26 · GMC VII<small>Event administration</small></span>
    </div>
    <h1>{passwordOnly ? 'Set your password.' : 'Sign in.'}</h1>{!passwordOnly && <label>Email<input type="email" name="email" autoComplete="username" required /></label>}{passwordOnly && <label>Current password<input type="password" name="current_password" autoComplete="current-password" required /></label>}<label>{passwordOnly ? 'New password' : 'Password'}<input type="password" name="password" autoComplete={passwordOnly ? 'new-password' : 'current-password'} minLength={passwordOnly ? 12 : 1} required /></label>{error && <p role="alert">{error}</p>}<button disabled={pending}>{pending ? 'Please wait…' : passwordOnly ? 'Save password' : 'Sign in'}</button></form>;
}
