import React from 'react';
import { cn } from '@/lib/utils';
import type { Track } from '@/lib/types';

export interface TrackBadgeProps {
  track: Track | 'all';
  size?: 'sm' | 'md';
  className?: string;
}

export function TrackBadge({ track, size = 'sm', className }: TrackBadgeProps) {
  const configs = {
    gimun: {
      label: 'GIMUN',
      styles: 'bg-[#FFF0E8] text-[#A83A11] border border-[#FF6B35]/30',
      dot: 'bg-[#FF6B35]',
    },
    'moot-cup': {
      label: 'GMC',
      styles: 'bg-[#E6F9F7] text-[#007A70] border border-[#00B4A6]/30',
      dot: 'bg-[#00B4A6]',
    },
    shared: {
      label: 'SHARED',
      styles: 'bg-[#F2F2F7] text-[#5A5A6E] border border-gray-300',
      dot: 'bg-[#5A5A6E]',
    },
    all: {
      label: 'ALL TRACKS',
      styles: 'bg-[#1E2A78]/10 text-[#1E2A78] border border-[#1E2A78]/20',
      dot: 'bg-[#1E2A78]',
    },
  }[track];

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
