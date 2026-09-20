'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface FilterOption<T extends string> {
  label: string;
  value: T;
  count?: number;
  track?: 'gimun' | 'moot-cup' | 'shared';
  /**
   * DOM id for the control. The FAQ deep-links to its category pills
   * (`/about/faq#fees`), so those ids have to survive on the real element.
   */
  id?: string;
  /** Extra wrapper id, for anchors that must not collide with the button id. */
  anchorId?: string;
}

export interface FilterBarProps<T extends string> {
  options: FilterOption<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  className?: string;
  /** Announced name for the tablist. Always set it when a page has two. */
  label?: string;
}

export function FilterBar<T extends string>({
  options,
  activeValue,
  onChange,
  className,
  label = 'Filter choices',
}: FilterBarProps<T>) {
  // Scope the shared-layout id to this instance. With a hard-coded id, two
  // FilterBars on one page share one pill and it flies between them whenever
  // either selection changes.
  const pillId = useId();

  return (
    <div
      className={cn(
        'inline-flex p-1.5 rounded-2xl bg-overlay/90 border border-champagne/25 max-w-full overflow-x-auto no-scrollbar shadow-inner backdrop-blur-md',
        className
      )}
      role="tablist"
      aria-label={label}
    >
      {options.map((option) => {
        const isActive = activeValue === option.value;
        const control = (
          <button
            id={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne',
              isActive ? 'text-overlay font-bold' : 'text-champagne/70 hover:text-cream'
            )}
          >
            {isActive && (
              <motion.div
                layoutId={`filter-pill-${pillId}`}
                className="absolute inset-0 bg-gradient-to-r from-champagne-hi via-champagne to-champagne-lo rounded-xl shadow-md border border-white/50"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {option.label}
              {typeof option.count === 'number' && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                    isActive ? 'bg-overlay/20 text-overlay font-bold' : 'bg-white/10 text-champagne/80'
                  )}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );

        // An anchor id needs its own element: the button already carries the
        // category id, and `/about/faq#fees` links at the same control.
        return option.anchorId ? (
          <span key={option.value} id={option.anchorId} className="contents">
            {control}
          </span>
        ) : (
          <React.Fragment key={option.value}>{control}</React.Fragment>
        );
      })}
    </div>
  );
}
