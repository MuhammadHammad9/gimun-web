import type { Variants } from 'framer-motion';

// Spring physics and motion configurations
// Per framer-motion-animator & review-animations standards

export const springConfig = {
  default: { stiffness: 100, damping: 20 },
  snappy: { stiffness: 300, damping: 30 },
  gentle: { stiffness: 80, damping: 20 },
  bouncy: { stiffness: 180, damping: 20 },
};

// Entrance animation variants typed as Variants
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
    },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

// Stagger container for lists and grids
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Standard durations (150ms-700ms budget per review-animations)
export const durations = {
  instant: 0.15,
  fast: 0.25,
  medium: 0.4,
  slow: 0.6,
};
