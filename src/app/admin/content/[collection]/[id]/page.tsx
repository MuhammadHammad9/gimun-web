import { readAll, teamCategories } from '@/lib/server/admin/read-all';
import { getSiteConfig, getDocuments } from '@/lib/content';
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
import { toSerializable } from '../../../serializable';
import { AdminPageHeader } from '../../../AdminPageHeader';
import { COLLECTION_INFO, entryTitle } from '../../../collection-info';
import { previewPath } from '@/lib/content/preview';
import { assertInScope, eventOfEntry } from '@/lib/server/admin/scope';
import { RestoreBanner } from '../../../RestoreBanner';
export default async function EntryPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection,id } = await params; if (!isCollection(collection)) notFound();
  const user = await requirePermission(collection);
  const schema = toSerializable(z.toJSONSchema(registry[collection])) as Schema;
  let entry: ContentEntry = { collection,id:'',status:'draft',sort_order:0,publish_at:null,expire_at:null,data:{id:`${collection}-${randomUUID()}`},version:0 };
  if (id !== 'new') { const { data,error } = await database().from('content_entries').select('*').eq('collection',collection).eq('id',id).single(); if(error || !data) notFound(); entry=data; assertInScope(user, eventOfEntry(collection, entry.data)); }
  const { data: revisions } = await database().from('content_revisions').select('id,created_at').eq('collection',collection).eq('entry_id',id).order('id',{ascending:false});
  const media=can(user,'media')?(await readAll('media_assets')).filter(a=>a.state==='available'&&!a.deleted_at).map(a=>({path:String(a.path),url:database().storage.from('media').getPublicUrl(String(a.path)).data.publicUrl,alt:String(a.alt),mime:String(a.mime),size:Number(a.size)})):[];
  // The team editor picks a category; committees and case categories pick a document.
  const resources=collection==='team'?(await teamCategories()).map(c=>({id:c.id,title:c.name})):await getDocuments();
  // A new team member starts in the first category, so the form is valid as it opens.
  if(collection==='team'&&id==='new'&&resources[0])entry={...entry,data:{...entry.data,group:resources[0].id}};
  const [live,scheduled,site]=await Promise.all([database().from('effective_content').select('version').eq('collection',collection).eq('id',id).maybeSingle(),database().from('content_publications').select('effective_at').eq('collection',collection).eq('entry_id',id).is('cancelled_at',null).gt('effective_at',new Date().toISOString()).order('effective_at').limit(1),getSiteConfig()]);
  const info = COLLECTION_INFO[collection];
  const title = id === 'new' ? `New ${info.singular}` : entryTitle(entry.data, `Untitled ${info.singular}`);
  const trashed = Boolean((entry as ContentEntry & { deleted_at?: string | null }).deleted_at);
  return <><AdminNav user={user} /><AdminPageHeader title={title} crumbs={[{ label: info.label, href: `/admin/content/${collection}` }]} description={id === 'new' ? info.description : undefined} />{trashed && <RestoreBanner kind="content" itemKey={{ collection, id }} canRestore={can(user, collection, true)} />}<ContentEditor singular={info.singular} publicPath={previewPath(collection, entry.data)} liveVersion={live.data?.version??null} scheduledAt={scheduled.data?.[0]?.effective_at??null} resultsReleased={site.resultsPublished} key={id} initial={toSerializable(entry)} schema={schema} media={toSerializable(media)} resources={toSerializable(resources)} upload={can(user,'media',true)} readOnly={trashed || !can(user,collection,true)} revisions={toSerializable(revisions || [])} /></>;
}
