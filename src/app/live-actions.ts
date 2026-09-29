'use server';
import { updateTag } from 'next/cache';
import { appliedRevision, publicRevision } from '@/lib/server/live';

/** A visitor-reported stale page may force a purge at most this often. */
const VISITOR_PURGE_INTERVAL_MS = 10_000;
let lastVisitorPurge = 0;

/**
 * Called by a public page that has seen a newer revision than the one it was
 * built from, just before it refreshes. Runs as a server action because
 * updateTag expires the cached content immediately and is applied before the
 * response returns, so the refresh that follows renders fresh data.
 *
 * Pages are stale when the stamp they share differs from the live revision
 * (something became visible or expired without a save, or the Pakistan date
 * rolled over). A page can also have been rebuilt from old data while an
 * earlier purge was settling; the visitor's own revision (`have`) catches
 * that, rate-limited so the action cannot be used to thrash the cache.
 */
export async function syncLiveContent(have: unknown): Promise<string> {
  const live = await publicRevision();
  if (!live.connected) return live.revision;
  const applied = await appliedRevision();
  const pagesStale = applied !== 'unavailable' && applied !== live.revision;
  const visitorStale =
    typeof have === 'string' && have !== 'unavailable' && have !== live.revision && Date.now() - lastVisitorPurge > VISITOR_PURGE_INTERVAL_MS;
  if (pagesStale || visitorStale) {
    if (!pagesStale) lastVisitorPurge = Date.now();
    updateTag('content');
  }
  return live.revision;
}
