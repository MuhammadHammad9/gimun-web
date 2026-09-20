'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export interface MagneticButtonProps {
  children: React.ReactNode;
  /** How far the element is allowed to drift toward the cursor, in pixels. */
  strength?: number;
  className?: string;
}

/**
 * Wraps a control so it leans toward the cursor on hover.
 *
 * Only applies on fine pointers — on touch there is no hover state to respond
 * to, and the transform would fight the tap target. Disabled entirely under
 * `prefers-reduced-motion`.
 *
 * The wrapper is `inline-block` and never changes size, so the drift cannot
 * shift surrounding layout.
 */
export function MagneticButton({
  children,
  strength = 12,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    // Normalise to the element's own half-extent so big and small buttons
    // drift by the same visual amount.
    x.set((dx / (rect.width / 2)) * strength);
    y.set((dy / (rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </motion.span>
  );
}

export default MagneticButton;
