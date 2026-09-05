import type { Metadata } from 'next';
import { getTeamMembers } from '@/lib/content';
import { TeamClient } from './TeamClient';

export const metadata: Metadata = {
  title: 'Organizing Team, Secretariat & Moot Convenors | GIMUN & GIKI Moot Cup 2026',
  description: 'Meet the GIMUN Secretariat, GIKI Moot Cup Convening Committee, and Host Directorate student leadership organizing Pakistan’s premier academic symposium at GIKI Topi.',
};

export default function TeamPage() {
  const members = getTeamMembers();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 text-primary border border-slate-200">
            Student Leadership
          </span>
          <span className="text-xs font-mono text-neutral-gray uppercase tracking-wider">
            PRD §15.3
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          Executive Secretariat & Directorate
        </h1>
        <p className="text-sm sm:text-base text-neutral-gray leading-relaxed">
          Led by experienced parliamentary debaters, moot court champions, and event operations directors.
          Our team is committed to delivering unmatched competitive rigor, impartial judicial evaluation,
          and warm GIKI hospitality.
        </p>
      </header>

      {/* Team Client Island */}
      <TeamClient initialMembers={members} />
    </div>
  );
}
