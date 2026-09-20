'use server';
import { z } from 'zod';
import { after } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/server/admin/auth';
import { operate,emailHtml } from '@/lib/server/admin/operations';
import { database } from '@/lib/server/supabase';
import { getServerConfig } from '@/lib/server/config';
import { drainEmailOutbox } from '@/lib/server/submissions';
import { certificatePdf } from '@/lib/server/certificate-pdf';

export async function queuePostEvent(input:unknown){
  try {
    const value=z.object({kind:z.enum(['survey','certificate']),ids:z.array(z.uuid()).min(1).max(25),confirm:z.literal(true)}).parse(input);
    await requirePermission(value.kind==='survey'?'feedback':'certificates',true);
    await requirePermission('email',true);
    const config=getServerConfig();if(!config.siteUrl||!config.emailFrom)throw new Error('SITE_URL and EMAIL_FROM must be configured.');
    const {data:people,error}=await database().from('participants').select('id,name,email,survey_token,checked_in_at').in('id',[...new Set(value.ids)]);
    if(error||people.length!==new Set(value.ids).size)throw new Error('One or more participants are unavailable.');
    const messages=[];
    for(const person of people){
      if(!person.checked_in_at)throw new Error('Only checked-in participants are eligible for this batch.');
      if(!z.email().safeParse(person.email).success)throw new Error('A selected participant has no valid email.');
      if(value.kind==='survey'){
        const url=new URL(`/survey/${person.survey_token}`,config.siteUrl).toString();
        messages.push({type:'survey',to:person.email,subject:'Your event feedback',html:emailHtml(`Hello ${person.name},\nPlease share your feedback using your private link:\n${url}`)});
      }else{
        const certificate=await operate('certificates','certificate',{participant_id:person.id,kind:'participation',override:false});
        const pdf=await certificatePdf({name:person.name,serial:certificate.serial,kind:certificate.kind,code:certificate.verify_code,issuedAt:certificate.issued_at});
        const url=new URL(`/verify/${certificate.verify_code}`,config.siteUrl).toString();
        messages.push({type:'certificate',to:person.email,subject:'Your participation certificate',html:emailHtml(`Hello ${person.name},\nYour certificate is attached. Verify it online:\n${url}`),attachments:[{filename:`${certificate.serial}.pdf`,content:Buffer.from(pdf).toString('base64')}]});
      }
    }
    await operate('email','email',{from:config.emailFrom,messages});
    after(async()=>{try{await drainEmailOutbox();}catch{console.error('[Outbox] Post-event delivery deferred');}});
    revalidatePath('/admin','layout');return {message:`Queued ${messages.length} emails. Review delivery in Email.`};
  }catch(error){return {error:error instanceof Error?error.message:'Unable to queue post-event emails.'};}
}
