import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getSchedule } from "@/lib/content";
import { ScheduleClient } from "./ScheduleClient";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { DaysArt } from "@/components/art/LineArt";
import { formatDateRange } from "@/lib/utils";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';
import { NextSteps } from '@/components/story/NextSteps';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Unified Itinerary & Schedule | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/schedule',
  description:
    "Full four-day chronological agenda across GIMUN committee debates, GMC appellate advocacy rounds, and official institutional ceremonies at GIKI.",
}); }

export default async function SchedulePage() {
  const schedule = (await getSchedule());

  const site = await getSiteConfig();
  const days = new Set(schedule.map((item) => item.day)).size;

  return (
    <>
      <PageHero
        variant="utility"
        meta={[formatDateRange(site.eventDates.start, site.eventDates.end), `${days} days`, `${schedule.length} sessions`]}
        title="The schedule."
        accentPhrase="schedule."
        description="All four days for both tracks: GIMUN committee sessions, GMC rounds, the ceremonies, meals and evenings. Filter by track or day, or print a copy."
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <TransitionLink href="/about/venue" className="text-link">
              Venue and rooms
            </TransitionLink>
            <TransitionLink href="/announcements" className="text-link">
              Latest notices
            </TransitionLink>
          </div>
        }
        art={<DaysArt className="mx-auto hidden w-full max-w-[18rem] text-champagne opacity-50 lg:block" />}
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Schedule">
        <div className="wrap">
          <ScheduleClient initialSchedule={schedule} />
        </div>
      </section>
      <NextSteps
        steps={[
          { href: '/about/venue', title: 'Venue and travel', body: 'Where each room is on campus, and how to get to Topi.' },
          { href: '/announcements', title: 'Announcements', body: 'Room changes and notices, newest first.' },
          { href: '/resources', title: 'Resources', body: 'The guides and rules to read before Day 1.' },
        ]}
      />
    </>
  );
}
