'use client';

import { useSiteConfig } from '@/components/SiteConfigProvider';

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
  const eventYear = getEventYear(useSiteConfig());
  const isMoot = track === 'moot-cup';
  const isGimun = track === 'gimun';

  const trackTitle = isMoot
    ? 'GIKI Moot Court (GMC)'
    : isGimun
    ? 'GIKI Model United Nations (GIMUN)'
    : `GIMUN & GMC ${eventYear}`;

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl backdrop-blur-md text-center space-y-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-crest text-champagne border border-champagne/20 mx-auto">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-brand-deep/70 text-crimson-soft border border-brand/60">
          Registrations Concluded
        </span>
        <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-cream">
          {trackTitle} Registration Closed
        </h2>
        <p className="text-sm text-champagne/80 max-w-lg mx-auto leading-relaxed">
          The official submission deadline {deadline ? `of ${deadline}` : ''} has passed or committee/bench
          capacity has been fully committed. New delegate allocations are no longer being accepted through this portal.
        </p>
      </div>

      {/* Alternative actions */}
      <div className="grid sm:grid-cols-3 gap-3 pt-2 text-left">
        <Link
          href="/contact?type=waitlist"
          className="p-4 rounded-xl bg-crest/60 border border-champagne/20 hover:border-champagne/40 transition-all group space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-heading font-bold text-cream">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-champagne" />
              <span>Waitlist</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-champagne/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-champagne/70 leading-snug">
            Contact Secretariat for emergency waitlist or roster changes.
          </p>
        </Link>

        <Link
          href="/schedule"
          className="p-4 rounded-xl bg-crest/60 border border-champagne/20 hover:border-champagne/40 transition-all group space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-heading font-bold text-cream">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-champagne" />
              <span>Schedule</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-champagne/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-champagne/70 leading-snug">
            Review sessions, committee timings, and courtroom fixtures.
          </p>
        </Link>

        <Link
          href="/resources"
          className="p-4 rounded-xl bg-crest/60 border border-champagne/20 hover:border-champagne/40 transition-all group space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-heading font-bold text-cream">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-champagne" />
              <span>Resources</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-champagne/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-champagne/70 leading-snug">
            Download RoP handbooks, compromise files, and prep guides.
          </p>
        </Link>
      </div>

      {onSwitchTrack && (
        <div className="pt-4 border-t border-champagne/15">
          <button
            type="button"
            onClick={onSwitchTrack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-champagne hover:text-cream hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to the other competition track</span>
          </button>
        </div>
      )}
    </div>
  );
}
