import { getSiteConfig } from '@/lib/content';
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
  const clarifications = (await getClarifications());
  const propositionDocument = (await getDocuments()).find(
    (document) => document.track === "moot-cup" && document.type === "proposition",
  );

  return (
    <>
      <PageHero
        variant="moot"
        breadcrumbs={[{ label: 'GMC', href: '/moot-cup' }, { label: 'Clarifications' }]}
        meta={[`${clarifications.length} published`, 'Binding on every team']}
        title="The clarifications log."
        accentPhrase="clarifications log."
        description="Questions from registered teams and the bench's answers. Every clarification published here forms part of the case problem, for every team at once."
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
      <NextSteps
        steps={[
          { href: '/moot-cup/rules', title: 'Rules and memorials', body: 'Formatting, word limits and how the rounds are scored.' },
          { href: '/moot-cup/categories', title: 'Case categories', body: 'The areas of law in this year’s problem.' },
          { href: '/resources', title: 'Resources', body: 'The compromis and the competition rules as PDFs.' },
        ]}
      />
    </>
  );
}
