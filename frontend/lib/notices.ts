import { canRegister } from '@shared/lib/phase';
import type { SiteConfig } from '@shared/lib/types';

const DAY = 86_400_000;
/** Deadlines closer than this are worth a notice. */
export const REMIND_WITHIN_DAYS = 14;

export interface DeadlineReminder {
  track: 'gimun' | 'mootCup';
  name: string;
  deadline: string;
  /** Whole days left, counting today; 1 means it closes today. */
  days: number;
  href: string;
}

/**
 * The registration deadlines a visitor should hear about right now: tracks
 * that are taking registrations and close within two weeks (at 23:59 Pakistan
 * time on the deadline date, the same moment canRegister stops).
 */
export function deadlineReminders(site: SiteConfig, now = Date.now()): DeadlineReminder[] {
  const tracks = [
    { track: 'gimun' as const, name: 'GIMUN', deadline: site.registrationDeadlines.gimun, href: '/register?track=gimun' },
    { track: 'mootCup' as const, name: 'GMC', deadline: site.registrationDeadlines.mootCup, href: '/register?track=moot-cup' },
  ];
  return tracks.flatMap(({ track, name, deadline, href }) => {
    if (!canRegister(site, track, now)) return [];
    const closesAt = new Date(`${deadline}T23:59:59+05:00`).getTime();
    const days = Math.max(1, Math.ceil((closesAt - now) / DAY));
    return days > REMIND_WITHIN_DAYS ? [] : [{ track, name, deadline, days, href }];
  });
}

/** The notice's headline for a reminder. */
export function reminderTitle({ name, days }: DeadlineReminder): string {
  return days <= 1 ? `${name} applications close today` : `${name} applications close in ${days} days`;
}
