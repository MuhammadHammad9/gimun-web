import type { Metadata } from 'next';
import { BracketArt, ScalesArt } from '@/components/art/LineArt';
import { LiveArt } from '@/components/art/LiveArt';
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
import { getCopy, getMootCategories, getSiteConfig } from '@/lib/content';
import { chapterNumbers, fill } from '@/lib/copy';
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

export default async function MootCupOverviewPage() {
  const [categories, site, copy] = await Promise.all([getMootCategories(), getSiteConfig(), getCopy('moot-cup')]);
  const now = serverRenderTime();
  const open = canRegister(site, 'mootCup', now);
  const scoring = site.mootScoring;
  const hero = copy('moot-hero');
  const how = copy('moot-how');
  const cases = copy('moot-cases');
  const team = copy('moot-team');
  const dates = copy('moot-dates');
  const closing = copy('moot-closing');
  // "From problem to final" carries the hero hand-off, so it is always shown.
  const chapter = chapterNumbers(copy, ['moot-how', 'moot-cases', 'moot-team', 'moot-dates', 'moot-closing']);
  const vars = { cases: categories.length, year: getEventYear(site) };
  const lines = (text?: string) => fill(text, vars).split('\n').map((line) => line.trim()).filter(Boolean);
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
              title={fill(hero.title, vars)}
              accentPhrase={hero.accentPhrase}
              description={fill(hero.lead, vars)}
              actions={[
                { ...register, variant: 'track-moot' },
                { label: 'Problem categories', href: '/moot-cup/categories', variant: 'secondary' },
              ]}
              aside={
                <div className="glance glance--gmc">
                  <LiveArt className="glance__art">
                    <ScalesArt live className="w-full" />
                  </LiveArt>
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
                chapter={chapter['moot-how']}
                act={how.kicker}
                split={false}
                reveal
                title={fill(how.title, vars)}
                lead={fill(how.lead, vars)}
              >
                <Link href="/moot-cup/rules" className="text-link w-fit">
                  Rules &amp; memorials
                </Link>
              </ChapterHead>
              <BracketArt className="steps-art draw-on-scroll" />
            </div>
            <Steps steps={(how.items ?? []).map((item) => ({ title: fill(item.title, vars), body: fill(item.body, vars) }))} accent="gmc" />
          </div>
          <div className="wrap">
            {how.bridge && !cases.hidden && <Bridge to="categories-title">{fill(how.bridge, vars)}</Bridge>}
          </div>
        </section>
      </div>

      {/* The case categories */}
      {!cases.hidden && (
      <section className="chapter" aria-labelledby="categories-title">
        <div className="wrap">
          <ChapterHead
            id="categories-title"
            chapter={chapter['moot-cases']}
            act={cases.kicker}
            title={fill(cases.title, vars)}
            lead={fill(cases.lead, vars)}
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
          {cases.bridge && !team.hidden && <Bridge to="team-title">{fill(cases.bridge, vars)}</Bridge>}
        </div>
      </section>
      )}

      {/* Who can enter, and the fee */}
      {!team.hidden && (
      <section className="chapter" aria-labelledby="team-title">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <ChapterHead id="team-title" chapter={chapter['moot-team']} act={team.kicker} split={false} title={fill(team.title, vars)} />
            <FactList
              items={[
                ...(team.items ?? []).map((item) => ({ term: fill(item.title, vars), value: fill(item.body, vars) })),
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
              {lines(team.body).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {team.note && <p className="mt-6 text-small text-text-3">{fill(team.note, vars)}</p>}
            <div className="mt-8">
              <Button variant="track-moot" href={register.href} withArrow>
                {register.label}
              </Button>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Key dates, on the paper sheet */}
      {!dates.hidden && (
      <section className="sheet tone-inverse" aria-labelledby="dates-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead id="dates-title" chapter={chapter['moot-dates']} act={dates.kicker} title={fill(dates.title, vars)} lead={fill(dates.lead, vars)} />
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
      )}

      <Closing
        id="closing-title"
        chapter={chapter['moot-closing']}
        act={closing.kicker}
        title={fill(closing.title, vars)}
        lead={fill(closing.lead, vars)}
        actions={[
          { ...register, variant: 'track-moot' },
          { label: 'Rules & memorials', href: '/moot-cup/rules', variant: 'secondary' },
        ]}
      />
    </>
  );
}
