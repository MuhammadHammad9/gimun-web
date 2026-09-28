import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FeatureCardProps {
  /** Rounded-square glyph in the top-left corner. */
  icon?: React.ReactNode;
  /**
   * The bold lead-in. Reads as a label, and the description continues the same
   * sentence in muted text — img.ly's two-tone paragraph, which is most of why
   * their cards read as written rather than filled in.
   */
  label: string;
  description: string;
  href?: string;
  /** Media bleeding to the card's bottom edge. */
  media?: React.ReactNode;
  /** Small mono facts rendered under the copy. */
  facts?: { term: string; value: string }[];
  track?: 'gimun' | 'moot-cup';
  className?: string;
}

/**
 * The feature tile.
 *
 * Deliberately not the generic "icon, bold title, three lines of grey, Learn
 * more →" card. The distinguishing moves, all taken from img.ly: a two-tone
 * paragraph instead of a title/body split, a circular arrow chip in the corner
 * instead of a text link, and media that bleeds to the card edge rather than
 * sitting inset with its own margin.
 */
export function FeatureCard({
  icon,
  label,
  description,
  href,
  media,
  facts,
  track,
  className,
}: FeatureCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-4 p-6 sm:p-7">
        <div className="min-w-0 space-y-4">
          {icon && (
            <span
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-xl border',
                track === 'gimun'
                  ? 'border-crimson/30 bg-crimson/10 text-crimson-soft'
                  : 'border-line-2 bg-champagne/10 text-champagne'
              )}
            >
              {icon}
            </span>
          )}

          <p className="text-body text-text-3">
            <span className="font-semibold text-text">{label}</span>{' '}
            {description}
          </p>

          {facts && facts.length > 0 && (
            <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-4 font-mono text-xs">
              {facts.map((fact) => (
                <div key={fact.term}>
                  <dt className="text-text-4">{fact.term}</dt>
                  <dd className="mt-1 text-sm font-semibold text-champagne">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {href && (
          <span className="arrow-chip shrink-0">
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </span>
        )}
      </div>

      {media && <div className="surface-media mt-auto">{media}</div>}
    </>
  );

  const classes = cn(
    'group surface surface-interactive flex h-full flex-col overflow-hidden',
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn(classes, 'focus-visible:outline-none')}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}

export default FeatureCard;
