import { requirePermission } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { csv } from '@/lib/csv';
export async function GET(request:Request){
  const type=new URL(request.url).searchParams.get('type')||'registrations';
  const tables:Record<string,{section:string;select:string;order:string}>={registrations:{section:'registrations',select:'reference_id,track,applicant_type,applicant_name,institution,contact_email,participant_count,status,payment_status,payment_reference,amount_due,amount_paid,submitted_at',order:'reference_id'},participants:{section:'registrations',select:'id,registration_ref,name,email,role,committee_pref,country_pref,checked_in_at',order:'id'},contact_messages:{section:'inbox',select:'id,submitted_at,name,email,query_type,kind,message,handled_status',order:'id'}};
  if(!tables[type])return new Response('Invalid export',{status:400});const config=tables[type];await requirePermission(config.section);
  const rows:Record<string,unknown>[]=[];for(let offset=0;;offset+=500){const {data,error}=await database().from(type).select(config.select).order(config.order).range(offset,offset+499);if(error)return new Response('Export failed',{status:503});rows.push(...data as unknown as Record<string,unknown>[]);if(data.length<500)break;}
  return new Response(csv(rows),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${type}.csv"`,'Cache-Control':'private, no-store'}});
}
