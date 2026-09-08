'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import type { ContactFormData, SubmissionResponse } from '@/lib/types';
import { validateContactForm, type ValidationErrors } from '@/lib/validation';
import { FormField } from './FormField';
import { HoneypotField } from './HoneypotField';
import { scaleIn } from '@/lib/motion';

function ContactFormInner() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || '';

  const mapParamToQueryType = (param: string): ContactFormData['queryType'] => {
    if (param.includes('gimun')) return 'gimun';
    if (param.includes('moot')) return 'moot-cup';
    if (param.includes('sponsor')) return 'sponsorship';
    if (param.includes('media')) return 'media';
    return 'other';
  };

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    queryType: typeParam ? mapParamToQueryType(typeParam) : 'gimun',
    message: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(0);

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMessage(null);

    const validationResult = validateContactForm(formData);
    if (Object.keys(validationResult).length > 0) {
      setErrors(validationResult);
      const firstErrorKey = Object.keys(validationResult)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _hp: honeypot,
          _ts: formLoadedAt.current,
        }),
      });

      const data: SubmissionResponse = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        setServerMessage(data.message || 'Failed to dispatch inquiry. Please try again.');
        if (data.errors) setErrors(data.errors);
        return;
      }

      setStatus('success');
      setServerMessage(data.message);
    } catch (err) {
      console.error('Contact form submission error:', err);
      setStatus('error');
      setServerMessage('Unable to reach inquiry server. Please check your network connection.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="p-8 rounded-card bg-emerald-50/90 border border-emerald-200 text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-heading font-bold text-emerald-900">Message Dispatched</h3>
          <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
            {serverMessage || 'Thank you for reaching out. The Secretariat has received your dispatch and will respond via email within 24 hours.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setFormData({ name: '', email: '', queryType: 'gimun', message: '' });
          }}
          className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 pt-2"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 p-6 md:p-8 rounded-card bg-surface-elevated border border-whisper-border shadow-card"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-mono uppercase font-bold text-ink tracking-wide">
          Direct Inquiry Dispatch
        </h2>
      </div>

      {serverMessage && status === 'error' && (
        <div className="p-3.5 rounded-button bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{serverMessage}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Your Full Name" required error={errors.name} id="field-name">
          <input
            id="field-name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Ayesha Tariq"
            className="w-full px-4 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </FormField>

        <FormField label="Email Address" required error={errors.email} id="field-email">
          <input
            id="field-email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="ayesha@institution.edu.pk"
            className="w-full px-4 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </FormField>
      </div>

      <FormField label="Inquiry Category" required error={errors.queryType} id="field-queryType">
        <select
          id="field-queryType"
          value={formData.queryType}
          onChange={(e) => handleChange('queryType', e.target.value)}
          className="w-full px-4 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="gimun">GIMUN Secretariat (Committees, Country Matrix, Delegations)</option>
          <option value="moot-cup">Moot Court Bench (Compromis, Rules, Memorials)</option>
          <option value="sponsorship">Corporate Sponsorship & Brand Partnerships</option>
          <option value="media">Media, Press & Campus Ambassador Inquiries</option>
          <option value="other">General Logistics, Travel & Campus Security</option>
        </select>
      </FormField>

      <FormField
        label="Message / Query Details"
        required
        description="Provide relevant details or citation paragraphs"
        error={errors.message}
        id="field-message"
      >
        <textarea
          id="field-message"
          rows={4}
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="State your question regarding committee allocation, compromise clarification, or travel coordination..."
          className="w-full px-4 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </FormField>

      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={`w-full py-3 rounded-button font-semibold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-button ${
          status === 'submitting'
            ? 'bg-primary/80 cursor-wait animate-pulse'
            : 'bg-primary hover:bg-primary-light active:scale-[0.99]'
        }`}
      >
        {status === 'submitting' ? (
          <span>Transmitting Message to Directorate…</span>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Send Direct Message</span>
          </>
        )}
      </button>
    </form>
  );
}

export function ContactForm() {
  return (
    <Suspense
      fallback={
        <div className="p-8 rounded-card bg-surface text-center text-xs font-mono text-neutral-gray animate-pulse">
          Loading contact form…
        </div>
      }
    >
      <ContactFormInner />
    </Suspense>
  );
}
