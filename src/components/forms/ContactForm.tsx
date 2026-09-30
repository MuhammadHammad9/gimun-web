'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ContactFormData, SubmissionResponse } from '@/lib/types';
import { validateContactForm, type ValidationErrors } from '@/lib/validation';
import { FormField } from './FormField';
import { HoneypotField } from './HoneypotField';
import { focusFirstError } from './FormErrorSummary';
import { SubmitButton } from './SubmitButton';
import { newSubmissionKey } from '@/lib/uuid';

const MESSAGE_MAX = 3000;

function mapParamToQueryType(param: string): ContactFormData['queryType'] {
  if (param.includes('gimun')) return 'gimun';
  if (param.includes('moot')) return 'moot-cup';
  if (param.includes('sponsor')) return 'sponsorship';
  if (param.includes('media')) return 'media';
  return 'other';
}

/**
 * `initialType` comes from the page's `?type=` search param, read on the
 * server so the form is part of the HTML instead of a loading placeholder.
 */
export function ContactForm({ initialType = '' }: { initialType?: string }) {
  const defaultQueryType = initialType ? mapParamToQueryType(initialType) : 'other';

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    queryType: defaultQueryType,
    message: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(0);
  // One key per message, kept across retries of the same submission.
  const submissionKey = useRef<string | null>(null);

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
      focusFirstError(validationResult);
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
          submission_key: submissionKey.current ?? (submissionKey.current = newSubmissionKey()),
          _hp: honeypot,
          _ts: formLoadedAt.current,
          _elapsed: Date.now() - formLoadedAt.current,
        }),
      });

      // A proxy or platform error page is not JSON. That is a server problem,
      // not the visitor's connection, so say so.
      const data = (await res.json().catch(() => null)) as SubmissionResponse | null;

      if (!data || !res.ok || !data.success) {
        setStatus('error');
        setServerMessage(
          data?.message ||
            `The message service is unavailable right now (error ${res.status}). Please try again shortly or email us directly.`
        );
        if (data?.errors) {
          setErrors(data.errors);
          focusFirstError(data.errors);
        }
        return;
      }

      setStatus('success');
      setServerMessage(data.message);
      submissionKey.current = null;
    } catch {
      console.error('Contact request failed.');
      setStatus('error');
      setServerMessage('Unable to reach inquiry server. Please check your network connection.');
    }
  };

  if (status === 'success') {
    return (
      <div
        className="p-8 rounded-2xl bg-raised border border-line-2 text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-elevated text-champagne flex items-center justify-center mx-auto border border-line-2">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-display font-medium text-text">Message Dispatched</h3>
          <p className="text-xs text-text-2 max-w-sm mx-auto leading-relaxed">
            {serverMessage || 'Thank you for reaching out. The Secretariat has received your dispatch and will respond via email.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setFormData({ name: '', email: '', queryType: defaultQueryType, message: '' });
            setErrors({});
            setHoneypot('');
            formLoadedAt.current = Date.now();
          }}
          className="text-xs font-semibold text-champagne underline hover:text-text pt-2 cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-3xl border border-line bg-raised p-6 md:p-8"
    >
      <h2 className="font-display text-2xl font-medium text-text">Send a message</h2>

      {serverMessage && status === 'error' && (
        <div role="alert" className="p-3.5 rounded-xl bg-accent-gimun/8 border border-accent-gimun/40 text-accent-gimun flex items-start gap-2.5 text-xs">
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
            className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas/90 text-text placeholder:text-text-4 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
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
            className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas/90 text-text placeholder:text-text-4 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
          />
        </FormField>
      </div>

      <FormField label="Inquiry Category" required error={errors.queryType} id="field-queryType">
        <select
          id="field-queryType"
          value={formData.queryType}
          onChange={(e) => handleChange('queryType', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas/90 text-text text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
        >
          <option value="other" className="bg-canvas text-text">General questions, logistics &amp; travel</option>
          <option value="gimun" className="bg-canvas text-text">GIMUN Secretariat (Committees, Country Matrix, Delegations)</option>
          <option value="moot-cup" className="bg-canvas text-text">Moot Court Bench (Compromis, Rules, Memorials)</option>
          <option value="sponsorship" className="bg-canvas text-text">Corporate Sponsorship &amp; Brand Partnerships</option>
          <option value="media" className="bg-canvas text-text">Media, Press &amp; Campus Ambassador Inquiries</option>
        </select>
      </FormField>

      <FormField
        label="Message / Query Details"
        required
        description={`At least 10 characters. ${formData.message.length}/${MESSAGE_MAX}`}
        error={errors.message}
        id="field-message"
      >
        <textarea
          id="field-message"
          rows={4}
          maxLength={MESSAGE_MAX}
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Your question about registration, committees, the moot problem or travel…"
          className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas/90 text-text placeholder:text-text-4 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
        />
      </FormField>

      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <SubmitButton
        pending={status === 'submitting'}
        className="btn-shimmer-gold w-full py-3.5 rounded-xl font-bold text-xs transition-all hover:brightness-110 active:scale-[0.99]"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Send Direct Message</span>
      </SubmitButton>
    </form>
  );
}

function ContactFormWithParams() {
  const type = useSearchParams().get('type') || '';
  return <ContactForm key={type} initialType={type} />;
}

/**
 * Keeps /contact statically cached: the server HTML contains the default
 * form, and ?type= preselects the category once the page hydrates.
 */
export function ContactFormFromUrl() {
  return (
    <Suspense fallback={<ContactForm />}>
      <ContactFormWithParams />
    </Suspense>
  );
}
