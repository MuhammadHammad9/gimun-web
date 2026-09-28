import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight, Gavel, Globe2, CalendarDays, FileText } from 'lucide-react';

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
  getSiteUrl,
  isRegistrationDeadlinePassed,
} from '@/lib/site-config';
import { constructMetadata } from '@/lib/metadata';
import { feeAmount } from '@/lib/fees';
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

  const siteUrl = getSiteUrl();
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: siteConfig.eventNames.combined,
        url: siteUrl,
        email: siteConfig.contactEmails.general,
        sameAs: Object.values(siteConfig.socialLinks || {}).filter(Boolean),
      },
      ...(['gimun', 'mootCup'] as const).map((track) => ({
        '@type': 'Event',
        name: `${siteConfig.eventNames[track]} ${getEventYear(siteConfig)}`,
        startDate: siteConfig.eventDates.start,
        endDate: siteConfig.eventDates.end,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: siteConfig.hostInstitution, address: siteConfig.venue },
        organizer: { '@id': `${siteUrl}/#organization` },
        url: `${siteUrl}${track === 'gimun' ? '/gimun' : '/moot-cup'}`,
        offers: {
          '@type': 'Offer',
          price: feeAmount(siteConfig, track === 'gimun' ? 'gimunIndividual' : 'mootCupTeam') ?? undefined,
          priceCurrency: 'PKR',
          url: `${siteUrl}/register?track=${track === 'gimun' ? 'gimun' : 'moot-cup'}`,
          availability: canRegister(track) ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        },
      })),
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
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
          `${committees.length} committees and ${mootCategories.length} moot problem categories`,
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
      {sponsors.length > 0 && (
        <section className="band-raised py-12">
          <h2 className="px-4 text-center font-mono text-meta uppercase tracking-[0.14em] text-text-4">
            Institutional &amp; corporate partners
          </h2>
          <div className="mt-8">
            <SponsorStrip sponsors={sponsors} />
          </div>
        </section>
      )}

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

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 pt-16 pb-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <TrackLedger
            id="gimun"
            track="gimun"
            title="Model United Nations"
            lead={`${committees.length} chambers running standard parliamentary procedure, from general assembly debate to live crisis.`}
            allHref="/gimun/committees"
            allLabel="All committees"
            action={gimunAction}
            rows={committees.map((com) => ({
              key: com.id,
              href: `/gimun/committees/${com.slug}`,
              title: com.name,
              description: com.shortDescription,
              meta: [
                com.capacity ? `${com.capacity} delegates` : 'Open seating',
                com.type.replace(/-/g, ' '),
              ],
            }))}
          />
          <TrackLedger
            id="gmc"
            track="moot-cup"
            title="GIKI Moot Court"
            lead={`${mootCategories.length} problem categories. Draft memorials for both sides, then defend them before a bench that will question you on the law.`}
            allHref="/moot-cup/categories"
            allLabel="All categories"
            action={mootAction}
            rows={mootCategories.map((cat) => ({
              key: cat.id,
              href: '/moot-cup/categories',
              title: cat.name,
              description: cat.description,
              meta: [cat.areaOfLaw, `Revised ${formatPublishedDate(cat.lastUpdated)}`],
            }))}
          />
        </div>

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

type LedgerRow = { key: string; href: string; title: string; description: string; meta: string[] };

function TrackLedger({
  id,
  track,
  title,
  lead,
  allHref,
  allLabel,
  action,
  rows,
}: {
  id: string;
  track: 'gimun' | 'moot-cup';
  title: string;
  lead: string;
  allHref: string;
  allLabel: string;
  action: { label: string; href: string };
  rows: LedgerRow[];
}) {
  const accent = track === 'gimun' ? 'text-crimson-soft' : 'text-champagne';
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-32">
      <div className="space-y-3">
        <TrackBadge track={track} />
        <h3 id={`${id}-heading`} className="text-h2 font-display font-medium text-balance text-text">
          {title}
        </h3>
        <p className="max-w-lg text-lead text-pretty text-text-3">{lead}</p>
      </div>

      <ol className="rise-stagger mt-8 border-b border-line">
        {rows.map((row, i) => (
          <li key={row.key} style={{ '--i': i } as React.CSSProperties}>
            <Link
              href={row.href}
              className="group -mx-3 grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-3 rounded-xl border-t border-line px-3 py-6 transition-colors duration-200 hover:bg-raised/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
            >
              <span className={`pt-1 font-mono text-xs tabular-nums ${accent}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 space-y-2">
                <span className="block text-lg font-display font-medium leading-snug text-text transition-colors group-hover:text-champagne">
                  {row.title}
                </span>
                <span className="line-clamp-2 block text-sm leading-relaxed text-text-3">
                  {row.description}
                </span>
                <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] capitalize text-text-4">
                  {row.meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="mt-1 h-4 w-4 text-text-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-champagne"
              />
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href={action.href}
          className={`group inline-flex items-center gap-2 text-sm font-semibold ${accent} transition-colors hover:text-text`}
        >
          {action.label}
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
        <Link href={allHref} className="text-sm text-text-3 underline-offset-4 transition-colors hover:text-text hover:underline">
          {allLabel}
        </Link>
      </div>
    </section>
  );
}
