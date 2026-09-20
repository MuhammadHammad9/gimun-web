import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'button' | 'badge';
  lines?: number;
  className?: string;
}

export function SkeletonLoader({
  variant = 'card',
  lines = 3,
  className,
}: SkeletonLoaderProps) {
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2.5 w-full', className)}>
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'h-4 bg-champagne/15 rounded-md animate-pulse',
              idx === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div
        className={cn(
          'h-11 w-32 bg-champagne/20 rounded-xl animate-pulse',
          className
        )}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'h-6 w-20 bg-champagne/20 rounded-full animate-pulse',
          className
        )}
      />
    );
  }

  // Default 'card' variant
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-overlay/90 border border-champagne/20 shadow-xl space-y-4 animate-pulse',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-champagne/20 rounded-full" />
        <div className="h-4 w-12 bg-champagne/10 rounded-md" />
      </div>
      <div className="h-6 w-3/4 bg-champagne/20 rounded-md" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-champagne/15 rounded-md" />
        <div className="h-4 w-5/6 bg-champagne/15 rounded-md" />
      </div>
    </div>
  );
}
