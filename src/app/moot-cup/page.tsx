import type { Metadata } from 'next';
import { BracketArt, ScalesArt } from '@/components/art/LineArt';
import { HandoffStage } from '@/components/motion/HandoffStage';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ChapterHead } from '@/components/sections/Chapter';
import { Bridge } from '@/components/story/Bridge';
import { ChapterRail } from '@/components/story/ChapterRail';
import { Closing } from '@/components/sections/Closing';
import { DateLedger } from '@/components/sections/DateLedger';
import { CasePlacard } from '@/components/sections/Placards';
import { Steps } from '@/components/sections/Steps';
import { Button } from '@/components/ui/Button';
import { FactList } from '@/components/ui/Editorial';
import { PageHero } from '@/components/ui/PageHero';
import { getMootCategories, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { canRegister, serverRenderTime } from '@/lib/phase';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { formatDateRange } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `GMC ${getEventYear(await getSiteConfig())} | GIKI Moot Court`,
    description: `Problem categories, format, team rules, fees and key dates for the GIKI Moot Court ${getEventYear(await getSiteConfig())}.`,
    path: '/moot-cup',
    image: '/images/og/moot-cup.jpg',
  });
}

const HOW_IT_WORKS = [
  {
    title: 'Take the problem',
    body: 'Every team receives the same moot problem (the compromis): a dispute on a point of law, with no witnesses and no new facts.',
  },
  {
    title: 'Write both sides',
    body: 'Draft a memorial for the Applicant and one for the Respondent, cited in OSCOLA and submitted anonymously under a team code.',
  },
  {
    title: 'Argue before the bench',
    body: 'Two oralists share 30 minutes per side and answer the judges’ questions as they come, then reserve time for rebuttal.',
  },
  {
    title: 'Advance to the final',
    body: 'After two guaranteed preliminary rounds the strongest teams go through the quarter-finals and semi-finals to the Grand Final.',
  },
];

export default async function MootCupOverviewPage() {
  const [categories, site] = await Promise.all([getMootCategories(), getSiteConfig()]);
  const now = serverRenderTime();
  const open = canRegister(site, 'mootCup', now);
  const scoring = site.mootScoring;
  const register = { label: open ? 'Register your team' : 'Registration status', href: '/register?track=moot-cup' };

  return (
    <>
      <ChapterRail />
      <div className="handoff">
        <div className="handoff__stage">
          <div className="handoff__scene">
            <PageHero
              variant="moot"
              meta={['Moot court', formatDateRange(site.eventDates.start, site.eventDates.end), 'GIKI, Topi']}
              title="Read the problem. Argue the law."
              accentPhrase="Argue the law."
              description="An appellate advocacy competition for law students: written memorials for both sides, then oral rounds before benches of legal practitioners."
              actions={[
                { ...register, variant: 'track-moot' },
                { label: 'Problem categories', href: '/moot-cup/categories', variant: 'secondary' },
              ]}
              aside={
                <div className="glance glance--gmc">
                  <ScalesArt className="glance__art" />
                  <p className="glance__title">At a glance</p>
                  <FactList
                    items={[
                      { term: 'Team', value: '2 to 4 members: two oralists, up to two researchers' },
                      { term: 'Written round', value: 'Applicant and Respondent memorials' },
                      { term: 'Scoring', value: scoring ? `Memorial ${scoring.memorialWeight}% · Oral ${scoring.oralWeight}%` : 'Published with the rules' },
                      { term: 'Awards', value: 'Champions, Best Memorial, Best Oralist' },
                      { term: 'Applications close', value: formatEventDate(site.registrationDeadlines.mootCup) },
                    ]}
                  />
                </div>
              }
            />
          </div>
          <div className="handoff__dim" aria-hidden="true" />
          <HandoffStage />
        </div>

        {/* From the problem to the Grand Final, with the knockout drawn beside it */}
        <section className="handoff__sheet tone-deep chapter" aria-labelledby="how-title">
          <div className="wrap steps-split">
            <div className="steps-split__head">
              <ChapterHead
                id="how-title"
                chapter={1}
                act="From problem to final"
                split={false}
                reveal
                title="From problem to Grand Final."
                lead="Moot court is an appeal hearing, not a trial. You argue points of law directly to the judges, who will interrupt you."
              >
                <Link href="/moot-cup/rules" className="text-link w-fit">
                  Rules &amp; memorials
                </Link>
              </ChapterHead>
              <BracketArt className="steps-art draw-on-scroll" />
            </div>
            <Steps steps={HOW_IT_WORKS} accent="gmc" />
          </div>
          <div className="wrap">
            <Bridge to="categories-title">It all starts with one problem. These are the areas of law it can come from.</Bridge>
          </div>
        </section>
      </div>

      {/* The case categories */}
      <section className="chapter" aria-labelledby="categories-title">
        <div className="wrap">
          <ChapterHead
            id="categories-title"
            chapter={2}
            act="The cases"
            title={`${categories.length} areas of law.`}
            lead="Choose the category your team prefers when you register. Questions about the problem go through the clarifications log, answered for every team at once."
          >
            <div className="flex flex-wrap gap-x-6 gap-y-3 lg:col-span-2">
              <Link href="/moot-cup/categories" className="text-link">
                All categories
              </Link>
              <Link href="/moot-cup/clarifications" className="text-link">
                Clarifications
              </Link>
            </div>
          </ChapterHead>
          <div className="placard-grid placard-grid--three">
            {categories.map((category) => (
              <CasePlacard key={category.id} category={category} />
            ))}
          </div>
          <Bridge to="team-title">Picked your area? Now the people who will argue it.</Bridge>
        </div>
      </section>

      {/* Who can enter, and the fee */}
      <section className="chapter" aria-labelledby="team-title">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <ChapterHead id="team-title" chapter={3} act="Your team" split={false} title="A team of law students." />
            <FactList
              items={[
                { term: 'Eligibility', value: 'Students enrolled in an LL.B. or equivalent law programme, or a member of a university moot court society.' },
                { term: 'Team size', value: 'Two oralists and up to two researchers. Several teams from one institution are welcome.' },
                { term: 'Anonymity', value: 'Memorials and rounds use a team code only. Names or institutions in a memorial are penalised.' },
                { term: 'Memorials due', value: site.memorialDeadline ? `${formatEventDate(site.memorialDeadline)}, 23:59 Pakistan time` : 'Announced with the problem' },
              ]}
            />
          </div>
          <div className="glance glance--gmc self-start">
            <p className="glance__title">Team fee</p>
            <p className="flex items-baseline gap-2">
              <span className="font-display text-[2.75rem] font-medium tracking-tight text-text" data-numeric="">
                {site.fees.mootCupTeam}
              </span>
              <span className="text-small text-text-3">per team</span>
            </p>
            <ul className="stack__list">
              <li>All rounds, lunch and tea on conference days, evening socials</li>
              <li>Accommodation on request, confirmed on acceptance</li>
            </ul>
            <p className="mt-6 text-small text-text-3">Nothing is charged when you apply. Accepted teams receive an invoice with bank transfer details.</p>
            <div className="mt-8">
              <Button variant="track-moot" href={register.href} withArrow>
                {register.label}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key dates, on the paper sheet */}
      <section className="sheet tone-inverse" aria-labelledby="dates-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead id="dates-title" chapter={4} act="The clock" title="GMC key dates." lead="Deadlines are 23:59 Pakistan time." />
          <DateLedger
            now={now}
            className="dates--flush"
            dates={[
              { iso: site.registrationDeadlines.mootCup, what: 'Applications close', note: 'Teams of two to four' },
              ...(site.memorialDeadline ? [{ iso: site.memorialDeadline, what: 'Memorials due', note: 'By email to the moot court address, both sides' }] : []),
              { iso: site.eventDates.start, what: 'Preliminary rounds begin', note: 'Two guaranteed rounds for every team' },
              ...(site.galaDate ? [{ iso: site.galaDate, what: 'Grand Final', note: 'Before the full bench, then the awards gala' }] : []),
            ]}
          />
        </div>
      </section>

      <Closing
        id="closing-title"
        chapter={5}
        act="Your bench"
        title="Bring your best advocates."
        lead="Register the team now and add the final roster details before the deadline. Clarification questions are open to every registered team."
        actions={[
          { ...register, variant: 'track-moot' },
          { label: 'Rules & memorials', href: '/moot-cup/rules', variant: 'secondary' },
        ]}
      />
    </>
  );
}
