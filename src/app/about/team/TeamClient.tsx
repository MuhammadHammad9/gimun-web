"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Award } from "lucide-react";
import type { TeamMember } from "@/lib/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface TeamClientProps {
  initialMembers: TeamMember[];
}

type GroupFilter = "all" | "secretariat" | "convening-committee" | "organizing-committee";

const GROUP_CONFIG: Record<
  TeamMember["group"],
  { label: string; badge: string; badgeColor: string; avatarBg: string }
> = {
  secretariat: {
    label: "GIMUN Executive Secretariat",
    badge: "Model UN Secretariat",
    badgeColor: "bg-[#FFF0E8] text-[#FF6B35] border-[#FF6B35]/20",
    avatarBg: "bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] text-white",
  },
  "convening-committee": {
    label: "GMC Convening Bench",
    badge: "GMC Bench Directorate",
    badgeColor: "bg-[#E6F9F7] text-[#00B4A6] border-[#00B4A6]/20",
    avatarBg: "bg-gradient-to-br from-[#00B4A6] to-[#00897B] text-white",
  },
  "organizing-committee": {
    label: "Host Directorate & Operations",
    badge: "Logistics & Host Directorate",
    badgeColor: "bg-[#EEF2FF] text-[#1E2A78] border-[#1E2A78]/20",
    avatarBg: "bg-gradient-to-br from-[#1E2A78] to-[#2E3C98] text-white",
  },
};

export function TeamClient({ initialMembers }: TeamClientProps) {
  const [activeGroup, setActiveGroup] = useState<GroupFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredMembers = initialMembers.filter((m) => {
    const matchesGroup = activeGroup === "all" || m.group === activeGroup;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Search & Filter Suite */}
      <div className="space-y-4 pb-2 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, role, or department..."
            />
          </div>
          <div className="text-xs font-mono text-[#5A5A6E]">
            Showing {filteredMembers.length} of {initialMembers.length} Officers
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-gray-100/90 border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveGroup("all")}
            className={cn(
              "px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer",
              activeGroup === "all"
                ? "bg-[#070B19] text-white shadow-xs"
                : "text-[#5A5A6E] hover:text-[#1A1A2E]"
            )}
          >
            All Leadership ({initialMembers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveGroup("secretariat")}
            className={cn(
              "px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer",
              activeGroup === "secretariat"
                ? "bg-[#FF6B35] text-white shadow-xs"
                : "text-[#5A5A6E] hover:text-[#1A1A2E]"
            )}
          >
            GIMUN Secretariat ({initialMembers.filter((m) => m.group === "secretariat").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveGroup("convening-committee")}
            className={cn(
              "px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer",
              activeGroup === "convening-committee"
                ? "bg-[#00B4A6] text-white shadow-xs"
                : "text-[#5A5A6E] hover:text-[#1A1A2E]"
            )}
          >
            Moot Convening Bench ({initialMembers.filter((m) => m.group === "convening-committee").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveGroup("organizing-committee")}
            className={cn(
              "px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer",
              activeGroup === "organizing-committee"
                ? "bg-[#1E2A78] text-white shadow-xs"
                : "text-[#5A5A6E] hover:text-[#1A1A2E]"
            )}
          >
            Host Directorate ({initialMembers.filter((m) => m.group === "organizing-committee").length})
          </button>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <h2 className="sr-only">Organizing Committee and Dais Directory</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member, idx) => {
          const groupMeta = GROUP_CONFIG[member.group] || GROUP_CONFIG["organizing-committee"];
          const initials = member.name
            .split(" ")
            .map((part) => part[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("");

          return (
            <ScrollReveal key={member.id} delay={idx * 0.04}>
              <div className="double-bezel h-full group hover:translate-y-[-2px] transition-transform duration-300">
                <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-5 bg-white">
                  <div className="space-y-4">
                    {/* Header with Monogram Avatar & Branch Tag */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-extrabold text-lg shadow-sm shrink-0",
                          groupMeta.avatarBg
                        )}
                      >
                        {initials}
                      </div>

                      <span
                        className={cn(
                          "text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border text-right",
                          groupMeta.badgeColor
                        )}
                      >
                        {groupMeta.badge}
                      </span>
                    </div>

                    {/* Name & Role */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-heading font-bold text-[#1A1A2E] leading-snug group-hover:text-[#1E2A78] transition-colors">
                        {member.name}
                      </h3>
                      <div className="text-xs font-mono font-semibold text-[#5A5A6E]">
                        {member.role}
                      </div>
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-xs text-[#5A5A6E] leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-[#5A5A6E]">
                      Official Contact
                    </span>

                    <div className="flex items-center gap-2">
                      {member.links?.email && (
                        <a
                          href={`mailto:${member.links.email}`}
                          title={`Email ${member.name}`}
                          className="p-1.5 rounded-xl bg-gray-50 border border-gray-200 text-[#5A5A6E] hover:text-[#1E2A78] hover:bg-gray-100 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {member.links?.linkedin && (
                        <a
                          href={member.links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="LinkedIn Profile"
                          className="p-1.5 rounded-xl bg-gray-50 border border-gray-200 text-[#5A5A6E] hover:text-blue-600 hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}

        {filteredMembers.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              title="No Officers Found"
              description={`No leadership profiles matched "${searchQuery}". Please check your search term or clear the category filter.`}
              actionLabel="Clear Search"
              onAction={() => {
                setSearchQuery("");
                setActiveGroup("all");
              }}
            />
          </div>
        )}
      </div>

      {/* Institutional Responsibility Pledge Banner */}
      <section className="p-6 md:p-8 rounded-2xl bg-[#070B19] text-white border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-25 pointer-events-none" />
        <div className="relative z-10 space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#FF6B35]">
            <Award className="w-4 h-4 text-[#FF6B35]" />
            <span>Academic Rigor &amp; Student Leadership</span>
          </div>
          <h3 className="text-lg font-heading font-extrabold text-white">
            Governed by GIKI Student Debating &amp; Law Societies
          </h3>
          <p className="text-xs text-gray-300 max-w-xl">
            Our student directors, committee chairs, and bench evaluators are bound by institutional codes of strict neutrality, substantive integrity, and academic rigor.
          </p>
        </div>

        <Link
          href="/about"
          className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-mono font-bold text-white hover:bg-white/20 transition-colors shrink-0"
        >
          <span>About GIKI Heritage</span>
        </Link>
      </section>
    </div>
  );
}
