import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getSchedule } from "@/lib/content";
import { ScheduleClient } from "./ScheduleClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = constructMetadata({
  title: "Unified Itinerary & Schedule | GIMUN & GMC 2027",
  description:
    "Full 3-day chronological agenda across GIMUN committee debates, GMC appellate advocacy rounds, and official institutional ceremonies at GIKI.",
  path: "/schedule",
});

export default function SchedulePage() {
  const schedule = getSchedule();

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Dual Track Hero */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <TrackBadge track="shared" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Unified Chronological Program
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Itinerary &amp; <span className="text-gradient-silver">Conference Schedule</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            A comprehensive 3-day program spanning bilateral diplomatic negotiations, appellate moot court rounds, and formal campus receptions. Filter by track or day to plan your delegation&apos;s itinerary.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button variant="secondary" href="/about/venue">
              Campus Venue &amp; Facilities
            </Button>
            <Button variant="track-gimun" href="/gimun/committees">
              GIMUN Committees
            </Button>
            <Button variant="track-moot" href="/moot-cup/categories">
              GMC Categories
            </Button>
          </div>
        </div>
      </section>

      {/* Main Interactive Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ScheduleClient initialSchedule={schedule} />
      </main>
    </div>
  );
}
