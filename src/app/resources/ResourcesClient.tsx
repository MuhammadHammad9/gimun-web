"use client";

import React, { useState } from "react";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar } from "@/components/ui/FilterBar";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download, Sparkles } from "lucide-react";
import type { Document } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResourcesClientProps {
  initialDocuments: Document[];
}

export function ResourcesClient({ initialDocuments }: ResourcesClientProps) {
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
    { label: "Legal Compromis", value: "proposition" },
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
      {/* 1. CURATED STARTER PACKS BENTO */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-[#1E2A78]">
            Curated Literature Bundles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pack 1 */}
          <div className="p-6 rounded-2xl bg-[#070B19] text-white border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-sm">
            <div className="absolute inset-0 bg-radial-glow-orange opacity-25 pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
                Diplomatic Starter Pack
              </span>
              <h3 className="font-heading font-extrabold text-lg text-white">
                GIMUN Delegate Kit
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Includes the official Rules of Procedure handbook, parliamentary motions cheat sheet, and sample resolution template.
              </p>
            </div>
            <div className="relative z-10 pt-2 border-t border-white/10">
              <a
                href="/documents/gimun/GIMUN_Rules_of_Procedure.pdf"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download RoP Handbook</span>
              </a>
            </div>
          </div>

          {/* Pack 2 */}
          <div className="p-6 rounded-2xl bg-[#070B19] text-white border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-sm">
            <div className="absolute inset-0 bg-radial-glow-teal opacity-25 pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-[#00B4A6]/20 text-[#00B4A6] border border-[#00B4A6]/30">
                Appellate Briefing Pack
              </span>
              <h3 className="font-heading font-extrabold text-lg text-white">
                GMC Memorial Kit
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Includes the 2027 official Compromis case record, OSCOLA citation guidelines, and oral rounds scoring rubric.
              </p>
            </div>
            <div className="relative z-10 pt-2 border-t border-white/10">
              <a
                href="/documents/moot-cup/Moot_Cup_Rules_and_Memorial_Guide.pdf"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00B4A6] hover:text-[#00B4A6]/80 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Rules &amp; Guide</span>
              </a>
            </div>
          </div>

          {/* Pack 3 */}
          <div className="p-6 rounded-2xl bg-[#070B19] text-white border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-sm">
            <div className="absolute inset-0 bg-radial-glow-dual opacity-25 pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-white/10 text-gray-300 border border-white/15">
                Campus Logistics Pack
              </span>
              <h3 className="font-heading font-extrabold text-lg text-white">
                Outstation Travel Kit
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Campus access security guidelines, M-1 motorway directions, hostel check-in protocols, and emergency medical contacts.
              </p>
            </div>
            <div className="relative z-10 pt-2 border-t border-white/10">
              <a
                href="/documents/shared/GIKI_Campus_Map_Venue_Guide.pdf"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gray-200 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Campus Map &amp; Guide</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REPOSITORY SEARCH & FILTER SUITE */}
      <div className="space-y-6 pb-2 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by document title, type, or topic..."
            />
          </div>
          <div className="text-xs font-mono text-[#5A5A6E]">
            Displaying {filteredDocuments.length} of {initialDocuments.length} Official Documents
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
                "px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer",
                typeFilter === opt.value
                  ? "bg-[#1E2A78] text-white shadow-xs font-bold"
                  : "bg-gray-100 text-[#5A5A6E] hover:bg-gray-200"
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
              <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4 bg-white">
                <div className="space-y-3">
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2">
                    <TrackBadge track={doc.track} size="sm" />
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {doc.type.replace("-", " ")}
                    </span>
                  </div>

                  {/* Document Title */}
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[#1A1A2E] leading-snug group-hover:text-[#FF6B35] transition-colors">
                    {doc.title}
                  </h3>

                  {/* File Metadata in Monospace */}
                  <div className="text-xs font-mono text-[#5A5A6E] flex items-center justify-between pt-1">
                    <span className="font-bold text-[#1E2A78]">
                      {doc.fileFormat} &bull; {doc.fileSize}
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
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-[#1E2A78] text-white hover:bg-[#1E2A78]/90 transition-colors shadow-xs cursor-pointer"
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

      {/* 4. ASSISTANCE CALLOUT */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
            Looking for a Specialized Document or Country Dossier?
          </h3>
          <p className="text-xs sm:text-sm text-[#5A5A6E]">
            Contact the Secretariat or the GMC Directorate directly for institutional invoice vouchers or custom research packs.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" size="sm" href="/contact">
            Contact Directorate
          </Button>
          <Button variant="primary" size="sm" href="/about/faq">
            Browse FAQ
          </Button>
        </div>
      </section>
    </div>
  );
}
