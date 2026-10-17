import { describe, expect, it } from 'vitest';
import { mintSeen, readSeen, sessionState } from '../../src/lib/server/admin/session';

describe('admin session limits', () => {
  const now = Date.parse('2026-10-18T12:00:00Z');
  it('accepts a recent, signed activity cookie', () => {
    expect(sessionState(mintSeen(now - 3_600_000, now - 60_000), now)).toBe('ok');
  });
  it('signs a person out after 30 idle minutes', () => {
    expect(sessionState(mintSeen(now - 3_600_000, now - 31 * 60_000), now)).toBe('idle');
  });
  it('ends any session 12 hours after sign-in, however active', () => {
    expect(sessionState(mintSeen(now - 13 * 3_600_000, now - 1000), now)).toBe('expired');
  });
  it('rejects a forged or edited cookie', () => {
    const value = mintSeen(now - 1000, now - 1000);
    const [since, , signature] = value.split('.');
    expect(readSeen(`${since}.${now}.${signature}`)).toBeNull();
    expect(sessionState('garbage', now)).toBe('missing');
    expect(sessionState(undefined, now)).toBe('missing');
  });
});
