import type { Metadata } from 'next';
import { GlobeArt } from '@/components/art/LineArt';
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
import { getCommittees, getDocuments, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { canRegister, serverRenderTime } from '@/lib/phase';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { addDays, formatDateRange } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `GIMUN ${getEventYear(await getSiteConfig())} | GIKI Model United Nations`,
    description: `Committees, format, fees and key dates for GIKI Model United Nations ${getEventYear(await getSiteConfig())}. Register on your own or as a delegation.`,
    path: '/gimun',
    image: '/images/og/gimun.jpg',
  });
}

const HOW_IT_WORKS = [
  {
    title: 'Receive a country',
    body: 'The secretariat assigns you a country and a committee. You research its foreign policy and represent it, whatever your own view.',
  },
  {
    title: 'Speak and caucus',
    body: 'Formal speeches from the speakers’ list, then moderated caucuses on specific sub-issues under tight time limits.',
  },
  {
    title: 'Build a bloc',
    body: 'In unmoderated time you negotiate with allies and rivals to assemble the votes a resolution needs.',
  },
  {
    title: 'Pass a resolution',
    body: 'Sponsor a draft, defend its operative clauses through amendments, and carry it to a final vote.',
  },
];

export default async function GimunOverviewPage() {
  const [committees, site, documents] = await Promise.all([getCommittees(), getSiteConfig(), getDocuments()]);
  const now = serverRenderTime();
  const open = canRegister(site, 'gimun', now);
  const guides = documents.filter((d) => d.track === 'gimun' && d.type === 'background-guide');
  const seats = committees.reduce((sum, c) => sum + (c.countryList?.length ?? 0), 0);
  const openSeats = committees.reduce((sum, c) => sum + seatsOpen(c), 0);
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
              title="Represent a nation. Win the room."
              accentPhrase="Win the room."
              description={`GIKI Model United Nations brings student delegates to Topi for ${committees.length} committees of debate, negotiation and crisis.`}
              actions={[
                { ...register, variant: 'track-gimun' },
                { label: 'Browse committees', href: '/gimun/committees', variant: 'secondary' },
              ]}
              aside={
                <div className="glance">
                  <GlobeArt className="glance__art" />
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
                chapter={1}
                act="How a committee works"
                split={false}
                reveal
                title="Four days, one resolution."
                lead="First conference or fifteenth, the format is the same: represent your country, find allies, and get your text passed."
              >
                <Link href="/gimun/rules" className="text-link w-fit">
                  Rules of procedure
                </Link>
              </ChapterHead>
            </div>
            <Steps steps={HOW_IT_WORKS} accent="gimun" />
          </div>
          <div className="wrap">
            <Bridge to="committees-title">Every resolution starts in a chamber. These are this year&apos;s.</Bridge>
          </div>
        </section>
      </div>

      {/* The committees */}
      <section className="chapter" aria-labelledby="committees-title">
        <div className="wrap">
          <ChapterHead
            id="committees-title"
            chapter={2}
            act="The chambers"
            title={`${committees.length} chambers for ${getEventYear(site)}.`}
            lead={
              <>
                Each committee page has its agenda, background guide and the countries still open for allocation.
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
          <Bridge to="entry-title">Found your chamber? Here is how to take a seat in it.</Bridge>
        </div>
      </section>

      {/* Two ways in, each priced where it is read */}
      <section className="chapter" aria-labelledby="entry-title">
        <div className="wrap">
          <ChapterHead
            id="entry-title"
            chapter={3}
            act="Two ways in"
            title="On your own, or with your institution."
            lead="Nothing is charged when you apply. If your application is accepted, the organizing team emails an invoice with bank transfer details."
          />
          <div className="doors">
            <Door
              id="door-individual"
              accent="gimun"
              label="Individual delegate"
              title="Apply on your own"
              copy="For students applying on their own. Rank three committees; the secretariat allocates your country."
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
              label="Institutional delegation"
              title="Bring a delegation"
              copy="A head delegate or faculty advisor registers the whole team, 2 to 20 delegates, in one form."
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
            On-campus accommodation is available on request.{' '}
            <Link href="/about/faq#fees" className="text-link">
              Fees and refunds
            </Link>
          </p>
        </div>
      </section>

      {/* Key dates, on the paper sheet */}
      <section className="sheet tone-inverse" aria-labelledby="dates-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead id="dates-title" chapter={4} act="The clock" title="GIMUN key dates." lead="Deadlines are 23:59 Pakistan time." />
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

      <Closing
        id="closing-title"
        chapter={5}
        act="Take a seat"
        title="Ready to take a seat?"
        lead="Rank three committees when you apply. Countries are allocated after the secretariat reviews your application."
        actions={[
          { ...register, variant: 'track-gimun' },
          { label: 'Rules of procedure', href: '/gimun/rules', variant: 'secondary' },
        ]}
      />
    </>
  );
}
