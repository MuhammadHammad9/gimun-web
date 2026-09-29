import { getSiteConfig, getDocuments } from '@/lib/content';
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
  const site = await getSiteConfig();
  const memorialDue = site.memorialDeadline ? formatEventDate(site.memorialDeadline) : 'the date announced on this page';

  return (
    <>
      <ChapterRail />
      <PageHero
        variant="moot"
        breadcrumbs={[{ label: 'GMC', href: '/moot-cup' }, { label: 'Rules & memorials' }]}
        meta={['Written and oral rounds', `Memorials due ${memorialDue}`]}
        title="Rules and memorials."
        accentPhrase="memorials."
        description="Memorial length and format, courtroom timing, citation and scoring for the GIKI Moot Court."
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
            <ChapterHead id="submission-heading" chapter={1} act="The memorials" split={false} title="Submitting memorials." lead={<>Deadline: <strong className="text-text">{memorialDue}, 23:59 Pakistan time.</strong> Late memorials are not scored.</>} />
            <Steps
              accent="gmc"
              steps={[
                { title: 'Two PDFs', body: 'One memorial for the Applicant and one for the Respondent.' },
                { title: 'Team code only', body: 'Identify your team only by the code in your acceptance email; names or institutions in the file are penalised.' },
                { title: 'Name and send', body: `Name the files TEAMCODE_Applicant.pdf and TEAMCODE_Respondent.pdf and email both to ${site.contactEmails.mootCup || site.contactEmails.general}.` },
                { title: 'Confirmation', body: 'You receive a reply within one working day. If you do not, email again before the deadline.' },
              ]}
            />
          </div>
          <div>
            <ChapterHead id="rounds-heading" chapter={2} act="The rounds" split={false} title="How the rounds work." />
            <FactList
              items={[
                { term: 'Preliminary rounds', value: 'Every team argues twice, once for each side. These two rounds are guaranteed.' },
                { term: 'Quarter-finals', value: 'The top eight teams by combined memorial and oral scores advance.' },
                { term: 'Semi-finals', value: 'Knockout; winners of each quarter-final advance.' },
                { term: 'Grand Final', value: 'The two finalists argue before an expanded bench in the AHA Auditorium.' },
              ]}
            />
            <BracketArt className="mt-12 hidden w-40 text-accent-gmc draw-on-scroll lg:block" />
          </div>
        </div>
      </section>

      <MootRulesClient />
      <NextSteps
        steps={[
          { href: '/moot-cup/categories', title: 'Case categories', body: 'The areas of law the problem can come from.' },
          { href: '/moot-cup/clarifications', title: 'Clarifications', body: 'The bench’s answers on the problem, binding on every team.' },
          { href: '/register?track=moot-cup', title: 'Register a team', body: 'Two oralists and up to two researchers.' },
        ]}
      />
    </>
  );
}
