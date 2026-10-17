import type { Metadata } from 'next';
import { GlobeArt } from '@/components/art/LineArt';
import { LiveArt } from '@/components/art/LiveArt';
import { HandoffStage } from '@/components/motion/HandoffStage';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ChapterHead } from '@/components/sections/Chapter';
import { Bridge } from '@/components/story/Bridge';
import { ChapterRail } from '@/components/story/ChapterRail';
import { Closing } from '@/components/sections/Closing';
import { DateLedger } from '@/components/sections/DateLedger';
import { Door } from '@/components/sections/Door';
import { CommitteePlacard, seatsOpen } from '@/components/sections/Placards';
import { Steps } from '@/components/sections/Steps';
import { FactList } from '@/components/ui/Editorial';
import { PageHero } from '@/components/ui/PageHero';
import { getCommittees, getCopy, getDocuments, getSiteConfig } from '@/lib/content';
import { chapterNumbers, fill } from '@/lib/copy';
import { constructMetadata } from '@/lib/metadata';
import { SHARE_IMAGES } from '@/lib/share-images';
import { canRegister, serverRenderTime } from '@/lib/phase';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { currentFeeTier, gimunFees, rupees, tierEndDates } from '@/lib/fee-tiers';
import { formatDateRange } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `GIMUN ${getEventYear(await getSiteConfig())} | GIKI Model United Nations`,
    description: `Committees, format, fees and key dates for GIKI Model United Nations ${getEventYear(await getSiteConfig())}. Five committees, hosted by SOPHEP at GIK Institute, 4 to 6 December 2026. Register as a delegate, a delegation or an observer.`,
    path: '/gimun',
    image: SHARE_IMAGES.gimun,
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
  const register = { label: open ? 'Register for GIMUN' : 'Registration status', href: '/register#gimun' };
  const tier = currentFeeTier(site, 'gimun', now);
  const fees = tier ? gimunFees(site, tier.key) : null;
  const tierEnds = tierEndDates(site, 'gimun');

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
                      ...(seats > 0 ? [{ term: 'Seats open', value: `${openSeats} of ${seats}` }] : []),
                      { term: 'Enter as', value: 'A delegate, a delegation or an observer' },
                      { term: 'Eligibility', value: '18 or older; entry on CNIC' },
                      ...(tier ? [{ term: 'Fees now', value: `${tier.label}${tier.endsOn ? `, until ${formatEventDate(tier.endsOn, { year: undefined })}` : ''}` }] : []),
                      { term: 'Registration closes', value: formatEventDate(site.registrationDeadlines.gimun) },
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
                ...(fees && tier ? [{ term: `Fee (${tier.label})`, value: `${rupees(fees.delegate)} per delegate` }] : []),
                ...(fees ? [{ term: 'Observer', value: `${rupees(fees.observer)}, no speaking or voting rights` }] : []),
                { term: 'Accommodation', value: 'Free, shared student hostels' },
                { term: 'Transport', value: 'Free from Islamabad/Rawalpindi and Peshawar' },
              ]}
              action={{ label: open ? 'Register as a delegate' : 'Registration status', href: '/register#gimun' }}
            />
            <Door
              id="door-delegation"
              accent="gimun"
              label={delegation?.meta ?? 'Institutional delegation'}
              title={fill(delegation?.title, vars)}
              copy={fill(delegation?.body, vars)}
              facts={[
                ...(fees && tier ? [{ term: `Fee (${tier.label})`, value: `${rupees(fees.delegationMember)} per member${fees.delegationFee ? `, plus ${rupees(fees.delegationFee)} per delegation` : ''}` }] : []),
                { term: 'Teams', value: 'Up to 5 per institution, 3 members each' },
                { term: 'Head delegate', value: 'One per institution, for all correspondence' },
                ...(fees ? [{ term: 'Chaperone', value: rupees(fees.chaperone) }] : []),
              ]}
              action={{ label: open ? 'Register a delegation' : 'Registration status', href: '/register#gimun' }}
            />
          </div>
          <p className="mt-8 max-w-3xl text-small text-text-3">
            {entry.note && <>{fill(entry.note, vars)} </>}
            <Link href="/register#gimun" className="text-link">
              The full fee structure
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
              ...(tierEnds.earlyBird ? [{ iso: tierEnds.earlyBird, what: 'Early Bird registrations end', note: 'Normal fees apply from the next day' }] : []),
              ...(tierEnds.normal ? [{ iso: tierEnds.normal, what: 'Normal registrations end', note: 'Late fees apply from the next day' }] : []),
              { iso: site.registrationDeadlines.gimun, what: 'Registration closes', note: 'Delegates, delegations and observers' },
              { iso: site.eventDates.start, what: 'Conference opens', note: site.checkinDesk ?? 'Bring your original CNIC' },
              { iso: site.eventDates.end, what: 'Final day', note: 'Committee sessions close' },
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
