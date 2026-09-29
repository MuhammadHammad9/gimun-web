import { getCopy, getSiteConfig } from '@/lib/content';
import { fill, nextSteps } from '@/lib/copy';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getClarifications, getDocuments } from "@/lib/content";
import { ClarificationsClient } from "./ClarificationsClient";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';
import { NextSteps } from '@/components/story/NextSteps';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Official Clarifications Log & Rulings | GMC ${getEventYear(await getSiteConfig())}`,
  path: '/moot-cup/clarifications',
  description:
    "Formal questions submitted by participating teams and binding interpretations issued by the Bench Drafting Committee for the GMC Compromis.",
}); }

export default async function ClarificationsPage() {
  const [clarifications, copy] = await Promise.all([getClarifications(), getCopy('clarifications')]);
  const hero = copy('clarifications-hero');
  const next = copy('clarifications-next');
  const propositionDocument = (await getDocuments()).find(
    (document) => document.track === "moot-cup" && document.type === "proposition",
  );

  return (
    <>
      <PageHero
        variant="moot"
        breadcrumbs={[{ label: 'GMC', href: '/moot-cup' }, { label: 'Clarifications' }]}
        meta={[`${clarifications.length} published`, 'Binding on every team']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {propositionDocument && (
              <a href={propositionDocument.fileUrl} className="text-link" data-no-transition="">
                The compromis (PDF)
              </a>
            )}
            <TransitionLink href="/moot-cup/rules" className="text-link">
              Rules &amp; memorials
            </TransitionLink>
          </div>
        }
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Clarifications">
        <div className="wrap">
          <ClarificationsClient initialClarifications={clarifications} />
        </div>
      </section>
      {!next.hidden && <NextSteps steps={nextSteps(next)} />}
    </>
  );
}
