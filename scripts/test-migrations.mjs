import { PGlite } from '@electric-sql/pglite';
import { readFile,readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const db=new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()) { await db.exec(await readFile(`supabase/migrations/${file}`,'utf8')); console.log(`Applied ${file}`); }
  const actor=randomUUID();await db.query('insert into auth.users values($1)',[actor]);await db.query("insert into admin_users(user_id,email,display_name,role,must_change_password) values($1,'owner@example.test','Test Owner','owner',false)",[actor]);
  const key=randomUUID(),token=randomUUID();
  const args=['gimun','individual','Test Delegate','Test University','test@example.test',1,new Date().toISOString(),'received',JSON.stringify({fullName:'Test Delegate',email:'test@example.test',committeePreference1:'unsc'}),'Receipt','<img src="cid:ticket"> {{REFERENCE_ID}}',[], 'Notification','{{REFERENCE_ID}}',2028,key,'hash',token,JSON.stringify([{filename:'ticket.png',content:'test',content_id:'ticket'}]),'PKR 4,500',4500,'test@example.test'];
  const sql=`select create_registration_v2(${args.map((_,i)=>`$${i+1}`).join(',')}) as receipt`;
  const first=(await db.query(sql,args)).rows[0].receipt;const second=(await db.query(sql,args)).rows[0].receipt;
  assert.deepEqual(first,second);assert.equal(first.referenceId,'REG-GIMUN-2028-0001');assert.equal(first.checkinToken,token);
  assert.equal((await db.query('select * from registrations')).rows.length,1);
  assert.equal((await db.query('select * from participants')).rows.length,1);
  assert.equal((await db.query('select * from email_outbox')).rows.length,1);
  await assert.rejects(()=>db.query(sql,args.map((v,i)=>i===16?'changed-hash':v)),/payload mismatch/);
  await db.exec("update reference_counters set next_value=10000 where track='gimun'");
  assert.equal((await db.query("select next_submission_reference('gimun',2029) as ref")).rows[0].ref,'REG-GIMUN-2029-10000');
  for(const role of ['anon','authenticated']){
    await db.exec(`set role ${role}`);
    for(const table of ['registrations','participants','email_outbox','content_entries','site_settings','admin_users','view_gimun_roster','view_moot_roster']) await assert.rejects(()=>db.query(`select * from public.${table}`),/permission denied/);
    await assert.rejects(()=>db.query("select public.next_submission_reference('gimun')"),/permission denied/);
    await assert.rejects(()=>db.query("select public.next_submission_reference('gimun',2028)"),/permission denied/);
    await db.exec('reset role');
  }
  const entry={collection:'announcements',id:'test',status:'published',sort_order:0,publish_at:null,expire_at:null,data:{id:'test',title:'Original',pinnedFlag:false},version:0};
  await db.query('select save_content($1,$2)',[JSON.stringify(entry),actor]);
  await assert.rejects(()=>db.query('select save_content($1,$2)',[JSON.stringify(entry),actor]),/changed/);
  entry.version=1;entry.data.title='Updated';await db.query('select save_content($1,$2)',[JSON.stringify(entry),actor]);
  assert.equal((await db.query('select * from content_revisions')).rows.length,1);
  const participant=(await db.query('select id from participants')).rows[0].id;
  await assert.rejects(()=>db.query("select admin_operation('checkin',$1,$2)",[JSON.stringify({participant_id:participant,checked:true,override:false}),actor]),/acceptance/);
  await db.query("update registrations set status='accepted',payment_status='paid' where reference_id=$1",[first.referenceId]);
  await db.query("select admin_operation('checkin',$1,$2)",[JSON.stringify({participant_id:participant,checked:true,override:false}),actor]);
  assert.ok((await db.query('select checked_in_at from participants')).rows[0].checked_in_at);
  await db.query("select admin_operation('certificate',$1,$2)",[JSON.stringify({participant_id:participant,kind:'participation',override:false}),actor]);
  assert.equal((await db.query('select * from certificates')).rows.length,1);
  console.log('PASS: migrations, private grants, idempotency, year/large counters, normalized roster, revisions, check-in and certificates');
} finally { await db.close(); }
