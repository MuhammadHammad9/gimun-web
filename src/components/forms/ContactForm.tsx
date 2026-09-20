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
    } catch {
      console.error('Contact request failed.');
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
        className="p-8 rounded-2xl bg-raised/95 border border-champagne/30 text-center space-y-4 shadow-xl"
      >
        <div className="w-12 h-12 rounded-full bg-elevated text-champagne flex items-center justify-center mx-auto border border-champagne/30">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-heading font-bold text-text">Message Dispatched</h3>
          <p className="text-xs text-champagne/85 max-w-sm mx-auto leading-relaxed">
            {serverMessage || 'Thank you for reaching out. The Secretariat has received your dispatch and will respond via email.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setFormData({ name: '', email: '', queryType: 'gimun', message: '' });
            setErrors({});
            setHoneypot('');
            formLoadedAt.current = Date.now();
          }}
          className="text-xs font-semibold text-champagne underline hover:text-text pt-2 cursor-pointer"
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
      className="space-y-5 p-6 md:p-8 rounded-2xl bg-raised/90 border border-champagne/25 shadow-xl"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-champagne/15">
        <MessageSquare className="w-4 h-4 text-champagne" />
        <h2 className="text-sm font-mono uppercase font-bold text-text tracking-wide">
          Direct Inquiry Dispatch
        </h2>
      </div>

      {serverMessage && status === 'error' && (
        <div className="p-3.5 rounded-xl bg-brand-deep/80 border border-crimson/50 text-crimson-soft flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-crimson-hi shrink-0 mt-0.5" />
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
            className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder:text-champagne/40 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
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
            className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder:text-champagne/40 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
          />
        </FormField>
      </div>

      <FormField label="Inquiry Category" required error={errors.queryType} id="field-queryType">
        <select
          id="field-queryType"
          value={formData.queryType}
          onChange={(e) => handleChange('queryType', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas/90 text-text text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
        >
          <option value="gimun" className="bg-canvas text-text">GIMUN Secretariat (Committees, Country Matrix, Delegations)</option>
          <option value="moot-cup" className="bg-canvas text-text">Moot Court Bench (Compromis, Rules, Memorials)</option>
          <option value="sponsorship" className="bg-canvas text-text">Corporate Sponsorship &amp; Brand Partnerships</option>
          <option value="media" className="bg-canvas text-text">Media, Press &amp; Campus Ambassador Inquiries</option>
          <option value="other" className="bg-canvas text-text">General Logistics, Travel &amp; Campus Security</option>
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
          className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder:text-champagne/40 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
        />
      </FormField>

      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
          status === 'submitting'
            ? 'btn-shimmer-gold opacity-80 cursor-wait animate-pulse'
            : 'btn-shimmer-gold hover:brightness-110 active:scale-[0.99]'
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
        <div className="p-8 rounded-2xl bg-raised/90 border border-champagne/20 text-center text-xs font-mono text-champagne/70 animate-pulse">
          Loading contact form…
        </div>
      }
    >
      <ContactFormInner />
    </Suspense>
  );
}
