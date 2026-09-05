'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface FilterOption<T extends string> {
  label: string;
  value: T;
  count?: number;
  track?: 'gimun' | 'moot-cup' | 'shared';
}

export interface FilterBarProps<T extends string> {
  options: FilterOption<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterBar<T extends string>({
  options,
  activeValue,
  onChange,
  className,
}: FilterBarProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex p-1.5 rounded-2xl bg-gray-100/90 border border-gray-200/80 max-w-full overflow-x-auto no-scrollbar shadow-inner',
        className
      )}
      role="tablist"
      aria-label="Filter choices"
    >
      {options.map((option) => {
        const isActive = activeValue === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]',
              isActive ? 'text-[#1A1A2E] font-semibold' : 'text-[#5A5A6E] hover:text-[#1A1A2E]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterPill"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-200/60"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {option.label}
              {typeof option.count === 'number' && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                    isActive ? 'bg-[#1E2A78]/10 text-[#1E2A78]' : 'bg-gray-200/80 text-[#5A5A6E]'
                  )}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
