'use server';
import { updateTag } from 'next/cache';
import { appliedRevision, publicRevision } from '@/lib/server/live';
import { enforceRateLimit } from '@/lib/server/submissions';

/** What a page can report as the revision it shows: a published stamp, or the outage marker. */
const REVISION = /^(?:[0-9a-f]{32}|unavailable)$/;

/**
 * Called by a public page that has seen a newer revision than the one it was
 * built from, just before it refreshes. Runs as a server action because
 * updateTag expires the cached content immediately and is applied before the
 * response returns, so the refresh that follows renders fresh data.
 *
 * Pages are stale when the stamp they share differs from the live revision
 * (something became visible or expired without a save, or the Pakistan date
 * rolled over). A page can also be stale while the shared stamp is current:
 * it was rebuilt from old data while an earlier purge was settling, or it was
 * rendered during a database blip and carries "unavailable" (then every
 * visitor refreshed it forever, since no purge ever replaced it). The
 * visitor's own revision (`have`) catches both.
 *
 * Anyone can call a server action, so every purge passes one throttle shared
 * by all server instances (Upstash; per instance if it is down): at most one
 * purge per ten seconds, however many visitors or scripts ask.
 */
export async function syncLiveContent(have: unknown): Promise<string> {
  const live = await publicRevision();
  if (!live.connected) return live.revision;
  const applied = await appliedRevision();
  const pagesStale = applied !== 'unavailable' && applied !== live.revision;
  const visitorStale = typeof have === 'string' && REVISION.test(have) && have !== live.revision;
  if ((pagesStale || visitorStale) && (await enforceRateLimit('live-purge', 'global')).allowed) updateTag('content');
  return live.revision;
}
