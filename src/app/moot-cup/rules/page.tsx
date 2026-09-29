import { getCopy, getSiteConfig, getDocuments } from '@/lib/content';
import { chapterNumbers, fill, nextSteps } from '@/lib/copy';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { MootRulesClient } from './MootRulesClient';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { PageHero } from '@/components/ui/PageHero';
import { FactList } from '@/components/ui/Editorial';
import { ChapterHead } from '@/components/sections/Chapter';
import { ChapterRail } from '@/components/story/ChapterRail';
import { Steps } from '@/components/sections/Steps';
import { BracketArt, ScalesArt } from '@/components/art/LineArt';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { NextSteps } from '@/components/story/NextSteps';
export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Rules & Memorial Guidelines | GMC ${getEventYear(await getSiteConfig())}`,
  path: '/moot-cup/rules',
  description: `Memorial format, submission, courtroom timing and scoring for the ${getEventYear(await getSiteConfig())} GIKI Moot Court (GMC).`,
}); }

export default async function MootRulesPage() {
  const rulesDocument = (await getDocuments()).find(
    (document) => document.track === "moot-cup" && document.type === "rules",
  );
  const [site, copy] = await Promise.all([getSiteConfig(), getCopy('moot-rules')]);
  const hero = copy('moot-rules-hero');
  const submission = copy('moot-rules-submission');
  const rounds = copy('moot-rules-rounds');
  const next = copy('moot-rules-next');
  const chapter = chapterNumbers(copy, ['moot-rules-submission', 'moot-rules-rounds', 'moot-rules-format', 'moot-rules-court', 'moot-rules-scoring']);
  const vars = { email: site.contactEmails.mootCup || site.contactEmails.general };
  const memorialDue = site.memorialDeadline ? formatEventDate(site.memorialDeadline) : 'the date announced on this page';

  return (
    <>
      <ChapterRail />
      <PageHero
        variant="moot"
        breadcrumbs={[{ label: 'GMC', href: '/moot-cup' }, { label: 'Rules & memorials' }]}
        meta={['Written and oral rounds', `Memorials due ${memorialDue}`]}
        title={fill(hero.title, vars)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead, vars)}
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {rulesDocument && (
              <a href={rulesDocument.fileUrl} className="text-link" data-no-transition="">
                Full rules as a PDF
              </a>
            )}
            <TransitionLink href="/moot-cup/clarifications" className="text-link">
              Clarifications log
            </TransitionLink>
          </div>
        }
        art={<ScalesArt className="mx-auto hidden w-full max-w-[18rem] text-accent-gmc opacity-50 lg:block" />}
      />

      <section className="handoff__sheet tone-deep chapter" aria-labelledby="submission-heading">
        <div className="wrap grid gap-16 lg:grid-cols-2">
          <div>
            <ChapterHead id="submission-heading" chapter={chapter['moot-rules-submission']} act={submission.kicker} split={false} title={fill(submission.title, vars)} lead={<>Deadline: <strong className="text-text">{memorialDue}, 23:59 Pakistan time.</strong> {fill(submission.lead, vars)}</>} />
            <Steps
              accent="gmc"
              steps={(submission.items ?? []).map((item) => ({ title: fill(item.title, vars), body: fill(item.body, vars) }))}
            />
          </div>
          <div>
            <ChapterHead id="rounds-heading" chapter={chapter['moot-rules-rounds']} act={rounds.kicker} split={false} title={fill(rounds.title, vars)} />
            <FactList
              items={(rounds.items ?? []).map((item) => ({ term: fill(item.title, vars), value: fill(item.body, vars) }))}
            />
            <BracketArt className="mt-12 hidden w-40 text-accent-gmc draw-on-scroll lg:block" />
          </div>
        </div>
      </section>

      <MootRulesClient
        format={copy('moot-rules-format')}
        court={copy('moot-rules-court')}
        scoring={copy('moot-rules-scoring')}
        oral={copy('moot-rules-scoring-oral')}
        chapters={chapter}
      />
      {!next.hidden && <NextSteps steps={nextSteps(next, vars)} />}
    </>
  );
}
