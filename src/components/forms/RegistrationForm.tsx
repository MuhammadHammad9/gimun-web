'use client';

import React, { useState } from 'react';
import { FormField } from './FormField';

interface RegistrationFormProps {
  defaultTrack?: 'gimun' | 'moot-cup';
}

export function RegistrationForm({ defaultTrack = 'gimun' }: RegistrationFormProps) {
  const [track, setTrack] = useState<'gimun' | 'moot-cup'>(defaultTrack);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 800);
  };

  if (status === 'success') {
    return (
      <div className="p-8 rounded-card bg-emerald-50 border border-emerald-200 text-center space-y-3">
        <h3 className="text-xl font-heading font-bold text-emerald-900">Application Submitted</h3>
        <p className="text-sm text-emerald-700">
          Your credentials have been logged with the Secretariat. You will receive an email confirmation and invoice within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-8 rounded-card bg-surface-elevated border border-whisper-border shadow-card">
      <div className="flex gap-4 p-1.5 bg-slate-100 rounded-button">
        <button
          type="button"
          onClick={() => setTrack('gimun')}
          className={`flex-1 py-2 text-xs font-semibold rounded-button transition-colors ${
            track === 'gimun' ? 'bg-accent text-white shadow-sm' : 'text-neutral-gray hover:text-ink'
          }`}
        >
          GIMUN Delegation
        </button>
        <button
          type="button"
          onClick={() => setTrack('moot-cup')}
          className={`flex-1 py-2 text-xs font-semibold rounded-button transition-colors ${
            track === 'moot-cup' ? 'bg-secondary text-white shadow-sm' : 'text-neutral-gray hover:text-ink'
          }`}
        >
          Moot Court Team
        </button>
      </div>

      <FormField label="Full Name / Head Delegate" required id="reg-name">
        <input
          id="reg-name"
          required
          type="text"
          placeholder="e.g. Zaid Malik"
          className="w-full px-4 py-2.5 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </FormField>

      <FormField label="Institutional Email" required id="reg-email">
        <input
          id="reg-email"
          required
          type="email"
          placeholder="e.g. delegate@institution.edu.pk"
          className="w-full px-4 py-2.5 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </FormField>

      <FormField label="University / School / Law Faculty" required id="reg-inst">
        <input
          id="reg-inst"
          required
          type="text"
          placeholder="e.g. GIKI, LUMS, NUST"
          className="w-full px-4 py-2.5 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </FormField>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={`w-full py-3 rounded-button font-semibold text-white transition-colors ${
          track === 'gimun' ? 'bg-accent hover:bg-accent-hover' : 'bg-secondary hover:bg-secondary-hover'
        }`}
      >
        {status === 'submitting' ? 'Submitting Application...' : 'Submit Application'}
      </button>
    </form>
  );
}
