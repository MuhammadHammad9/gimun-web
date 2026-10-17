import Link from 'next/link';
import { requirePermission } from '@/lib/server/admin/auth';
import { coversBothEvents, EVENT_LABELS, type EventId } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { readAll } from '@/lib/server/admin/read-all';
import { scopeEvent } from '@/lib/server/admin/scope';
import { isCollection } from '@/lib/content/registry';
import { AdminNav } from '../AdminNav';
import { AdminPageHeader } from '../AdminPageHeader';
import { COLLECTION_INFO } from '../collection-info';

const PAGE = 50;
/** Each recorded action in plain words. */
const ACTIONS: Record<string, string> = {
  save: 'Saved', trash: 'Moved to Trash', restore: 'Restored from Trash', 'delete-permanently': 'Deleted permanently', revoke: 'Revoked a certificate', unrevoke: 'Un-revoked a certificate',
  'sign-in': 'Signed in', 'sign-in-failed': 'Failed sign-in', 'sign-in-throttled': 'Sign-in blocked (too many attempts)', 'sign-out': 'Signed out', 'password-changed': 'Changed their password',
  'two-step-enrolled': 'Set up two-step sign-in', 'two-step-verified': 'Confirmed a two-step code', 'two-step-failed': 'Entered a wrong two-step code', 'two-step-reset': 'Reset two-step sign-in', 'sign-out-everywhere': 'Signed out everywhere',
  'manage-user': 'Changed admin access', 'remove-admin': 'Removed an admin account', 'admin-settings': 'Changed admin settings', export: 'Exported data', 'import-people': 'Imported people', 'person-edit': 'Edited a person',
  checkin: 'Checked someone in', allocation: 'Allocated a country', reserve: 'Changed a country reservation', unassign: 'Removed an allocation', certificate: 'Issued a certificate',
  inbox: 'Updated a message', reply: 'Replied to a message', email: 'Queued emails', template: 'Saved an email template', outbox: 'Retried or cancelled an email', 'cancel-schedule': 'Cancelled a scheduled publication',
  emergency: 'Published an emergency schedule change', promote: 'Published a clarification', archive: 'Created an archive snapshot', 'retention-anonymize': 'Anonymised old records',
  registration: 'Updated a registration', 'registration-contact': 'Edited registration contacts', 'participant-edit': 'Edited a participant', 'resend-ticket': 'Resent a ticket', invoice: 'Sent an invoice', 'amount-due': 'Corrected an amount due', 'walk-in-registration': 'Registered a walk-in',
  INSERT: 'Added (direct)', UPDATE: 'Changed (direct)', DELETE: 'Removed (direct)',
};
const SECTION_LABELS: Record<string, string> = { security: 'Sign-in & security', users: 'Admin accounts', admin_users: 'Admin accounts', media_assets: 'Media library', media: 'Media library', export: 'Exports', people: 'People', inbox: 'Messages', email: 'Email', 'event-day': 'Check-in', allocations: 'Allocations', certificates: 'Certificates', feedback: 'Survey', registrations: 'Registrations', 'close-out': 'Archive & retention', site: 'Site settings', settings: 'Site settings' };
const sectionLabel = (s: string) => (isCollection(s) ? COLLECTION_INFO[s].label : SECTION_LABELS[s] ?? s.replaceAll('-', ' '));
const pkt = (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' });
type Row = { id: number; created_at: string; actor: string | null; actor_label: string | null; action: string; section: string; entity_id: string | null; event: EventId | null; detail: Record<string, unknown> | null };

function Details({ row }: { row: Row }) {
  const d = row.detail ?? {};
  const changed = Array.isArray(d.changed) ? (d.changed as string[]) : null;
  const rest = Object.fromEntries(Object.entries(d).filter(([k]) => !['changed', 'title', 'new'].includes(k)));
  if (!changed?.length && !Object.keys(rest).length) return null;
  return <details className="admin-audit-detail"><summary>Details</summary>
    {changed && <p>{d.new ? 'Created with' : 'Changed'}: {changed.join(', ') || 'nothing'}</p>}
    {Object.keys(rest).length > 0 && <pre>{JSON.stringify(rest, null, 2)}</pre>}
  </details>;
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requirePermission('audit');
  const raw = await searchParams;
  const one = (k: string) => { const v = raw[k]; return (Array.isArray(v) ? v[0] : v) ?? ''; };
  const f = { who: one('who'), section: one('section'), event: one('event'), from: one('from'), to: one('to'), security: one('security') === '1' };
  const page = Math.max(0, Math.min(10000, Math.floor(Number(one('page')) || 0)));
  const staff = await readAll('admin_users', 'user_id,display_name', 'user_id');
  let query = database().from('audit_log').select('id,created_at,actor,actor_label,action,section,entity_id,event,detail', { count: 'exact' });
  query = scopeEvent(query, user);
  if (f.security) query = query.eq('section', 'security');
  else if (f.section) query = query.eq('section', f.section);
  if (f.who === 'system') query = query.is('actor', null);
  else if (/^[0-9a-f-]{36}$/.test(f.who)) query = query.eq('actor', f.who);
  if (f.event === 'shared') query = query.is('event', null);
  else if (f.event === 'gimun' || f.event === 'moot-cup') query = query.eq('event', f.event);
  if (/^\d{4}-\d{2}-\d{2}$/.test(f.from)) query = query.gte('created_at', new Date(`${f.from}T00:00:00+05:00`).toISOString());
  if (/^\d{4}-\d{2}-\d{2}$/.test(f.to)) query = query.lt('created_at', new Date(new Date(`${f.to}T00:00:00+05:00`).getTime() + 86400000).toISOString());
  const { data, error, count } = await query.order('id', { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
  if (error) throw new Error('The activity log could not be loaded.');
  const rows = (data ?? []) as Row[];
  const filters = new URLSearchParams(Object.entries({ who: f.who, section: f.section, event: f.event, from: f.from, to: f.to, security: f.security ? '1' : '' }).filter(([, v]) => v));
  const sectionsSeen = ['security', 'users', 'people', 'inbox', 'email', 'event-day', 'allocations', 'certificates', 'feedback', 'export', 'media', 'site', 'close-out', ...Object.keys(COLLECTION_INFO)];
  return <>
    <AdminNav user={user} />
    <AdminPageHeader title="Activity log" description="Every change, export, sign-in and permanent deletion: who did it, when, and for which event. Entries cannot be edited or deleted." actions={user.role === 'owner' ? <a className="admin-button admin-button--ghost" href={`/admin/export?type=audit&${filters}`} download>Export CSV</a> : undefined} />
    <form className="admin-card admin-audit-filters">
      <label>Person<select name="who" defaultValue={f.who}><option value="">Anyone</option>{staff.map((s) => <option key={String(s.user_id)} value={String(s.user_id)}>{String(s.display_name)}</option>)}<option value="system">Automatic (no person)</option></select></label>
      <label>Area<select name="section" defaultValue={f.section}><option value="">Everything</option>{sectionsSeen.map((s) => <option key={s} value={s}>{sectionLabel(s)}</option>)}</select></label>
      {coversBothEvents(user) && <label>Event<select name="event" defaultValue={f.event}><option value="">Both</option><option value="gimun">GIMUN</option><option value="moot-cup">GMC</option><option value="shared">Shared only</option></select></label>}
      <label>From<input type="date" name="from" defaultValue={f.from} /></label>
      <label>To<input type="date" name="to" defaultValue={f.to} /></label>
      <label className="admin-audit-check"><input type="checkbox" name="security" value="1" defaultChecked={f.security} /> Sign-in & security only</label>
      <div className="editor-bar__actions"><Link href="/admin/audit">Clear</Link><button>Apply filters</button></div>
    </form>
    <div className="admin-card admin-table admin-datatable" role="region" aria-label="Activity" tabIndex={0}>
      <h2>{count ?? rows.length} {count === 1 ? 'entry' : 'entries'}</h2>
      {rows.length ? <table>
        <thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">What</th><th scope="col">Where</th><th scope="col">Event</th></tr></thead>
        <tbody>{rows.map((r) => {
          const title = typeof r.detail?.title === 'string' ? r.detail.title : null;
          const href = isCollection(r.section) && r.entity_id && !['delete-permanently'].includes(r.action) ? `/admin/content/${r.section}/${encodeURIComponent(r.entity_id)}` : r.section === 'inbox' && r.entity_id && r.action !== 'delete-permanently' ? `/admin/inbox/${r.entity_id}` : null;
          return <tr key={r.id}>
            <td data-label="When">{pkt(r.created_at)}</td>
            <td data-label="Who">{r.actor_label ?? (r.actor ? 'A removed account' : <span className="admin-muted">Automatic</span>)}</td>
            <td data-label="What"><strong>{ACTIONS[r.action] ?? r.action.replaceAll('-', ' ')}</strong>{(title || r.entity_id) && <><br /><small>{href ? <Link href={href}>{title ?? r.entity_id}</Link> : title ?? (r.section === 'security' ? null : r.entity_id)}</small></>}<Details row={r} /></td>
            <td data-label="Where">{sectionLabel(r.section)}</td>
            <td data-label="Event">{r.event ? EVENT_LABELS[r.event] : <span className="admin-muted">Shared</span>}</td>
          </tr>;
        })}</tbody>
      </table> : <div className="admin-empty"><p><strong>Nothing matches these filters.</strong></p></div>}
    </div>
    {(count ?? 0) > PAGE && <nav className="admin-pagination" aria-label="Pages">
      {page > 0 && <Link href={`?${filters}&page=${page - 1}`}>Newer</Link>}
      <span>Page {page + 1} of {Math.ceil((count ?? 0) / PAGE)}</span>
      {(count ?? 0) > (page + 1) * PAGE && <Link href={`?${filters}&page=${page + 1}`}>Older</Link>}
    </nav>}
  </>;
}
