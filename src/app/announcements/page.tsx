import type { Metadata } from 'next';
import { getAnnouncements } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Live Announcements & News | GIMUN & GIKI Moot Cup',
  description: 'Official notifications, schedule changes, and real-time updates during the conference.',
};

export default function AnnouncementsPage() {
  const announcements = getAnnouncements();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Official Dispatch</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Announcements & News
        </h1>
        <p className="text-neutral-gray text-base max-w-xl">
          Real-time dispatches from the Secretariat and Court Administration.
        </p>
      </header>

      <div className="space-y-4">
        {announcements.map((item) => (
          <article
            key={item.id}
            className={`p-6 rounded-card bg-surface-elevated border shadow-card space-y-3 ${
              item.pinnedFlag ? 'border-primary/40 bg-blue-50/20' : 'border-whisper-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.pinnedFlag && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary text-white font-bold">
                    Pinned
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-neutral-gray font-semibold">
                  {item.track}
                </span>
              </div>
              <time className="text-xs font-mono text-neutral-gray">
                {new Date(item.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </div>
            <h2 className="text-xl font-heading font-bold text-ink">{item.title}</h2>
            <p className="text-sm text-neutral-gray leading-relaxed">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
