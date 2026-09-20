'use server';
import { z } from 'zod';
import { requirePermission } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
export async function retentionCleanup(input:unknown){
  const owner=await requirePermission('close-out',true);
  const p=z.object({before:z.iso.datetime({offset:true}),policy:z.string().min(10).max(2000),legal_basis:z.string().min(5).max(2000),privacy_contact:z.string().min(5).max(500),execute:z.boolean(),expected:z.number().int().min(0),confirmation:z.string()}).parse(input);
  if(p.execute&&p.confirmation!=='ANONYMIZE')return {error:'Type ANONYMIZE to confirm the reviewed cleanup.'};
  const {data,error}=await database().rpc('retention_cleanup',{p_actor:owner.user_id,p_before:p.before,p_policy:p.policy,p_legal_basis:p.legal_basis,p_privacy_contact:p.privacy_contact,p_execute:p.execute,p_expected:p.expected});
  return error?{error:error.message}:{result:data as {registrations:number;contacts:number;total:number;executed:boolean}};
}
