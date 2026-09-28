export async function register() {
  if(process.env.NEXT_RUNTIME!=='nodejs')return;
  const {getMissingProductionConfig,isExplicitMemoryTestBackend}=await import('./lib/server/config');
  if(isExplicitMemoryTestBackend())return;
  const missing=getMissingProductionConfig({emailDelivery:true});
  for(const name of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'])if(!process.env[name])missing.push(name);
  // Server and browser keys must belong to the same Supabase project, or admin
  // sign-in succeeds against one project while data is read from another.
  const host=(value?:string)=>{try{return value?new URL(value).host:null;}catch{return null;}};
  const serverHost=host(process.env.SUPABASE_URL),browserHost=host(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if(serverHost&&browserHost&&serverHost!==browserHost)missing.push('SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL (different projects)');
  if(!missing.length)return;
  const message=`[Configuration] Missing or invalid: ${[...new Set(missing)].join(', ')}. See OPERATIONS_RUNBOOK.md.`;
  // A production deployment that boots without its configuration looks healthy
  // but fails every registration. Refuse to start instead; previews only warn.
  if(process.env.VERCEL_ENV==='production')throw new Error(message);
  console.warn(`${message} Public seed content remains available; submission and admin services need configuration.`);
}
