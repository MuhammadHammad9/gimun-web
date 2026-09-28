import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Gavel, Globe2, CalendarDays, FileText } from 'lucide-react';

import { PageHero } from '@/components/ui/PageHero';
import { SectionRail } from '@/components/ui/SectionRail';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { Timeline, type TimelinePhase } from '@/components/ui/Timeline';
import { CtaBanner } from '@/components/ui/CtaBanner';
import { SponsorStrip } from '@/components/ui/SponsorStrip';
import { CountdownChip } from '@/components/ui/CountdownChip';
import { TrackBadge } from '@/components/ui/TrackBadge';

import { canRegister as canTrackRegister, eventPhase } from '@/lib/phase';
import { formatDateRange } from '@/lib/utils';
import {
  formatEventDate,
  formatPublishedDate,
  getEventYear,
  isRegistrationDeadlinePassed,
} from '@/lib/site-config';
import { constructMetadata } from '@/lib/metadata';
import {
  getSiteConfig,
  getCommittees,
  getProblemCategories,
  getAnnouncements,
  getSponsors,
  getDocuments,
} from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `GIMUN & GMC ${getEventYear(await getSiteConfig())} | Where Diplomacy Meets the Courtroom`,
    path: '/',
    description:
      'Two flagship collegiate student competitions. One unified digital home at Ghulam Ishaq Khan Institute (GIKI), Topi. Model United Nations diplomacy meets appellate moot court advocacy.',
  });
}

const RAIL = [
  { id: 'gimun', label: 'GIMUN', icon: <Globe2 aria-hidden="true" className="h-3.5 w-3.5" /> },
  { id: 'gmc', label: 'Moot Court', icon: <Gavel aria-hidden="true" className="h-3.5 w-3.5" /> },
  { id: 'roadmap', label: 'Roadmap', icon: <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" /> },
  { id: 'prepare', label: 'Prepare', icon: <FileText aria-hidden="true" className="h-3.5 w-3.5" /> },
];

export default async function Home() {
  const siteConfig = await getSiteConfig();
  const committees = await getCommittees();
  const mootCategories = await getProblemCategories();
  const announcements = await getAnnouncements();
  const sponsors = await getSponsors();
  const documents = await getDocuments();

  const phase = eventPhase(siteConfig);
  const canRegister = (track: 'gimun' | 'mootCup') => canTrackRegister(siteConfig, track);

  // The masthead backdrop is built from the real allocation roster, so it is
  // accurate rather than decorative filler. Interleaving chambers keeps
  // adjacent placards from all reading as one committee.
  const placards = committees
    .flatMap((com) =>
      (com.countryList ?? []).map((entry) => ({
        name: entry.country,
        chamber: com.slug.toUpperCase(),
      }))
    )
    .filter((p, i, all) => all.findIndex((o) => o.name === p.name) === i)
    .sort((a, b) => a.name.localeCompare(b.name));

  const latestAnnouncement = announcements[0];
  const latestResourceDate = documents.reduce<string | undefined>((latest, doc) => {
    if (!latest || doc.versionDate > latest) return doc.versionDate;
    return latest;
  }, undefined);

  const gimunAction = {
    label: canRegister('gimun')
      ? 'Register for GIMUN'
      : phase === 'results'
        ? 'View results'
        : 'Explore GIMUN',
    href: canRegister('gimun')
      ? '/register?track=gimun'
      : phase === 'results'
        ? '/results'
        : '/gimun',
    variant: 'track-gimun' as const,
  };

  const mootAction = {
    label: canRegister('mootCup')
      ? 'Register for GMC'
      : phase === 'event-live'
        ? 'View schedule'
        : 'Explore GMC',
    href: canRegister('mootCup')
      ? '/register?track=moot-cup'
      : phase === 'event-live'
        ? '/schedule'
        : '/moot-cup',
    variant: 'track-moot' as const,
  };

  // Every status is derived from the calendar, not assumed: before launch the
  // registration phase is upcoming, not complete, and each later phase flips
  // only once its own date has passed.
  const shortDate = (iso: string) => formatEventDate(iso, { month: 'short' });
  const eventStarted = phase === 'event-live' || phase === 'results' || phase === 'archived';
  const eventEnded = phase === 'results' || phase === 'archived';
  const memorialPassed = siteConfig.memorialDeadline
    ? isRegistrationDeadlinePassed(siteConfig.memorialDeadline)
    : false;

  const phases: TimelinePhase[] = [
    {
      step: 'Phase 01',
      title: phase === 'registration-open' ? 'Registration open' : 'Registration',
      date: `GIMUN closes ${shortDate(siteConfig.registrationDeadlines.gimun)} · GMC closes ${shortDate(siteConfig.registrationDeadlines.mootCup)}`,
      description:
        'See the registration page for current availability, fees and requirements.',
      status:
        phase === 'registration-open' ? 'active' : phase === 'pre-launch' ? 'upcoming' : 'complete',
    },
    {
      step: 'Phase 02',
      title: 'Guides & case problem',
      date: latestResourceDate
        ? `Revised ${shortDate(latestResourceDate)}`
        : 'Pending publication',
      description:
        'Background guides, case problems and rules are published in the Resource Hub.',
      status: eventStarted ? 'complete' : documents.length > 0 ? 'active' : 'upcoming',
    },
    {
      step: 'Phase 03',
      title: 'Written memorials',
      date: siteConfig.memorialDeadline
        ? `Due ${shortDate(siteConfig.memorialDeadline)}`
        : 'Deadline to be confirmed',
      description:
        'Final electronic submission deadline for all Moot Court written arguments.',
      status: memorialPassed || eventStarted ? 'complete' : 'upcoming',
    },
    {
      step: 'Phase 04',
      title: 'Conference days',
      date: formatDateRange(siteConfig.eventDates.start, siteConfig.eventDates.end),
      description: 'Check-in, opening ceremony, committee sessions and the Grand Final.',
      status: eventEnded ? 'complete' : phase === 'event-live' ? 'active' : 'upcoming',
    },
  ];

  return (
    <div>
      {/* ---------------------------------------------------------- masthead */}
      <PageHero
        variant="home"
        size="display"
        align="center"
        mosaic={placards}
        title="Where diplomacy meets the courtroom."
        accentWords={['courtroom.']}
        description="Two student competitions on one campus. Represent a nation in committee, or argue a case before a bench of judges, at GIK Institute in Topi."
        bullets={[
          'Four UN chambers and three appellate problem categories',
          'Merit-based allocation, reviewed by the Secretariat and the Bench',
          'Enter on your own or as a university delegation',
        ]}
        eyebrow={
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-void/60 px-3.5 py-1.5 font-mono text-xs text-text-2 backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-crimson"
              />
              {formatDateRange(siteConfig.eventDates.start, siteConfig.eventDates.end)}
              <span className="text-text-4">·</span>
              {siteConfig.venue?.split(',')[0] || 'GIKI Campus'}
            </span>
            <CountdownChip
              startDate={siteConfig.eventDates.start}
              endDate={siteConfig.eventDates.end}
            />
          </div>
        }
        actions={[gimunAction, mootAction]}
      />

      {/* ------------------------------------------------------ partner band */}
      <section className="band-raised py-12">
        <h2 className="px-4 text-center font-mono text-meta uppercase tracking-[0.14em] text-text-4">
          Institutional &amp; corporate partners
        </h2>
        <div className="mt-8">
          <SponsorStrip sponsors={sponsors} />
        </div>
      </section>

      {/* ------------------------------------------------- stacked programmes */}
      <div className="band">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-10 text-center sm:px-6 md:pt-28">
          <h2 className="text-h2 font-display font-medium text-balance text-text">
            Which one are you here for?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lead text-text-3">
            The two tracks run in parallel over the same four days. Pick the one you want
            to be tested in — the rules, the preparation and the judging differ entirely.
          </p>
        </div>

        <SectionRail items={RAIL} />

        {/* ---- GIMUN ---- */}
        <section
          id="gimun"
          aria-labelledby="gimun-heading"
          className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-16 pb-8 sm:px-6 lg:px-8"
        >
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl space-y-3">
              <TrackBadge track="gimun" />
              <h3 id="gimun-heading" className="text-h2 font-display font-medium text-text">
                Model United Nations
              </h3>
              <p className="text-lead text-text-3">
                {committees.length} chambers running standard parliamentary procedure, from
                general assembly debate to live crisis.
              </p>
            </div>
            <Link
              href="/gimun/committees"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-champagne transition-colors hover:text-text"
            >
              All committees
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {/* Asymmetric: the lead chamber takes two columns, the rest follow. */}
          <div className="rise-stagger grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
            {committees.slice(0, 4).map((com, i) => (
              <div
                key={com.id}
                style={{ '--i': i } as React.CSSProperties}
                className={i === 0 ? 'lg:col-span-4' : 'lg:col-span-2'}
              >
                <FeatureCard
                  track="gimun"
                  icon={<Globe2 aria-hidden="true" className="h-4 w-4" />}
                  label={`${com.name}.`}
                  description={com.shortDescription}
                  href={`/gimun/committees/${com.slug}`}
                  facts={[
                    {
                      term: 'Delegates',
                      value: com.capacity ? String(com.capacity) : 'Open',
                    },
                    { term: 'Format', value: com.type.replace(/-/g, ' ') },
                  ]}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ---- GMC ---- */}
        <section
          id="gmc"
          aria-labelledby="gmc-heading"
          className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-16 pb-8 sm:px-6 lg:px-8"
        >
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl space-y-3">
              <TrackBadge track="moot-cup" />
              <h3 id="gmc-heading" className="text-h2 font-display font-medium text-text">
                GIKI Moot Court
              </h3>
              <p className="text-lead text-text-3">
                {mootCategories.length} problem categories. Draft memorials for both sides,
                then defend them against a bench that will interrupt you on the law.
              </p>
            </div>
            <Link
              href="/moot-cup/categories"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-champagne transition-colors hover:text-text"
            >
              All categories
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="rise-stagger grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
            {mootCategories.slice(0, 3).map((cat, i) => (
              <div
                key={cat.id}
                style={{ '--i': i } as React.CSSProperties}
                className={i === 2 ? 'lg:col-span-4' : 'lg:col-span-2'}
              >
                <FeatureCard
                  track="moot-cup"
                  icon={<Gavel aria-hidden="true" className="h-4 w-4" />}
                  label={`${cat.name}.`}
                  description={cat.description}
                  href="/moot-cup/categories"
                  facts={[
                    { term: 'Area of law', value: cat.areaOfLaw },
                    { term: 'Revised', value: formatPublishedDate(cat.lastUpdated) },
                  ]}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ---- Roadmap ---- */}
        <section
          id="roadmap"
          aria-labelledby="roadmap-heading"
          className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-16 pb-8 sm:px-6 lg:px-8"
        >
          <div className="mb-10 max-w-xl space-y-3">
            <span className="font-mono text-meta uppercase tracking-[0.14em] text-champagne">
              Official roadmap
            </span>
            <h3 id="roadmap-heading" className="text-h2 font-display font-medium text-text">
              Key dates and deadlines
            </h3>
          </div>
          <Timeline phases={phases} />
        </section>

        {/* ---- Prepare ---- */}
        <section
          id="prepare"
          aria-labelledby="prepare-heading"
          className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-16 pb-24 sm:px-6 lg:px-8"
        >
          <div className="mb-10 max-w-xl space-y-3">
            <span className="font-mono text-meta uppercase tracking-[0.14em] text-champagne">
              Before you arrive
            </span>
            <h3 id="prepare-heading" className="text-h2 font-display font-medium text-text">
              What to read first
            </h3>
          </div>

          <div className="rise-stagger grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div style={{ '--i': 0 } as React.CSSProperties}>
              <FeatureCard
                icon={<FileText aria-hidden="true" className="h-4 w-4" />}
                label="Resource hub."
                description="Background guides, the case problem, rules of procedure and the delegate handbook, all versioned."
                href="/resources"
              />
            </div>
            <div style={{ '--i': 1 } as React.CSSProperties}>
              <FeatureCard
                icon={<CalendarDays aria-hidden="true" className="h-4 w-4" />}
                label="Day-by-day schedule."
                description="Session times, chamber allocations and ceremony slots across all four conference days."
                href="/schedule"
              />
            </div>
            <div style={{ '--i': 2 } as React.CSSProperties}>
              <FeatureCard
                icon={<Globe2 aria-hidden="true" className="h-4 w-4" />}
                label="Venue and travel."
                description="Getting to GIKI, on-campus accommodation, and what to bring for four days in Topi."
                href="/about/venue"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------ notice */}
      {latestAnnouncement && (
        <section className="band-raised py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="surface flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-2xl space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-crimson/30 bg-crimson/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-crimson-soft">
                    Notice
                  </span>
                  <span className="font-mono text-xs text-text-4">
                    {formatPublishedDate(latestAnnouncement.timestamp)}
                  </span>
                </div>
                <p className="text-body text-text-3">
                  <span className="font-semibold text-text">
                    {latestAnnouncement.title}
                  </span>{' '}
                  {latestAnnouncement.body}
                </p>
              </div>
              <Link
                href="/announcements"
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-line-2 px-5 py-2.5 text-sm font-medium text-champagne transition-colors hover:border-line-3 hover:bg-champagne/5"
              >
                All announcements
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------------- CTA */}
      <section className="band mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <CtaBanner
          eyebrow={phase === 'registration-open' ? 'Registration open' : undefined}
          title="Reserve your place at GIKI's diplomatic and legal gathering"
          description="Submitting the form reserves a delegate dossier or team application for review. It does not charge you."
          footnote="No online payment is collected at any stage"
          actions={[gimunAction, mootAction, { label: 'Read the handbook', href: '/resources', variant: 'secondary' }]}
        />
      </section>
    </div>
  );
}
