'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authClient, requireAdmin } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { clientIp, enforceRateLimit } from '@/lib/server/submissions';
export async function login(_previous: string, form: FormData) {
  const input = z.object({ email: z.email(), password: z.string().min(1).max(200) }).safeParse(Object.fromEntries(form));
  if (!input.success) return 'Enter an email address and password.';
  try {
    const request = new Request('http://localhost', { headers: await headers() });
    if (!(await enforceRateLimit('admin-login', clientIp(request))).allowed) return 'Too many attempts. Please try later.';
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
  const { error } = await (await authClient()).auth.updateUser({ password: password.data });
  if (error) return 'The password could not be changed.';
  const { error: profileError } = await database().from('admin_users').update({ must_change_password: false }).eq('user_id', user.user_id);
  if (profileError) return 'Password changed, but access could not be unlocked. Contact the owner.';
  redirect('/admin');
}
