'use client';

import { useSiteConfig } from '@frontend/components/SiteConfigProvider';

import React, { useState } from 'react';
import { TrackBadge } from '@frontend/components/ui/TrackBadge';
import { SearchInput } from '@frontend/components/ui/SearchInput';
import { FilterBar } from '@frontend/components/ui/FilterBar';
import { ScrollReveal } from '@frontend/components/ui/ScrollReveal';
import { EmptyState } from '@frontend/components/ui/EmptyState';
import { ShieldCheck } from 'lucide-react';
import type { ResultAward, Track } from '@shared/lib/types';
import { getEventYear } from '@shared/lib/site-config';
import { HelpCallout } from '@frontend/components/ui/HelpCallout';
import { fill, type Copy } from '@shared/lib/copy';

interface ResultsClientProps {
  initialResults: ResultAward[];
  resultsPublished?: boolean;
  eventEndDate: string;
  /** The main award definitions (track in `meta`). */
  awards: Copy;
  /** How winners are chosen; items are the GIMUN and GMC explanations. */
  criteria: Copy;
}

export function ResultsClient({
  initialResults,
  resultsPublished = false,
  awards,
  criteria,
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

  const vars = { year: eventYear };
  const mainAwards = (awards.items ?? []).map((item) => ({ title: fill(item.title, vars), track: fill(item.meta, vars), body: fill(item.body, vars) }));
  const [gimunCriteria, mootCriteria] = criteria.items ?? [];

  // Once published, the winners of the main awards stand on a podium: the
  // first main award in the centre, raised, the next two beside it.
  const headline = mainAwards
    .map((award) => ({ award, result: initialResults.find((r) => r.awardName.toLowerCase().includes(award.title.toLowerCase())) }))
    .filter((entry): entry is { award: (typeof mainAwards)[number]; result: ResultAward } => Boolean(entry.result))
    .slice(0, 3);
  const podium = headline.length >= 2 ? [headline[1], headline[0], headline[2]].filter(Boolean) : [];

  return (
    <div className="space-y-16">
      {!resultsPublished && (
        <p className="flex items-center gap-2.5 rounded-2xl border border-line bg-raised px-5 py-4 text-sm text-text-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
          <span>
            <strong className="font-medium text-text">Not yet announced.</strong> Winners are announced at the awards gala on {galaDate}.
          </span>
        </p>
      )}

      {!awards.hidden && (
      <section className="space-y-6" aria-labelledby="main-awards-title">
        <h2 id="main-awards-title" className="font-display text-2xl font-medium text-text sm:text-3xl">
          {fill(awards.title, vars)}
        </h2>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {mainAwards.map((award, index) => (
            <li key={award.title} className="flex flex-col gap-3 bg-raised p-6 sm:p-7">
              <span className="flex items-center justify-between font-mono text-xs text-text-3">
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span>{award.track}</span>
              </span>
              <h3 className="font-display text-lg font-medium text-text">{award.title}</h3>
              <p className="text-sm leading-relaxed text-text-2">{award.body}</p>
            </li>
          ))}
        </ol>
      </section>
      )}

      {!isDisplayingResults ? (
        <section className="space-y-12">
          <section className="space-y-6" aria-labelledby="criteria-title">
            <div className="max-w-2xl space-y-2">
              <h2 id="criteria-title" className="font-display text-2xl font-medium text-text sm:text-3xl">
                {fill(criteria.title, vars)}
              </h2>
              <p className="text-base leading-relaxed text-text-2">{fill(criteria.lead, vars)}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-line bg-raised p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-medium text-text">GIMUN</h3>
                  <TrackBadge track="gimun" size="sm" />
                </div>
                <p className="text-sm leading-relaxed text-text-2">{fill(gimunCriteria?.body, vars)}</p>
                {site.gimunRubric?.length ? (
                  <dl className="divide-y divide-line border-t border-line text-sm">
                    {site.gimunRubric.map((r) => (
                      <div key={r.label} className="flex justify-between gap-4 py-2.5">
                        <dt className="text-text-2">{r.label}</dt>
                        <dd className="font-mono tabular-nums text-text">{r.weight}%</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="border-t border-line pt-4 text-sm text-text-3">Scoring weights will be published after organizer approval.</p>
                )}
              </div>

              <div className="space-y-4 rounded-2xl border border-line bg-raised p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-medium text-text">GIKI Moot Court</h3>
                  <TrackBadge track="moot-cup" size="sm" />
                </div>
                <p className="text-sm leading-relaxed text-text-2">{fill(mootCriteria?.body, vars)}</p>
                {site.mootScoring ? (
                  <dl className="divide-y divide-line border-t border-line text-sm">
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-text-2">Written memorial</dt>
                      <dd className="font-mono tabular-nums text-text">{site.mootScoring.memorialWeight}%</dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-text-2">Oral advocacy</dt>
                      <dd className="font-mono tabular-nums text-text">{site.mootScoring.oralWeight}%</dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-text-2">Citation standard</dt>
                      <dd className="text-right text-text">{site.mootScoring.citationStyle}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="border-t border-line pt-4 text-sm text-text-3">Scoring weights and citation standard will be published after organizer approval.</p>
                )}
              </div>
            </div>
          </section>
        </section>
      ) : (
        /* CONDITIONAL RENDERING: POST-EVENT / PUBLISHED STATE */
        <section className="space-y-8">
          {podium.length > 0 && selectedTrack === 'all' && !searchQuery && (
            <ol className="podium" aria-label="Main award winners">
              {podium.map(({ award, result }) => (
                <li key={result.id} className="podium__step" data-place={award === headline[0].award ? 'first' : undefined}>
                  <span className="podium__award">{award.title}</span>
                  <span className="podium__winner">{result.winnerName}</span>
                  <span className="podium__institution">{result.institution}</span>
                  <span className="podium__track">{award.track}</span>
                </li>
              ))}
            </ol>
          )}
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
            <p className="pb-2 font-mono text-xs text-text-3">
              {filtered.length} award winners
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, idx) => (
                <ScrollReveal key={item.id} delay={idx * 0.05}>
                  <div className="double-bezel h-full" data-live-key={`result-${item.id}`}>
                    <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
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
