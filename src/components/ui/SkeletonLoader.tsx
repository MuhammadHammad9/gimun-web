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
              'h-4 bg-gray-200/80 rounded-md animate-shimmer',
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
          'h-11 w-32 bg-gray-200/80 rounded-xl animate-shimmer',
          className
        )}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'h-6 w-20 bg-gray-200/80 rounded-full animate-shimmer',
          className
        )}
      />
    );
  }

  // Default 'card' variant
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4 animate-shimmer',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-gray-200/80 rounded-full" />
        <div className="h-4 w-12 bg-gray-100 rounded-md" />
      </div>
      <div className="h-6 w-3/4 bg-gray-200/80 rounded-md" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-100 rounded-md" />
        <div className="h-4 w-5/6 bg-gray-100 rounded-md" />
      </div>
    </div>
  );
}
