import 'server-only';
import { cache } from 'react';
import { createHash } from 'node:crypto';
import { database } from './supabase';
import { contentHealth } from '@/lib/content/repository';
import { can, sections, type AdminUser } from './admin/permissions';
export const publicRevision=cache(async()=>{
  const health=await contentHealth();
  if(health.fallback)return {revision:'unavailable',connected:false,reason:health.reason};
  try{const {data,error}=await database().rpc('public_revision');if(error)throw error;return {revision:String(data),connected:true,reason:''};}
  catch{return {revision:'unavailable',connected:false,reason:'Live updates are unavailable. Check the database migration.'};}
});
export const adminRevision=cache(async(user:AdminUser)=>{
  const [{data,error},site]=await Promise.all([database().from('live_revisions').select('section,revision').order('section'),publicRevision()]);
  if(error)throw new Error('Live updates unavailable');
  const allowed=sections.filter(s=>can(user,s));
  const revision=createHash('sha256').update(JSON.stringify([data.filter(r=>allowed.includes(r.section)||(r.section==='event-day'&&allowed.some(s=>['registrations','certificates','feedback','allocations'].includes(s)))),site.revision,user.role,user.sections,user.active])).digest('hex');
  return {revision,connected:true,websiteConnected:site.connected,reason:site.reason};
});
