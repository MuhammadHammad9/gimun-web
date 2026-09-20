'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { sections } from '@/lib/server/admin/permissions';
export async function manageUser(input:unknown){
  const owner=await requirePermission('users',true);
  const p=z.object({id:z.union([z.uuid(),z.literal('')]),email:z.email(),display_name:z.string().min(1).max(100),role:z.enum(['owner','admin','editor','registrar','checkin','viewer']),sections:z.array(z.enum(sections)),active:z.boolean(),password:z.string().max(200)}).parse(input);
  if(p.id===owner.user_id && (!p.active||p.role!=='owner'))return {error:'You cannot deactivate or demote your own owner account.'};
  const db=database();let userId=p.id;
  if(!userId){if(p.password.length<12)return {error:'A temporary password of at least 12 characters is required.'};const {data,error}=await db.auth.admin.createUser({email:p.email,password:p.password,email_confirm:true});if(error||!data.user)return {error:'Unable to create auth account. It may already exist.'};userId=data.user.id;}
  else {
    if(p.password&&p.password.length<12)return {error:'Temporary passwords require at least 12 characters.'};
    const {data:auth,error:lookupError}=await db.auth.admin.getUserById(userId);
    if(lookupError||!auth.user)return {error:'Auth account could not be loaded.'};
    if(auth.user.email!==p.email)return {error:'Email must match the existing Auth account. Change sign-in email through the verified Supabase Auth workflow first.'};
    if(p.password){const {error}=await db.auth.admin.updateUserById(userId,{password:p.password});if(error)return {error:'Password reset failed.'};}
  }
  const values={user_id:userId,email:p.email,display_name:p.display_name,role:p.role,sections:p.sections,active:p.active,...(!p.id||p.password?{must_change_password:true}:{})};
  const {error}=await db.from('admin_users').upsert(values);if(error)return {error:'Auth account exists, but the admin profile could not be saved. Retry with its user ID.'};
  const {error:auditError}=await db.from('audit_log').insert({actor:owner.user_id,action:'manage-user',section:'users',entity_id:userId});
  if(auditError)return {error:'Profile saved; actor attribution could not be recorded. Review the database audit trigger.'};
  revalidatePath('/admin/users');return {result:`Account ${userId} saved. Give the temporary password to the user through your approved channel.`};
}
