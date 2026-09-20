"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Printer,
} from "lucide-react";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ScheduleItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CtaBanner } from '@/components/ui/CtaBanner';

interface ScheduleClientProps {
  initialSchedule: ScheduleItem[];
}

export function ScheduleClient({ initialSchedule }: ScheduleClientProps) {
  const days = Array.from(new Set(initialSchedule.map((s) => s.day))).sort((a,b) => a-b);
  const [selectedDay, setSelectedDay] = useState<number>(days[0] || 1);
  const [trackFilter, setTrackFilter] = useState<string>("all");

  const filterOptions = [
    { label: "All Sessions", value: "all" },
    { label: "GIMUN Track", value: "gimun" },
    { label: "GMC Track", value: "moot-cup" },
    { label: "Shared & Plenary", value: "shared" },
  ];

  const currentDaySessions = initialSchedule.filter((s) => s.day === selectedDay);

  const filteredSessions =
    trackFilter === "all"
      ? currentDaySessions
      : currentDaySessions.filter((s) => s.track === trackFilter);

  const currentDayLabel =
    currentDaySessions[0]?.dayLabel || `Day ${selectedDay}`;

  // Determine an active/highlighted session for Day 1
  const activeSessionId = null;

  return (
    <div className="space-y-10">
      {/* 1. REAL-TIME HAPPENING SPOTLIGHT TICKER */}
      <div className="p-4.5 rounded-2xl bg-overlay/90 text-champagne border border-champagne/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-champagne-lo"></span>
          </span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne">
                Official Itinerary Broadcast
              </span>
              <span className="text-[10px] font-mono text-champagne/70">
                &bull; Pakistan Standard Time (PKT)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-champagne/90">
              All four days are scheduled at GIKI Campus. Delegates must carry valid NFC tags or reference passes at every chamber gate.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono bg-crest hover:bg-brand text-champagne hover:text-cream border border-champagne/30 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Itinerary</span>
          </button>
          <Link
            href="/about/venue"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-crest font-bold cursor-pointer transition-all shadow-md"
          >
            <MapPin className="w-3.5 h-3.5 text-crest" />
            <span>Campus Map</span>
          </Link>
        </div>
      </div>

      {/* 2. DAY SWITCHER WITH SPRING INDICATOR & FILTER CONTROLS */}
      <div className="space-y-6">
        {/* Day Switcher Tabs */}
        <div className="p-1.5 rounded-2xl bg-overlay/90 border border-champagne/20 flex flex-wrap items-center gap-2 shadow-inner">
          {days.map((dayNum) => {
            const daySample = initialSchedule.find((s) => s.day === dayNum);
            const isSelected = selectedDay === dayNum;
            const dayDate = daySample?.dayLabel.split("—")[1]?.trim() || "";

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={cn(
                  "relative px-5 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm transition-colors duration-200 cursor-pointer select-none text-left flex items-center gap-3",
                  isSelected ? "text-crest" : "text-champagne/70 hover:text-cream"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeScheduleDay"
                    className="absolute inset-0 bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo rounded-xl shadow-md"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 font-mono text-xs font-bold",
                    isSelected ? "text-crest" : "text-champagne"
                  )}
                >
                  Day {dayNum}
                </span>
                <span className="relative z-10 font-heading font-bold text-sm">
                  {dayDate || `Day ${dayNum}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Track Filter Pills & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-champagne/15">
          <FilterBar
            options={filterOptions}
            activeValue={trackFilter}
            onChange={setTrackFilter}
          />
          <div className="text-xs font-mono text-champagne/70">
            Displaying {filteredSessions.length} sessions for {currentDayLabel.split("—")[0]}
          </div>
        </div>
      </div>

      {/* 3. SESSIONS TIMELINE */}
      <div className="space-y-4">
        <h2 className="sr-only">Itinerary Timeline &amp; Session Schedules</h2>
        {filteredSessions.map((session, idx) => {
          const isFeaturedLive = session.id === activeSessionId;
          const isGimun = session.track === "gimun";
          const isMoot = session.track === "moot-cup";

          // Deduce dress code tag from notes
          let dressCode = "Business Formal";
          if (session.notes.toLowerCase().includes("traditional") || session.notes.toLowerCase().includes("diplomatic")) {
            dressCode = "Diplomatic / Traditional";
          } else if (session.notes.toLowerCase().includes("social") || session.notes.toLowerCase().includes("dinner")) {
            dressCode = "Black Tie / Formal Evening";
          }

          return (
            <ScrollReveal key={session.id} delay={idx * 0.04}>
              <div
                className={cn(
                  "rounded-2xl border border-champagne/25 bg-overlay/85 hover:border-champagne/45 hover:bg-overlay/95 shadow-xl transition-all duration-300",
                  isFeaturedLive && "ring-2 ring-champagne-lo/40",
                  isGimun && "hover:border-champagne/40",
                  isMoot && "hover:border-champagne"
                )}
              >
                <div
                  className={cn(
                    "p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6",
                    isFeaturedLive && "bg-elevated/20"
                  )}
                >
                  {/* Left: Time Block */}
                  <div className="shrink-0 md:w-60 space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-base sm:text-lg font-mono font-extrabold text-cream">
                      <Clock
                        className={cn(
                          "w-4 h-4",
                          isGimun ? "text-champagne" : isMoot ? "text-champagne" : "text-champagne"
                        )}
                      />
                      <span>
                        {session.startTime} — {session.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <TrackBadge track={session.track} size="sm" />
                      {isFeaturedLive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-elevated/80 text-champagne border border-champagne-lo/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
                          Plenary Session
                        </span>
                      )}
                      {session.updatedFlag && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-crest text-champagne border border-champagne/40">
                          Updated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center: Title & Substantive Notes */}
                  <div className="grow space-y-1.5">
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-cream leading-snug">
                      {session.title}
                    </h3>
                    {session.notes && (
                      <p className="text-xs sm:text-sm text-champagne/80 leading-relaxed">
                        {session.notes}
                      </p>
                    )}
                    <div className="pt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-crest text-champagne/90 border border-champagne/25">
                        Dress Code: {dressCode}
                      </span>
                    </div>
                  </div>

                  {/* Right: Location & Venue */}
                  <div className="shrink-0 flex md:flex-col items-start md:items-end justify-between gap-1.5 pt-3 md:pt-0 border-t md:border-t-0 border-champagne/15 text-xs font-mono text-champagne/75">
                    <div className="flex items-center gap-1.5 font-bold text-cream">
                      <MapPin
                        className={cn(
                          "w-3.5 h-3.5 text-champagne"
                        )}
                      />
                      <span>{session.location}</span>
                    </div>
                    <span className="text-[11px] text-champagne/60">GIKI Campus Complex</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}

        {filteredSessions.length === 0 && (
          <EmptyState
            title="No Sessions Found"
            description={`There are no sessions scheduled under the selected track filter for ${currentDayLabel}.`}
            actionLabel="Show All Sessions"
            onAction={() => setTrackFilter("all")}
          />
        )}
      </div>

      {/* 4. LOGISTICAL ASSISTANCE CARD */}
      <CtaBanner variant="slab">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

        <div className="space-y-1">
          <h4 className="font-heading font-bold text-base text-cream">
            Room Allocations &amp; Real-time Schedule Adjustments
          </h4>
          <p className="text-xs sm:text-sm text-champagne/80">
            Any emergency time shifts or chamber transfers during conference days will automatically publish on our live Announcements broadcast.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" size="sm" href="/announcements">
            Live Announcements
          </Button>
          <Button variant="primary" size="sm" href="/about/venue">
            Campus Venue Guide
          </Button>
        </div>
        </div>
      </CtaBanner>
    </div>
  );
}
