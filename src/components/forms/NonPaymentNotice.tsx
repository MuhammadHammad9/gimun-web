import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface NonPaymentNoticeProps {
  track?: 'gimun' | 'moot-cup';
}

export function NonPaymentNotice({ track }: NonPaymentNoticeProps) {
  const isMoot = track === 'moot-cup';

  return (
    <div
      className={`p-4.5 rounded-card border transition-colors ${
        isMoot
          ? 'bg-teal-50/60 border-teal-200/80 text-teal-950'
          : 'bg-orange-50/60 border-orange-200/80 text-orange-950'
      }`}
    >
      <div className="flex gap-3.5 items-start">
        <div
          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
            isMoot ? 'bg-teal-100 text-secondary' : 'bg-orange-100 text-accent'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-heading font-bold uppercase tracking-wider">
            Zero Online Payment Collection Policy
          </h4>
          <p className="text-xs text-neutral-gray leading-relaxed">
            Submitting this application does not charge you anything. GIMUN & GIKI Moot Cup does not
            collect payments online. Our Secretariat / Bench will review your credentials and contact
            you within 2–3 business days with allocation status and manual bank transfer instructions for
            seat confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
