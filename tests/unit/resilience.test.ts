import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
const state: { configured: boolean; settings: { data: unknown; error: unknown }; entries: { data: unknown; error: unknown } } = {
  configured: true,
  settings: { data: { id: 'site' }, error: null },
  entries: { data: [], error: null },
};
vi.mock('@/lib/server/supabase', () => {
  const builder = (result: () => { data: unknown; error: unknown }) => {
    const chain: Record<string, unknown> = {};
    for (const method of ['select', 'eq', 'order']) chain[method] = () => chain;
    chain.maybeSingle = async () => result();
    chain.range = async () => result();
    return chain;
  };
  return {
    hasDatabase: () => state.configured,
    database: () => ({
      from: (table: string) => builder(() => (table === 'site_settings' ? state.settings : state.entries)),
    }),
  };
});

import { looksAutomated } from '../../src/lib/server/request';
import { enforceRateLimit } from '../../src/lib/server/submissions';
import { readCollection } from '../../src/lib/content/repository';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('bot check', () => {
  beforeEach(() => vi.stubEnv('NODE_ENV', 'production'));
  it('uses the client-measured fill time, whatever the device clock says', () => {
    // A phone clock 30 s fast: the old absolute-timestamp check called this a bot.
    expect(looksAutomated({ _ts: Date.now() + 30_000, _elapsed: 45_000 })).toBe(false);
    expect(looksAutomated({ _ts: Date.now() - 60_000, _elapsed: 300 })).toBe(true);
  });
  it('never treats a future timestamp from an old client as too fast', () => {
    expect(looksAutomated({ _ts: Date.now() + 5_000 })).toBe(false);
    expect(looksAutomated({ _ts: Date.now() - 400 })).toBe(true);
  });
  it('still catches the honeypot and missing timing data', () => {
    expect(looksAutomated({ _hp: 'filled', _elapsed: 60_000 })).toBe(true);
    expect(looksAutomated({})).toBe(true);
  });
});

describe('rate limiting', () => {
  it('degrades to per-instance limits when Upstash fails in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SUBMISSIONS_BACKEND', 'supabase');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.test');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token');
    vi.stubEnv('RATE_LIMIT_HMAC_SECRET', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(enforceRateLimit('registration', '198.51.100.9')).resolves.toMatchObject({ allowed: true });
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });
});

describe('content reads', () => {
  const seed = [{ id: 'seed-faq', category: 'general', question: 'Seed?', answer: 'Seed.' }];
  beforeEach(() => {
    vi.stubEnv('CMS_BACKEND', 'supabase');
    state.configured = true;
    state.settings = { data: { id: 'site' }, error: null };
  });

  it('skips one malformed entry instead of replacing the collection with seed data', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    state.entries = {
      data: [
        { id: 'good', data: { id: 'good', category: 'general', question: 'Live?', answer: 'Yes.' }, publish_at: null, expire_at: null },
        { id: 'bad', data: { id: 'bad', category: 'nonsense' }, publish_at: null, expire_at: null },
      ],
      error: null,
    };
    const result = await readCollection('faq', seed);
    expect(result.map((e) => (e as { id: string }).id)).toEqual(['good']);
    errors.mockRestore();
  });

  it('preserves the last successful content during a database outage', async () => {
    state.settings = { data: null, error: { message: 'timeout' } };
    await expect(readCollection('faq', seed)).resolves.toEqual([
      { id: 'good', category: 'general', question: 'Live?', answer: 'Yes.' },
    ]);
  });

  it('uses seed content during an outage when that collection has never loaded', async () => {
    state.settings = { data: null, error: { message: 'timeout' } };
    await expect(readCollection('navigation', [])).resolves.toEqual([]);
  });

  it('serves the seed deliberately when no database is configured', async () => {
    state.configured = false;
    await expect(readCollection('faq', seed)).resolves.toEqual(seed);
  });
});
