import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deviceSubject,
  mintDeviceCookie,
  recordDeviceAttempt,
  deviceAttemptStatus,
  resetDeviceLimitMemory,
  verifyDeviceCookie,
  deviceLimitMessage,
} from '../../src/lib/server/device-limit';

beforeEach(() => {
  // No Upstash in unit tests: the per-instance memory store is exercised.
  vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
  vi.stubEnv('RATE_LIMIT_HMAC_SECRET', 'unit-test-secret');
  vi.stubEnv('REGISTER_DEVICE_MAX_ATTEMPTS', '2');
  vi.stubEnv('REGISTER_DEVICE_LOCK_MINUTES', '30');
  resetDeviceLimitMemory();
});
afterEach(() => {
  vi.unstubAllEnvs();
  resetDeviceLimitMemory();
});

describe('device cookie signing', () => {
  it('round-trips a freshly minted cookie', () => {
    const { id, value } = mintDeviceCookie();
    expect(verifyDeviceCookie(value)).toBe(id);
  });
  it('rejects tampered, foreign, or malformed cookies', () => {
    const { id, value } = mintDeviceCookie();
    expect(verifyDeviceCookie(value.replace(/.$/, 'X'))).toBeNull(); // bad signature
    expect(verifyDeviceCookie(`${id}.deadbeefdeadbeefdeadbeefdeadbeef`)).toBeNull();
    expect(verifyDeviceCookie('not-a-cookie')).toBeNull();
    expect(verifyDeviceCookie('')).toBeNull();
    expect(verifyDeviceCookie(null)).toBeNull();
  });
  it('a different secret cannot verify a cookie (forgery needs the secret)', () => {
    const { value } = mintDeviceCookie();
    vi.stubEnv('RATE_LIMIT_HMAC_SECRET', 'a-different-secret');
    expect(verifyDeviceCookie(value)).toBeNull();
  });
});

describe('deviceSubject', () => {
  it('keys on the signed device id when the cookie is valid', () => {
    const { id, value } = mintDeviceCookie();
    expect(deviceSubject(value, '203.0.113.9')).toBe(`device:${id}`);
  });
  it('falls back to the /64 network when there is no valid cookie', () => {
    expect(deviceSubject(undefined, '203.0.113.9')).toBe('network:203.0.113.9');
    expect(deviceSubject('forged.badsig', '2001:db8:1:2:3:4:5:6')).toBe('network:2001:db8:1:2::/64');
  });
});

describe('recordDeviceAttempt', () => {
  it('allows the configured number of distinct attempts, then locks with a ~30-minute timer', async () => {
    const subject = 'device:unit-A';
    const a = await recordDeviceAttempt(subject, 'fp-1');
    const b = await recordDeviceAttempt(subject, 'fp-2');
    const c = await recordDeviceAttempt(subject, 'fp-3');
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
    expect(c.allowed).toBe(false);
    expect(c.replay).toBe(false);
    expect(c.remaining).toBe(0);
    expect(c.retryAfterSeconds).toBeGreaterThan(1700);
    expect(c.retryAfterSeconds).toBeLessThanOrEqual(1800);
  });

  it('treats the same fingerprint as a replay — allowed and not counted, even while locked', async () => {
    const subject = 'device:unit-B';
    await recordDeviceAttempt(subject, 'same');
    await recordDeviceAttempt(subject, 'other');
    // Allowance is used up now; a brand-new fingerprint is refused…
    expect((await recordDeviceAttempt(subject, 'third')).allowed).toBe(false);
    // …but replaying a counted submission still goes through (idempotent retry).
    const replay = await recordDeviceAttempt(subject, 'same');
    expect(replay.allowed).toBe(true);
    expect(replay.replay).toBe(true);
  });

  it('keeps separate allowances per subject', async () => {
    await recordDeviceAttempt('device:X', 'x1');
    await recordDeviceAttempt('device:X', 'x2');
    expect((await recordDeviceAttempt('device:X', 'x3')).allowed).toBe(false);
    // A different device is unaffected.
    expect((await recordDeviceAttempt('device:Y', 'y1')).allowed).toBe(true);
  });
});

describe('deviceAttemptStatus', () => {
  it('reports remaining attempts without recording one', async () => {
    const subject = 'device:unit-C';
    const before = await deviceAttemptStatus(subject);
    expect(before.remaining).toBe(2);
    expect(before.allowed).toBe(true);
    expect(before.retryAfterSeconds).toBe(0);
    // Peeking twice does not consume the allowance.
    const again = await deviceAttemptStatus(subject);
    expect(again.remaining).toBe(2);
  });
  it('reflects a used-up allowance as locked with a countdown', async () => {
    const subject = 'device:unit-D';
    await recordDeviceAttempt(subject, '1');
    await recordDeviceAttempt(subject, '2');
    const status = await deviceAttemptStatus(subject);
    expect(status.remaining).toBe(0);
    expect(status.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe('deviceLimitMessage', () => {
  it('rounds up to whole minutes', () => {
    expect(deviceLimitMessage(1800)).toContain('30 minutes');
    expect(deviceLimitMessage(61)).toContain('2 minutes');
    expect(deviceLimitMessage(30)).toContain('1 minute');
  });
});
