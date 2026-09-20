import Link from 'next/link';
import { notFound } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import { requirePermission } from '@/lib/server/admin/auth';
import { can,sections } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { AdminNav } from '../AdminNav';
import { OperationForm } from '../OperationForm';
import { EmailComposer } from '../EmailComposer';
import { getCommittees } from '@/lib/content';
import { AllocationBoard } from '../AllocationBoard';
import { Scanner } from '../Scanner';
import type { Schema } from '../SchemaForm';
import { MediaUpload } from '../MediaUpload';
import { RetentionForm } from '../RetentionForm';
import { readAll } from '@/lib/server/admin/read-all';
import { PostEventMail } from '../PostEventMail';
import { BulkRegistration } from '../BulkRegistration';
import { FeedbackReport } from '../FeedbackReport';
import { MediaLibrary } from '../MediaLibrary';
import { ProcessOutbox } from '../ProcessOutbox';
import { UsersForm } from '../UsersForm';
const string:Schema={type:'string'};const boolean:Schema={type:'boolean'};
function schema(properties:Record<string,Schema>):Schema{return {type:'object',properties};}
export default async function OpsPage({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<{q?:string;page?:string;track?:string;status?:string;payment?:string}>}) {
  const {section}=await params;if(!sections.includes(section as typeof sections[number]))notFound();
  const user=await requirePermission(section);const write=can(user,section,true);const query=await searchParams;const page=Math.max(0,Number(query.page)||0);
  const table:Record<string,string>={registrations:'registrations',inbox:'contact_messages',email:'email_outbox','event-day':'participants',allocations:'allocations',certificates:'certificates',feedback:'survey_questions','close-out':'event_archives',users:'admin_users',media:'media_assets',audit:'audit_log'};
  if(!table[section])notFound();
  let request=database().from(table[section]).select('*',{count:'exact'});
  if(section==='registrations'&&query.q)request=request.ilike('applicant_name',`%${query.q.replace(/[%_]/g,'')}%`);
  if(section==='registrations'){if(['gimun','moot-cup'].includes(query.track||''))request=request.eq('track',query.track!);if(query.status)request=request.eq('status',query.status);if(query.payment)request=request.eq('payment_status',query.payment);}
  // Check-in users receive names/attendance only, never contact or survey tokens.
  if(section==='event-day')request=database().from('participants').select('id,registration_ref,name,role,checked_in_at',{count:'exact'});
  const {data,error,count}=await request.order(section==='registrations'?'submitted_at':section==='feedback'?'sort_order':section==='allocations'?'committee_slug':section==='certificates'?'issued_at':section==='event-day'?'registration_ref':'created_at',{ascending:false}).range(page*50,page*50+49);
  if(error)throw new Error('Unable to load this section. Check migrations and database availability.');
  const rows=data||[];
  const allPeople=['allocations','certificates','feedback'].includes(section)?await readAll('participants','id,name,registration_ref,checked_in_at'):[];
  const accepted=section==='allocations'?(await readAll('registrations','reference_id,track,status','reference_id')).filter(r=>r.track==='gimun'&&r.status==='accepted').map(r=>r.reference_id):[];
  const people=allPeople.filter(p=>accepted.includes(p.registration_ref)) as {id:string;name:string;registration_ref:string}[];
  const checkedPeople=allPeople.filter(p=>p.checked_in_at) as {id:string;name:string;registration_ref:string}[];
  const allAllocations=section==='allocations'?await readAll('allocations','*','participant_id'):[];
  const reservations=section==='allocations'?await readAll('country_reservations','*','country'):[];
  const templates=section==='email'?await readAll('email_templates'):[];
  const committees=section==='allocations'?await getCommittees():[];
  return <><AdminNav user={user}/><h1>{section.replace(/-/g,' ')}</h1>
    {section==='registrations'&&<><form className="admin-card"><label>Search applicant name<input name="q" defaultValue={query.q}/></label><label>Track<select name="track" defaultValue={query.track||""}><option value="">All tracks</option><option value="gimun">GIMUN</option><option value="moot-cup">GMC</option></select></label><label>Status<select name="status" defaultValue={query.status||""}><option value="">All statuses</option>{["received","under-review","accepted","waitlisted","rejected","withdrawn"].map(s=><option key={s}>{s}</option>)}</select></label><label>Payment<select name="payment" defaultValue={query.payment||""}><option value="">All payments</option>{["unpaid","pending_verification","paid","waived","refunded"].map(s=><option key={s}>{s}</option>)}</select></label><button>Search</button></form><Link href="/admin/export?type=registrations">Export registrations CSV</Link><p><Link href="/admin/export?type=participants">Export participant roster</Link></p></>}
    {section==='registrations'&&write&&<BulkRegistration rows={rows as {reference_id:string;applicant_name:string}[]}/>}
    {section==='event-day'&&write&&<><Scanner allowOverride={can(user,'registrations',true)}/><p><Link href="/register">Open registration form for a walk-in</Link></p></>}
    {section==='email'&&write&&<><ProcessOutbox/><EmailComposer templates={templates as {id:string;subject:string;body:string}[]}/><OperationForm operation="outbox" title="Outbox recovery" initial={{id:'',action:'retry'}} schema={schema({id:string,action:{enum:['retry','cancel']}})}/><OperationForm operation="template" title="Email template" initial={{id:'',subject:'',body:''}} schema={schema({id:string,subject:string,body:string})}/></>}
    {section==='allocations'&&write&&<><AllocationBoard people={people||[]} committees={committees} initial={allAllocations as {participant_id:string;committee_slug:string;country:string}[]} reservations={reservations as {committee_slug:string;country:string}[]}/><OperationForm operation="allocation" title="Allocate delegate" initial={{participant_id:'',committee_slug:'',country:''}} schema={schema({participant_id:string,committee_slug:string,country:string})}/><OperationForm operation="reserve" title="Reserve country" initial={{committee_slug:'',country:'',reserved:true,note:''}} schema={schema({committee_slug:string,country:string,reserved:boolean,note:string})}/><Link href="/admin/export?type=participants">Download participant IDs and roster</Link></>}
    {section==='certificates'&&write&&<OperationForm operation="certificate" title="Issue certificate" initial={{participant_id:'',kind:'participation',override:false,reason:''}} schema={schema({participant_id:string,kind:{enum:['participation','award','chair']},override:boolean,reason:string})}/>}
    {section==='feedback'&&write&&<OperationForm operation="survey-question" title="Survey question" initial={{id:randomUUID(),label:'',kind:'rating',active:true,sort_order:0}} schema={schema({id:string,label:string,kind:{enum:['rating','comment']},active:boolean,sort_order:{type:'integer'}})}/>}
    {['certificates','feedback'].includes(section)&&write&&can(user,'email',true)&&<PostEventMail kind={section==='feedback'?'survey':'certificate'} people={checkedPeople}/>}
    {section==='inbox'&&write&&<OperationForm operation="inbox" title="Update inquiry" initial={{id:'',status:'read',note:'',assignee:''}} schema={schema({id:string,status:{enum:['new','read','replied','archived']},note:string,assignee:string})}/>}
    {section==='close-out'&&write&&<><p className="admin-card">Archive freezes public content and settings and closes both registration tracks. Export operational data first. Retention decisions require institutional approval.</p><p><Link href="/admin/export?type=registrations">Export registrations</Link> · <Link href="/admin/export?type=participants">Export roster</Link> · <Link href="/admin/export?type=contact_messages">Export inbox</Link></p><OperationForm operation="archive" title="Archive event" initial={{name:''}} schema={schema({name:string})}/><RetentionForm/></>}
    {section==='feedback'&&<FeedbackReport/>}{section==='media'&&<MediaLibrary/>}
    {section==='media'&&write&&<MediaUpload/>}{section==='users'&&write&&<UsersForm/>}
    <div className="admin-card overflow-auto"><h2>{count ?? rows.length} records</h2><table><thead><tr>{rows[0]&&Object.keys(rows[0]).filter(k=>!['html','attachments','form_data','snapshot','checkin_token','submission_hash','survey_token'].includes(k)).map(k=><th key={k}>{k.replace(/_/g,' ')}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={index}>{Object.entries(row).filter(([k])=>!['html','attachments','form_data','snapshot','checkin_token','submission_hash','survey_token'].includes(k)).map(([key,value])=><td key={key}>{section==='registrations'&&key==='reference_id'?<Link href={`/admin/registrations/${value}`}>{String(value)}</Link>:section==='inbox'&&key==='id'?<Link href={`/admin/inbox/${value}`}>{String(value)}</Link>:section==='certificates'&&key==='verify_code'?<Link href={`/verify/${value}`}>Verify / download</Link>:typeof value==='object'?JSON.stringify(value):String(value??'')}</td>)}</tr>)}</tbody></table>{!rows.length&&<p>No records.</p>}</div><nav>{page>0&&<Link href={`?page=${page-1}&q=${encodeURIComponent(query.q||'')}&track=${encodeURIComponent(query.track||'')}&status=${encodeURIComponent(query.status||'')}&payment=${encodeURIComponent(query.payment||'')}`}>Previous</Link>}{(count||0)>(page+1)*50&&<Link href={`?page=${page+1}&q=${encodeURIComponent(query.q||'')}&track=${encodeURIComponent(query.track||'')}&status=${encodeURIComponent(query.status||'')}&payment=${encodeURIComponent(query.payment||'')}`}>Next</Link>}</nav></>;
}
