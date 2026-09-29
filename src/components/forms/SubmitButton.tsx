import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A form's submit button that changes state in place: its label slides out
 * and a turning ring with "Sending…" slides in while the request runs. Both
 * states share one grid cell, so the button never changes size, and only the
 * visible state is exposed to assistive technology (aria-busy while sending).
 */
export function SubmitButton({
  pending,
  children,
  pendingLabel = 'Sending…',
  className,
}: {
  pending: boolean;
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      data-state={pending ? 'pending' : 'idle'}
      className={cn('submit-morph', className)}
    >
      <span className="submit-morph__face" aria-hidden={pending || undefined}>
        {children}
      </span>
      <span className="submit-morph__face submit-morph__face--pending" aria-hidden={!pending || undefined}>
        <span className="submit-morph__spinner" aria-hidden="true" />
        {pendingLabel}
      </span>
    </button>
  );
}
