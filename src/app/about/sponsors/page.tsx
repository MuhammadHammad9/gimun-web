import type { Metadata } from 'next';
import { getSponsors } from '@/lib/content';
import { SponsorsClient } from './SponsorsClient';

export const metadata: Metadata = {
  title: 'Institutional Sponsors & Strategic Patrons | GIMUN & GIKI Moot Cup 2026',
  description: 'Our esteemed statutory patrons, government boards, corporate partners, and legal chambers supporting Pakistan’s premier youth diplomatic and legal advocacy championship.',
};

export default function SponsorsPage() {
  const sponsors = getSponsors();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 text-primary border border-slate-200">
            Institutional Partnerships
          </span>
          <span className="text-xs font-mono text-neutral-gray uppercase tracking-wider">
            PRD §18.3
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          Sponsors & Strategic Partners
        </h1>
        <p className="text-sm sm:text-base text-neutral-gray leading-relaxed">
          Proudly supported by visionary academic councils, public sector technology boards, and
          senior bar associations. Explore tier benefits, partner opportunities, and our current
          institutional roster.
        </p>
      </header>

      {/* Interactive Sponsors Client */}
      <SponsorsClient initialSponsors={sponsors} />
    </div>
  );
}

