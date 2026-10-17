import { collections } from '@/lib/content/registry';
export const sections = [...collections, 'settings', 'registrations', 'people', 'inbox', 'email', 'event-day', 'allocations', 'certificates', 'feedback', 'close-out', 'users', 'media', 'audit'] as const;
export const events = ['gimun', 'moot-cup'] as const;
export type EventId = (typeof events)[number];
export const EVENT_LABELS: Record<EventId, string> = { gimun: 'GIMUN', 'moot-cup': 'GMC' };
/** Sections that belong to one event. Admins without that event never see them. Mirrors content_event() in SQL. */
export const SECTION_EVENT: Partial<Record<string, EventId>> = { committees: 'gimun', allocations: 'gimun', 'moot-categories': 'moot-cup', clarifications: 'moot-cup' };
export type AdminUser = { user_id: string; email: string; display_name: string; role: 'owner' | 'admin' | 'editor' | 'registrar' | 'checkin' | 'viewer'; sections: string[]; active: boolean; must_change_password: boolean; events?: EventId[] };
/** The events an admin works on. Owners always have both. */
export function eventsOf(user: AdminUser): EventId[] {
  if (user.role === 'owner') return [...events];
  // A profile read before migration 0015 has no scope column; such accounts had access to both events.
  const scope: readonly string[] = user.events ?? events;
  return events.filter((e) => scope.includes(e));
}
/** Whether a record of this event is visible to the admin. Null means shared by both events. */
export const canEvent = (user: AdminUser, event: EventId | null | undefined) => !event || eventsOf(user).includes(event);
export const coversBothEvents = (user: AdminUser) => eventsOf(user).length === events.length;
export function can(user: AdminUser, section: string, write = false) {
  if (!user.active || !sections.includes(section as typeof sections[number])) return false;
  if (user.role === 'owner') return true;
  if (section === 'users' || section === 'close-out') return false;
  if (write && user.role === 'viewer') return false;
  if (!canEvent(user, SECTION_EVENT[section])) return false;
  // Site settings hold both events' dates, fees and contacts.
  if (section === 'settings' && write && !coversBothEvents(user)) return false;
  if (user.sections.length > 0) return user.sections.includes(section);
  switch (user.role) {
    case 'admin': return true;
    case 'editor': return collections.includes(section as typeof collections[number]) || section === 'media';
    case 'registrar': return ['registrations', 'people', 'inbox', 'email', 'event-day', 'allocations', 'certificates', 'feedback'].includes(section);
    case 'checkin': return section === 'event-day';
    case 'viewer': return !['audit', 'email'].includes(section);
    default: return false;
  }
}
/**
 * Permanent deletion: owners, and admins for records of their own event. A
 * shared record (no event) needs access to both events.
 */
export function canPurge(user: AdminUser, section: string, event: EventId | null | undefined) {
  if (user.role !== 'owner' && user.role !== 'admin') return false;
  return can(user, section, true) && (event ? canEvent(user, event) : coversBothEvents(user));
}
/** "Registrar · GIMUN", "Editor · both events". */
export function accessLabel(user: AdminUser) {
  const scope = coversBothEvents(user) ? 'both events' : eventsOf(user).map((e) => EVENT_LABELS[e]).join(', ');
  return `${user.role.replaceAll('-', ' ')} · ${scope}`;
}
