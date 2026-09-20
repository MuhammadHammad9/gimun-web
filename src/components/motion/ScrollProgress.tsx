'use client';

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Hairline reading-progress bar pinned under the site chrome.
 *
 * This is as much an orientation aid as a flourish: the rules and FAQ pages
 * run to several screens and previously gave no indication of how much was
 * left. Hidden from assistive tech — it duplicates information the scrollbar
 * already conveys — and hidden in print.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-crimson via-champagne to-champagne-lo print:hidden"
      style={{ scaleX }}
    />
  );
}

export default ScrollProgress;
