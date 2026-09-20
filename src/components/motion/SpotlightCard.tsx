'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: 'div' | 'article' | 'li' | 'section';
}

/**
 * Card that carries a soft champagne glow tracking the cursor.
 *
 * The glow is painted by the `.spotlight::before` rule in globals.css and
 * positioned through two CSS custom properties. Pointer moves write those
 * properties directly on the node — no React state, so moving the mouse across
 * a grid of these costs zero re-renders.
 *
 * Under `prefers-reduced-motion` the CSS opacity transition is already
 * neutralised by the global reduce block, so the glow simply appears.
 */
export function SpotlightCard({
  children,
  className,
  as = 'div',
  ...rest
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as React.ElementType;

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    node.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <Tag
      ref={ref}
      onPointerMove={handleMove}
      className={cn('spotlight', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default SpotlightCard;
