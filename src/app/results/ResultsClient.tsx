'use client';

import React, { useState } from 'react';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Trophy,
  Medal,
  Crown,
  ShieldCheck,
  Clock,
  Scale,
  Globe2,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ResultAward, Track } from '@/lib/types';

interface ResultsClientProps {
  initialResults: ResultAward[];
  resultsPublished?: boolean;
  eventEndDate: string;
}

export function ResultsClient({
  initialResults,
  resultsPublished = false,
  eventEndDate,
}: ResultsClientProps) {
  const galaDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(new Date(`${eventEndDate}T12:00:00+05:00`));
  const [organizerPreview, setOrganizerPreview] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isDisplayingResults = resultsPublished || organizerPreview;

  const filterOptions = [
    { label: 'All Honors', value: 'all' },
    { label: 'GIMUN Diplomatic Awards', value: 'gimun' },
    { label: 'GMC Judicial Honors', value: 'moot-cup' },
  ];

  const filtered = initialResults.filter((item) => {
    const matchesTrack = selectedTrack === 'all' || item.track === selectedTrack;
    const matchesSearch =
      item.awardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.winnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryOrCommittee.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Organizer Preview Bar / Banner */}
      {!resultsPublished && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-mono">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Pre-Event Adjudication State:</strong> Results are scheduled for promulgation at the Grand Awards Gala ({galaDate}).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOrganizerPreview((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold bg-white border border-amber-300 text-amber-800 hover:bg-amber-100/50 shadow-xs transition-colors shrink-0"
          >
            {organizerPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Exit Organizer Preview
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Preview Promulgated Roster
              </>
            )}
          </button>
        </div>
      )}

      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-amber-50 border border-amber-200 text-amber-800">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {isDisplayingResults ? 'Official Hall of Fame & Accolades' : 'Conclave Honors & Adjudication Framework'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          {isDisplayingResults ? 'Results & Awardees' : 'Awards, Honors & Adjudication'}
        </h1>
        <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
          {isDisplayingResults
            ? 'Celebrating outstanding parliamentary diplomacy, rigorous legal scholarship, and persuasive advocacy across GIKI Model United Nations and GIKI Moot Court.'
            : 'Official adjudication criteria, flagship awards prospectus, and promulgation protocols for GIMUN and GMC 2027.'}
        </p>
      </header>

      {/* Flagship Trophies Banner (Common to both states) */}
      <section>
        <ScrollReveal>
          <div className="rounded-3xl bg-[#070B19] text-white p-8 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden bg-tech-grid">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Supreme Conclave Honors
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                    2027 Flagship Champion Trophies
                  </h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold self-start sm:self-auto flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isDisplayingResults ? 'Promulgated on Merit' : 'Adjudicated on Pure Merit'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-6 rounded-2xl bg-white/8 border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Best Delegation Trophy
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Awarded to the overall highest-performing institutional delegation accumulating points across all UN committee chambers.
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-amber-300/80">
                    Highest Institutional Honor
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/8 border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 text-[#FFA27B] flex items-center justify-center">
                    <Medal className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Best Delegate Gavel (GIMUN)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Conferred by committee Dais panels for exceptional resolution drafting, unmoderated caucusing, and sovereign policy defense.
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-[#FFA27B]/80">
                    Chamber Diplomatic Supremacy
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/8 border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4A6]/20 text-[#5EEAD4] flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Champion Bench (GMC)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Awarded to the Grand Final winning legal team following intense appellate advocacy before the High Court judicial panel.
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-[#5EEAD4]/80">
                    Appellate Jurisprudence Laureate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CONDITIONAL RENDERING: PRE-EVENT STATE */}
      {!isDisplayingResults ? (
        <section className="space-y-12">
          {/* Promulgation Notice Card */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-8 sm:p-10 space-y-6 border-l-4 border-l-[#1E2A78]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#1E2A78]">
                    <Clock className="w-4 h-4 text-[#FF6B35]" />
                    <span>Official Announcement Protocol</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E]">
                    Promulgation Following Grand Awards Gala
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-mono text-xs font-semibold shrink-0">
                  <Calendar className="w-4 h-4 text-[#1E2A78]" />
                  <span>{galaDate}</span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed max-w-4xl">
                In strict adherence to academic rigor and blind tabulation security, official award designations are sealed until the Grand Awards Gala on Day 4 of the conference. Tabulation is overseen independently by the Directorate of Academics and audited by faculty advisors prior to public release.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-200/70 space-y-1.5">
                  <span className="text-xs font-mono text-[#5A5A6E] uppercase">Stage 1</span>
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Session Scoring</div>
                  <p className="text-xs text-[#5A5A6E]">Committee Dais &amp; Bench scoring completed after final sessions.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-200/70 space-y-1.5">
                  <span className="text-xs font-mono text-[#5A5A6E] uppercase">Stage 2</span>
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Blind Audit</div>
                  <p className="text-xs text-[#5A5A6E]">Discrepancy review and delegation point aggregation by Secretariat.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-200/70 space-y-1.5">
                  <span className="text-xs font-mono text-[#5A5A6E] uppercase">Stage 3</span>
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Gala Conferral</div>
                  <p className="text-xs text-[#5A5A6E]">Live physical ceremony and trophy distribution in Main Auditorium.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-200/70 space-y-1.5">
                  <span className="text-xs font-mono text-[#5A5A6E] uppercase">Stage 4</span>
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Digital Registry</div>
                  <p className="text-xs text-[#5A5A6E]">Instant publication of all awardees on this portal with verification IDs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Adjudication Criteria & Rubrics Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#1E2A78] font-bold">
                Evaluation Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E]">
                Merit Adjudication Criteria
              </h2>
              <p className="text-sm text-[#5A5A6E]">
                All awards across both tracks are adjudicated by specialized panels based on transparent, pre-published criteria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* GIMUN Track Rubric */}
              <div className="double-bezel">
                <div className="double-bezel-inner p-8 space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/15 text-[#C84815] flex items-center justify-center">
                        <Globe2 className="w-4 h-4" />
                      </div>
                      <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
                        GIMUN Diplomatic Rubric
                      </h3>
                    </div>
                    <TrackBadge track="gimun" size="sm" />
                  </div>

                  <p className="text-xs text-[#5A5A6E] leading-relaxed">
                    Evaluated continuously across all committee sessions by Dais chairs according to international HMUN standards.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-semibold text-[#1A1A2E]">Consensus Building &amp; Caucus Diplomacy</span>
                        <span className="text-[#C84815] font-bold">30%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: '30%' }} />
                      </div>
                      <p className="text-[11px] text-[#5A5A6E]">Leading unmoderated caucuses, forging cross-bloc alliances, and resolving deadlock.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-semibold text-[#1A1A2E]">Resolution &amp; Working Paper Drafting</span>
                        <span className="text-[#C84815] font-bold">25%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: '25%' }} />
                      </div>
                      <p className="text-[11px] text-[#5A5A6E]">Quality of operative clauses, realistic policy mechanisms, and UN formatting.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-semibold text-[#1A1A2E]">Foreign Policy Fidelity &amp; Research</span>
                        <span className="text-[#C84815] font-bold">25%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: '25%' }} />
                      </div>
                      <p className="text-[11px] text-[#5A5A6E]">Consistent representation of assigned state doctrine without breaking character.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-semibold text-[#1A1A2E]">Rules of Procedure &amp; Oratory</span>
                        <span className="text-[#C84815] font-bold">20%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: '20%' }} />
                      </div>
                      <p className="text-[11px] text-[#5A5A6E]">Mastery of formal motions, points of order, and persuasive floor speeches.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* GMC Track Rubric */}
              <div className="double-bezel">
                <div className="double-bezel-inner p-8 space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#00B4A6]/15 text-[#007A70] flex items-center justify-center">
                        <Scale className="w-4 h-4" />
                      </div>
                      <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
                        GMC Judicial Rubric
                      </h3>
                    </div>
                    <TrackBadge track="moot-cup" size="sm" />
                  </div>

                  <p className="text-xs text-[#5A5A6E] leading-relaxed">
                    Evaluated by appellate judges, senior advocates, and legal faculty based on oral advocacy and blind written memorials.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-semibold text-[#1A1A2E]">Written Memorials &amp; Authority Citations</span>
                        <span className="text-[#007A70] font-bold">30%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00B4A6] rounded-full" style={{ width: '30%' }} />
                      </div>
                      <p className="text-[11px] text-[#5A5A6E]">Double-blind scored analysis of treaties, ICJ precedents, and Bluebook citations.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-semibold text-[#1A1A2E]">Substantive Legal Reasoning</span>
                        <span className="text-[#007A70] font-bold">25%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00B4A6] rounded-full" style={{ width: '25%' }} />
                      </div>
                      <p className="text-[11px] text-[#5A5A6E]">Soundness of statutory interpretation, logical structure, and legal doctrine application.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-semibold text-[#1A1A2E]">Bench Question Responsiveness</span>
                        <span className="text-[#007A70] font-bold">25%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00B4A6] rounded-full" style={{ width: '25%' }} />
                      </div>
                      <p className="text-[11px] text-[#5A5A6E]">Direct answers to probing questions from judges without dodging or hesitation.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-semibold text-[#1A1A2E]">Court Demeanor &amp; Rebuttal Agility</span>
                        <span className="text-[#007A70] font-bold">20%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00B4A6] rounded-full" style={{ width: '20%' }} />
                      </div>
                      <p className="text-[11px] text-[#5A5A6E]">Respectful courtroom etiquette, poise under intense judicial scrutiny, and sur-rebuttals.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hall of Fame Distinction & Previous Laureates */}
          <section className="space-y-4">
            <h3 className="text-xl font-heading font-bold text-[#1A1A2E]">
              The Conclave Laureate Registry
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
              Upon conclusion of the 2027 edition, full names of winning advocates, best delegates, honorable mentions, and university delegations will be permanently archived in the institutional registry accessible on this page.
            </p>
          </section>
        </section>
      ) : (
        /* CONDITIONAL RENDERING: POST-EVENT / PUBLISHED STATE */
        <section className="space-y-8">
          {organizerPreview && !resultsPublished && (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-mono text-indigo-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>
                  <strong>Organizer Preview Active:</strong> Rendering data from <code>content/results.json</code>. Set <code>&quot;resultsPublished&quot;: true</code> in <code>content/site.json</code> to publish permanently.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOrganizerPreview(false)}
                className="underline hover:text-indigo-700 font-semibold"
              >
                Close Preview
              </button>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-100">
            <FilterBar
              options={filterOptions}
              activeValue={selectedTrack}
              onChange={setSelectedTrack}
            />
            <div className="w-full md:w-80">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search award, winner, or university..."
              />
            </div>
          </div>

          {/* Awardees Roster */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#5A5A6E] pb-2">
              <span>Official Award Registry ({filtered.length})</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified by Directorate of Academics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, idx) => (
                <ScrollReveal key={item.id} delay={idx * 0.05}>
                  <div className="double-bezel h-full">
                    <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4 border-t-4 border-t-[#1E2A78]">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <TrackBadge track={item.track as Track} size="sm" />
                          <span className="text-[11px] font-mono text-[#5A5A6E]">
                            Edition 2027
                          </span>
                        </div>

                        <div>
                          <span className="text-xs font-mono uppercase text-[#5A5A6E] block mb-1">
                            {item.categoryOrCommittee}
                          </span>
                          <h3 className="text-lg font-heading font-bold text-[#1A1A2E] leading-snug">
                            {item.awardName}
                          </h3>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 space-y-1">
                        <div className="font-heading font-bold text-base text-[#1E2A78]">
                          {item.winnerName}
                        </div>
                        <div className="text-xs text-[#5A5A6E]">
                          {item.institution}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {filtered.length === 0 && (
              <EmptyState
                title="No Results Found"
                description={`No awards match "${searchQuery}". Try clearing the search or switching tracks.`}
                actionLabel="Reset Search"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedTrack('all');
                }}
              />
            )}
          </div>
        </section>
      )}

      {/* Adjudication Standards Note */}
      <section className="pt-8">
        <div className="p-8 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
              Merit Adjudication &amp; Score Verifications
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
              All committee awards are graded according to international HMUN rubrics, while GMC awards are determined by cumulative blind memorial scoring and oral bench ballots.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" href="/about/faq">
              Award FAQ
            </Button>
            <Button variant="primary" href="/register">
              Apply for 2027
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
