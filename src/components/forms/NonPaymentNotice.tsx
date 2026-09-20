import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface NonPaymentNoticeProps {
  track?: 'gimun' | 'moot-cup';
}

export function NonPaymentNotice({ track }: NonPaymentNoticeProps) {
  return (
    <div data-track={track} className="p-4.5 rounded-xl border border-champagne/25 bg-crest/70 backdrop-blur-sm text-champagne">
      <div className="flex gap-3.5 items-start">
        <div className="p-2 rounded-xl shrink-0 mt-0.5 bg-champagne/15 text-champagne border border-champagne/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-cream">
            Zero Online Payment Collection Policy
          </h4>
          <p className="text-xs text-champagne/80 leading-relaxed">
            Submitting this application does not charge you anything. GIMUN & GMC does not
            collect payments online. Our Secretariat / Bench will review your credentials and contact
            you with allocation status and official bank transfer instructions for seat confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
