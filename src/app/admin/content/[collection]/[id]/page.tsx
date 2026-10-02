import { readAll } from '@backend/server/admin/read-all';
import { getSiteConfig, getDocuments } from '@backend/lib/content';
import { randomUUID } from 'node:crypto';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { isCollection, registry, type ContentEntry } from '@shared/lib/content/registry';
import { requirePermission } from '@backend/server/admin/auth';
import { can } from '@backend/server/admin/permissions';
import { database } from '@backend/server/supabase';
import { AdminNav } from '../../../AdminNav';
import { ContentEditor } from '../../../ContentEditor';
import type { Schema } from '../../../SchemaForm';
import { toSerializable } from '../../../serializable';
import { AdminPageHeader } from '../../../AdminPageHeader';
import { COLLECTION_INFO, entryTitle } from '../../../collection-info';
import { previewPath } from '@backend/lib/content/preview';
export default async function EntryPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection,id } = await params; if (!isCollection(collection)) notFound();
  const user = await requirePermission(collection);
  const schema = toSerializable(z.toJSONSchema(registry[collection])) as Schema;
  let entry: ContentEntry = { collection,id:'',status:'draft',sort_order:0,publish_at:null,expire_at:null,data:{id:`${collection}-${randomUUID()}`},version:0 };
  if (id !== 'new') { const { data,error } = await database().from('content_entries').select('*').eq('collection',collection).eq('id',id).single(); if(error || !data) notFound(); entry=data; }
  const { data: revisions } = await database().from('content_revisions').select('id,created_at').eq('collection',collection).eq('entry_id',id).order('id',{ascending:false});
  const media=can(user,'media')?(await readAll('media_assets')).filter(a=>a.state==='available').map(a=>({path:String(a.path),url:database().storage.from('media').getPublicUrl(String(a.path)).data.publicUrl,alt:String(a.alt),mime:String(a.mime),size:Number(a.size)})):[];
  const resources=await getDocuments();
  const [live,scheduled,site]=await Promise.all([database().from('effective_content').select('version').eq('collection',collection).eq('id',id).maybeSingle(),database().from('content_publications').select('effective_at').eq('collection',collection).eq('entry_id',id).is('cancelled_at',null).gt('effective_at',new Date().toISOString()).order('effective_at').limit(1),getSiteConfig()]);
  const info = COLLECTION_INFO[collection];
  const title = id === 'new' ? `New ${info.singular}` : entryTitle(entry.data, `Untitled ${info.singular}`);
  return <><AdminNav user={user} /><AdminPageHeader title={title} crumbs={[{ label: info.label, href: `/admin/content/${collection}` }]} description={id === 'new' ? info.description : undefined} /><ContentEditor singular={info.singular} publicPath={previewPath(collection, entry.data)} liveVersion={live.data?.version??null} scheduledAt={scheduled.data?.[0]?.effective_at??null} resultsReleased={site.resultsPublished} key={id} initial={toSerializable(entry)} schema={schema} media={toSerializable(media)} resources={toSerializable(resources)} upload={can(user,'media',true)} readOnly={!can(user,collection,true)} revisions={toSerializable(revisions || [])} /></>;
}
