import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ChevronRight } from 'lucide-react';

import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ContentCard } from '@/components/ui/ContentCard';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { PublishedStats } from '@/components/ui/PublishedStats';
import { eventPhase } from '@/lib/phase';
import { isRegistrationDeadlinePassed } from '@/lib/site-config';
import { Timeline, type TimelinePhase } from '@/components/ui/Timeline';
import { CtaBanner } from '@/components/ui/CtaBanner';
import { SponsorStrip } from '@/components/ui/SponsorStrip';
import { CountdownChip } from '@/components/ui/CountdownChip';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TrackBadge } from '@/components/ui/TrackBadge';

import { formatDateRange } from '@/lib/utils';
import { formatEventDate, formatPublishedDate, getEventYear } from '@/lib/site-config';
import { constructMetadata } from '@/lib/metadata';
import {
  getSiteConfig,
  getCommittees,
  getProblemCategories,
  getAnnouncements,
  getSponsors,
  getDocuments,
} from '@/lib/content';

/**
 * The pinned two-track sequence is the heaviest thing on the page and sits
 * entirely below the fold, so it is split out of the initial bundle. Keeping
 * GSAP off the critical path is what protects the homepage LCP budget.
 */
const TrackSplit = dynamic(
  () => import('@/components/home/TrackSplit').then((m) => m.TrackSplit),
  { loading: () => <div className="min-h-[60vh]" /> }
);

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `GIMUN & GMC ${getEventYear(await getSiteConfig())} | Where Diplomacy Meets the Courtroom`,
    path: '/',
    description:
      'Two flagship collegiate student competitions. One unified digital home at Ghulam Ishaq Khan Institute (GIKI), Topi. Model United Nations diplomacy meets appellate moot court advocacy.',
  });
}

export default async function Home() {
  const siteConfig = await getSiteConfig();
  const committees = await getCommittees();
  const mootCategories = await getProblemCategories();
  const announcements = await getAnnouncements();
  const sponsors = await getSponsors();
  const documents = await getDocuments();

  const phase=eventPhase(siteConfig);
  const canRegister=(track:'gimun'|'mootCup')=>phase==='registration-open' && siteConfig.registrationStatus[track==='gimun'?'gimunOpen':'mootCupOpen'] && !isRegistrationDeadlinePassed(siteConfig.registrationDeadlines[track]);
  const latestAnnouncement = announcements[0];
  const latestResourceDate = documents.reduce<string | undefined>((latest, doc) => {
    if (!latest || doc.versionDate > latest) return doc.versionDate;
    return latest;
  }, undefined);

  const phases: TimelinePhase[] = [
    {
      step: 'Phase 01',
      title: phase==='registration-open'?'Registration open':'Registration',
      date: `Closes ${formatEventDate(siteConfig.registrationDeadlines.gimun, { month: 'short' })}`,
      description:
        'See the registration page for current availability, fees and requirements.',
      status: phase==='registration-open'?'active':'complete',
    },
    {
      step: 'Phase 02',
      title: 'Guides & Case Problem',
      date: latestResourceDate
        ? `Revised ${formatEventDate(latestResourceDate, { month: 'short' })}`
        : 'Pending publication',
      description:
        'Background guides, case problems and rules are published in the Resource Hub.',
      status: 'upcoming',
    },
    {
      step: 'Phase 03',
      title: 'Written Memorials',
      date: siteConfig.memorialDeadline?`Due ${formatEventDate(siteConfig.memorialDeadline, { month: 'short' })}`:'Deadline to be confirmed',
      description:
        'Final electronic submission deadline for all Moot Court written arguments.',
      status: 'upcoming',
    },
    {
      step: 'Phase 04',
      title: 'Conference Days',
      date: formatDateRange(siteConfig.eventDates.start, siteConfig.eventDates.end),
      description: 'Check-in, opening ceremony, committee sessions and the Grand Final.',
      status: 'upcoming',
    },
  ];

  return (
    <div className="pb-24">
      {/* 1 — Masthead */}
      <PageHero
        variant="home"
        size="display"
        title="Where Diplomacy Meets the Courtroom."
        accentWords={['Diplomacy', 'Courtroom.']}
        description="Two student competitions, one campus. Represent a nation at Model UN (GIMUN) or argue a legal case before a panel of judges at the Moot Court (GMC) — hosted at GIK Institute, Topi."
        eyebrow={
          <div className="inline-flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-text shadow-xs">
              <span
                aria-hidden="true"
                className="h-2 w-2 animate-pulse rounded-full bg-crimson"
              />
              <span>
                {formatDateRange(siteConfig.eventDates.start, siteConfig.eventDates.end)} •{' '}
                {siteConfig.venue?.split(',')[0] || 'GIKI Campus'}
              </span>
            </div>
            <CountdownChip
              startDate={siteConfig.eventDates.start}
              endDate={siteConfig.eventDates.end}
            />
          </div>
        }
        actions={[
          { label: canRegister('gimun')?'Register for GIMUN':phase==='results'?'View results':'Explore GIMUN', href: canRegister('gimun')?'/register?track=gimun':phase==='results'?'/results':'/gimun', variant: 'track-gimun' },
          { label: canRegister('mootCup')?'Register for GMC':phase==='event-live'?'View schedule':'Explore GMC', href: canRegister('mootCup')?'/register?track=moot-cup':phase==='event-live'?'/schedule':'/moot-cup', variant: 'track-moot' },
        ]}
        aside={
          <div className="flex flex-col gap-4">
            <h2 className="sr-only">Dual championship tracks</h2>

            <SurfaceCard tone="elevated" track="gimun" className="gap-3">
              <div className="flex items-center justify-between">
                <TrackBadge track="gimun" />
                <span className="font-mono text-xs font-medium text-text-2">
                  {committees.length} UN Chambers
                </span>
              </div>
              <h3 className="text-lg font-bold text-text transition-colors group-hover:text-champagne">
                Model United Nations (GIMUN)
              </h3>
              <p className="text-sm leading-relaxed text-text-2">
                Simulate multilateral diplomacy, draft binding resolutions, and represent
                sovereign interests across crisis and general assembly organs.
              </p>
              <Link
                href="/gimun"
                className="group/link mt-1 inline-flex items-center gap-1.5 rounded text-xs font-semibold text-champagne hover:underline"
              >
                Explore GIMUN track
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5"
                />
              </Link>
            </SurfaceCard>

            <SurfaceCard tone="elevated" track="moot-cup" className="gap-3">
              <div className="flex items-center justify-between">
                <TrackBadge track="moot-cup" />
                <span className="font-mono text-xs font-medium text-text-2">
                  {mootCategories.length} Problem Tracks
                </span>
              </div>
              <h3 className="text-lg font-bold text-text transition-colors group-hover:text-champagne">
                GIKI Moot Court (GMC)
              </h3>
              <p className="text-sm leading-relaxed text-text-2">
                Rigorous appellate advocacy before panels of esteemed judges. Draft
                comprehensive memorials and present oral pleadings under pressure.
              </p>
              <Link
                href="/moot-cup"
                className="group/link mt-1 inline-flex items-center gap-1.5 rounded text-xs font-semibold text-champagne hover:underline"
              >
                Explore GMC track
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5"
                />
              </Link>
            </SurfaceCard>
          </div>
        }
      />

      {/* 2 — The two-track thesis, made literal */}
      <TrackSplit
        committeeCount={committees.length}
        categoryCount={mootCategories.length}
      />

      <div className="space-y-20 sm:space-y-28">
        {/* 3 — Substantive roster */}
        <section className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Substantive Roster"
            title="Committees & Problem Categories"
            actions={[
              { label: 'All committees', href: '/gimun/committees', track: 'gimun' },
              { label: 'All categories', href: '/moot-cup/categories', track: 'moot-cup' },
            ]}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {committees.slice(0, 2).map((com, i) => (
              <ScrollReveal key={com.id} delay={i * 0.08} variant="scale">
                <ContentCard
                  track="gimun"
                  title={com.name}
                  description={com.shortDescription}
                  meta={`${com.capacity ? `${com.capacity} Delegates` : 'Open'} • ${com.type.replace('-', ' ')}`}
                  actionHref={`/gimun/committees/${com.slug}`}
                  actionLabel="View committee dossier"
                />
              </ScrollReveal>
            ))}

            {mootCategories.slice(0, 1).map((cat) => (
              <ScrollReveal key={cat.id} delay={0.16} variant="scale">
                <ContentCard
                  track="moot-cup"
                  title={cat.name}
                  description={cat.description}
                  meta={`${cat.areaOfLaw} • Updated ${cat.lastUpdated}`}
                  actionHref="/moot-cup/categories"
                  actionLabel="Explore legal category"
                />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 4 — Latest official notice */}
        {latestAnnouncement && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="double-bezel">
                <div className="double-bezel-inner flex flex-col items-start justify-between gap-6 border-l-4 border-l-crimson p-6 sm:flex-row sm:items-center sm:p-8">
                  <div className="max-w-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-crimson/30 bg-crimson/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-crimson-soft">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 animate-ping rounded-full bg-crimson"
                        />
                        Notice
                      </span>
                      <span className="font-mono text-xs text-text-3">
                        {formatPublishedDate(latestAnnouncement.timestamp)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text">
                      {latestAnnouncement.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-2">
                      {latestAnnouncement.body}
                    </p>
                  </div>
                  <Link
                    href="/announcements"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-line-2 bg-raised px-5 py-2.5 text-xs font-medium text-champagne shadow-xs transition-colors hover:bg-champagne hover:text-canvas"
                  >
                    Announcements feed
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* 5 — Roadmap */}
        <section className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Official Roadmap"
            title="Key dates & critical deadlines"
            actions={[{ label: 'Full day-by-day schedule', href: '/schedule' }]}
          />
          <Timeline phases={phases} />
        </section>

        {/* 6 — Social proof */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">By the numbers</h2>
          <PublishedStats stats={siteConfig.stats}/>
        </section>

        {/* 7 — Partners */}
        <section className="space-y-4">
          <h2 className="text-center font-mono text-meta uppercase tracking-[0.14em] text-text-3">
            Institutional & corporate partners
          </h2>
          <SponsorStrip sponsors={sponsors} />
        </section>

        {/* 8 — Close */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <CtaBanner
            eyebrow="Registration is Open"
            title="Secure your place at GIKI's flagship diplomatic & legal gathering"
            description="Submitting the registration form reserves your delegate dossier or team application for Dais review."
            footnote="No online payment is collected at any stage"
            actions={[
              { label: canRegister('gimun')?'Register for GIMUN':phase==='results'?'View results':'Explore GIMUN', href: canRegister('gimun')?'/register?track=gimun':phase==='results'?'/results':'/gimun', variant: 'track-gimun' },
              { label: canRegister('mootCup')?'Register for GMC':phase==='event-live'?'View schedule':'Explore GMC', href: canRegister('mootCup')?'/register?track=moot-cup':phase==='event-live'?'/schedule':'/moot-cup', variant: 'track-moot' },
              { label: 'Download handbook', href: '/resources', variant: 'secondary' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
