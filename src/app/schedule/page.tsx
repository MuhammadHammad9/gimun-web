import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getSchedule } from "@/lib/content";
import { ScheduleClient } from "./ScheduleClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Unified Itinerary & Schedule | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/schedule',
  description:
    "Full four-day chronological agenda across GIMUN committee debates, GMC appellate advocacy rounds, and official institutional ceremonies at GIKI.",
}); }

export default async function SchedulePage() {
  const schedule = (await getSchedule());

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Dual Track Hero */}
      <PageHero
        variant="utility"
        title={'Conference Schedule'}
        accentWords={['Schedule']}
        eyebrow={
          <div className="flex items-center gap-2">
                      <TrackBadge track="shared" />
                      <span className="text-xs font-mono text-champagne uppercase tracking-widest">
                        Conference Program
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <p className="text-sm sm:text-base text-text-2 max-w-3xl leading-relaxed">
                        Full four-day program for both GIMUN committee sessions and GMC courtroom rounds, plus opening ceremonies and social events. Filter by track or day to plan your time.
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
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ScheduleClient initialSchedule={schedule} />
      </div>
    </div>
  );
}
