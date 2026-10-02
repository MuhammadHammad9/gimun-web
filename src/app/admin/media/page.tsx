import { Search } from 'lucide-react';
import { requirePermission } from '@backend/server/admin/auth';
import { can } from '@backend/server/admin/permissions';
import { AdminNav } from '../AdminNav';
import { AdminPageHeader } from '../AdminPageHeader';
import { MediaLibrary } from '../MediaLibrary';
import { MediaUpload } from '../MediaUpload';

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requirePermission('media');
  const { q = '' } = await searchParams;
  return <>
    <AdminNav user={user} />
    <AdminPageHeader
      title="Media library"
      description="Every image and PDF uploaded for the website. Upload here, or straight from an image field while you edit; either way the file is checked and then appears in every picker."
    />
    {can(user, 'media', true) && <MediaUpload />}
    <form className="admin-list__tools" role="search">
      <label className="admin-search"><span className="sr-only">Search the library</span><Search size={16} aria-hidden="true" /><input name="q" defaultValue={q} placeholder="Search by description" /></label>
      <button className="secondary">Search</button>
    </form>
    <MediaLibrary search={q} />
  </>;
}
