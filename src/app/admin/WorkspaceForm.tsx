'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveAdminSettings } from './workspace-actions';
import { useDirtyGuard } from './useDirtyGuard';
import { useStepUp } from './ui/StepUp';

type Tool = { id: string; label: string; description: string };

export function WorkspaceForm({ tools, modules, trashDays, version }: { tools: Tool[]; modules: Record<string, boolean>; trashDays: number; version: number }) {
  const [on, setOn] = useState(modules);
  const [days, setDays] = useState(trashDays);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const [guard, stepUpDialog] = useStepUp();
  useDirtyGuard(dirty);

  function save(event: React.FormEvent) {
    event.preventDefault();
    start(async () => {
      const result = await guard(() => saveAdminSettings({ modules: on, trashDays: days, version }));
      if (!result) return;
      setFailed(Boolean(result.error));
      setMessage(result.error || 'Saved. The menu and pages follow these settings now.');
      if (!result.error) { setDirty(false); router.refresh(); }
    });
  }

  return <form className="admin-card admin-workspace" onSubmit={save} data-admin-dirty={dirty ? 'true' : undefined}>
    {stepUpDialog}
    <fieldset disabled={pending}>
      <legend><h2>Tools</h2></legend>
      <p className="admin-muted">Switching a tool off hides it from every admin and stops its actions. Its records are kept, and switching it back on brings everything back.</p>
      <ul className="admin-toggle-list">
        {tools.map((tool) => <li key={tool.id}>
          <label>
            <input type="checkbox" checked={on[tool.id] !== false} onChange={(e) => { setDirty(true); setOn({ ...on, [tool.id]: e.target.checked }); }} />
            <span><strong>{tool.label}</strong><small>{tool.description}</small></span>
          </label>
        </li>)}
      </ul>
    </fieldset>
    <fieldset disabled={pending}>
      <legend><h2>Trash</h2></legend>
      <label htmlFor="trash-days">Delete items in Trash permanently after (days)</label>
      <small className="admin-field-hint" id="trash-days-hint">0 keeps them until someone deletes them by hand.</small>
      <input id="trash-days" aria-describedby="trash-days-hint" type="number" min={0} max={365} value={days} onChange={(e) => { setDirty(true); setDays(Number(e.target.value)); }} />
    </fieldset>
    <div className="editor-bar__actions"><button type="submit" disabled={pending || !dirty}>{pending ? 'Saving…' : 'Save admin settings'}</button></div>
    {message && <p role="status" className={failed ? 'editor-message is-error' : 'editor-message'}>{message}</p>}
  </form>;
}
