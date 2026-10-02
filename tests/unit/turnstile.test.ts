import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { turnstileEnabled, verifyTurnstile } from '../../src/lib/server/turnstile';

const siteverify = vi.fn();
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site-key');
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret-key');
  vi.stubGlobal('fetch', siteverify);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  siteverify.mockReset();
});
const answer = (body: unknown, status = 200) => siteverify.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));

describe('Turnstile verification', () => {
  it('is off unless both keys are set', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    expect(turnstileEnabled()).toBe(false);
    expect(await verifyTurnstile(undefined, '1.2.3.4')).toBe(true);
    expect(siteverify).not.toHaveBeenCalled();
  });

  it('refuses a missing or oversized token without asking Cloudflare', async () => {
    expect(await verifyTurnstile(undefined, '1.2.3.4')).toBe(false);
    expect(await verifyTurnstile('', '1.2.3.4')).toBe(false);
    expect(await verifyTurnstile('x'.repeat(3000), '1.2.3.4')).toBe(false);
    expect(siteverify).not.toHaveBeenCalled();
  });

  it('accepts a token Cloudflare confirms and sends the secret and visitor address', async () => {
    answer({ success: true });
    expect(await verifyTurnstile('token', '1.2.3.4')).toBe(true);
    const body = siteverify.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('secret')).toBe('secret-key');
    expect(body.get('response')).toBe('token');
    expect(body.get('remoteip')).toBe('1.2.3.4');
  });

  it('refuses a token Cloudflare rejects', async () => {
    answer({ success: false, 'error-codes': ['invalid-input-response'] });
    expect(await verifyTurnstile('forged', '1.2.3.4')).toBe(false);
  });

  it('lets people through when Cloudflare is down or our secret is wrong', async () => {
    siteverify.mockRejectedValueOnce(new Error('network'));
    expect(await verifyTurnstile('token', '1.2.3.4')).toBe(true);
    answer({}, 502);
    expect(await verifyTurnstile('token', '1.2.3.4')).toBe(true);
    answer({ success: false, 'error-codes': ['invalid-input-secret'] });
    expect(await verifyTurnstile('token', '1.2.3.4')).toBe(true);
  });
});
