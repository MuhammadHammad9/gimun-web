'use client';

import { useSiteConfig } from '@/components/SiteConfigProvider';

import React, { useEffect, useRef, useState } from 'react';
import { FormField } from './FormField';
import { HoneypotField } from './HoneypotField';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { validateEmail } from '@/lib/validation';
import { getEventYear } from '@/lib/site-config';

export function ClarificationForm() {
  const eventYear = getEventYear(useSiteConfig());
  const [teamId, setTeamId] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [paragraphRef, setParagraphRef] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const formLoadedAt = useRef(0);
  const submissionKey = useRef<string | null>(null);

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId.trim() || !teamEmail.trim() || !paragraphRef.trim() || !questionText.trim()) {
      setServerError('Team ID, email, case-problem section and your question are all required.');
      setStatus('error');
      return;
    }
    const emailError = validateEmail(teamEmail);
    if (emailError) {
      setServerError(emailError);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setServerError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Advocate of ${teamId.trim()}`,
          email: teamEmail.trim(),
          queryType: 'moot-cup',
          kind: 'clarification',
          submission_key: submissionKey.current ?? (submissionKey.current = crypto.randomUUID()),
          message: `[GMC Compromis Clarification]\nCompromis Citation: ${paragraphRef.trim()}\n\nQuestion:\n${questionText.trim()}`,
          _hp: honeypot,
          _ts: formLoadedAt.current,
          _elapsed: Date.now() - formLoadedAt.current,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setServerError(data.message || 'Failed to submit clarification query.');
      }
    } catch {
      setStatus('error');
      setServerError('Network error. Please verify your connection and try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-6 rounded-2xl bg-raised border border-champagne-lo/40 text-center space-y-3 text-text">
        <div className="w-10 h-10 rounded-full bg-elevated/80 text-champagne border border-champagne-lo/60 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-h3 font-display font-medium text-text">Question submitted</h3>
        <p className="text-xs text-text-2 leading-relaxed max-w-sm mx-auto">
          Your question regarding Compromis section <strong>{paragraphRef}</strong> has been logged.
          Official clarifications are reviewed and published to the public Clarifications Log.
        </p>
        <button
          type="button"
          onClick={() => {
            setTeamId('');
            setTeamEmail('');
            setParagraphRef('');
            setQuestionText('');
            setHoneypot('');
            setServerError(null);
            setStatus('idle');
            formLoadedAt.current = Date.now();
          }}
          className="text-xs text-champagne font-semibold underline pt-2 block mx-auto hover:text-text cursor-pointer"
        >
          Ask another question
        </button>
      </div>
    );
  }

  // noValidate, like the contact and registration forms: the browser's native
  // bubbles stop at the first empty field and cannot be styled or announced
  // consistently. Without it the submit handler never ran at all, so this form
  // silently did nothing when fields were left blank.
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 text-text"
    >
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      {status === 'error' && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-accent-gimun/40 bg-accent-gimun/8 p-3 text-xs text-accent-gimun"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError || 'An error occurred. Please try again.'}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Team ID" required id="clar-team">
          <input
            id="clar-team"
            required
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder={`e.g. MC-${eventYear}-014`}
            className="w-full px-4 py-2.5 rounded-xl border border-line-2 bg-canvas/90 text-text placeholder-champagne/40 text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
          />
        </FormField>

        <FormField label="Contact Email" required id="clar-email">
          <input
            id="clar-email"
            type="email"
            value={teamEmail}
            onChange={(e) => setTeamEmail(e.target.value)}
            placeholder="advocate@university.edu.pk"
            className="w-full px-4 py-2.5 rounded-xl border border-line-2 bg-canvas/90 text-text placeholder-champagne/40 text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
          />
        </FormField>
      </div>

      <FormField label="Which part of the case problem?" required id="clar-para">
        <input
          id="clar-para"
          required
          type="text"
          value={paragraphRef}
          onChange={(e) => setParagraphRef(e.target.value)}
          placeholder="e.g. Paragraph 18, Line 4"
          className="w-full px-4 py-2.5 rounded-xl border border-line-2 bg-canvas/90 text-text placeholder-champagne/40 text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
        />
      </FormField>

      <FormField label="Your question" required id="clar-text">
        <textarea
          id="clar-text"
          required
          rows={3}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="State the ambiguity clearly without introducing extraneous factual assumptions..."
          className="w-full px-4 py-2.5 rounded-xl border border-line-2 bg-canvas/90 text-text placeholder-champagne/40 text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
        />
      </FormField>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-shimmer-gold w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-on-accent"
      >
        <Send className="w-4 h-4" />
        <span>{status === 'submitting' ? 'Sending…' : 'Submit question'}</span>
      </button>
    </form>
  );
}
