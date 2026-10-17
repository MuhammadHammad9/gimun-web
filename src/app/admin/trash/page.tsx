import { requireAdmin } from '@/lib/server/admin/auth';
import { adminSettings } from '@/lib/server/admin/modules';
import { listTrash } from '@/lib/server/admin/trash';
import { AdminNav } from '../AdminNav';
import { AdminPageHeader } from '../AdminPageHeader';
import { TrashList } from '../TrashList';
import { toSerializable } from '../serializable';

export default async function TrashPage() {
  const user = await requireAdmin();
  const [items, settings] = await Promise.all([listTrash(user), adminSettings()]);
  const canDelete = user.role === 'owner' || user.role === 'admin';
  return <>
    <AdminNav user={user} />
    <AdminPageHeader title="Trash" description={<>Deleted items wait here{settings.trashDays > 0 ? ` for ${settings.trashDays} days, then they are deleted for good automatically` : ' until someone deletes them for good'}. {canDelete ? 'Restore anything moved here by mistake, or delete it permanently.' : 'You can restore things; owners and admins delete them permanently.'}</>} />
    <TrashList items={toSerializable(items)} trashDays={settings.trashDays} />
  </>;
}
