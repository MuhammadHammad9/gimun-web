import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export function PrivacyStatement() {
  return (
    <div className="flex items-start justify-center gap-2 text-center text-xs text-champagne/70 max-w-lg mx-auto pt-2">
      <Lock className="w-3.5 h-3.5 shrink-0 text-champagne/50 mt-0.5" />
      <p className="leading-relaxed text-[11px]">
        We respect your privacy. Contact details, delegate rosters, and accommodations submitted through this portal are processed strictly by the GIMUN &amp; GMC Organizing Committee for event logistics. Award results and certificate verification links can display participant names. Read the <Link className="font-semibold text-champagne hover:text-cream underline" href="/privacy">privacy notice</Link> before submitting.
      </p>
    </div>
  );
}
