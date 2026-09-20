'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { springScroll } from '@/lib/motion';

export interface ParallaxProps {
  children: React.ReactNode;
  /**
   * Total travel in pixels across the element's full scroll pass.
   * Positive moves with the scroll (lags behind), negative moves against it.
   * Keep this under ~120 on content; larger values are for decorative layers.
   */
  distance?: number;
  axis?: 'y' | 'x';
  /** Also scale slightly across the pass. 1 = no scaling. */
  scaleTo?: number;
  className?: string;
}

/**
 * Scroll-linked parallax layer.
 *
 * Transform-only, so it never triggers layout and never contributes to CLS.
 * Renders a plain `div` under `prefers-reduced-motion`.
 */
export function Parallax({
  children,
  distance = 80,
  axis = 'y',
  scaleTo,
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const smooth = useSpring(scrollYProgress, springScroll);
  const offset = useTransform(smooth, [0, 1], [distance * -0.5, distance * 0.5]);
  const scale = useTransform(smooth, [0, 0.5, 1], [1, scaleTo ?? 1, 1]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        [axis]: offset,
        ...(scaleTo ? { scale } : {}),
      }}
    >
      {children}
    </motion.div>
  );
}

export default Parallax;
