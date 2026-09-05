import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getClarifications } from "@/lib/content";
import { ClarificationsClient } from "./ClarificationsClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Official Clarifications Log & Rulings | GMC 2027",
  description:
    "Formal questions submitted by participating teams and binding interpretations issued by the Bench Drafting Committee for the GMC Compromis.",
  path: "/moot-cup/clarifications",
});

export default function ClarificationsPage() {
  const clarifications = getClarifications();

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
              Judicial Determinations &amp; Addenda
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Official <span className="text-gradient-teal">Clarifications Log</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            Formal inquiries submitted by registered law school teams and binding interpretations issued by the Bench Drafting Committee. All determinations published on this official record constitute binding addenda to the Compromis.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button
              variant="track-moot"
              href="/documents/moot-cup/GIKI_Moot_Cup_2027_Proposition.pdf"
              icon={<Download className="w-4 h-4" />}
            >
              Download Official Compromis
            </Button>
            <Button variant="secondary" href="/moot-cup/rules">
              Review Memorial Guidelines
            </Button>
          </div>
        </div>
      </section>

      {/* Main Interactive Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ClarificationsClient initialClarifications={clarifications} />
      </main>
    </div>
  );
}
