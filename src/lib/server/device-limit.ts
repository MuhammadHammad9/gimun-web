import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { enforceRateLimit, rateLimitSubject } from '@/lib/server/submissions';
import { isExplicitMemoryTestBackend } from '@/lib/server/config';

/**
 * Registration attempts per device.
 *
 * Each browser may send a limited number of applications (2 by default) and
 * is then locked for a cooling-off period (30 minutes by default) counted from
 * its last accepted attempt. The browser is recognised by a signed, HttpOnly
 * cookie minted by GET /api/register/status; a request without a valid cookie
 * (a script, or a browser that refuses cookies) is counted against its network
 * address instead, so clearing cookies does not reset the allowance for free.
 *
 * Only distinct applications count. A retry of the same submission (same
 * submission key and the same details, e.g. after a dropped connection) is a
 * replay: it is let through, even while locked, and the database answers it
 * idempotently. Changing the details under the same key is a new attempt.
 *
 * The per-network limit (`registration` in RATE_LIMITS), Turnstile and the
 * per-recipient receipt cap still apply on top; this layer stops one machine
 * from hammering the form, the others stop scripts that rotate everything.
 */

export const DEVICE_COOKIE = 'gimun_device';
const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;
const ID_BYTES = 16;

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function deviceLimitConfig() {
  return {
    maxAttempts: positiveInt(process.env.REGISTER_DEVICE_MAX_ATTEMPTS, 2),
    lockMs: positiveInt(process.env.REGISTER_DEVICE_LOCK_MINUTES, 30) * 60 * 1000,
  };
}

function secret() {
  return process.env.RATE_LIMIT_HMAC_SECRET || 'development-rate-limit-secret';
}

function sign(id: string) {
  return createHmac('sha256', secret()).update(`gimun-device:v1:${id}`).digest('base64url').slice(0, 32);
}

/** The device id inside a cookie value, or null when it is absent, malformed or not signed by this server. */
export function verifyDeviceCookie(value: string | undefined | null): string | null {
  if (!value || value.length > 128) return null;
  const match = /^([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{32})$/.exec(value);
  if (!match) return null;
  const expected = Buffer.from(sign(match[1]));
  const given = Buffer.from(match[2]);
  return expected.length === given.length && timingSafeEqual(expected, given) ? match[1] : null;
}

export function mintDeviceCookie() {
  const id = randomBytes(ID_BYTES).toString('base64url');
  return { id, value: `${id}.${sign(id)}` };
}

export function deviceCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production' && !isExplicitMemoryTestBackend(),
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

/** Whose allowance a request uses: the signed device, or its network when there is none. */
export function deviceSubject(cookieValue: string | undefined | null, ip: string) {
  const id = verifyDeviceCookie(cookieValue);
  return id ? `device:${id}` : `network:${rateLimitSubject(ip)}`;
}

/**
 * Mints a device cookie for a visitor who has none, limited per network so a
 * script cannot collect a fresh allowance on every request. Returns null when
 * the limit is reached; that visitor is then counted by network address.
 */
export async function mintDeviceForNetwork(ip: string) {
  if (!(await enforceRateLimit('device-mint', ip)).allowed) return null;
  return mintDeviceCookie();
}

export type DeviceAttempts = {
  /** The attempt may proceed (a new attempt within the allowance, or a replay). */
  allowed: boolean;
  /** The same submission was already counted. */
  replay: boolean;
  maxAttempts: number;
  remaining: number;
  /** Seconds until the allowance resets; 0 when no attempt is on record. */
  retryAfterSeconds: number;
};

// --- Storage: shared Upstash store, per-instance memory as a fallback ---------

/**
 * One atomic step. KEYS: attempt count, seen fingerprints. ARGV: fingerprint,
 * max attempts, window in ms, mode ("peek" or "record"). Returns
 * {status, count, ttlMs}: status 1 = counted, 2 = replay, 0 = refused,
 * 3 = peek. Every counted attempt restarts the window, so the lock lasts the
 * full period from the attempt that used up the allowance.
 */
const SCRIPT = `
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
local ttl = redis.call('PTTL', KEYS[1])
if ARGV[4] == 'peek' then return {3, count, ttl} end
if redis.call('SISMEMBER', KEYS[2], ARGV[1]) == 1 then return {2, count, ttl} end
if count >= tonumber(ARGV[2]) then return {0, count, ttl} end
count = redis.call('INCR', KEYS[1])
redis.call('PEXPIRE', KEYS[1], ARGV[3])
redis.call('SADD', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[3])
return {1, count, tonumber(ARGV[3])}
`;

type Step = { status: 0 | 1 | 2 | 3; count: number; ttlMs: number };

const memory = new Map<string, { count: number; seen: Set<string>; expiresAt: number }>();
const MEMORY_PRUNE_AT = 5_000;
const MEMORY_MAX = 20_000;
function pruneMemory(now: number) {
  if (memory.size < MEMORY_PRUNE_AT) return;
  for (const [key, entry] of memory) if (now >= entry.expiresAt) memory.delete(key);
  for (const key of memory.keys()) {
    if (memory.size < MEMORY_MAX) break;
    memory.delete(key);
  }
}

function memoryStep(key: string, fingerprint: string, max: number, windowMs: number, mode: 'peek' | 'record'): Step {
  const now = Date.now();
  pruneMemory(now);
  let entry = memory.get(key);
  if (entry && now >= entry.expiresAt) {
    memory.delete(key);
    entry = undefined;
  }
  const ttl = entry ? entry.expiresAt - now : -2;
  if (mode === 'peek') return { status: 3, count: entry?.count ?? 0, ttlMs: ttl };
  if (entry?.seen.has(fingerprint)) return { status: 2, count: entry.count, ttlMs: ttl };
  if (entry && entry.count >= max) return { status: 0, count: entry.count, ttlMs: ttl };
  const next = entry ?? { count: 0, seen: new Set<string>(), expiresAt: 0 };
  next.count += 1;
  next.seen.add(fingerprint);
  next.expiresAt = now + windowMs;
  memory.set(key, next);
  return { status: 1, count: next.count, ttlMs: windowMs };
}

async function step(subject: string, fingerprint: string, mode: 'peek' | 'record'): Promise<Step> {
  const { maxAttempts, lockMs } = deviceLimitConfig();
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const hmacSecret = process.env.RATE_LIMIT_HMAC_SECRET;
  const production = process.env.NODE_ENV === 'production' && !isExplicitMemoryTestBackend();
  const digest = createHmac('sha256', secret()).update(subject).digest('hex');
  const base = `gimun:register-device:${digest}`;

  // Same rule as enforceRateLimit: only keyed hashes go to the shared store.
  if (url && token && (hmacSecret || !production)) {
    try {
      const response = await fetch(url.replace(/\/$/, ''), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(['EVAL', SCRIPT, 2, `${base}:count`, `${base}:seen`, fingerprint, maxAttempts, lockMs, mode]),
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const { result } = (await response.json()) as { result?: unknown };
        if (Array.isArray(result) && result.length === 3 && result.every((n) => Number.isInteger(Number(n)))) {
          return { status: Number(result[0]) as Step['status'], count: Number(result[1]), ttlMs: Number(result[2]) };
        }
        throw new Error('Invalid device-limit response');
      }
      console.error(`[DeviceLimit] Upstash returned HTTP ${response.status}; using per-instance limits.`);
    } catch {
      console.error('[DeviceLimit] Upstash is unreachable; using per-instance limits.');
    }
  }
  return memoryStep(base, fingerprint, maxAttempts, lockMs, mode);
}

function summarize(result: Step): DeviceAttempts {
  const { maxAttempts } = deviceLimitConfig();
  const used = Math.max(0, result.count);
  const retryAfterSeconds = result.ttlMs > 0 ? Math.ceil(result.ttlMs / 1000) : 0;
  return {
    allowed: result.status === 1 || result.status === 2 || (result.status === 3 && used < maxAttempts),
    replay: result.status === 2,
    maxAttempts,
    remaining: Math.max(0, maxAttempts - used),
    retryAfterSeconds: used > 0 ? retryAfterSeconds : 0,
  };
}

/** Read-only: how much of the allowance is left. */
export async function deviceAttemptStatus(subject: string): Promise<DeviceAttempts> {
  return summarize(await step(subject, '', 'peek'));
}

/**
 * Counts one registration attempt. `fingerprint` identifies the submission
 * (submission key plus a hash of its details), so a retry is not counted twice.
 */
export async function recordDeviceAttempt(subject: string, fingerprint: string): Promise<DeviceAttempts> {
  return summarize(await step(subject, fingerprint, 'record'));
}

/** Test hook: forget every per-instance record. */
export function resetDeviceLimitMemory() {
  memory.clear();
}

/** Visible message for a device that has used its allowance. */
export function deviceLimitMessage(retryAfterSeconds: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Registration limit reached on this device. You can try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}
