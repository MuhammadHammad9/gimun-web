import { spawn } from 'node:child_process';
import { mkdir,open } from 'node:fs/promises';
import path from 'node:path';
const next=path.resolve('node_modules/next/dist/bin/next'),playwright=path.resolve('node_modules/@playwright/test/cli.js');
const env={...process.env,ADMIN_TEST_BUILD:'1',NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54329',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture-public',SUPABASE_URL:'http://127.0.0.1:54329',SUPABASE_SECRET_KEY:'fixture-service',SITE_URL:'http://127.0.0.1:3101',SUBMISSIONS_BACKEND:'supabase',UPSTASH_REDIS_REST_URL:'http://127.0.0.1:54329/redis',UPSTASH_REDIS_REST_TOKEN:'fixture',RATE_LIMIT_HMAC_SECRET:'fixture-only',NOTIFICATION_EMAIL:'ops@example.test',EMAIL_FROM:'receipts@example.test',RESEND_API_KEY:'',CRON_SECRET:'fixture-only',VERCEL_ENV:''};
await mkdir('artifacts',{recursive:true});const log=await open('artifacts/admin-server.log','w');
const fixture=spawn(process.execPath,['scripts/admin-test-server.mjs'],{env,stdio:['ignore',log.fd,log.fd],windowsHide:true});let server;
const run=(args)=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{env,stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`Command exited ${code}`)));});
async function ready(url){for(let attempt=0;attempt<120;attempt++){try{await fetch(url);return;}catch{await new Promise(r=>setTimeout(r,500));}}throw new Error(`Server not ready: ${url}`);}
try{await ready('http://127.0.0.1:54329');await run([next,'build']);server=spawn(process.execPath,[next,'start','-H','127.0.0.1','-p','3101'],{env,stdio:['ignore',log.fd,log.fd],windowsHide:true});await ready('http://127.0.0.1:3101/admin/login');await run([playwright,'test','--config=playwright.admin.config.ts']);}
finally{server?.kill();fixture.kill();await log.close();}
