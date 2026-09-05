import type { Metadata } from 'next';
import Link from 'next/link';
import { getMootCategories } from '@/lib/content';

export const metadata: Metadata = {
  title: 'GIKI Moot Court Competition | Overview',
  description:
    'National moot court competition featuring elite advocacy, judicial scrutiny, and complex legal propositions.',
};

export default function MootCupOverviewPage() {
  const categories = getMootCategories();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono font-semibold tracking-wider uppercase text-secondary">
          Track 02 — Legal Advocacy
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          GIKI Moot Court Competition
        </h1>
        <p className="text-neutral-gray text-lg max-w-3xl">
          Arguing critical legal jurisprudence before benches of retired judges, senior advocates, and legal luminaries.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-6 pt-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3"
          >
            <span className="text-xs font-mono uppercase text-secondary font-semibold">
              {cat.areaOfLaw}
            </span>
            <h2 className="text-xl font-heading font-bold text-ink">{cat.name}</h2>
            <p className="text-sm text-neutral-gray">{cat.description}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-4 pt-6">
        <Link
          href="/moot-cup/categories"
          className="px-6 py-3 rounded-button bg-secondary text-white font-medium hover:bg-secondary-hover transition-colors"
        >
          View Problem Categories
        </Link>
        <Link
          href="/moot-cup/clarifications"
          className="px-6 py-3 rounded-button bg-surface-elevated text-ink border border-whisper-border font-medium hover:bg-slate-50 transition-colors"
        >
          Clarifications Log
        </Link>
      </div>
    </div>
  );
}
