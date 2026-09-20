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
export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params; if (!isCollection(collection)) notFound();
  const user = await requirePermission(collection);
  const { data,error } = await database().from('content_entries').select('*').eq('collection',collection).order('sort_order');
  if (error) throw new Error('Unable to load content. Apply the CMS migrations and seed first.');
  const {data:pinned}=collection==='schedule'?await database().from('content_entries').select('*').eq('collection','announcements').eq('status','published').eq('data->>pinnedFlag','true').maybeSingle():{data:null};
  return <><AdminNav user={user} /><h1>{collection}</h1>{['results','gallery'].includes(collection)&&can(user,collection,true)&&<BulkContentEditor collection={collection} schema={z.toJSONSchema(registry[collection]) as Schema}/>}{collection==='schedule'&&can(user,'schedule',true)&&can(user,'announcements',true)&&<EmergencyEditor sessions={data} pinned={pinned}/>}{can(user,collection,true) && <Link href={`/admin/content/${collection}/new`}>Create draft</Link>}<div className="admin-card overflow-x-auto"><table><thead><tr><th>Entry</th><th>State</th><th>Version</th></tr></thead><tbody>{data.map(e => <tr key={e.id}><td><Link href={`/admin/content/${collection}/${e.id}`}>{e.data.title || e.data.name || e.data.question || e.data.awardName || e.id}</Link></td><td>{e.status}</td><td>{e.version}</td></tr>)}</tbody></table>{!data.length && <p>No entries. Create a draft or seed the database.</p>}</div></>;
}
