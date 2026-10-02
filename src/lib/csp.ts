/**
 * Content Security Policies. Imported by next.config.ts (public pages) and
 * src/proxy.ts (admin), so it must stay free of server-only and React code.
 */

/** Origin of the Supabase project (media, admin uploads), or '' when unset or malformed. */
export function supabaseOrigin(): string {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : '';
  } catch {
    return '';
  }
}

const dev = () => process.env.NODE_ENV === 'development';
const join = (directives: string[]) => directives.map((d) => d.trim()).join('; ');

/**
 * Public pages are prerendered and cached, so they cannot carry a per-request
 * nonce, and Next's inline bootstrap scripts need 'unsafe-inline'. The value
 * of this policy is everything else: no plugins, no foreign frames or form
 * targets, and a short list of hosts.
 */
export function publicCsp(): string {
  const supabase = supabaseOrigin();
  return join([
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com${dev() ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com ${supabase}`,
    "font-src 'self'",
    `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com ${supabase}`,
    // Google Maps on the venue page; Cloudflare Turnstile renders its human check in a frame.
    'frame-src https://www.google.com https://maps.google.com https://challenges.cloudflare.com',
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ]);
}

/**
 * The admin is rendered per request, so its scripts can be pinned to a nonce:
 * an injected <script> or event handler cannot run even if some field were
 * ever rendered unescaped. 'strict-dynamic' lets Next's nonce-bearing loader
 * pull in its own chunks. The one inline script of the root layout is allowed
 * by hash (`bootScriptHash`, base64 SHA-256 of HEAD_BOOT_SCRIPT).
 */
export function adminCsp(nonce: string, bootScriptHash: string): string {
  const supabase = supabaseOrigin();
  return join([
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'sha256-${bootScriptHash}' 'strict-dynamic'${dev() ? " 'unsafe-eval'" : ''}`,
    // React style attributes cannot carry a nonce.
    "style-src 'self' 'unsafe-inline'",
    // data: covers the two-factor QR code; blob: covers upload previews.
    `img-src 'self' data: blob: ${supabase}`,
    "font-src 'self'",
    `connect-src 'self' ${supabase}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ]);
}
