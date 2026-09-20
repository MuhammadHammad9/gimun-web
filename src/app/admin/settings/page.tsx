import { z } from 'zod';
import { siteSchema, type ContentEntry } from '@/lib/content/registry';
import { requirePermission } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { getSiteConfig } from '@/lib/content';
import { AdminNav } from '../AdminNav';
import { ContentEditor } from '../ContentEditor';
import type { Schema } from '../SchemaForm';
export default async function SettingsPage() {
  const user=await requirePermission('settings');
  const { data,error }=await database().from('site_settings').select('*').eq('id','site').maybeSingle();
  if(error) throw new Error('Settings could not be loaded.');
  const { data:revisions }=await database().from('content_revisions').select('id,created_at').eq('collection','site').order('id',{ascending:false});
  const initial={ collection:'announcements',id:'site',data:data?.data || await getSiteConfig(),version:data?.version || 0,status:'published',sort_order:0,publish_at:null,expire_at:null } as ContentEntry;
  return <><AdminNav user={user} /><h1>Settings & site copy</h1><ContentEditor initial={initial} schema={z.toJSONSchema(siteSchema) as Schema} settings readOnly={!can(user,'settings',true)} revisions={revisions || []} /></>;
}
