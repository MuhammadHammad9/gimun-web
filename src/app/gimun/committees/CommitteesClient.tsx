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
          <span className="text-xs font-mono text-[#5A5A6E] uppercase tracking-wider">
            Substantive Organs
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          GIMUN Committee Roster &amp; Agendas
        </h1>
        <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
          Explore our simulation bodies ranging from multilateral security councils to fast-breaking national crisis cabinets. Select a committee to inspect its agenda topics, dais leadership, and country allocation matrix.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <FilterBar
          options={filterOptions}
          activeValue={selectedType}
          onChange={setSelectedType}
        />
        <div className="text-xs font-mono text-[#5A5A6E]">
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
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold bg-[#FFF0E8] text-[#A83A11] border border-[#FF6B35]/20">
                            {committee.type.replace('-', ' ')}
                          </span>
                          {isFeaturedSpan && (
                            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#1E2A78]/10 text-[#1E2A78]">
                              Featured Organ
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-[#5A5A6E]">
                          Capacity: {committee.capacity ? `${committee.capacity} Delegates` : 'Open'}
                        </span>
                      </div>

                      {/* Title & Short Description */}
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E] group-hover:text-[#FF6B35] transition-colors leading-snug">
                          <Link href={`/gimun/committees/${committee.slug}`}>
                            {committee.name}
                          </Link>
                        </h2>
                        <p className="text-sm text-[#5A5A6E] mt-2 leading-relaxed">
                          {committee.shortDescription}
                        </p>
                      </div>

                      {/* Agenda Topics Preview */}
                      <div
                        className={cn(
                          'p-5 rounded-xl bg-[#F8F8FC] border border-gray-100 space-y-2.5',
                          isFeaturedSpan && 'sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0'
                        )}
                      >
                        <div className={isFeaturedSpan ? 'sm:col-span-2' : ''}>
                          <span className="text-[11px] font-mono uppercase font-bold text-[#1E2A78] tracking-wider block">
                            Substantive Agenda Topics
                          </span>
                        </div>
                        {committee.topics.map((topic, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-[#1A1A2E]">
                            <span className="w-5 h-5 rounded-full bg-[#FFF0E8] text-[#A83A11] font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {i + 1}
                            </span>
                            <span className="leading-snug pt-0.5">{topic}</span>
                          </div>
                        ))}
                      </div>

                      {/* Chairs & Country Matrix Stats */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5A5A6E] pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Users2 className="w-4 h-4 text-[#1E2A78]" />
                          <span>Dais: {committee.chairs.map((c) => c.name).join(', ')}</span>
                        </div>
                        <div className="font-mono text-[#FF6B35] font-semibold bg-[#FFF0E8] px-2.5 py-1 rounded-md text-xs">
                          {committee.countryList.filter((c) => c.status === 'available').length} Available Allocations
                        </div>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                      <Link
                        href={`/gimun/committees/${committee.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E2A78] hover:text-[#FF6B35] transition-colors"
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
        <div className="p-8 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
              Have questions regarding country matrix policies?
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A6E]">
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
