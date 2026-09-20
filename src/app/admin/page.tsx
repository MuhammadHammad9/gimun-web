import Link from 'next/link';
import { readAll } from '@/lib/server/admin/read-all';
import { requireAdmin } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { contentHealth } from '@/lib/content/repository';
import { getSiteConfig,getSchedule,getCommittees } from '@/lib/content';
import { eventPhase } from '@/lib/phase';
import { AdminNav } from './AdminNav';
export default async function Dashboard() {
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return <section className="admin-card"><h1>Admin setup required</h1><p>Configure Supabase Auth, apply the database migrations, seed content, and provision the first owner. See OPERATIONS_RUNBOOK.md.</p></section>;
  const user=await requireAdmin();const site=await getSiteConfig();const health=await contentHealth();
  const counts:Record<string,number>={};
  for(const [label,table,column,value,section] of [['Registrations','registrations','','','registrations'],['Unpaid','registrations','payment_status','unpaid','registrations'],['Unread inbox','contact_messages','handled_status','new','inbox'],['Checked in','participants','checked_in_at','','event-day']] as const) {
    if(!can(user,section))continue;
    let query=database().from(table).select('*',{count:'exact',head:true});if(column)query=column==='checked_in_at'?query.not(column,'is',null):query.eq(column,value);const {count,error}=await query;if(!error)counts[label]=count || 0;
  }
  if(can(user,'registrations'))for(const r of await readAll('registrations','track,status','reference_id')){const key=`${r.track==='gimun'?'GIMUN':'GMC'} · ${r.status}`;counts[key]=(counts[key]||0)+1;}
  const phase=eventPhase(site);
  const checklist={ 'pre-launch':['Approve event facts, media and privacy terms.','Verify providers and provision staff accounts.'],'registration-open':['Review applications and duplicate flags.','Verify payments, allocate countries and monitor receipts.'],'registration-closed':['Resolve outstanding applications and payments.','Export rosters and rehearse check-in.'],'event-live':['Monitor attendance and inbox.','Publish room changes through the emergency schedule form.'],'results':['Review and publish award entries.','Send certificates and feedback invitations.'],'archived':['Export operations data and preserve an archive.','Apply only the institution-approved retention policy.']}[phase];
  const {count:failed}=can(user,'email')?await database().from('email_outbox').select('*',{count:'exact',head:true}).in('status',['failed','needs_review']):{count:null};
  const committees=await getCommittees(); const schedule=await getSchedule();
  return <><AdminNav user={user}/><h1>Event dashboard</h1><p className="mb-4">Current phase: <strong>{phase}</strong></p>{health.fallback&&<p role="alert">Serving bundled fallback content. {health.reason}</p>}{failed ? <p role="alert">{failed} email messages need attention. <Link href="/admin/email">Review outbox</Link></p>:null}<div className="grid gap-4 sm:grid-cols-3">{Object.entries(counts).map(([label,count])=><div key={label} className="admin-card"><h2>{label}</h2><strong className="text-3xl">{count}</strong></div>)}</div><div className="admin-card"><h2>What to do now</h2><ul>{checklist.map(item=><li key={item}>{item}</li>)}</ul></div><div className="admin-card"><h2>Committee fill</h2>{committees.map(c=><p key={c.id}>{c.name}: {c.countryList.filter(x=>x.status==='assigned').length} allocated / {c.capacity??'capacity not set'}</p>)}</div><div className="admin-card"><h2>Content checks — owner decisions pending</h2><ul className="list-disc pl-5"><li>Confirm the gala date, public statistics, response time, scoring rules and venue names.</li><li>Replace and approve seed images and PDFs before release.</li><li>Set retention policy, legal basis, privacy contact and check-in instructions.</li>{committees.filter(c=>c.capacity!==null && c.capacity!==c.countryList.length).map(c=><li key={c.id}>{c.name}: capacity {c.capacity}; matrix has {c.countryList.length} countries.</li>)}</ul></div><div className="admin-card"><h2>Schedule</h2>{schedule.map(s=><p key={s.id}>Day {s.day} · {s.startTime} · {s.title} · {s.location}</p>)}</div></>;
}
