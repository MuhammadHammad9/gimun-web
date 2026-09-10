'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FormField } from './FormField';
import { HoneypotField } from './HoneypotField';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { validateEmail } from '@/lib/validation';
import { getEventYear } from '@/lib/site-config';

export function ClarificationForm() {
  const eventYear = getEventYear();
  const [teamId, setTeamId] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [paragraphRef, setParagraphRef] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const formLoadedAt = useRef(0);

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId.trim() || !teamEmail.trim() || !paragraphRef.trim() || !questionText.trim()) {
      setServerError('Team ID, contact email, citation, and question are required.');
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
          message: `[GMC Compromis Clarification]\nCompromis Citation: ${paragraphRef.trim()}\n\nQuestion:\n${questionText.trim()}`,
          _hp: honeypot,
          _ts: formLoadedAt.current,
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
      <div className="p-6 rounded-card bg-emerald-50 border border-emerald-200 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-heading font-bold text-emerald-900">Query Submitted to Bench</h3>
        <p className="text-xs text-emerald-700 leading-relaxed max-w-sm mx-auto">
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
          className="text-xs text-emerald-800 font-semibold underline pt-2 block mx-auto"
        >
          Submit another clarification
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      {status === 'error' && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError || 'An error occurred. Please try again.'}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Assigned Team ID / Code" required id="clar-team">
          <input
            id="clar-team"
            required
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder={`e.g. MC-${eventYear}-014`}
            className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </FormField>

          <FormField label="Contact Email" required id="clar-email">
          <input
            id="clar-email"
            type="email"
            value={teamEmail}
            onChange={(e) => setTeamEmail(e.target.value)}
            placeholder="advocate@university.edu.pk"
            className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </FormField>
      </div>

      <FormField label="Paragraph / Section of Compromis" required id="clar-para">
        <input
          id="clar-para"
          required
          type="text"
          value={paragraphRef}
          onChange={(e) => setParagraphRef(e.target.value)}
          placeholder="e.g. Paragraph 18, Line 4"
          className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </FormField>

      <FormField label="Specific Clarification Question" required id="clar-text">
        <textarea
          id="clar-text"
          required
          rows={3}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="State the ambiguity clearly without introducing extraneous factual assumptions..."
          className="w-full px-3.5 py-2 rounded-button border border-whisper-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </FormField>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-2.5 rounded-button bg-secondary text-white font-medium hover:bg-secondary-hover transition-colors text-sm flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        <span>{status === 'submitting' ? 'Submitting Question...' : 'Submit to Bench'}</span>
      </button>
    </form>
  );
}
