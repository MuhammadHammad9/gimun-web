import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getClarifications, getDocuments } from "@/lib/content";
import { ClarificationsClient } from "./ClarificationsClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

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
    <div className="space-y-12">
      {/* Modern Supreme Court Appellate Hero */}
      <PageHero
        variant="moot"
        breadcrumbs={[{ label: 'GMC', href: '/moot-cup' }, { label: 'Clarifications' }]}
        title={'Official Clarifications Log'}
        accentWords={['Clarifications', 'Log']}
        description={'Questions submitted by registered teams and official rulings issued by the GMC Bench Committee. All clarifications published here form binding additions to the case problem.'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <TrackBadge track="moot-cup" />
                      <span className="text-xs font-mono text-champagne/70 uppercase tracking-widest">
                        Questions &amp; Official Bench Answers
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <div className="pt-2 flex flex-wrap items-center gap-4">
                        {propositionDocument && (
                          <Button
                            variant="track-moot"
                            href={propositionDocument.fileUrl}
                            icon={<Download className="w-4 h-4" />}
                          >
                            Download Case Problem (PDF)
                          </Button>
                        )}
                        <Button variant="secondary" href="/moot-cup/rules">
                          Review Written Argument Guidelines
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ClarificationsClient initialClarifications={clarifications} />
      </div>
    </div>
  );
}
