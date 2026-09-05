import type { Metadata } from 'next';
import { getResults } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Official Results & Awardees | GIMUN & GIKI Moot Cup 2026',
  description: 'Official hall of fame, winners, and commendations for diplomacy and moot court.',
};

export default function ResultsPage() {
  const results = getResults();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Hall of Fame</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Results & Awards
        </h1>
        <p className="text-neutral-gray text-base max-w-xl">
          Celebrating the exceptional advocacy, diplomacy, and scholarship displayed by our delegates and teams.
        </p>
      </header>

      <div className="space-y-4">
        {results.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-neutral-gray font-semibold">
                {item.track}
              </span>
              <h2 className="text-lg font-heading font-bold text-ink mt-1">{item.awardName}</h2>
              <div className="text-xs text-neutral-gray">{item.categoryOrCommittee}</div>
            </div>
            <div className="text-right font-mono text-sm font-semibold text-primary">
              {item.winnerName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
