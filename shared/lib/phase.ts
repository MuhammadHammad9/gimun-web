import type { SiteConfig } from './types';
import { isRegistrationDeadlinePassed } from './site-config';
import type { phases } from './content/registry';
export type EventPhase = typeof phases[number];
export type RegistrationTrack = 'gimun' | 'mootCup';
export function eventPhase(site: SiteConfig, now = Date.now()): EventPhase {
  if (site.phaseOverride) return site.phaseOverride;
  const start = new Date(`${site.eventDates.start}T00:00:00+05:00`).getTime();
  const end = new Date(`${site.eventDates.end}T23:59:59+05:00`).getTime();
  if (now > end) return site.resultsPublished ? 'results' : 'archived';
  if (now >= start) return 'event-live';
  if ((site.registrationStatus?.gimunOpen && !isRegistrationDeadlinePassed(site.registrationDeadlines.gimun, now)) || (site.registrationStatus?.mootCupOpen && !isRegistrationDeadlinePassed(site.registrationDeadlines.mootCup, now))) return 'registration-open';
  return Object.values(site.registrationDeadlines).every(d => isRegistrationDeadlinePassed(d, now)) ? 'registration-closed' : 'pre-launch';
}
/** One answer to "can this track take registrations right now?" for every page, button and menu. */
export function canRegister(site: SiteConfig, track: RegistrationTrack, now = Date.now()) {
  return (
    eventPhase(site, now) === 'registration-open' &&
    Boolean(site.registrationStatus?.[track === 'gimun' ? 'gimunOpen' : 'mootCupOpen']) &&
    !isRegistrationDeadlinePassed(site.registrationDeadlines[track], now)
  );
}
/** Server render clock. Server components render once per request/revalidation, so reading it there is safe. */
export function serverRenderTime() {
  return Date.now();
}
