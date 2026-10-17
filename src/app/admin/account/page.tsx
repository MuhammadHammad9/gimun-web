import Link from 'next/link';
import { authClient, requireAdmin } from '@/lib/server/admin/auth';
import { accessLabel } from '@/lib/server/admin/permissions';
import { sessionLimits } from '@/lib/server/admin/session';
import { AdminNav } from '../AdminNav';
import { AdminPageHeader } from '../AdminPageHeader';
import { SignOutEverywhere } from '../SignOutEverywhere';

const pkt = (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' });

export default async function AccountPage() {
  const user = await requireAdmin();
  const client = await authClient();
  const [{ data: auth }, { data: factors }] = await Promise.all([client.auth.getUser(), client.auth.mfa.listFactors()]);
  const twoStep = Boolean(factors?.totp.some((f) => f.status === 'verified'));
  const { idleMs, absoluteMs } = sessionLimits();
  return <>
    <AdminNav user={user} />
    <AdminPageHeader title="My account" description={`${user.display_name} · ${user.email} · ${accessLabel(user)}`} />
    <section className="admin-card">
      <h2>Two-step sign-in</h2>
      {twoStep
        ? <p><span className="admin-status">On</span> Your authenticator app protects permanent deletion and other risky actions.</p>
        : <><p>Off. Set it up once to use permanent delete, admin accounts and admin settings, which ask for a code from an authenticator app.</p><p><Link className="admin-button" href="/admin/mfa">Set up two-step sign-in</Link></p></>}
    </section>
    <section className="admin-card">
      <h2>Password</h2>
      <p><Link href="/admin/password">Change your password</Link>. Other signed-in browsers are signed out when you do.</p>
    </section>
    <section className="admin-card">
      <h2>Sessions</h2>
      <p>Last sign-in: {auth.user?.last_sign_in_at ? pkt(auth.user.last_sign_in_at) : 'unknown'} (Pakistan time).</p>
      <p className="admin-muted">You are signed out after {Math.round(idleMs / 60000)} minutes without activity, and every {Math.round(absoluteMs / 3600000)} hours in any case.</p>
      <SignOutEverywhere userId={user.user_id} />
    </section>
  </>;
}
