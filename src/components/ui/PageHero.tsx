import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import { HeroMosaic, type Placard } from './HeroMosaic';

type HeroVariant = 'home' | 'gimun' | 'moot' | 'utility';

export interface HeroAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'track-gimun' | 'track-moot' | 'ghost';
}

export interface PageHeroProps {
  /** Small label above the headline, or a node for badge rows. */
  eyebrow?: React.ReactNode;
  /** The headline, as plain text. */
  title: string;
  /**
   * Words inside `title` to set in champagne. A colour shift, not a gradient
   * fill: gradient text on a large heading is one of the loudest generated-UI
   * tells and it also wrecks contrast.
   */
  accentWords?: string[];
  description?: string;
  actions?: HeroAction[];
  /** Raw JSX for the action row, when `actions` cannot express it. */
  actionsSlot?: React.ReactNode;
  /** Right-hand column. Omit for the centred treatment. */
  aside?: React.ReactNode;
  /** Short affirmative points under the description. */
  bullets?: string[];
  /** Decorative placard field behind the headline. Homepage only. */
  mosaic?: Placard[];
  breadcrumbs?: Crumb[];
  variant?: HeroVariant;
  size?: 'display' | 'h1';
  /** Centre the column. Used with `mosaic` for the homepage masthead. */
  align?: 'start' | 'center';
  className?: string;
}

const strip = (word: string) => word.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

/**
 * The one hero, for every public route.
 *
 * A server component with no animation wrapper around the headline: the text
 * is in the initial HTML at full opacity, which is what keeps it a valid LCP
 * candidate. Motion in this section is CSS only — the mosaic settles on a
 * scroll-driven timeline, and nothing waits for hydration.
 */
export function PageHero({
  eyebrow,
  title,
  accentWords,
  description,
  actions,
  actionsSlot,
  aside,
  bullets,
  mosaic,
  breadcrumbs,
  variant = 'utility',
  size = 'h1',
  align = 'start',
  className,
}: PageHeroProps) {
  const hasAside = Boolean(aside);
  const centered = align === 'center';
  const accentSet = new Set((accentWords ?? []).map(strip));

  const accentClass = variant === 'gimun' ? 'text-crimson-soft' : 'text-champagne';

  const heading = (
    <h1
      className={cn(
        'font-display text-text',
        // Medium weight, not extrabold. Hierarchy comes from scale and colour.
        'font-medium',
        size === 'display' ? 'text-display' : 'text-h1',
        centered && 'mx-auto max-w-4xl text-balance'
      )}
    >
      {accentSet.size === 0
        ? title
        : title.split(' ').map((word, i) => (
            <React.Fragment key={`${word}-${i}`}>
              {i > 0 ? ' ' : ''}
              <span className={accentSet.has(strip(word)) ? accentClass : undefined}>
                {word}
              </span>
            </React.Fragment>
          ))}
    </h1>
  );

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden border-b border-line px-4 sm:px-6 lg:px-8',
        mosaic ? 'pt-16 pb-20 md:pt-24 md:pb-28' : 'pt-12 pb-14 md:pt-20 md:pb-20',
        className
      )}
    >
      {mosaic && mosaic.length > 0 && <HeroMosaic placards={mosaic} />}

      <div className="relative z-10 mx-auto max-w-7xl">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-8" />
        )}

        <div
          className={cn(
            'grid grid-cols-1 items-center gap-12 lg:gap-16',
            hasAside && 'lg:grid-cols-12'
          )}
        >
          <div
            className={cn(
              'flex flex-col',
              centered ? 'items-center text-center' : 'items-start text-left',
              hasAside ? 'lg:col-span-7' : centered ? 'mx-auto max-w-3xl' : 'max-w-3xl'
            )}
          >
            {eyebrow && <div className="mb-7">{eyebrow}</div>}

            {heading}

            {description && (
              <p
                className={cn(
                  'mt-6 text-lead text-text-3',
                  centered ? 'mx-auto max-w-2xl text-balance' : 'max-w-2xl'
                )}
              >
                {description}
              </p>
            )}

            {bullets && bullets.length > 0 && (
              <ul
                className={cn(
                  'mt-8 space-y-2.5 text-body text-text-2',
                  centered && 'inline-flex flex-col items-start text-left'
                )}
              >
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="mt-1.5 h-3.5 w-3.5 shrink-0 text-champagne"
                    >
                      <path
                        d="M2 8.5l4 4 8-9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {actionsSlot && <div className="mt-10 w-full space-y-6">{actionsSlot}</div>}

            {!actionsSlot && actions && actions.length > 0 && (
              <div
                className={cn(
                  'mt-10 flex flex-wrap items-center gap-3',
                  centered && 'justify-center'
                )}
              >
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
          </div>

          {hasAside && <div className="w-full lg:col-span-5">{aside}</div>}
        </div>
      </div>
    </section>
  );
}

export default PageHero;
