import { getCopy, getSiteConfig } from '@backend/lib/content';
import { fill, nextSteps } from '@shared/lib/copy';
import type { Metadata } from "next";
import { constructMetadata } from "@frontend/lib/metadata";
import { getSchedule } from "@backend/lib/content";
import { ScheduleClient } from "./ScheduleClient";
import { TransitionLink } from "@frontend/components/motion/TransitionLink";
import { DaysArt } from "@frontend/components/art/LineArt";
import { LiveArt } from "@frontend/components/art/LiveArt";
import { formatDateRange } from "@frontend/lib/utils";
import { getEventYear } from "@shared/lib/site-config";
import { PageHero } from '@frontend/components/ui/PageHero';
import { NextSteps } from '@frontend/components/story/NextSteps';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Unified Itinerary & Schedule | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/schedule',
  description:
    "Full four-day chronological agenda across GIMUN committee debates, GMC appellate advocacy rounds, and official institutional ceremonies at GIKI.",
}); }

export default async function SchedulePage() {
  const [schedule, site, copy] = await Promise.all([getSchedule(), getSiteConfig(), getCopy('schedule')]);
  const hero = copy('schedule-hero');
  const next = copy('schedule-next');
  const days = new Set(schedule.map((item) => item.day)).size;

  return (
    <>
      <PageHero
        variant="utility"
        meta={[formatDateRange(site.eventDates.start, site.eventDates.end), `${days} days`, `${schedule.length} sessions`]}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
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
        art={
          <LiveArt className="mx-auto hidden w-full max-w-[18rem] text-champagne opacity-50 lg:block">
            <DaysArt live className="w-full" />
          </LiveArt>
        }
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Schedule">
        <div className="wrap">
          <ScheduleClient initialSchedule={schedule} />
        </div>
      </section>
      {!next.hidden && <NextSteps steps={nextSteps(next)} />}
    </>
  );
}
