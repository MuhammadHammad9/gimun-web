import 'server-only';
import { cache } from 'react';
import { database } from '../supabase';

/** Tools the owner can switch off. Data is kept; the menu, pages and actions go away. */
export const MODULES = {
  registrations: { label: 'Registrations & payments', description: 'Reviewing applications, payment status, invoices and walk-in sign-ups.' },
  'event-day': { label: 'Check-in', description: 'Ticket scanning and arrival tracking on event day.' },
  allocations: { label: 'Country allocation', description: 'Assigning and reserving committee countries for GIMUN delegates.' },
  certificates: { label: 'Certificates', description: 'Issuing participation, award and chair certificates.' },
  feedback: { label: 'Feedback survey', description: 'Survey questions and the responses summary.' },
  email: { label: 'Email', description: 'Broadcasts, templates and the delivery log.' },
} as const;
export type ModuleId = keyof typeof MODULES;
export const isModule = (section: string): section is ModuleId => Object.hasOwn(MODULES, section);

export type AdminSettings = { modules: Partial<Record<ModuleId, boolean>>; trashDays: number; version: number };
// Registration runs on Google Forms, so its built-in tools start switched off.
const DEFAULTS = { modules: { registrations: false }, trashDays: 30 };

export const adminSettings = cache(async (): Promise<AdminSettings> => {
  const { data, error } = await database().from('admin_settings').select('data,version').eq('id', 'admin').maybeSingle();
  if (error || !data) return { ...DEFAULTS, version: 0 };
  const stored = (data.data ?? {}) as Partial<AdminSettings>;
  return { modules: { ...DEFAULTS.modules, ...stored.modules }, trashDays: typeof stored.trashDays === 'number' ? stored.trashDays : DEFAULTS.trashDays, version: Number(data.version) };
});

/** Whether a section's tool is on. Sections that are not switchable are always on. */
export async function moduleOn(section: string) {
  return !isModule(section) || (await adminSettings()).modules[section] !== false;
}
export const MODULE_OFF = 'This tool is switched off. The owner can switch it on in Admin settings.';
export async function requireModule(section: string) {
  if (!(await moduleOn(section))) throw new Error(MODULE_OFF);
}
