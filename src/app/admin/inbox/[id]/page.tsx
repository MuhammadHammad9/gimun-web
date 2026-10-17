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
  return <>
    <AdminNav user={user} />
    <AdminPageHeader
      title={data.name}
      crumbs={[{ label: 'Messages', href: '/admin/inbox' }]}
      description={<>{data.kind === 'clarification' ? 'Clarification request' : 'Message'} about {TOPICS[data.query_type] ?? data.query_type}{event ? ` (${EVENT_LABELS[event]})` : ''} · received {pkt(data.submitted_at ?? data.created_at)}</>}
    />
    <div className="admin-card">
      <p><a href={`mailto:${data.email}`}>{data.email}</a> · <span className="admin-status">{String(data.handled_status).replaceAll('-', ' ')}</span></p>
      <p className="whitespace-pre-wrap">{data.message}</p>
      {data.reply_note && <p className="admin-muted"><strong>Note:</strong> {data.reply_note}</p>}
    </div>
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
