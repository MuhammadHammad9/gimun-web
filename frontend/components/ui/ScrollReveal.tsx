import React from 'react';
import { cn } from '@frontend/lib/utils';

export type RevealVariant = 'slide' | 'mask' | 'scale' | 'blur';

export interface ScrollRevealProps {
  children: React.ReactNode;
  /** Seconds to hold before this element starts. */
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  /** Retained for call-site compatibility; the CSS range is fixed. */
  threshold?: number;
  /**
   * How the element arrives.
   *
   *  - `slide`  translate + fade. The default, matching the original behaviour.
   *  - `mask`   wipes up from behind a clipping edge.
   *  - `scale`  settles down from slightly larger.
   *  - `blur`   focus-pull.
   */
  variant?: RevealVariant;
  as?: 'div' | 'li' | 'section' | 'article';
}

const DIRECTION_CLASS = {
  up: 'reveal-up',
  down: 'reveal-down',
  left: 'reveal-left',
  right: 'reveal-right',
} as const;

/**
 * The site's standard scroll entrance.
 *
 * A **server component**: the whole effect is CSS scroll-driven animation, so
 * there is no observer, no motion runtime and no client bundle. This component
 * has ~55 call sites, and while it was built on framer-motion it pulled that
 * library into nearly every route's JavaScript — which measured as the single
 * largest remaining block of script evaluation ahead of LCP.
 *
 * Browsers without `animation-timeline` render the finished state immediately,
 * which is also what `prefers-reduced-motion` gets via the global reduce rule.
 * Both are correct: the content is never hidden behind an animation that might
 * not run.
 */
export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  variant = 'slide',
  as = 'div',
}: ScrollRevealProps) {
  const Tag = as as React.ElementType;

  return (
    <Tag
      className={cn(
        'reveal',
        variant === 'slide' ? DIRECTION_CLASS[direction] : `reveal-${variant}`,
        className
      )}
      style={delay ? ({ animationDelay: `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

export default ScrollReveal;
