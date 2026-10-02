import { describe, expect, it } from 'vitest';
import seed from '../../shared/content/site.json';
import { deadlineReminders, reminderTitle } from '@frontend/lib/notices';
import type { SiteConfig } from '@shared/lib/types';

// The seed: event Mar 18-21, 2027; GIMUN closes Feb 15, GMC Mar 5; both open.
const site = seed as unknown as SiteConfig;
const at = (iso: string) => new Date(iso).getTime();

describe('deadline reminders', () => {
  it('stay quiet more than two weeks out', () => {
    expect(deadlineReminders(site, at('2027-01-20T12:00:00+05:00'))).toEqual([]);
  });

  it('name the track and the days left once a deadline is within two weeks', () => {
    const reminders = deadlineReminders(site, at('2027-02-10T12:00:00+05:00'));
    expect(reminders.map((r) => [r.track, r.days])).toEqual([['gimun', 6]]);
    expect(reminderTitle(reminders[0])).toBe('GIMUN applications close in 6 days');
    expect(reminders[0].href).toBe('/register?track=gimun');
  });

  it('say "today" on the last day, and stop once the deadline has passed', () => {
    const lastDay = deadlineReminders(site, at('2027-02-15T20:00:00+05:00'));
    expect(reminderTitle(lastDay[0])).toBe('GIMUN applications close today');
    const after = deadlineReminders(site, at('2027-02-16T00:30:00+05:00'));
    expect(after.map((r) => r.track)).toEqual([]);
  });

  it('cover both tracks when both are closing', () => {
    const both = { ...site, registrationDeadlines: { gimun: '2027-02-20', mootCup: '2027-02-22' } } as SiteConfig;
    expect(deadlineReminders(both, at('2027-02-12T09:00:00+05:00')).map((r) => r.name)).toEqual(['GIMUN', 'GMC']);
  });

  it('never remind for a track that is not taking registrations', () => {
    const closed = { ...site, registrationStatus: { gimunOpen: false, mootCupOpen: true } } as SiteConfig;
    expect(deadlineReminders(closed, at('2027-02-10T12:00:00+05:00'))).toEqual([]);
  });
});
