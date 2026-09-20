import Link from 'next/link';
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
  if(can(user,'registrations')) { for(const [label,table,column,value] of [['Registrations','registrations','',''],['Unpaid','registrations','payment_status','unpaid'],['Unread inbox','contact_messages','handled_status','new'],['Checked in','participants','checked_in_at','']] as const) {
    let query=database().from(table).select('*',{count:'exact',head:true});if(column)query=column==='checked_in_at'?query.not(column,'is',null):query.eq(column,value);const {count,error}=await query;if(!error)counts[label]=count || 0;
  }}
  const {count:failed}=can(user,'email')?await database().from('email_outbox').select('*',{count:'exact',head:true}).in('status',['failed','needs_review']):{count:null};
  const committees=await getCommittees(); const schedule=await getSchedule();
  return <><AdminNav user={user}/><h1>Event dashboard</h1><p className="mb-4">Current phase: <strong>{eventPhase(site)}</strong></p>{health.fallback&&<p role="alert">Serving bundled fallback content. {health.reason}</p>}{failed ? <p role="alert">{failed} email messages need attention. <Link href="/admin/email">Review outbox</Link></p>:null}<div className="grid gap-4 sm:grid-cols-3">{Object.entries(counts).map(([label,count])=><div key={label} className="admin-card"><h2>{label}</h2><strong className="text-3xl">{count}</strong></div>)}</div><div className="admin-card"><h2>Content checks — owner decisions pending</h2><ul className="list-disc pl-5"><li>Confirm the gala date, public statistics, response time, scoring rules and venue names.</li><li>Replace and approve seed images and PDFs before release.</li><li>Set retention policy, legal basis, privacy contact and check-in instructions.</li>{committees.filter(c=>c.capacity!==null && c.capacity!==c.countryList.length).map(c=><li key={c.id}>{c.name}: capacity {c.capacity}; matrix has {c.countryList.length} countries.</li>)}</ul></div><div className="admin-card"><h2>Schedule</h2>{schedule.map(s=><p key={s.id}>Day {s.day} · {s.startTime} · {s.title} · {s.location}</p>)}</div></>;
}
