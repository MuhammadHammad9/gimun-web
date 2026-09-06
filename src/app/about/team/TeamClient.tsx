'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Award } from 'lucide-react';
import type { TeamMember } from '@/lib/types';
import { ScrollReveal } from '@/components/ui/ScrollReveal';


interface TeamClientProps {
  initialMembers: TeamMember[];
}

type GroupFilter = 'all' | 'secretariat' | 'convening-committee' | 'organizing-committee';

const GROUP_CONFIG: Record<
  TeamMember['group'],
  { label: string; badge: string; borderAccent: string; avatarBg: string }
> = {
  secretariat: {
    label: 'GIMUN Executive Secretariat',
    badge: 'Model UN Secretariat',
    borderAccent: 'border-accent/40',
    avatarBg: 'bg-orange-100 text-accent',
  },
  'convening-committee': {
    label: 'GIKI Moot Cup Convening Committee',
    badge: 'Moot Court Bench Directorate',
    borderAccent: 'border-secondary/40',
    avatarBg: 'bg-teal-100 text-secondary',
  },
  'organizing-committee': {
    label: 'Host Directorate & Operations',
    badge: 'Logistics & Partnerships',
    borderAccent: 'border-primary/40',
    avatarBg: 'bg-slate-100 text-primary',
  },
};

export function TeamClient({ initialMembers }: TeamClientProps) {
  const [activeGroup, setActiveGroup] = useState<GroupFilter>('all');

  const filteredMembers =
    activeGroup === 'all'
      ? initialMembers
      : initialMembers.filter((m) => m.group === activeGroup);

  return (
    <div className="space-y-10">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-card bg-slate-100/90 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveGroup('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-button transition-all ${
            activeGroup === 'all'
              ? 'bg-white text-ink shadow-xs font-bold'
              : 'text-neutral-gray hover:text-ink'
          }`}
        >
          All Leadership ({initialMembers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup('secretariat')}
          className={`px-4 py-2 text-xs font-semibold rounded-button transition-all ${
            activeGroup === 'secretariat'
              ? 'bg-white text-accent shadow-xs font-bold'
              : 'text-neutral-gray hover:text-ink'
          }`}
        >
          GIMUN Secretariat ({initialMembers.filter((m) => m.group === 'secretariat').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup('convening-committee')}
          className={`px-4 py-2 text-xs font-semibold rounded-button transition-all ${
            activeGroup === 'convening-committee'
              ? 'bg-white text-secondary shadow-xs font-bold'
              : 'text-neutral-gray hover:text-ink'
          }`}
        >
          Moot Convening Bench ({initialMembers.filter((m) => m.group === 'convening-committee').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup('organizing-committee')}
          className={`px-4 py-2 text-xs font-semibold rounded-button transition-all ${
            activeGroup === 'organizing-committee'
              ? 'bg-white text-primary shadow-xs font-bold'
              : 'text-neutral-gray hover:text-ink'
          }`}
        >
          Host Directorate ({initialMembers.filter((m) => m.group === 'organizing-committee').length})
        </button>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const groupMeta = GROUP_CONFIG[member.group] || GROUP_CONFIG['organizing-committee'];
          const initials = member.name
            .split(' ')
            .map((part) => part[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('');

          return (
            <ScrollReveal key={member.id}>
              <div className="double-bezel h-full">
                <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-4">
                    {/* Header with Monogram Avatar & Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-heading font-bold text-lg shadow-xs ${groupMeta.avatarBg}`}
                      >
                        {initials}
                      </div>

                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-neutral-gray border border-slate-200 text-right">
                        {groupMeta.badge}
                      </span>
                    </div>

                    {/* Name & Role */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-heading font-bold text-ink">
                        {member.name}
                      </h3>
                      <div className="text-xs font-mono font-semibold text-neutral-gray">
                        {member.role}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-neutral-gray leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-gray">
                      Official Contact
                    </span>

                    <div className="flex items-center gap-2">
                      {member.links?.email && (
                        <a
                          href={`mailto:${member.links.email}`}
                          title={`Email ${member.name}`}
                          className="p-1.5 rounded-button bg-surface border border-whisper-border text-neutral-gray hover:text-primary hover:bg-slate-50 transition-colors"
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
                          className="p-1.5 rounded-button bg-surface border border-whisper-border text-neutral-gray hover:text-blue-600 hover:bg-slate-50 transition-colors"
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
      </div>

      {/* Institutional Responsibility Pledge Banner */}
      <div className="p-6 md:p-8 rounded-card bg-surface border border-whisper-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Award className="w-4 h-4 text-primary" />
            <span>Academic Rigor & Student Leadership</span>
          </div>
          <h3 className="text-lg font-heading font-bold text-ink">
            Governed by GIKI Student Debating & Law Societies
          </h3>
          <p className="text-xs text-neutral-gray max-w-xl">
            Our student directors, committee chairs, and bench evaluators are bound by institutional codes
            of neutrality, fairness, and uncompromising academic integrity.
          </p>
        </div>

        <Link
          href="/about"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-white border border-slate-200 text-xs font-semibold text-ink hover:bg-slate-50 transition-colors shadow-xs shrink-0"
        >
          <span>About GIKI Heritage</span>
        </Link>
      </div>
    </div>
  );
}
