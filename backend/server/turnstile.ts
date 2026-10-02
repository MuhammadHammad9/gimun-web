import 'server-only';

/**
 * Server half of the Cloudflare Turnstile check (see
 * frontend/components/forms/Turnstile.tsx). Enforced only when both keys are set,
 * so local development and the in-memory test backend are unaffected.
 */
export function turnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}

export const TURNSTILE_FAILED_MESSAGE = 'The security check did not pass. Complete the check below the form and submit again.';

/**
 * `true` when the request may proceed. A missing or rejected token fails. If
 * Cloudflare itself cannot be reached the request is let through (and logged):
 * the per-address and per-recipient limits still apply, and an outage at a
 * third party must not close registration.
 */
export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!.trim(), response: token });
  if (ip && ip !== 'unknown') body.set('remoteip', ip);
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`[Turnstile] siteverify returned HTTP ${response.status}; allowing the request.`);
      return true;
    }
    const result = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (result.success) return true;
    // A wrong secret is our fault, not the visitor's: let them through and say so loudly.
    if (result['error-codes']?.some((code) => code === 'invalid-input-secret' || code === 'missing-input-secret')) {
      console.error('[Turnstile] TURNSTILE_SECRET_KEY is rejected by Cloudflare; allowing the request.');
      return true;
    }
    return false;
  } catch {
    console.error('[Turnstile] siteverify is unreachable; allowing the request.');
    return true;
  }
}
