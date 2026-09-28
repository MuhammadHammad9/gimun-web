/**
 * Motion tokens shared by CSS, the Web Animations API, GSAP and anime.js.
 *
 * globals.css declares the same curves as `--ease-*` custom properties and
 * the durations as `--dur-*`; tests/unit/motion-tokens.test.ts keeps the two
 * in step, so a curve changed in one place cannot drift from the other.
 */
export const EASE = {
  /** Default for interface state: quick start, long settle. */
  brand: [0.32, 0.72, 0, 1],
  /** Confident arrivals: entrances, reveals, layout moves. */
  expo: [0.16, 1, 0.3, 1],
  /** Text rising out of a mask. Softer than expo at the end. */
  lift: [0.22, 1, 0.36, 1],
  /** The page curtain: symmetric, heavy in the middle. */
  curtain: [0.76, 0, 0.24, 1],
  /** Small overshoot for pointer feedback only, never for state. */
  spring: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type EaseName = keyof typeof EASE;

/** CSS custom property that carries each curve in globals.css. */
export const EASE_CSS_VAR: Record<EaseName, string> = {
  brand: '--ease-brand',
  expo: '--ease-out-expo',
  lift: '--ease-lift',
  curtain: '--ease-curtain',
  spring: '--ease-spring',
};

/** Milliseconds. Mirrored as --dur-* in globals.css. */
export const DURATION = {
  micro: 160,
  ui: 320,
  surface: 520,
  entrance: 900,
} as const;

/** Milliseconds between siblings. */
export const STAGGER = {
  lines: 80,
  grid: 35,
  curtain: 60,
} as const;

/** The page-change curtain ("stagger wipe"). */
export const CURTAIN = {
  /** One panel closing, bottom to top. */
  cover: 480,
  /** One panel opening, top edge upward. */
  reveal: 520,
  stagger: STAGGER.curtain,
  /** The label starts at this share of the cover. */
  labelAt: 0.55,
  labelIn: 260,
  labelOut: 180,
  /** Minimum time fully covered, so the label can be read. */
  minHold: 140,
  /** Reveal anyway if the next page has not arrived by then. */
  failsafe: 6000,
  /** Fast reveal when Back or Forward interrupts a transition. */
  abortReveal: 250,
} as const;

export function cssEase(name: EaseName): string {
  return `cubic-bezier(${EASE[name].join(', ')})`;
}

/** GSAP CustomEase path data for a cubic-bezier curve. */
export function customEasePath(name: EaseName): string {
  const [x1, y1, x2, y2] = EASE[name];
  return `M0,0 C${x1},${y1} ${x2},${y2} 1,1`;
}
