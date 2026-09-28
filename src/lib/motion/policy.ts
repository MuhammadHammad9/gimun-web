/**
 * How much motion this visitor gets.
 *
 * - `none`: reduced motion or Save-Data. No motion library loads, no curtain,
 *   no smooth scroll; counters and scrambles show their final text.
 * - `lite`: touch devices and narrow screens. Reveals and the curtain run;
 *   pinned and horizontally panned chapters fall back to their static layout.
 * - `full`: fine pointer and at least 1024 px wide. Everything, including
 *   smooth scrolling.
 */
export type MotionTier = 'none' | 'lite' | 'full';

const REDUCED = '(prefers-reduced-motion: reduce)';
const COARSE = '(pointer: coarse)';
const WIDE = '(min-width: 1024px)';

function saveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}

export function motionTier(): MotionTier {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'none';
  if (window.matchMedia(REDUCED).matches || saveData()) return 'none';
  if (window.matchMedia(COARSE).matches || !window.matchMedia(WIDE).matches) return 'lite';
  return 'full';
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(REDUCED).matches;
}

/** Calls back when the tier changes (a resize across 1024 px, a settings change). */
export function onTierChange(callback: (tier: MotionTier) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const lists = [REDUCED, COARSE, WIDE].map((query) => window.matchMedia(query));
  let last = motionTier();
  const check = () => {
    const next = motionTier();
    if (next === last) return;
    last = next;
    callback(next);
  };
  for (const list of lists) list.addEventListener('change', check);
  return () => {
    for (const list of lists) list.removeEventListener('change', check);
  };
}
