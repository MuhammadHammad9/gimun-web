import type { Metadata } from 'next';
import { getTeamMembers } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Organizing Team | Secretariat & Conveners',
  description: 'The Secretariat, Convening Committee, and Host Directorate for the 2026 conference.',
};

export default function TeamPage() {
  const members = getTeamMembers();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Leadership</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Organizing Team
        </h1>
        <p className="text-neutral-gray text-base max-w-2xl">
          Dedicated student leaders ensuring competitive rigor, hospitality, and procedural excellence.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-4 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center font-heading text-2xl font-bold text-primary">
              {member.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-heading font-bold text-ink">{member.name}</h2>
              <div className="text-xs font-mono font-medium text-accent">{member.role}</div>
            </div>
            <p className="text-xs text-neutral-gray leading-relaxed">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
