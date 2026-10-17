'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { requirePermission } from '@/lib/server/admin/auth';
import { MODULES, type ModuleId } from '@/lib/server/admin/modules';
import { database } from '@/lib/server/supabase';

const moduleIds = Object.keys(MODULES) as [ModuleId, ...ModuleId[]];

/** Owner-only: which tools are on, and how long Trash keeps items. */
export async function saveAdminSettings(input: unknown) {
  try {
    const owner = await requirePermission('users', true);
    const p = z.object({
      modules: z.record(z.enum(moduleIds), z.boolean()),
      trashDays: z.number().int().min(0).max(365),
      version: z.number().int().nonnegative(),
    }).parse(input);
    const data = { modules: p.modules, trashDays: p.trashDays };
    // The version makes a stale form fail instead of overwriting another owner's change.
    const { data: saved, error } = await database().from('admin_settings')
      .update({ data, version: p.version + 1, updated_at: new Date().toISOString(), updated_by: owner.user_id })
      .eq('id', 'admin').eq('version', p.version).select('version');
    if (error) return { error: 'Admin settings could not be saved. Apply migration 0015 and try again.' };
    if (!saved?.length) return { error: 'Someone changed these settings meanwhile. Reload and try again.' };
    await database().from('audit_log').insert({ actor: owner.user_id, action: 'admin-settings', section: 'users', entity_id: 'admin', detail: data });
    revalidatePath('/admin', 'layout');
    return { version: p.version + 1 };
  } catch (error) {
    unstable_rethrow(error);
    return { error: error instanceof z.ZodError ? 'Trash must keep items between 0 and 365 days.' : 'Admin settings could not be saved. Check your permission.' };
  }
}
