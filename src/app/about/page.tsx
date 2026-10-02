import type { Metadata } from 'next';
import { GlobeArt, ScalesArt } from '@frontend/components/art/LineArt';
import { LiveArt } from '@frontend/components/art/LiveArt';
import { HandoffStage } from '@frontend/components/motion/HandoffStage';
import { ScrubText } from '@frontend/components/motion/ScrubText';
import { TransitionLink as Link } from '@frontend/components/motion/TransitionLink';
import { ChapterHead, ChapterKicker } from '@frontend/components/sections/Chapter';
import { Bridge } from '@frontend/components/story/Bridge';
import { ChapterRail } from '@frontend/components/story/ChapterRail';
import { Closing } from '@frontend/components/sections/Closing';
import { Steps } from '@frontend/components/sections/Steps';
import { Ledger } from '@frontend/components/ui/Editorial';
import { PageHero } from '@frontend/components/ui/PageHero';
import { PublishedStats } from '@frontend/components/ui/PublishedStats';
import { getCopy, getCommittees, getMootCategories, getSchedule, getSiteConfig } from '@backend/lib/content';
import { chapterNumbers, fill } from '@shared/lib/copy';
import { constructMetadata } from '@frontend/lib/metadata';
import { canRegister } from '@shared/lib/phase';
import { formatEventDate, getEventYear } from '@shared/lib/site-config';
import { dayDate, formatDateRange } from '@frontend/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `About GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
    path: '/about',
    description:
      'What GIMUN and the GIKI Moot Court are, how the four days fit together, and who runs them at GIK Institute in Topi.',
  });
}

export default async function AboutOverviewPage() {
  const [site, committees, categories, schedule, copy] = await Promise.all([
    getSiteConfig(),
    getCommittees(),
    getMootCategories(),
    getSchedule(),
    getCopy('about'),
  ]);
  const gimunOpen = canRegister(site, 'gimun');
  const mootOpen = canRegister(site, 'mootCup');
  const dateRange = formatDateRange(site.eventDates.start, site.eventDates.end);
  const campus = site.hostInstitution.split(',')[0];
  const hero = copy('about-hero');
  const tracks = copy('about-tracks');
  const week = copy('about-week');
  const who = copy('about-who');
  const more = copy('about-more');
  const closing = copy('about-closing');
  // "Two rooms" carries the hero hand-off, so it is always shown.
  const chapter = chapterNumbers(copy, ['about-tracks', 'about-week', 'about-who', 'about-more', 'about-closing']);
  const vars = { campus, committees: committees.length, cases: categories.length, reply: site.replyTime || 'Questions to the organizing team.' };
  const moreLinks = [
    { key: 'team', href: '/about/team' },
    { key: 'venue', href: '/about/venue' },
    { key: 'faq', href: '/about/faq' },
    { key: 'sponsors', href: '/about/sponsors' },
    { key: 'contact', href: '/contact' },
  ];

  // One step per conference day, from the published schedule.
  const days = [...new Set(schedule.map((s) => s.day))]
    .sort((a, b) => a - b)
    .map((day) => {
      const highlights = schedule
        .filter((s) => s.day === day && !/lunch|check-out|press/i.test(s.title))
        .slice(0, 3)
        .map((s) => s.title);
      return { title: `Day ${day}, ${dayDate(site.eventDates.start, day)}`, body: highlights.join('. ') + '.' };
    });

  return (
    <>
      <ChapterRail />
      <div className="handoff">
        <div className="handoff__stage">
          <div className="handoff__scene">
            <PageHero
              variant="utility"
              meta={['About the event', dateRange, 'GIKI, Topi']}
              title={fill(hero.title, vars)}
              accentPhrase={hero.accentPhrase}
              description={fill(hero.lead, vars)}
              actions={[
                { label: 'Explore GIMUN', href: '/gimun', variant: 'track-gimun' },
                { label: 'Explore GMC', href: '/moot-cup', variant: 'track-moot' },
              ]}
              art={
                <div className="mx-auto hidden max-w-[24rem] grid-cols-2 items-center gap-10 text-champagne opacity-50 lg:grid">
                  <LiveArt className="w-full text-accent-gimun">
                    <GlobeArt live className="w-full" />
                  </LiveArt>
                  <LiveArt className="w-full">
                    <ScalesArt live className="w-full" />
                  </LiveArt>
                </div>
              }
            />
          </div>
          <div className="handoff__dim" aria-hidden="true" />
          <HandoffStage />
        </div>

        {/* The two tracks */}
        <section className="handoff__sheet tone-deep chapter" aria-labelledby="tracks-title">
          <div className="wrap">
            {site.stats?.length ? (
              <div className="mb-16">
                <h2 className="sr-only">In numbers</h2>
                <PublishedStats stats={site.stats} />
              </div>
            ) : null}
            <ChapterHead
              id="tracks-title"
              chapter={chapter['about-tracks']}
              act={tracks.kicker}
              reveal
              title={fill(tracks.title, vars)}
              lead={fill(tracks.lead, vars)}
            />
            <Ledger
              rows={[
                {
                  key: 'gimun',
                  href: '/gimun',
                  title: site.eventNames.gimun,
                  description: fill(tracks.items?.[0]?.body, vars),
                  meta: [gimunOpen ? 'Applications open' : 'Registration closed', `Closes ${formatEventDate(site.registrationDeadlines.gimun, { month: 'short' })}`],
                },
                {
                  key: 'gmc',
                  href: '/moot-cup',
                  title: site.eventNames.mootCup,
                  description: fill(tracks.items?.[1]?.body, vars),
                  meta: [mootOpen ? 'Applications open' : 'Registration closed', `Closes ${formatEventDate(site.registrationDeadlines.mootCup, { month: 'short' })}`],
                },
              ]}
            />
            {tracks.bridge && !week.hidden && <Bridge to="days-title">{fill(tracks.bridge, vars)}</Bridge>}
          </div>
        </section>
      </div>

      {/* How the week fits together */}
      {!week.hidden && (
      <section className="chapter" aria-labelledby="days-title">
        <div className="wrap steps-split">
          <div className="steps-split__head">
            <ChapterHead
              id="days-title"
              chapter={chapter['about-week']}
              act={week.kicker}
              split={false}
              title={fill(week.title, vars)}
              lead={fill(week.lead, vars)}
            >
              <Link href="/schedule" className="text-link w-fit">
                The full schedule
              </Link>
            </ChapterHead>
          </div>
          <Steps steps={days} accent="gmc" />
        </div>
      </section>
      )}

      {/* Who runs it */}
      {!who.hidden && (
      <section className="sheet tone-crest" aria-labelledby="who-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterKicker chapter={chapter['about-who']!} act={who.kicker ?? ''} target="who-title" />
          <h2 id="who-title" className="sr-only">
            {who.kicker}
          </h2>
          <ScrubText className="manifesto mt-8">{fill(who.body, vars)}</ScrubText>
        </div>
      </section>
      )}

      {/* Everything else about the event */}
      {!more.hidden && (
      <section className="chapter" aria-labelledby="more-title">
        <div className="wrap steps-split">
          <div className="steps-split__head">
            <ChapterHead
              id="more-title"
              chapter={chapter['about-more']}
              act={more.kicker}
              split={false}
              title={fill(more.title, vars)}
              lead={fill(more.lead, vars)}
            />
          </div>
          <Ledger
            rows={moreLinks.map((link, index) => {
              const item = more.items?.[index];
              return { ...link, title: fill(item?.title, vars), description: fill(item?.body, vars), meta: item?.meta ? [fill(item.meta, vars)] : [] };
            })}
          />
        </div>
      </section>
      )}

      <Closing
        id="closing-title"
        chapter={chapter['about-closing']}
        act={closing.kicker}
        title={fill(closing.title, vars)}
        lead={fill(closing.lead, vars)}
        actions={[
          { label: gimunOpen ? 'Apply for GIMUN' : 'GIMUN registration status', href: '/register?track=gimun', variant: 'track-gimun' },
          { label: mootOpen ? 'Register a GMC team' : 'GMC registration status', href: '/register?track=moot-cup', variant: 'track-moot' },
        ]}
      />
    </>
  );
}
