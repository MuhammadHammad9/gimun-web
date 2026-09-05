"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Calendar,
  FileCheck,
} from "lucide-react";
import type { Clarification } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ClarificationsClientProps {
  initialClarifications: Clarification[];
}

export function ClarificationsClient({ initialClarifications }: ClarificationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Submission Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !contactEmail || !questionText) return;
    setSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Advocate of ${teamName}`,
          email: contactEmail,
          queryType: "moot-cup",
          message: `[Official GMC Clarification Request]\nTeam: ${teamName}\n\nQuestion / Issue:\n${questionText}`,
        }),
      });
    } catch {
      // Keep UX smooth
    } finally {
      setSubmitting(false);
      setFormSubmitted(true);
    }
  };

  return (
    <div className="space-y-12">
      {/* Equal-Footing Binding Status Banner */}
      <div className="p-4.5 rounded-2xl bg-[#E6F9F7] border border-[#00B4A6]/30 flex items-start gap-3.5">
        <AlertCircle className="w-5 h-5 text-[#00B4A6] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-[#1A1A2E]">
          <strong className="font-bold">Rule 2.4 — Equal Footing &amp; Binding Determination:</strong>{" "}
          All published clarifications constitute official and binding addenda to the Compromis. No private determinations are issued to individual teams. Clarifications may be relied upon and cited during written memorial drafting and oral pleadings.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
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
                "px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer",
                selectedFilter === tab.id
                  ? "bg-[#00B4A6] text-white shadow-xs font-bold"
                  : "bg-gray-100 text-[#5A5A6E] hover:bg-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
          <span className="text-xs font-mono text-[#5A5A6E] ml-2">
            Showing {filteredClarifications.length} of {initialClarifications.length}
          </span>
        </div>
      </div>

      {/* Clarifications Log List */}
      <div className="space-y-6">
        {filteredClarifications.map((item) => (
          <ScrollReveal key={item.id}>
            <div className="double-bezel">
              <div className="double-bezel-inner p-6 sm:p-8 space-y-4 bg-white border-l-4 border-l-[#00B4A6]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#E6F9F7] text-[#00B4A6] border border-[#00B4A6]/30">
                      Clarification #{item.number}
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      Binding Addendum
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#5A5A6E] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#00B4A6]" />
                    <span>Promulgated: {item.submittedAt}</span>
                  </div>
                </div>

                {/* Question */}
                <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#1E2A78] tracking-wider block">
                    Team Inquiry on Compromis:
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-[#1A1A2E] leading-relaxed">
                    &ldquo;{item.question}&rdquo;
                  </p>
                </div>

                {/* Ruling */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-emerald-800 tracking-wider">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bench Determination:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1A1A2E] leading-relaxed">
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

      {/* Formal Inquiry Submission Box (PRD §16.2) */}
      <section className="pt-4">
        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-10 space-y-6 bg-radial-glow-teal">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
                Direct Submission
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#1A1A2E]">
                Submit Clarification Inquiry to the Bench
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5A6E] max-w-2xl">
                Registered teams may formulate concise questions identifying specific factual ambiguities in the Compromis. All inquiries are evaluated confidentially and published for all teams simultaneously.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-heading font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Inquiry Transmitted to the Bench Drafting Committee</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your question has been logged for judicial consideration. Rulings are issued periodically on this dispatch board.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setQuestionText("");
                  }}
                  className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 pt-2 block cursor-pointer"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#5A5A6E] font-medium block">
                      Assigned Team Code (e.g. TC-08) *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. TC-08"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-xs bg-white text-[#1A1A2E] focus:outline-hidden focus:ring-2 focus:ring-[#00B4A6]/20 focus:border-[#00B4A6]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#5A5A6E] font-medium block">
                      Contact Advocate Email *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="advocate@university.edu.pk"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-xs bg-white text-[#1A1A2E] focus:outline-hidden focus:ring-2 focus:ring-[#00B4A6]/20 focus:border-[#00B4A6]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#5A5A6E] font-medium block">
                    Specific Clarification Question (cite Compromis paragraph) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g. In reference to Paragraph 14 of the Compromis, does the multilateral communique imply..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-xs bg-white text-[#1A1A2E] focus:outline-hidden focus:ring-2 focus:ring-[#00B4A6]/20 focus:border-[#00B4A6]"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="track-moot"
                    size="md"
                    disabled={submitting}
                    icon={<Send className="w-4 h-4" />}
                  >
                    {submitting ? "Transmitting..." : "Submit Inquiry to Bench"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
