"use client";

import { useSiteConfig } from '@/components/SiteConfigProvider';

import React, { useState } from "react";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar } from "@/components/ui/FilterBar";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download } from "lucide-react";
import type { Document } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getEventYear } from "@/lib/site-config";
import { HelpCallout } from '@/components/ui/HelpCallout';

interface ResourcesClientProps {
  initialDocuments: Document[];
}

export function ResourcesClient({ initialDocuments }: ResourcesClientProps) {
  const eventYear = getEventYear(useSiteConfig());
  const find = (track: Document["track"], type: Document["type"]) =>
    initialDocuments.find((document) => document.track === track && document.type === type);
  const starters = [
    {
      title: "GIMUN delegates",
      body: "Read the rules of procedure first, then the background guide for your committee.",
      documents: [find("gimun", "rules")],
    },
    {
      title: "GMC teams",
      body: `The ${eventYear} case problem, then the competition rules, which also cover memorial formatting and citation.`,
      documents: [find("moot-cup", "proposition"), find("moot-cup", "rules")],
    },
    {
      title: "Travelling to Topi",
      body: "The campus and venue map, and the participant handbook for everyone attending.",
      documents: [find("shared", "map"), find("shared", "handbook")],
    },
  ].map((starter) => ({
    ...starter,
    documents: starter.documents.filter((document): document is Document => Boolean(document)),
  }));
  const [searchQuery, setSearchQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const trackOptions = [
    { label: "All Tracks", value: "all" },
    { label: "GIMUN Track", value: "gimun" },
    { label: "GMC Track", value: "moot-cup" },
    { label: "Shared & Campus", value: "shared" },
  ];

  const typeOptions = [
    { label: "All Documents", value: "all" },
    { label: "Handbooks", value: "handbook" },
    { label: "Background Guides", value: "background-guide" },
    { label: "Case Problems (Compromis)", value: "proposition" },
    { label: "Rules & Guidelines", value: "rules" },
    { label: "Campus Logistics", value: "map" },
  ];

  const filteredDocuments = initialDocuments.filter((doc) => {
    const matchesTrack = trackFilter === "all" || doc.track === trackFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileFormat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-12">
      <section className="space-y-6" aria-labelledby="start-here-title">
        <h2 id="start-here-title" className="text-meta font-mono uppercase text-text-2">
          Start here
        </h2>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {starters.map((starter, index) => (
            <li key={starter.title} className="flex flex-col gap-4 bg-raised p-6 sm:p-7">
              <span className="font-mono text-xs text-text-3" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-lg font-medium text-text">{starter.title}</h3>
              <p className="text-sm leading-relaxed text-text-2">{starter.body}</p>
              <ul className="mt-auto space-y-2 border-t border-line pt-4">
                {starter.documents.map((document) => (
                  <li key={document.id}>
                    <a href={document.fileUrl} className="text-link text-sm" data-no-transition="">
                      {document.title} ({document.fileFormat})
                    </a>
                  </li>
                ))}
                {starter.documents.length === 0 && (
                  <li className="text-sm text-text-3">Published here when ready.</li>
                )}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* 2. REPOSITORY SEARCH & FILTER SUITE */}
      <div className="space-y-6 pb-2 border-b border-line">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by document title, type, or topic..."
            />
          </div>
          <div className="text-xs font-mono text-text-3">
            Displaying {filteredDocuments.length} of {initialDocuments.length} Official Documents
          </div>
        </div>

        {/* Track Filter */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-text-2 block">
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
          <span className="text-[11px] font-mono uppercase font-bold text-text-2 mr-2">
            Document Type:
          </span>
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer",
                typeFilter === opt.value
                  ? "bg-champagne text-on-accent shadow-xs font-bold"
                  : "bg-overlay/80 border border-line text-text-2 hover:bg-brand/60 hover:text-text"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. DOCUMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc, idx) => (
          <ScrollReveal key={doc.id} delay={idx * 0.04}>
            <div className="double-bezel h-full group hover:translate-y-[-2px] transition-transform duration-300">
              <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2">
                    <TrackBadge track={doc.track} size="sm" />
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-overlay/80 border border-line text-champagne">
                      {doc.type.replace("-", " ")}
                    </span>
                  </div>

                  {/* Document Title */}
                  <h3 className="font-display font-medium text-base sm:text-lg text-text leading-snug group-hover:text-champagne transition-colors">
                    {doc.title}
                  </h3>

                  {/* File Metadata in Monospace */}
                  <div className="text-xs font-mono text-text-2 flex items-center justify-between pt-1">
                    <span className="font-bold text-champagne">
                      {doc.fileFormat} &bull; {doc.fileSize}
                    </span>
                    <span className="text-[11px] text-text-3">
                      Rev: {doc.versionDate}
                    </span>
                  </div>
                </div>

                {/* Direct Download Action */}
                <div className="pt-3 border-t border-line">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-crest font-bold hover:brightness-105 transition-all shadow-md cursor-pointer border border-line-2"
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
              description={`No official documents match "${searchQuery || "your filter combination"}". Try clearing filters or searching for different keywords.`}
              actionLabel="Reset All Filters"
              onAction={() => {
                setSearchQuery("");
                setTrackFilter("all");
                setTypeFilter("all");
              }}
            />
          </div>
        )}
      </div>

      <HelpCallout
        question="Looking for a document that isn't here?"
        actions={[{ label: 'Read the FAQ', href: '/about/faq' }]}
      />
    </div>
  );
}
