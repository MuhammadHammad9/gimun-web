'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { requirePermission, stepUpNeeded } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
import { canEvent } from '@/lib/server/admin/permissions';
import { eventOfTrack } from '@/lib/server/admin/scope';

type Result = { error?: string; result?: string; stepUp?: 'code' | 'enrol' };
const text = z.string().max(300);
const person = z.object({ name: text, email: text, institution: text.optional(), role: text.optional(), committees: z.array(text).max(5).optional(), country: text.optional() });
const fromDatabase = (error: { code?: string; message: string } | null, fallback: string) =>
  error?.code === 'P0001' && /permission|valid email|Choose|between|Only owners|name/.test(error.message) ? error.message : fallback;
const refresh = () => { revalidatePath('/admin/people'); revalidatePath('/admin', 'layout'); };

/** Adds people to one event's roster (one batch of up to 500). Re-importing someone updates them. */
export async function importPeople(input: unknown): Promise<Result & { created?: number; updated?: number }> {
  try {
    const user = await requirePermission('people', true);
    const p = z.object({ event: z.enum(['gimun', 'moot-cup']), payment: z.enum(['unpaid', 'pending_verification', 'paid', 'waived']), rows: z.array(person).min(1).max(500) }).parse(input);
    if (!canEvent(user, p.event)) return { error: 'That event is outside your access.' };
    const { data, error } = await database().rpc('import_people', { p_event: p.event, p_rows: p.rows, p_payment: p.payment, p_actor: user.user_id });
    if (error) return { error: fromDatabase(error, 'The import did not finish; nothing from this batch was saved. Check the file and try again.') };
    refresh();
    const r = (data ?? {}) as { created?: number; updated?: number };
    return { created: r.created ?? 0, updated: r.updated ?? 0 };
  } catch (error) { unstable_rethrow(error); return { error: error instanceof z.ZodError ? 'Some rows could not be read. Check that names and emails are filled in.' : 'The import did not finish. Check your permission.' }; }
}

/** Adds one person by hand. */
export async function addPerson(input: unknown): Promise<Result> {
  const p = z.object({ event: z.enum(['gimun', 'moot-cup']), payment: z.enum(['unpaid', 'pending_verification', 'paid', 'waived']), person }).safeParse(input);
  if (!p.success) return { error: 'Enter a name and email.' };
  const result = await importPeople({ event: p.data.event, payment: p.data.payment, rows: [p.data.person] });
  if (result.error) return { error: result.error };
  return { result: result.updated ? `${p.data.person.name} was already on the roster; their details are updated.` : `${p.data.person.name} added.` };
}

export async function updatePerson(input: unknown): Promise<Result> {
  try {
    const user = await requirePermission('people', true);
    const p = z.object({ id: z.uuid(), name: text, email: text, role: text }).parse(input);
    const { error } = await database().rpc('update_person', { p_id: p.id, p_name: p.name, p_email: p.email, p_role: p.role, p_actor: user.user_id });
    if (error) return { error: fromDatabase(error, 'Not saved. Reload and try again.') };
    refresh();
    return { result: `${p.name} saved.` };
  } catch (error) { unstable_rethrow(error); return { error: 'Not saved. Check the details and your permission.' }; }
}

/** What deleting a person removes, for the confirmation. */
export async function personImpact(id: string): Promise<{ lines: string[] } | { error: string }> {
  try {
    const user = await requirePermission('people');
    const pid = z.uuid().parse(id);
    const { data: p } = await database().from('participants').select('event').eq('id', pid).maybeSingle();
    if (!p || !canEvent(user, eventOfTrack(p.event))) return { error: 'This person is not on the roster any more.' };
    const { data, error } = await database().rpc('person_impact', { p_id: pid });
    if (error || !data) return { lines: [] };
    const i = data as { allocation: number; certificates: number; survey: number; checked_in: boolean };
    return { lines: [i.checked_in ? 'Their check-in record' : '', i.allocation ? 'Their country allocation' : '', i.certificates ? `${i.certificates} certificate${i.certificates === 1 ? '' : 's'} (the verification link stops working)` : '', i.survey ? 'Their survey answers' : ''].filter(Boolean) };
  } catch (error) { unstable_rethrow(error); return { error: 'Unable to check this person.' }; }
}

/** Deletes a person for good: owners, and admins for their event, with a fresh code and the name typed. */
export async function purgePerson(id: string, typed: string): Promise<Result> {
  try {
    await requirePermission('people', true);
    const step = await stepUpNeeded(); if (step) return { stepUp: step };
    const pid = z.uuid().parse(id);
    const { data: p } = await database().from('participants').select('name').eq('id', pid).maybeSingle();
    if (!p) return { error: 'This person is not on the roster any more.' };
    if (typed.trim() !== String(p.name).trim()) return { error: 'Type the name exactly to confirm.' };
    const user = await requirePermission('people', true);
    const { error } = await database().rpc('purge_participant', { p_id: pid, p_actor: user.user_id });
    if (error) return { error: fromDatabase(error, 'Not deleted. Reload and try again.') };
    refresh();
    return { result: `${p.name} was deleted permanently.` };
  } catch (error) { unstable_rethrow(error); return { error: 'Not deleted. Check your permission.' }; }
}
