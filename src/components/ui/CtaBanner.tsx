import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { ScrollReveal } from './ScrollReveal';
import type { HeroAction } from './PageHero';

export interface CtaBannerProps {
  eyebrow?: string;
  /** Omitted when `children` supplies the whole body. */
  title?: string;
  description?: string;
  /**
   * The first action is rendered as `primary`. Keep this list to three; a
   * closing CTA offering four equal choices is not a call to action.
   */
  actions?: HeroAction[];
  /**
   * Raw body for the `slab` variant, used when a banner carries icons or
   * bespoke layout that the declarative props cannot express. Supplying this
   * replaces the title/description/actions rendering entirely; only the
   * shared slab chrome is applied.
   */
  children?: React.ReactNode;
  /** `slab` is the inline band used mid-page; `feature` is the page closer. */
  variant?: 'slab' | 'feature';
  /** Small print under the buttons — the no-payment policy usually lives here. */
  footnote?: React.ReactNode;
  className?: string;
}

/**
 * The closing call-to-action.
 *
 * Replaces the same gradient slab copy-pasted onto eight pages, each with
 * slightly different padding and button ordering. Centralising it also
 * enforces the one-primary-per-viewport rule at the point where it was most
 * often broken.
 */
export function CtaBanner({
  eyebrow,
  title,
  description,
  actions,
  variant = 'feature',
  footnote,
  className,
  children,
}: CtaBannerProps) {
  const isFeature = variant === 'feature';

  if (children) {
    return (
      <ScrollReveal variant="scale" className={className}>
        <div className="rounded-section border border-line-2 bg-gradient-to-r from-overlay via-crest to-overlay p-6 shadow-xl sm:p-8">
          {children}
        </div>
      </ScrollReveal>
    );
  }

  const body = (
    <div
      className={cn(
        isFeature
          ? 'space-y-6 p-8 text-center sm:p-12'
          : 'flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8'
      )}
    >
      <div className={cn(isFeature ? 'space-y-4' : 'space-y-2')}>
        {eyebrow && (
          <span className="block font-mono text-meta font-bold uppercase tracking-[0.14em] text-champagne">
            {eyebrow}
          </span>
        )}
        {title && (
          <h2
            className={cn(
              'font-display font-extrabold text-text',
              isFeature ? 'mx-auto max-w-2xl text-h2' : 'text-h3'
            )}
          >
            {title}
          </h2>
        )}
        {description && (
          <p
            className={cn(
              'text-text-2 leading-relaxed',
              isFeature ? 'mx-auto max-w-xl' : 'max-w-xl text-sm'
            )}
          >
            {description}
          </p>
        )}
      </div>

      <div
        className={cn(
          'flex flex-wrap items-center gap-4',
          isFeature ? 'justify-center pt-2' : 'shrink-0'
        )}
      >
        {actions?.map((action, i) => (
          <Button
            key={action.href + action.label}
            href={action.href}
            size={isFeature ? 'lg' : 'md'}
            variant={action.variant ?? (i === 0 ? 'primary' : 'secondary')}
            magnetic={isFeature && i === 0}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {footnote && isFeature && (
        <p className="mx-auto max-w-lg pt-2 font-mono text-meta uppercase tracking-[0.14em] text-text-3">
          {footnote}
        </p>
      )}
    </div>
  );

  return (
    <ScrollReveal variant="scale" className={className}>
      <div className="double-bezel">
        <div className="double-bezel-inner">{body}</div>
      </div>
    </ScrollReveal>
  );
}

export default CtaBanner;
