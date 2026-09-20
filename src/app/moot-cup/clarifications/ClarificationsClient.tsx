"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { HoneypotField } from "@/components/forms/HoneypotField";
import { validateEmail } from "@/lib/validation";

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !contactEmail.trim() || !questionText.trim()) {
      setSubmitError("Team code, contact email, and clarification question are required.");
      return;
    }
    const emailError = validateEmail(contactEmail);
    if (emailError) {
      setSubmitError(emailError);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Advocate of ${teamName}`,
          email: contactEmail,
          queryType: "moot-cup",
          message: `[Official GMC Clarification Request]\nTeam: ${teamName}\n\nQuestion / Issue:\n${questionText}`,
          _hp: honeypot,
          _ts: formLoadedAt.current,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit the clarification inquiry.");
      }
      setFormSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit the clarification inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Formal Inquiry Submission Box (PRD §16.2) */}
      <section className="pt-4">
        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-10 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-champagne/80 font-bold">
                Direct Submission
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-cream">
                Submit Clarification Inquiry to the Bench
              </h2>
              <p className="text-xs sm:text-sm text-champagne/80 max-w-2xl">
                Registered teams may formulate concise questions identifying specific factual ambiguities in the Compromis. All inquiries are evaluated confidentially and published for all teams simultaneously.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-2xl bg-elevated/80 border border-champagne-lo/40 text-champagne-hi space-y-2">
                <div className="flex items-center gap-2 font-heading font-bold text-base text-champagne-hi">
                  <CheckCircle2 className="w-5 h-5 text-champagne" />
                  <span>Inquiry Transmitted to the Bench Drafting Committee</span>
                </div>
                <p className="text-xs text-champagne-hi/90 leading-relaxed">
                  Your question has been logged for judicial consideration. Rulings are issued periodically on this dispatch board.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setTeamName("");
                    setContactEmail("");
                    setQuestionText("");
                    setHoneypot("");
                    setSubmitError(null);
                    formLoadedAt.current = Date.now();
                  }}
                  className="text-xs font-semibold text-champagne underline hover:text-cream pt-2 block cursor-pointer"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-xl bg-brand-deep/80 border border-crimson/40 text-crimson-soft text-xs" role="alert">
                    {submitError}
                  </div>
                )}
                <HoneypotField value={honeypot} onChange={setHoneypot} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="clarification-team-code" className="text-xs font-mono text-champagne/80 font-medium block">
                      Assigned Team Code (e.g. TC-08) *
                    </label>
                    <input
                      id="clarification-team-code"
                      type="text"
                      autoComplete="off"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. TC-08"
                      className="w-full px-4 py-2.5 rounded-xl border border-champagne/30 text-base sm:text-xs bg-overlay/90 text-cream placeholder-champagne/40 focus:outline-hidden focus:ring-2 focus:ring-champagne/30 focus:border-champagne"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="clarification-contact-email" className="text-xs font-mono text-champagne/80 font-medium block">
                      Contact Advocate Email *
                    </label>
                    <input
                      id="clarification-contact-email"
                      type="email"
                      autoComplete="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="advocate@university.edu.pk"
                      className="w-full px-4 py-2.5 rounded-xl border border-champagne/30 text-base sm:text-xs bg-overlay/90 text-cream placeholder-champagne/40 focus:outline-hidden focus:ring-2 focus:ring-champagne/30 focus:border-champagne"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="clarification-question" className="text-xs font-mono text-champagne/80 font-medium block">
                    Specific Clarification Question (cite Compromis paragraph) *
                  </label>
                  <textarea
                    id="clarification-question"
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g. In reference to Paragraph 14 of the Compromis, does the multilateral communique imply..."
                    className="w-full px-4 py-2.5 rounded-xl border border-champagne/30 text-base sm:text-xs bg-overlay/90 text-cream placeholder-champagne/40 focus:outline-hidden focus:ring-2 focus:ring-champagne/30 focus:border-champagne"
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
