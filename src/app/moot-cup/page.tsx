import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import { CtaBanner } from '@/components/ui/CtaBanner';
import { KeyDates } from '@/components/ui/KeyDates';
import { Bezel, Eyebrow, FactList, Ledger, PageSection, SectionHeading, Steps, TextLink } from '@/components/ui/Editorial';
import { getMootCategories, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { canRegister } from '@/lib/phase';
import { formatEventDate, formatPublishedDate, getEventYear } from '@/lib/site-config';

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
  const [categories, siteConfig] = await Promise.all([getMootCategories(), getSiteConfig()]);
  const open = canRegister(siteConfig, 'mootCup');
  const scoring = siteConfig.mootScoring;

  return (
    <div className="pb-24">
      <PageHero
        variant="moot"
        eyebrow={<Eyebrow>Track 02 · GIKI Moot Court</Eyebrow>}
        title="Read the problem. Argue the law."
        accentWords={['law.']}
        description="The GIKI Moot Court is an appellate advocacy competition for law students: written memorials for both sides, then oral rounds before benches of legal practitioners."
        actions={[
          { label: open ? 'Register your team' : 'Registration status', href: '/register?track=moot-cup', variant: 'track-moot' },
          { label: 'Problem categories', href: '/moot-cup/categories', variant: 'secondary' },
        ]}
        aside={
          <Bezel>
            <div className="p-7 sm:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">At a glance</p>
              <FactList
                className="mt-4"
                items={[
                  { term: 'Team', value: '2–4 members: two oralists, up to two researchers' },
                  { term: 'Written round', value: 'Applicant and Respondent memorials' },
                  { term: 'Scoring', value: scoring ? `Memorial ${scoring.memorialWeight}% · Oral ${scoring.oralWeight}%` : 'Published with the rules' },
                  { term: 'Awards', value: 'Champions, Best Memorial, Best Oralist' },
                  { term: 'Registration closes', value: formatEventDate(siteConfig.registrationDeadlines.mootCup) },
                ]}
              />
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <TextLink href="/moot-cup/rules">Rules &amp; memorials</TextLink>
                <TextLink href="/moot-cup/clarifications">Clarifications</TextLink>
              </div>
            </div>
          </Bezel>
        }
      />

      <div className="space-y-28 pt-24 md:space-y-36">
        <PageSection labelledBy="how-heading">
          <SectionHeading
            id="how-heading"
            eyebrow="How it works"
            title="From problem to Grand Final"
            lead="Moot court is an appeal hearing, not a trial. You argue points of law directly to the judges, who will interrupt you."
            className="mb-14"
          />
          <Steps steps={HOW_IT_WORKS} />
        </PageSection>

        <PageSection labelledBy="team-heading" className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading id="team-heading" eyebrow="Who can enter" title="A team of law students" className="mb-10" />
            <FactList
              items={[
                { term: 'Eligibility', value: 'Students currently enrolled in an LL.B. or equivalent law programme, or a university moot court society.' },
                { term: 'Team size', value: 'Two oralists and up to two researchers. Several teams from one institution are welcome.' },
                { term: 'Anonymity', value: 'Memorials and rounds use a team code only. Names or institutions in a memorial are penalised.' },
                { term: 'Memorials due', value: siteConfig.memorialDeadline ? `${formatEventDate(siteConfig.memorialDeadline)}, 23:59 Pakistan time` : 'Announced with the problem' },
              ]}
            />
          </div>
          <Bezel className="self-start">
            <div className="p-8 sm:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">Team fee</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-display font-medium tracking-tight text-text tabular-nums">{siteConfig.fees.mootCupTeam}</span>
                <span className="text-sm text-text-4">per team</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {['Memorial scoring with written feedback', 'All rounds, meals on conference days and socials', 'Accommodation on request, confirmed on acceptance'].map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-text-2">
                    <span aria-hidden="true" className="mt-2 h-1 w-3 shrink-0 rounded-full bg-champagne" />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-text-3">
                Nothing is charged when you apply. Accepted teams receive an invoice with bank transfer details.
              </p>
              <div className="mt-8">
                <Button variant="track-moot" href="/register?track=moot-cup" withArrow>
                  {open ? 'Register your team' : 'Registration status'}
                </Button>
              </div>
            </div>
          </Bezel>
        </PageSection>

        <KeyDates
          title="GMC key dates"
          dates={[
            { label: 'Registration closes', date: siteConfig.registrationDeadlines.mootCup, note: '23:59 Pakistan time' },
            { label: 'Memorials due', date: siteConfig.memorialDeadline, note: '23:59 Pakistan time, by email' },
            { label: 'Preliminary rounds', date: siteConfig.eventDates.start },
            { label: 'Grand Final', date: siteConfig.galaDate },
          ]}
        />

        <PageSection labelledBy="categories-heading" className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              stacked
              id="categories-heading"
              eyebrow="Problem categories"
              title={`${categories.length} areas of law`}
              lead="Choose the category your team prefers when you register. Questions about the problem go through the clarifications log, answered for every team at once."
              action={{ label: 'All categories', href: '/moot-cup/categories' }}
            />
          </div>
          <Ledger
            rows={categories.map((cat) => ({
              key: cat.id,
              href: '/moot-cup/categories',
              title: cat.name,
              description: cat.description,
              meta: [cat.areaOfLaw, `Revised ${formatPublishedDate(cat.lastUpdated)}`],
            }))}
          />
        </PageSection>

        <PageSection>
          <CtaBanner
            eyebrow={open ? 'Registration open' : undefined}
            title="Bring your best advocates"
            description="Register the team now and add the final roster details before the deadline. Clarification questions are open to every registered team."
            footnote="No payment is taken online"
            actions={[
              { label: open ? 'Register your team' : 'Registration status', href: '/register?track=moot-cup', variant: 'track-moot' },
              { label: 'Rules & memorials', href: '/moot-cup/rules', variant: 'secondary' },
            ]}
          />
        </PageSection>
      </div>
    </div>
  );
}
