import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './ScrollReveal';

export interface TimelinePhase {
  /** "Phase 01". Rendered in mono above the title. */
  step: string;
  title: string;
  /** The date or date range this phase resolves to. */
  date: string;
  description: string;
  status: 'active' | 'upcoming' | 'complete';
}

/**
 * The key-dates roadmap.
 *
 * Status is carried by three signals at once — a top accent bar, a pill label,
 * and border weight — never by colour alone, so the active phase is still
 * identifiable in greyscale and to a colourblind reader. That constraint comes
 * from the palette being closed to two hues, which rules out the usual
 * green/amber/red status convention.
 */
export function Timeline({
  phases,
  className,
}: {
  phases: TimelinePhase[];
  className?: string;
}) {
  return (
    <ol className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {phases.map((phase, i) => {
        const isActive = phase.status === 'active';
        return (
          <ScrollReveal
            as="li"
            key={phase.step}
            delay={i * 0.08}
            className="h-full"
          >
            <div
              className={cn(
                'relative h-full space-y-2 overflow-hidden rounded-card bg-raised/85 p-5 shadow-md backdrop-blur-md',
                'transition-[border-color,transform] duration-300 ease-[var(--ease-brand)] hover:-translate-y-1',
                isActive ? 'border-2 border-line-2' : 'border border-line'
              )}
            >
              <div
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 top-0 h-1',
                  isActive ? 'bg-crimson' : 'bg-champagne/40'
                )}
              />

              <div className="flex items-center justify-between font-mono text-meta text-text-3">
                <span>{phase.step}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] uppercase',
                    isActive
                      ? 'border border-line-2 bg-champagne/20 font-bold text-champagne'
                      : 'border border-line bg-white/10 font-medium text-text-2'
                  )}
                >
                  {phase.status === 'active'
                    ? 'Active'
                    : phase.status === 'complete'
                      ? 'Complete'
                      : 'Upcoming'}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-text">{phase.title}</h3>
              <p className="font-mono text-xs font-semibold text-champagne">{phase.date}</p>
              <p className="text-xs leading-relaxed text-text-2">{phase.description}</p>
            </div>
          </ScrollReveal>
        );
      })}
    </ol>
  );
}

export default Timeline;
