import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { MootRulesClient } from "./MootRulesClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { getEventYear } from "@/lib/site-config";
import { getDocuments } from "@/lib/content";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Rules & Memorial Guidelines | GMC ${getEventYear(await getSiteConfig())}`,
  path: '/moot-cup/rules',
  description: `Comprehensive competition rules, memorial drafting specifications, oral pleading rounds structure, and scoring criteria for the ${getEventYear(await getSiteConfig())} GMC.`,
}); }

export default async function MootRulesPage() {
  const rulesDocument = (await getDocuments()).find(
    (document) => document.track === "moot-cup" && document.type === "rules",
  );

  return (
    <div className="space-y-12">
      {/* Modern Supreme Court Appellate Hero */}
      <PageHero
        variant="moot"
        breadcrumbs={[{ label: 'GMC', href: '/moot-cup' }, { label: 'Rules & Memorials' }]}
        title={'Rules & Written Arguments (Memorials)'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <TrackBadge track="moot-cup" />
                      <span className="text-xs font-mono text-text-3 uppercase tracking-widest">
                        Competition Rules &amp; Standards
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <p className="text-sm sm:text-base text-text-2 max-w-3xl leading-relaxed">
                        The GIKI Moot Court (GMC) follows national standards of appellate advocacy and courtroom argument. Review brief length limits, courtroom timing allocations, citation guidelines, and scoring criteria below.
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        {rulesDocument && (
                          <Button
                            variant="track-moot"
                            href={rulesDocument.fileUrl}
                            icon={<Download className="w-4 h-4" />}
                          >
                            Download Official Rules PDF
                          </Button>
                        )}
                        <Button variant="secondary" href="/moot-cup/clarifications">
                          Clarifications Log
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <MootRulesClient rulesDocumentUrl={rulesDocument?.fileUrl} />
      </div>
    </div>
  );
}
