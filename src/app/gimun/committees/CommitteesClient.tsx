'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { Button } from '@/components/ui/Button';
import { FilterBar } from '@/components/ui/FilterBar';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Users2, ArrowRight } from 'lucide-react';
import type { Committee } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CommitteesClientProps {
  initialCommittees: Committee[];
}

export function CommitteesClient({ initialCommittees }: CommitteesClientProps) {
  const [selectedType, setSelectedType] = useState<string>('all');

  const filterOptions = [
    { label: 'All Committees', value: 'all' },
    { label: 'Specialized Agencies', value: 'specialized-agency' },
    { label: 'General Assembly', value: 'general-assembly' },
    { label: 'Crisis Organs', value: 'crisis' },
  ];

  const filteredCommittees =
    selectedType === 'all'
      ? initialCommittees
      : initialCommittees.filter((c) => c.type === selectedType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <TrackBadge track="gimun" />
          <span className="text-xs font-mono text-champagne/70 uppercase tracking-wider">
            Committees &amp; Councils
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-cream tracking-tight">
          GIMUN Committee Roster &amp; Agendas
        </h1>
        <p className="text-sm sm:text-base text-champagne/80 leading-relaxed">
          Explore our simulation bodies ranging from multilateral security councils to fast-breaking national crisis cabinets. Select a committee to inspect its agenda topics, committee chairs, and available country allocations.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-champagne/30">
        <FilterBar
          options={filterOptions}
          activeValue={selectedType}
          onChange={setSelectedType}
        />
        <div className="text-xs font-mono text-champagne/70">
          Showing {filteredCommittees.length} of {initialCommittees.length} Committees
        </div>
      </div>

      {/* Committees Grid (Asymmetric Bento Grid 2fr:1fr / 1fr:2fr per PRD §16.1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {filteredCommittees.map((committee, idx) => {
          // Alternating bento span pattern: 0 -> 2-span, 1 -> 1-span, 2 -> 1-span, 3 -> 2-span
          const isFeaturedSpan = idx % 4 === 0 || idx % 4 === 3;

          return (
            <div
              key={committee.id}
              className={cn(
                'h-full',
                isFeaturedSpan ? 'lg:col-span-2' : 'lg:col-span-1'
              )}
            >
              <ScrollReveal delay={idx * 0.08}>
                <div className="double-bezel h-full group hover:translate-y-[-2px] transition-transform duration-300">
                  <div className="double-bezel-inner p-7 sm:p-8 flex flex-col justify-between h-full space-y-6">
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold bg-champagne/20 text-cream border border-champagne/30">
                            {committee.type.replace('-', ' ')}
                          </span>
                          {isFeaturedSpan && (
                            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-brand border border-champagne/30 text-champagne">
                              Featured Committee
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-champagne/70">
                          Capacity: {committee.capacity ? `${committee.capacity} Delegates` : 'Open'}
                        </span>
                      </div>

                      {/* Title & Short Description */}
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-cream group-hover:text-champagne transition-colors leading-snug">
                          <Link href={`/gimun/committees/${committee.slug}`}>
                            {committee.name}
                          </Link>
                        </h2>
                        <p className="text-sm text-champagne/80 mt-2 leading-relaxed">
                          {committee.shortDescription}
                        </p>
                      </div>

                      {/* Agenda Topics Preview */}
                      <div
                        className={cn(
                          'p-5 rounded-xl bg-overlay/80 border border-champagne/20 space-y-2.5',
                          isFeaturedSpan && 'sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0'
                        )}
                      >
                        <div className={isFeaturedSpan ? 'sm:col-span-2' : ''}>
                          <span className="text-[11px] font-mono uppercase font-bold text-champagne tracking-wider block">
                            Agenda Topics
                          </span>
                        </div>
                        {committee.topics.map((topic, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-cream">
                            <span className="w-5 h-5 rounded-full bg-brand text-champagne border border-champagne/30 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {i + 1}
                            </span>
                            <span className="leading-snug pt-0.5">{topic}</span>
                          </div>
                        ))}
                      </div>

                      {/* Chairs & Country Matrix Stats */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-champagne/80 pt-2 border-t border-champagne/20">
                        <div className="flex items-center gap-1.5">
                          <Users2 className="w-4 h-4 text-champagne" />
                          <span>Chairs: {committee.chairs.map((c) => c.name).join(', ')}</span>
                        </div>
                        <div className="font-mono text-champagne font-semibold bg-crest/70 border border-champagne/20 px-2.5 py-1 rounded-md text-xs">
                          {committee.countryList.filter((c) => c.status === 'available').length} Available Country Slots
                        </div>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="pt-4 border-t border-champagne/20 flex items-center justify-between gap-4 flex-wrap">
                      <Link
                        href={`/gimun/committees/${committee.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-champagne hover:text-cream transition-colors"
                      >
                        <span>View Country Matrix &amp; Background Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Button
                        variant="track-gimun"
                        size="sm"
                        href={`/register?track=gimun&committee=${committee.slug}`}
                      >
                        Select Committee
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <section className="pt-8">
        <div className="p-8 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-cream">
              Have questions regarding country matrix policies?
            </h3>
            <p className="text-xs sm:text-sm text-champagne/80">
              Consult our Rules of Procedure or explore the Resource Hub for background guides.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" href="/gimun/rules">
              View RoP
            </Button>
            <Button variant="primary" size="sm" href="/resources">
              Resource Hub
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
