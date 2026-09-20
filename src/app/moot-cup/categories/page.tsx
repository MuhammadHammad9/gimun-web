import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getMootCategories, getDocuments } from "@/lib/content";
import { CategoriesClient } from "./CategoriesClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download, AlertCircle } from "lucide-react";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Problem Categories & Compromis | GMC ${getEventYear(await getSiteConfig())}`,
  path: '/moot-cup/categories',
  description: `Examine the substantive areas of law, factual propositions, and download the official ${getEventYear(await getSiteConfig())} GMC Compromis.`,
}); }

export default async function MootCategoriesPage() {
  const categories = (await getMootCategories());
  const documents = (await getDocuments());
  const propositionDoc = documents.find(
    (document) => document.track === "moot-cup" && document.type === "proposition",
  );

  return (
    <div className="space-y-12">
      {/* Modern Supreme Court Appellate Hero */}
      <PageHero
        variant="moot"
        breadcrumbs={[{ label: 'GMC', href: '/moot-cup' }, { label: 'Problem Categories' }]}
        title={'Case Problem Categories'}
        accentWords={['Categories']}
        description={`The {getEventYear(await getSiteConfig())} GIKI Moot Court (GMC) presents challenging legal cases spanning constitutional law, human rights, and public international law. Explore each category below and download the official case problem (Compromis).`}
        eyebrow={
          <div className="flex items-center gap-2">
                      <TrackBadge track="moot-cup" />
                      <span className="text-xs font-mono text-champagne/70 uppercase tracking-widest">
                        Legal Topics &amp; Case Problems
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <div className="pt-2 flex flex-wrap items-center gap-4">
                        {propositionDoc && (
                          <Button
                            variant="track-moot"
                            href={propositionDoc.fileUrl}
                            icon={<Download className="w-4 h-4" />}
                          >
                            Download Case Problem (PDF)
                          </Button>
                        )}
                        <Button variant="secondary" href="/moot-cup/clarifications">
                          View Clarifications Log
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        {/* Equal Footing Notice */}
        <div className="p-4.5 rounded-2xl bg-overlay/90 border border-champagne/25 flex items-start gap-3.5 text-champagne shadow-lg backdrop-blur-md">
          <AlertCircle className="w-5 h-5 text-champagne shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-champagne/90">
            <strong className="font-bold text-cream">Official Factual Notice:</strong>{" "}
            All participating teams are bound strictly by the facts set forth in the Compromis. Questions regarding ambiguous factual paragraphs may be submitted via the Clarifications portal until the published deadline.
          </div>
        </div>

        <CategoriesClient categories={categories} documents={documents} />
      </div>
    </div>
  );
}
