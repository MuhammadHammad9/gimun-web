import { z } from 'zod';
import { siteSchema, type ContentEntry } from '@/lib/content/registry';
import { requirePermission } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { getSiteConfig } from '@/lib/content';
import { AdminNav } from '../AdminNav';
import { ContentEditor } from '../ContentEditor';
import type { Schema } from '../SchemaForm';
import { toSerializable } from '../serializable';
import { AdminPageHeader } from '../AdminPageHeader';
import { currentFeeTier } from '@/lib/fee-tiers';
import { serverRenderTime } from '@/lib/phase';
import { formatEventDate } from '@/lib/site-config';
export default async function SettingsPage() {
  const user=await requirePermission('settings');
  const { data,error }=await database().from('site_settings').select('*').eq('id','site').maybeSingle();
  if(error) throw new Error('Settings could not be loaded.');
  const { data:revisions }=await database().from('content_revisions').select('id,created_at').eq('collection','site').order('id',{ascending:false});
  const initial={ collection:'announcements',id:'site',data:data?.data || await getSiteConfig(),version:data?.version || 0,status:'published',sort_order:0,publish_at:null,expire_at:null } as ContentEntry;
  const parsed = siteSchema.safeParse(initial.data);
  const now = serverRenderTime();
  const tierLine = (track: 'gimun' | 'mootCup', name: string) => {
    if (!parsed.success) return null;
    const tier = currentFeeTier(parsed.data, track, now);
    if (!tier) return `${name}: no fee tier applies (registration is over or the tiers are not set).`;
    return `${name}: ${tier.label} fees${tier.manual ? ', set by hand' : tier.endsOn ? `, until ${formatEventDate(tier.endsOn)}` : ''}.`;
  };
  return <><AdminNav user={user} /><AdminPageHeader title="Site settings" description="Event dates, registration forms, fee tiers, contacts and other facts used across the website. Saving applies them to the website at once." />
    <p className="admin-callout" role="status"><strong>Fees on the website now:</strong> {tierLine('gimun', 'GIMUN')} {tierLine('mootCup', 'GMC')} To change it, open <em>Fee tiers &amp; payment</em>: pick a tier, or choose “Follow the dates” and set when Early Bird and Normal end.</p><ContentEditor initial={toSerializable(initial)} schema={toSerializable(z.toJSONSchema(siteSchema)) as Schema} settings readOnly={!can(user,'settings',true)} revisions={toSerializable(revisions || [])} /></>;
}
