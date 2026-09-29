'use client';

import { useSiteConfig } from '@/components/SiteConfigProvider';

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
  Calendar,
} from 'lucide-react';
import type { ResultAward, Track } from '@/lib/types';
import { getEventYear } from '@/lib/site-config';
import { HelpCallout } from '@/components/ui/HelpCallout';

interface ResultsClientProps {
  initialResults: ResultAward[];
  resultsPublished?: boolean;
  eventEndDate: string;
}

export function ResultsClient({
  initialResults,
  resultsPublished = false,
}: ResultsClientProps) {
  const site = useSiteConfig();
  const eventYear = getEventYear(site);
  const galaDate = site.galaDate ? new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(new Date(`${site.galaDate}T12:00:00+05:00`)) : 'date to be confirmed';
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isDisplayingResults = resultsPublished;

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
        <div className="rounded-2xl bg-elevated border border-champagne-lo/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-champagne-hi shadow-xl">
          <div className="flex items-center gap-2.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-champagne shrink-0" />
            <span>
              <strong>Pre-Event Adjudication State:</strong> Results are scheduled for promulgation at the Grand Awards Gala ({galaDate}).
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-champagne/20 border border-line-2 text-text">
          <Trophy className="w-3.5 h-3.5 text-champagne" />
          <span>
            {isDisplayingResults ? 'Official Hall of Fame & Accolades' : 'Conclave Honors & Adjudication Framework'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-medium text-text tracking-tight">
          {isDisplayingResults ? 'Results & Awardees' : 'Awards, Honors & Adjudication'}
        </h1>
        <p className="text-sm sm:text-base text-text-2 leading-relaxed">
          {isDisplayingResults
            ? 'Celebrating outstanding parliamentary diplomacy, rigorous legal scholarship, and persuasive advocacy across GIKI Model United Nations and GIKI Moot Court.'
            : `Official adjudication criteria, flagship awards prospectus, and promulgation protocols for GIMUN and GMC ${eventYear}.`}
        </p>
      </header>

      {/* Flagship Trophies Banner (Common to both states) */}
      <section>
        <ScrollReveal>
          <div className="rounded-3xl bg-overlay/95 text-text p-8 sm:p-10 border border-line shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-text-2 font-bold">
                    Supreme Conclave Honors
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-medium text-text">
                    {eventYear} Main awards
                  </h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-champagne/20 text-text text-xs font-mono font-bold self-start sm:self-auto flex items-center gap-1.5 border border-line-2">
                  <Sparkles className="w-3.5 h-3.5 text-champagne" />
                  {isDisplayingResults ? 'Promulgated on Merit' : 'Adjudicated on Pure Merit'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-6 rounded-2xl bg-elevated border border-line space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-champagne/20 text-champagne flex items-center justify-center border border-line-2">
                    <Crown className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-medium text-lg text-text">
                    Best delegation
                  </h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Awarded to the overall highest-performing institutional delegation accumulating points across all UN committee chambers.
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-champagne">
                    Highest Institutional Honor
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-elevated border border-line space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-gimun-fill text-on-gimun flex items-center justify-center border border-line-2">
                    <Medal className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-medium text-lg text-text">
                    Best delegate
                  </h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Conferred by committee Dais panels for exceptional resolution drafting, unmoderated caucusing, and sovereign policy defense.
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-champagne">
                    Chamber Diplomatic Supremacy
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-elevated border border-line space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-champagne/20 text-champagne flex items-center justify-center border border-line-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-medium text-lg text-text">
                    Winning team
                  </h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Awarded to the Grand Final winning legal team following intense appellate advocacy before the High Court judicial panel.
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-champagne">
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
            <div className="double-bezel-inner p-8 sm:p-10 space-y-6 border-l-4 border-l-champagne">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-champagne">
                    <Clock className="w-4 h-4 text-champagne" />
                    <span>Official Announcement Protocol</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-medium text-text">
                    Published after the awards ceremony
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-overlay/80 border border-line-2 text-text font-mono text-xs font-semibold shrink-0">
                  <Calendar className="w-4 h-4 text-champagne" />
                  <span>{galaDate}</span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-text-2 leading-relaxed max-w-4xl">
                In strict adherence to academic rigor and blind tabulation security, awards are announced at the Closing Ceremony and Awards Gala on Day 3 of the conference and published here afterwards. Scores are tabulated by the academic team and checked before release.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-overlay/80 border border-line space-y-1.5">
                  <span className="text-xs font-mono text-text-3 uppercase">Stage 1</span>
                  <div className="font-display font-medium text-sm text-text">Session Scoring</div>
                  <p className="text-xs text-text-2">Committee Dais &amp; Bench scoring completed after final sessions.</p>
                </div>
                <div className="p-4 rounded-xl bg-overlay/80 border border-line space-y-1.5">
                  <span className="text-xs font-mono text-text-3 uppercase">Stage 2</span>
                  <div className="font-display font-medium text-sm text-text">Blind Audit</div>
                  <p className="text-xs text-text-2">Discrepancy review and delegation point aggregation by Secretariat.</p>
                </div>
                <div className="p-4 rounded-xl bg-overlay/80 border border-line space-y-1.5">
                  <span className="text-xs font-mono text-text-3 uppercase">Stage 3</span>
                  <div className="font-display font-medium text-sm text-text">Gala Conferral</div>
                  <p className="text-xs text-text-2">Live physical ceremony and trophy distribution in Main Auditorium.</p>
                </div>
                <div className="p-4 rounded-xl bg-overlay/80 border border-line space-y-1.5">
                  <span className="text-xs font-mono text-text-3 uppercase">Stage 4</span>
                  <div className="font-display font-medium text-sm text-text">Digital Registry</div>
                  <p className="text-xs text-text-2">Instant publication of all awardees on this portal with verification IDs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Adjudication Criteria & Rubrics Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-text-2 font-bold">
                Evaluation Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-medium text-text">
                How winners are chosen
              </h2>
              <p className="text-sm text-text-2">
                All awards across both tracks are adjudicated by specialized panels based on transparent, pre-published criteria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* GIMUN Track Rubric */}
              <div className="double-bezel">
                <div className="double-bezel-inner p-8 space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gimun-fill text-on-gimun border border-line-2 flex items-center justify-center">
                        <Globe2 className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-medium text-xl text-text">
                        GIMUN scoring
                      </h3>
                    </div>
                    <TrackBadge track="gimun" size="sm" />
                  </div>

                  <p className="text-xs text-text-2 leading-relaxed">
                    Evaluated continuously across all committee sessions by Dais chairs using the published event rubric.
                  </p>

<div className="space-y-4">{site.gimunRubric?.length?site.gimunRubric.map(r=><p key={r.label}>{r.label}: {r.weight}%</p>):<p>Scoring weights will be published after organizer approval.</p>}</div>
                </div>
              </div>

              {/* GMC Track Rubric */}
              <div className="double-bezel">
                <div className="double-bezel-inner p-8 space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gimun-fill text-on-gimun flex items-center justify-center border border-line-2">
                        <Scale className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-medium text-xl text-text">
                        Moot Court scoring
                      </h3>
                    </div>
                    <TrackBadge track="moot-cup" size="sm" />
                  </div>

                  <p className="text-xs text-text-2 leading-relaxed">
                    Evaluated by appellate judges, senior advocates, and legal faculty based on oral advocacy and blind written memorials.
                  </p>

<div className="space-y-4">{site.mootScoring?<><p>Written memorial: {site.mootScoring.memorialWeight}%</p><p>Oral advocacy: {site.mootScoring.oralWeight}%</p><p>Citation standard: {site.mootScoring.citationStyle}</p></>:<p>Scoring weights and citation standard will be published after organizer approval.</p>}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Hall of Fame Distinction & Previous Laureates */}
          <section className="space-y-4">
            <h3 className="text-xl font-display font-medium text-text">
              Award winners
            </h3>
            <p className="text-xs sm:text-sm text-text-2 leading-relaxed">
              Upon conclusion of the {eventYear} edition, full names of winning advocates, best delegates, honorable mentions, and university delegations will be permanently archived in the institutional registry accessible on this page.
            </p>
          </section>
        </section>
      ) : (
        /* CONDITIONAL RENDERING: POST-EVENT / PUBLISHED STATE */
        <section className="space-y-8">
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-line">
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
            <div className="flex items-center justify-between text-xs font-mono text-text-3 pb-2">
              <span>Official Award Registry ({filtered.length})</span>
              <span className="flex items-center gap-1.5 text-champagne font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-champagne" />
                Verified by Directorate of Academics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, idx) => (
                <ScrollReveal key={item.id} delay={idx * 0.05}>
                  <div className="double-bezel h-full">
                    <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4 border-t-4 border-t-champagne">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <TrackBadge track={item.track as Track} size="sm" />
                          <span className="text-[11px] font-mono text-text-3">
                            Edition {eventYear}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs font-mono uppercase text-text-3 block mb-1">
                            {item.categoryOrCommittee}
                          </span>
                          <h3 className="text-lg font-display font-medium text-text leading-snug">
                            {item.awardName}
                          </h3>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-line space-y-1">
                        <div className="font-display font-medium text-base text-champagne">
                          {item.winnerName}
                        </div>
                        <div className="text-xs text-text-2">
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

      <HelpCallout
        className="mt-8"
        question="Question about how an award was scored?"
        actions={[{ label: 'Award FAQ', href: '/about/faq' }]}
      />
    </div>
  );
}
