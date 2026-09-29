"use client";

import { useSiteConfig } from '@/components/SiteConfigProvider';

import React, { useState } from "react";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download } from "lucide-react";
import type { Document } from "@/lib/types";
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
    { label: "All tracks", value: "all" },
    { label: "GIMUN", value: "gimun" },
    { label: "GMC", value: "moot-cup" },
    { label: "Shared", value: "shared" },
  ];

  const typeOptions = [
    { label: "All types", value: "all" },
    { label: "Handbooks", value: "handbook" },
    { label: "Background guides", value: "background-guide" },
    { label: "Case problem", value: "proposition" },
    { label: "Rules", value: "rules" },
    { label: "Campus", value: "map" },
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

      <section className="space-y-6" aria-labelledby="library-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="library-title" className="font-display text-2xl font-medium text-text sm:text-3xl">
            Every document
          </h2>
          <div className="w-full sm:w-96">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by title or type" />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
          <FilterBar label="Filter by track" options={trackOptions} activeValue={trackFilter} onChange={setTrackFilter} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by document type">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTypeFilter(opt.value)}
                aria-pressed={typeFilter === opt.value}
                className="chip"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <p className="font-mono text-xs text-text-3" aria-live="polite">
          {filteredDocuments.length} of {initialDocuments.length} documents
        </p>

        <ul className="doc-list" key={`${trackFilter}-${typeFilter}`}>
          {filteredDocuments.map((doc) => (
            <li key={doc.id}>
              <a href={doc.fileUrl} className="doc-row" data-no-transition="" target="_blank" rel="noopener noreferrer">
                <span className="doc-row__type">{doc.type.replace('-', ' ')}</span>
                <span className="doc-row__title">
                  {doc.title}
                  <span className="sr-only"> ({doc.fileFormat}, {doc.fileSize}, opens in a new tab)</span>
                </span>
                <span className="doc-row__meta" aria-hidden="true">
                  <TrackBadge track={doc.track} size="sm" />
                  <span>
                    {doc.fileFormat} · {doc.fileSize}
                  </span>
                  <span>Revised {doc.versionDate}</span>
                </span>
                <Download aria-hidden="true" strokeWidth={1.75} className="doc-row__icon" />
              </a>
            </li>
          ))}
        </ul>

        {filteredDocuments.length === 0 && (
          <EmptyState
            title="No documents match"
            description={`Nothing matches "${searchQuery || 'these filters'}". Clear the search or pick another filter.`}
            actionLabel="Clear filters"
            onAction={() => {
              setSearchQuery('');
              setTrackFilter('all');
              setTypeFilter('all');
            }}
          />
        )}
      </section>

      <HelpCallout
        question="Looking for a document that isn't here?"
        actions={[{ label: 'Read the FAQ', href: '/about/faq' }]}
      />
    </div>
  );
}
