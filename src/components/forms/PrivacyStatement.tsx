import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export function PrivacyStatement() {
  return (
    <div className="flex items-start justify-center gap-2 text-center text-xs text-neutral-gray max-w-lg mx-auto pt-2">
      <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
      <p className="leading-relaxed text-[11px]">
        We respect your privacy. Contact details, delegate rosters, and dietary/accessibility
        accommodations submitted through this portal are processed strictly by the GIMUN & GMC
        Organizing Committee for event logistics and delegate verification. No personal data is
        published publicly. Read the <Link className="font-semibold text-primary underline" href="/privacy">draft privacy notice</Link> before submitting.
      </p>
    </div>
  );
}
