'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpotlightCard } from '@/components/motion/SpotlightCard';

export interface SurfaceCardProps {
  children: React.ReactNode;
  /** Turns the whole card into a link with a corner arrow affordance. */
  href?: string;
  /** Left edge accent. Use only when the card is genuinely track-scoped. */
  track?: 'gimun' | 'moot-cup';
  /** `raised` for grids, `elevated` for standout cards, `flat` inside slabs. */
  tone?: 'raised' | 'elevated' | 'flat';
  /** Cursor-following glow. Off for dense lists where it would be noisy. */
  spotlight?: boolean;
  as?: 'div' | 'article' | 'li';
  className?: string;
}

const TONES = {
  raised: 'bg-raised/85 border-line hover:border-line-2',
  elevated: 'bg-overlay/85 border-line-2 hover:border-line-3',
  flat: 'bg-canvas/60 border-line hover:border-line-2',
} as const;

/**
 * The generic content card.
 *
 * Replaces roughly twenty-five copies of the same
 * `rounded-2xl border bg-.../85 hover:...` block that had drifted apart across
 * the schedule, announcements, team and resource lists.
 *
 * When `href` is set the entire card is the click target — a corner arrow marks
 * it — rather than a small "read more" link, which is both a larger touch
 * target and one tab stop instead of several.
 */
export function SurfaceCard({
  children,
  href,
  track,
  tone = 'raised',
  spotlight = true,
  as = 'div',
  className,
}: SurfaceCardProps) {
  const classes = cn(
    'group relative flex flex-col overflow-hidden rounded-card border shadow-card backdrop-blur-md',
    'transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-brand)]',
    'hover:-translate-y-1 hover:shadow-card-hover',
    TONES[tone],
    track === 'gimun' && 'border-l-2 border-l-crimson/70',
    track === 'moot-cup' && 'border-l-2 border-l-champagne/70',
    className
  );

  const inner = (
    <>
      {children}
      {href && (
        <ArrowUpRight
          aria-hidden="true"
          className="absolute right-5 top-5 h-4 w-4 text-text-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-champagne"
        />
      )}
    </>
  );

  if (href) {
    return (
      <SpotlightCard as={as} className={cn(classes, 'p-0')}>
        <Link href={href} className="flex h-full flex-col rounded-card p-6 focus-visible:outline-none">
          {inner}
        </Link>
      </SpotlightCard>
    );
  }

  if (!spotlight) {
    const Tag = as as React.ElementType;
    return <Tag className={cn(classes, 'p-6')}>{inner}</Tag>;
  }

  return (
    <SpotlightCard as={as} className={cn(classes, 'p-6')}>
      {inner}
    </SpotlightCard>
  );
}

export default SurfaceCard;
