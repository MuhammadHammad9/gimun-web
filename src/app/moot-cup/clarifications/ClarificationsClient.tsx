"use client";

import React, { useEffect, useRef, useState } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  AlertCircle,
  Calendar,
  FileCheck,
} from "lucide-react";
import type { Clarification } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ClarificationForm } from '@/components/forms/ClarificationForm';

interface ClarificationsClientProps {
  initialClarifications: Clarification[];
}

export function ClarificationsClient({ initialClarifications }: ClarificationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Submission Form State
  const formLoadedAt = useRef(0);

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const filteredClarifications = initialClarifications.filter((c) => {
    const matchesSearch =
      c.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.toString().includes(searchQuery);

    if (!matchesSearch) return false;
    if (selectedFilter === "all") return true;
    if (selectedFilter === "jurisdiction") {
      return (
        c.question.toLowerCase().includes("jurisdiction") ||
        c.answer.toLowerCase().includes("jurisdiction") ||
        c.question.toLowerCase().includes("standing")
      );
    }
    if (selectedFilter === "merits") {
      return (
        c.question.toLowerCase().includes("treaty") ||
        c.question.toLowerCase().includes("sovereignty") ||
        c.answer.toLowerCase().includes("customary")
      );
    }
    return true;
  });


  return (
    <div className="space-y-12">
      {/* Equal-Footing Binding Status Banner */}
      <div className="p-4.5 rounded-2xl bg-crest/80 border border-champagne/30 flex items-start gap-3.5 shadow-xl">
        <AlertCircle className="w-5 h-5 text-champagne shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-champagne/90">
          <strong className="font-bold text-cream">Rule 2.4 — Equal Footing &amp; Binding Determination:</strong>{" "}
          All published clarifications constitute official and binding addenda to the Compromis. No private determinations are issued to individual teams. Clarifications may be relied upon and cited during written memorial drafting and oral pleadings.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-champagne/30">
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search rulings by keyword or paragraph..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Rulings" },
            { id: "jurisdiction", label: "Jurisdiction & Procedure" },
            { id: "merits", label: "Substantive Merits" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer",
                selectedFilter === tab.id
                  ? "bg-champagne text-brand shadow-xs font-bold"
                  : "bg-overlay/80 border border-champagne/20 text-champagne/80 hover:bg-brand/60 hover:text-cream"
              )}
            >
              {tab.label}
            </button>
          ))}
          <span className="text-xs font-mono text-champagne/70 ml-2">
            Showing {filteredClarifications.length} of {initialClarifications.length}
          </span>
        </div>
      </div>

      {/* Clarifications Log List */}
      <div className="space-y-6">
        {filteredClarifications.map((item) => (
          <ScrollReveal key={item.id}>
            <div className="double-bezel">
              <div className="double-bezel-inner p-6 sm:p-8 space-y-4 border-l-4 border-l-champagne">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-champagne/20 text-cream border border-champagne/30">
                      Clarification #{item.number}
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-overlay/80 border border-champagne/20 text-champagne">
                      Binding Addendum
                    </span>
                  </div>
                  <div className="text-xs font-mono text-champagne/70 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-champagne" />
                    <span>Promulgated: {item.submittedAt}</span>
                  </div>
                </div>

                {/* Question */}
                <div className="p-4 rounded-xl bg-overlay/80 border border-champagne/20 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-champagne tracking-wider block">
                    Team Inquiry on Compromis:
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-cream leading-relaxed">
                    &ldquo;{item.question}&rdquo;
                  </p>
                </div>

                {/* Ruling */}
                <div className="p-4 rounded-xl bg-elevated/60 border border-champagne-lo/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-champagne tracking-wider">
                    <FileCheck className="w-3.5 h-3.5 text-champagne" />
                    <span>Bench Determination:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-champagne-hi leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {filteredClarifications.length === 0 && (
          <EmptyState
            title="No Clarifications Found"
            description={`No official Compromis rulings match "${searchQuery}". Please check your query or submit a formal inquiry below.`}
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery("");
              setSelectedFilter("all");
            }}
          />
        )}
      </div>

      {/* The submission form lives in ClarificationForm, which is shared with
          the contact flow. This page previously carried its own inline copy —
          a second form with its own state, validation and honeypot that had
          already drifted from the shared one (it collected no paragraph
          citation, so the Bench received questions it could not place). */}
      <section className="pt-4">
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-6 p-6 sm:p-10">
            <div className="space-y-2">
              <span className="font-mono text-meta font-bold uppercase tracking-[0.14em] text-champagne">
                Ask the bench
              </span>
              <h2 className="text-h2 font-display font-medium text-text">
                Submit a clarification
              </h2>
              <p className="max-w-2xl text-body text-text-3">
                Registered teams can ask about anything ambiguous in the case problem.
                Answers are published here for every team at the same time.
              </p>
            </div>

            <ClarificationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
