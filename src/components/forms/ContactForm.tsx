'use client';

import React, { useState } from 'react';
import { FormField } from './FormField';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 700);
  };

  if (status === 'success') {
    return (
      <div className="p-6 rounded-card bg-emerald-50 border border-emerald-200 text-center space-y-2">
        <h3 className="text-lg font-heading font-bold text-emerald-900">Message Received</h3>
        <p className="text-xs text-emerald-700">
          Thank you for getting in touch. Our Secretariat will respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card">
      <FormField label="Your Name" required id="contact-name">
        <input
          id="contact-name"
          required
          type="text"
          placeholder="e.g. Ayesha Tariq"
          className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </FormField>

      <FormField label="Email Address" required id="contact-email">
        <input
          id="contact-email"
          required
          type="email"
          placeholder="e.g. name@example.com"
          className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </FormField>

      <FormField label="Message / Inquiry" required id="contact-msg">
        <textarea
          id="contact-msg"
          required
          rows={4}
          placeholder="Detail your inquiry regarding delegate allocations, travel, or bench queries..."
          className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </FormField>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-2.5 rounded-button bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-sm"
      >
        {status === 'submitting' ? 'Sending Message...' : 'Send Message'}
      </button>
    </form>
  );
}
