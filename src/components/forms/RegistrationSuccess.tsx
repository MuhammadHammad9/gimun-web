'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Check, Printer, ArrowLeft, ShieldAlert } from 'lucide-react';
import { scaleIn } from '@/lib/motion';

interface RegistrationSuccessProps {
  referenceId: string;
  applicantName: string;
  track: 'gimun' | 'moot-cup';
  applicantType: 'individual' | 'delegation' | 'team';
  details?: {
    email?: string;
    institution?: string;
    summary?: string;
    timestamp?: string;
  };
  onReset?: () => void;
}

export function RegistrationSuccess({
  referenceId,
  applicantName,
  track,
  applicantType,
  details,
  onReset,
}: RegistrationSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (referenceId) {
      navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const isMoot = track === 'moot-cup';
  const trackLabel = isMoot ? 'GIKI Moot Court Competition' : 'GIKI Model United Nations';
  const typeLabel =
    applicantType === 'individual'
      ? 'Individual Delegate'
      : applicantType === 'delegation'
      ? 'Institutional Delegation'
      : 'Moot Court Team';

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto p-6 md:p-10 rounded-section bg-surface-elevated border border-whisper-border shadow-card space-y-8 print:border-none print:shadow-none print:p-0"
    >
      {/* Header Badge & Title */}
      <div className="text-center space-y-3">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-1 ${
            isMoot ? 'bg-teal-100 text-secondary' : 'bg-orange-100 text-accent'
          }`}
        >
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600">
            Submission Confirmed
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink">
            Application Received Successfully
          </h2>
          <p className="text-sm text-neutral-gray max-w-md mx-auto">
            Thank you, <strong className="text-ink">{applicantName}</strong>. Your application for{' '}
            <strong className="text-ink">{trackLabel}</strong> ({typeLabel}) has been logged in our secure registry.
          </p>
        </div>
      </div>

      {/* Reference ID Pill */}
      <div className="p-4.5 rounded-card bg-surface border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-gray">
            Application Reference Number
          </div>
          <div className="text-lg md:text-xl font-mono font-bold text-ink tracking-tight">
            {referenceId || 'REG-PENDING'}
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-button bg-white border border-slate-200 text-xs font-semibold text-ink hover:bg-slate-50 transition-colors shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-neutral-gray" />
              <span>Copy Reference</span>
            </>
          )}
        </button>
      </div>

      {/* Official Receipt Breakdown */}
      {details && (
        <div className="rounded-card bg-surface border border-whisper-border overflow-hidden text-left text-xs">
          <div className="bg-slate-100/75 px-4 py-2.5 border-b border-slate-200/80 font-mono text-[11px] font-bold text-ink uppercase tracking-wider">
            Official Application Dossier Summary
          </div>
          <dl className="divide-y divide-slate-100">
            <div className="grid grid-cols-3 px-4 py-2.5">
              <dt className="text-neutral-gray font-medium">Candidate / Team</dt>
              <dd className="col-span-2 text-ink font-semibold">{applicantName}</dd>
            </div>
            {details.institution && (
              <div className="grid grid-cols-3 px-4 py-2.5">
                <dt className="text-neutral-gray font-medium">Institution</dt>
                <dd className="col-span-2 text-ink">{details.institution}</dd>
              </div>
            )}
            {details.email && (
              <div className="grid grid-cols-3 px-4 py-2.5">
                <dt className="text-neutral-gray font-medium">Contact Email</dt>
                <dd className="col-span-2 text-ink font-mono">{details.email}</dd>
              </div>
            )}
            {details.summary && (
              <div className="grid grid-cols-3 px-4 py-2.5">
                <dt className="text-neutral-gray font-medium">Preferences</dt>
                <dd className="col-span-2 text-ink">{details.summary}</dd>
              </div>
            )}
            <div className="grid grid-cols-3 px-4 py-2.5">
              <dt className="text-neutral-gray font-medium">Application Status</dt>
              <dd className="col-span-2 text-emerald-700 font-semibold">
                Logged & Pending Review (No Online Payment Collected)
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Non-Payment Policy Reminder */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 flex gap-3 text-left">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed">
          <span className="font-bold block">Important: Zero Online Payment Charged</span>
          <span>
            You have not been billed. The Organizing Committee handles fee collection manually. Please preserve
            your reference number <strong>{referenceId}</strong> for all correspondence regarding your allocation and fee invoice.
          </span>
        </div>
      </div>

      {/* What Happens Next Roadmap */}
      <div className="space-y-4 text-left">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray">
          Next Steps & Review Timeline
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="p-4 rounded-card bg-surface border border-whisper-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-ink">
              <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[11px]">1</span>
              <span>Dossier Review</span>
            </div>
            <p className="text-xs text-neutral-gray leading-relaxed">
              Secretariat / Bench evaluates committee allocations & moot team roster within 2–3 business days.
            </p>
          </div>

          <div className="p-4 rounded-card bg-surface border border-whisper-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-ink">
              <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[11px]">2</span>
              <span>Official Invoice</span>
            </div>
            <p className="text-xs text-neutral-gray leading-relaxed">
              Conditional acceptance letter and official university bank transfer details dispatched via email.
            </p>
          </div>

          <div className="p-4 rounded-card bg-surface border border-whisper-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-ink">
              <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[11px]">3</span>
              <span>Seat Confirmation</span>
            </div>
            <p className="text-xs text-neutral-gray leading-relaxed">
              Payment proof verified by Finance; official Country Matrix allocation or Team Code confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-surface border border-slate-200 text-xs font-semibold text-ink hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-4 h-4 text-neutral-gray" />
            <span>Print / Save Receipt</span>
          </button>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-neutral-gray hover:text-ink font-medium px-3 py-2 underline"
            >
              Submit another application
            </button>
          )}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-colors shadow-button"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </motion.div>
  );
}
