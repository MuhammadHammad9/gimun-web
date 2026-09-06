import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getMootCategories, getDocuments } from "@/lib/content";
import { CategoriesClient } from "./CategoriesClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download, AlertCircle } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Problem Categories & Compromis | GMC 2027",
  description:
    "Examine the substantive areas of law, factual propositions, and download the official 2027 GMC Compromis.",
  path: "/moot-cup/categories",
});

export default function MootCategoriesPage() {
  const categories = getMootCategories();
  const documents = getDocuments();
  const propositionDoc = documents.find((d) => d.type === "proposition") || documents[0];

  return (
    <div className="space-y-12">
      {/* Modern Supreme Court Appellate Hero */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-teal opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <TrackBadge track="moot-cup" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Substantive Jurisprudence &amp; Propositions
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            GMC Problem <span className="text-gradient-teal">Categories</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            The 2027 GIKI Moot Court (GMC) presents multifaceted propositions spanning public international law, transboundary water rights, and extraterritorial digital surveillance. Inspect docket briefs, examine dialectic arguments, and download the official Compromis below.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            {propositionDoc && (
              <Button
                variant="track-moot"
                href={propositionDoc.fileUrl}
                icon={<Download className="w-4 h-4" />}
              >
                Download Official Compromis (PDF)
              </Button>
            )}
            <Button variant="secondary" href="/moot-cup/clarifications">
              View Clarifications Log
            </Button>
          </div>
        </div>
      </section>

      {/* Main Interactive Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        {/* Equal Footing Notice */}
        <div className="p-4.5 rounded-2xl bg-[#E6F9F7] border border-[#00B4A6]/30 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-[#00B4A6] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-[#1A1A2E]">
            <strong className="font-bold">Official Factual Notice:</strong>{" "}
            All participating teams are bound strictly by the facts set forth in the Compromis. Questions regarding ambiguous factual paragraphs may be submitted via the Clarifications portal until the published deadline.
          </div>
        </div>

        <CategoriesClient categories={categories} propositionDoc={propositionDoc} />
      </main>
    </div>
  );
}
