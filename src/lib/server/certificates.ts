import 'server-only';
import { z } from 'zod';
import { database } from './supabase';
export async function findCertificate(code:string){
  if(!z.uuid().safeParse(code).success)return null;
  const {data,error}=await database().from('certificates').select('participant_id,serial,kind,issued_at,verify_code,participants(name,registration_ref)').eq('verify_code',code).maybeSingle();
  if(error||!data)return null;
  const participant=Array.isArray(data.participants)?data.participants[0]:data.participants;
  return participant?{serial:data.serial,kind:data.kind,issuedAt:data.issued_at,code:data.verify_code,name:participant.name}:null;
}
