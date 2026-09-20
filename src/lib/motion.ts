import type { Variants, Transition } from 'framer-motion';

/**
 * Motion tokens for GIMUN & GMC 2027.
 *
 * Everything animated on the site pulls its physics from here so the whole
 * product shares one feel. Two rules hold across every consumer:
 *
 *  1. Animate `transform`, `opacity` and `filter` only. Anything that triggers
 *     layout (width, height, top, margin) is banned outside of explicit
 *     height-collapse accordions, which reserve their own space.
 *  2. Every entrance must be a no-op under `prefers-reduced-motion`. The
 *     components in `src/components/motion` enforce this; if you write a bare
 *     `motion.div`, you are responsible for it yourself.
 */

/* ---------------------------------------------------------------- springs -- */

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 30,
};

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
};

/** Used by parallax and scroll-linked values to take the jitter off raw scroll. */
export const springScroll: Transition = {
  type: 'spring',
  stiffness: 90,
  damping: 26,
  restDelta: 0.001,
};

export const springConfig = {
  default: { stiffness: 100, damping: 20 },
  snappy: { stiffness: 350, damping: 30 },
  soft: { stiffness: 120, damping: 20 },
  gentle: { stiffness: 80, damping: 20 },
  bouncy: { stiffness: 180, damping: 20 },
  scroll: { stiffness: 90, damping: 26 },
};

/* ----------------------------------------------------------------- easing -- */

/** The house curve. Mirrors `--ease-brand` in globals.css. */
export const easeBrand = [0.32, 0.72, 0, 1] as const;
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const durations = {
  instant: 0.15,
  fast: 0.25,
  medium: 0.4,
  slow: 0.6,
  cinematic: 0.9,
};

/* --------------------------------------------------------------- variants -- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 120, damping: 20 },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: easeBrand } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

/**
 * Word/line mask reveal. The parent clips with `.reveal-line`; the child slides
 * up from below the clip. Used by `<TextReveal>` for every page headline.
 */
export const maskUp: Variants = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.85, ease: easeOutExpo },
  },
};

/** Page-level transition used by src/app/template.tsx. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeBrand } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

/* -------------------------------------------------------------- staggering -- */

type StaggerContainerFn = ((stagger?: number) => Variants) &
  Pick<Variants, 'hidden' | 'visible'>;

/**
 * Callable either as a variant object (`variants={staggerContainer}`) or as a
 * factory (`variants={staggerContainer(0.12)}`). Both forms exist in the
 * codebase already, so both are supported.
 */
export const staggerContainer: StaggerContainerFn = Object.assign(
  (stagger = 0.06): Variants => ({
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: 0.04 },
    },
  }),
  {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06, delayChildren: 0.04 },
    },
  }
);

/* ------------------------------------------------------------- viewport --- */

/**
 * Shared `whileInView` viewport config. `once: true` matters for performance:
 * without it every reveal keeps an IntersectionObserver callback live for the
 * lifetime of the page.
 */
export const viewportOnce = { once: true, amount: 0.15 } as const;
export const viewportEager = { once: true, margin: '0px 0px -12% 0px' } as const;
