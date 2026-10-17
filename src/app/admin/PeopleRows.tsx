'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { personImpact, purgePerson, updatePerson } from './people-actions';
import { useConfirm } from './ui/ConfirmDialog';
import { useNotice } from './ui/Notice';
import { useStepUp } from './ui/StepUp';

export type Person = { id: string; name: string; email: string; role: string; registration_ref: string; event: string; checked_in_at: string | null; canPurge: boolean };
const EVENTS: Record<string, string> = { gimun: 'GIMUN', 'moot-cup': 'GMC' };

/** The roster: correct a name (it prints on certificates), or delete someone for good. */
export function PeopleRows({ people, write }: { people: Person[]; write: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [confirm, confirmDialog] = useConfirm();
  const [guard, stepUpDialog] = useStepUp();
  const notice = useNotice();
  const router = useRouter();
  const report = (r: { error?: string; result?: string } | null, after?: () => void) => {
    if (!r) return;
    notice({ text: r.error ?? r.result ?? 'Done.', tone: r.error ? 'error' : 'success' });
    if (!r.error) { after?.(); router.refresh(); }
  };
  async function remove(p: Person) {
    const impact = await personImpact(p.id);
    if ('error' in impact) { notice({ text: impact.error, tone: 'error' }); return; }
    if (!(await confirm({ title: `Delete ${p.name} permanently?`, tone: 'danger', confirmLabel: 'Delete forever', typeToConfirm: p.name,
      body: `${p.name} (${p.registration_ref}) is removed from the roster for good. This cannot be undone.`, impact: impact.lines.length ? ['Also removes:', ...impact.lines] : undefined }))) return;
    start(async () => report(await guard(() => purgePerson(p.id, p.name))));
  }
  if (!people.length) return <div className="admin-empty"><p><strong>No one on the roster yet.</strong></p><p>Import the Google Forms responses above, or add people one by one.</p></div>;
  return <div className="admin-card admin-table admin-datatable" role="region" aria-label="People" tabIndex={0}>
    {confirmDialog}{stepUpDialog}
    <table>
      <thead><tr><th scope="col">Name</th><th scope="col">Reference</th><th scope="col">Event</th><th scope="col">Role</th><th scope="col">Checked in</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{people.map((p) => editing === p.id
        ? <tr key={p.id}><td colSpan={6}>
          <form className="admin-person-edit" onSubmit={(e) => {
            e.preventDefault(); const f = new FormData(e.currentTarget);
            start(async () => report(await updatePerson({ id: p.id, name: String(f.get('name')), email: String(f.get('email')), role: String(f.get('role')) }), () => setEditing(null)));
          }}>
            <label>Name (as printed on certificates)<input name="name" defaultValue={p.name} required minLength={2} /></label>
            <label>Email<input name="email" type="email" defaultValue={p.email} required /></label>
            <label>Role<input name="role" defaultValue={p.role} /></label>
            <div className="editor-bar__actions"><button type="button" className="secondary" onClick={() => setEditing(null)}>Cancel</button><button type="submit" disabled={pending}>Save</button></div>
          </form>
        </td></tr>
        : <tr key={p.id}>
          <td data-label="Name"><strong>{p.name}</strong><br /><small>{p.email}</small></td>
          <td data-label="Reference"><code>{p.registration_ref}</code></td>
          <td data-label="Event">{EVENTS[p.event] ?? p.event}</td>
          <td data-label="Role">{p.role.replaceAll('-', ' ')}</td>
          <td data-label="Checked in">{p.checked_in_at ? new Date(p.checked_in_at).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' }) : <span className="admin-muted">Not yet</span>}</td>
          <td className="admin-datatable__actions">
            {write && <button type="button" className="secondary admin-compact" onClick={() => setEditing(p.id)}><Pencil size={14} aria-hidden="true" /> Edit</button>}
            {p.canPurge && <button type="button" className="secondary is-danger admin-compact" disabled={pending} onClick={() => remove(p)}><Trash2 size={14} aria-hidden="true" /> Delete</button>}
          </td>
        </tr>)}</tbody>
    </table>
  </div>;
}
