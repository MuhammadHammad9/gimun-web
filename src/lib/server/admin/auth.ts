import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { database } from '../supabase';
import { can, type AdminUser } from './permissions';

export async function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Admin authentication is not configured.');
  const store = await cookies();
  return createServerClient(url, key, { cookies: { getAll: () => store.getAll(), setAll: values => {
    try { values.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Proxy refreshes cookies during server rendering. */ }
  } } });
}
export async function requireAdmin(allowPasswordChange = false): Promise<AdminUser> {
  const client = await authClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect('/admin/login');
  const { data: user, error: profileError } = await database().from('admin_users').select('*').eq('user_id', data.user.id).eq('active', true).maybeSingle();
  if (profileError || !user) throw new Error('This account has no active admin access.');
  if (user.must_change_password && !allowPasswordChange) redirect('/admin/password');
  return user as AdminUser;
}
export async function requirePermission(section: string, write = false) {
  const user = await requireAdmin();
  if (!can(user, section, write)) throw new Error('You do not have permission for this operation.');
  return user;
}
