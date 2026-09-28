import { requirePermission } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { csv } from '@/lib/csv';
// Exports carry personal data out of the system, so they need write access to
// the owning section (read-only viewers cannot export) and each one is logged.
const tables:Record<string,{table:string;section:string;select:string;order:string}>={
  registrations:{table:'registrations',section:'registrations',select:'reference_id,track,applicant_type,applicant_name,institution,contact_email,participant_count,status,payment_status,payment_reference,amount_due,amount_paid,submitted_at',order:'reference_id'},
  participants:{table:'participants',section:'registrations',select:'id,registration_ref,name,email,role,committee_pref,country_pref,checked_in_at',order:'id'},
  attendance:{table:'participants',section:'event-day',select:'registration_ref,name,role,checked_in_at',order:'registration_ref'},
  allocations:{table:'allocations',section:'allocations',select:'committee_slug,country,participant_id,participants(name,registration_ref)',order:'committee_slug'},
  certificates:{table:'certificates',section:'certificates',select:'serial,kind,issued_at,verify_code,participants(name,registration_ref)',order:'issued_at'},
  feedback:{table:'survey_responses',section:'feedback',select:'submitted_at,answers',order:'submitted_at'},
  email_outbox:{table:'email_outbox',section:'email',select:'id,message_type,reference_id,status,attempts,last_error,created_at,sent_at',order:'created_at'},
  contact_messages:{table:'contact_messages',section:'inbox',select:'id,submitted_at,name,email,query_type,kind,message,handled_status',order:'id'},
};
// Nested relation objects become flat columns (participants.name → participant_name).
function flatten(row:Record<string,unknown>){
  const out:Record<string,unknown>={};
  for(const [key,value] of Object.entries(row)){
    if(value&&typeof value==='object'&&!Array.isArray(value)&&key==='participants'){for(const [k,v] of Object.entries(value))out[`participant_${k}`]=v;}
    else out[key]=value&&typeof value==='object'?JSON.stringify(value):value;
  }
  return out;
}
export async function GET(request:Request){
  const type=new URL(request.url).searchParams.get('type')||'registrations';
  const config=tables[type];if(!config)return new Response('Invalid export',{status:400});
  const user=await requirePermission(config.section,true);
  const rows:Record<string,unknown>[]=[];for(let offset=0;;offset+=500){const {data,error}=await database().from(config.table).select(config.select).order(config.order).range(offset,offset+499);if(error)return new Response('Export failed',{status:503});rows.push(...(data as unknown as Record<string,unknown>[]).map(flatten));if(data.length<500)break;}
  const logged=await database().rpc('log_admin_export',{p_actor:user.user_id,p_export:type,p_rows:rows.length});
  if(logged.error)return new Response('Export could not be recorded in the audit log, so it was not released.',{status:503});
  return new Response(csv(rows),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${type}.csv"`,'Cache-Control':'private, no-store'}});
}
