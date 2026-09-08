'use client';

import React, { useState } from 'react';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Radio, Pin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { Announcement, Track } from '@/lib/types';
import { formatPublishedDate } from '@/lib/site-config';

interface AnnouncementsClientProps {
  initialAnnouncements: Announcement[];
}

export function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterOptions = [
    { label: 'All Dispatches', value: 'all' },
    { label: 'GIMUN Track', value: 'gimun' },
    { label: 'GMC Track', value: 'moot-cup' },
    { label: 'General & Campus', value: 'general' },
  ];

  const filtered = initialAnnouncements.filter((item) => {
    const matchesTrack = selectedTrack === 'all' || item.track === selectedTrack;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  const pinnedItems = filtered.filter((i) => i.pinnedFlag);
  const regularItems = filtered.filter((i) => !i.pinnedFlag);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-red-50 border border-red-200 text-red-700">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>Live Dispatch Feed</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          Official Announcements &amp; Dispatches
        </h1>
        <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
          Real-time notices, schedule adjustments, dais releases, and logistical bulletins issued directly by the GIMUN Secretariat and GMC Court Administration.
        </p>
      </header>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <FilterBar
          options={filterOptions}
          activeValue={selectedTrack}
          onChange={setSelectedTrack}
        />
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search dispatches..."
          />
        </div>
      </div>

      {/* Pinned Urgent Announcements */}
      {pinnedItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C84815] font-bold">
            <Pin className="w-3.5 h-3.5" />
            <span>Priority Directives &amp; Urgent Notices</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {pinnedItems.map((item) => (
              <ScrollReveal key={item.id}>
                <div
                  id={item.id}
                  className="double-bezel scroll-mt-28 target:ring-2 target:ring-[#FF6B35] target:ring-offset-4 transition-all"
                >
                  <div className="double-bezel-inner p-8 space-y-4 border-l-4 border-l-[#FF6B35] bg-gradient-to-r from-orange-50/20 to-transparent">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#C84815] text-white shadow-xs">
                          <Pin className="w-3 h-3" />
                          {item.badgeLabel || 'Pinned Directive'}
                        </span>
                        <TrackBadge track={item.track as Track} size="sm" />
                      </div>
                      <div className="text-xs font-mono text-[#5A5A6E] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {formatPublishedDate(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#1A1A2E]">
                      {item.title}
                    </h2>
                    <p className="text-sm text-[#5A5A6E] leading-relaxed">
                      {item.body}
                    </p>

                    {item.actionUrl && (
                      <div className="pt-2">
                        <Link
                          href={item.actionUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#C84815] hover:text-[#A83A11] underline underline-offset-4 transition-colors"
                        >
                          Associated Resource or Directive Link &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Regular Dispatches Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#5A5A6E] pb-2">
          <span>Chronological Dispatches ({regularItems.length})</span>
          <span>Updated dynamically</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regularItems.map((item, idx) => (
            <ScrollReveal key={item.id} delay={idx * 0.05}>
              <div
                id={item.id}
                className="double-bezel h-full scroll-mt-28 target:ring-2 target:ring-[#1E2A78] target:ring-offset-4 transition-all"
              >
                <div className="double-bezel-inner p-7 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <TrackBadge track={item.track as Track} size="sm" />
                        {item.badgeLabel && (
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.badgeLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-[#5A5A6E]">
                        {formatPublishedDate(item.timestamp)}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-heading font-bold text-[#1A1A2E]">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                      {item.body}
                    </p>

                    {item.actionUrl && (
                      <div className="pt-1">
                        <Link
                          href={item.actionUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1E2A78] hover:text-[#FF6B35] underline underline-offset-4 transition-colors"
                        >
                          Associated Resource Link &rarr;
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-[#5A5A6E]">
                    <span className="capitalize">{item.track} Bulletin</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <EmptyState
            title="No Announcements Found"
            description={`No official dispatches match your search for "${searchQuery}". Please check your query or switch track categories.`}
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedTrack('all');
            }}
          />
        )}
      </section>

      {/* Broadcast Channels Card */}
      <section className="pt-8">
        <div className="p-8 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#1E2A78]">
              <Radio className="w-4 h-4 text-[#FF6B35] animate-pulse" />
              <span>Delegation Broadcast Protocol</span>
            </div>
            <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
              Registered Delegates &amp; Team Heads
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
              All committee-specific directives and emergency room adjustments are mirrored to official Head Delegate WhatsApp groups during the conference days.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" href="/schedule">
              Conference Schedule
            </Button>
            <Button variant="primary" href="/contact">
              Contact Secretariat
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
