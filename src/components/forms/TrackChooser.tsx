'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Award, BookOpen, Scale, CheckCircle2, Lock } from 'lucide-react';
import { StaggerChildren } from '@/components/motion/StaggerChildren';

interface TrackChooserProps {
  onSelectTrack: (track: 'gimun' | 'moot-cup') => void;
  gimunDeadline: string;
  mootCupDeadline: string;
  gimunOpen: boolean;
  mootCupOpen: boolean;
  fees?: {
    gimunIndividual: string;
    gimunDelegationPerDelegate: string;
    mootCupTeam: string;
  };
}

export function TrackChooser({
  onSelectTrack,
  gimunDeadline,
  mootCupDeadline,
  gimunOpen,
  mootCupOpen,
  fees,
}: TrackChooserProps) {
  const formattedGimunDeadline = gimunDeadline
    ? new Date(gimunDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Deadline pending';

  const formattedMootDeadline = mootCupDeadline
    ? new Date(mootCupDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Deadline pending';

  return (
    <StaggerChildren className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {/* GIMUN Track Card */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        }}
        className="double-bezel relative"
      >
        <div className="double-bezel-inner p-6 md:p-8 h-full flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-orange-50 text-accent border border-orange-200/60">
                GIMUN Track
              </span>
              {!gimunOpen ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <Lock className="w-3 h-3" /> Closed
                </span>
              ) : (
                <span className="text-xs font-mono text-neutral-gray">
                  Deadline: <span className="font-semibold text-ink">{formattedGimunDeadline}</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink">
                Model United Nations
              </h2>
              <p className="text-sm text-neutral-gray leading-relaxed">
                Step onto the global diplomatic stage. Represent sovereign nations across General Assembly,
                Specialized Agencies, and fast-paced Crisis Committees.
              </p>
            </div>

            {/* Participation specs */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5 text-xs text-ink/80">
                <Users className="w-4 h-4 text-accent shrink-0" />
                <span><strong>Applicant Modes:</strong> Individual Delegate or Institutional Delegation</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-ink/80">
                <Award className="w-4 h-4 text-accent shrink-0" />
                <span>
                  <strong>Registration Fees:</strong> {fees?.gimunIndividual || 'PKR 4,500'} (Individual) ·{' '}
                  {fees?.gimunDelegationPerDelegate || 'PKR 4,000'} (Per Delegate in Roster)
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-ink/80">
                <BookOpen className="w-4 h-4 text-accent shrink-0" />
                <span>
                  <strong>Included:</strong> Committee dossier, matrix allocation, socials pass, delegate kit
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={!gimunOpen}
              onClick={() => onSelectTrack('gimun')}
              className={`w-full py-3.5 px-6 rounded-button font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-button ${
                gimunOpen
                  ? 'bg-accent hover:bg-accent-hover text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>{gimunOpen ? 'Apply for GIMUN' : 'Registration Closed'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-gray">
              <Link href="/gimun" className="hover:underline hover:text-ink">
                Track Overview
              </Link>
              <span>·</span>
              <Link href="/gimun/committees" className="hover:underline hover:text-ink">
                Committees & Country Matrix
              </Link>
              <span>·</span>
              <Link href="/gimun/rules" className="hover:underline hover:text-ink">
                Rules of Procedure
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* GMC Track Card */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
        }}
        className="double-bezel relative"
      >
        <div className="double-bezel-inner p-6 md:p-8 h-full flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-teal-50 text-secondary border border-teal-200/60">
                GMC Track
              </span>
              {!mootCupOpen ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <Lock className="w-3 h-3" /> Closed
                </span>
              ) : (
                <span className="text-xs font-mono text-neutral-gray">
                  Deadline: <span className="font-semibold text-ink">{formattedMootDeadline}</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink">
                GIKI Moot Court (GMC)
              </h2>
              <p className="text-sm text-neutral-gray leading-relaxed">
                Argue before distinguished appellate benches. Submit memorial briefs and compete in simulated
                oral advocacy rounds resolving cutting-edge legal questions.
              </p>
            </div>

            {/* Participation specs */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5 text-xs text-ink/80">
                <Users className="w-4 h-4 text-secondary shrink-0" />
                <span><strong>Team Structure:</strong> 2–4 members (2 Oralists + optional Researcher/Advocate)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-ink/80">
                <Scale className="w-4 h-4 text-secondary shrink-0" />
                <span>
                  <strong>Team Registration Fee:</strong> {fees?.mootCupTeam || 'PKR 12,000'} (Full team package)
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-ink/80">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>
                  <strong>Included:</strong> Memorial evaluation, bench sessions, courtroom materials, gala invite
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={!mootCupOpen}
              onClick={() => onSelectTrack('moot-cup')}
              className={`w-full py-3.5 px-6 rounded-button font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                mootCupOpen
                  ? 'bg-secondary hover:bg-secondary-hover text-white shadow-card'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{mootCupOpen ? 'Apply for GMC' : 'Registration Closed'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-gray">
              <Link href="/moot-cup" className="hover:underline hover:text-ink">
                Track Overview
              </Link>
              <span>·</span>
              <Link href="/moot-cup/categories" className="hover:underline hover:text-ink">
                Compromis & Categories
              </Link>
              <span>·</span>
              <Link href="/moot-cup/rules" className="hover:underline hover:text-ink">
                Rules & Scoring Matrix
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </StaggerChildren>
  );
}
