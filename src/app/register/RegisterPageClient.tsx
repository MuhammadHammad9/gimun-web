'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { Committee, ProblemCategory, SiteConfig } from '@/lib/types';
import { TrackChooser } from '@/components/forms/TrackChooser';
import { GimunRegisterForm } from '@/components/forms/GimunRegisterForm';
import { MootRegisterForm } from '@/components/forms/MootRegisterForm';
import { ClosedRegistrationBanner } from '@/components/forms/ClosedRegistrationBanner';
import { RegistrationSuccess } from '@/components/forms/RegistrationSuccess';
import { isRegistrationDeadlinePassed } from '@/lib/site-config';

interface RegisterPageClientProps {
  committees: Committee[];
  categories: ProblemCategory[];
  siteConfig: SiteConfig;
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

function RegisterContent({ committees, categories, siteConfig }: RegisterPageClientProps) {
  const searchParams = useSearchParams();
  const trackQuery = searchParams.get('track') || (searchParams.has('committee') ? 'gimun' : searchParams.has('category') ? 'moot-cup' : null);

  const [overrideTrack, setOverrideTrack] = useState<'gimun' | 'moot-cup' | null | undefined>(undefined);
  const selectedTrack: 'gimun' | 'moot-cup' | null =
    overrideTrack !== undefined
      ? overrideTrack
      : trackQuery === 'gimun' || trackQuery === 'moot-cup'
      ? trackQuery
      : null;
  const setSelectedTrack = (track: 'gimun' | 'moot-cup' | null) => setOverrideTrack(track);

  const [successData, setSuccessData] = useState<SuccessState | null>(null);

  // Check deadline & manual kill-switch status
  const isGimunOpen = () => {
    const manualOpen = siteConfig.registrationStatus?.gimunOpen !== false;
    const deadline = siteConfig.registrationDeadlines.gimun;
    const pastDeadline = isRegistrationDeadlinePassed(deadline);
    return manualOpen && !pastDeadline;
  };

  const isMootOpen = () => {
    const manualOpen = siteConfig.registrationStatus?.mootCupOpen !== false;
    const deadline = siteConfig.registrationDeadlines.mootCup;
    const pastDeadline = isRegistrationDeadlinePassed(deadline);
    return manualOpen && !pastDeadline;
  };

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

      {/* Main View Transition */}
      <AnimatePresence mode="wait">
        {successData ? (
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
          >
            <RegistrationSuccess
              referenceId={successData.referenceId}
              applicantName={successData.applicantName}
              track={successData.track}
              applicantType={successData.applicantType}
              details={successData.details}
              onReset={handleReset}
            />
          </motion.div>
        ) : selectedTrack === null ? (
          <motion.div
            key="chooser-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <TrackChooser
              onSelectTrack={handleSelectTrack}
              gimunDeadline={siteConfig.registrationDeadlines.gimun}
              mootCupDeadline={siteConfig.registrationDeadlines.mootCup}
              gimunOpen={isGimunOpen()}
              mootCupOpen={isMootOpen()}
              fees={siteConfig.fees}
            />
          </motion.div>
        ) : selectedTrack === 'gimun' ? (
          <motion.div
            key="gimun-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="moot-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
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
                  window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
              />
            ) : (
              <ClosedRegistrationBanner
                track="moot-cup"
                deadline={siteConfig.registrationDeadlines.mootCup}
                onSwitchTrack={() => setSelectedTrack('gimun')}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RegisterPageClient(props: RegisterPageClientProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-12 text-center text-sm font-mono text-champagne/70 animate-pulse">
          Loading Official Registration Portal…
        </div>
      }
    >
      <RegisterContent {...props} />
    </Suspense>
  );
}
