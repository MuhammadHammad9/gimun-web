'use client';

import { useRenderedAt, useSiteConfig } from '@/components/SiteConfigProvider';

import React from 'react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { Lock, Mail, Calendar, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { formatEventDate, getEventYear, isRegistrationDeadlinePassed } from '@/lib/site-config';

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
  const eventYear = getEventYear(useSiteConfig());
  const renderedAt = useRenderedAt();
  // A future deadline means registration is paused or not open yet, not over.
  const deadlinePassed = deadline ? isRegistrationDeadlinePassed(deadline, renderedAt) : true;
  const deadlineLabel = deadline ? formatEventDate(deadline) : null;
  const isMoot = track === 'moot-cup';
  const isGimun = track === 'gimun';

  const trackTitle = isMoot
    ? 'GIKI Moot Court (GMC)'
    : isGimun
    ? 'GIKI Model United Nations (GIMUN)'
    : `GIMUN & GMC ${eventYear}`;

  return (
    <div className="double-bezel mx-auto max-w-2xl">
    <div className="double-bezel-inner space-y-6 p-8 text-center md:p-10">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-elevated text-champagne border border-line mx-auto">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-accent-gimun/8 text-accent-gimun border border-brand/60">
          {deadlinePassed ? 'Registration closed' : 'Not open right now'}
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-medium text-text">
          {trackTitle} registration {deadlinePassed ? 'is closed' : 'is not open'}
        </h2>
        <p className="text-sm text-text-2 max-w-lg mx-auto leading-relaxed">
          {deadlinePassed
            ? `The registration deadline${deadlineLabel ? ` (${deadlineLabel})` : ''} has passed, so this portal is no longer accepting applications.`
            : `Applications are not being accepted at the moment${deadlineLabel ? `; the current deadline is ${deadlineLabel}` : ''}. Check announcements for when registration opens.`}
        </p>
      </div>

      {/* Alternative actions */}
      <div className="grid sm:grid-cols-3 gap-3 pt-2 text-left">
        <Link
          href="/contact?type=waitlist"
          className="p-4 rounded-xl border border-line hover:border-line-2 hover:bg-champagne/5 transition-all group space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-display font-medium text-text">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-champagne" />
              <span>Waitlist</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-text-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-text-3 leading-snug">
            Contact Secretariat for emergency waitlist or roster changes.
          </p>
        </Link>

        <Link
          href="/schedule"
          className="p-4 rounded-xl border border-line hover:border-line-2 hover:bg-champagne/5 transition-all group space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-display font-medium text-text">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-champagne" />
              <span>Schedule</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-text-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-text-3 leading-snug">
            Review sessions, committee timings, and courtroom fixtures.
          </p>
        </Link>

        <Link
          href="/resources"
          className="p-4 rounded-xl border border-line hover:border-line-2 hover:bg-champagne/5 transition-all group space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-display font-medium text-text">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-champagne" />
              <span>Resources</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-text-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-text-3 leading-snug">
            Download rules, the moot problem (compromis) and prep guides.
          </p>
        </Link>
      </div>

      {onSwitchTrack && (
        <div className="pt-4 border-t border-line">
          <button
            type="button"
            onClick={onSwitchTrack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-champagne hover:text-text hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to the other competition track</span>
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
