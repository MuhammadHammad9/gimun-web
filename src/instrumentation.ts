export async function register() {
  if(process.env.NEXT_RUNTIME!=='nodejs')return;
  const {getMissingProductionConfig,isExplicitMemoryTestBackend}=await import('./lib/server/config');
  if(isExplicitMemoryTestBackend())return;
  const missing=getMissingProductionConfig({emailDelivery:true});
  for(const name of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'])if(!process.env[name])missing.push(name);
  if(missing.length)console.warn(`[Configuration] Missing or invalid: ${[...new Set(missing)].join(', ')}. Public seed content remains available; affected submission/admin services require configuration. See OPERATIONS_RUNBOOK.md.`);
}
