import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { AdminNav } from '../../AdminNav';
import { OperationForm } from '../../OperationForm';
export default async function RegistrationPage({params}:{params:Promise<{reference:string}>}) {
  const user=await requirePermission('registrations');const {reference}=await params;
  const {data:r,error}=await database().from('registrations').select('*,participants(*)').eq('reference_id',reference).maybeSingle();if(error||!r)notFound();
  const {data:history}=await database().from('registration_history').select('*').eq('registration_ref',reference).order('created_at',{ascending:false});
  return <><AdminNav user={user}/><h1>{reference}</h1><p>{r.applicant_name} · {r.contact_email} · {r.institution}</p>{r.duplicate_of&&<p role="alert">Possible duplicate of {r.duplicate_of}; review before acceptance.</p>}<p>Amount due: {r.amount_due} · Confirmed: {r.status==='accepted'&&['paid','waived'].includes(r.payment_status)?'Yes':'No'}</p>{can(user,'registrations',true)&&<OperationForm operation="registration" title="Registration & payment" initial={{reference,status:r.status,payment_status:r.payment_status,payment_reference:r.payment_reference||'',amount_paid:r.amount_paid,notes:r.internal_notes,notify:false}} schema={{type:'object',properties:{reference:{type:'string'},status:{enum:['received','under-review','accepted','waitlisted','rejected','withdrawn']},payment_status:{enum:['unpaid','pending_verification','paid','waived','refunded']},payment_reference:{type:'string'},amount_paid:{type:'number'},notes:{type:'string'},notify:{type:'boolean'}}}}/>}<div className="admin-card"><h2>Submitted details</h2><pre className="whitespace-pre-wrap break-words">{JSON.stringify(r.form_data,null,2)}</pre><h2>Participants</h2>{r.participants.map((p:{id:string;name:string;role:string;checked_in_at:string|null})=><p key={p.id}>{p.name} · {p.role} · {p.id} · {p.checked_in_at?'Checked in':'Not checked in'}</p>)}</div><div className="admin-card"><h2>History</h2>{history?.map(h=><p key={h.id}>{h.created_at} · {h.action} · {JSON.stringify(h.detail)}</p>)}</div></>;
}
