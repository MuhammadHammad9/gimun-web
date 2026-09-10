'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Mail, Calendar, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { getEventYear } from '@/lib/site-config';

interface ClosedRegistrationBannerProps {
  track?: 'gimun' | 'moot-cup' | 'all';
  deadline?: string;
  onSwitchTrack?: () => void;
}

export function ClosedRegistrationBanner({
  track = 'all',
  deadline,
  onSwitchTrack,
}: ClosedRegistrationBannerProps) {
  const eventYear = getEventYear();
  const isMoot = track === 'moot-cup';
  const isGimun = track === 'gimun';

  const trackTitle = isMoot
    ? 'GIKI Moot Court (GMC)'
    : isGimun
    ? 'GIKI Model United Nations (GIMUN)'
    : `GIMUN & GMC ${eventYear}`;

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10 rounded-section bg-surface-elevated border border-whisper-border shadow-card text-center space-y-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 text-neutral-gray mx-auto">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-pill text-xs font-mono font-bold uppercase tracking-wider bg-rose-50 text-[#E11D48] border border-rose-200">
          Registrations Concluded
        </span>
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink">
          {trackTitle} Registration Closed
        </h2>
        <p className="text-sm text-neutral-gray max-w-lg mx-auto leading-relaxed">
          The official submission deadline {deadline ? `of ${deadline}` : ''} has passed or committee/bench
          capacity has been fully committed. New delegate allocations are no longer being accepted through this portal.
        </p>
      </div>

      {/* Alternative actions */}
      <div className="grid sm:grid-cols-3 gap-3 pt-2 text-left">
        <Link
          href="/contact?type=waitlist"
          className="p-4 rounded-card bg-surface border border-whisper-border hover:border-slate-300 transition-colors group space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-heading font-bold text-ink">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-primary" />
              <span>Waitlist / Queries</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-gray group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-neutral-gray leading-snug">
            Contact Secretariat for emergency waitlist or delegation changes.
          </p>
        </Link>

        <Link
          href="/schedule"
          className="p-4 rounded-card bg-surface border border-whisper-border hover:border-slate-300 transition-colors group space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-heading font-bold text-ink">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent" />
              <span>Event Schedule</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-gray group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-neutral-gray leading-snug">
            Review sessions, committee timings, and courtroom fixtures.
          </p>
        </Link>

        <Link
          href="/resources"
          className="p-4 rounded-card bg-surface border border-whisper-border hover:border-slate-300 transition-colors group space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-heading font-bold text-ink">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-secondary" />
              <span>Handbooks & Rules</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-gray group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-neutral-gray leading-snug">
            Download RoP handbooks, compromise files, and prep guides.
          </p>
        </Link>
      </div>

      {onSwitchTrack && (
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onSwitchTrack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to the other competition track</span>
          </button>
        </div>
      )}
    </div>
  );
}
