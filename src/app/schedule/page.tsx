import type { Metadata } from 'next';
import { getSchedule } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Full Event Schedule | GIMUN & GIKI Moot Cup 2026',
  description: 'Complete 3-day itinerary, committee sessions, moot court rounds, and social events.',
};

export default function SchedulePage() {
  const schedule = getSchedule();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Itinerary</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Conference Schedule
        </h1>
        <p className="text-neutral-gray text-base max-w-2xl">
          Comprehensive 3-day schedule across GIMUN diplomacy sessions, Moot Court advocacy benches, and official social events.
        </p>
      </header>

      <div className="space-y-4">
        {schedule.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-ink">
                  {item.dayLabel}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    item.track === 'gimun'
                      ? 'bg-orange-100 text-orange-800'
                      : item.track === 'moot-cup'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.track}
                </span>
              </div>
              <h2 className="text-lg font-heading font-bold text-ink">{item.title}</h2>
              <p className="text-xs text-neutral-gray">{item.notes}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-mono font-semibold text-primary">
                {item.startTime} — {item.endTime}
              </div>
              <div className="text-xs text-neutral-gray">{item.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
