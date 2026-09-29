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
import { ChapterRail } from '@/components/story/ChapterRail';

import { getCommittees, getCopy, getProblemCategories, getSchedule, getSiteConfig, getSponsors } from '@/lib/content';
import { accentWords, chapterNumbers, fill } from '@/lib/copy';
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
  const [site, committees, categories, sponsors, schedule, copy] = await Promise.all([
    getSiteConfig(),
    getCommittees(),
    getProblemCategories(),
    getSponsors(),
    getSchedule(),
    getCopy('home'),
  ]);

  const now = serverRenderTime();
  const phase = eventPhase(site, now);
  const gimunOpen = canTrackRegister(site, 'gimun', now);
  const mootOpen = canTrackRegister(site, 'mootCup', now);
  const shortDate = (iso: string) => formatEventDate(iso, { month: 'short' });
  const dateRange = formatDateRange(site.eventDates.start, site.eventDates.end);

  const hero = copy('home-hero');
  const choice = copy('home-choice');
  const inside = copy('home-inside');
  const asks = copy('home-asks');
  const week = copy('home-week');
  const clock = copy('home-clock');
  const prepare = copy('home-prepare');
  const closing = copy('home-closing');
  // "The choice" carries the hero hand-off, so it is always shown.
  const chapter = chapterNumbers(copy, ['home-choice', 'home-inside', 'home-asks', 'home-week', 'home-clock', 'home-prepare', 'home-closing']);
  const vars = {
    committees: committees.length,
    cases: categories.length,
    dates: dateRange,
    checkin: site.checkinDesk ?? 'Check-in opens on Day 1',
    entry: site.entryRequirement ?? 'Bring a photo ID and your QR ticket.',
  };
  const lines = (text?: string) => fill(text, vars).split('\n').map((line) => line.trim()).filter(Boolean);
  const stackArt = [<DocumentsArt key="docs" />, <DaysArt key="days" />, <RouteArt key="route" />];
  const stackIds = ['stack-library', 'stack-schedule', 'stack-venue'];

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
      <ChapterRail />
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
              title={fill(hero.title, vars)}
              gimunWords={['diplomacy']}
              accentWords={accentWords(hero)}
              meta={[dateRange, 'GIKI, Topi', <DaysToGo key="days" start={site.eventDates.start} end={site.eventDates.end} />]}
              description={fill(hero.lead, vars)}
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
              chapter={chapter['home-choice']}
              act={choice.kicker}
              reveal
              title={fill(choice.title, vars)}
              lead={fill(choice.lead, vars)}
            />
            <div className="doors">
              <Door
                id="door-gimun"
                accent="gimun"
                label={choice.items?.[0]?.title ?? 'Model United Nations'}
                status={gimunOpen ? 'Applications open' : 'Registration closed'}
                open={gimunOpen}
                mark="GIMUN"
                title={site.eventNames.gimun}
                copy={fill(choice.items?.[0]?.body, vars)}
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
                label={choice.items?.[1]?.title ?? 'Moot court'}
                status={mootOpen ? 'Applications open' : 'Registration closed'}
                open={mootOpen}
                mark="GMC"
                title={site.eventNames.mootCup}
                copy={fill(choice.items?.[1]?.body, vars)}
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
            {choice.bridge && !inside.hidden && <Bridge to="chambers-title">{fill(choice.bridge, vars)}</Bridge>}
          </div>
        </section>
      </div>

      {/* 02 Inside the rooms: a corridor of placards */}
      {!inside.hidden && (
      <section className="chapter" aria-labelledby="chambers-title">
        <HorizontalPan
          label="Committees and case categories"
          header={
            <ChapterHead
              id="chambers-title"
              chapter={chapter['home-inside']}
              act={inside.kicker}
              split={false}
              title={fill(inside.title, vars)}
              lead={fill(inside.lead, vars)}
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
              {fill(inside.items?.[0]?.title, vars) || 'Read the full briefs'}
            </h3>
            <p className="placard__copy">{fill(inside.items?.[0]?.body, vars)}</p>
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
      )}

      {/* 03 What it asks of you */}
      {!asks.hidden && (
      <section className="sheet tone-crest" aria-labelledby="asks-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterKicker chapter={chapter['home-asks']!} act={asks.kicker ?? ''} target="asks-title" />
          <h2 id="asks-title" className="sr-only">
            {asks.kicker}
          </h2>
          <ScrubText className="manifesto mt-8">{fill(asks.body, vars)}</ScrubText>
        </div>
      </section>
      )}

      {/* 04 The week: a paper sheet in the dark theme, ink in the light */}
      {!week.hidden && (
      <section className="sheet tone-inverse" aria-labelledby="days-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead
            id="days-title"
            chapter={chapter['home-week']}
            act={week.kicker}
            reveal
            title={fill(week.title, vars)}
            lead={fill(week.lead, vars)}
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
          {week.bridge && !clock.hidden && <Bridge to="dates-title">{fill(week.bridge, vars)}</Bridge>}
        </div>
      </section>
      )}

      {/* 05 The clock */}
      {!clock.hidden && (
      <section className="chapter" aria-labelledby="dates-title">
        <div className="wrap">
          <ChapterHead id="dates-title" chapter={chapter['home-clock']} act={clock.kicker} title={fill(clock.title, vars)} lead={fill(clock.lead, vars)} />
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
          {clock.bridge && !prepare.hidden && <Bridge to="prepare-title">{fill(clock.bridge, vars)}</Bridge>}
        </div>
      </section>
      )}

      {/* 06 Before you arrive */}
      {!prepare.hidden && (
        <section className="chapter" aria-labelledby="prepare-title">
          <div className="wrap">
            <ChapterHead id="prepare-title" chapter={chapter['home-prepare']} act={prepare.kicker} title={fill(prepare.title, vars)} lead={fill(prepare.lead, vars)} />
            <StickyStack>
              {(prepare.items ?? []).slice(0, 3).map((item, index) => (
                <StackCard
                  key={stackIds[index]}
                  index={index}
                  id={stackIds[index]}
                  title={fill(item.title, vars)}
                  copy={fill(item.body, vars)}
                  points={lines(item.meta)}
                  action={prepare.actions?.[index]}
                  art={stackArt[index]}
                />
              ))}
            </StickyStack>
          </div>
        </section>
      )}

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
        chapter={chapter['home-closing']}
        act={closing.kicker}
        title={fill(closing.title, vars)}
        lead={fill(closing.lead, vars)}
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
  action?: { label: string; href: string };
  art: ReactNode;
}) {
  return (
    <article className="stack__card" style={{ '--i': index } as CSSProperties} aria-labelledby={id} data-glow="">
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
        {action && (
          <div className="stack__foot">
            <Button href={action.href} variant="secondary" withArrow>
              {action.label}
            </Button>
          </div>
        )}
      </div>
      <div className="stack__art tone-crest" aria-hidden="true">
        {art}
      </div>
      <div className="stack__shade" aria-hidden="true" />
    </article>
  );
}
