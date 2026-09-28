'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface FilterOption<T extends string> {
  label: string;
  value: T;
  count?: number;
  track?: 'gimun' | 'moot-cup' | 'shared';
  /** DOM id for the control, when a page needs to target one pill. */
  id?: string;
}

export interface FilterBarProps<T extends string> {
  options: FilterOption<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  className?: string;
  /** Announced name for the button group. Always set it when a page has two. */
  label?: string;
}

/**
 * Segmented filter control with a highlight that slides between options.
 *
 * The highlight is one pseudo-element positioned through two CSS custom
 * properties rather than a shared-layout animation, which means switching
 * filters costs a style write instead of a motion runtime — and the runtime is
 * no longer in the bundle at all. Scoping the properties to this element also
 * fixes the old bug where two FilterBars on one page shared a single pill and
 * it flew between them.
 */
export function FilterBar<T extends string>({
  options,
  activeValue,
  onChange,
  className,
  label = 'Filter choices',
}: FilterBarProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const positionPill = useCallback((value: string) => {
    const list = listRef.current;
    const btn = buttonRefs.current[value];
    if (!list || !btn) return;
    list.style.setProperty('--seg-x', `${btn.offsetLeft}px`);
    list.style.setProperty('--seg-w', `${btn.offsetWidth}px`);
  }, []);

  useEffect(() => {
    positionPill(activeValue);
  }, [activeValue, positionPill]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(() => positionPill(activeValue));
    ro.observe(list);
    return () => ro.disconnect();
  }, [activeValue, positionPill]);

  return (
    <div
      ref={listRef}
      // Toggle buttons, not tabs: filters narrow one list rather than
      // switching between tab panels.
      role="group"
      aria-label={label}
      className={cn('segmented max-w-full overflow-x-auto no-scrollbar', className)}
    >
      {options.map((option) => {
        const isActive = activeValue === option.value;
        const control = (
          <button
            id={option.id}
            ref={(el) => {
              buttonRefs.current[option.value] = el;
            }}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium',
              'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne',
              isActive ? 'text-canvas' : 'text-text-3 hover:text-text'
            )}
          >
            {option.label}
            {typeof option.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-mono text-[10px]',
                  isActive ? 'bg-canvas/15 font-semibold text-canvas' : 'bg-white/10 text-text-3'
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );

        return <React.Fragment key={option.value}>{control}</React.Fragment>;
      })}
    </div>
  );
}

export default FilterBar;
