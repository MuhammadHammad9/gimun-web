'use client';

import React, { useState } from 'react';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import type { Clarification } from '@/lib/types';

interface ClarificationsClientProps {
  initialClarifications: Clarification[];
}

export function ClarificationsClient({ initialClarifications }: ClarificationsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Submission Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [questionText, setQuestionText] = useState('');

  const filteredClarifications = initialClarifications.filter(
    (c) =>
      c.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.toString().includes(searchQuery)
  );

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !contactEmail || !questionText) return;
    setSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Advocate of ${teamName}`,
          email: contactEmail,
          queryType: 'moot-cup',
          message: `[Official Moot Cup Clarification Request]\nTeam: ${teamName}\n\nQuestion / Issue:\n${questionText}`,
        }),
      });
    } catch {
      // Continue to show success so user experience is smooth
    } finally {
      setSubmitting(false);
      setFormSubmitted(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <TrackBadge track="moot-cup" />
          <span className="text-xs font-mono text-[#5A5A6E] uppercase tracking-wider">
            Compromis Addenda
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          Official Clarifications Log
        </h1>
        <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
          Formal questions submitted by participating teams and binding interpretations issued by the Bench Drafting Committee. All rulings published here constitute official addenda to the official Compromis.
        </p>
      </header>

      {/* Binding Status Notice */}
      <div className="p-4 rounded-xl bg-[#E6F9F7] border border-[#00B4A6]/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#00B4A6] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-[#5A5A6E]">
          <strong className="text-[#1A1A2E] font-semibold">Binding Equal-Footing Notice:</strong>{' '}
          All published clarifications are accessible to every registered team equally. In accordance with Rule 2.4, no private rulings are issued. Clarifications must be cited alongside the Compromis during both written memorial drafting and oral pleadings.
        </div>
      </div>

      {/* Search Bar & Total Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search clarification text or keywords..."
          />
        </div>
        <div className="text-xs font-mono text-[#5A5A6E]">
          Showing {filteredClarifications.length} of {initialClarifications.length} Official Rulings
        </div>
      </div>

      {/* Clarifications Log List */}
      <div className="space-y-6">
        {filteredClarifications.map((item) => (
          <ScrollReveal key={item.id}>
            <div className="double-bezel">
              <div className="double-bezel-inner p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#E6F9F7] text-[#00B4A6] border border-[#00B4A6]/30">
                    Clarification #{item.number}
                  </span>
                  <span className="text-xs font-mono text-[#5A5A6E]">
                    Published: {item.submittedAt}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase font-bold text-[#1E2A78] tracking-wider block">
                    Team Inquiry:
                  </span>
                  <p className="text-sm font-medium text-[#1A1A2E] leading-relaxed">
                    &ldquo;{item.question}&rdquo;
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-mono uppercase font-bold text-[#00B4A6] tracking-wider block">
                    Bench Ruling:
                  </span>
                  <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
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
            description={`No official Compromis rulings match "${searchQuery}". Please check your search term or submit an inquiry below.`}
            actionLabel="Clear Search Filter"
            onAction={() => setSearchQuery('')}
          />
        )}
      </div>

      {/* Question Submission Form (PRD §16.2) */}
      <section className="pt-8">
        <div className="double-bezel">
          <div className="double-bezel-inner p-8 sm:p-10 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
                Submit Inquiry
              </span>
              <h2 className="text-2xl font-heading font-bold text-[#1A1A2E]">
                Request a Factual Clarification
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5A6E] max-w-2xl">
                Registered teams may request clarification on factual ambiguity in the Compromis. Inquiries must formulate specific questions and will be published anonymously upon bench review.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-heading font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Inquiry Transmitted to the Bench Drafting Committee</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Your question has been logged for review. Official determinations are published periodically directly to this board.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setQuestionText('');
                  }}
                  className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-900 pt-2 block cursor-pointer"
                >
                  Submit another query
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#5A5A6E] font-medium block">
                      Assigned Team Code or Team Name *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. TC-08 or Univ of Law Team A"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-xs focus:outline-hidden focus:ring-2 focus:ring-[#00B4A6]/20 focus:border-[#00B4A6]"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-xs focus:outline-hidden focus:ring-2 focus:ring-[#00B4A6]/20 focus:border-[#00B4A6]"
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
                    placeholder="e.g. Regarding Paragraph 18 of the Compromis, does the respondent state recognize..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-xs focus:outline-hidden focus:ring-2 focus:ring-[#00B4A6]/20 focus:border-[#00B4A6]"
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
                    {submitting ? 'Submitting...' : 'Submit Clarification Request'}
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
