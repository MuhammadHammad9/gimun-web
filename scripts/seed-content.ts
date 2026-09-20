import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { defaultNavigation } from '../src/lib/navigation';
import { collections,registry,siteSchema } from '../src/lib/content/registry';
loadEnvConfig(process.cwd());
const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Configure Supabase before seeding.');
const db=createClient(url,key,{auth:{persistSession:false}});
const site=siteSchema.parse(JSON.parse(await readFile('content/site.json','utf8')));
const settings=await db.from('site_settings').upsert({id:'site',data:site},{onConflict:'id',ignoreDuplicates:true});if(settings.error)throw settings.error;
for(const collection of collections){
  const items=registry[collection].array().parse(collection==='navigation'?defaultNavigation:JSON.parse(await readFile(`content/${collection}.json`,'utf8')));
  if(!items.length)continue;
  const {error}=await db.from('content_entries').upsert(items.map((data,sort_order)=>({collection,id:data.id,data,status:'published',sort_order})),{onConflict:'collection,id',ignoreDuplicates:true});
  if(error)throw error;console.log(`Seeded missing entries: ${collection}`);
}
console.log('Seed complete. Existing admin edits were preserved.');
