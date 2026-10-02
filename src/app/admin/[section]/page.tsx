import { QuestionManager } from '../QuestionManager';
import { recordColumns,sectionHelp } from '../record-columns';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import { requirePermission } from '@backend/server/admin/auth';
import { can,sections } from '@backend/server/admin/permissions';
import { database } from '@backend/server/supabase';
import { AdminNav } from '../AdminNav';
import { OperationForm } from '../OperationForm';
import { EmailComposer } from '../EmailComposer';
import { getCommittees } from '@backend/lib/content';
import { AllocationBoard } from '../AllocationBoard';
import { Scanner } from '../Scanner';
import type { Schema } from '../SchemaForm';
import { MediaUpload } from '../MediaUpload';
import { RetentionForm } from '../RetentionForm';
import { readAll } from '@backend/server/admin/read-all';
import { PostEventMail } from '../PostEventMail';
import { BulkRegistration } from '../BulkRegistration';
import { FeedbackReport } from '../FeedbackReport';
import { MediaLibrary } from '../MediaLibrary';
import { ProcessOutbox } from '../ProcessOutbox';
import { UsersForm } from '../UsersForm';
const string:Schema={type:'string'};const boolean:Schema={type:'boolean'};
function schema(properties:Record<string,Schema>):Schema{return {type:'object',properties};}
type Query={q?:string;page?:string;track?:string;status?:string;payment?:string;sort?:string};
// A repeated parameter (?q=a&q=b) arrives as an array; string methods on it crashed the page.
function firstValues(raw:Record<string,string|string[]|undefined>):Query{return Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,Array.isArray(v)?v[0]:v]));}
export default async function OpsPage({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {section}=await params;if(!sections.includes(section as typeof sections[number]))notFound();
  const user=await requirePermission(section);const write=can(user,section,true);const query=firstValues(await searchParams);const page=Math.min(100000,Math.max(0,Math.floor(Number(query.page)||0)));
  const table:Record<string,string>={registrations:'registrations',inbox:'contact_messages',email:'email_outbox','event-day':'participants',allocations:'allocations',certificates:'certificates',feedback:'survey_questions','close-out':'event_archives',users:'admin_users',media:'media_assets',audit:'audit_log'};
  if(!table[section])notFound();
  let request=database().from(table[section]).select(recordColumns[section].join(','),{count:'exact'});
  // Name, email, institution or reference. Characters PostgREST treats as syntax are stripped.
  if(section==='registrations'&&query.q){const q=query.q.replace(/[^\p{L}\p{N}@. -]/gu,'').trim();if(q)request=request.or(`applicant_name.ilike.%${q}%,contact_email.ilike.%${q}%,institution.ilike.%${q}%,reference_id.ilike.%${q}%`);}
  if(section==='registrations'){if(['gimun','moot-cup'].includes(query.track||''))request=request.eq('track',query.track!);if(query.status==='review')request=request.in('status',['received','under-review']);else if(query.status)request=request.eq('status',query.status);if(query.payment==='outstanding')request=request.in('payment_status',['unpaid','pending_verification']).in('status',['received','under-review','accepted','waitlisted']);else if(query.payment)request=request.eq('payment_status',query.payment);}
  if(section==='inbox'&&query.status)request=request.eq('handled_status',query.status);
  if(section==='email'&&query.status)request=query.status==='attention'?request.in('status',['failed','needs_review']):request.eq('status',query.status);
  // Check-in users receive names/attendance only, never contact or survey tokens.
  if(section==='event-day')request=database().from('participants').select('id,registration_ref,name,role,checked_in_at',{count:'exact'});
  const searchColumns:Record<string,string>={inbox:'name',email:'subject','event-day':'name',allocations:'country',certificates:'serial',feedback:'label',users:'display_name',media:'alt',audit:'action','close-out':'name'};
  if(section!=='registrations'&&query.q&&searchColumns[section])request=request.ilike(searchColumns[section],`%${query.q.replace(/[%_]/g,'')}%`);
  const sort=query.sort&&recordColumns[section].includes(query.sort)?query.sort:null;
  const {data,error,count}=await request.order(sort|| (section==='registrations'?'submitted_at':section==='feedback'?'sort_order':section==='allocations'?'committee_slug':section==='certificates'?'issued_at':section==='event-day'?'registration_ref':'created_at'),{ascending:false}).order(section==='registrations'?'reference_id':section==='users'?'user_id':section==='allocations'?'participant_id':'id').range(page*50,page*50+49);
  if(error)throw new Error('Unable to load this section. Check migrations and database availability.');
  const rows=(data||[]) as unknown as Record<string,unknown>[];
  const allPeople=['allocations','certificates','feedback'].includes(section)?await readAll('participants','id,name,registration_ref,checked_in_at'):[];
  const accepted=section==='allocations'?(await readAll('registrations','reference_id,track,status','reference_id')).filter(r=>r.track==='gimun'&&r.status==='accepted').map(r=>r.reference_id):[];
  const people=allPeople.filter(p=>accepted.includes(p.registration_ref)) as {id:string;name:string;registration_ref:string}[];
  const checkedPeople=allPeople.filter(p=>p.checked_in_at) as {id:string;name:string;registration_ref:string}[];
  const allAllocations=section==='allocations'?await readAll('allocations','*','participant_id'):[];
  const reservations=section==='allocations'?await readAll('country_reservations','*','country'):[];
  const staff=section==='inbox'?await readAll('admin_users','user_id,display_name,active','user_id'):[];
  const templates=section==='email'?await readAll('email_templates'):[];
  const committees=section==='allocations'?await getCommittees():[];
  const extraExports:Record<string,[string,string]>={allocations:['allocations','Export allocations CSV'],certificates:['certificates','Export certificates CSV'],feedback:['feedback','Export survey responses CSV'],email:['email_outbox','Export delivery log CSV'],'event-day':['attendance','Export attendance CSV']};
  return <><AdminNav user={user}/><h1>{section==='event-day'?'Check-in':section.replace(/-/g,' ')}</h1><p className="admin-description">{sectionHelp[section]}</p>{write&&extraExports[section]&&<p><a href={`/admin/export?type=${extraExports[section][0]}`}>{extraExports[section][1]}</a></p>}
    {section!=='registrations'&&<form className="admin-card admin-toolbar"><label>Search {section.replaceAll('-',' ')}<input name="q" defaultValue={query.q}/></label><label>Sort by<select name="sort" defaultValue={query.sort||''}><option value="">Most recent</option>{recordColumns[section].filter(k=>!['id','user_id','participant_id','verify_code'].includes(k)).map(k=><option key={k} value={k}>{k.replaceAll('_',' ')}</option>)}</select></label><button>Apply filters</button><Link href={`/admin/${section}`}>Clear filters</Link></form>}
    {section==='registrations'&&<><form className="admin-card"><label>Search name, email, institution or reference<input name="q" defaultValue={query.q}/></label><label>Track<select name="track" defaultValue={query.track||""}><option value="">All tracks</option><option value="gimun">GIMUN</option><option value="moot-cup">GMC</option></select></label><label>Status<select name="status" defaultValue={query.status||""}><option value="">All statuses</option>{["review","received","under-review","accepted","waitlisted","rejected","withdrawn"].map(s=><option key={s}>{s}</option>)}</select></label><label>Payment<select name="payment" defaultValue={query.payment||""}><option value="">All payments</option>{["outstanding","unpaid","pending_verification","paid","waived","refunded"].map(s=><option key={s}>{s}</option>)}</select></label><button>Search</button></form>{write&&<><a href={`/admin/export?type=registrations&q=${encodeURIComponent(query.q||'')}&track=${encodeURIComponent(query.track||'')}&status=${encodeURIComponent(query.status||'')}&payment=${encodeURIComponent(query.payment||'')}`} download>Export matching registrations CSV</a><p><a href="/admin/export?type=participants" download>Export participant roster</a></p></>}</>}
    {section==='registrations'&&write&&<BulkRegistration rows={rows as {reference_id:string;applicant_name:string}[]}/>}
    {section==='event-day'&&write&&<><Scanner allowOverride={can(user,'registrations',true)}/>{can(user,'registrations',true)&&<p><Link href="/admin/walk-in">Register a walk-in participant</Link></p>}</>}
    {section==='email'&&write&&<><ProcessOutbox/><EmailComposer templates={templates as {id:string;subject:string;body:string}[]}/><OperationForm operation="outbox" title="Outbox recovery" initial={{id:'',action:'retry'}} schema={schema({id:{enum:rows.map(r=>String(r.id)),optionLabels:Object.fromEntries(rows.map(r=>[String(r.id),String(r.subject)]))},action:{enum:['retry','cancel']}})}/><OperationForm operation="template" title="Email template" initial={{id:'',subject:'',body:''}} schema={schema({id:string,subject:string,body:string})}/></>}
    {section==='allocations'&&write&&<><AllocationBoard people={people||[]} committees={committees} initial={allAllocations as {participant_id:string;committee_slug:string;country:string}[]} reservations={reservations as {committee_slug:string;country:string}[]}/>{can(user,'registrations',true)&&<a href="/admin/export?type=participants" download>Download participant roster</a>}</>}
    {section==='certificates'&&write&&<OperationForm operation="certificate" title="Issue certificate" initial={{participant_id:'',kind:'participation',override:false,reason:''}} schema={schema({participant_id:{enum:allPeople.map(p=>String(p.id)),optionLabels:Object.fromEntries(allPeople.map(p=>[p.id,`${p.name} · ${p.registration_ref}`]))},kind:{enum:['participation','award','chair']},override:boolean,reason:string})}/>}
    {section==='feedback'&&write&&<QuestionManager newId={randomUUID()} questions={rows as {id:string;label:string;kind:string;active:boolean;sort_order:number}[]}/>}
    {['certificates','feedback'].includes(section)&&write&&can(user,'email',true)&&<PostEventMail kind={section==='feedback'?'survey':'certificate'} people={checkedPeople}/>}
    {section==='inbox'&&write&&<OperationForm operation="inbox" title="Update inquiry" initial={{id:'',status:'read',note:'',assignee:''}} schema={schema({id:{enum:rows.map(r=>String(r.id)),optionLabels:Object.fromEntries(rows.map(r=>[String(r.id),String(r.name)]))},status:{enum:['new','read','replied','archived']},note:string,assignee:{enum:['',...staff.filter(u=>u.active).map(u=>String(u.user_id))],optionLabels:Object.fromEntries(staff.map(u=>[String(u.user_id),String(u.display_name)]))}})}/>}
    {section==='close-out'&&write&&<><p className="admin-card">An archive preserves a snapshot of public content and settings and closes both registration tracks. Later content edits remain possible. Export operational data first. Retention decisions require institutional approval.</p><p><a href="/admin/export?type=registrations" download>Export registrations</a> · <a href="/admin/export?type=participants" download>Export roster</a> · <a href="/admin/export?type=contact_messages" download>Export inbox</a></p><OperationForm operation="archive" title="Create archive snapshot" initial={{name:''}} schema={schema({name:string})}/><RetentionForm/></>}
    {section==='feedback'&&<FeedbackReport/>}{section==='media'&&<MediaLibrary/>}
    {section==='media'&&write&&<MediaUpload/>}{section==='users'&&write&&<UsersForm users={rows as {user_id:string;display_name:string;email:string;role:string;active:boolean;sections:string[]}[]}/>}
    <div className="admin-card admin-table" role="region" aria-label="Records table" tabIndex={0}><h2>{count ?? rows.length} records</h2><table><thead><tr>{['allocations','certificates'].includes(section)&&<th>Participant</th>}{recordColumns[section].filter(k=>!['id','participant_id','user_id','verify_code'].includes(k)).map(k=><th key={k}>{k.replaceAll('_',' ')}</th>)}{['registrations','inbox','certificates'].includes(section)&&<th>Action</th>}</tr></thead><tbody>{rows.map(row=><tr key={String(row.reference_id||row.id||row.participant_id||row.user_id)}>{['allocations','certificates'].includes(section)&&<td>{String(allPeople.find(p=>p.id===row.participant_id)?.name||'Participant unavailable')}</td>}{recordColumns[section].filter(k=>!['id','participant_id','user_id','verify_code'].includes(k)).map(key=><td key={key}>{typeof row[key]==='boolean'?row[key]?'Yes':'No':Array.isArray(row[key])?(row[key] as string[]).join(', '):key.endsWith('_at')&&row[key]?new Date(String(row[key])).toLocaleString('en-GB',{timeZone:'Asia/Karachi'}):key.includes('status')?<span className="admin-status">{String(row[key]||'').replaceAll('_',' ').replaceAll('-',' ')}</span>:String(row[key]??'—')}</td>)}{section==='registrations'&&<td><Link href={`/admin/registrations/${row.reference_id}`}>Review application</Link></td>}{section==='inbox'&&<td><Link href={`/admin/inbox/${row.id}`}>Read inquiry</Link></td>}{section==='certificates'&&<td><Link href={`/verify/${row.verify_code}`}>Verify / download</Link></td>}</tr>)}</tbody></table>{!rows.length&&<p>No matching records. Adjust the filters or return after new submissions arrive.</p>}</div><nav>{page>0&&<Link href={`?page=${page-1}&sort=${encodeURIComponent(query.sort||'')}&q=${encodeURIComponent(query.q||'')}&track=${encodeURIComponent(query.track||'')}&status=${encodeURIComponent(query.status||'')}&payment=${encodeURIComponent(query.payment||'')}`}>Previous</Link>}{(count||0)>(page+1)*50&&<Link href={`?page=${page+1}&sort=${encodeURIComponent(query.sort||'')}&q=${encodeURIComponent(query.q||'')}&track=${encodeURIComponent(query.track||'')}&status=${encodeURIComponent(query.status||'')}&payment=${encodeURIComponent(query.payment||'')}`}>Next</Link>}</nav></>;
}
