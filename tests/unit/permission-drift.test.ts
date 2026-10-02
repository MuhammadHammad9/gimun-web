import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { can, sections, type AdminUser } from '../../src/lib/server/admin/permissions';

/**
 * The role rules live twice: can() in permissions.ts guards the app, and the
 * SQL admin_can() guards the database. Adding a collection or section to one
 * without the other makes the admin offer edits the database then refuses
 * (or the reverse). This compares them for every role and section.
 */
const dir = path.resolve('supabase/migrations');
const latest = readdirSync(dir)
  .filter((file) => file.endsWith('.sql'))
  .sort()
  .map((file) => readFileSync(path.join(dir, file), 'utf8'))
  .filter((sql) => /function public\.admin_can\(/.test(sql))
  .at(-1)!;
const body = latest.slice(latest.search(/function public\.admin_can\(/));
const list = (role: string) => {
  const match = body.match(new RegExp(`when '${role}' then p_section (not )?in \\(([^)]*)\\)`));
  if (!match) throw new Error(`No ${role} rule in admin_can`);
  return { negated: Boolean(match[1]), values: [...match[2].matchAll(/'([^']+)'/g)].map((m) => m[1]) };
};
const sqlCan = (role: string, section: string) => {
  if (['users', 'close-out'].includes(section)) return false;
  if (role === 'admin') return true;
  if (role === 'checkin') return /when 'checkin' then p_section = 'event-day'/.test(body) && section === 'event-day';
  const rule = list(role);
  return rule.negated ? !rule.values.includes(section) : rule.values.includes(section);
};
const user = (role: AdminUser['role']): AdminUser => ({ user_id: 'u', email: 'e', display_name: 'd', role, sections: [], active: true, must_change_password: false });

describe('permission rules match the database', () => {
  for (const role of ['admin', 'editor', 'registrar', 'checkin', 'viewer'] as const) {
    it(`${role} can read the same sections in the app and in admin_can()`, () => {
      const app = sections.filter((section) => can(user(role), section));
      const db = sections.filter((section) => sqlCan(role, section));
      expect(app).toEqual(db);
    });
  }
});
