'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authClient, requireAdmin } from '@/lib/server/admin/auth';
import { clientIp, enforceRateLimit } from '@/lib/server/submissions';
import { headers } from 'next/headers';
const code = z.string().regex(/^\d{6}$/);
async function throttled() {
  const request = new Request('http://localhost', { headers: await headers() });
  return !(await enforceRateLimit('admin-login', clientIp(request))).allowed;
}
/** Starts authenticator enrolment and returns the QR code to scan. */
export async function startEnrolment() {
  await requireAdmin(true, true);
  const client = await authClient();
  const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Authenticator ${new Date().toISOString().slice(0, 16)}` });
  if (error || !data) return { error: 'Two-factor setup is unavailable. Enable TOTP MFA in Supabase Auth settings.' };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}
/** Verifies a code for a new or existing authenticator and upgrades the session. */
export async function verifyCode(_previous: string, form: FormData) {
  await requireAdmin(true, true);
  const value = code.safeParse(String(form.get('code') || '').replace(/\s/g, ''));
  if (!value.success) return 'Enter the 6-digit code from your authenticator app.';
  try { if (await throttled()) return 'Too many attempts. Please try later.'; } catch { return 'Verification is unavailable. Check the server configuration.'; }
  const client = await authClient();
  let factorId = String(form.get('factorId') || '');
  if (!factorId) {
    const { data } = await client.auth.mfa.listFactors();
    factorId = data?.totp.find((f) => f.status === 'verified')?.id || '';
  }
  if (!factorId) return 'No authenticator is set up for this account.';
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code: value.data });
  if (error) return 'That code did not match. Check the time on your phone and try again.';
  redirect('/admin');
}
