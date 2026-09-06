import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getSponsors } from "@/lib/content";
import { SponsorsClient } from "./SponsorsClient";
import { Briefcase, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = constructMetadata({
  title: "Institutional Sponsors & Strategic Patrons | GIMUN & GMC 2027",
  description:
    "Our esteemed statutory patrons, government boards, corporate partners, and legal chambers supporting Pakistan’s premier youth diplomatic and legal advocacy championship.",
  path: "/about/sponsors",
});

export default function SponsorsPage() {
  const sponsors = getSponsors();

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Sponsors Hero */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-gray-200 border border-white/15">
              <Briefcase className="w-3.5 h-3.5 text-[#FF6B35]" />
              Strategic Alliances
            </span>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Partnerships &amp; Patrons
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Sponsors &amp; Strategic <span className="text-gradient-silver">Partners</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            Proudly supported by visionary academic councils, public sector technology boards, leading law firms, and media publications. Explore sponsorship tier benefits, recruitment touchpoints, and our active institutional partners.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button
              variant="track-gimun"
              href="/resources"
              icon={<Download className="w-4 h-4" />}
            >
              Download Sponsorship Deck (PDF)
            </Button>
            <Button variant="secondary" href="/contact?type=sponsorship">
              Inquire Corporate Partnership
            </Button>
          </div>
        </div>
      </section>

      {/* Main Interactive Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SponsorsClient initialSponsors={sponsors} />
      </main>
    </div>
  );
}
