// Local integration fixture only: real PostgreSQL migrations with a small
// PostgREST/Auth protocol adapter. Never deploy this server or use real data.
import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'node:http';
import { readFile,readdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
const db=new PGlite();const port=Number(process.env.FIXTURE_PORT||54329);
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
for(const f of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile(`supabase/migrations/${f}`,'utf8'));
const user={id:randomUUID(),email:'owner@example.test',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()};
await db.query('insert into auth.users values($1)',[user.id]);await db.query("insert into admin_users(user_id,email,display_name,role,must_change_password) values($1,$2,'Fixture owner','owner',false)",[user.id,user.email]);
const site=JSON.parse(await readFile('content/site.json','utf8'));await db.query("insert into site_settings(id,data) values('site',$1)",[JSON.stringify(site)]);
for(const f of ['announcements','schedule','committees','moot-categories','resources','faq','team','sponsors','gallery','clarifications','results']){
  const data=JSON.parse(await readFile(`content/${f}.json`,'utf8'));for(const [index,item]of data.entries())await db.query("insert into content_entries(collection,id,status,sort_order,data) values($1,$2,'published',$3,$4)",[f,item.id,index,JSON.stringify(item)]);
}
const sessions=new Set();
function token(){const now=Math.floor(Date.now()/1000);const t=[{alg:'HS256',typ:'JWT'},{sub:user.id,email:user.email,aud:'authenticated',role:'authenticated',iat:now,exp:now+3600}].map(v=>Buffer.from(JSON.stringify(v)).toString('base64url')).join('.')+'.'+Buffer.alloc(32).toString('base64url');sessions.add(t);return t;}
const ident=v=>{if(!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v))throw new Error('Invalid identifier');return `"${v}"`;};
const col=v=>{const [name,json]=v.split('->>');return ident(name)+(json?`->>'${json.replace(/[^a-zA-Z_]/g,'')}'`:'');};
const tables=new Set((await db.query("select tablename from pg_tables where schemaname='public'")).rows.map(r=>r.tablename));
function where(params,values){const clauses=[];for(const [key,value]of params){if(['select','order','limit','offset','on_conflict'].includes(key))continue;const match=/^(eq|neq|is|not.is|gt|gte|lt|lte|in|ilike)\.(.*)$/.exec(value);if(!match)throw new Error(`Unsupported filter ${key}`);const [,op,v]=match;const column=col(key);if(op==='is'||op==='not.is'){clauses.push(`${column} is ${op==='not.is'?'not ':''}${v==='null'?'null':v==='true'?'true':'false'}`);continue;}if(op==='in'){values.push(v.slice(1,-1).split(',').map(s=>s.replace(/^"|"$/g,'')));clauses.push(`${column}::text=any($${values.length}::text[])`);continue;}values.push(v);clauses.push(`${column}::text ${{eq:'=',neq:'<>',gt:'>',gte:'>=',lt:'<',lte:'<=',ilike:'ilike'}[op]} $${values.length}`);}return clauses.length?' where '+clauses.join(' and '):'';}
function splitSelect(s){let depth=0,out=[],start=0;for(let i=0;i<s.length;i++){if(s[i]==='(')depth++;if(s[i]===')')depth--;if(s[i]===','&&!depth){out.push(s.slice(start,i));start=i+1;}}out.push(s.slice(start));return out;}
const server=createServer(async(req,res)=>{let status=200;const url=new URL(req.url,`http://127.0.0.1:${port}`);const send=(data)=>{res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Expose-Headers':'Content-Range',...res.getHeaders()});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));};
try{
 if(req.method==='OPTIONS'){status=204;return send(null);}
 let body='';for await(const chunk of req)body+=chunk;const input=body?JSON.parse(body):null;
 if(url.pathname.startsWith('/auth/v1/')){
   console.log('Fixture auth',req.method,url.pathname);
   if(url.pathname.endsWith('/token')){if(input.email!==user.email||input.password!=='fixture-password-123'){status=400;return send({error:'invalid_grant',error_description:'Invalid credentials'});}return send({access_token:token(),refresh_token:'fixture-refresh',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user});}
   if(url.pathname.endsWith('/.well-known/jwks.json'))return send({keys:[]});
   if(url.pathname.endsWith('/logout'))return send({});
   if(url.pathname.endsWith('/user')){if(!sessions.has(req.headers.authorization?.replace('Bearer ',''))){status=401;return send({message:'Invalid JWT'});}return send(user);}
 }
 if(url.pathname==='/redis')return send({result:1});
 if(!url.pathname.startsWith('/rest/v1/')){status=404;return send({message:'Not found'});}
 if(req.headers.apikey!=='fixture-service'){status=403;return send({message:'Private fixture tables'});}
 if(url.pathname.startsWith('/rest/v1/rpc/')){const fn=url.pathname.split('/').at(-1);const values=Object.values(input).map(v=>v&&typeof v==='object'&&!Array.isArray(v)?JSON.stringify(v):v);const names=Object.keys(input);const types=(await db.query('select proargnames,proargtypes::regtype[]::text as types from pg_proc where proname=$1',[fn])).rows;const jsonArgs=new Set();for(const t of types){const tnames=t.proargnames||[];const ttypes=t.types.replace(/^[^{]*\{|\}$/g,'').split(',');tnames.forEach((n,i)=>{if(ttypes[i]==='jsonb')jsonArgs.add(n);});}names.forEach((name,i)=>{if(jsonArgs.has(name))values[i]=JSON.stringify(input[name]);});const result=await db.query(`select public.${ident(fn)}(${names.map((name,i)=>`${ident(name)}=>$${i+1}`).join(',')}) as result`,values);return send(fn==='claim_email_outbox'?result.rows.map(r=>r.result):result.rows[0]?.result??null);}
 const table=url.pathname.split('/').at(-1);if(!tables.has(table))throw new Error('Unknown table');const params=url.searchParams;
 const values=[];const conditions=where(params,values);
 if(req.method==='GET'||req.method==='HEAD'){
  const count=Number((await db.query(`select count(*) as count from ${ident(table)}${conditions}`,values)).rows[0].count);res.setHeader('Content-Range',`0-${Math.max(0,count-1)}/${count}`);
  const fields=splitSelect(params.get('select')||'*');const scalar=fields.filter(f=>!f.includes('('));let order='';if(params.has('order'))order=' order by '+params.get('order').split(',').map(v=>{const [c,d]=v.split('.');return col(c)+(d==='desc'?' desc':' asc');}).join(',');
  const result=await db.query(`select ${scalar.length?scalar.map(f=>f==='*'?'*':col(f)).join(','):'*'} from ${ident(table)}${conditions}${order} limit ${Math.min(10000,Number(params.get('limit')||1000))} offset ${Number(params.get('offset')||0)}`,values);
  for(const field of fields.filter(f=>f.includes('('))){const relation=field.slice(0,field.indexOf('('));const inner=field.slice(field.indexOf('(')+1,-1);for(const row of result.rows){if(relation==='participants'&&table==='registrations')row.participants=(await db.query(`select ${inner==='*'?'*':splitSelect(inner).map(ident).join(',')} from participants where registration_ref=$1`,[row.reference_id])).rows;else if(relation==='participants'&&table==='certificates')row.participants=(await db.query(`select ${splitSelect(inner).map(ident).join(',')} from participants where id=$1`,[row.participant_id])).rows[0];}}
  const singular=req.headers.accept?.includes('application/vnd.pgrst.object');if(singular){if(result.rows.length!==1){status=406;return send({code:'PGRST116',details:`The result contains ${result.rows.length} rows`,message:'JSON object requested, multiple (or no) rows returned'});}return send(result.rows[0]);}return send(result.rows);
 }
 if(req.method==='PATCH'){const keys=Object.keys(input);const offset=values.length;values.push(...keys.map(k=>input[k]&&typeof input[k]==='object'?JSON.stringify(input[k]):input[k]));const result=await db.query(`update ${ident(table)} set ${keys.map((k,i)=>`${ident(k)}=$${offset+i+1}`).join(',')}${conditions} returning *`,values);return send(req.headers.prefer?.includes('return=representation')?result.rows:null);}
 if(req.method==='POST'){const rows=Array.isArray(input)?input:[input];const out=[];for(const row of rows){const keys=Object.keys(row);const vals=keys.map(k=>row[k]&&typeof row[k]==='object'&&!Array.isArray(row[k])?JSON.stringify(row[k]):row[k]);const result=await db.query(`insert into ${ident(table)}(${keys.map(ident).join(',')}) values(${keys.map((_,i)=>`$${i+1}`).join(',')}) returning *`,vals);out.push(...result.rows);}status=201;return send(req.headers.prefer?.includes('return=representation')?out:null);}
 throw new Error('Unsupported fixture operation');
}catch(error){console.error('Fixture',url.pathname,error.message);status=400;send({message:error.message,code:error.code||'FIXTURE'});}});
server.listen(port,'127.0.0.1',()=>console.log(`Admin fixture ready on ${port}`));
process.on('SIGTERM',()=>server.close(()=>db.close().then(()=>process.exit())));
