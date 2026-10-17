import { requirePermission } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { readAll } from '@/lib/server/admin/read-all';
import { AdminNav } from '../AdminNav';
import { AdminPageHeader } from '../AdminPageHeader';
import { AdminAccounts, type Account } from '../AdminAccounts';

/** Sign-in details from Supabase Auth: last sign-in and whether two-step sign-in is set up. */
async function authDetails() {
  const details = new Map<string, { lastSignIn: string | null; twoStep: boolean }>();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await database().auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data) break;
    for (const u of data.users) details.set(u.id, { lastSignIn: u.last_sign_in_at ?? null, twoStep: Boolean(u.factors?.some((f) => f.status === 'verified')) });
    if (data.users.length < 200) break;
  }
  return details;
}

export default async function UsersPage() {
  const user = await requirePermission('users', true);
  const [rows, details] = await Promise.all([
    readAll('admin_users', 'user_id,display_name,email,role,events,sections,active,created_at', 'user_id'),
    authDetails().catch(() => new Map<string, { lastSignIn: string | null; twoStep: boolean }>()),
  ]);
  const accounts: Account[] = rows.map((r) => ({
    user_id: String(r.user_id), display_name: String(r.display_name), email: String(r.email), role: String(r.role),
    events: (r.events as string[] | null) ?? ['gimun', 'moot-cup'], sections: (r.sections as string[] | null) ?? [], active: Boolean(r.active),
    lastSignIn: details.get(String(r.user_id))?.lastSignIn ?? null, twoStep: details.get(String(r.user_id))?.twoStep ?? null,
  })).sort((a, b) => Number(b.active) - Number(a.active) || a.display_name.localeCompare(b.display_name));
  return <>
    <AdminNav user={user} />
    <AdminPageHeader title="Admin accounts" description="Who can sign in, what job they do and which events they see. Every change here asks for a code from your authenticator app." />
    <AdminAccounts accounts={accounts} me={user.user_id} />
  </>;
}
