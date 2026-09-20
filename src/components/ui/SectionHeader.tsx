import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './ScrollReveal';

export interface SectionAction {
  label: string;
  href: string;
  /** Tints the link to the track accent. */
  track?: 'gimun' | 'moot-cup';
}

export interface SectionHeaderProps {
  /** Mono label above the heading. Title Case, two to four words. */
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  /** Right-aligned links. Two maximum — more than that is a nav, not a header. */
  actions?: SectionAction[];
  align?: 'start' | 'center';
  /** Heading level. Pick by document structure, not by size. */
  as?: 'h2' | 'h3';
  className?: string;
}

/**
 * The eyebrow + heading + action-link trio that opens every section.
 *
 * This pattern was hand-written roughly thirty times with small divergences in
 * tracking, weight and colour. Centralising it is what gives the site a single
 * vertical rhythm.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  align = 'start',
  as = 'h2',
  className,
}: SectionHeaderProps) {
  const Heading = as as React.ElementType;
  const centered = align === 'center';

  return (
    <ScrollReveal
      className={cn(
        'flex flex-col gap-4',
        centered
          ? 'items-center text-center'
          : 'sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className={cn('space-y-2', centered && 'max-w-2xl')}>
        {eyebrow && (
          <span className="block font-mono text-meta font-bold uppercase tracking-[0.14em] text-champagne">
            {eyebrow}
          </span>
        )}
        <Heading className="text-h2 font-display font-bold text-text">{title}</Heading>
        {description && (
          <p className={cn('text-text-2 leading-relaxed', centered ? 'mx-auto' : 'max-w-2xl')}>
            {description}
          </p>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="flex shrink-0 items-center gap-3">
          {actions.map((action, i) => (
            <React.Fragment key={action.href + action.label}>
              {i > 0 && <span aria-hidden="true" className="text-text-4">|</span>}
              <Link
                href={action.href}
                className={cn(
                  'group inline-flex items-center gap-1.5 rounded font-mono text-xs font-semibold transition-colors hover:text-text',
                  action.track === 'gimun' ? 'text-crimson-soft' : 'text-champagne'
                )}
              >
                {action.label}
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </React.Fragment>
          ))}
        </div>
      )}
    </ScrollReveal>
  );
}

export default SectionHeader;
