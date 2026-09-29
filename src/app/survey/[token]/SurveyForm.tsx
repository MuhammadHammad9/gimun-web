'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { submitSurvey } from './actions';

const control =
  'mt-2 block w-full rounded-xl border border-line-2 bg-elevated px-4 py-3 text-base text-text placeholder:text-text-4 focus:border-champagne focus:outline-none focus:ring-2 focus:ring-champagne/40 sm:text-sm';

export function SurveyForm({ token, questions }: { token: string; questions: { id: string; label: string; kind: string }[] }) {
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  if (done) {
    return (
      <p role="status" className="rounded-2xl border border-line p-6 text-text-2">
        Thank you. Your feedback has been recorded.
      </p>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const answers = Object.fromEntries(new FormData(e.currentTarget));
        start(async () => {
          const result = await submitSurvey(token, answers);
          setMessage(result.error || '');
          if (result.success) setDone(true);
        });
      }}
      className="space-y-8"
    >
      {questions.map((q) =>
        q.kind === 'rating' ? (
          <fieldset key={q.id}>
            <legend className="text-sm font-medium text-text">{q.label}</legend>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <label key={v} className="cursor-pointer">
                  <input type="radio" name={q.id} value={v} required className="peer sr-only" />
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-2 text-sm text-text-2 transition-colors peer-checked:border-champagne peer-checked:bg-champagne peer-checked:text-on-accent peer-focus-visible:ring-2 peer-focus-visible:ring-focus">
                    {v}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-text-4">1 = poor, 5 = excellent</p>
          </fieldset>
        ) : (
          <label key={q.id} className="block text-sm font-medium text-text">
            {q.label}
            <textarea name={q.id} required maxLength={5000} rows={4} className={control} />
          </label>
        )
      )}
      <Button type="submit" variant="primary" loading={pending}>
        {pending ? 'Sending…' : 'Submit feedback'}
      </Button>
      {message && (
        <p role="alert" className="text-sm text-accent-gimun">
          {message}
        </p>
      )}
    </form>
  );
}
