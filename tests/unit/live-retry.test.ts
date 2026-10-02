import { describe, expect, it } from 'vitest';
import { FIRST_RETRY_MS, MAX_RETRY_MS, markUnreachable, waitingOn } from '../../src/lib/live-retry';

const R2 = 'b'.repeat(32);
const R3 = 'c'.repeat(32);

describe('live update retries for a revision the page could not reach', () => {
  it('waits longer than the server purge throttle, then tries again', () => {
    // The purge for R2 was refused inside the shared ten-second window.
    const entry = markUnreachable(null, R2, 0);
    expect(FIRST_RETRY_MS).toBeGreaterThan(10_000);
    expect(waitingOn(entry, R2, FIRST_RETRY_MS - 1)).toBe(true);
    // It used to ignore R2 forever; now the page asks again once the window has passed.
    expect(waitingOn(entry, R2, FIRST_RETRY_MS)).toBe(false);
  });

  it('backs off on repeated misses, capped at two minutes', () => {
    let entry = markUnreachable(null, R2, 0);
    const waits = [entry.until];
    for (let i = 0; i < 6; i++) {
      entry = markUnreachable(entry, R2, 0);
      waits.push(entry.until);
    }
    expect(waits.slice(0, 4)).toEqual([15_000, 30_000, 60_000, 120_000]);
    expect(Math.max(...waits)).toBe(MAX_RETRY_MS);
  });

  it('never delays a newer revision', () => {
    const entry = markUnreachable(markUnreachable(null, R2, 0), R2, 0);
    expect(waitingOn(entry, R3, 1)).toBe(false);
    // A miss on the newer revision starts its own count from the shortest wait.
    expect(markUnreachable(entry, R3, 0)).toEqual({ revision: R3, misses: 1, until: FIRST_RETRY_MS });
  });

  it('does nothing before any miss', () => {
    expect(waitingOn(null, R2, 0)).toBe(false);
  });
});
