import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { GimunRulesClient } from "./GimunRulesClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { getEventYear } from "@/lib/site-config";
import { getDocuments } from "@/lib/content";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Rules of Procedure (RoP) | GIMUN ${getEventYear(await getSiteConfig())}`,
  path: '/gimun/rules',
  description: `Complete parliamentary rules of procedure governing diplomatic debate, motions, caucusing, and resolution adoption at GIMUN ${getEventYear(await getSiteConfig())}.`,
}); }

export default async function GimunRulesPage() {
  const rulesDocument = (await getDocuments()).find(
    (document) => document.track === "gimun" && document.type === "rules",
  );

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Hero Header */}
      <PageHero
        variant="gimun"
        breadcrumbs={[{ label: 'GIMUN', href: '/gimun' }, { label: 'Rules of Procedure' }]}
        title={'Rules of Procedure (RoP)'}
        accentWords={['Procedure', '(RoP)']}
        description={'GIMUN follows standard Model UN parliamentary debate rules, designed to keep debate active, structured, and accessible for both first-time and experienced delegates.'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <TrackBadge track="gimun" />
                      <span className="text-xs font-mono text-champagne/70 uppercase tracking-widest">
                        Parliamentary Protocol &amp; Procedure
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <div className="pt-2 flex flex-wrap items-center gap-4">
                        {rulesDocument && (
                          <Button
                            variant="track-gimun"
                            href={rulesDocument.fileUrl}
                            icon={<Download className="w-4 h-4" />}
                          >
                            Download Official RoP Handbook (PDF)
                          </Button>
                        )}
                        <Button variant="secondary" href="/gimun/committees">
                          View Committee Roster
                        </Button>
                      </div>
          </>
        }
      />

      {/* Interactive Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <GimunRulesClient rulesDocumentUrl={rulesDocument?.fileUrl} />
      </div>
    </div>
  );
}
