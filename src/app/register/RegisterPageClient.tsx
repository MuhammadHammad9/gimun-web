'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Committee, ProblemCategory, SiteConfig } from '@/lib/types';
import { TrackChooser } from '@/components/forms/TrackChooser';
import { GimunRegisterForm } from '@/components/forms/GimunRegisterForm';
import { MootRegisterForm } from '@/components/forms/MootRegisterForm';
import { ClosedRegistrationBanner } from '@/components/forms/ClosedRegistrationBanner';
import { RegistrationSuccess } from '@/components/forms/RegistrationSuccess';
import { canRegister } from '@/lib/phase';
import { useRenderedAt } from '@/components/SiteConfigProvider';

interface RegisterPageClientProps {
  committees: Committee[];
  categories: ProblemCategory[];
  siteConfig: SiteConfig;
  /** Track requested in the URL (?track=, or implied by ?committee= / ?category=), read on the server. */
  initialTrack: 'gimun' | 'moot-cup' | null;
}

interface SuccessState {
  referenceId: string;
  applicantName: string;
  track: 'gimun' | 'moot-cup';
  applicantType: 'individual' | 'delegation' | 'team';
  details?: {
    email?: string;
    institution?: string;
    phone?: string;
    summary?: string;
    feeAmount?: string;
    eventDates?: string;
    venue?: string;
    participantCount?: number;
    timestamp?: string;
    checkinToken?: string;
  };
}

export function RegisterPageClient({ committees, categories, siteConfig, initialTrack }: RegisterPageClientProps) {
  const renderedAt = useRenderedAt();

  const [overrideTrack, setOverrideTrack] = useState<'gimun' | 'moot-cup' | null | undefined>(undefined);
  const selectedTrack: 'gimun' | 'moot-cup' | null =
    overrideTrack !== undefined
      ? overrideTrack
      : initialTrack;

  const [successData, setSuccessData] = useState<SuccessState | null>(null);

  // Same rule as every other page (phase, manual switch, deadline); the API enforces it again.
  const isGimunOpen = () => canRegister(siteConfig, 'gimun', renderedAt);
  const isMootOpen = () => canRegister(siteConfig, 'mootCup', renderedAt);

  // Forms stay mounted once opened, so switching tracks and back keeps what
  // the visitor already typed instead of silently wiping it.
  const [openedTracks, setOpenedTracks] = useState<Set<'gimun' | 'moot-cup'>>(new Set());
  if (selectedTrack && !openedTracks.has(selectedTrack)) {
    setOpenedTracks(new Set(openedTracks).add(selectedTrack));
  }

  const handleSelectTrack = (track: 'gimun' | 'moot-cup') => {
    setOverrideTrack(track);
    setSuccessData(null);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSuccessData(null);
    setOverrideTrack(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 print:space-y-0 print:m-0">
      {/* Top Breadcrumb / Track Switch Bar */}
      {selectedTrack && !successData && (
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setOverrideTrack(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-champagne hover:text-cream transition-colors px-3.5 py-1.5 rounded-xl bg-overlay/90 border border-champagne/25 shadow-md hover:bg-crest"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-champagne" />
            <span>Change Competition Track</span>
          </button>

          <span className="text-xs font-mono text-champagne/80">
            Active Track:{' '}
            <strong className={selectedTrack === 'gimun' ? 'text-crimson-soft' : 'text-champagne'}>
              {selectedTrack === 'gimun' ? 'Model United Nations (GIMUN)' : 'Moot Court (GMC)'}
            </strong>
          </span>
        </div>
      )}

      {/* Main view */}
      {successData ? (
        <RegistrationSuccess
          referenceId={successData.referenceId}
          applicantName={successData.applicantName}
          track={successData.track}
          applicantType={successData.applicantType}
          details={successData.details}
          onReset={handleReset}
        />
      ) : (
        <>
          {selectedTrack === null && (
            <TrackChooser
              onSelectTrack={handleSelectTrack}
              gimunDeadline={siteConfig.registrationDeadlines.gimun}
              mootCupDeadline={siteConfig.registrationDeadlines.mootCup}
              gimunOpen={isGimunOpen()}
              mootCupOpen={isMootOpen()}
              fees={siteConfig.fees}
            />
          )}

          {openedTracks.has('gimun') && (
            <div hidden={selectedTrack !== 'gimun'}>
              {isGimunOpen() ? (
                <GimunRegisterForm
                  committees={committees}
                  onSuccess={(refId, name, type, details) => {
                    setSuccessData({
                      referenceId: refId,
                      applicantName: name,
                      track: 'gimun',
                      applicantType: type,
                      details,
                    });
                    setOpenedTracks(new Set());
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                />
              ) : (
                <ClosedRegistrationBanner
                  track="gimun"
                  deadline={siteConfig.registrationDeadlines.gimun}
                  onSwitchTrack={() => setOverrideTrack('moot-cup')}
                />
              )}
            </div>
          )}

          {openedTracks.has('moot-cup') && (
            <div hidden={selectedTrack !== 'moot-cup'}>
              {isMootOpen() ? (
                <MootRegisterForm
                  categories={categories}
                  onSuccess={(refId, name, details) => {
                    setSuccessData({
                      referenceId: refId,
                      applicantName: name,
                      track: 'moot-cup',
                      applicantType: 'team',
                      details,
                    });
                    setOpenedTracks(new Set());
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                />
              ) : (
                <ClosedRegistrationBanner
                  track="moot-cup"
                  deadline={siteConfig.registrationDeadlines.mootCup}
                  onSwitchTrack={() => setOverrideTrack('gimun')}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
