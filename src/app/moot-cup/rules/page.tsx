import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { MootRulesClient } from "./MootRulesClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Rules & Memorial Guidelines | GMC 2027",
  description:
    "Comprehensive competition rules, memorial drafting specifications, oral pleading rounds structure, and scoring criteria for the 2027 GMC.",
  path: "/moot-cup/rules",
});

export default function MootRulesPage() {
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
              Codified Competition Handbook
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Rules &amp; Memorial <span className="text-gradient-teal">Guidelines</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            The GIKI Moot Court (GMC) adheres to strict national standards of appellate advocacy, OSCOLA legal citations, and rigorous oral argument procedures. Review memorial length limits, oral round timing allocations, and the composite adjudication scoring rubric below.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button
              variant="track-moot"
              href="/documents/moot-cup/Moot_Cup_Rules_and_Memorial_Guide.pdf"
              icon={<Download className="w-4 h-4" />}
            >
              Download Official Rules PDF
            </Button>
            <Button variant="secondary" href="/moot-cup/clarifications">
              Clarifications Log
            </Button>
          </div>
        </div>
      </section>

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <MootRulesClient />
      </div>
    </div>
  );
}
