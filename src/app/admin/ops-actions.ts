'use server';
import { after } from 'next/server';
import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { operate, emailHtml, renderTemplate } from '@/lib/server/admin/operations';
import { requirePermission } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { getServerConfig } from '@/lib/server/config';
import { drainEmailOutbox } from '@/lib/server/submissions';
import { validateEntry } from '@/lib/content/registry';
const id = z.uuid(); const text = z.string().max(20000);
const schemas = {
  registration:z.object({ reference:z.string().min(1),status:z.enum(['received','under-review','accepted','waitlisted','rejected','withdrawn']),payment_status:z.enum(['unpaid','pending_verification','paid','waived','refunded']),payment_reference:text,amount_paid:z.number().min(0).max(1e9),notes:text,notify:z.boolean() }),
  checkin:z.object({participant_id:id,checked:z.boolean(),override:z.boolean(),reason:text}),
  allocation:z.object({participant_id:id,committee_slug:text.min(1),country:text.min(1)}),
  reserve:z.object({committee_slug:text.min(1),country:text.min(1),reserved:z.boolean(),note:text}),
  certificate:z.object({participant_id:id,kind:z.enum(['participation','award','chair']),override:z.boolean(),reason:text}),
  inbox:z.object({id:text.min(1),status:z.enum(['new','read','replied','archived']),note:text,assignee:z.union([id,z.literal('')])}),
  outbox:z.object({id,action:z.enum(['retry','cancel'])}),
  template:z.object({id:z.string().regex(/^[a-z0-9-]+$/),subject:text.min(1),body:text.min(1)}),
  'survey-question':z.object({id,label:text.min(1),kind:z.enum(['rating','comment']),active:z.boolean(),sort_order:z.number().int()}),
  archive:z.object({name:text.min(1)}),
};
const sections: Record<keyof typeof schemas,string> = {registration:'registrations',checkin:'event-day',allocation:'allocations',reserve:'allocations',certificate:'certificates',inbox:'inbox',outbox:'email',template:'email','survey-question':'feedback',archive:'close-out'};
export async function runOperation(operation: string, input: unknown): Promise<{ error?: string; result?: unknown }> {
  if (!(operation in schemas)) return {error:'Unknown operation.'};
  const key = operation as keyof typeof schemas;
  try {
    const parsed=schemas[key].parse(input) as Record<string,unknown>;
    if ((key==='checkin' || key==='certificate') && parsed.override) await requirePermission('registrations',true);
    if(key==='registration' && parsed.notify) {
      const from=getServerConfig().emailFrom; if(!from) throw new Error('EMAIL_FROM must be configured.');
      parsed.from=from; parsed.subject=`Registration update: ${parsed.reference}`;
      parsed.html=emailHtml(`Reference: ${parsed.reference}\nApplication status: ${parsed.status}\nPayment status: ${parsed.payment_status}`);
    }
    const result=await operate(sections[key],key,parsed);
    if(['allocation','reserve'].includes(key)) updateTag('content:committees');
    if(key==='archive') updateTag('content:site');
    revalidatePath('/admin','layout');
    if(key==='outbox' || parsed.notify) after(async()=>{try{await drainEmailOutbox();}catch{console.error('[Outbox] Dispatch deferred');}});
    return {result};
  } catch(error) { return {error:error instanceof Error ? error.message : 'Operation failed.'}; }
}
export async function emergencyChange(session: unknown,announcement: unknown) {
  try {
    await requirePermission('announcements',true);
    const s=validateEntry(session),a=validateEntry(announcement);
    if(s.collection!=='schedule'||a.collection!=='announcements') throw new Error('Invalid emergency content');
    s.data.updatedFlag=true; a.data.pinnedFlag=true;
    await operate('schedule','emergency',{session:s,announcement:a});
    updateTag('content:schedule');updateTag('content:announcements');return {result:'Saved'};
  }catch(error){return {error:error instanceof Error?error.message:'Unable to publish emergency change'};}
}
export async function promoteClarification(contactId:string,entry:unknown) {
  await requirePermission('inbox',true); const parsed=validateEntry(entry);
  if(parsed.collection!=='clarifications') throw new Error('Invalid clarification');
  await operate('clarifications','promote',{contact_id:contactId,entry:parsed});updateTag('content:clarifications');revalidatePath('/admin/inbox');
}
export async function queueEmail(input:unknown) {
  const user=await requirePermission('email',true);
  const parsed=z.object({subject:text.min(1),body:text.min(1),audience:z.enum(['test','gimun','moot-cup','accepted','all']),test_email:z.email().optional(),confirm:z.boolean()}).parse(input);
  if(!parsed.confirm) return {error:'Review the audience and confirm before queueing.'};
  const from=getServerConfig().emailFrom;if(!from)return {error:'EMAIL_FROM must be configured.'};
  let recipients:{contact_email:string;applicant_name:string;reference_id:string;status:string;payment_status:string}[]=[];
  if(parsed.audience==='test') recipients=[{contact_email:parsed.test_email || user.email,applicant_name:user.display_name,reference_id:'TEST',status:'test',payment_status:'test'}];
  else {
    // Explicit pagination avoids silently dropping everyone after Supabase's row cap.
    for(let offset=0;;offset+=500){let query=database().from('registrations').select('contact_email,applicant_name,reference_id,status,payment_status').order('reference_id').range(offset,offset+499);
      if(parsed.audience==='accepted')query=query.eq('status','accepted');else if(parsed.audience!=='all')query=query.eq('track',parsed.audience);
      const {data,error}=await query;if(error)return {error:'Unable to load the audience.'};recipients.push(...data);if(data.length<500)break;
    }
  }
  const messages=recipients.map(r=>{const vars={name:r.applicant_name,reference:r.reference_id,status:r.status,payment_status:r.payment_status};return {type:'broadcast',to:r.contact_email,subject:renderTemplate(parsed.subject,vars),html:emailHtml(renderTemplate(parsed.body,vars))};});
  // One transaction prevents partial broadcasts if the insert fails.
  await operate('email','email',{from,messages});
  after(async()=>{try{await drainEmailOutbox();}catch{console.error('[Outbox] Dispatch deferred');}});
  revalidatePath('/admin/email');return {result:`Queued ${messages.length} messages.`};
}
export async function lookupAttendees(value:string) {
  await requirePermission('event-day');
  const normalized=value.trim();
  if(!/^REG-(GIMUN|MOOT)-\d{4}-\d{4,}$/.test(normalized)&&!z.uuid().safeParse(normalized).success)return {error:'Scan a ticket or enter a registration reference.'};
  const column=normalized.startsWith('REG-')?'reference_id':'checkin_token';
  const {data,error}=await database().from('registrations').select('reference_id,applicant_name,status,payment_status,participants(id,name,role,checked_in_at)').eq(column,normalized).maybeSingle();
  return error || !data ? {error:'No matching registration.'} : {result:data};
}
export async function replyInquiry(id:string,body:string) {
  await requirePermission('inbox',true);
  const parsed=z.string().min(1).max(20000).parse(body);
  const from=getServerConfig().emailFrom;if(!from)throw new Error('Email is not configured');
  await operate('inbox','reply',{id,body:parsed,html:emailHtml(parsed),from});
  after(async()=>{try{await drainEmailOutbox();}catch{console.error('[Outbox] Reply deferred');}});
  revalidatePath('/admin/inbox');
}

export async function processOutbox() {
  await requirePermission('email',true);
  try { const result=await drainEmailOutbox();revalidatePath('/admin/email');return {result}; }
  catch { return {error:'Delivery unavailable. Check provider configuration and the outbox errors.'}; }
}

export async function bulkRegistration(input:unknown){
  try{
    const user=await requirePermission('registrations',true);
    const parsed=z.object({references:z.array(z.string().regex(/^REG-(GIMUN|MOOT)-\d{4}-\d{4,}$/)).min(1).max(50),status:schemas.registration.shape.status,confirm:z.literal(true)}).parse(input);
    const {data,error}=await database().from('registrations').select('reference_id,payment_status,payment_reference,amount_paid,internal_notes,updated_at').in('reference_id',parsed.references);
    if(error||data.length!==new Set(parsed.references).size)throw new Error('Selection changed. Refresh and select again.');
    const operations=data.map(r=>({reference:r.reference_id,status:parsed.status,payment_status:r.payment_status,payment_reference:r.payment_reference||'',amount_paid:r.amount_paid,notes:r.internal_notes,notify:false,expected_updated_at:r.updated_at}));
    const result=await database().rpc('admin_operation_batch',{p_operation:'registration',p_inputs:operations,p_actor:user.user_id});if(result.error)throw new Error(result.error.message);
    revalidatePath('/admin/registrations');return {message:`Updated ${data.length} registrations.`};
  }catch(error){return {error:error instanceof Error?error.message:'Bulk update failed.'};}
}
