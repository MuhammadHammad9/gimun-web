import { requirePermission } from '@/lib/server/admin/auth';
import { adminSettings, MODULES } from '@/lib/server/admin/modules';
import { AdminNav } from '../AdminNav';
import { AdminPageHeader } from '../AdminPageHeader';
import { WorkspaceForm } from '../WorkspaceForm';

export default async function WorkspacePage() {
  const user = await requirePermission('users', true);
  const settings = await adminSettings();
  const tools = Object.entries(MODULES).map(([id, m]) => ({ id, label: m.label, description: m.description }));
  const modules = Object.fromEntries(tools.map((t) => [t.id, settings.modules[t.id as keyof typeof settings.modules] !== false]));
  return <>
    <AdminNav user={user} />
    <AdminPageHeader title="Admin settings" description="Which tools the admin offers, and how long deleted items wait in Trash. Only owners see this page." />
    {settings.version === 0 && <p className="admin-callout" role="alert">These settings are not stored yet. Apply database migration 0015 to save changes.</p>}
    <WorkspaceForm tools={tools} modules={modules} trashDays={settings.trashDays} version={settings.version} />
  </>;
}
