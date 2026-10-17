'use server';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { authClient, requireAdmin } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { clientIp, enforceRateLimit, rateLimitSubject } from '@/lib/server/submissions';
import { verifyTurnstile } from '@/lib/server/turnstile';
import { SEEN_COOKIE, adminCookieOptions, mintSeen } from '@/lib/server/admin/session';
import { maskEmail, securityEvent } from '@/lib/server/admin/security-log';

/** Sign-in and password checks for one account: per account and network, plus an account-wide ceiling. */
async function accountThrottled(email: string, ip: string) {
  const account = email.toLowerCase();
  if (!(await enforceRateLimit('admin-login-account', `${account}|${rateLimitSubject(ip)}`)).allowed) return true;
  if ((await enforceRateLimit('admin-login-account-global', account)).allowed) return false;
  console.warn('[Auth] Account-wide sign-in ceiling reached; sign-in for this account is paused for up to an hour.');
  return true;
}
export async function login(_previous: string, form: FormData) {
  const input = z.object({ email: z.email(), password: z.string().min(1).max(200) }).safeParse(Object.fromEntries(form));
  if (!input.success) return 'Enter an email address and password.';
  try {
    const ip = clientIp(new Request('http://localhost', { headers: await headers() }));
    if (!(await enforceRateLimit('admin-login', ip)).allowed) return 'Too many attempts. Please try later.';
    if (await accountThrottled(input.data.email, ip)) { await securityEvent('sign-in-throttled', null, { email: maskEmail(input.data.email) }); return 'Too many attempts. Please try later.'; }
    if (!(await verifyTurnstile(form.get('cf-turnstile-response'), ip))) return 'The security check did not pass. Complete it and try again.';
    const { data, error } = await (await authClient()).auth.signInWithPassword(input.data);
    if (error || !data.user) { await securityEvent('sign-in-failed', null, { email: maskEmail(input.data.email) }); return 'Unable to sign in. Check your credentials.'; }
    const now = Date.now();
    (await cookies()).set(SEEN_COOKIE, mintSeen(now, now), adminCookieOptions());
    await securityEvent('sign-in', data.user.id);
  } catch { return 'Sign-in is unavailable. Check the server configuration.'; }
  redirect('/admin');
}
export async function logout() {
  const client = await authClient();
  const { data } = await client.auth.getUser();
  await client.auth.signOut();
  (await cookies()).delete(SEEN_COOKIE);
  if (data.user) await securityEvent('sign-out', data.user.id);
  redirect('/admin/login');
}
export async function changePassword(_previous: string, form: FormData) {
  const user = await requireAdmin(true);
  const password = z.string().min(12).max(200).safeParse(form.get('password'));
  if (!password.success) return 'Use at least 12 characters.';
  const current = z.string().min(1).max(200).safeParse(form.get('current_password'));
  if (!current.success) return 'Enter your current password.';
  if (current.data === password.data) return 'Choose a password different from the current one.';
  const client = await authClient();
  // Proves the person at the keyboard knows the password, not just that a
  // session cookie is present on an unattended machine. The check runs on a
  // throwaway client so the admin's own (possibly two-factor) session is
  // left untouched, then that extra session is revoked.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return 'Password changes are unavailable. Check the server configuration.';
  // Same per-account limit as sign-in, so a stolen session cannot be used to
  // guess the password through this form.
  if (await accountThrottled(user.email, clientIp(new Request('http://localhost', { headers: await headers() })))) return 'Too many attempts. Please try later.';
  const verifier = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const check = await verifier.auth.signInWithPassword({ email: user.email, password: current.data });
  if (check.error) return 'The current password is incorrect.';
  await verifier.auth.signOut({ scope: 'local' }).catch(() => undefined);
  const { error } = await client.auth.updateUser({ password: password.data });
  if (error) return 'The password could not be changed.';
  // Any other signed-in browser keeps the old credentials' session; end them.
  await client.auth.signOut({ scope: 'others' });
  await securityEvent('password-changed', user.user_id);
  const { error: profileError } = await database().from('admin_users').update({ must_change_password: false }).eq('user_id', user.user_id);
  if (profileError) return 'Password changed, but access could not be unlocked. Contact the owner.';
  redirect('/admin');
}
