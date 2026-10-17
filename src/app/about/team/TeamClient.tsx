"use client";

import { useState } from "react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import ProfileCard from "@/components/reactbits/ProfileCard";
import type { TeamMember } from "@/lib/types";

interface TeamClientProps {
  initialMembers: TeamMember[];
  /** Phone numbers from Settings › Phone contacts, by person's name. */
  phones: Record<string, string>;
}

/** Framing is based on each cutout's visible width; taller figures become upper-body portraits. */
const PHOTO_FRAMING: Record<string, { scale: number; origin?: string }> = {
  "team-ayaan-omer": { scale: 1.75 },
  "team-dawar-jawad": { scale: 1 },
  "team-hania-khan": { scale: 1.45 },
  "team-malaika-shah": { scale: 1.6 },
  "team-momina-najeeb": { scale: 1.05 },
  "team-muhammad-hammad": { scale: 2 },
  "team-musa-jafri": { scale: 1 },
  "team-mustajaab": { scale: 1.08 },
  "team-rafay-akram": { scale: 1.08, origin: "50% 100%" },
  "team-toqeer-ahmed": { scale: 1 },
  "team-abdullah-waheed": { scale: 2.15 },
  "team-ahmed-ali": { scale: 1.02 },
  "team-anas-faizan": { scale: 1.35 },
  "team-ahmed-arsalan": { scale: 1 },
  "team-taha-shafique": { scale: 1.1 },
  // A full-length cut-out: zoom toward the head to match the half-length portraits.
  "team-saad-hassan": { scale: 1.75 },
};

export function TeamClient({ initialMembers, phones }: TeamClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (initialMembers.length === 0) {
    return (
      <ComingSoon
        title="The organizing team will be introduced here"
        description="Profiles of the host team are published once the team is confirmed. Until then, the organizing team is reachable through the contact page."
        links={[{ label: "Contact the organizing team", href: "/contact" }]}
      />
    );
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredMembers = initialMembers.filter((m) => {
    const matchesSearch = !query || [m.name, m.role, m.bio].some((field) => field?.toLowerCase().includes(query));
    return matchesSearch;
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-champagne">Executive Council</p>
          <p className="mt-2 text-small text-text-3">{initialMembers.length} members · SOPHEP leadership</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-full sm:w-72">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by name or role" />
          </div>
          <p className="shrink-0 font-mono text-xs text-text-3" aria-live="polite">
            {filteredMembers.length} of {initialMembers.length}
          </p>
        </div>
      </div>

      <h2 className="sr-only">Who runs the event</h2>
      {filteredMembers.length > 0 ? (
        <ul className="grid justify-items-center gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            return (
              <li key={member.id} className="flex w-full max-w-[340px] flex-col gap-4">
                <ProfileCard
                  name={member.name}
                  title={member.role}
                  avatarUrl={member.photo || undefined}
                  photoScale={PHOTO_FRAMING[member.id]?.scale}
                  photoOrigin={PHOTO_FRAMING[member.id]?.origin}
                  iconUrl="/images/brand/shield-pattern.svg"
                  handle="Executive Council"
                  status="SOPHEP leadership"
                  accent="shared"
                  phone={phones[member.name]}
                />
                {member.bio && <p className="px-2 text-small leading-relaxed text-text-2">{member.bio}</p>}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="No one matches"
          description={`No profile matched "${searchQuery}". Check the spelling or clear the filter.`}
          actionLabel="Clear search"
          onAction={() => {
            setSearchQuery("");
          }}
        />
      )}
    </div>
  );
}
