import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authClient, missingMigrations } from '@/lib/server/admin/auth';

/** Shown instead of every admin page while the database is behind the code. */
export default async function UpdateNeededPage() {
  const { data } = await (await authClient()).auth.getUser();
  if (!data.user) redirect('/admin/login');
  const missing: string[] = await missingMigrations().catch(() => []);
  if (!missing.length) redirect('/admin');
  return <section className="admin-card admin-auth max-w-2xl">
    <h1>Database update needed</h1>
    <p>This version of the admin needs database changes that have not been applied yet, so its pages cannot load. The public website is not affected.</p>
    <p><strong>To fix it</strong> (the owner or whoever manages Supabase):</p>
    <ol>
      <li>Open the Supabase dashboard for this project, then <em>SQL Editor</em>.</li>
      <li>Run each file below from <code>supabase/migrations/</code>, one at a time, in this order. Run all of 0015 to 0020 even if only some are listed: the later ones depend on the earlier ones.</li>
    </ol>
    <ul>{['0015_event_scope.sql', '0016_sessions.sql', '0017_trash.sql', '0018_team_groups.sql', '0019_people.sql', '0020_audit_details.sql'].map((f) => <li key={f}><code>{f}</code>{missing.includes(f) ? ' (not applied yet)' : ''}</li>)}</ul>
    <p className="admin-muted">Each file only adds things, so the website keeps working while you run them. This page checks again within a minute.</p>
    <p><Link className="admin-button" href="/admin">Check again</Link></p>
  </section>;
}
