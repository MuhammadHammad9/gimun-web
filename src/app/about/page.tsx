import type { Metadata } from 'next';
import { GlobeArt, ScalesArt } from '@/components/art/LineArt';
import { HandoffStage } from '@/components/motion/HandoffStage';
import { ScrubText } from '@/components/motion/ScrubText';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ChapterHead } from '@/components/sections/Chapter';
import { Closing } from '@/components/sections/Closing';
import { Door } from '@/components/sections/Door';
import { Steps } from '@/components/sections/Steps';
import { Ledger } from '@/components/ui/Editorial';
import { PageHero } from '@/components/ui/PageHero';
import { PublishedStats } from '@/components/ui/PublishedStats';
import { getCommittees, getMootCategories, getSchedule, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { canRegister } from '@/lib/phase';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { dayDate, formatDateRange } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `About GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
    path: '/about',
    description:
      'What GIMUN and the GIKI Moot Court are, how the four days fit together, and who runs them at GIK Institute in Topi.',
  });
}

export default async function AboutOverviewPage() {
  const [site, committees, categories, schedule] = await Promise.all([
    getSiteConfig(),
    getCommittees(),
    getMootCategories(),
    getSchedule(),
  ]);
  const gimunOpen = canRegister(site, 'gimun');
  const mootOpen = canRegister(site, 'mootCup');
  const dateRange = formatDateRange(site.eventDates.start, site.eventDates.end);
  const campus = site.hostInstitution.split(',')[0];

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
      <div className="handoff">
        <div className="handoff__stage">
          <div className="handoff__scene">
            <PageHero
              variant="utility"
              meta={['About the event', dateRange, 'GIKI, Topi']}
              title="Two competitions, one campus, four days."
              accentPhrase="one campus,"
              description={`GIMUN and the GIKI Moot Court run side by side at ${campus}. Delegates debate in committee; law students argue before a bench. Both share the ceremonies, meals and evenings.`}
              actions={[
                { label: 'Explore GIMUN', href: '/gimun', variant: 'track-gimun' },
                { label: 'Explore GMC', href: '/moot-cup', variant: 'track-moot' },
              ]}
              art={
                <div className="mx-auto hidden max-w-[24rem] grid-cols-2 items-center gap-10 text-champagne opacity-50 lg:grid">
                  <GlobeArt className="w-full text-accent-gimun" />
                  <ScalesArt className="w-full" />
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
              reveal
              title="Pick the one you want to be tested in."
              lead="They share dates and a campus, but the preparation, the rules and the judging are entirely different."
            />
            <div className="doors">
              <Door
                id="door-gimun"
                accent="gimun"
                label="Model United Nations"
                status={gimunOpen ? 'Applications open' : 'Registration closed'}
                open={gimunOpen}
                title={site.eventNames.gimun}
                copy={`Delegates represent countries across ${committees.length} committees, negotiate in caucus and vote resolutions through. Enter on your own or with your institution.`}
                facts={[
                  { term: 'Committees', value: committees.map((c) => c.slug.toUpperCase()).join(' · ') },
                  { term: 'Awards', value: 'Best Delegate, Outstanding Delegate, Best Delegation' },
                  { term: 'Applications close', value: formatEventDate(site.registrationDeadlines.gimun) },
                ]}
                action={{ label: 'The GIMUN track', href: '/gimun' }}
              />
              <Door
                id="door-gmc"
                accent="gmc"
                label="Moot court"
                status={mootOpen ? 'Applications open' : 'Registration closed'}
                open={mootOpen}
                title={site.eventNames.mootCup}
                copy="Teams of law students write memorials for both sides of one problem, then argue oral rounds before benches of practitioners, through to a Grand Final."
                facts={[
                  { term: 'Categories', value: `${categories.length} areas of law` },
                  { term: 'Awards', value: 'Champions, Best Memorial, Best Oralist' },
                  { term: 'Applications close', value: formatEventDate(site.registrationDeadlines.mootCup) },
                ]}
                action={{ label: 'The GMC track', href: '/moot-cup' }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* How the week fits together */}
      <section className="chapter" aria-labelledby="days-title">
        <div className="wrap steps-split">
          <div className="steps-split__head">
            <ChapterHead
              id="days-title"
              split={false}
              title="How the week fits together."
              lead="Committees and courtrooms run in parallel; ceremonies, meals and evenings are shared."
            >
              <Link href="/schedule" className="text-link w-fit">
                The full schedule
              </Link>
            </ChapterHead>
          </div>
          <Steps steps={days} accent="gmc" />
        </div>
      </section>

      {/* Who runs it */}
      <section className="sheet tone-crest" aria-label="Who runs the event">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ScrubText className="manifesto">
            The secretariat, the moot convening committee and the logistics team are GIKI students. Applying is free;
            accepted participants pay by bank transfer, never on this site.
          </ScrubText>
        </div>
      </section>

      {/* Everything else about the event */}
      <section className="chapter" aria-labelledby="more-title">
        <div className="wrap steps-split">
          <div className="steps-split__head">
            <ChapterHead
              id="more-title"
              split={false}
              title="Organized at GIKI."
              lead="The people, the place and the answers to the questions most participants ask."
            />
          </div>
          <Ledger
            rows={[
              { key: 'team', href: '/about/team', title: 'Organizing team', description: 'Who runs each track, and how to reach them.', meta: ['People'] },
              { key: 'venue', href: '/about/venue', title: 'Venue and travel', description: 'Getting to Topi, where each session happens, and what to bring.', meta: ['Logistics'] },
              { key: 'faq', href: '/about/faq', title: 'Frequently asked questions', description: 'Fees, refunds, accommodation, dress code and more.', meta: ['Help'] },
              { key: 'sponsors', href: '/about/sponsors', title: 'Sponsors and partners', description: 'Supporting organizations and the sponsorship deck.', meta: ['Partners'] },
              { key: 'contact', href: '/contact', title: 'Contact', description: site.replyTime || 'Questions to the organizing team.', meta: ['Support'] },
            ]}
          />
        </div>
      </section>

      <Closing
        id="closing-title"
        title="Represent your institution at GIKI."
        lead="Choose a track to see its fees, format and deadlines. Applying is free; you pay only once accepted."
        actions={[
          { label: gimunOpen ? 'Apply for GIMUN' : 'GIMUN registration status', href: '/register?track=gimun', variant: 'track-gimun' },
          { label: mootOpen ? 'Register a GMC team' : 'GMC registration status', href: '/register?track=moot-cup', variant: 'track-moot' },
        ]}
      />
    </>
  );
}
