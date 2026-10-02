import type { Metadata } from 'next';
import { GlobeArt } from '@frontend/components/art/LineArt';
import { LiveArt } from '@frontend/components/art/LiveArt';
import { HandoffStage } from '@frontend/components/motion/HandoffStage';
import { TransitionLink as Link } from '@frontend/components/motion/TransitionLink';
import { ChapterHead } from '@frontend/components/sections/Chapter';
import { Bridge } from '@frontend/components/story/Bridge';
import { ChapterRail } from '@frontend/components/story/ChapterRail';
import { Closing } from '@frontend/components/sections/Closing';
import { DateLedger } from '@frontend/components/sections/DateLedger';
import { Door } from '@frontend/components/sections/Door';
import { CommitteePlacard, seatsOpen } from '@frontend/components/sections/Placards';
import { Steps } from '@frontend/components/sections/Steps';
import { FactList } from '@frontend/components/ui/Editorial';
import { PageHero } from '@frontend/components/ui/PageHero';
import { getCommittees, getCopy, getDocuments, getSiteConfig } from '@backend/lib/content';
import { chapterNumbers, fill } from '@shared/lib/copy';
import { constructMetadata } from '@frontend/lib/metadata';
import { canRegister, serverRenderTime } from '@shared/lib/phase';
import { formatEventDate, getEventYear } from '@shared/lib/site-config';
import { addDays, formatDateRange } from '@frontend/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `GIMUN ${getEventYear(await getSiteConfig())} | GIKI Model United Nations`,
    description: `Committees, format, fees and key dates for GIKI Model United Nations ${getEventYear(await getSiteConfig())}. Register on your own or as a delegation.`,
    path: '/gimun',
    image: '/images/og/gimun.jpg',
  });
}

export default async function GimunOverviewPage() {
  const [committees, site, documents, copy] = await Promise.all([getCommittees(), getSiteConfig(), getDocuments(), getCopy('gimun')]);
  const now = serverRenderTime();
  const open = canRegister(site, 'gimun', now);
  const guides = documents.filter((d) => d.track === 'gimun' && d.type === 'background-guide');
  const seats = committees.reduce((sum, c) => sum + (c.countryList?.length ?? 0), 0);
  const openSeats = committees.reduce((sum, c) => sum + seatsOpen(c), 0);
  const hero = copy('gimun-hero');
  const how = copy('gimun-how');
  const chambers = copy('gimun-chambers');
  const entry = copy('gimun-entry');
  const dates = copy('gimun-dates');
  const closing = copy('gimun-closing');
  // "How a committee works" carries the hero hand-off, so it is always shown.
  const chapter = chapterNumbers(copy, ['gimun-how', 'gimun-chambers', 'gimun-entry', 'gimun-dates', 'gimun-closing']);
  const vars = { committees: committees.length, year: getEventYear(site) };
  const [individual, delegation] = entry.items ?? [];
  const register = { label: open ? 'Register for GIMUN' : 'Registration status', href: '/register?track=gimun' };

  return (
    <>
      <ChapterRail />
      <div className="handoff">
        <div className="handoff__stage">
          <div className="handoff__scene">
            <PageHero
              variant="gimun"
              meta={['Model United Nations', formatDateRange(site.eventDates.start, site.eventDates.end), 'GIKI, Topi']}
              title={fill(hero.title, vars)}
              accentPhrase={hero.accentPhrase}
              description={fill(hero.lead, vars)}
              actions={[
                { ...register, variant: 'track-gimun' },
                { label: 'Browse committees', href: '/gimun/committees', variant: 'secondary' },
              ]}
              aside={
                <div className="glance">
                  <LiveArt className="glance__art">
                    <GlobeArt live className="w-full" />
                  </LiveArt>
                  <p className="glance__title">At a glance</p>
                  <FactList
                    items={[
                      { term: 'Committees', value: committees.map((c) => c.slug.toUpperCase()).join(' · ') },
                      { term: 'Seats open', value: `${openSeats} of ${seats}` },
                      { term: 'Enter as', value: 'An individual, or a delegation of 2 to 20' },
                      { term: 'Awards', value: 'Best Delegate, Outstanding Delegate, Best Delegation' },
                      { term: 'Applications close', value: formatEventDate(site.registrationDeadlines.gimun) },
                    ]}
                  />
                </div>
              }
            />
          </div>
          <div className="handoff__dim" aria-hidden="true" />
          <HandoffStage />
        </div>

        {/* How a committee works, step by step */}
        <section className="handoff__sheet tone-deep chapter" aria-labelledby="how-title">
          <div className="wrap steps-split">
            <div className="steps-split__head">
              <ChapterHead
                id="how-title"
                chapter={chapter['gimun-how']}
                act={how.kicker}
                split={false}
                reveal
                title={fill(how.title, vars)}
                lead={fill(how.lead, vars)}
              >
                <Link href="/gimun/rules" className="text-link w-fit">
                  Rules of procedure
                </Link>
              </ChapterHead>
            </div>
            <Steps steps={(how.items ?? []).map((item) => ({ title: fill(item.title, vars), body: fill(item.body, vars) }))} accent="gimun" />
          </div>
          <div className="wrap">
            {how.bridge && !chambers.hidden && <Bridge to="committees-title">{fill(how.bridge, vars)}</Bridge>}
          </div>
        </section>
      </div>

      {/* The committees */}
      {!chambers.hidden && (
      <section className="chapter" aria-labelledby="committees-title">
        <div className="wrap">
          <ChapterHead
            id="committees-title"
            chapter={chapter['gimun-chambers']}
            act={chambers.kicker}
            title={fill(chambers.title, vars)}
            lead={
              <>
                {fill(chambers.lead, vars)}
                {guides.length > 0 && ` ${guides.length} background guides are in the resource library.`}
              </>
            }
          >
            <div className="flex flex-wrap gap-x-6 gap-y-3 lg:col-span-2">
              <Link href="/gimun/committees" className="text-link">
                All committees
              </Link>
              {guides.length > 0 && (
                <Link href="/resources" className="text-link">
                  Background guides
                </Link>
              )}
            </div>
          </ChapterHead>
          <div className="placard-grid">
            {committees.map((committee) => (
              <CommitteePlacard key={committee.id} committee={committee} />
            ))}
          </div>
          {chambers.bridge && !entry.hidden && <Bridge to="entry-title">{fill(chambers.bridge, vars)}</Bridge>}
        </div>
      </section>
      )}

      {/* Two ways in, each priced where it is read */}
      {!entry.hidden && (
      <section className="chapter" aria-labelledby="entry-title">
        <div className="wrap">
          <ChapterHead
            id="entry-title"
            chapter={chapter['gimun-entry']}
            act={entry.kicker}
            title={fill(entry.title, vars)}
            lead={fill(entry.lead, vars)}
          />
          <div className="doors">
            <Door
              id="door-individual"
              accent="gimun"
              label={individual?.meta ?? 'Individual delegate'}
              title={fill(individual?.title, vars)}
              copy={fill(individual?.body, vars)}
              facts={[
                { term: 'Fee', value: `${site.fees.gimunIndividual} per delegate` },
                { term: 'Preferences', value: 'Three committees' },
                { term: 'Awards', value: 'Individual awards' },
                { term: 'Included', value: 'Kit, meals, socials' },
              ]}
              action={{ label: open ? 'Register as an individual' : 'Registration status', href: '/register?track=gimun&type=individual' }}
            />
            <Door
              id="door-delegation"
              accent="gimun"
              label={delegation?.meta ?? 'Institutional delegation'}
              title={fill(delegation?.title, vars)}
              copy={fill(delegation?.body, vars)}
              facts={[
                { term: 'Fee', value: `${site.fees.gimunDelegationPerDelegate} per delegate` },
                { term: 'Roster', value: '2 to 20 delegates' },
                { term: 'Awards', value: 'Contends for Best Delegation' },
                { term: 'Invoice', value: 'One for the institution' },
              ]}
              action={{ label: open ? 'Register a delegation' : 'Registration status', href: '/register?track=gimun&type=delegation' }}
            />
          </div>
          <p className="mt-8 max-w-3xl text-small text-text-3">
            {entry.note && <>{fill(entry.note, vars)} </>}
            <Link href="/about/faq#fees" className="text-link">
              Fees and refunds
            </Link>
          </p>
        </div>
      </section>
      )}

      {/* Key dates, on the paper sheet */}
      {!dates.hidden && (
      <section className="sheet tone-inverse" aria-labelledby="dates-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead id="dates-title" chapter={chapter['gimun-dates']} act={dates.kicker} title={fill(dates.title, vars)} lead={fill(dates.lead, vars)} />
          <DateLedger
            now={now}
            className="dates--flush"
            dates={[
              { iso: site.registrationDeadlines.gimun, what: 'Applications close', note: 'Individuals and delegations' },
              { iso: addDays(site.eventDates.start, -7), what: 'Position papers due', note: 'At least 7 days before Day 1, to your committee’s chairs' },
              { iso: site.eventDates.start, what: 'Conference opens', note: site.checkinDesk ?? 'Check-in from 09:00' },
              ...(site.galaDate ? [{ iso: site.galaDate, what: 'Awards gala', note: 'Best Delegate, Outstanding Delegate, Best Delegation' }] : []),
            ]}
          />
        </div>
      </section>
      )}

      <Closing
        id="closing-title"
        chapter={chapter['gimun-closing']}
        act={closing.kicker}
        title={fill(closing.title, vars)}
        lead={fill(closing.lead, vars)}
        actions={[
          { ...register, variant: 'track-gimun' },
          { label: 'Rules of procedure', href: '/gimun/rules', variant: 'secondary' },
        ]}
      />
    </>
  );
}
