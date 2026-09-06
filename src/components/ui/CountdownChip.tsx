'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { cn, formatDateRange } from '@/lib/utils';
import { Calendar } from 'lucide-react';

const emptySubscribe = () => () => {};

export interface CountdownChipProps {
  startDate: string; // ISO date string e.g. "2027-03-18"
  endDate?: string;  // ISO date string e.g. "2027-03-21"
  eventName?: string;
  className?: string;
}

export function CountdownChip({
  startDate,
  endDate,
  eventName = 'GIMUN & Moot Cup',
  className,
}: CountdownChipProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    status: 'upcoming' | 'live' | 'completed';
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    status: 'upcoming',
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const end = endDate ? new Date(endDate).getTime() : start + 3 * 24 * 60 * 60 * 1000;

      if (now < start) {
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes, status: 'upcoming' });
      } else if (now >= start && now <= end) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, status: 'live' });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, status: 'completed' });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (!mounted) {
    // Initial SSR fallback matching shape without hydration conflict
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-white/90 border border-white/15 backdrop-blur-sm select-none',
          className
        )}
      >
        <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
        <span>Dates: {formatDateRange(startDate, endDate)}</span>
      </div>
    );
  }

  if (timeLeft.status === 'live') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm select-none animate-pulse',
          className
        )}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>🔴 Happening Now</span>
      </div>
    );
  }

  if (timeLeft.status === 'completed') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-white/80 border border-white/15 select-none',
          className
        )}
      >
        <span>See you next edition!</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white/10 text-white border border-white/15 backdrop-blur-sm select-none shadow-sm',
        className
      )}
    >
      <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
      <span>
        <strong className="text-[#FF6B35] font-bold">{timeLeft.days}d {timeLeft.hours}h</strong> until {eventName}
      </span>
    </div>
  );
}
