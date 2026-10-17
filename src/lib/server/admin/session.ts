import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Admin session limits, enforced by the proxy on every admin request:
 * - idle: no activity for ADMIN_IDLE_MINUTES (default 30) signs the person out;
 * - absolute: ADMIN_SESSION_HOURS (default 12) after sign-in, they sign in again.
 * Activity is recorded in a signed cookie, `admin_seen`, holding when the
 * session started and when it was last used. Background polling does not
 * count as use; typing and clicking do (the page pings while someone works).
 */
export const SEEN_COOKIE = 'admin_seen';

const number = (value: string | undefined, fallback: number, min: number, max: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};
export function sessionLimits() {
  return {
    idleMs: number(process.env.ADMIN_IDLE_MINUTES, 30, 5, 240) * 60_000,
    absoluteMs: number(process.env.ADMIN_SESSION_HOURS, 12, 1, 72) * 3_600_000,
  };
}

function secret() {
  // The same secret as the device cookie, with its own label so one can never stand in for the other.
  return process.env.RATE_LIMIT_HMAC_SECRET || 'development-rate-limit-secret';
}
const sign = (payload: string) => createHmac('sha256', secret()).update(`gimun-admin-seen:v1:${payload}`).digest('base64url').slice(0, 32);

export function mintSeen(since: number, seen: number) {
  const payload = `${Math.floor(since)}.${Math.floor(seen)}`;
  return `${payload}.${sign(payload)}`;
}
export function readSeen(value: string | undefined | null): { since: number; seen: number } | null {
  if (!value) return null;
  const [since, seen, signature] = value.split('.');
  if (!since || !seen || !signature) return null;
  const expected = Buffer.from(sign(`${since}.${seen}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const parsed = { since: Number(since), seen: Number(seen) };
  return Number.isFinite(parsed.since) && Number.isFinite(parsed.seen) ? parsed : null;
}
/** 'ok', or why the session must end. A missing or forged cookie starts a fresh window. */
export function sessionState(value: string | undefined | null, now = Date.now()): 'ok' | 'idle' | 'expired' | 'missing' {
  const seen = readSeen(value);
  if (!seen) return 'missing';
  const { idleMs, absoluteMs } = sessionLimits();
  if (now - seen.since > absoluteMs) return 'expired';
  if (now - seen.seen > idleMs) return 'idle';
  return 'ok';
}

/** Cookie settings for the admin session: never readable by page scripts, sent only over HTTPS in production. */
export function adminCookieOptions() {
  return {
    path: '/',
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: Math.round(sessionLimits().absoluteMs / 1000),
  };
}
