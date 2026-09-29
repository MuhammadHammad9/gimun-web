'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import { MapPin, Printer } from 'lucide-react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { useSiteConfig } from '@/components/SiteConfigProvider';
import { trackDot } from '@/components/sections/TrackKey';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import type { ScheduleItem } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Absolute instant for a session clock time, in Pakistan time (UTC+5, no DST). */
function sessionInstant(eventStart: string, day: number, time: string) {
  const base = new Date(`${eventStart}T${time}:00+05:00`).getTime();
  return base + (day - 1) * 86_400_000;
}

const TRACK_OPTIONS = [
  { label: 'All sessions', value: 'all' },
  { label: 'GIMUN', value: 'gimun' },
  { label: 'GMC', value: 'moot-cup' },
  { label: 'Shared', value: 'shared' },
];

interface ScheduleClientProps {
  initialSchedule: ScheduleItem[];
}

export function ScheduleClient({ initialSchedule }: ScheduleClientProps) {
  const site = useSiteConfig();
  const days = Array.from(new Set(initialSchedule.map((s) => s.day))).sort((a, b) => a - b);
  const [selectedDay, setSelectedDay] = useState<number>(days[0] || 1);
  const [trackFilter, setTrackFilter] = useState<string>('all');
  // Null until mounted: the page HTML is cached, so "now" is only known in the
  // browser. Ticks each minute so the live marker moves without a reload.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const liveSessionIds = new Set(
    now === null
      ? []
      : initialSchedule
          .filter((s) => {
            const start = sessionInstant(site.eventDates.start, s.day, s.startTime);
            const end = sessionInstant(site.eventDates.start, s.day, s.endTime);
            return Number.isFinite(start) && now >= start && now < end;
          })
          .map((s) => s.id),
  );

  // During the event, open on today's tab once. The visitor's own choice wins after that.
  const [autoSelected, setAutoSelected] = useState(false);
  if (now !== null && !autoSelected) {
    setAutoSelected(true);
    const today = days.find((day) => {
      const dayStart = sessionInstant(site.eventDates.start, day, '00:00');
      return now >= dayStart && now < dayStart + 86_400_000;
    });
    if (today !== undefined) setSelectedDay(today);
  }

  const currentDaySessions = initialSchedule.filter((s) => s.day === selectedDay);
  const filteredSessions = trackFilter === 'all' ? currentDaySessions : currentDaySessions.filter((s) => s.track === trackFilter);
  const currentDayLabel = currentDaySessions[0]?.dayLabel || `Day ${selectedDay}`;
  const live = initialSchedule.filter((s) => liveSessionIds.has(s.id));

  // Arrow keys move between day tabs, as a tab list should.
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = days[(index + step + days.length) % days.length];
    setSelectedDay(next);
    document.getElementById(`day-tab-${next}`)?.focus();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3 text-sm text-text-2">
          {live.length > 0 ? (
            <>
              <span className="live-dot" aria-hidden="true" />
              <span>
                <strong className="font-medium text-text">Happening now:</strong> {live.map((s) => s.title).join(' · ')}
              </span>
            </>
          ) : (
            'Times are Pakistan time. Keep your confirmation email and QR ticket with you on campus.'
          )}
        </p>
        <div className="flex shrink-0 items-center gap-6 print:hidden">
          <button type="button" onClick={() => window.print()} className="text-link text-sm">
            <Printer aria-hidden="true" strokeWidth={1.75} className="size-4" />
            Print
          </button>
          <Link href="/about/venue" className="text-link text-sm">
            <MapPin aria-hidden="true" strokeWidth={1.75} className="size-4" />
            Venue and rooms
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div role="tablist" aria-label="Conference days" className="day-tabs">
          {days.map((dayNum, index) => {
            const label = initialSchedule.find((s) => s.day === dayNum)?.dayLabel.split('—')[1]?.trim() || `Day ${dayNum}`;
            const selected = selectedDay === dayNum;
            return (
              <button
                key={dayNum}
                id={`day-tab-${dayNum}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="day-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setSelectedDay(dayNum)}
                onKeyDown={(event) => onTabKey(event, index)}
                className="day-tab"
              >
                <span className="day-tab__num">Day {dayNum}</span>
                <span className="day-tab__date">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterBar label="Filter by track" options={TRACK_OPTIONS} activeValue={trackFilter} onChange={setTrackFilter} />
          <p className="font-mono text-xs text-text-3" aria-live="polite">
            {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'} on {currentDayLabel.split('—')[0].trim()}
          </p>
        </div>
      </div>

      <div id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${selectedDay}`}>
        <h2 className="sr-only">Day-by-day schedule</h2>
        <ol className="session-list" key={`${selectedDay}-${trackFilter}`}>
          {filteredSessions.map((session) => {
            const isLive = liveSessionIds.has(session.id);
            return (
              <li key={session.id} className={cn('session', isLive && 'session--live')}>
                <p className="session__time">
                  <time>{session.startTime}</time>
                  <span aria-hidden="true">–</span>
                  <time>{session.endTime}</time>
                </p>
                <div className="session__main">
                  <h3 className="session__title">
                    <span className="track-dot" aria-hidden="true" style={{ background: trackDot(session.track) }} />
                    {session.title}
                  </h3>
                  {session.notes && <p className="session__notes">{session.notes}</p>}
                  {(isLive || session.updatedFlag) && (
                    <p className="mt-2 flex flex-wrap gap-2">
                      {isLive && <span className="session__flag session__flag--live">Now</span>}
                      {session.updatedFlag && <span className="session__flag">Updated</span>}
                    </p>
                  )}
                </div>
                <p className="session__place">
                  <MapPin aria-hidden="true" strokeWidth={1.75} className="size-3.5 shrink-0" />
                  {session.location}
                </p>
              </li>
            );
          })}
        </ol>

        {filteredSessions.length === 0 && (
          <EmptyState
            title="No sessions for this track"
            description={`Nothing is scheduled for this track on ${currentDayLabel.split('—')[0].trim()}.`}
            actionLabel="Show all sessions"
            onAction={() => setTrackFilter('all')}
          />
        )}

        <p className="mt-8 text-sm text-text-3">
          Changes during the event are posted on{' '}
          <Link href="/announcements" className="text-link">
            Announcements
          </Link>{' '}
          and marked Updated here.
        </p>
      </div>
    </div>
  );
}
