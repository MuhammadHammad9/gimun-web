'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface CountdownChipProps {
  /** ISO date, e.g. "2027-03-18". */
  startDate: string;
  /** ISO date, e.g. "2027-03-21". */
  endDate?: string;
  eventName?: string;
  className?: string;
}

type Status = 'upcoming' | 'live' | 'completed';

const SHELL =
  'inline-flex items-center gap-2 rounded-full border border-line bg-void/60 px-3.5 py-1.5 font-mono text-xs text-text-2 backdrop-blur-sm select-none';

/**
 * Live countdown to the conference, pinned to Pakistan time.
 *
 * The pre-hydration render is an empty placeholder of the same height rather
 * than a date restatement: the date already appears in the chip beside this
 * one, and repeating it made the masthead read as two identical pills. Holding
 * the space keeps the row from reflowing when the real value arrives.
 */
export function CountdownChip({
  startDate,
  endDate,
  eventName = 'GIMUN & GMC',
  className,
}: CountdownChipProps) {
  // Null until the first effect: the real value is computed before anything
  // but the placeholder renders, so "0d 0h" never flashes.
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    status: Status;
  } | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const start = new Date(`${startDate}T00:00:00+05:00`).getTime();
      const end = endDate
        ? new Date(`${endDate}T23:59:59+05:00`).getTime()
        : new Date(`${startDate}T23:59:59+05:00`).getTime();

      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        setTimeLeft({ days: 0, hours: 0, status: 'completed' });
        return;
      }

      if (now < start) {
        const diff = start - now;
        setTimeLeft({
          days: Math.floor(diff / 86_400_000),
          hours: Math.floor((diff % 86_400_000) / 3_600_000),
          status: 'upcoming',
        });
      } else if (now <= end) {
        setTimeLeft({ days: 0, hours: 0, status: 'live' });
      } else {
        setTimeLeft({ days: 0, hours: 0, status: 'completed' });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60_000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  // Reserve the row height before hydration so nothing shifts.
  if (!timeLeft) {
    return <div aria-hidden="true" className={cn(SHELL, 'invisible', className)}>&nbsp;</div>;
  }

  if (timeLeft.status === 'live') {
    return (
      <div className={cn(SHELL, 'border-line-2 text-champagne', className)}>
        <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-champagne opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-champagne" />
        </span>
        Happening now
      </div>
    );
  }

  if (timeLeft.status === 'completed') {
    return <div className={cn(SHELL, className)}>Until the next edition</div>;
  }

  return (
    <div className={cn(SHELL, className)}>
      <span className="font-semibold text-champagne">
        {timeLeft.days}d {timeLeft.hours}h
      </span>
      <span className="text-text-4">until {eventName}</span>
    </div>
  );
}

export default CountdownChip;
