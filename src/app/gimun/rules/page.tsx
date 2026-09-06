import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { GimunRulesClient } from "./GimunRulesClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Rules of Procedure (RoP) | GIMUN 2027",
  description:
    "Complete parliamentary rules of procedure governing diplomatic debate, motions, caucusing, and resolution adoption at GIMUN 2027.",
  path: "/gimun/rules",
});

export default function GimunRulesPage() {
  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Hero Header */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-orange opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <TrackBadge track="gimun" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Parliamentary Protocol &amp; Procedure
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Rules of <span className="text-gradient-orange">Procedure (RoP)</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            GIMUN utilizes standardized parliamentary rules adapted from classical Harvard MUN protocols, calibrated to maintain vigorous substantive debate, rapid crisis interventions, and fair procedural discipline across all simulation organs.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button
              variant="track-gimun"
              href="/documents/gimun/GIMUN_Rules_of_Procedure.pdf"
              icon={<Download className="w-4 h-4" />}
            >
              Download Official RoP Handbook (PDF)
            </Button>
            <Button variant="secondary" href="/gimun/committees">
              View Committee Roster
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <GimunRulesClient />
      </main>
    </div>
  );
}
