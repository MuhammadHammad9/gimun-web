import type { Metadata } from 'next';
import Link from 'next/link';
import { getMootCategories } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Problem Categories | GIKI Moot Court',
  description: 'Areas of law and problem descriptions for the 2026 Moot Court competition.',
};

export default function MootCategoriesPage() {
  const categories = getMootCategories();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Moot Problem Categories
        </h1>
        <p className="text-neutral-gray text-base max-w-2xl">
          Each problem category challenges advocates on nuanced questions of domestic and international jurisprudence.
        </p>
      </header>

      <div className="space-y-6">
        {categories.map((cat) => (
          <article
            key={cat.id}
            className="p-8 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-secondary font-semibold">
                {cat.areaOfLaw}
              </span>
              <span className="text-xs font-mono text-neutral-gray">
                Updated {cat.lastUpdated}
              </span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-ink">{cat.name}</h2>
            <p className="text-neutral-gray text-base leading-relaxed">{cat.description}</p>
            <div className="pt-2">
              <Link
                href="/resources"
                className="inline-block text-sm font-semibold text-secondary hover:underline"
              >
                Download Compromis Document →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
