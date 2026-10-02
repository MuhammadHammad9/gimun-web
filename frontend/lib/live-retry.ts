/**
 * A public page that refreshed but still showed an older revision than the
 * server reported stops chasing that revision for a while, then tries again.
 *
 * It must not give up for good: the server may have refused the purge only
 * because another purge ran in the last ten seconds (the shared throttle in
 * src/app/live-actions.ts). The first wait is longer than that window, so the
 * next attempt can purge; each further miss doubles the wait, so a page that
 * really cannot regenerate costs a request every two minutes at most.
 */
export const FIRST_RETRY_MS = 15_000;
export const MAX_RETRY_MS = 120_000;

export type Unreachable = { revision: string; until: number; misses: number };

/** Record another failed attempt to reach `revision`. */
export function markUnreachable(previous: Unreachable | null, revision: string, now: number): Unreachable {
  const misses = previous?.revision === revision ? previous.misses + 1 : 1;
  return { revision, misses, until: now + Math.min(FIRST_RETRY_MS * 2 ** (misses - 1), MAX_RETRY_MS) };
}

/** True while the page should leave `revision` alone. */
export function waitingOn(entry: Unreachable | null, revision: string, now: number): boolean {
  return entry !== null && entry.revision === revision && now < entry.until;
}
