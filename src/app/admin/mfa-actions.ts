'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authClient, mfaState, requireAdmin } from '@/lib/server/admin/auth';
import { clientIp, enforceRateLimit } from '@/lib/server/submissions';
import { headers } from 'next/headers';
const code = z.string().regex(/^\d{6}$/);
/** Limited per address and per account, so a code cannot be guessed from many addresses. */
async function throttled(email: string) {
  const request = new Request('http://localhost', { headers: await headers() });
  if (!(await enforceRateLimit('admin-login', clientIp(request))).allowed) return true;
  return !(await enforceRateLimit('admin-mfa-account', email.toLowerCase())).allowed;
}
/** Starts authenticator enrolment and returns the QR code to scan. */
export async function startEnrolment() {
  await requireAdmin(true, true);
  // A session that still owes a code from an existing authenticator (password
  // only) must not be able to add a second one and use that to pass the gate.
  // Supabase refuses this too; checking here does not depend on its settings.
  if ((await mfaState()).needsCode) return { error: 'Enter the code from your existing authenticator app first.' };
  const client = await authClient();
  const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Authenticator ${new Date().toISOString().slice(0, 16)}` });
  if (error || !data) return { error: 'Two-factor setup is unavailable. Enable TOTP MFA in Supabase Auth settings.' };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}
/** Verifies a code for a new or existing authenticator and upgrades the session. */
export async function verifyCode(_previous: string, form: FormData) {
  const user = await requireAdmin(true, true);
  const value = code.safeParse(String(form.get('code') || '').replace(/\s/g, ''));
  if (!value.success) return 'Enter the 6-digit code from your authenticator app.';
  try { if (await throttled(user.email)) return 'Too many attempts. Please try later.'; } catch { return 'Verification is unavailable. Check the server configuration.'; }
  const client = await authClient();
  const { data: factors } = await client.auth.mfa.listFactors();
  const verified = factors?.totp.filter((f) => f.status === 'verified') ?? [];
  const requested = String(form.get('factorId') || '');
  let factorId: string;
  if ((await mfaState()).needsCode) {
    // Signing in: only an authenticator that was already confirmed counts.
    factorId = verified.find((f) => f.id === requested)?.id ?? verified[0]?.id ?? '';
  } else {
    // Enrolling: the factor just created by startEnrolment (it belongs to this user).
    factorId = requested || verified[0]?.id || '';
  }
  if (!factorId) return 'No authenticator is set up for this account.';
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code: value.data });
  if (error) return 'That code did not match. Check the time on your phone and try again.';
  redirect('/admin');
}
