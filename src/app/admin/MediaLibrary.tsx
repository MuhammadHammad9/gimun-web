import Link from 'next/link';
import { readAll } from '@/lib/server/admin/read-all';
import { database } from '@/lib/server/supabase';
import { requirePermission } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
export async function MediaLibrary(){
  const user=await requirePermission('media');const [assets,entries]=await Promise.all([readAll('media_assets'),readAll('content_entries','collection,id,data')]);
  return <section className="admin-card"><h2>Media links and usage</h2>{assets.map(asset=>{const url=database().storage.from('media').getPublicUrl(String(asset.path)).data.publicUrl;const used=entries.filter(e=>can(user,String(e.collection))&&JSON.stringify(e.data).includes(url));return <div key={String(asset.id)} className="border-b py-3"><p>{String(asset.alt)}</p><a href={url} target="_blank" rel="noreferrer">Open media</a><input aria-label={`Media URL: ${asset.alt}`} readOnly value={url}/><p>Used in: {used.length?used.map(e=><Link className="mr-3" key={`${e.collection}/${e.id}`} href={`/admin/content/${e.collection}/${e.id}`}>{String(e.collection)} / {String(e.id)}</Link>):'No accessible content entries'}</p></div>;})}</section>;
}
