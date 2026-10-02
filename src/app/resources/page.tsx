import { getCopy, getSiteConfig } from '@/lib/content';
import { fill } from '@/lib/copy';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getDocuments } from "@/lib/content";
import { ResourcesClient } from "./ResourcesClient";
import { DocumentsArt } from "@/components/art/LineArt";
import { LiveArt } from "@/components/art/LiveArt";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Resource Hub & Document Archive | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/resources',
  description:
    "The authoritative digital archive for official delegate handbooks, committee background guides, legal compromises, competition rules, and campus logistical dossiers.",
}); }

export default async function ResourcesPage() {
  const [documents, copy] = await Promise.all([getDocuments(), getCopy('resources')]);
  const hero = copy('resources-hero');
  const gimunRulesDocument = documents.find(
    (document) => document.track === "gimun" && document.type === "rules",
  );
  const mootRulesDocument = documents.find(
    (document) => document.track === "moot-cup" && document.type === "rules",
  );

  return (
    <>
      <PageHero
        variant="utility"
        meta={[`${documents.length} documents`, 'Each with its revision date']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {gimunRulesDocument && (
              <a href={gimunRulesDocument.fileUrl} className="text-link" data-no-transition="">
                GIMUN rules of procedure (PDF)
              </a>
            )}
            {mootRulesDocument && (
              <a href={mootRulesDocument.fileUrl} className="text-link" data-no-transition="">
                GMC rules and memorial guide (PDF)
              </a>
            )}
          </div>
        }
        art={
          <LiveArt className="mx-auto hidden w-full max-w-[18rem] text-champagne opacity-50 lg:block">
            <DocumentsArt live className="w-full" />
          </LiveArt>
        }
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Documents">
        <div className="wrap">
          <ResourcesClient initialDocuments={documents} />
        </div>
      </section>
    </>
  );
}
