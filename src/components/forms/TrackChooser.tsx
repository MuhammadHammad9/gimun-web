'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Award, BookOpen, Scale, CheckCircle2, Lock } from 'lucide-react';
import { StaggerChildren } from '@/components/motion/StaggerChildren';
import { formatEventDate } from '@/lib/site-config';

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
    ? formatEventDate(gimunDeadline)
    : 'Deadline pending';

  const formattedMootDeadline = mootCupDeadline
    ? formatEventDate(mootCupDeadline)
    : 'Deadline pending';

  return (
    <StaggerChildren className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {/* GIMUN Track Card */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        }}
        className="relative group rounded-2xl bg-raised/90 border border-champagne/25 p-6 md:p-8 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-crimson/50 transition-all"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-crimson/20 text-crimson-soft border border-crimson/40">
              GIMUN Track
            </span>
            {!gimunOpen ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-crimson-soft bg-brand-deep/70 px-2.5 py-0.5 rounded-full border border-brand/60">
                <Lock className="w-3 h-3" /> Closed
              </span>
            ) : (
              <span className="text-xs font-mono text-champagne/70">
                Deadline: <span className="font-semibold text-text">{formattedGimunDeadline}</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-text">
              Model United Nations
            </h2>
            <p className="text-sm text-champagne/85 leading-relaxed">
              Step onto the global diplomatic stage. Represent sovereign nations across General Assembly,
              Specialized Agencies, and fast-paced Crisis Committees.
            </p>
          </div>

          {/* Participation specs */}
          <div className="space-y-2.5 pt-3 border-t border-champagne/15">
            <div className="flex items-center gap-2.5 text-xs text-champagne/85">
              <Users className="w-4 h-4 text-crimson-soft shrink-0" />
              <span><strong className="text-text">Applicant Modes:</strong> Individual Delegate or Institutional Delegation</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-champagne/85">
              <Award className="w-4 h-4 text-crimson-soft shrink-0" />
              <span>
                <strong className="text-text">Registration Fees:</strong> {fees?.gimunIndividual} (Individual) ·{' '}
                {fees?.gimunDelegationPerDelegate} (Per Delegate in Roster)
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-champagne/85">
              <BookOpen className="w-4 h-4 text-crimson-soft shrink-0" />
              <span>
                <strong className="text-text">Included:</strong> Committee dossier, matrix allocation, socials pass, delegate kit
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={!gimunOpen}
            onClick={() => onSelectTrack('gimun')}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
              gimunOpen
                ? 'bg-gradient-to-r from-crimson-hi via-crimson to-crimson-deep text-white hover:brightness-110 active:scale-[0.99] cursor-pointer shadow-[0_4px_20px_-2px_rgba(225,29,72,0.45)]'
                : 'bg-raised/50 text-champagne/40 border border-champagne/10 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{gimunOpen ? 'Apply for GIMUN' : 'Registration Closed'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center gap-3 text-[11px] text-champagne/70">
            <Link href="/gimun" className="hover:underline hover:text-text">
              Track Overview
            </Link>
            <span>·</span>
            <Link href="/gimun/committees" className="hover:underline hover:text-text">
              Committees &amp; Matrix
            </Link>
            <span>·</span>
            <Link href="/gimun/rules" className="hover:underline hover:text-text">
              Rules of Procedure
            </Link>
          </div>
        </div>
      </motion.div>

      {/* GMC Track Card */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
        }}
        className="relative group rounded-2xl bg-raised/90 border border-champagne/25 p-6 md:p-8 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-champagne/50 transition-all"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-champagne/20 text-champagne border border-champagne/40">
              GMC Track
            </span>
            {!mootCupOpen ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-crimson-soft bg-brand-deep/70 px-2.5 py-0.5 rounded-full border border-brand/60">
                <Lock className="w-3 h-3" /> Closed
              </span>
            ) : (
              <span className="text-xs font-mono text-champagne/70">
                Deadline: <span className="font-semibold text-text">{formattedMootDeadline}</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-text">
              GIKI Moot Court (GMC)
            </h2>
            <p className="text-sm text-champagne/85 leading-relaxed">
              Argue before distinguished appellate benches. Submit memorial briefs and compete in simulated
              oral advocacy rounds resolving cutting-edge legal questions.
            </p>
          </div>

          {/* Participation specs */}
          <div className="space-y-2.5 pt-3 border-t border-champagne/15">
            <div className="flex items-center gap-2.5 text-xs text-champagne/85">
              <Users className="w-4 h-4 text-champagne shrink-0" />
              <span><strong className="text-text">Team Structure:</strong> 2–4 members (2 Oralists + optional Researcher)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-champagne/85">
              <Scale className="w-4 h-4 text-champagne shrink-0" />
              <span>
                <strong className="text-text">Team Registration Fee:</strong> {fees?.mootCupTeam} (Full team package)
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-champagne/85">
              <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
              <span>
                <strong className="text-text">Included:</strong> Memorial evaluation, bench sessions, courtroom materials, gala invite
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={!mootCupOpen}
            onClick={() => onSelectTrack('moot-cup')}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
              mootCupOpen
                ? 'btn-shimmer-gold text-canvas hover:brightness-110 active:scale-[0.99] cursor-pointer'
                : 'bg-raised/50 text-champagne/40 border border-champagne/10 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{mootCupOpen ? 'Apply for GMC' : 'Registration Closed'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center gap-3 text-[11px] text-champagne/70">
            <Link href="/moot-cup" className="hover:underline hover:text-text">
              Track Overview
            </Link>
            <span>·</span>
            <Link href="/moot-cup/categories" className="hover:underline hover:text-text">
              Compromis &amp; Categories
            </Link>
            <span>·</span>
            <Link href="/moot-cup/rules" className="hover:underline hover:text-text">
              Rules &amp; Scoring
            </Link>
          </div>
        </div>
      </motion.div>
    </StaggerChildren>
  );
}
