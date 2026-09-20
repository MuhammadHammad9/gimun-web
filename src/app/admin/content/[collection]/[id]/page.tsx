import { readAll } from '@/lib/server/admin/read-all';
import { getDocuments } from '@/lib/content';
import { randomUUID } from 'node:crypto';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { isCollection, registry, type ContentEntry } from '@/lib/content/registry';
import { requirePermission } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { AdminNav } from '../../../AdminNav';
import { ContentEditor } from '../../../ContentEditor';
import type { Schema } from '../../../SchemaForm';
export default async function EntryPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection,id } = await params; if (!isCollection(collection)) notFound();
  const user = await requirePermission(collection);
  const schema = z.toJSONSchema(registry[collection]) as Schema;
  let entry: ContentEntry = { collection,id:'',status:'draft',sort_order:0,publish_at:null,expire_at:null,data:{id:`${collection}-${randomUUID()}`},version:0 };
  if (id !== 'new') { const { data,error } = await database().from('content_entries').select('*').eq('collection',collection).eq('id',id).single(); if(error || !data) notFound(); entry=data; }
  const { data: revisions } = await database().from('content_revisions').select('id,created_at').eq('collection',collection).eq('entry_id',id).order('id',{ascending:false});
  const media=can(user,'media')?(await readAll('media_assets')).map(a=>({url:database().storage.from('media').getPublicUrl(String(a.path)).data.publicUrl,alt:String(a.alt),mime:String(a.mime),size:Number(a.size)})):[];
  const resources=await getDocuments();
  return <><AdminNav user={user} /><h1>{id === 'new' ? 'New draft' : id}</h1><ContentEditor key={id} initial={entry} schema={schema} media={media} resources={resources} upload={can(user,'media',true)} readOnly={!can(user,collection,true)} revisions={revisions || []} /></>;
}
