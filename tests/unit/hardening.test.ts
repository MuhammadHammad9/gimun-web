import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
const rpc = vi.fn(), update = vi.fn(), maybeSingle = vi.fn();
vi.mock('@/lib/server/supabase', () => ({
  database: () => ({
    rpc,
    from: () => {
      const chain: Record<string, unknown> = {};
      chain.update = () => ({ eq: () => ({ eq: update }) });
      chain.select = () => chain;
      chain.eq = () => chain;
      chain.maybeSingle = maybeSingle;
      return chain;
    },
  }),
}));
vi.mock('@/lib/content', () => ({ getSiteConfig: async () => ({}), getCommittees: async () => [], getProblemCategories: async () => [] }));
import { newSubmissionKey, readSubmissionResponse } from '../../src/lib/uuid';
import { normalizeFormStrings } from '../../src/lib/validation';
import { dispatchEmailOutbox } from '../../src/lib/server/submissions';
import { CertificateLookupError, findCertificate } from '../../src/lib/server/certificates';

// The server's check in registration-handler.ts.
const SERVER_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  rpc.mockReset();
  update.mockReset();
  maybeSingle.mockReset();
});

describe('submission keys on older browsers', () => {
  it('produces a key the server accepts when crypto.randomUUID is missing', () => {
    vi.stubGlobal('crypto', { getRandomValues: (bytes: Uint8Array) => globalThis.Buffer.from(bytes.map((_, i) => (i * 37 + 11) & 255)).copy(bytes) });
    const key = newSubmissionKey();
    expect(key).toMatch(SERVER_KEY);
  });
  it('still produces a valid key with no crypto at all', () => {
    vi.stubGlobal('crypto', undefined);
    for (let i = 0; i < 20; i += 1) expect(newSubmissionKey()).toMatch(SERVER_KEY);
  });
  it('explains a non-JSON reply instead of blaming the connection', async () => {
    const reply = await readSubmissionResponse(new Response('<html>Gateway Timeout</html>', { status: 504 }));
    expect(reply).toEqual({ success: false, message: expect.stringContaining('will not create a duplicate') });
  });
});

describe('form body depth', () => {
  it('bounds recursion on absurdly nested input instead of overflowing the stack', () => {
    let deep: unknown = 'x';
    for (let i = 0; i < 50_000; i += 1) deep = [deep];
    expect(() => normalizeFormStrings({ nested: deep })).not.toThrow();
  });
  it('still trims every field of a real delegation', () => {
    expect(normalizeFormStrings({ delegates: [{ name: '  Ana  ' }] })).toEqual({ delegates: [{ name: 'Ana' }] });
  });
});

describe('outbox resilience', () => {
  it('keeps going when recording one failure also fails', async () => {
    vi.stubEnv('SUBMISSIONS_BACKEND', 'supabase');
    vi.stubEnv('RESEND_API_KEY', 'test');
    vi.stubEnv('EMAIL_FROM', 'test@example.test');
    const message = (id: string) => ({ id, from_address: 'test@example.test', to_addresses: ['a@example.test'], subject: 'S', html: 'h', attempts: 1, retry_until: new Date(Date.now() + 3_600_000).toISOString() });
    rpc.mockResolvedValue({ data: [message('first'), message('second')], error: null });
    update.mockResolvedValueOnce({ error: { message: 'database blip' } }).mockResolvedValue({ error: null });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}', { status: 500 })).mockResolvedValue(new Response(JSON.stringify({ id: 'provider-id' }))));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await dispatchEmailOutbox();
    expect(result).toMatchObject({ claimed: 2, retried: 1, sent: 1 });
  });
});

describe('certificate verification during an outage', () => {
  const code = '11111111-1111-4111-8111-111111111111';
  it('throws rather than reporting a genuine certificate as not found', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'timeout' } });
    await expect(findCertificate(code)).rejects.toBeInstanceOf(CertificateLookupError);
  });
  it('returns null only when no certificate has the code', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(findCertificate(code)).resolves.toBeNull();
  });
});

describe('malformed URLs', () => {
  it('answers 400 before Next fails to decode a dynamic segment (it was a 500)', async () => {
    const { NextRequest } = await import('next/server');
    const { proxy } = await import('../../src/proxy');
    for (const path of ['/gimun/committees/abc%', '/verify/%ZZ', '/survey/%E0%A4']) {
      expect((await proxy(new NextRequest(`https://gimun.test${path}`))).status).toBe(400);
    }
    expect((await proxy(new NextRequest('https://gimun.test/gimun/committees/unsc'))).status).toBe(200);
  });
});
