'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, LogOut, Plus, ShieldCheck, ShieldOff, Trash2, UserCog } from 'lucide-react';
import { sections, events, EVENT_LABELS } from '@/lib/server/admin/permissions';
import { manageUser, removeAdmin, resetTwoStep, signOutEverywhere } from './user-actions';
import { useConfirm } from './ui/ConfirmDialog';
import { useNotice } from './ui/Notice';
import { useStepUp } from './ui/StepUp';
import { useDirtyGuard } from './useDirtyGuard';

export type Account = { user_id: string; display_name: string; email: string; role: string; events: string[]; sections: string[]; active: boolean; lastSignIn: string | null; twoStep: boolean | null };

const JOBS: { role: string; label: string; text: string }[] = [
  { role: 'owner', label: 'Owner', text: 'Everything, including admin accounts and admin settings. Always both events.' },
  { role: 'admin', label: 'Admin', text: 'Everything in their events except admin accounts. Can delete permanently.' },
  { role: 'editor', label: 'Content editor', text: 'Website content and the media library.' },
  { role: 'registrar', label: 'Registrar', text: 'Messages, email, check-in, allocations, certificates and the survey.' },
  { role: 'checkin', label: 'Check-in staff', text: 'Ticket scanning and arrival on event day only.' },
  { role: 'viewer', label: 'Viewer', text: 'Can look around; cannot change or export anything.' },
];
const jobLabel = (role: string) => JOBS.find((j) => j.role === role)?.label ?? role;
const pkt = (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' });

export function AdminAccounts({ accounts, me }: { accounts: Account[]; me: string }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [confirm, confirmDialog] = useConfirm();
  const [guard, stepUpDialog] = useStepUp();
  const notice = useNotice();
  const router = useRouter();
  const current = editing === 'new' ? null : accounts.find((a) => a.user_id === editing) ?? null;

  function run(action: () => Promise<{ error?: string; result?: string; stepUp?: 'code' | 'enrol' }>, after?: () => void) {
    start(async () => {
      try {
        const result = await guard(action);
        if (!result) return;
        notice({ text: result.error || result.result || 'Done.', tone: result.error ? 'error' : 'success' });
        if (!result.error) { after?.(); router.refresh(); }
      } catch {
        notice({ text: 'The request could not finish. Check your connection and try again.', tone: 'error' });
      }
    });
  }
  async function remove(a: Account) {
    if (!(await confirm({ title: `Remove ${a.display_name}'s account?`, tone: 'danger', confirmLabel: 'Remove account', typeToConfirm: a.display_name,
      body: 'They can no longer sign in, and the account cannot be brought back. Their past changes keep their name in the activity log.',
      impact: ['Deletes the sign-in and access profile', 'Ends all of their sessions'] }))) return;
    run(() => removeAdmin(a.user_id, a.display_name), () => setEditing(null));
  }

  return <>
    {confirmDialog}{stepUpDialog}
    <div className="admin-card admin-table admin-datatable" role="region" aria-label="Admin accounts" tabIndex={0}>
      <div className="admin-section-heading"><h2>{accounts.length} accounts</h2><button type="button" onClick={() => setEditing('new')}><Plus size={15} aria-hidden="true" /> Add an admin</button></div>
      <table>
        <thead><tr><th scope="col">Name</th><th scope="col">Job</th><th scope="col">Events</th><th scope="col">Two-step</th><th scope="col">Last sign-in</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{accounts.map((a) => <tr key={a.user_id}>
          <td data-label="Name"><strong>{a.display_name}</strong>{a.user_id === me && <small> (you)</small>}<br /><small>{a.email}</small></td>
          <td data-label="Job">{jobLabel(a.role)}{a.sections.length > 0 && <small><br />custom sections</small>}</td>
          <td data-label="Events">{a.role === 'owner' || a.events.length === events.length ? 'Both' : a.events.map((e) => EVENT_LABELS[e as keyof typeof EVENT_LABELS] ?? e).join(', ')}</td>
          <td data-label="Two-step">{a.twoStep === null ? <span className="admin-muted">—</span> : a.twoStep ? <span className="admin-status"><ShieldCheck size={12} aria-hidden="true" /> On</span> : <span className="admin-muted">Off</span>}</td>
          <td data-label="Last sign-in">{a.lastSignIn ? pkt(a.lastSignIn) : <span className="admin-muted">Never</span>}</td>
          <td data-label="Status"><span className="admin-status">{a.active ? 'Active' : 'Deactivated'}</span></td>
          <td className="admin-datatable__actions"><button type="button" className="secondary" onClick={() => setEditing(a.user_id)}><UserCog size={14} aria-hidden="true" /> Manage</button></td>
        </tr>)}</tbody>
      </table>
    </div>
    {editing && <AccountEditor key={editing} account={current} me={me} pending={pending}
      onCancel={() => setEditing(null)}
      onSave={(values) => run(() => manageUser(values), () => setEditing(null))}
      onResetTwoStep={async (a) => { if (await confirm({ title: `Reset two-step sign-in for ${a.display_name}?`, body: 'Their authenticator stops working and they are signed out everywhere. Use this when a phone is lost or replaced.', confirmLabel: 'Reset two-step', tone: 'danger' })) run(() => resetTwoStep(a.user_id)); }}
      onSignOut={async (a) => { if (await confirm({ title: `Sign ${a.display_name} out everywhere?`, body: 'Every browser where they are signed in has to sign in again.', confirmLabel: 'Sign out everywhere' })) run(() => signOutEverywhere(a.user_id)); }}
      onRemove={remove} />}
  </>;
}

function AccountEditor({ account, me, pending, onCancel, onSave, onResetTwoStep, onSignOut, onRemove }: {
  account: Account | null; me: string; pending: boolean; onCancel: () => void; onSave: (values: Record<string, unknown>) => void;
  onResetTwoStep: (a: Account) => void; onSignOut: (a: Account) => void; onRemove: (a: Account) => void;
}) {
  const [role, setRole] = useState(account?.role ?? 'editor');
  const [dirty, setDirty] = useState(false);
  useDirtyGuard(dirty);
  const self = account?.user_id === me;
  return <form className="admin-card" data-admin-dirty={dirty ? 'true' : undefined} onChange={() => setDirty(true)} onSubmit={(e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSave({ id: account?.user_id ?? '', email: f.get('email'), display_name: f.get('display_name'), role: f.get('role'), active: f.get('active') === 'on', password: f.get('password') ?? '', sections: f.getAll('sections'), events: role === 'owner' ? [...events] : f.getAll('events') });
  }}>
    <h2>{account ? `Manage ${account.display_name}` : 'Add an admin'}</h2>
    <fieldset disabled={pending}>
      <label>Name<input name="display_name" defaultValue={account?.display_name} required maxLength={100} /></label>
      <label>Email<input name="email" type="email" defaultValue={account?.email} required readOnly={Boolean(account)} /></label>
      <fieldset><legend>Job</legend>
        {JOBS.map((j) => <label key={j.role} className="admin-choice"><input type="radio" name="role" value={j.role} checked={role === j.role} disabled={self && j.role !== 'owner'} onChange={() => setRole(j.role)} /><span><strong>{j.label}</strong><small>{j.text}</small></span></label>)}
      </fieldset>
      {role !== 'owner' && <fieldset><legend>Events</legend>
        <p className="admin-muted">They only see records, messages, exports and counts for these events.</p>
        {events.map((e) => <label key={e}><input type="checkbox" name="events" value={e} defaultChecked={account ? account.events.includes(e) : true} />{EVENT_LABELS[e]}</label>)}
      </fieldset>}
      <label>{account ? 'New temporary password (leave empty to keep theirs)' : 'Temporary password (at least 12 characters)'}<input name="password" type="password" autoComplete="new-password" minLength={account ? undefined : 12} required={!account} /></label>
      <label><input type="checkbox" name="active" defaultChecked={account?.active ?? true} disabled={self} />Active (unticked: they cannot sign in)</label>
      {self && <input type="hidden" name="active" value="on" />}
      <details><summary>Advanced: limit to specific sections</summary>
        <p className="admin-muted">Leave all unticked to use the job&apos;s usual sections. Ticked sections replace them.</p>
        <div className="admin-checkbox-grid">{sections.filter((s) => !['users', 'close-out'].includes(s)).map((s) => <label key={s}><input type="checkbox" name="sections" value={s} defaultChecked={account?.sections.includes(s)} />{s.replaceAll('-', ' ')}</label>)}</div>
      </details>
      <div className="editor-bar__actions">
        <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
        <button type="submit">{pending ? 'Saving…' : account ? 'Save access' : 'Create account'}</button>
      </div>
    </fieldset>
    {account && <section className="admin-account-actions" aria-label="Account actions">
      <h3>Account actions</h3>
      <button type="button" className="secondary" disabled={pending} onClick={() => onSignOut(account)}><LogOut size={14} aria-hidden="true" /> Sign out everywhere</button>
      {account.twoStep && <button type="button" className="secondary" disabled={pending} onClick={() => onResetTwoStep(account)}><ShieldOff size={14} aria-hidden="true" /> Reset two-step sign-in</button>}
      <small className="admin-muted"><KeyRound size={12} aria-hidden="true" /> To reset a forgotten password, enter a new temporary password above and save.</small>
      {!self && <button type="button" className="secondary is-danger" disabled={pending} onClick={() => onRemove(account)}><Trash2 size={14} aria-hidden="true" /> Remove account permanently</button>}
    </section>}
  </form>;
}
