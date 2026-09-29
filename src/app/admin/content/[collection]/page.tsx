import Link from 'next/link';
import { z } from 'zod';
import { registry } from '@/lib/content/registry';
import { BulkContentEditor } from '../../BulkContentEditor';
import type { Schema } from '../../SchemaForm';
import { notFound } from 'next/navigation';
import { isCollection } from '@/lib/content/registry';
import { requirePermission } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { EmergencyEditor } from '../../EmergencyEditor';
import { AdminNav } from '../../AdminNav';
export default async function CollectionPage({ params,searchParams }: { params: Promise<{ collection: string }>;searchParams:Promise<{page?:string;q?:string}> }) {
  const { collection } = await params; if (!isCollection(collection)) notFound();
  const user = await requirePermission(collection);
  const query=await searchParams;const page=Math.max(0,Math.min(100000,Math.floor(Number(query.page)||0)));
  let entries=database().from('content_entries').select('*',{count:'exact'}).eq('collection',collection);
  const search=(query.q||'').replace(/[%_,()]/g,'').slice(0,100);
  if(search)entries=entries.or(['title','name','question','awardName'].map(k=>`data->>${k}.ilike.%${search}%`).join(','));
  const {data,error,count}=await entries.order('sort_order').order('id').range(page*50,page*50+49);
  const live=await database().from('effective_content').select('id,version').eq('collection',collection).in('id',(data||[]).map(e=>e.id));
  if (error) throw new Error('Unable to load content. Apply the CMS migrations and seed first.');
  const activePin=collection==='schedule'?await database().from('effective_content').select('id').eq('collection','announcements').eq('data->>pinnedFlag','true').maybeSingle():{data:null};
  const {data:pinned}=activePin.data?await database().from('content_entries').select('*').eq('collection','announcements').eq('id',activePin.data.id).single():{data:null};
  return <><AdminNav user={user} /><h1>{collection.replaceAll('-',' ')}</h1><p className="admin-description">Manage working drafts and public releases. Saving a draft leaves the current website unchanged.</p>{['results','gallery'].includes(collection)&&can(user,collection,true)&&<BulkContentEditor collection={collection} schema={z.toJSONSchema(registry[collection]) as Schema}/>}{collection==='schedule'&&can(user,'schedule',true)&&can(user,'announcements',true)&&<EmergencyEditor sessions={data} pinned={pinned}/>}{can(user,collection,true) && <Link href={`/admin/content/${collection}/new`}>Create draft</Link>}<form className="admin-card admin-toolbar"><label>Search content<input name="q" defaultValue={query.q}/></label><button>Search</button></form><div className="admin-card overflow-x-auto"><table><thead><tr><th>Entry</th><th>Working state</th><th>Live state</th><th>Version</th></tr></thead><tbody>{data.map(e => <tr key={e.id}><td><Link href={`/admin/content/${collection}/${e.id}`}>{e.data.title || e.data.name || e.data.question || e.data.awardName || e.id}</Link></td><td>{e.status==='draft'?'Draft':e.status==='archived'?'Archived':e.publish_at&&new Date(e.publish_at)>new Date()?'Scheduled':'Published source'}</td><td>{live.data?.some(r=>r.id===e.id)?'Public':'Not public'}</td><td>{e.version}</td></tr>)}</tbody></table>{!data.length && <p>No entries yet. Create your first draft.</p>}</div><nav className="admin-pagination">{page>0&&<Link href={`?page=${page-1}&q=${encodeURIComponent(search)}`}>Previous page</Link>}<span>Page {page+1}</span>{(count||0)>(page+1)*50&&<Link href={`?page=${page+1}&q=${encodeURIComponent(search)}`}>Next page</Link>}</nav></>;
}
