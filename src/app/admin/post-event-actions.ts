'use server';
import { z } from 'zod';
import { unstable_rethrow } from 'next/navigation';
import { after } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@backend/server/admin/auth';
import { operate,emailHtml } from '@backend/server/admin/operations';
import { database } from '@backend/server/supabase';
import { getServerConfig } from '@backend/server/config';
import { drainEmailOutbox } from '@backend/server/submissions';
import { certificatePdf } from '@backend/server/certificate-pdf';

export async function queuePostEvent(input:unknown){
  const issued:string[]=[];
  try {
    const value=z.object({kind:z.enum(['survey','certificate']),certificate_kind:z.enum(['participation','award','chair']).default('participation'),ids:z.array(z.uuid()).min(1).max(25),confirm:z.literal(true)}).parse(input);
    await requirePermission(value.kind==='survey'?'feedback':'certificates',true);
    await requirePermission('email',true);
    const config=getServerConfig();if(!config.siteUrl||!config.emailFrom)throw new Error('SITE_URL and EMAIL_FROM must be configured.');
    const {data:people,error}=await database().from('participants').select('id,name,email,survey_token,checked_in_at').in('id',[...new Set(value.ids)]);
    if(error||people.length!==new Set(value.ids).size)throw new Error('One or more participants are unavailable.');
    const messages=[];const skipped:string[]=[];
    for(const person of people){
      if(!person.checked_in_at)throw new Error('Only checked-in participants are eligible for this batch.');
      // Skip and report problem records instead of failing everyone else's email.
      if(!z.email().safeParse(person.email).success){skipped.push(`${person.name} (no valid email)`);continue;}
      if(value.kind==='survey'){
        const url=new URL(`/survey/${person.survey_token}`,config.siteUrl).toString();
        messages.push({type:'survey',to:person.email,subject:'Your event feedback',html:emailHtml(`Hello ${person.name},\nPlease share your feedback using your private link:\n${url}`)});
      }else{
        const certificate=await operate('certificates','certificate',{participant_id:person.id,kind:value.certificate_kind,override:false});
        issued.push(person.name);
        let pdf:Uint8Array;
        try{pdf=await certificatePdf({name:person.name,serial:certificate.serial,kind:certificate.kind,code:certificate.verify_code,issuedAt:certificate.issued_at});}
        catch(error){skipped.push(`${person.name} (${error instanceof Error?error.message:'PDF failed'})`);continue;}
        const url=new URL(`/verify/${certificate.verify_code}`,config.siteUrl).toString();
        messages.push({type:'certificate',to:person.email,subject:`Your ${value.certificate_kind} certificate`,html:emailHtml(`Hello ${person.name},\nYour certificate is attached. Verify it online:\n${url}`),attachments:[{filename:`${certificate.serial}.pdf`,content:Buffer.from(pdf).toString('base64')}]});
      }
    }
    if(!messages.length)return {error:`No emails queued. ${issued.length} certificates issued or already available. ${skipped.join('; ')}`};
    await operate('email','email',{from:config.emailFrom,messages});
    after(async()=>{try{await drainEmailOutbox();}catch{console.error('[Outbox] Post-event delivery deferred');}});
    revalidatePath('/admin','layout');return {message:`Queued ${messages.length} emails. ${issued.length?`${issued.length} certificates issued or already available. `:''}Review delivery in Email.${skipped.length?` Skipped: ${skipped.join('; ')}.`:''}`};
  }catch(error){unstable_rethrow(error);return {error:`Emails could not be queued. ${issued.length?`${issued.length} certificates were issued or already exist; review them before retrying. `:''}${error instanceof z.ZodError?'Check the recipients and confirmation.':'Check permissions and the connection.'}`};}
}
