'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type RevealVariant = 'slide' | 'mask' | 'scale' | 'blur';

export interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  threshold?: number;
  /**
   * How the element arrives.
   *
   *  - `slide`  translate + fade. The original behaviour and the default, so
   *             the 55 existing call sites are unchanged.
   *  - `mask`   wipes up from behind a clipping edge. For headline blocks and
   *             hero-adjacent content.
   *  - `scale`  settles down from slightly larger. For cards and media.
   *  - `blur`   focus-pull. For quiet, atmospheric sections.
   */
  variant?: RevealVariant;
  /** Renders a `<li>` instead of a `<div>` when the parent is a list. */
  as?: 'div' | 'li' | 'section' | 'article';
}

const OFFSETS = {
  up: { y: 24, x: 0 },
  down: { y: -24, x: 0 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
} as const;

/**
 * The site's standard scroll entrance.
 *
 * Returns a plain element under `prefers-reduced-motion` — no motion wrapper,
 * no observer — so reduced-motion visitors get the finished layout with zero
 * animation cost.
 *
 * All four variants animate transform/opacity/filter only and none of them
 * change the element's footprint, so none contribute to CLS.
 */
export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  threshold = 0.15,
  variant = 'slide',
  as = 'div',
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = as as React.ElementType;

  if (shouldReduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as as 'div'];
  const offsets = OFFSETS[direction];

  if (variant === 'mask') {
    return (
      <Tag className={cn('reveal-line block', className)}>
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          whileInView={{ y: '0%', opacity: 1 }}
          viewport={{ once: true, amount: threshold }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay }}
          className="will-change-transform"
        >
          {children}
        </motion.div>
      </Tag>
    );
  }

  const initial =
    variant === 'scale'
      ? { opacity: 0, scale: 1.04, y: 12 }
      : variant === 'blur'
        ? { opacity: 0, filter: 'blur(10px)', y: 12 }
        : { opacity: 0, ...offsets };

  const animate =
    variant === 'scale'
      ? { opacity: 1, scale: 1, y: 0 }
      : variant === 'blur'
        ? { opacity: 1, filter: 'blur(0px)', y: 0 }
        : { opacity: 1, x: 0, y: 0 };

  const transition =
    variant === 'blur'
      ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay }
      : { type: 'spring' as const, stiffness: 100, damping: 20, delay };

  return (
    <MotionTag
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: threshold }}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}

export default ScrollReveal;
