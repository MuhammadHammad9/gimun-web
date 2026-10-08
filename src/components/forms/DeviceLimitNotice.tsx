'use client';

import { AlertCircle } from 'lucide-react';
import { formatCountdown } from './useDeviceLimit';

/**
 * Shown above a registration form when this device has used its registration
 * allowance. Displays a live 30-minute countdown to when the visitor may try
 * again. The matching `disabled` state on the form's fieldset is what actually
 * stops input; this explains why.
 */
export function DeviceLimitNotice({ secondsLeft, maxAttempts }: { secondsLeft: number; maxAttempts: number | null }) {
  return (
    <div
      role="alert"
      className="mx-auto max-w-3xl rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-text-2"
    >
      <div className="flex items-start gap-3">
        <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-500" />
        <div className="space-y-1">
          <p className="font-semibold text-text">Registration limit reached on this device</p>
          <p>
            To keep the portal healthy for everyone, each device may submit{' '}
            {maxAttempts ? `${maxAttempts} applications` : 'a limited number of applications'} before a short pause.
            You can try again in{' '}
            <span className="font-mono font-semibold text-text" aria-live="polite">
              {formatCountdown(secondsLeft)}
            </span>
            .
          </p>
          <p className="text-text-3">
            Already registered a delegation or team? One application can list every member — you do not need to submit
            again. For changes, email the Secretariat.
          </p>
        </div>
      </div>
    </div>
  );
}
