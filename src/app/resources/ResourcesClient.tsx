"use client";

import { useSiteConfig } from '@/components/SiteConfigProvider';

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
import { getEventYear } from "@/lib/site-config";

interface ResourcesClientProps {
  initialDocuments: Document[];
}

export function ResourcesClient({ initialDocuments }: ResourcesClientProps) {
  const eventYear = getEventYear(useSiteConfig());
  const gimunRulesDocument = initialDocuments.find(
    (document) => document.track === "gimun" && document.type === "rules",
  );
  const mootRulesDocument = initialDocuments.find(
    (document) => document.track === "moot-cup" && document.type === "rules",
  );
  const campusMapDocument = initialDocuments.find(
    (document) => document.track === "shared" && document.type === "map",
  );
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
      {/* 1. CURATED STARTER PACKS BENTO */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-champagne" />
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-champagne/80">
            Essential Starter Guides
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pack 1 */}
          <div className="p-6 rounded-2xl bg-overlay/90 text-champagne border border-champagne/25 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-xl">
            <div className="relative z-10 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-champagne/20 text-cream border border-champagne/30">
                Diplomatic Starter Pack
              </span>
              <h3 className="font-heading font-extrabold text-lg text-cream">
                GIMUN Delegate Kit
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                Includes the official Rules of Procedure handbook, parliamentary motions cheat sheet, and sample resolution template.
              </p>
            </div>
            <div className="relative z-10 pt-2 border-t border-champagne/20">
              {gimunRulesDocument ? (
                <a
                  href={gimunRulesDocument.fileUrl}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-champagne hover:text-cream transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download RoP Handbook</span>
                </a>
              ) : (
                <span className="text-xs font-mono text-champagne/60">Handbook pending publication</span>
              )}
            </div>
          </div>

          {/* Pack 2 */}
          <div className="p-6 rounded-2xl bg-overlay/90 text-champagne border border-champagne/25 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-xl">
            <div className="relative z-10 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-champagne/20 text-cream border border-champagne/30">
                Courtroom Briefing Pack
              </span>
              <h3 className="font-heading font-extrabold text-lg text-cream">
                GMC Written Arguments Kit
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                Includes the {eventYear} official case problem (Compromis), citation style guidelines, and courtroom scoring rubric.
              </p>
            </div>
            <div className="relative z-10 pt-2 border-t border-champagne/20">
              {mootRulesDocument ? (
                <a
                  href={mootRulesDocument.fileUrl}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-champagne hover:text-cream transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Rules &amp; Guide</span>
                </a>
              ) : (
                <span className="text-xs font-mono text-champagne/60">Rules guide pending publication</span>
              )}
            </div>
          </div>

          {/* Pack 3 */}
          <div className="p-6 rounded-2xl bg-overlay/90 text-champagne border border-champagne/25 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-xl">
            <div className="relative z-10 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-champagne/20 text-cream border border-champagne/30">
                Campus Logistics Pack
              </span>
              <h3 className="font-heading font-extrabold text-lg text-cream">
                Outstation Travel Kit
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                Campus access security guidelines, M-1 motorway directions, hostel check-in protocols, and emergency medical contacts.
              </p>
            </div>
            <div className="relative z-10 pt-2 border-t border-champagne/20">
              {campusMapDocument ? (
                <a
                  href={campusMapDocument.fileUrl}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-champagne hover:text-cream transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Campus Map &amp; Guide</span>
                </a>
              ) : (
                <span className="text-xs font-mono text-champagne/60">Campus guide pending publication</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. REPOSITORY SEARCH & FILTER SUITE */}
      <div className="space-y-6 pb-2 border-b border-champagne/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by document title, type, or topic..."
            />
          </div>
          <div className="text-xs font-mono text-champagne/70">
            Displaying {filteredDocuments.length} of {initialDocuments.length} Official Documents
          </div>
        </div>

        {/* Track Filter */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-champagne/80 block">
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
          <span className="text-[11px] font-mono uppercase font-bold text-champagne/80 mr-2">
            Document Type:
          </span>
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer",
                typeFilter === opt.value
                  ? "bg-champagne text-brand shadow-xs font-bold"
                  : "bg-overlay/80 border border-champagne/20 text-champagne/80 hover:bg-brand/60 hover:text-cream"
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
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-overlay/80 border border-champagne/20 text-champagne">
                      {doc.type.replace("-", " ")}
                    </span>
                  </div>

                  {/* Document Title */}
                  <h3 className="font-heading font-bold text-base sm:text-lg text-cream leading-snug group-hover:text-champagne transition-colors">
                    {doc.title}
                  </h3>

                  {/* File Metadata in Monospace */}
                  <div className="text-xs font-mono text-champagne/80 flex items-center justify-between pt-1">
                    <span className="font-bold text-champagne">
                      {doc.fileFormat} &bull; {doc.fileSize}
                    </span>
                    <span className="text-[11px] text-champagne/60">
                      Rev: {doc.versionDate}
                    </span>
                  </div>
                </div>

                {/* Direct Download Action */}
                <div className="pt-3 border-t border-champagne/20">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-crest font-bold hover:brightness-105 transition-all shadow-md cursor-pointer border border-champagne/40"
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
      <section className="p-6 sm:p-8 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-lg text-cream">
            Looking for a Specialized Document or Country Dossier?
          </h3>
          <p className="text-xs sm:text-sm text-champagne/80">
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
