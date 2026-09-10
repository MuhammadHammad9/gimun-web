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

interface ScheduleClientProps {
  initialSchedule: ScheduleItem[];
}

export function ScheduleClient({ initialSchedule }: ScheduleClientProps) {
  const days = Array.from(new Set(initialSchedule.map((s) => s.day))).sort();
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
  const activeSessionId = selectedDay === 1 ? "sch-2" : null;

  return (
    <div className="space-y-10">
      {/* 1. REAL-TIME HAPPENING SPOTLIGHT TICKER */}
      <div className="p-4.5 rounded-2xl bg-[#070B19] text-white border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-30 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Official Itinerary Broadcast
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                &bull; Pakistan Standard Time (PKT)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200">
              All 3 Days scheduled at GIKI Campus. Delegates must carry valid NFC tags or reference passes at every chamber gate.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Itinerary</span>
          </button>
          <Link
            href="/about/venue"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono bg-[#1E2A78] hover:bg-[#1E2A78]/80 text-white cursor-pointer transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>Campus Map</span>
          </Link>
        </div>
      </div>

      {/* 2. DAY SWITCHER WITH SPRING INDICATOR & FILTER CONTROLS */}
      <div className="space-y-6">
        {/* Day Switcher Tabs */}
        <div className="p-1.5 rounded-2xl bg-gray-100/90 border border-gray-200 flex flex-wrap items-center gap-2">
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
                  isSelected ? "text-white" : "text-[#5A5A6E] hover:text-[#1A1A2E]"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeScheduleDay"
                    className="absolute inset-0 bg-[#070B19] rounded-xl shadow-md"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 font-mono text-xs font-bold text-[#FF6B35]">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
          <FilterBar
            options={filterOptions}
            activeValue={trackFilter}
            onChange={setTrackFilter}
          />
          <div className="text-xs font-mono text-[#5A5A6E]">
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
                  "double-bezel transition-all duration-200",
                  isFeaturedLive && "ring-2 ring-emerald-500/40",
                  isGimun && "hover:border-[#FF6B35]/40",
                  isMoot && "hover:border-[#00B4A6]/40"
                )}
              >
                <div
                  className={cn(
                    "double-bezel-inner p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6",
                    isFeaturedLive && "bg-emerald-50/20"
                  )}
                >
                  {/* Left: Time Block */}
                  <div className="shrink-0 md:w-60 space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-base sm:text-lg font-mono font-extrabold text-[#1A1A2E]">
                      <Clock
                        className={cn(
                          "w-4 h-4",
                          isGimun ? "text-[#FF6B35]" : isMoot ? "text-[#00B4A6]" : "text-[#1E2A78]"
                        )}
                      />
                      <span>
                        {session.startTime} — {session.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <TrackBadge track={session.track} size="sm" />
                      {isFeaturedLive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Plenary Session
                        </span>
                      )}
                      {session.updatedFlag && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                          Updated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center: Title & Substantive Notes */}
                  <div className="grow space-y-1.5">
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-[#1A1A2E] leading-snug">
                      {session.title}
                    </h3>
                    {session.notes && (
                      <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                        {session.notes}
                      </p>
                    )}
                    <div className="pt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 text-[#5A5A6E]">
                        Dress Code: {dressCode}
                      </span>
                    </div>
                  </div>

                  {/* Right: Location & Venue */}
                  <div className="shrink-0 flex md:flex-col items-start md:items-end justify-between gap-1.5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 text-xs font-mono text-[#5A5A6E]">
                    <div className="flex items-center gap-1.5 font-bold text-[#1A1A2E]">
                      <MapPin
                        className={cn(
                          "w-3.5 h-3.5",
                          isGimun ? "text-[#FF6B35]" : isMoot ? "text-[#00B4A6]" : "text-[#1E2A78]"
                        )}
                      />
                      <span>{session.location}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">GIKI Campus Complex</span>
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
      <section className="p-6 sm:p-8 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-base text-[#1A1A2E]">
            Room Allocations &amp; Real-time Schedule Adjustments
          </h4>
          <p className="text-xs sm:text-sm text-[#5A5A6E]">
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
      </section>
    </div>
  );
}
