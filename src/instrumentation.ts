export async function register() {
  if(process.env.NEXT_RUNTIME!=='nodejs')return;
  const {getMissingProductionConfig,isExplicitMemoryTestBackend}=await import('./lib/server/config');
  if(isExplicitMemoryTestBackend())return;
  const missing=getMissingProductionConfig({emailDelivery:true});
  // Bundled mode is an intentional local setup: public pages use checked-in
  // content and provider-backed admin features remain disabled.
  if(process.env.CMS_BACKEND!=='bundled')for(const name of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'])if(!process.env[name])missing.push(name);
  // Server and browser keys must belong to the same Supabase project, or admin
  // sign-in succeeds against one project while data is read from another.
  const host=(value?:string)=>{try{return value?new URL(value).host:null;}catch{return null;}};
  const serverHost=host(process.env.SUPABASE_URL),browserHost=host(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if(serverHost&&browserHost&&serverHost!==browserHost)missing.push('SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL (different projects)');
  if(!missing.length)return;
  const message=`[Configuration] Missing or invalid: ${[...new Set(missing)].join(', ')}. See OPERATIONS_RUNBOOK.md.`;
  // Never throw here: that would take every page down, including the public
  // information visitors need. The build-time check (scripts/check-env.mjs)
  // stops a misconfigured production deploy; at runtime we only log, forms
  // answer 503 and /api/health reports the problem.
  console.error(`${message} Public content remains available; submission and admin services need configuration.`);
}
