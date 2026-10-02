import { z } from 'zod';
import { siteSchema, type ContentEntry } from '@shared/lib/content/registry';
import { requirePermission } from '@backend/server/admin/auth';
import { can } from '@backend/server/admin/permissions';
import { database } from '@backend/server/supabase';
import { getSiteConfig } from '@backend/lib/content';
import { AdminNav } from '../AdminNav';
import { ContentEditor } from '../ContentEditor';
import type { Schema } from '../SchemaForm';
import { toSerializable } from '../serializable';
import { AdminPageHeader } from '../AdminPageHeader';
export default async function SettingsPage() {
  const user=await requirePermission('settings');
  const { data,error }=await database().from('site_settings').select('*').eq('id','site').maybeSingle();
  if(error) throw new Error('Settings could not be loaded.');
  const { data:revisions }=await database().from('content_revisions').select('id,created_at').eq('collection','site').order('id',{ascending:false});
  const initial={ collection:'announcements',id:'site',data:data?.data || await getSiteConfig(),version:data?.version || 0,status:'published',sort_order:0,publish_at:null,expire_at:null } as ContentEntry;
  return <><AdminNav user={user} /><AdminPageHeader title="Site settings" description="Event dates, registration, fees, contact details and other facts used across the website. Saving applies them to the website at once." /><ContentEditor initial={toSerializable(initial)} schema={toSerializable(z.toJSONSchema(siteSchema)) as Schema} settings readOnly={!can(user,'settings',true)} revisions={toSerializable(revisions || [])} /></>;
}
