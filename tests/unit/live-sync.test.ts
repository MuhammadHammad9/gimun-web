import { beforeEach, describe, expect, it, vi } from 'vitest';

const { updateTag, state, enforceRateLimit } = vi.hoisted(() => {
  const state = { live: { revision: 'a'.repeat(32), connected: true, reason: '' }, applied: 'a'.repeat(32), allowed: true };
  return { state, updateTag: vi.fn(), enforceRateLimit: vi.fn(async () => ({ allowed: state.allowed, retryAfterSeconds: 10 })) };
});
vi.mock('next/cache', () => ({ updateTag }));
vi.mock('@backend/server/live', () => ({ publicRevision: async () => state.live, appliedRevision: async () => state.applied }));
vi.mock('@backend/server/submissions', () => ({ enforceRateLimit }));

import { syncLiveContent } from '../../src/app/live-actions';

const LIVE = 'a'.repeat(32);
const OLD = 'b'.repeat(32);
beforeEach(() => {
  updateTag.mockReset();
  enforceRateLimit.mockClear();
  state.live = { revision: LIVE, connected: true, reason: '' };
  state.applied = LIVE;
  state.allowed = true;
});

describe('syncLiveContent', () => {
  it('does nothing when the page and the cache are current', async () => {
    expect(await syncLiveContent(LIVE)).toBe(LIVE);
    expect(updateTag).not.toHaveBeenCalled();
  });

  it('purges when the shared cache is behind the live revision', async () => {
    state.applied = OLD;
    await syncLiveContent(LIVE);
    expect(updateTag).toHaveBeenCalledWith('content');
  });

  it('purges a page rendered during an outage, which used to refresh forever', async () => {
    await syncLiveContent('unavailable');
    expect(updateTag).toHaveBeenCalledWith('content');
  });

  it('ignores values that are not revisions, so scripts cannot force purges with junk', async () => {
    await syncLiveContent('x');
    await syncLiveContent({ revision: OLD });
    expect(updateTag).not.toHaveBeenCalled();
    expect(enforceRateLimit).not.toHaveBeenCalled();
  });

  it('purges at most as often as the shared throttle allows', async () => {
    state.allowed = false;
    await syncLiveContent(OLD);
    expect(enforceRateLimit).toHaveBeenCalledWith('live-purge', 'global');
    expect(updateTag).not.toHaveBeenCalled();
  });

  it('never purges while the database is unreachable', async () => {
    state.live = { revision: 'unavailable', connected: false, reason: 'down' };
    expect(await syncLiveContent(OLD)).toBe('unavailable');
    expect(updateTag).not.toHaveBeenCalled();
  });
});
