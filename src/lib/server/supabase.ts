import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getServerConfig, isExplicitMemoryTestBackend } from './config';

export function hasDatabase() {
  const c = getServerConfig();
  if (isExplicitMemoryTestBackend(c)) return false;
  return Boolean(c.supabaseUrl && c.supabaseSecretKey);
}
export function database() {
  const c = getServerConfig();
  if (!c.supabaseUrl || !c.supabaseSecretKey) throw new Error('Configure SUPABASE_URL and SUPABASE_SECRET_KEY before using the admin.');
  return createClient(c.supabaseUrl, c.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(10000) }) },
  });
}
