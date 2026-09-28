import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';

type HeroVariant = 'home' | 'gimun' | 'moot' | 'utility';

export interface HeroAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'track-gimun' | 'track-moot' | 'ghost';
}

export interface PageHeroProps {
  /** Legacy small label above the headline. Prefer `meta`. */
  eyebrow?: React.ReactNode;
  /** Facts set in mono above the headline (dates, venue, counts). */
  meta?: React.ReactNode[];
  /** The headline, as plain text. */
  title: string;
  /** Words inside `title` set in the page's accent colour (weight, never a gradient). */
  accentWords?: string[];
  /** Words set in the GIMUN crimson instead (the home headline names both rooms). */
  gimunWords?: string[];
  description?: string;
  actions?: HeroAction[];
  /** Raw JSX for the action row, when `actions` cannot express it. */
  actionsSlot?: React.ReactNode;
  /** Right-hand column: facts, a card. */
  aside?: React.ReactNode;
  /** Right-hand decorative art (used when there is no aside). */
  art?: React.ReactNode;
  /** Short affirmative points under the description. */
  bullets?: string[];
  /** Accepted for compatibility; the placard mosaic is retired. */
  mosaic?: unknown;
  breadcrumbs?: Crumb[];
  variant?: HeroVariant;
  size?: 'display' | 'h1';
  align?: 'start' | 'center';
  /** Extra content under the actions (a note, a countdown). */
  footnote?: React.ReactNode;
  className?: string;
}

const strip = (word: string) => word.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

/**
 * The one hero, for every public route.
 *
 * A server component: the headline is in the initial HTML at full opacity,
 * which keeps it a valid LCP candidate. Its entrance is a CSS rise of a few
 * pixels (transform only) that never waits for JavaScript; under the page
 * curtain the entrance waits and plays as the new page is revealed.
 */
export function PageHero({
  eyebrow,
  meta,
  title,
  accentWords,
  gimunWords,
  description,
  actions,
  actionsSlot,
  aside,
  art,
  bullets,
  breadcrumbs,
  variant = 'utility',
  size = 'h1',
  align = 'start',
  footnote,
  className,
}: PageHeroProps) {
  const home = variant === 'home';
  const centered = align === 'center' && !home;
  const side = aside ?? art;
  const accentSet = new Set((accentWords ?? []).map(strip));
  const gimunSet = new Set((gimunWords ?? []).map(strip));
  const accentClass = variant === 'gimun' ? 'text-accent-gimun' : 'text-champagne';
  const wordClass = (word: string) =>
    gimunSet.has(strip(word)) ? 'text-accent-gimun' : accentSet.has(strip(word)) ? accentClass : undefined;

  const heading = (
    <h1
      data-entrance=""
      className={cn(
        home ? 'home-hero__title' : 'page-hero__title',
        size === 'display' || home ? 'text-display' : 'text-h1',
        centered && 'mx-auto',
      )}
    >
      {accentSet.size === 0 && gimunSet.size === 0
        ? title
        : title.split(' ').map((word, i) => (
            <React.Fragment key={`${word}-${i}`}>
              {i > 0 ? ' ' : ''}
              <span className={wordClass(word)}>{word}</span>
            </React.Fragment>
          ))}
    </h1>
  );

  const metaItems = [...(meta ?? [])];
  const hasMeta = metaItems.length > 0 || Boolean(eyebrow);

  const body = (
    <div className={cn('flex flex-col', centered ? 'items-center text-center' : 'items-start')}>
      {hasMeta && (
        <div className={cn('page-hero__meta', centered && 'justify-center')} data-entrance="">
          {eyebrow && <span>{eyebrow}</span>}
          {metaItems.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </div>
      )}

      {heading}

      {description && (
        <p className={cn('page-hero__lead', centered && 'mx-auto')} data-entrance="2">
          {description}
        </p>
      )}

      {bullets && bullets.length > 0 && (
        <ul className="page-hero__bullets" data-entrance="3">
          {bullets.map((bullet) => (
            <li key={bullet}>
              <svg aria-hidden="true" viewBox="0 0 16 16">
                <path d="M2 8.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {actionsSlot && (
        <div className="mt-10 w-full" data-entrance="3">
          {actionsSlot}
        </div>
      )}

      {!actionsSlot && actions && actions.length > 0 && (
        <div className={cn('page-hero__actions', centered && 'justify-center')} data-entrance="3">
          {actions.map((action, i) => (
            <Button
              key={action.href + action.label}
              href={action.href}
              size="lg"
              variant={action.variant ?? (i === 0 ? 'primary' : 'secondary')}
              withArrow={i === 0}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {footnote && (
        <div className={home ? 'home-hero__note' : 'mt-5 text-small text-text-3'} data-entrance="4">
          {footnote}
        </div>
      )}
    </div>
  );

  if (home) {
    return (
      <section className={cn('home-hero wrap', className)}>
        <div className="home-hero__grid">
          {body}
          {side && (
            <div className="home-hero__art" data-entrance="4">
              {side}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={cn('page-hero', className)}>
      <div className="wrap">
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="mb-10" />}
        <div className="page-hero__grid" data-aside={side ? '' : undefined}>
          {body}
          {side && (
            <div className="w-full" data-entrance="4">
              {side}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PageHero;
