'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { FilterBar } from '@/components/ui/FilterBar';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { getSchedule } from '@/lib/content';
import { cn } from '@/lib/utils';

export default function SchedulePage() {
  const allSchedule = getSchedule();

  // Distinct days
  const days = Array.from(new Set(allSchedule.map((s) => s.day))).sort();
  const [selectedDay, setSelectedDay] = useState<number>(days[0] || 1);
  const [trackFilter, setTrackFilter] = useState<string>('all');

  const filterOptions = [
    { label: 'All Sessions', value: 'all' },
    { label: 'GIMUN Track', value: 'gimun' },
    { label: 'Moot Cup Track', value: 'moot-cup' },
    { label: 'Shared / Plenary', value: 'shared' },
  ];

  const currentDaySessions = allSchedule.filter((s) => s.day === selectedDay);

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

      {/* Controls: Day Tabs & Track Filter */}
      <div className="space-y-6">
        {/* Day Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
          {days.map((dayNum) => {
            const daySample = allSchedule.find((s) => s.day === dayNum);
            const isSelected = selectedDay === dayNum;
            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={cn(
                  'px-5 py-3 rounded-t-xl font-heading font-bold text-sm sm:text-base whitespace-nowrap transition-all border-b-2',
                  isSelected
                    ? 'border-[#1E2A78] text-[#1E2A78] bg-white shadow-2xs'
                    : 'border-transparent text-[#5A5A6E] hover:text-[#1A1A2E] hover:bg-gray-50'
                )}
              >
                <span>Day {dayNum}</span>
                <span className="hidden sm:inline text-xs font-mono font-normal text-[#5A5A6E] ml-2">
                  ({daySample?.dayLabel.split('—')[1]?.trim() || ''})
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border border-gray-200 hover:bg-gray-50 text-[#1A1A2E]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
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
                    <div className="flex items-center gap-2">
                      <TrackBadge track={session.track} size="sm" />
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
          <div className="p-12 text-center text-xs font-mono text-gray-500 bg-[#F8F8FC] rounded-2xl border border-dashed border-gray-200">
            No events scheduled for the selected track filter on {currentDayLabel}.
          </div>
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
