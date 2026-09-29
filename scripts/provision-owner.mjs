import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
nextEnv.loadEnvConfig(process.cwd());
const email=process.env.ADMIN_OWNER_EMAIL,password=process.env.ADMIN_OWNER_TEMP_PASSWORD;
if(!email||!password||password.length<12)throw new Error('Set ADMIN_OWNER_EMAIL and ADMIN_OWNER_TEMP_PASSWORD (12+ characters) in your shell.');
const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Configure Supabase.');
const describeError = error => {
  const fields=['name','message','code','status','statusCode','details','hint'];
  const description=fields.flatMap(field=>{
    try {
      const value=error?.[field];
      return (typeof value==='string'&&value.length)||(typeof value==='number') ? [`${field}: ${value}`] : [];
    }
    catch { return []; }
  });
  try {
    const cause=error?.cause;
    if(cause)description.push(`cause: ${[cause.name,cause.message].filter(Boolean).join(': ')||String(cause)}`);
  } catch {}
  try {
    if(!description.length&&typeof error?.toJSON==='function') {
      const json=error.toJSON();
      for(const field of ['name','message','code','status','statusCode','details','hint']) {
        const value=json?.[field];
        if((typeof value==='string'&&value.length)||(typeof value==='number'))description.push(`${field}: ${value}`);
      }
    }
  } catch {}
  return description.length ? description.join('; ') : 'No error details were provided. Verify the project URL, server secret key, network access, and that all database migrations completed.';
};

try {
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {count,error:countError}=await db.from('admin_users').select('*',{count:'exact',head:true}).eq('role','owner').eq('active',true);
  if(countError)throw new Error(`Could not check for an existing owner: ${describeError(countError)}`);
  if(count)throw new Error('An active owner already exists. Manage additional users in /admin/users.');
  const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true});
  if(error)throw new Error(`Supabase Auth could not create the owner: ${describeError(error)}`);
  const {error:profileError}=await db.from('admin_users').insert({user_id:data.user.id,email,display_name:'Event owner',role:'owner',must_change_password:true});
  if(profileError)throw new Error(`Auth account created (${data.user.id}), but its admin profile could not be created: ${describeError(profileError)}. Repair that account before retrying.`);
  console.log('First owner provisioned. Password change is required at first login.');
} catch (error) {
  console.error(`Owner provisioning failed: ${describeError(error)}`);
  process.exitCode=1;
}
