import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createHash } from 'node:crypto';
import { database } from './supabase';
import { contentHealth } from '@/lib/content/repository';
import { collections } from '@/lib/content/registry';
import { can, sections, type AdminUser } from './admin/permissions';

type PublicRevision = { revision: string; connected: boolean; reason: string };

async function freshRevision(): Promise<PublicRevision> {
  const health = await contentHealth();
  if (health.fallback) return { revision: 'unavailable', connected: false, reason: health.reason };
  try {
    const { data, error } = await database().rpc('public_revision');
    if (error) throw error;
    return { revision: String(data), connected: true, reason: '' };
  } catch {
    return { revision: 'unavailable', connected: false, reason: 'Live updates are unavailable. Check the database migration.' };
  }
}

/** The published revision right now. Deduplicated within one request. */
export const publicRevision = cache(freshRevision);

/**
 * The revision the cached pages were built from. It carries every content
 * tag, so any save that invalidates content also refreshes this stamp, and
 * every page (the layout embeds it) regenerates together with it.
 */
const ALL_CONTENT_TAGS = ['content', 'content:site', 'content:allocations', ...collections.map((c) => `content:${c}`)];
const stamp = unstable_cache(
  async () => {
    const live = await freshRevision();
    if (!live.connected) throw new Error('Revision unavailable');
    return live.revision;
  },
  ['applied-revision'],
  { tags: ALL_CONTENT_TAGS, revalidate: 3600 },
);

export async function appliedRevision(): Promise<string> {
  try {
    return await stamp();
  } catch {
    return 'unavailable';
  }
}

export const adminRevision = cache(async (user: AdminUser) => {
  const [{ data, error }, site] = await Promise.all([database().from('live_revisions').select('section,revision').order('section'), publicRevision()]);
  if (error) throw new Error('Live updates unavailable');
  const allowed = sections.filter((s) => can(user, s));
  const revision = createHash('sha256')
    .update(
      JSON.stringify([
        data.filter((r) => allowed.includes(r.section) || (r.section === 'event-day' && allowed.some((s) => ['registrations', 'certificates', 'feedback', 'allocations'].includes(s)))),
        site.revision,
        user.role,
        user.sections,
        user.active,
      ]),
    )
    .digest('hex');
  return { revision, connected: true, websiteConnected: site.connected, reason: site.reason };
});
