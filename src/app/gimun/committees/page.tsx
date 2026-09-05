'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { Button } from '@/components/ui/Button';
import { ContentCard } from '@/components/ui/ContentCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Globe2,
  Users2,
  FileText,
  ArrowRight,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { getCommittees } from '@/lib/content';

export default function CommitteesPage() {
  const allCommittees = getCommittees();
  const [selectedType, setSelectedType] = useState<string>('all');

  const filterOptions = [
    { label: 'All Committees', value: 'all' },
    { label: 'Specialized Agencies', value: 'specialized-agency' },
    { label: 'General Assembly', value: 'general-assembly' },
    { label: 'Crisis Organs', value: 'crisis' },
  ];

  const filteredCommittees =
    selectedType === 'all'
      ? allCommittees
      : allCommittees.filter((c) => c.type === selectedType);

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
          GIMUN 2027 Committee Roster
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
          Showing {filteredCommittees.length} of {allCommittees.length} Committees
        </div>
      </div>

      {/* Committees Grid (Asymmetric & Double-Bezel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCommittees.map((committee, idx) => (
          <ScrollReveal key={committee.id} delay={idx * 0.08}>
            <div className="double-bezel h-full group hover:translate-y-[-2px] transition-transform duration-300">
              <div className="double-bezel-inner p-8 flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold bg-[#FFF0E8] text-[#FF6B35] border border-[#FF6B35]/20">
                      {committee.type.replace('-', ' ')}
                    </span>
                    <span className="text-xs font-mono text-[#5A5A6E]">
                      Capacity: {committee.capacity ? `${committee.capacity} Delegates` : 'Open'}
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] group-hover:text-[#FF6B35] transition-colors">
                      <Link href={`/gimun/committees/${committee.slug}`}>
                        {committee.name}
                      </Link>
                    </h2>
                    <p className="text-sm text-[#5A5A6E] mt-2 leading-relaxed">
                      {committee.shortDescription}
                    </p>
                  </div>

                  {/* Agenda Topics Preview */}
                  <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-100 space-y-2">
                    <span className="text-[11px] font-mono uppercase font-bold text-[#1E2A78] tracking-wider block">
                      Agenda Topics
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#1A1A2E]">
                      {committee.topics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#FF6B35] font-mono font-bold">{i + 1}.</span>
                          <span className="leading-snug">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Chairs & Country Matrix Stats */}
                  <div className="flex items-center justify-between text-xs text-[#5A5A6E] pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Users2 className="w-4 h-4 text-[#1E2A78]" />
                      <span>Dais: {committee.chairs.map((c) => c.name).join(', ')}</span>
                    </div>
                    <div className="font-mono text-[#FF6B35] font-medium">
                      {committee.countryList.filter((c) => c.status === 'available').length} Available Slots
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={`/gimun/committees/${committee.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E2A78] hover:text-[#FF6B35] transition-colors"
                  >
                    <span>View Matrix &amp; Background Guide</span>
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
        ))}
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
