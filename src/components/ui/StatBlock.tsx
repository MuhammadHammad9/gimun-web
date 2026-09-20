import React from 'react';
import { cn } from '@/lib/utils';
import { CountUp } from '@/components/motion/CountUp';
import { ScrollReveal } from './ScrollReveal';

export interface Stat {
  value: number;
  /** Rendered after the number: "+", "%", "x". */
  suffix?: string;
  label: string;
  /** Small mono line under the label. */
  detail?: string;
  /** Tints the suffix. Crimson for GIMUN figures, champagne for GMC. */
  accent?: 'crimson' | 'champagne';
}

/**
 * The social-proof band.
 *
 * Numbers count up the first time the band scrolls into view. The server
 * renders the final figures, so they are correct for crawlers and for anyone
 * with JS disabled; only the animation is client-side.
 */
export function StatBlock({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <ScrollReveal variant="scale" className={className}>
      <div className="relative overflow-hidden rounded-section border border-line-2 bg-raised/90 bg-tech-grid p-8 shadow-2xl backdrop-blur-xl sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-crimson/20 blur-3xl"
        />

        <dl className="relative z-10 grid grid-cols-2 gap-8 text-center sm:text-left lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <dd className="font-display text-3xl font-extrabold tracking-tight text-text sm:text-5xl">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  suffixClassName={cn(
                    stat.accent === 'champagne' ? 'text-champagne' : 'text-crimson'
                  )}
                />
              </dd>
              <dt className="text-xs font-medium text-champagne sm:text-sm">
                {stat.label}
              </dt>
              {stat.detail && (
                <p className="font-mono text-meta text-text-3">{stat.detail}</p>
              )}
            </div>
          ))}
        </dl>
      </div>
    </ScrollReveal>
  );
}

export default StatBlock;
