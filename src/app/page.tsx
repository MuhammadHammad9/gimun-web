import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

import { DaysArt, DocumentsArt, GlobeArt, RouteArt, ScalesArt } from '@/components/art/LineArt';
import { Seal } from '@/components/art/Seal';
import { Counter } from '@/components/motion/Counter';
import { HandoffStage } from '@/components/motion/HandoffStage';
import { HorizontalPan } from '@/components/motion/HorizontalPan';
import { ScrubText } from '@/components/motion/ScrubText';
import { StickyStack } from '@/components/motion/StickyStack';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ChapterHead, ChapterKicker } from '@/components/sections/Chapter';
import { Closing } from '@/components/sections/Closing';
import { DateLedger } from '@/components/sections/DateLedger';
import { Door } from '@/components/sections/Door';
import { CasePlacard, CommitteePlacard, seatsOpen } from '@/components/sections/Placards';
import { TrackKey, trackDot } from '@/components/sections/TrackKey';
import { Button } from '@/components/ui/Button';
import { DaysToGo } from '@/components/ui/DaysToGo';
import { PageHero } from '@/components/ui/PageHero';
import { SponsorStrip } from '@/components/ui/SponsorStrip';
import { Bridge } from '@/components/story/Bridge';
import { ChapterIndex } from '@/components/story/ChapterIndex';

import { getCommittees, getProblemCategories, getSchedule, getSiteConfig, getSponsors } from '@/lib/content';
import { feeAmount } from '@/lib/fees';
import { constructMetadata } from '@/lib/metadata';
import { canRegister as canTrackRegister, eventPhase, serverRenderTime } from '@/lib/phase';
import { formatEventDate, getEventYear, getSiteUrl } from '@/lib/site-config';
import { addDays, dayDate, formatDateRange } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `GIMUN & GMC ${getEventYear(await getSiteConfig())} | Where Diplomacy Meets the Courtroom`,
    path: '/',
    description:
      'GIKI Model United Nations and the GIKI Moot Court: two student competitions on one campus in Topi, over the same four days. Committees, case categories, dates and registration.',
  });
}

export default async function Home() {
  const [site, committees, categories, sponsors, schedule] = await Promise.all([
    getSiteConfig(),
    getCommittees(),
    getProblemCategories(),
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
    .map((day) => ({
      day,
      date: dayDate(site.eventDates.start, day),
      items: schedule.filter((item) => item.day === day && !/^lunch$/i.test(item.title.trim())),
    }));

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
      <ChapterIndex />
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
          <HandoffStage />
        </div>

        {/* 01 The choice */}
        <section className="handoff__sheet tone-deep chapter" aria-labelledby="rooms-title">
          <div className="wrap">
            <ChapterHead
              id="rooms-title"
              chapter={1}
              act="The choice"
              reveal
              title="Two rooms, the same four days."
              lead="GIMUN and the GIKI Moot Court run side by side on one campus. The preparation, the rules and the judging are different, so pick the room you want to be tested in."
            />
            <div className="doors">
              <Door
                id="door-gimun"
                accent="gimun"
                label="Model United Nations"
                status={gimunOpen ? 'Applications open' : 'Registration closed'}
                open={gimunOpen}
                mark="GIMUN"
                title={site.eventNames.gimun}
                copy={`Represent a country in one of ${committees.length} committees, from the Security Council to a crisis session of the National Assembly.`}
                facts={[
                  { term: 'Committees', value: committees.length },
                  { term: 'Seats open', value: `${openSeats} of ${seats}` },
                  { term: 'Enter as', value: 'Individual or delegation' },
                  { term: 'Fee per delegate', value: site.fees.gimunIndividual },
                ]}
                action={gimunAction}
                secondary={{ label: 'How GIMUN works', href: '/gimun' }}
                art={<GlobeArt />}
              />
              <Door
                id="door-gmc"
                accent="gmc"
                label="Moot court"
                status={mootOpen ? 'Applications open' : 'Registration closed'}
                open={mootOpen}
                mark="GMC"
                title={site.eventNames.mootCup}
                copy="Draft memorials for both sides of one case problem, then argue them before a bench that questions you on the law."
                facts={[
                  { term: 'Case categories', value: categories.length },
                  { term: 'Team', value: '2 to 4 members' },
                  { term: 'Memorials due', value: site.memorialDeadline ? shortDate(site.memorialDeadline) : 'To be announced' },
                  { term: 'Fee per team', value: site.fees.mootCupTeam },
                ]}
                action={mootAction}
                secondary={{ label: 'How the moot works', href: '/moot-cup' }}
                art={<ScalesArt />}
              />
            </div>
            <Bridge to="chambers-title">Each room has its own chambers. Step inside, one at a time.</Bridge>
          </div>
        </section>
      </div>

      {/* 02 Inside the rooms: a corridor of placards */}
      <section className="chapter" aria-labelledby="chambers-title">
        <HorizontalPan
          label="Committees and case categories"
          header={
            <ChapterHead
              id="chambers-title"
              chapter={2}
              act="Inside the rooms"
              split={false}
              title={`${committees.length} committees, ${categories.length} cases.`}
              lead="Every chamber and every case category, with the seats still open. Countries are allocated after applications are reviewed."
            />
          }
        >
          {committees.map((committee) => (
            <CommitteePlacard key={committee.id} committee={committee} panel />
          ))}
          {categories.map((category) => (
            <CasePlacard key={category.id} category={category} panel />
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

      {/* 03 What it asks of you */}
      <section className="sheet tone-crest" aria-labelledby="asks-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterKicker chapter={3} act="What it asks of you" target="asks-title" />
          <h2 id="asks-title" className="sr-only">
            What it asks of you
          </h2>
          <ScrubText className="manifesto mt-8">
            Represent a country or argue a case, in front of chairs and judges who will question every point you make.
            At the end of the four days, awards go to the best delegates and delegations, the best memorial, the best
            oralist and the champions of the moot.
          </ScrubText>
        </div>
      </section>

      {/* 04 The week: a paper sheet in the dark theme, ink in the light */}
      <section className="sheet tone-inverse" aria-labelledby="days-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead
            id="days-title"
            chapter={4}
            act="The week"
            reveal
            title="Four days in Topi."
            lead={`Both tracks share the opening, the meals, the evenings and the awards. ${dateRange}.`}
          />
          <ol className="days">
            {days.map(({ day, date, items }) => (
              <li key={day} className="day">
                <p className="day__label">Day {day}</p>
                <h3 className="day__title">{date}</h3>
                <ul className="day__list">
                  {items.map((item) => (
                    <li key={item.id}>
                      <time>{item.startTime}</time>
                      <span>
                        <span className="track-dot" aria-hidden="true" style={{ background: trackDot(item.track) }} />
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
            <TrackKey />
          </div>
          <Bridge to="dates-title">Before that week, a few dates decide whether you are in the room.</Bridge>
        </div>
      </section>

      {/* 05 The clock */}
      <section className="chapter" aria-labelledby="dates-title">
        <div className="wrap">
          <ChapterHead id="dates-title" chapter={5} act="The clock" title="The dates that matter." lead="Every deadline in one list. Times are Pakistan time." />
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
          <DateLedger
            now={now}
            dates={[
              { iso: site.registrationDeadlines.gimun, what: 'GIMUN applications close', note: 'Individuals and delegations' },
              ...(site.memorialDeadline ? [{ iso: site.memorialDeadline, what: 'GMC memorials due', note: '23:59 PKT, by email to the moot court address' }] : []),
              { iso: site.registrationDeadlines.mootCup, what: 'GMC applications close', note: 'Teams of two to four' },
              { iso: addDays(site.eventDates.start, -7), what: 'GIMUN position papers due', note: 'At least 7 days before Day 1' },
              { iso: site.eventDates.start, what: 'Conference opens', note: site.checkinDesk ?? 'Check-in on Day 1' },
              ...(site.galaDate ? [{ iso: site.galaDate, what: 'Grand Final and awards gala', note: 'Awards for both tracks' }] : []),
            ]}
          />
          <Bridge to="prepare-title">Once you are in, here is what to read and how to get to Topi.</Bridge>
        </div>
      </section>

      {/* 06 Before you arrive */}
      <section className="chapter" aria-labelledby="prepare-title">
        <div className="wrap">
          <ChapterHead id="prepare-title" chapter={6} act="Before you arrive" title="Before you arrive." lead="What to read, when to be where, and how to get to Topi." />
          <StickyStack>
            <StackCard
              index={0}
              id="stack-library"
              title="The resource library"
              copy="Background guides, the case problems, the rules and every form, each marked with its revision date."
              points={['Committee background guides', 'Rules of procedure and moot rules', 'Forms and templates']}
              action={{ label: 'Open the library', href: '/resources' }}
              art={<DocumentsArt />}
            />
            <StackCard
              index={1}
              id="stack-schedule"
              title="The schedule"
              copy="Session times and rooms for all four days, with any change marked the moment it is made."
              points={[site.checkinDesk ?? 'Check-in opens on Day 1', 'Filter by track, print a copy']}
              action={{ label: 'See the schedule', href: '/schedule' }}
              art={<DaysArt />}
            />
            <StackCard
              index={2}
              id="stack-venue"
              title="Getting to GIKI"
              copy="The route to Topi from Islamabad and Peshawar, where to stay, and what to bring."
              points={[site.entryRequirement ?? 'Bring a photo ID and your QR ticket.', 'On-campus accommodation on request']}
              action={{ label: 'Venue and travel', href: '/about/venue' }}
              art={<RouteArt />}
            />
          </StickyStack>
        </div>
      </section>

      {/* Partners, only once there are approved ones */}
      {sponsors.length > 0 && (
        <section className="chapter chapter--flush-top" aria-labelledby="partners-title">
          <div className="wrap">
            <h2 id="partners-title" className="font-display text-h3 font-medium text-text">
              Partners
            </h2>
          </div>
          <div className="mt-8">
            <SponsorStrip sponsors={sponsors} />
          </div>
        </section>
      )}

      {/* 07 Your seat */}
      <Closing
        id="closing-title"
        chapter={7}
        act="Your seat"
        title="Reserve your place."
        lead="Applying reserves a delegate or team place for review. Accepted participants receive an invoice with bank transfer details."
        actions={[
          { ...gimunAction, variant: 'track-gimun' },
          { ...mootAction, variant: 'track-moot' },
        ]}
      />
    </>
  );
}

function StackCard({
  index,
  id,
  title,
  copy,
  points,
  action,
  art,
}: {
  index: number;
  id: string;
  title: string;
  copy: string;
  points: string[];
  action: { label: string; href: string };
  art: ReactNode;
}) {
  return (
    <article className="stack__card" style={{ '--i': index } as CSSProperties} aria-labelledby={id}>
      <div className="stack__body">
        <h3 id={id} className="stack__title">
          {title}
        </h3>
        <p className="stack__copy">{copy}</p>
        <ul className="stack__list">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className="stack__foot">
          <Button href={action.href} variant="secondary" withArrow>
            {action.label}
          </Button>
        </div>
      </div>
      <div className="stack__art tone-crest" aria-hidden="true">
        {art}
      </div>
      <div className="stack__shade" aria-hidden="true" />
    </article>
  );
}
