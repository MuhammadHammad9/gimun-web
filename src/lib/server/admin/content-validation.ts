import 'server-only';
import { LABELLED_ROUTES,normalizePath } from '@/lib/motion/routes';
import type { ContentEntry } from '@/lib/content/registry';
import { database } from '../supabase';
export async function checkContentLinks(entry:ContentEntry){
 const db=database();
 if(entry.status==='published'&&entry.expire_at&&new Date(entry.expire_at).getTime()<=Math.max(Date.now(),entry.publish_at?new Date(entry.publish_at).getTime():0))throw new Error('Choose an expiry after publication, or clear the expiry to keep this entry public.');
 if(entry.collection==='navigation'){
  const href=String(entry.data.href);if(!href)throw new Error('Choose a navigation destination.');
  if(href.startsWith('/')){const path=normalizePath(href);if(!LABELLED_ROUTES.includes(path)&&!['/apply','/go'].includes(path)){const slug=path.match(/^\/gimun\/committees\/([^/]+)$/)?.[1];if(!slug)throw new Error('Choose an existing public page.');const {data,error}=await db.from('effective_content').select('id').eq('collection','committees').eq('data->>slug',slug).maybeSingle();if(error||!data)throw new Error('Choose a published committee page.');}}
  if(entry.data.parentId){if(entry.data.parentId===entry.id)throw new Error('A navigation item cannot be its own parent.');const {data,error}=await db.from('content_entries').select('data').eq('collection','navigation').eq('id',entry.data.parentId).maybeSingle();if(error||!data||data.data.parentId)throw new Error('Choose an existing top-level navigation parent.');if(data.data.area!=='all'&&data.data.area!==entry.data.area)throw new Error('The parent must appear on the same navigation surface.');}
 }
 if(entry.collection==='schedule'){
  const valid=(v:unknown)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v));
  if(!valid(entry.data.startTime)||!valid(entry.data.endTime)||String(entry.data.endTime)<=String(entry.data.startTime))throw new Error('Session end time must follow its start time on the same day.');
 }
}
