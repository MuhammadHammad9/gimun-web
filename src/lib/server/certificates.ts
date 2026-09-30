import 'server-only';
import { z } from 'zod';
import { database } from './supabase';
/** Thrown when the lookup itself fails, so callers do not report a genuine certificate as unverified. */
export class CertificateLookupError extends Error {}
/**
 * The certificate for a verification code, or null when no certificate has
 * that code. A database failure throws instead: returning null there told
 * anyone checking a genuine certificate during an outage that it was "Not
 * verified".
 */
export async function findCertificate(code:string){
  if(!z.uuid().safeParse(code).success)return null;
  let result;
  try{result=await database().from('certificates').select('participant_id,serial,kind,issued_at,verify_code,participants(name,registration_ref)').eq('verify_code',code).maybeSingle();}
  catch{throw new CertificateLookupError('Certificate verification is temporarily unavailable.');}
  const {data,error}=result;
  if(error)throw new CertificateLookupError('Certificate verification is temporarily unavailable.');
  if(!data)return null;
  const participant=Array.isArray(data.participants)?data.participants[0]:data.participants;
  return participant?{serial:data.serial,kind:data.kind,issuedAt:data.issued_at,code:data.verify_code,name:participant.name}:null;
}
