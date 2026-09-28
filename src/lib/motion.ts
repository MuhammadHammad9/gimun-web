/**
 * Motion timing tokens.
 *
 * The site's motion is CSS-driven — scroll-driven animations, transitions and
 * keyframes declared in `globals.css`. These constants exist so any JavaScript
 * that needs to match that timing (a scroll-into-view call, a delayed focus)
 * uses the same numbers rather than inventing its own.
 *
 * The house curve mirrors `--ease-brand`; `easeOutExpo` mirrors
 * `--ease-out-expo`.
 */

export const easeBrand = 'cubic-bezier(0.32, 0.72, 0, 1)';
export const easeOutExpo = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Seconds, matching the durations used in globals.css. */
export const durations = {
  instant: 0.15,
  fast: 0.22,
  medium: 0.35,
  slow: 0.7,
} as const;
