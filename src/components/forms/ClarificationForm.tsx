'use client';

import React, { useState } from 'react';
import { FormField } from './FormField';

export function ClarificationForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 600);
  };

  if (status === 'success') {
    return (
      <div className="p-6 rounded-card bg-emerald-50 border border-emerald-200 text-center space-y-2">
        <h3 className="text-lg font-heading font-bold text-emerald-900">Query Submitted</h3>
        <p className="text-xs text-emerald-700">
          Your question has been forwarded to the Bench Drafting Committee. Rulings are published to the public Clarifications Log.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card">
      <FormField label="Assigned Team ID / Code" required id="clar-team">
        <input
          id="clar-team"
          required
          type="text"
          placeholder="e.g. MC-2026-014"
          className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </FormField>

      <FormField label="Paragraph / Section of Compromis" required id="clar-para">
        <input
          id="clar-para"
          required
          type="text"
          placeholder="e.g. Paragraph 18, Line 4"
          className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </FormField>

      <FormField label="Specific Clarification Question" required id="clar-text">
        <textarea
          id="clar-text"
          required
          rows={3}
          placeholder="State the ambiguity clearly without introducing extraneous factual assumptions..."
          className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </FormField>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-2.5 rounded-button bg-secondary text-white font-medium hover:bg-secondary-hover transition-colors text-sm"
      >
        {status === 'submitting' ? 'Submitting Question...' : 'Submit to Bench'}
      </button>
    </form>
  );
}
