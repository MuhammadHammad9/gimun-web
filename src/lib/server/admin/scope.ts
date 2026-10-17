import 'server-only';
import { notFound } from 'next/navigation';
import { canEvent, coversBothEvents, events, eventsOf, type AdminUser, type EventId } from './permissions';

/**
 * The one gate between an admin's event scope and the records they read.
 * Admin reads use the service role, so the database does not filter them:
 * every list, detail page, export and count goes through these helpers.
 */

export const eventOfTrack = (track: unknown): EventId | null => (track === 'gimun' || track === 'moot-cup' ? track : null);
export const eventOfReference = (reference: string): EventId | null =>
  reference.startsWith('REG-GIMUN-') ? 'gimun' : reference.startsWith('REG-MOOT-') ? 'moot-cup' : null;
/** Mirrors content_event() in SQL: committees are GIMUN, case categories and clarifications GMC, tracked entries follow their track. */
export function eventOfEntry(collection: string, data: Record<string, unknown>): EventId | null {
  if (collection === 'committees') return 'gimun';
  if (collection === 'moot-categories' || collection === 'clarifications') return 'moot-cup';
  return eventOfTrack(data.track);
}

type Filterable<Q> = { or(filters: string): Q; eq(column: string, value: string): Q };
/**
 * Limits a query to the admin's events by the column naming each row's event.
 * `shared` rows (no event, or a track such as "shared") stay visible to
 * everyone; registrations and participants always belong to one event.
 */
export function scopeEvent<Q extends Filterable<Q>>(query: Q, user: AdminUser, column = 'event', shared = true): Q {
  if (coversBothEvents(user)) return query;
  const [only] = eventsOf(user);
  if (!only) return query.eq(column, 'none');
  const other = events.find((e) => e !== only)!;
  return shared ? query.or(`${column}.is.null,${column}.neq.${other}`) : query.eq(column, only);
}

/** A record outside the admin's events answers exactly like a missing one. */
export function assertInScope(user: AdminUser, event: EventId | null | undefined) {
  if (!canEvent(user, event)) notFound();
}
