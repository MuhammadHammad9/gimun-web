'use client';

import React, { useState } from 'react';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pin, Calendar } from 'lucide-react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
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
        <section className="space-y-4" aria-label="Pinned notices">
          <p className="flex items-center gap-2 text-meta font-mono uppercase text-text-2">
            <Pin aria-hidden="true" className="h-3.5 w-3.5 text-champagne" />
            Pinned
          </p>

          <div className="grid grid-cols-1 gap-6">
            {pinnedItems.map((item) => (
              <ScrollReveal key={item.id}>
                <article
                  id={item.id}
                  data-live-key={`announcement-${item.id}`}
                  className="scroll-mt-28 space-y-4 rounded-2xl border border-line-2 bg-raised p-8 transition-shadow target:ring-2 target:ring-focus sm:p-10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-full border border-line-2 px-3 py-1 font-mono text-xs uppercase text-champagne">
                        {item.badgeLabel || 'Pinned'}
                      </span>
                      <TrackBadge track={item.track as Track} size="sm" />
                    </div>
                    <p className="flex items-center gap-1.5 font-mono text-xs text-text-3">
                      <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
                      {formatPublishedDate(item.timestamp)}
                    </p>
                  </div>

                  <h2 className="font-display text-2xl font-medium text-text sm:text-3xl">{item.title}</h2>
                  <p className="max-w-3xl text-base leading-relaxed text-text-2">{item.body}</p>

                  {item.actionUrl && (
                    <Link href={item.actionUrl} className="text-link w-fit text-sm">
                      Read more
                    </Link>
                  )}
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Regular Dispatches Feed */}
      <section className="space-y-4">
        <p className="pb-2 font-mono text-xs text-text-3">
          {regularItems.length} {regularItems.length === 1 ? 'notice' : 'notices'}, newest first
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regularItems.map((item, idx) => (
            <ScrollReveal key={item.id} delay={idx * 0.05}>
              <div
                id={item.id}
                data-live-key={`announcement-${item.id}`}
                className="rounded-2xl border border-line bg-raised hover:border-line-3 hover:bg-raised transition-all duration-300 h-full scroll-mt-28 target:ring-2 target:ring-focus"
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

    </div>
  );
}
