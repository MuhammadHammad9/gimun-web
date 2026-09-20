import { collections } from '@/lib/content/registry';
export const sections = [...collections, 'settings', 'registrations', 'inbox', 'email', 'event-day', 'allocations', 'certificates', 'feedback', 'close-out', 'users', 'media', 'audit'] as const;
export type AdminUser = { user_id: string; email: string; display_name: string; role: 'owner' | 'admin' | 'editor' | 'registrar' | 'checkin' | 'viewer'; sections: string[]; active: boolean; must_change_password: boolean };
export function can(user: AdminUser, section: string, write = false) {
  if (!user.active || !sections.includes(section as typeof sections[number])) return false;
  if (user.role === 'owner') return true;
  if (section === 'users' || section === 'close-out') return false;
  if (write && user.role === 'viewer') return false;
  if (user.sections.length > 0) return user.sections.includes(section);
  switch (user.role) {
    case 'admin': return true;
    case 'editor': return collections.includes(section as typeof collections[number]) || section === 'media';
    case 'registrar': return ['registrations', 'inbox', 'email', 'event-day', 'allocations', 'certificates', 'feedback'].includes(section);
    case 'checkin': return section === 'event-day';
    case 'viewer': return !['audit', 'email'].includes(section);
    default: return false;
  }
}
