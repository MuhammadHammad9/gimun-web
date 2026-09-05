import type { Metadata } from 'next';
import Link from 'next/link';
import { getCommittees } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Committees | GIMUN 2026',
  description: 'Explore the committees, agendas, and topics simulated at GIMUN 2026.',
};

export default function CommitteesPage() {
  const committees = getCommittees();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          GIMUN Committees
        </h1>
        <p className="text-neutral-gray text-base max-w-2xl">
          Browse through our specialized organs and general assemblies for this edition.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {committees.map((com) => (
          <article
            key={com.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-4"
          >
            <span className="text-xs font-mono uppercase text-accent font-semibold">
              {com.type.replace('-', ' ')}
            </span>
            <h2 className="text-2xl font-heading font-bold text-ink">{com.name}</h2>
            <p className="text-neutral-gray text-sm">{com.shortDescription}</p>
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-mono font-semibold uppercase text-ink/70">
                Agenda Topics:
              </h3>
              <ul className="list-disc pl-5 text-sm text-neutral-gray space-y-1">
                {com.topics.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-gray">
                Capacity: {com.capacity ? `${com.capacity} Delegates` : 'Open'}
              </span>
              <Link
                href={`/gimun/committees/${com.slug}`}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Full Dossier & Matrix →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
