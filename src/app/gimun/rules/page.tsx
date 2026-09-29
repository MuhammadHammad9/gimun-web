import type { Metadata } from 'next';
import { GlobeArt } from '@/components/art/LineArt';
import { ChapterHead } from '@/components/sections/Chapter';
import { Steps } from '@/components/sections/Steps';
import { HelpCallout } from '@/components/ui/HelpCallout';
import { PageHero } from '@/components/ui/PageHero';
import { getDocuments, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { GimunRulesClient } from './GimunRulesClient';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `Rules of Procedure | GIMUN ${getEventYear(await getSiteConfig())}`,
    path: '/gimun/rules',
    description: `How debate runs at GIMUN ${getEventYear(await getSiteConfig())}: roll call, the speakers list, caucuses, resolutions, voting, and every motion in order of precedence.`,
  });
}

const STAGES = [
  {
    title: 'Roll call and quorum',
    body: "The chairs read the country roster. Answer 'Present' to keep the right to abstain on resolutions, or 'Present and voting' to give it up and vote Yes or No. Quorum is one third of assigned countries. Tip: say 'Present' if you may need to stay neutral.",
  },
  {
    title: 'General speakers list',
    body: 'Speeches of 90 seconds by default; the list stays open across sessions. Finish early and you must yield your remaining time. Tip: yielding to points of information shows command of your position.',
  },
  {
    title: 'Caucuses',
    body: 'Between speeches, move a moderated caucus to debate one sub-issue, or an unmoderated caucus to negotiate, draft clauses and merge blocs. Tip: keep a moderated caucus topic narrow so speeches stay concrete.',
  },
  {
    title: 'Drafting a resolution',
    body: 'Blocs combine preambulatory and operative clauses. Once the chairs approve format and mandate, the text gets a draft resolution code and is introduced to the room. Tip: two or three active authors amend faster than a long sponsor list.',
  },
  {
    title: 'Voting',
    body: 'A two-thirds motion closes debate and the doors close. Amendments are voted first, then draft resolutions in the order they were tabled. Tip: in a roll-call vote you may pass once; on the second call you must vote.',
  },
];

const YIELDS = [
  { title: 'to the chair', body: 'Your remaining seconds return to the chairs. The floor reopens for motions or the next speaker, and no questions may be put to you.', quote: 'The delegate of France yields the remaining time to the chair.' },
  { title: 'to another delegate', body: 'Your time passes to an ally, who may accept or decline. If they accept, they speak for the remainder but cannot yield again.', quote: 'I yield my remaining time to the distinguished delegate of Japan.' },
  { title: 'to points of information', body: 'The floor may question you. The chairs recognize non-argumentative questions, and answers come out of your remaining time.', quote: 'I yield my remaining time to points of information.' },
];

export default async function GimunRulesPage() {
  const rules = (await getDocuments()).find((d) => d.track === 'gimun' && d.type === 'rules');

  return (
    <>
      <PageHero
        variant="gimun"
        breadcrumbs={[{ label: 'GIMUN', href: '/gimun' }, { label: 'Rules of procedure' }]}
        meta={['Parliamentary procedure', `${STAGES.length} stages`, 'Motions in order of precedence']}
        title="Rules of procedure."
        accentPhrase="procedure."
        description="GIMUN follows standard Model UN parliamentary rules, built to keep debate moving and open to first-time and experienced delegates alike."
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {rules && (
              <a href={rules.fileUrl} className="text-link" data-no-transition="">
                Full rules as a PDF ({rules.fileSize}, revised {formatEventDate(rules.versionDate, { month: 'short' })})
              </a>
            )}
            <a href="#motions" className="text-link">
              Jump to the motions
            </a>
          </div>
        }
        art={<GlobeArt className="mx-auto hidden w-full max-w-[20rem] text-accent-gimun opacity-40 lg:block" />}
      />

      <section className="handoff__sheet tone-deep chapter" aria-labelledby="stages-title">
        <div className="wrap steps-split">
          <div className="steps-split__head">
            <ChapterHead id="stages-title" split={false} title="How a debate runs." lead="Five stages, the same in every committee, from roll call to the final vote." />
          </div>
          <Steps steps={STAGES} accent="gimun" />
        </div>
      </section>

      <section id="motions" className="chapter scroll-mt-28" aria-labelledby="motions-title">
        <div className="wrap">
          <ChapterHead id="motions-title" title="Motions and points, in order." lead="When several motions are raised at once, the chairs take them in this order of precedence." />
          <GimunRulesClient />
        </div>
      </section>

      <section className="sheet tone-inverse" aria-labelledby="yield-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead id="yield-title" title="Three ways to yield." lead="Finish a speech before your time runs out and you must give the floor back in one of these ways." />
          <ol className="grid gap-4 md:grid-cols-3">
            {YIELDS.map((y) => (
              <li key={y.title} className="glance">
                <h3 className="font-display text-[1.375rem] font-medium text-text">Yield {y.title}</h3>
                <p className="mt-3 text-small text-text-2">{y.body}</p>
                <p className="mt-5 border-t border-line pt-4 font-mono text-[0.8125rem] text-text-3">“{y.quote}”</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="chapter" aria-label="More help">
        <div className="wrap">
          <HelpCallout
            question="A procedure question the rules do not answer?"
            actions={[
              { label: 'Committees', href: '/gimun/committees' },
              { label: 'FAQ', href: '/about/faq' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
