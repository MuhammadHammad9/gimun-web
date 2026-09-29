'use server';
import { after } from 'next/server';
import { revalidatePath, updateTag } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { invoiceEmailHtml, invoiceNumber, invoicePdf, type InvoiceRegistration } from '@/lib/server/invoice';
import { getSiteConfig } from '@/lib/content';
import { feeAmount, formatFee } from '@/lib/fees';
import { z } from 'zod';
import { operate, emailHtml, renderTemplate } from '@/lib/server/admin/operations';
import { requirePermission } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { getServerConfig } from '@/lib/server/config';
import { drainEmailOutbox } from '@/lib/server/submissions';
import { validateEntry } from '@/lib/content/registry';
const id = z.uuid(); const text = z.string().max(20000);
const schemas = {
  // expected_updated_at makes a stale form fail instead of overwriting a colleague's edit.
  registration:z.object({ reference:z.string().min(1),status:z.enum(['received','under-review','accepted','waitlisted','rejected','withdrawn']),payment_status:z.enum(['unpaid','pending_verification','paid','waived','refunded']),payment_reference:text,amount_paid:z.number().min(0).max(1e9),notes:text,notify:z.boolean(),expected_updated_at:z.string().min(1) }),
  'registration-contact':z.object({reference:z.string().min(1),applicant_name:text.min(2),contact_email:z.email(),institution:text,expected_updated_at:z.string().min(1)}),
  'participant-edit':z.object({participant_id:id,name:text.min(2),email:z.email(),reference:text.min(1),expected_updated_at:z.string().min(1)}),
  'resend-ticket':z.object({reference:z.string().min(1)}),
  checkin:z.object({participant_id:id,checked:z.boolean(),override:z.boolean(),reason:text}),
  allocation:z.object({participant_id:id,committee_slug:text.min(1),country:text.min(1)}),
  reserve:z.object({committee_slug:text.min(1),country:text.min(1),reserved:z.boolean(),note:text}),
  certificate:z.object({participant_id:id,kind:z.enum(['participation','award','chair']),override:z.boolean(),reason:text}),
  inbox:z.object({id:text.min(1),status:z.enum(['new','read','replied','archived']),note:text,assignee:z.union([id,z.literal('')])}),
  outbox:z.object({id,action:z.enum(['retry','cancel'])}),
  template:z.object({id:z.string().regex(/^[a-z0-9-]+$/),subject:text.min(1),body:text.min(1)}),
  'survey-question':z.object({id,label:text.min(1),kind:z.enum(['rating','comment']),active:z.boolean(),sort_order:z.number().int()}),
  unassign:z.object({participant_id:id}),
  'amount-due':z.object({reference:text.min(1),amount_due:z.number().min(0).max(1e9),reason:text.min(5),expected_updated_at:z.string().min(1)}),
  archive:z.object({name:text.min(1)}),
};
const sections: Record<keyof typeof schemas,string> = {'amount-due':'registrations',unassign:'allocations',registration:'registrations','registration-contact':'registrations','participant-edit':'registrations','resend-ticket':'registrations',checkin:'event-day',allocation:'allocations',reserve:'allocations',certificate:'certificates',inbox:'inbox',outbox:'email',template:'email','survey-question':'feedback',archive:'close-out'};
export async function runOperation(operation: string, input: unknown): Promise<{ error?: string; result?: unknown; record?:Record<string,unknown> }> {
  if (!Object.hasOwn(schemas,operation)) return {error:'Unknown operation.'};
  const key = operation as keyof typeof schemas;
  try {
    const parsed=schemas[key].parse(input) as Record<string,unknown>;
    if ((key==='checkin' || key==='certificate') && parsed.override) await requirePermission('registrations',true);
    if (key==='resend-ticket') { await requirePermission('email',true); parsed.from=getServerConfig().emailFrom; }
    if(key==='registration' && parsed.notify) {
      await requirePermission('email',true);
      const from=getServerConfig().emailFrom; if(!from) throw new Error('EMAIL_FROM must be configured.');
      parsed.from=from; parsed.subject=`Registration update: ${parsed.reference}`;
      parsed.html=emailHtml(`Reference: ${parsed.reference}\nApplication status: ${parsed.status}\nPayment status: ${parsed.payment_status}`);
    }
    const result=await operate(sections[key],key,parsed);
    if(['allocation','reserve','unassign'].includes(key)) updateTag('content:committees');
    if(key==='archive') updateTag('content:site');
    revalidatePath('/admin','layout');
    if(key==='outbox' || key==='resend-ticket' || parsed.notify) after(async()=>{try{await drainEmailOutbox();}catch{console.error('[Outbox] Dispatch deferred');}});
    if(parsed.reference){const {data}=await database().from('registrations').select('updated_at').eq('reference_id',parsed.reference).single();return {result,record:{expected_updated_at:data?.updated_at}};}
    return {result};
  } catch(error) { unstable_rethrow(error); if(error instanceof z.ZodError)return {error:error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')};const message=error instanceof Error?error.message:'';return {error:/changed|requires|require |Choose |reserved|allocated|capacity|permission|attendance|valid email|applicant name|participant name|Cannot invoice|No original receipt|current state|Override|Entry|Country/i.test(message)?message:'Operation could not be completed. Check the record and try again.'}; }
}
export async function emergencyChange(session: unknown,announcement: unknown) {
  try {
    await requirePermission('announcements',true);
    const s=validateEntry(session),a=validateEntry(announcement);
    if(s.collection!=='schedule'||a.collection!=='announcements') throw new Error('Invalid emergency content');
    s.data.updatedFlag=true;s.status='published';s.publish_at=null;s.expire_at=null; a.data.pinnedFlag=true;
    await operate('schedule','emergency',{session:s,announcement:a});
    updateTag('content:schedule');updateTag('content:announcements');revalidatePath('/admin','layout');return {result:'Saved'};
  }catch(error){unstable_rethrow(error);return {error:error instanceof Error?error.message:'Unable to publish emergency change'};}
}
export async function promoteClarification(contactId:string,entry:unknown) {
  await requirePermission('inbox',true); const parsed=validateEntry(entry);
  if(parsed.collection!=='clarifications') throw new Error('Invalid clarification');
  await operate('clarifications','promote',{contact_id:contactId,entry:parsed});updateTag('content:clarifications');revalidatePath('/admin/inbox');
}
export async function queueEmail(input:unknown) {
  const user=await requirePermission('email',true);
  const parsed=z.object({subject:text.min(1),body:text.min(1),audience:z.enum(['test','gimun','moot-cup','accepted','all']),test_email:z.email().optional(),confirm:z.boolean()}).parse(input);
  const site=await getSiteConfig();
  if(!parsed.confirm) return {error:'Review the audience and confirm before queueing.'};
  const from=getServerConfig().emailFrom;if(!from)return {error:'EMAIL_FROM must be configured.'};
  let recipients:{contact_email:string;applicant_name:string;reference_id:string;status:string;payment_status:string;amount_due:number;fee_display:string|null}[]=[];
  if(parsed.audience==='test') recipients=[{contact_email:parsed.test_email || user.email,applicant_name:user.display_name,reference_id:'TEST',status:'test',payment_status:'test',amount_due:feeAmount(site,'gimunIndividual')??0,fee_display:site.fees.gimunIndividual}];
  else {
    // Explicit pagination avoids silently dropping everyone after Supabase's row cap.
    for(let offset=0;;offset+=500){let query=database().from('registrations').select('contact_email,applicant_name,reference_id,status,payment_status,amount_due,fee_display').order('reference_id').range(offset,offset+499)
        // Rejected, withdrawn and anonymised records never receive broadcasts.
        .not('status','in','(rejected,withdrawn)').neq('contact_email','anonymized@invalid.example');
      if(parsed.audience==='accepted')query=query.eq('status','accepted');else if(parsed.audience!=='all')query=query.eq('track',parsed.audience);
      const {data,error}=await query;if(error)return {error:'Unable to load the audience.'};recipients.push(...data);if(data.length<500)break;
    }
  }
  const messages=recipients.map(r=>{const vars={name:r.applicant_name,reference:r.reference_id,status:r.status,payment_status:r.payment_status,event_name:site.eventNames.combined,amount_due:formatFee(Number(r.amount_due)||0,site.fees.gimunIndividual),fee:r.fee_display||''};return {type:'broadcast',to:r.contact_email,subject:renderTemplate(parsed.subject,vars),html:emailHtml(renderTemplate(parsed.body,vars))};});
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
  await requirePermission('inbox',true);await requirePermission('email',true);
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
  }catch(error){unstable_rethrow(error);return {error:error instanceof Error?error.message:'Bulk update failed.'};}
}

/** Emails the registration's invoice as a PDF. The number derives from the reference, so re-sending is safe. */
export async function sendInvoice(reference:string){
  try{
    await requirePermission('registrations',true);await requirePermission('email',true);
    const from=getServerConfig().emailFrom;if(!from)return {error:'EMAIL_FROM must be configured.'};
    const {data,error}=await database().from('registrations').select('reference_id,applicant_name,institution,contact_email,track,applicant_type,participant_count,fee_display,amount_due,amount_paid').eq('reference_id',reference).maybeSingle();
    if(error||!data)return {error:'Registration not found.'};
    const r=data as InvoiceRegistration;
    if(!(Number(r.amount_due)>0))return {error:'Set the amount due before sending an invoice.'};
    const pdf=await invoicePdf(r);const number=invoiceNumber(r.reference_id);
    await operate('registrations','invoice',{reference:r.reference_id,invoice_number:number,from,subject:`Invoice ${number} (${r.reference_id})`,html:await invoiceEmailHtml(r),attachments:[{filename:`${number}.pdf`,content:Buffer.from(pdf).toString('base64')}]});
    after(async()=>{try{await drainEmailOutbox();}catch{console.error('[Outbox] Invoice delivery deferred');}});
    revalidatePath(`/admin/registrations/${reference}`);return {result:`Invoice ${number} queued to ${r.contact_email}.`};
  }catch(error){unstable_rethrow(error);return {error:error instanceof Error?error.message:'Unable to send the invoice.'};}
}

export async function previewEmail(input:unknown){
 const user=await requirePermission('email',true);
 const p=z.object({subject:text.min(1),body:text.min(1),audience:z.enum(['test','gimun','moot-cup','accepted','all'])}).parse(input);
 let count=1;
 if(p.audience!=='test'){let q=database().from('registrations').select('*',{count:'exact',head:true}).not('status','in','(rejected,withdrawn)').neq('contact_email','anonymized@invalid.example');if(p.audience==='accepted')q=q.eq('status','accepted');else if(p.audience!=='all')q=q.eq('track',p.audience);const result=await q;if(result.error)throw new Error('Audience unavailable');count=result.count||0;}
 const site=await getSiteConfig();const values={name:user.display_name,reference:'REG-GIMUN-2027-0001',status:'accepted',payment_status:'paid',event_name:site.eventNames.combined,amount_due:site.fees.gimunIndividual,fee:site.fees.gimunIndividual};
 return {subject:renderTemplate(p.subject,values),body:renderTemplate(p.body,values),count};
}
