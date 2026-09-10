import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getTeamMembers } from "@/lib/content";
import { TeamClient } from "./TeamClient";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEventYear } from "@/lib/site-config";

const eventYear = getEventYear();
export const metadata: Metadata = constructMetadata({
  title: `Organizing Team, Secretariat & GMC Convenors | GIMUN & GMC ${eventYear}`,
  path: '/about/team',
  description:
    "Meet the GIMUN Secretariat, GMC Convening Committee, and Host Directorate student leadership organizing Pakistan’s premier academic symposium at GIKI Topi.",
});

export default function TeamPage() {
  const members = getTeamMembers();

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Leadership Hero */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-gray-200 border border-white/15">
              <Users className="w-3.5 h-3.5 text-[#FF6B35]" />
              Executive Leadership
            </span>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              {eventYear} Organizing Directorate
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Executive Secretariat &amp; <span className="text-gradient-silver">Directorate</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            Led by seasoned parliamentary debaters, appellate moot champions, and campus operations directors. Our student leadership is committed to delivering unmatched competitive rigor, impartial adjudication, and warm GIKI hospitality.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button variant="track-gimun" href="/gimun">
              GIMUN Secretariat
            </Button>
            <Button variant="track-moot" href="/moot-cup">
              GMC Convening Bench
            </Button>
            <Button variant="secondary" href="/contact">
              Contact Secretariat
            </Button>
          </div>
        </div>
      </section>

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <TeamClient initialMembers={members} />
      </div>
    </div>
  );
}
