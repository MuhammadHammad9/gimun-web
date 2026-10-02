/**
 * anime.js, through one module so the site uses a single set of names and
 * the brand curves. Loaded at the point of use (a counter coming into view,
 * the confirmation stamp, the first hover on a magnetic button).
 */
import { animate, createAnimatable, createScope, createTimeline, cubicBezier, scrambleText, spring, stagger, svg, utils } from 'animejs';
import { EASE, type EaseName } from './tokens';

export { animate, createAnimatable, createScope, createTimeline, scrambleText, spring, stagger, svg, utils };

/** A brand curve as an anime.js easing function. */
export function ease(name: EaseName) {
  return cubicBezier(...EASE[name]);
}
