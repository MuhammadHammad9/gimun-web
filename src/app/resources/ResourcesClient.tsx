'use client';

import React, { useState } from 'react';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Download } from 'lucide-react';
import type { Document } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResourcesClientProps {
  initialDocuments: Document[];
}

export function ResourcesClient({ initialDocuments }: ResourcesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const trackOptions = [
    { label: 'All Tracks', value: 'all' },
    { label: 'GIMUN Track', value: 'gimun' },
    { label: 'Moot Cup Track', value: 'moot-cup' },
    { label: 'Shared & Campus', value: 'shared' },
  ];

  const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Handbooks', value: 'handbook' },
    { label: 'Background Guides', value: 'background-guide' },
    { label: 'Propositions', value: 'proposition' },
    { label: 'Rules of Procedure', value: 'rules' },
    { label: 'Campus Maps', value: 'map' },
  ];

  const filteredDocuments = initialDocuments.filter((doc) => {
    const matchesTrack = trackFilter === 'all' || doc.track === trackFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <TrackBadge track="shared" />
          <span className="text-xs font-mono text-[#5A5A6E] uppercase tracking-wider">
            Authoritative Repository
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          Resource Hub &amp; Document Archive
        </h1>
        <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
          The single authoritative home for all official conference literature: delegate handbooks, committee background guides, legal compromises, competition rules, and campus logistical dossiers.
        </p>
      </header>

      {/* Filter and Search Suite */}
      <div className="space-y-6 pb-4 border-b border-gray-100">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search documents by title or topic..."
            />
          </div>
          <div className="text-xs font-mono text-[#5A5A6E]">
            Displaying {filteredDocuments.length} of {initialDocuments.length} Documents
          </div>
        </div>

        {/* Track Filter */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-[#5A5A6E] block">
            Filter by Track:
          </span>
          <FilterBar
            options={trackOptions}
            activeValue={trackFilter}
            onChange={setTrackFilter}
          />
        </div>

        {/* Document Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono uppercase font-bold text-[#5A5A6E] mr-2">
            Document Type:
          </span>
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer',
                typeFilter === opt.value
                  ? 'bg-[#1E2A78] text-white shadow-2xs'
                  : 'bg-gray-100 text-[#5A5A6E] hover:bg-gray-200'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc, idx) => (
          <ScrollReveal key={doc.id} delay={idx * 0.05}>
            <div className="double-bezel h-full group hover:translate-y-[-2px] transition-transform duration-300">
              <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2">
                    <TrackBadge track={doc.track} size="sm" />
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {doc.type.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Document Title */}
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[#1A1A2E] leading-snug group-hover:text-[#FF6B35] transition-colors">
                    {doc.title}
                  </h3>

                  {/* File Metadata in Monospace */}
                  <div className="text-xs font-mono text-[#5A5A6E] flex items-center justify-between pt-1">
                    <span>
                      {doc.fileFormat} • {doc.fileSize}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Rev: {doc.versionDate}
                    </span>
                  </div>
                </div>

                {/* Direct Download Action */}
                <div className="pt-3 border-t border-gray-100">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-[#1E2A78] text-white hover:bg-[#1E2A78]/90 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File ({doc.fileFormat})</span>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              title="No Documents Found"
              description={`No official documents match "${searchQuery || 'your filter combination'}". Try clearing filters or using different search terms.`}
              actionLabel="Reset All Filters"
              onAction={() => {
                setSearchQuery('');
                setTrackFilter('all');
                setTypeFilter('all');
              }}
            />
          </div>
        )}
      </div>

      {/* Information Callout */}
      <section className="pt-8">
        <div className="p-8 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
              Need a Document Not Listed Here?
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A6E]">
              Contact the Secretariat or the Moot Convening Committee directly for specialized country packets or institutional invoicing requests.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" href="/contact">
              Contact Organizing Team
            </Button>
            <Button variant="primary" size="sm" href="/about/faq">
              Explore FAQ
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
