'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { authClient, requireAdmin } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { clientIp, enforceRateLimit } from '@/lib/server/submissions';
export async function login(_previous: string, form: FormData) {
  const input = z.object({ email: z.email(), password: z.string().min(1).max(200) }).safeParse(Object.fromEntries(form));
  if (!input.success) return 'Enter an email address and password.';
  try {
    const request = new Request('http://localhost', { headers: await headers() });
    if (!(await enforceRateLimit('admin-login', clientIp(request))).allowed) return 'Too many attempts. Please try later.';
    // Per account too, so guessing one password from many addresses is still slow.
    if (!(await enforceRateLimit('admin-login-account', input.data.email.toLowerCase())).allowed) return 'Too many attempts. Please try later.';
    const { error } = await (await authClient()).auth.signInWithPassword(input.data);
    if (error) return 'Unable to sign in. Check your credentials.';
  } catch { return 'Sign-in is unavailable. Check the server configuration.'; }
  redirect('/admin');
}
export async function logout() { await (await authClient()).auth.signOut(); redirect('/admin/login'); }
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
  if (!(await enforceRateLimit('admin-login-account', user.email.toLowerCase())).allowed) return 'Too many attempts. Please try later.';
  const verifier = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const check = await verifier.auth.signInWithPassword({ email: user.email, password: current.data });
  if (check.error) return 'The current password is incorrect.';
  await verifier.auth.signOut({ scope: 'local' }).catch(() => undefined);
  const { error } = await client.auth.updateUser({ password: password.data });
  if (error) return 'The password could not be changed.';
  // Any other signed-in browser keeps the old credentials' session; end them.
  await client.auth.signOut({ scope: 'others' });
  const { error: profileError } = await database().from('admin_users').update({ must_change_password: false }).eq('user_id', user.user_id);
  if (profileError) return 'Password changed, but access could not be unlocked. Contact the owner.';
  redirect('/admin');
}
