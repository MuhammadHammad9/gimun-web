import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getDocuments } from "@/lib/content";
import { ResourcesClient } from "./ResourcesClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Resource Hub & Document Archive | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/resources',
  description:
    "The authoritative digital archive for official delegate handbooks, committee background guides, legal compromises, competition rules, and campus logistical dossiers.",
}); }

export default async function ResourcesPage() {
  const documents = (await getDocuments());
  const gimunRulesDocument = documents.find(
    (document) => document.track === "gimun" && document.type === "rules",
  );
  const mootRulesDocument = documents.find(
    (document) => document.track === "moot-cup" && document.type === "rules",
  );

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Hero */}
      <PageHero
        variant="utility"
        title={'Documents & Resource Hub'}
        accentWords={['Resource', 'Hub']}
        eyebrow={
          <div className="flex items-center gap-2">
                      <TrackBadge track="shared" />
                      <span className="text-xs font-mono text-champagne uppercase tracking-widest">
                        Official Document Archive
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <p className="text-sm sm:text-base text-text-2 max-w-3xl leading-relaxed">
                        Official downloads for both events: committee study guides, the {getEventYear(await getSiteConfig())} GMC case problem, competition rules, citation style guides, and campus travel info.
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        {gimunRulesDocument && (
                          <Button
                            variant="track-gimun"
                            href={gimunRulesDocument.fileUrl}
                            icon={<Download className="w-4 h-4" />}
                          >
                            GIMUN RoP Handbook
                          </Button>
                        )}
                        {mootRulesDocument && (
                          <Button
                            variant="track-moot"
                            href={mootRulesDocument.fileUrl}
                            icon={<Download className="w-4 h-4" />}
                          >
                            GMC Rules &amp; Guide
                          </Button>
                        )}
                        <Button variant="secondary" href="/about/faq">
                          Explore FAQs
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ResourcesClient initialDocuments={documents} />
      </div>
    </div>
  );
}
