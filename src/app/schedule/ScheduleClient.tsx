'use client';

import React, { useState } from 'react';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { FilterBar } from '@/components/ui/FilterBar';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion } from 'framer-motion';
import { Clock, MapPin, Printer } from 'lucide-react';
import type { ScheduleItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ScheduleClientProps {
  initialSchedule: ScheduleItem[];
}

export function ScheduleClient({ initialSchedule }: ScheduleClientProps) {
  // Distinct days
  const days = Array.from(new Set(initialSchedule.map((s) => s.day))).sort();
  const [selectedDay, setSelectedDay] = useState<number>(days[0] || 1);
  const [trackFilter, setTrackFilter] = useState<string>('all');

  const filterOptions = [
    { label: 'All Sessions', value: 'all' },
    { label: 'GIMUN Track', value: 'gimun' },
    { label: 'Moot Cup Track', value: 'moot-cup' },
    { label: 'Shared / Plenary', value: 'shared' },
  ];

  const currentDaySessions = initialSchedule.filter((s) => s.day === selectedDay);

  const filteredSessions =
    trackFilter === 'all'
      ? currentDaySessions
      : currentDaySessions.filter((s) => s.track === trackFilter);

  // Day label helper
  const currentDayLabel =
    currentDaySessions[0]?.dayLabel || `Day ${selectedDay}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <TrackBadge track="shared" />
          <span className="text-xs font-mono text-[#5A5A6E] uppercase tracking-wider">
            Conference Agenda
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          Unified Itinerary &amp; Schedule
        </h1>
        <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
          Full 3-day chronological schedule across GIMUN committee debates, Moot Court advocacy rounds, and official institutional galas at the GIKI campus.
        </p>
      </header>

      {/* Controls: Day Tabs with Framer Motion layoutId & Track Filter */}
      <div className="space-y-6">
        {/* Day Tabs Pill Bar */}
        <div className="p-1.5 rounded-2xl bg-gray-100/90 backdrop-blur-sm border border-gray-200/80 inline-flex items-center gap-1.5 flex-wrap">
          {days.map((dayNum) => {
            const daySample = initialSchedule.find((s) => s.day === dayNum);
            const isSelected = selectedDay === dayNum;
            const subtitle = daySample?.dayLabel.split('—')[1]?.trim() || '';

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={cn(
                  'relative px-5 py-2.5 rounded-xl font-heading font-bold text-sm sm:text-base transition-colors duration-200 cursor-pointer select-none',
                  isSelected ? 'text-white' : 'text-[#5A5A6E] hover:text-[#1A1A2E]'
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeScheduleDay"
                    className="absolute inset-0 bg-[#1E2A78] rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span>Day {dayNum}</span>
                  {subtitle && (
                    <span
                      className={cn(
                        'hidden sm:inline text-xs font-mono font-normal transition-colors',
                        isSelected ? 'text-white/80' : 'text-gray-400'
                      )}
                    >
                      ({subtitle})
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Bar & Active Day Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <FilterBar
            options={filterOptions}
            activeValue={trackFilter}
            onChange={setTrackFilter}
          />
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#5A5A6E]">
              {filteredSessions.length} sessions listed
            </span>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-200 hover:bg-gray-50 text-[#1A1A2E] cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Timeline */}
      <div className="space-y-4">
        {filteredSessions.map((session, idx) => (
          <ScrollReveal key={session.id} delay={idx * 0.05}>
            <div
              className={cn(
                'double-bezel transition-all duration-200',
                session.track === 'gimun' && 'hover:border-[#FF6B35]/40',
                session.track === 'moot-cup' && 'hover:border-[#00B4A6]/40'
              )}
            >
              <div
                className={cn(
                  'double-bezel-inner p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6',
                  session.updatedFlag && 'bg-amber-50/20'
                )}
              >
                {/* Left: Time & Track Info */}
                <div className="flex items-start sm:items-center gap-4 shrink-0 md:w-64">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold text-[#1E2A78]">
                      <Clock className="w-4 h-4 text-[#FF6B35]" />
                      <span>{session.startTime} — {session.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <TrackBadge track={session.track} size="sm" />
                      {session.id === 'sched-01' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Live Session
                        </span>
                      )}
                      {session.updatedFlag && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Updated
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center: Title & Notes */}
                <div className="space-y-1 grow">
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-[#1A1A2E]">
                    {session.title}
                  </h3>
                  {session.notes && (
                    <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                      {session.notes}
                    </p>
                  )}
                </div>

                {/* Right: Location & Venue */}
                <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-1 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 text-xs font-mono text-[#5A5A6E]">
                  <div className="flex items-center gap-1.5 text-[#1E2A78] font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>{session.location}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">GIKI Campus</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {filteredSessions.length === 0 && (
          <EmptyState
            title="No Sessions Scheduled"
            description={`There are no sessions scheduled under the selected filter for ${currentDayLabel}.`}
            actionLabel="Show All Sessions"
            onAction={() => setTrackFilter('all')}
          />
        )}
      </div>

      {/* Fast Operational Notice */}
      <section className="pt-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-base text-[#1A1A2E]">
              Schedule Updates &amp; Room Allocations
            </h4>
            <p className="text-xs sm:text-sm text-[#5A5A6E]">
              Any schedule adjustments during conference days will automatically display an &ldquo;Updated&rdquo; badge and publish on our Announcements broadcast.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" href="/announcements">
              Announcements
            </Button>
            <Button variant="primary" size="sm" href="/about/venue">
              Campus Venue Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
