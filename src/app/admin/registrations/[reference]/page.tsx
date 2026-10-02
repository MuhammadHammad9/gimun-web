import { RecordDetails } from '../../RecordDetails';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePermission } from '@backend/server/admin/auth';
import { can } from '@backend/server/admin/permissions';
import { database } from '@backend/server/supabase';
import { AdminNav } from '../../AdminNav';
import { OperationForm } from '../../OperationForm';
import { RegistrationTools } from '../../RegistrationTools';
type Participant={id:string;name:string;email:string;role:string;checked_in_at:string|null};
export default async function RegistrationPage({params}:{params:Promise<{reference:string}>}) {
  const user=await requirePermission('registrations');const {reference}=await params;
  const {data:r,error}=await database().from('registrations').select('reference_id,applicant_name,contact_email,institution,duplicate_of,amount_due,amount_paid,status,payment_status,payment_reference,internal_notes,updated_at,form_data,participants(id,name,email,role,checked_in_at)').eq('reference_id',reference).maybeSingle();if(error||!r)notFound();
  const {data:history}=await database().from('registration_history').select('id,created_at,action,detail').eq('registration_ref',reference).order('created_at',{ascending:false});
  const write=can(user,'registrations',true);
  return <><AdminNav user={user}/><p><Link href="/admin/registrations">Back to registrations</Link></p><h1>{r.applicant_name}</h1><p className="admin-muted">{reference}</p><nav className="admin-tabs"><a href="#application">Application</a><a href="#payment">Payment</a><a href="#participants">Participants</a><a href="#history">History</a></nav><p>{r.applicant_name} · {r.contact_email} · {r.institution}</p>{r.duplicate_of&&<p role="alert">Possible duplicate of {r.duplicate_of}; review before acceptance.</p>}<p>Amount due: {r.amount_due} · Paid: {r.amount_paid} · Confirmed: {r.status==='accepted'&&['paid','waived'].includes(r.payment_status)?'Yes':'No'}</p>
    {write&&<OperationForm operation="registration" title="Registration & payment" initial={{reference,status:r.status,payment_status:r.payment_status,payment_reference:r.payment_reference||'',amount_paid:r.amount_paid,notes:r.internal_notes,notify:false,expected_updated_at:r.updated_at}} schema={{type:'object',properties:{status:{enum:['received','under-review','accepted','waitlisted','rejected','withdrawn']},payment_status:{enum:['unpaid','pending_verification','paid','waived','refunded']},payment_reference:{type:'string'},amount_paid:{type:'number'},notes:{type:'string'},notify:{type:'boolean'}}}}/>}
    {write&&<section id="payment"><OperationForm operation="amount-due" title="Correct amount due" initial={{reference,amount_due:r.amount_due,reason:'',expected_updated_at:r.updated_at}} schema={{type:'object',properties:{amount_due:{type:'number',minimum:0},reason:{type:'string',minLength:5}},required:['amount_due','reason']}}/></section>}
    {write&&<RegistrationTools reference={reference} canEmail={can(user,'email',true)}/>}
    {write&&<OperationForm operation="registration-contact" title="Contact details" initial={{reference,applicant_name:r.applicant_name,contact_email:r.contact_email,institution:r.institution,expected_updated_at:r.updated_at}} schema={{type:'object',properties:{applicant_name:{type:'string'},contact_email:{type:'string'},institution:{type:'string'}}}}/>}
    <div id="application" className="admin-card"><h2>Submitted details</h2><RecordDetails data={r.form_data}/></div>
    <div id="participants" className="admin-card"><h2>Participants</h2><p>Names here are printed on certificates. Correct spelling before issuing them.</p>{r.participants.map((p:Participant)=><div key={p.id}><p>{p.name} · {p.email} · {p.role} · {p.checked_in_at?'Checked in':'Not checked in'}</p>{write&&<OperationForm operation="participant-edit" title={`Edit ${p.name}`} initial={{participant_id:p.id,name:p.name,email:p.email,reference,expected_updated_at:r.updated_at}} schema={{type:'object',properties:{name:{type:'string'},email:{type:'string'}}}}/>}</div>)}</div>
    <div id="history" className="admin-card"><h2>History</h2>{history?.map(h=><div key={h.id}>{h.created_at} · {h.action} · <RecordDetails data={h.detail}/></div>)}</div></>;
}
