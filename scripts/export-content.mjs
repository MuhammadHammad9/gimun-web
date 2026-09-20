import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { mkdir,writeFile } from 'node:fs/promises';
loadEnvConfig(process.cwd());
const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Configure Supabase before exporting.');
const db=createClient(url,key,{auth:{persistSession:false}});const output=`artifacts/content-${new Date().toISOString().replace(/[:.]/g,'-')}`;await mkdir(output,{recursive:true});
const {data:site,error}=await db.from('site_settings').select('*').eq('id','site').single();if(error)throw error;
await writeFile(`${output}/site.json`,JSON.stringify(site.data,null,2));
const all=[];for(let offset=0;;offset+=500){const {data,error}=await db.from('content_entries').select('*').order('collection').order('id').range(offset,offset+499);if(error)throw error;all.push(...data);if(data.length<500)break;}
await writeFile(`${output}/entries-with-state.json`,JSON.stringify(all,null,2));
for(const collection of new Set(all.map(e=>e.collection)))await writeFile(`${output}/${collection}.json`,JSON.stringify(all.filter(e=>e.collection===collection&&e.status==='published').sort((a,b)=>a.sort_order-b.sort_order).map(e=>e.data),null,2));
console.log(`Content snapshot: ${output}`);
