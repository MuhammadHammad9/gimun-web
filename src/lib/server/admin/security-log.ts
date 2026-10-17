import 'server-only';
import { database } from '../supabase';

/** "a•••@example.com": enough to recognise an account in the log without storing the full address of a stranger. */
export function maskEmail(email: string) {
  const [name, domain] = email.toLowerCase().split('@');
  return domain ? `${name.slice(0, 1)}•••@${domain}` : '•••';
}

/**
 * Sign-ins, sign-outs, password and two-step changes go to the audit log under
 * "security". Logging never blocks the action itself: a failure is reported
 * to the server log instead.
 */
export async function securityEvent(action: string, actor: string | null, detail: Record<string, unknown> = {}) {
  try {
    const { error } = await database().from('audit_log').insert({ actor, action, section: 'security', entity_id: actor, detail });
    if (error) console.error('[Security log]', action, error.message);
  } catch (error) {
    console.error('[Security log]', action, error instanceof Error ? error.message : error);
  }
}
