'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { requirePermission, requireAdmin, stepUpNeeded } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { sections, events } from '@/lib/server/admin/permissions';
import { securityEvent } from '@/lib/server/admin/security-log';

type Result = { error?: string; result?: string; stepUp?: 'code' | 'enrol' };
const refresh = () => revalidatePath('/admin/users');

export async function manageUser(input:unknown):Promise<Result>{
  try{
  const owner=await requirePermission('users',true);
  const step=await stepUpNeeded();if(step)return {stepUp:step};
  const p=z.object({id:z.union([z.uuid(),z.literal('')]),email:z.email(),display_name:z.string().min(1).max(100),role:z.enum(['owner','admin','editor','registrar','checkin','viewer']),sections:z.array(z.enum(sections)),events:z.array(z.enum(events)).min(1,'Choose at least one event.'),active:z.boolean(),password:z.string().max(200)}).parse(input);
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
  const values={user_id:userId,email:p.email,display_name:p.display_name,role:p.role,sections:p.sections,events:p.role==='owner'?[...events]:p.events,active:p.active,...(!p.id||p.password?{must_change_password:true}:{})};
  const {error}=await db.from('admin_users').upsert(values);if(error){if(/active owner/.test(error.message))return {error:'Keep at least one active owner.'};if(!p.id){const rollback=await db.auth.admin.deleteUser(userId);if(!rollback.error)return {error:'Account setup could not finish. No account was retained; try again.'};}return {error:`Account changes partially completed. Recovery account: ${userId}. Contact the owner before retrying.`};}
  // A deactivated admin must not be able to sign in again (admin_users.active only gates pages and the
  // database); ban the Auth account while inactive, which also stops refresh tokens. Reactivation lifts it.
  const {error:banError}=await db.auth.admin.updateUserById(userId,{ban_duration:p.active?'none':'876000h'});
  if(banError)return {error:p.active?'Profile saved, but the sign-in ban could not be lifted. Try again.':'Profile deactivated, but the sign-in ban could not be applied. Try again.'};
  const {error:auditError}=await db.from('audit_log').insert({actor:owner.user_id,action:'manage-user',section:'users',entity_id:userId,detail:{role:values.role,events:values.events,active:values.active,sections:values.sections}});
  if(auditError)return {error:'Profile saved; actor attribution could not be recorded. Review the database audit trigger.'};
  refresh();return {result:p.id?`${p.display_name}'s access is saved.`:`Account for ${p.display_name} created. Give them the temporary password through your approved channel; they choose their own at first sign-in.`};
  }catch(error){unstable_rethrow(error);return {error:error instanceof z.ZodError?error.issues.map(i=>i.message).join(' '):'Invalid details or insufficient permission.'};}
}

/** Removes every authenticator from an account, for a lost phone. They can enrol again. */
export async function resetTwoStep(userId: string): Promise<Result> {
  try {
    const owner = await requirePermission('users', true);
    const step = await stepUpNeeded(); if (step) return { stepUp: step };
    const id = z.uuid().parse(userId);
    const db = database();
    const { data, error } = await db.auth.admin.mfa.listFactors({ userId: id });
    if (error) return { error: 'Two-step sign-in could not be read for this account.' };
    for (const factor of data?.factors ?? []) {
      const removed = await db.auth.admin.mfa.deleteFactor({ userId: id, id: factor.id });
      if (removed.error) return { error: 'One authenticator could not be removed. Try again.' };
    }
    await db.rpc('admin_end_sessions', { p_actor: owner.user_id, p_user: id });
    await securityEvent('two-step-reset', owner.user_id, { account: id });
    refresh();
    return { result: 'Two-step sign-in was reset and the account was signed out everywhere. They can set up a new authenticator after signing in.' };
  } catch (error) { unstable_rethrow(error); return { error: 'Two-step sign-in could not be reset. Check your permission.' }; }
}

/** Ends every session of an account (an owner for anyone, anyone for themselves). */
export async function signOutEverywhere(userId: string): Promise<Result> {
  try {
    const me = await requireAdmin();
    const id = z.uuid().parse(userId);
    if (id !== me.user_id) {
      await requirePermission('users', true);
      const step = await stepUpNeeded(); if (step) return { stepUp: step };
    }
    const { data, error } = await database().rpc('admin_end_sessions', { p_actor: me.user_id, p_user: id });
    if (error) return { error: 'Sessions could not be ended. Apply migration 0016, or use the Supabase dashboard.' };
    refresh();
    return { result: id === me.user_id ? 'Signed out on every device, including this one.' : `Signed out of ${Number(data) || 0} session${Number(data) === 1 ? '' : 's'}.` };
  } catch (error) { unstable_rethrow(error); return { error: 'Sessions could not be ended. Check your permission.' }; }
}

/**
 * Deletes an admin account for good: the sign-in and the access profile. Their
 * past changes keep their name in the activity log. Never yourself, never the
 * last active owner (the database refuses that too).
 */
export async function removeAdmin(userId: string, typedName: string): Promise<Result> {
  try {
    const owner = await requirePermission('users', true);
    const step = await stepUpNeeded(); if (step) return { stepUp: step };
    const id = z.uuid().parse(userId);
    if (id === owner.user_id) return { error: 'You cannot remove your own account.' };
    const db = database();
    const { data: profile } = await db.from('admin_users').select('display_name,email,role,active').eq('user_id', id).maybeSingle();
    if (!profile) return { error: 'This account no longer exists.' };
    if (typedName.trim() !== String(profile.display_name).trim()) return { error: 'Type the account name exactly to confirm.' };
    if (profile.role === 'owner' && profile.active) {
      const { count } = await db.from('admin_users').select('user_id', { count: 'exact', head: true }).eq('role', 'owner').eq('active', true);
      if ((count ?? 0) <= 1) return { error: 'Keep at least one active owner.' };
    }
    const { error } = await db.auth.admin.deleteUser(id);
    if (error) return { error: /owner/i.test(error.message) ? 'Keep at least one active owner.' : 'The account could not be removed. Try again.' };
    await db.from('audit_log').insert({ actor: owner.user_id, action: 'remove-admin', section: 'users', entity_id: id, detail: { name: profile.display_name, role: profile.role } });
    refresh();
    return { result: `${profile.display_name}'s account was removed.` };
  } catch (error) { unstable_rethrow(error); return { error: 'The account could not be removed. Check your permission.' }; }
}
