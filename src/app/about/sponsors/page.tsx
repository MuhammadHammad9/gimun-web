import type { Metadata } from 'next';
import { getSponsors } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Sponsors & Institutional Partners | 2026 Edition',
  description: 'Our esteemed sponsors, academic patrons, and legal community partners.',
};

export default function SponsorsPage() {
  const sponsors = getSponsors();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Partnerships</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Sponsors & Partners
        </h1>
        <p className="text-neutral-gray text-base max-w-2xl">
          Proudly supported by visionary academic councils, public sector boards, and senior legal chambers.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {sponsors.map((sp) => (
          <div
            key={sp.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-4"
          >
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-slate-100 text-primary font-semibold">
              {sp.tier.replace('-', ' ')} Partner
            </span>
            <h2 className="text-xl font-heading font-bold text-ink">{sp.name}</h2>
            <p className="text-xs text-neutral-gray leading-relaxed">{sp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
