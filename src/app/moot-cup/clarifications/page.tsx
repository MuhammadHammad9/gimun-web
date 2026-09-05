import type { Metadata } from 'next';
import { getClarifications } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Clarifications Log | GIKI Moot Court',
  description: 'Official answers and clarifications issued on the Moot Court Problem Proposition.',
};

export default function ClarificationsPage() {
  const clarifications = getClarifications();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-secondary font-semibold">
          Moot Compromis
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Official Clarifications Log
        </h1>
        <p className="text-neutral-gray text-base">
          Formal questions submitted by participating teams and binding interpretations issued by the Bench Drafting Committee.
        </p>
      </header>

      <div className="space-y-4">
        {clarifications.map((item) => (
          <article
            key={item.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-secondary">
                Clarification #{item.number}
              </span>
              <span className="text-xs font-mono text-neutral-gray">
                {new Date(item.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-mono uppercase font-semibold text-ink/70">Question:</h2>
              <p className="text-sm font-medium text-ink">{item.question}</p>
            </div>
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-mono uppercase font-semibold text-secondary">Official Ruling:</h3>
              <p className="text-sm text-neutral-gray leading-relaxed">{item.answer}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
