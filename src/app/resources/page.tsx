import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getDocuments } from "@/lib/content";
import { ResourcesClient } from "./ResourcesClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { getEventYear } from "@/lib/site-config";

const eventYear = getEventYear();
export const metadata: Metadata = constructMetadata({
  title: `Resource Hub & Document Archive | GIMUN & GMC ${eventYear}`,
  path: '/resources',
  description:
    "The authoritative digital archive for official delegate handbooks, committee background guides, legal compromises, competition rules, and campus logistical dossiers.",
});

export default function ResourcesPage() {
  const documents = getDocuments();
  const gimunRulesDocument = documents.find(
    (document) => document.track === "gimun" && document.type === "rules",
  );
  const mootRulesDocument = documents.find(
    (document) => document.track === "moot-cup" && document.type === "rules",
  );

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Hero */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <TrackBadge track="shared" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Authoritative Digital Repository
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Resource Hub &amp; <span className="text-gradient-silver">Document Archive</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            The official repository for all symposium literature: committee background dossiers, the {eventYear} GMC Compromis, standardized rules of procedure, OSCOLA citation manuals, and campus transit guides.
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
        </div>
      </section>

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ResourcesClient initialDocuments={documents} />
      </div>
    </div>
  );
}
