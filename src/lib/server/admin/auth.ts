import 'server-only';
import { cache } from 'react';
import { adminRevision } from '../live';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, unstable_rethrow } from 'next/navigation';
import { database } from '../supabase';
import { can, type AdminUser } from './permissions';
import { adminCookieOptions } from './session';

export async function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Admin authentication is not configured.');
  const store = await cookies();
  return createServerClient(url, key, { cookieOptions: adminCookieOptions(), cookies: { getAll: () => store.getAll(), setAll: values => {
    try { values.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Proxy refreshes cookies during server rendering. */ }
  } } });
}
/**
 * Two-factor gate. Anyone with an enrolled authenticator must complete the
 * code step every session. With ADMIN_REQUIRE_MFA=1, accounts without one are
 * sent to enrol before they can see any personal data.
 */
export async function mfaState() {
  const client = await authClient();
  const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) throw new Error('Unable to verify sign-in security. Please try again.');
  const enrolled = data.nextLevel === 'aal2';
  return {
    needsCode: enrolled && data.currentLevel !== 'aal2',
    needsEnrolment: !enrolled && process.env.ADMIN_REQUIRE_MFA === '1',
  };
}
export const requireAdmin=cache(async(allowPasswordChange = false, allowMfaSetup = false): Promise<AdminUser> => {
  const client = await authClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect('/admin/login');
  if (!allowMfaSetup) {
    const mfa = await mfaState();
    if (mfa.needsCode || mfa.needsEnrolment) redirect('/admin/mfa');
  }
  const { data: user, error: profileError } = await database().from('admin_users').select('*').eq('user_id', data.user.id).eq('active', true).maybeSingle();
  if (profileError) throw new Error('The admin profile could not be loaded. Try again shortly.');
  if (!user) throw new Error('This account has no active admin access.');
  if (user.must_change_password && !allowPasswordChange) redirect('/admin/password');
  // Only an unreachable database is ignored here; a missing migration is reported clearly.
  if ((await missingMigrations().catch(() => [])).length) redirect('/admin/update-needed');
  await adminRevision(user as AdminUser).catch(()=>undefined);
  return user as AdminUser;
});
export async function requirePermission(section: string, write = false) {
  const user = await requireAdmin();
  if (!can(user, section, write)) throw new Error('You do not have permission for this operation.');
  return user;
}

/**
 * Permission check for route handlers. requirePermission redirects to sign-in
 * or throws, which a route handler turned into a bare 500.
 * - `fetch` callers (JSON): every failure becomes a 401 JSON answer, since a
 *   redirect would hand the page an HTML login screen it cannot parse.
 * - Browser navigations: the sign-in redirect still happens; missing access
 *   or an unreachable database becomes a plain 403/503 page.
 */
export async function routePermission(section: string, write: boolean, mode: 'json' | 'page'): Promise<AdminUser | Response> {
  try {
    return await requirePermission(section, write);
  } catch (error) {
    if (mode === 'json') return Response.json({ success: false, connected: false, message: 'Your admin session has expired or lacks permission. Sign in again.' }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } });
    unstable_rethrow(error);
    const denied = error instanceof Error && /permission|no active admin/i.test(error.message);
    return new Response(denied ? 'You do not have permission for this page.' : 'The admin workspace is temporarily unavailable. Try again shortly.', { status: denied ? 403 : 503, headers: { 'Cache-Control': 'private, no-store' } });
  }
}

/**
 * Step-up for risky actions (permanent delete, emptying Trash, admin accounts,
 * admin settings): the session must have passed a two-step code within the
 * last 15 minutes. Returns null when it has; otherwise what the person must do.
 */
export type StepUp = 'code' | 'enrol';
const STEP_UP_MS = 15 * 60_000;
type AmrEntry = { method?: string; timestamp?: number } | string;
export async function stepUpNeeded(): Promise<StepUp | null> {
  const client = await authClient();
  const { data } = await client.auth.getClaims();
  const claims = data?.claims as { aal?: string; amr?: AmrEntry[] } | undefined;
  const fresh = claims?.aal === 'aal2' && (claims.amr ?? []).some((e) => typeof e === 'object' && e.method === 'totp' && Number(e.timestamp) * 1000 > Date.now() - STEP_UP_MS);
  if (fresh) return null;
  const { data: factors } = await client.auth.mfa.listFactors();
  return factors?.totp.some((f) => f.status === 'verified') ? 'code' : 'enrol';
}

/**
 * The admin needs migrations 0015–0020. When the database is behind the code
 * every page would fail with a vague error, so requireAdmin sends people to a
 * page that says exactly what to run. Checked at most once a minute per server.
 */
export const REQUIRED_MIGRATIONS = [
  { file: '0015_event_scope.sql', probe: () => database().from('admin_settings').select('id').limit(1) },
  { file: '0017_trash.sql', probe: () => database().from('content_entries').select('deleted_at').limit(1) },
  { file: '0018_team_groups.sql', probe: async () => { const r = await database().from('content_entries').select('id', { count: 'exact', head: true }).eq('collection', 'team-groups'); return r.error ? r : { error: (r.count ?? 0) > 0 ? null : { message: 'no team categories' } }; } },
  { file: '0019_people.sql', probe: () => database().from('participants').select('event').limit(1) },
];
let schemaCheck: { at: number; missing: string[] } | null = null;
export async function missingMigrations(): Promise<string[]> {
  if (schemaCheck && Date.now() - schemaCheck.at < 60_000) return schemaCheck.missing;
  const results = await Promise.all(REQUIRED_MIGRATIONS.map(async (m) => ({ file: m.file, ok: !(await m.probe()).error })));
  schemaCheck = { at: Date.now(), missing: results.filter((r) => !r.ok).map((r) => r.file) };
  return schemaCheck.missing;
}
