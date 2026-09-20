'use client';
import { useActionState } from 'react';
import { login, changePassword } from './auth-actions';
export function AuthForm({ passwordOnly = false }: { passwordOnly?: boolean }) {
  const [error, action, pending] = useActionState(passwordOnly ? changePassword : login, '');
  return <form action={action} className="admin-card max-w-md space-y-4"><h1>{passwordOnly ? 'Set your password' : 'Admin sign in'}</h1>{!passwordOnly && <label>Email<input type="email" name="email" autoComplete="username" required /></label>}<label>Password<input type="password" name="password" autoComplete={passwordOnly ? 'new-password' : 'current-password'} minLength={passwordOnly ? 12 : 1} required /></label>{error && <p role="alert">{error}</p>}<button disabled={pending}>{pending ? 'Please wait…' : passwordOnly ? 'Save password' : 'Sign in'}</button></form>;
}
