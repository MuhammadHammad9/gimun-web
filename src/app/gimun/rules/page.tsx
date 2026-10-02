import type { Metadata } from 'next';
import { GlobeArt } from '@/components/art/LineArt';
import { LiveArt } from '@/components/art/LiveArt';
import { ChapterHead } from '@/components/sections/Chapter';
import { ChapterRail } from '@/components/story/ChapterRail';
import { Steps } from '@/components/sections/Steps';
import { HelpCallout } from '@/components/ui/HelpCallout';
import { PageHero } from '@/components/ui/PageHero';
import { getCopy, getDocuments, getSiteConfig } from '@/lib/content';
import { chapterNumbers, fill } from '@/lib/copy';
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

export default async function GimunRulesPage() {
  const [documents, copy] = await Promise.all([getDocuments(), getCopy('gimun-rules')]);
  const rules = documents.find((d) => d.track === 'gimun' && d.type === 'rules');
  const hero = copy('gimun-rules-hero');
  const stages = copy('gimun-rules-stages');
  const motions = copy('gimun-rules-motions');
  const yields = copy('gimun-rules-yields');
  const help = copy('gimun-rules-help');
  const chapter = chapterNumbers(copy, ['gimun-rules-stages', 'gimun-rules-motions', 'gimun-rules-yields']);
  const steps = (stages.items ?? []).map((item) => ({ title: fill(item.title), body: fill(item.body) }));

  return (
    <>
      <ChapterRail />
      <PageHero
        variant="gimun"
        breadcrumbs={[{ label: 'GIMUN', href: '/gimun' }, { label: 'Rules of procedure' }]}
        meta={['Parliamentary procedure', `${steps.length} stages`, 'Motions in order of precedence']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
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
        art={
          <LiveArt className="mx-auto hidden w-full max-w-[20rem] text-accent-gimun opacity-40 lg:block">
            <GlobeArt live className="w-full" />
          </LiveArt>
        }
      />

      <section className="handoff__sheet tone-deep chapter" aria-labelledby="stages-title">
        <div className="wrap steps-split">
          <div className="steps-split__head">
            <ChapterHead id="stages-title" chapter={chapter['gimun-rules-stages']} act={stages.kicker} split={false} title={fill(stages.title)} lead={fill(stages.lead)} />
          </div>
          <Steps steps={steps} accent="gimun" />
        </div>
      </section>

      <section id="motions" className="chapter scroll-mt-28" aria-labelledby="motions-title">
        <div className="wrap">
          <ChapterHead id="motions-title" chapter={chapter['gimun-rules-motions']} act={motions.kicker} title={fill(motions.title)} lead={fill(motions.lead)} />
          <GimunRulesClient />
        </div>
      </section>

      {!yields.hidden && (
      <section className="sheet tone-inverse" aria-labelledby="yield-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead id="yield-title" chapter={chapter['gimun-rules-yields']} act={yields.kicker} title={fill(yields.title)} lead={fill(yields.lead)} />
          <ol className="grid gap-4 md:grid-cols-3">
            {(yields.items ?? []).map((y) => (
              <li key={y.title} className="glance">
                <h3 className="font-display text-[1.375rem] font-medium text-text">Yield {fill(y.title)}</h3>
                <p className="mt-3 text-small text-text-2">{fill(y.body)}</p>
                {y.meta && <p className="mt-5 border-t border-line pt-4 font-mono text-[0.8125rem] text-text-3">“{fill(y.meta)}”</p>}
              </li>
            ))}
          </ol>
        </div>
      </section>
      )}

      {!help.hidden && (
      <section className="chapter" aria-label="More help">
        <div className="wrap">
          <HelpCallout
            question={fill(help.title)}
            actions={[
              { label: 'Committees', href: '/gimun/committees' },
              { label: 'FAQ', href: '/about/faq' },
            ]}
          />
        </div>
      </section>
      )}
    </>
  );
}
