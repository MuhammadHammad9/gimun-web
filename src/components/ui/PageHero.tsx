import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { TextReveal } from '@/components/motion/TextReveal';
import { Parallax } from '@/components/motion/Parallax';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import { ArrowRight } from 'lucide-react';

type HeroVariant = 'home' | 'gimun' | 'moot' | 'utility';

export interface HeroAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'track-gimun' | 'track-moot' | 'ghost';
}

export interface PageHeroProps {
  /** Small mono label above the headline, or a node for badge rows. */
  eyebrow?: React.ReactNode;
  /** The headline, as plain text so it can be revealed word by word. */
  title: string;
  /** Words inside `title` to paint with the track accent. */
  accentWords?: string[];
  description?: string;
  actions?: HeroAction[];
  /**
   * Raw JSX for the action row, used instead of `actions` when a page needs
   * conditional buttons, icons or extra meta rows that the declarative
   * `actions` shape cannot express.
   */
  actionsSlot?: React.ReactNode;
  /** Right-hand column: spotlight cards, stats, media. */
  aside?: React.ReactNode;
  breadcrumbs?: Crumb[];
  variant?: HeroVariant;
  /** `display` for the homepage, `h1` everywhere else. */
  size?: 'display' | 'h1';
  className?: string;
}

const GLOW: Record<HeroVariant, string> = {
  home: 'bg-radial-glow-dual',
  gimun: 'bg-glow-crimson',
  moot: 'bg-glow-champagne',
  utility: 'bg-radial-glow',
};

const ACCENT: Record<HeroVariant, string> = {
  home: 'text-gradient-champagne',
  gimun: 'text-gradient-crimson',
  moot: 'text-gradient-champagne',
  utility: 'text-gradient-champagne',
};

/**
 * The one hero.
 *
 * Replaces thirteen hand-copied hero slabs that had drifted apart in gradient,
 * padding, type scale and badge treatment. Every public route's masthead comes
 * through here, which is what makes the page-to-page rhythm consistent.
 *
 * A server component: the headline text is in the initial HTML, so it is a
 * valid LCP candidate and is never gated behind hydration. `TextReveal` and
 * `Parallax` are the only client islands inside it.
 */
export function PageHero({
  eyebrow,
  title,
  accentWords,
  description,
  actions,
  actionsSlot,
  aside,
  breadcrumbs,
  variant = 'utility',
  size = 'h1',
  className,
}: PageHeroProps) {
  const hasAside = Boolean(aside);

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden border-b border-line',
        hasAside
          ? 'pt-12 pb-16 md:pt-20 md:pb-24'
          : 'pt-12 pb-14 md:pt-20 md:pb-20',
        'px-4 sm:px-6 lg:px-8',
        GLOW[variant],
        className
      )}
    >
      {/* Atmosphere. Decorative only, never intercepts pointer events. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-tech-grid opacity-60"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Parallax distance={90} className="absolute -top-24 left-1/4 -translate-x-1/2">
          <div
            className={cn(
              'h-[28rem] w-[28rem] rounded-full blur-3xl animate-float-slow',
              variant === 'moot' ? 'bg-champagne/15' : 'bg-crimson/20'
            )}
          />
        </Parallax>
        <Parallax distance={-70} className="absolute -top-10 right-1/4 translate-x-1/2">
          <div
            className={cn(
              'h-[26rem] w-[26rem] rounded-full blur-3xl animate-float-slower',
              variant === 'gimun' ? 'bg-crimson/15' : 'bg-champagne/15'
            )}
          />
        </Parallax>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-6" />
        )}

        <div
          className={cn(
            'grid grid-cols-1 items-center gap-12 lg:gap-10',
            hasAside && 'lg:grid-cols-12'
          )}
        >
          <div
            className={cn(
              'flex flex-col items-start text-left',
              hasAside ? 'lg:col-span-7 xl:col-span-7' : 'max-w-4xl'
            )}
          >
            {eyebrow && <div className="mb-6">{eyebrow}</div>}

            <TextReveal
              as="h1"
              text={title}
              accentWords={accentWords}
              accentClassName={ACCENT[variant]}
              immediate
              className={cn(
                'font-display font-extrabold text-text',
                size === 'display' ? 'text-display' : 'text-h1'
              )}
            />

            {description && (
              <p className="mt-6 max-w-2xl text-lead text-text-2">{description}</p>
            )}

            {actionsSlot && <div className="mt-9 w-full space-y-6">{actionsSlot}</div>}

            {!actionsSlot && actions && actions.length > 0 && (
              <div className="mt-9 flex w-full flex-wrap items-center gap-4 sm:w-auto">
                {actions.map((action, i) => (
                  <Button
                    key={action.href + action.label}
                    href={action.href}
                    size="lg"
                    variant={action.variant ?? (i === 0 ? 'primary' : 'secondary')}
                    magnetic={i === 0}
                    icon={i === 0 ? <ArrowRight className="h-4 w-4" /> : undefined}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {hasAside && (
            <div className="w-full lg:col-span-5 xl:col-span-5">{aside}</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PageHero;
