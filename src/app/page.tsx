import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';

import { DaysArt, DocumentsArt, GlobeArt, RouteArt, ScalesArt } from '@/components/art/LineArt';
import { Seal } from '@/components/art/Seal';
import { Counter } from '@/components/motion/Counter';
import { HandoffFocus } from '@/components/motion/HandoffFocus';
import { HorizontalPan } from '@/components/motion/HorizontalPan';
import { Magnetic } from '@/components/motion/Magnetic';
import { ScrubText } from '@/components/motion/ScrubText';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { StickyStack } from '@/components/motion/StickyStack';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { Button } from '@/components/ui/Button';
import { DaysToGo } from '@/components/ui/DaysToGo';
import { PageHero } from '@/components/ui/PageHero';
import { SponsorStrip } from '@/components/ui/SponsorStrip';

import { getAnnouncements, getCommittees, getProblemCategories, getSchedule, getSiteConfig, getSponsors } from '@/lib/content';
import { feeAmount } from '@/lib/fees';
import { constructMetadata } from '@/lib/metadata';
import { canRegister as canTrackRegister, eventPhase, serverRenderTime } from '@/lib/phase';
import { formatEventDate, formatPublishedDate, getEventYear, getSiteUrl } from '@/lib/site-config';
import type { Committee, ScheduleItem } from '@/lib/types';
import { formatDateRange } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `GIMUN & GMC ${getEventYear(await getSiteConfig())} | Where Diplomacy Meets the Courtroom`,
    path: '/',
    description:
      'GIKI Model United Nations and the GIKI Moot Court: two student competitions on one campus in Topi, over the same four days. Committees, case categories, dates and registration.',
  });
}

const COMMITTEE_TYPE: Record<string, string> = {
  'general-assembly': 'General Assembly',
  'specialized-agency': 'Specialized agency',
  crisis: 'Crisis committee',
  other: 'Council',
};

const TRACK_DOT: Record<string, string> = {
  gimun: 'var(--color-accent-gimun)',
  'moot-cup': 'var(--color-accent-gmc)',
};

const seatsOpen = (committee: Committee) => (committee.countryList ?? []).filter((entry) => entry.status === 'available').length;

export default async function Home() {
  const [site, committees, categories, announcements, sponsors, schedule] = await Promise.all([
    getSiteConfig(),
    getCommittees(),
    getProblemCategories(),
    getAnnouncements(),
    getSponsors(),
    getSchedule(),
  ]);

  const now = serverRenderTime();
  const phase = eventPhase(site, now);
  const gimunOpen = canTrackRegister(site, 'gimun', now);
  const mootOpen = canTrackRegister(site, 'mootCup', now);
  const shortDate = (iso: string) => formatEventDate(iso, { month: 'short' });
  const dateRange = formatDateRange(site.eventDates.start, site.eventDates.end);

  const seats = committees.reduce((sum, committee) => sum + (committee.countryList?.length ?? 0), 0);
  const openSeats = committees.reduce((sum, committee) => sum + seatsOpen(committee), 0);

  const gimunAction = gimunOpen
    ? { label: 'Register for GIMUN', href: '/register?track=gimun' }
    : phase === 'results'
      ? { label: 'View results', href: '/results' }
      : { label: 'Explore GIMUN', href: '/gimun' };
  const mootAction = mootOpen
    ? { label: 'Register for GMC', href: '/register?track=moot-cup' }
    : phase === 'event-live'
      ? { label: 'View the schedule', href: '/schedule' }
      : { label: 'Explore GMC', href: '/moot-cup' };

  // Four days, straight from the schedule. Meal breaks are left out of the
  // overview; the schedule page has every session.
  const days = [...new Set(schedule.map((item) => item.day))]
    .sort((a, b) => a - b)
    .map((day) => {
      const items = schedule.filter((item) => item.day === day);
      return { day, items: items.filter((item) => !/^lunch$/i.test(item.title.trim())), date: dayDate(site.eventDates.start, day) };
    });

  // Every deadline in one list, in date order, each marked past, next or later.
  const positionPapers = addDays(site.eventDates.start, -7);
  const dates = [
    { iso: site.registrationDeadlines.gimun, what: 'GIMUN applications close', note: 'Individuals and delegations' },
    ...(site.memorialDeadline ? [{ iso: site.memorialDeadline, what: 'GMC memorials due', note: '23:59 PKT, by email to the moot court address' }] : []),
    { iso: site.registrationDeadlines.mootCup, what: 'GMC applications close', note: 'Teams of two to four' },
    { iso: positionPapers, what: 'GIMUN position papers due', note: 'At least 7 days before Day 1' },
    { iso: site.eventDates.start, what: 'Conference opens', note: site.checkinDesk ?? 'Check-in on Day 1' },
    ...(site.galaDate ? [{ iso: site.galaDate, what: 'Grand Final and awards gala', note: 'Awards for both tracks' }] : []),
  ].sort((a, b) => a.iso.localeCompare(b.iso));
  const today = new Date(now).toISOString().slice(0, 10);
  const nextIndex = dates.findIndex((entry) => entry.iso >= today);

  const latest = announcements.find((a) => a.pinnedFlag) ?? announcements[0];

  const siteUrl = getSiteUrl();
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: site.eventNames.combined,
        url: siteUrl,
        email: site.contactEmails.general,
        sameAs: Object.values(site.socialLinks || {}).filter(Boolean),
      },
      ...(['gimun', 'mootCup'] as const).map((track) => ({
        '@type': 'Event',
        name: `${site.eventNames[track]} ${getEventYear(site)}`,
        startDate: site.eventDates.start,
        endDate: site.eventDates.end,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: site.hostInstitution, address: site.venue },
        organizer: { '@id': `${siteUrl}/#organization` },
        url: `${siteUrl}${track === 'gimun' ? '/gimun' : '/moot-cup'}`,
        offers: {
          '@type': 'Offer',
          price: feeAmount(site, track === 'gimun' ? 'gimunIndividual' : 'mootCupTeam') ?? undefined,
          priceCurrency: 'PKR',
          url: `${siteUrl}/register?track=${track === 'gimun' ? 'gimun' : 'moot-cup'}`,
          availability: canTrackRegister(site, track, now) ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        },
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />

      {/* Hero, then the first chapter slides over it like a sheet. */}
      <div className="handoff">
        <div className="handoff__stage">
          <div className="handoff__scene">
            <PageHero
              variant="home"
              title="Where diplomacy meets the courtroom."
              gimunWords={['diplomacy']}
              accentWords={['courtroom.']}
              meta={[dateRange, 'GIKI, Topi', <DaysToGo key="days" start={site.eventDates.start} end={site.eventDates.end} />]}
              description="Two student competitions on one campus. Represent a country in committee, or argue a case before a bench of judges, over the same four days in March."
              actions={[
                { ...gimunAction, variant: 'track-gimun' },
                { ...mootAction, variant: 'track-moot' },
              ]}
              footnote={
                gimunOpen || mootOpen
                  ? `Applications close ${shortDate(site.registrationDeadlines.gimun)} (GIMUN) and ${shortDate(site.registrationDeadlines.mootCup)} (GMC).`
                  : undefined
              }
              art={<Seal id="hero-seal" />}
            />
          </div>
          <div className="handoff__dim" aria-hidden="true" />
          <div className="scroll-cue" aria-hidden="true">
            Scroll
            <span className="scroll-cue__line" />
          </div>
          <HandoffFocus />
        </div>

        {/* 1. The two rooms */}
        <section className="handoff__sheet tone-deep chapter" aria-labelledby="rooms-title">
          <div className="wrap">
            <header className="chapter-head chapter-head--split">
              <SplitReveal id="rooms-title" className="chapter-title">
                Two rooms, the same four days.
              </SplitReveal>
              <p className="chapter-lead">
                GIMUN and the GIKI Moot Court run side by side on one campus. The preparation, the rules and the
                judging are different, so pick the room you want to be tested in.
              </p>
            </header>

            <div className="doors">
              <article className="door door--gimun" aria-labelledby="door-gimun">
                <div className="door__top">
                  <span>Model United Nations</span>
                  <span className="door__status" data-open={gimunOpen ? '' : undefined}>
                    {gimunOpen ? 'Applications open' : 'Registration closed'}
                  </span>
                </div>
                <p className="door__mark" aria-hidden="true">
                  GIMUN
                </p>
                <h3 id="door-gimun" className="door__name">
                  {site.eventNames.gimun}
                </h3>
                <p className="door__copy">
                  Represent a country in one of {committees.length} committees, from the Security Council to a crisis
                  session of the National Assembly.
                </p>
                <dl className="door__facts">
                  <div>
                    <dt>Committees</dt>
                    <dd>{committees.length}</dd>
                  </div>
                  <div>
                    <dt>Seats open</dt>
                    <dd>
                      {openSeats} of {seats}
                    </dd>
                  </div>
                  <div>
                    <dt>Enter as</dt>
                    <dd>Individual or delegation</dd>
                  </div>
                  <div>
                    <dt>Fee per delegate</dt>
                    <dd>{site.fees.gimunIndividual}</dd>
                  </div>
                </dl>
                <div className="door__actions">
                  <Button href={gimunAction.href} variant="track-gimun" withArrow>
                    {gimunAction.label}
                  </Button>
                  <Link href="/gimun" className="text-link">
                    How GIMUN works
                  </Link>
                </div>
                <GlobeArt className="door__art" />
              </article>

              <article className="door door--gmc" aria-labelledby="door-gmc">
                <div className="door__top">
                  <span>Moot court</span>
                  <span className="door__status" data-open={mootOpen ? '' : undefined}>
                    {mootOpen ? 'Applications open' : 'Registration closed'}
                  </span>
                </div>
                <p className="door__mark" aria-hidden="true">
                  GMC
                </p>
                <h3 id="door-gmc" className="door__name">
                  {site.eventNames.mootCup}
                </h3>
                <p className="door__copy">
                  Draft memorials for both sides of one case problem, then argue them before a bench that questions you
                  on the law.
                </p>
                <dl className="door__facts">
                  <div>
                    <dt>Case categories</dt>
                    <dd>{categories.length}</dd>
                  </div>
                  <div>
                    <dt>Team</dt>
                    <dd>2 to 4 members</dd>
                  </div>
                  <div>
                    <dt>Memorials due</dt>
                    <dd>{site.memorialDeadline ? shortDate(site.memorialDeadline) : 'To be announced'}</dd>
                  </div>
                  <div>
                    <dt>Fee per team</dt>
                    <dd>{site.fees.mootCupTeam}</dd>
                  </div>
                </dl>
                <div className="door__actions">
                  <Button href={mootAction.href} variant="track-moot" withArrow>
                    {mootAction.label}
                  </Button>
                  <Link href="/moot-cup" className="text-link">
                    How the moot works
                  </Link>
                </div>
                <ScalesArt className="door__art" />
              </article>
            </div>
          </div>
        </section>
      </div>

      {/* 2. The chambers: a corridor of placards */}
      <section className="chapter" aria-labelledby="chambers-title">
        <HorizontalPan
          label="Committees and case categories"
          header={
            <header className="chapter-head">
              <h2 id="chambers-title" className="chapter-title">
                {committees.length} committees, {categories.length} cases.
              </h2>
              <p className="chapter-lead">
                Every chamber and every case category, with the seats still open. Countries are allocated after
                applications are reviewed.
              </p>
            </header>
          }
        >
          {committees.map((committee) => {
            const total = committee.countryList?.length ?? 0;
            const open = seatsOpen(committee);
            return (
              <article key={committee.id} className="placard" data-pan-panel="" aria-labelledby={`placard-${committee.slug}`}>
                <div className="placard__top">
                  <span>{COMMITTEE_TYPE[committee.type] ?? 'Committee'}</span>
                  <span>
                    {open} of {total} open
                  </span>
                </div>
                <p className="placard__mark" aria-hidden="true">
                  {committee.slug.toUpperCase()}
                </p>
                <h3 id={`placard-${committee.slug}`} className="placard__name">
                  {committee.name}
                </h3>
                {committee.topics?.[0] && <p className="placard__copy">Agenda: {committee.topics[0]}</p>}
                <div className="placard__foot">
                  <span className="placard__seats" aria-hidden="true">
                    {(committee.countryList ?? []).slice(0, 15).map((entry, index) => (
                      <span key={index} data-open={entry.status === 'available' ? '' : undefined} />
                    ))}
                  </span>
                  <Link href={`/gimun/committees/${committee.slug}`} className="text-link" aria-label={`${committee.name}: committee page`}>
                    Committee
                    <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
          {categories.map((category) => (
            <article key={category.id} className="placard placard--case" data-pan-panel="" aria-labelledby={`case-${category.id}`}>
              <div className="placard__top">
                <span>Case category</span>
              </div>
              <ScalesArt className="mt-8 size-24 text-accent-gmc" />
              <h3 id={`case-${category.id}`} className="placard__name">
                {category.name}
              </h3>
              <p className="placard__area">{category.areaOfLaw}</p>
              <p className="placard__copy line-clamp-4">{category.description}</p>
              <div className="placard__foot">
                <span className="font-mono text-[0.8125rem] text-text-3">Revised {formatPublishedDate(category.lastUpdated)}</span>
                <Link href="/moot-cup/categories" className="text-link" aria-label={`${category.name}: case categories`}>
                  Cases
                  <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
                </Link>
              </div>
            </article>
          ))}
          <article className="placard placard--end" data-pan-panel="" aria-labelledby="pan-end">
            <h3 id="pan-end" className="placard__name">
              Read the full briefs
            </h3>
            <p className="placard__copy">Topics, chairs, country lists and the case problems, each on its own page.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4">
              <Link href="/gimun/committees" className="text-link">
                All committees
              </Link>
              <Link href="/moot-cup/categories" className="text-link">
                All case categories
              </Link>
            </div>
          </article>
        </HorizontalPan>
      </section>

      {/* 3. Four days in Topi: a paper sheet in the dark theme, ink in the light */}
      <section className="sheet tone-inverse" aria-labelledby="days-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <header className="chapter-head chapter-head--split">
            <SplitReveal id="days-title" className="chapter-title">
              Four days in Topi.
            </SplitReveal>
            <p className="chapter-lead">
              Both tracks share the opening, the meals, the evenings and the awards. {dateRange}.
            </p>
          </header>
          <ol className="days">
            {days.map(({ day, items, date }) => (
              <li key={day} className="day">
                <p className="day__label">Day {day}</p>
                <h3 className="day__title">{date}</h3>
                <ul className="day__list">
                  {items.map((item: ScheduleItem) => (
                    <li key={item.id}>
                      <time>{item.startTime}</time>
                      <span>
                        <span
                          className="track-dot"
                          aria-hidden="true"
                          style={{ background: TRACK_DOT[item.track] ?? 'var(--color-line-3)' } as CSSProperties}
                        />
                        {item.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-small text-text-3">
            <Link href="/schedule" className="text-link">
              The full schedule, hour by hour
              <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
            </Link>
            <span>
              <span className="track-dot" aria-hidden="true" style={{ background: TRACK_DOT.gimun }} />
              GIMUN
            </span>
            <span>
              <span className="track-dot" aria-hidden="true" style={{ background: TRACK_DOT['moot-cup'] }} />
              GMC
            </span>
            <span>
              <span className="track-dot" aria-hidden="true" style={{ background: 'var(--color-line-3)' }} />
              Both tracks
            </span>
          </div>
        </div>
      </section>

      {/* 4. The dates that matter */}
      <section className="chapter" aria-labelledby="dates-title">
        <div className="wrap">
          <header className="chapter-head chapter-head--split">
            <h2 id="dates-title" className="chapter-title">
              The dates that matter.
            </h2>
            <p className="chapter-lead">Every deadline in one list. Times are Pakistan time.</p>
          </header>
          <div className="figures">
            <div className="figure">
              <Counter value={committees.length} className="figure__value" />
              <span className="figure__label">committees</span>
            </div>
            <div className="figure">
              <Counter value={seats} className="figure__value" />
              <span className="figure__label">country seats</span>
            </div>
            <div className="figure">
              <Counter value={openSeats} className="figure__value" />
              <span className="figure__label">seats still open</span>
            </div>
            <div className="figure">
              <Counter value={categories.length} className="figure__value" />
              <span className="figure__label">case categories</span>
            </div>
          </div>
          <ol className="dates">
            {dates.map((entry, index) => {
              const state = index < nextIndex || nextIndex === -1 ? 'past' : index === nextIndex ? 'next' : 'later';
              return (
                <li key={`${entry.iso}-${entry.what}`} className="date-row" data-state={state}>
                  <time dateTime={entry.iso}>{formatEventDate(entry.iso, { month: 'short' })}</time>
                  <span>
                    <span className="date-row__what">{entry.what}</span>
                    <span className="date-row__note block">{entry.note}</span>
                  </span>
                  <span className="date-row__state">{state === 'past' ? 'Passed' : state === 'next' ? 'Next' : ''}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 5. What the four days ask of you */}
      <section className="sheet tone-crest" aria-label="What to expect">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ScrubText className="manifesto">
            Represent a country or argue a case, in front of chairs and judges who will question every point you make.
            At the end of the four days, awards go to the best delegates and delegations, the best memorial, the best
            oralist and the champions of the moot.
          </ScrubText>
        </div>
      </section>

      {/* 6. Before you arrive */}
      <section className="chapter" aria-labelledby="prepare-title">
        <div className="wrap">
          <header className="chapter-head chapter-head--split">
            <h2 id="prepare-title" className="chapter-title">
              Before you arrive.
            </h2>
            <p className="chapter-lead">What to read, when to be where, and how to get to Topi.</p>
          </header>
          <StickyStack>
            <article className="stack__card" style={{ '--i': 0 } as CSSProperties} aria-labelledby="stack-library">
              <div className="stack__body">
                <h3 id="stack-library" className="stack__title">
                  The resource library
                </h3>
                <p className="stack__copy">Background guides, the case problems, the rules and every form, each marked with its revision date.</p>
                <ul className="stack__list">
                  <li>Committee background guides</li>
                  <li>Rules of procedure and moot rules</li>
                  <li>Forms and templates</li>
                </ul>
                <div className="stack__foot">
                  <Button href="/resources" variant="secondary" withArrow>
                    Open the library
                  </Button>
                </div>
              </div>
              <div className="stack__art tone-crest" aria-hidden="true">
                <DocumentsArt />
              </div>
              <div className="stack__shade" aria-hidden="true" />
            </article>
            <article className="stack__card" style={{ '--i': 1 } as CSSProperties} aria-labelledby="stack-schedule">
              <div className="stack__body">
                <h3 id="stack-schedule" className="stack__title">
                  The schedule
                </h3>
                <p className="stack__copy">Session times and rooms for all four days, with any change marked the moment it is made.</p>
                <ul className="stack__list">
                  <li>{site.checkinDesk ?? 'Check-in opens on Day 1'}</li>
                  <li>Filter by track, print a copy</li>
                </ul>
                <div className="stack__foot">
                  <Button href="/schedule" variant="secondary" withArrow>
                    See the schedule
                  </Button>
                </div>
              </div>
              <div className="stack__art tone-crest" aria-hidden="true">
                <DaysArt />
              </div>
              <div className="stack__shade" aria-hidden="true" />
            </article>
            <article className="stack__card" style={{ '--i': 2 } as CSSProperties} aria-labelledby="stack-venue">
              <div className="stack__body">
                <h3 id="stack-venue" className="stack__title">
                  Getting to GIKI
                </h3>
                <p className="stack__copy">The route to Topi from Islamabad and Peshawar, where to stay, and what to bring.</p>
                <ul className="stack__list">
                  <li>{site.entryRequirement ?? 'Bring a photo ID and your QR ticket.'}</li>
                  <li>On-campus accommodation on request</li>
                </ul>
                <div className="stack__foot">
                  <Button href="/about/venue" variant="secondary" withArrow>
                    Venue and travel
                  </Button>
                </div>
              </div>
              <div className="stack__art tone-crest" aria-hidden="true">
                <RouteArt />
              </div>
              <div className="stack__shade" aria-hidden="true" />
            </article>
          </StickyStack>
        </div>
      </section>

      {/* 7. The latest notice */}
      {latest && (
        <section className="chapter chapter--flush-top" aria-labelledby="notice-title">
          <div className="wrap">
            <div className="grid gap-6 border-t border-line pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
              <div>
                <h2 id="notice-title" className="text-h3 font-display font-medium text-text">
                  Latest notice
                </h2>
                <p className="mt-2 font-mono text-[0.8125rem] text-text-3">{formatPublishedDate(latest.timestamp)}</p>
              </div>
              <div>
                <h3 className="font-display text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-text">{latest.title}</h3>
                <p className="mt-3 max-w-2xl text-body text-text-2">{latest.body}</p>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  <Link href={`/announcements#${latest.id}`} className="text-link">
                    Read the notice
                    <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
                  </Link>
                  <Link href="/announcements" className="text-link">
                    All announcements
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. Partners, only once there are approved ones */}
      {sponsors.length > 0 && (
        <section className="chapter chapter--flush-top" aria-labelledby="partners-title">
          <div className="wrap">
            <h2 id="partners-title" className="text-h3 font-display font-medium text-text">
              Partners
            </h2>
          </div>
          <div className="mt-8">
            <SponsorStrip sponsors={sponsors} />
          </div>
        </section>
      )}

      {/* 9. Reserve your place */}
      <section className="chapter closing tone-crest" aria-labelledby="closing-title">
        <div className="wrap closing__grid">
          <div>
            <h2 id="closing-title" className="closing__title">
              Reserve your place.
            </h2>
            <p className="chapter-lead mt-6">
              Applying reserves a delegate or team place for review. Accepted participants receive an invoice with
              bank transfer details.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Magnetic>
                <Button href={gimunAction.href} variant="track-gimun" size="lg" withArrow>
                  {gimunAction.label}
                </Button>
              </Magnetic>
              <Magnetic>
                <Button href={mootAction.href} variant="track-moot" size="lg" withArrow>
                  {mootAction.label}
                </Button>
              </Magnetic>
            </div>
            <p className="closing__note">
              <span className="track-dot" aria-hidden="true" style={{ background: 'var(--color-champagne)' }} />
              No online payment is collected at any stage.
            </p>
          </div>
          <Seal id="closing-seal" className="mx-auto max-w-[24rem]" />
        </div>
      </section>
    </>
  );
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00+05:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** "Thursday 18 March" for day N of the event. */
function dayDate(start: string, day: number): string {
  const date = new Date(`${addDays(start, day - 1)}T12:00:00+05:00`);
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Karachi' }).format(date);
}
