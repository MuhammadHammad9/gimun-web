'use client';

import React, { useState } from 'react';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Radio, Pin, Calendar } from 'lucide-react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { Button } from '@/components/ui/Button';
import type { Announcement, Track } from '@/lib/types';
import { formatPublishedDate } from '@/lib/site-config';
import { CtaBanner } from '@/components/ui/CtaBanner';

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
    const matchesTrack = selectedTrack === 'all' || item.track === selectedTrack || item.track === 'all' || item.track === 'shared';
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  const pinnedItems = filtered.filter((i) => i.pinnedFlag);
  const regularItems = filtered.filter((i) => !i.pinnedFlag);

  return (
    <div className="space-y-12">
      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-line">
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
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-champagne font-bold">
            <Pin className="w-3.5 h-3.5" />
            <span>Priority Directives &amp; Urgent Notices</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {pinnedItems.map((item) => (
              <ScrollReveal key={item.id}>
                <div
                  id={item.id}
                  className="rounded-2xl border border-champagne/35 bg-overlay/95 shadow-xl scroll-mt-28 target:ring-2 target:ring-focus transition-all"
                >
                  <div className="p-8 space-y-4 border-l-4 border-l-champagne bg-linear-to-r from-crest/40 to-transparent">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-crest shadow-md">
                          <Pin className="w-3 h-3" />
                          {item.badgeLabel || 'Pinned Directive'}
                        </span>
                        <TrackBadge track={item.track as Track} size="sm" />
                      </div>
                      <div className="text-xs font-mono text-text-3 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {formatPublishedDate(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-display font-medium text-text">
                      {item.title}
                    </h2>
                    <p className="text-sm text-text-2 leading-relaxed">
                      {item.body}
                    </p>

                    {item.actionUrl && (
                      <div className="pt-2">
                        <Link
                          href={item.actionUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-champagne hover:text-text underline underline-offset-4 transition-colors"
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
        <div className="flex items-center justify-between text-xs font-mono text-text-3 pb-2">
          <span>Chronological Dispatches ({regularItems.length})</span>
          <span>Updated dynamically</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regularItems.map((item, idx) => (
            <ScrollReveal key={item.id} delay={idx * 0.05}>
              <div
                id={item.id}
                className="rounded-2xl border border-line bg-overlay/85 hover:border-line-3 hover:bg-overlay/95 shadow-xl transition-all duration-300 h-full scroll-mt-28 target:ring-2 target:ring-focus"
              >
                <div className="p-7 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <TrackBadge track={item.track as Track} size="sm" />
                        {item.badgeLabel && (
                          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-elevated text-champagne border border-line">
                            {item.badgeLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-text-3">
                        {formatPublishedDate(item.timestamp)}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-display font-medium text-text">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-2 leading-relaxed">
                      {item.body}
                    </p>

                    {item.actionUrl && (
                      <div className="pt-1">
                        <Link
                          href={item.actionUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-champagne hover:text-text underline underline-offset-4 transition-colors"
                        >
                          Associated Resource Link &rarr;
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between text-xs font-mono text-text-3">
                    <span className="capitalize">{item.track} Bulletin</span>
                    <span className="text-champagne font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
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
        <CtaBanner variant="slab">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-champagne">
              <Radio className="w-4 h-4 text-champagne animate-pulse" />
              <span>Delegation updates</span>
            </div>
            <h3 className="font-display font-medium text-xl text-text">
              Registered delegates and team heads
            </h3>
            <p className="text-xs sm:text-sm text-text-2 leading-relaxed">
              Room changes and committee directives are posted here and on the schedule as soon as they are made. Check both each morning of the conference.
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
      </CtaBanner>
      </section>
    </div>
  );
}
