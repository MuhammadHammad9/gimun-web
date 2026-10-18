import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/server/admin/auth';
import { can, EVENT_LABELS } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { readAll } from '@/lib/server/admin/read-all';
import { AdminNav } from '../../AdminNav';
import { AdminPageHeader } from '../../AdminPageHeader';
import { InquiryActions } from '../../InquiryActions';
import { OperationForm } from '../../OperationForm';
import { assertInScope, eventOfTrack } from '@/lib/server/admin/scope';
import { TrashButton } from '../../ui/TrashButton';
import { RestoreBanner } from '../../RestoreBanner';
import { emailReachesVisitors } from '@/lib/server/config';
import { Mail } from 'lucide-react';

const pkt = (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' });
const TOPICS: Record<string, string> = { gimun: 'GIMUN', 'moot-cup': 'GMC', sponsorship: 'Sponsorship', media: 'Media', other: 'Other' };

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission('inbox');
  const { id } = await params;
  const { data, error } = await database().from('contact_messages').select('*').eq('id', id).maybeSingle();
  if (error || !data) notFound();
  const event = eventOfTrack(data.event);
  assertInScope(user, event);
  const write = can(user, 'inbox', true);
  const staff = write ? await readAll('admin_users', 'user_id,display_name,active', 'user_id') : [];
  const active = staff.filter((u) => u.active);
  // Every email sent about this message, newest first: replies show whether they really left.
  const { data: sent } = await database().from('email_outbox').select('id,message_type,status,last_error,created_at,sent_at').eq('contact_id', data.id).eq('message_type', 'reply').order('created_at', { ascending: false });
  const reachable = emailReachesVisitors();
  // Quoted under the reply; kept short so the mailto link stays within what email apps accept.
  const quoted = String(data.message ?? '').slice(0, 1500).split(/\r?\n/).map((line: string) => `> ${line}`).join('\n');
  const mailto = `mailto:${data.email}?subject=${encodeURIComponent('Re: Your GIMUN & GMC inquiry')}&body=${encodeURIComponent(`Dear ${data.name},\n\n\n\n---\nYour message of ${pkt(data.submitted_at ?? data.created_at)}:\n${quoted}`)}`;
  return <>
    <AdminNav user={user} />
    <AdminPageHeader
      title={data.name}
      actions={write && !data.deleted_at ? <TrashButton kind="inbox" itemKey={{ id: data.id }} title={data.name} after="/admin/inbox" /> : undefined}
      crumbs={[{ label: 'Messages', href: '/admin/inbox' }]}
      description={<>{data.kind === 'clarification' ? 'Clarification request' : 'Message'} about {TOPICS[data.query_type] ?? data.query_type}{event ? ` (${EVENT_LABELS[event]})` : ''} · received {pkt(data.submitted_at ?? data.created_at)}</>}
    />
    {data.deleted_at && <RestoreBanner kind="inbox" itemKey={{ id: data.id }} canRestore={write} />}
    <div className="admin-card">
      <p><a href={`mailto:${data.email}`}>{data.email}</a> · <span className="admin-status">{String(data.handled_status).replaceAll('-', ' ')}</span></p>
      <p className="whitespace-pre-wrap">{data.message}</p>
      {data.reply_note && <p className="admin-muted"><strong>Note:</strong> {data.reply_note}</p>}
      <p><a className="admin-button admin-button--ghost" href={mailto}><Mail size={15} aria-hidden="true" /> Reply from your own email</a></p>
      <p className="admin-muted">Opens your email app with their address, a subject and their message quoted. Use it any time, for example from the team&apos;s Gmail.</p>
    </div>
    {(sent ?? []).length > 0 && <section className="admin-card" aria-labelledby="replies-title">
      <h2 id="replies-title">Replies sent from the admin</h2>
      <ul className="admin-reply-log">{(sent ?? []).map((m) => {
        const failed = ['failed', 'needs_review', 'cancelled'].includes(String(m.status));
        return <li key={String(m.id)}>
          <span className={`admin-pill admin-pill--${m.status === 'sent' ? 'live' : failed ? 'warn' : 'info'}`}>{m.status === 'sent' ? 'Delivered to the email service' : failed ? 'Not delivered' : 'Waiting to send'}</span>{' '}
          <small>{pkt(String(m.created_at))}</small>
          {failed && <p className="admin-field-error">{/403/.test(String(m.last_error)) ? 'The email service refused it: the sender address is not verified, so it can only email the account owner. Reply from your own email instead, and see the note below.' : String(m.last_error ?? 'The email could not be sent.')}</p>}
        </li>;
      })}</ul>
    </section>}
    {!reachable && <p className="admin-callout" role="note"><strong>Replies from the admin cannot reach visitors yet.</strong> The site sends email from Resend&apos;s test address, which only delivers to the Resend account owner. Until a domain is verified in Resend and EMAIL_FROM uses it, reply from your own email above.</p>}
    {write && <OperationForm operation="inbox" title="Status and follow-up"
      initial={{ id: data.id, status: data.handled_status, note: data.reply_note ?? '', assignee: data.assignee ?? '' }}
      schema={{ type: 'object', properties: {
        status: { enum: ['new', 'read', 'replied', 'archived'], optionLabels: { new: 'New', read: 'Read', replied: 'Replied', archived: 'Archived' } },
        note: { type: 'string' },
        assignee: { enum: ['', ...active.map((u) => String(u.user_id))], optionLabels: { '': 'Nobody', ...Object.fromEntries(staff.map((u) => [String(u.user_id), String(u.display_name)])) } },
      } }} />}
    {write && <InquiryActions inquiry={data} canPromote={can(user, 'clarifications', true)} canEmail={can(user, 'email', true)} />}
  </>;
}
