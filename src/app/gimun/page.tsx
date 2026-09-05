import type { Metadata } from 'next';
import Link from 'next/link';
import { getCommittees } from '@/lib/content';

export const metadata: Metadata = {
  title: 'GIMUN Overview | GIKI Model United Nations',
  description:
    'Discover the committees, rules of procedure, and diplomatic opportunities at GIMUN 2026.',
};

export default function GimunOverviewPage() {
  const committees = getCommittees();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono font-semibold tracking-wider uppercase text-accent">
          Track 01 — Diplomacy
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          GIKI Model United Nations
        </h1>
        <p className="text-neutral-gray text-lg max-w-3xl">
          Simulating multilateral multilateralism, conflict resolution, and global diplomacy at the foot of the Swabi hills.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6 pt-6">
        {committees.map((com) => (
          <div
            key={com.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3"
          >
            <h2 className="text-xl font-heading font-bold text-ink">{com.name}</h2>
            <p className="text-sm text-neutral-gray">{com.shortDescription}</p>
            <div className="pt-2">
              <Link
                href={`/gimun/committees/${com.slug}`}
                className="text-accent font-medium text-sm hover:underline"
              >
                View Committee Details →
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
