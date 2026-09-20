import React from 'react';
import { cn } from '@/lib/utils';
import type { Track } from '@/lib/types';

export interface TrackBadgeProps {
  track: Track | 'all' | 'general';
  size?: 'sm' | 'md';
  className?: string;
}

export function TrackBadge({ track, size = 'sm', className }: TrackBadgeProps) {
  const configs = {
    gimun: {
      label: 'GIMUN',
      styles: 'bg-brand text-champagne-hi border border-crest font-bold shadow-xs',
      dot: 'bg-champagne',
    },
    'moot-cup': {
      label: 'GMC',
      styles: 'bg-champagne text-brand border border-brand-soft/40 font-bold shadow-xs',
      dot: 'bg-brand',
    },
    shared: {
      label: 'SHARED',
      styles: 'bg-champagne-hi text-ink-warm border border-champagne-hi font-medium',
      dot: 'bg-brand-hi',
    },
    all: {
      label: 'ALL TRACKS',
      styles: 'bg-champagne text-brand border border-champagne font-semibold',
      dot: 'bg-brand',
    },
  }[track === 'general' ? 'shared' : track];

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[11px] tracking-wider',
    md: 'px-3 py-1 text-xs tracking-wider',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono uppercase font-semibold rounded-full select-none',
        sizeStyles,
        configs.styles,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', configs.dot)} />
      {configs.label}
    </span>
  );
}
