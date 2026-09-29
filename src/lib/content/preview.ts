import 'server-only';
import { cache } from 'react';
import { draftMode } from 'next/headers';
import type { Collection } from './registry';

/**
 * Draft preview on the real pages.
 *
 * `/admin/preview` turns on Next's draft mode for a signed-in editor. While the
 * cookie is set, every cache layer is bypassed and the repository reads the
 * working drafts instead of the published releases, but only for collections
 * the editor is allowed to see. The admin session is checked on every request,
 * so a draft cookie left behind after signing out shows nothing private.
 */
export type PreviewSession = { canSee: (collection: Collection) => boolean };

async function enabled() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    // Outside a request: build-time params, scripts and unit tests.
    return false;
  }
}

export const previewSession = cache(async (): Promise<PreviewSession | null> => {
  if (!(await enabled())) return null;
  try {
    const [{ authClient, mfaState }, { database }, { can }] = await Promise.all([
      import('@/lib/server/admin/auth'),
      import('@/lib/server/supabase'),
      import('@/lib/server/admin/permissions'),
    ]);
    const { data, error } = await (await authClient()).auth.getUser();
    if (error || !data.user) return null;
    const mfa = await mfaState();
    if (mfa.needsCode || mfa.needsEnrolment) return null;
    const { data: user } = await database().from('admin_users').select('*').eq('user_id', data.user.id).eq('active', true).maybeSingle();
    if (!user) return null;
    return { canSee: (collection) => can(user, collection) };
  } catch {
    return null;
  }
});

/** Whether this request is an editor's draft preview (for the preview bar). */
export async function isPreviewing() {
  return (await previewSession()) !== null;
}

const COPY_PATHS: Record<string, string> = {
  home: '/', gimun: '/gimun', committees: '/gimun/committees', committee: '/gimun/committees', 'gimun-rules': '/gimun/rules',
  'moot-cup': '/moot-cup', categories: '/moot-cup/categories', 'moot-rules': '/moot-cup/rules', clarifications: '/moot-cup/clarifications',
  schedule: '/schedule', resources: '/resources', announcements: '/announcements', results: '/results', register: '/register',
  about: '/about', faq: '/about/faq', venue: '/about/venue', team: '/about/team', sponsors: '/about/sponsors', gallery: '/about/gallery',
  contact: '/contact', privacy: '/privacy',
};

/** Where each collection is seen on the public site. */
export function previewPath(collection: Collection, data: Record<string, unknown>): string {
  switch (collection) {
    case 'announcements': return '/announcements';
    case 'schedule': return '/schedule';
    case 'committees': return typeof data.slug === 'string' && /^[a-zA-Z0-9_-]+$/.test(data.slug) ? `/gimun/committees/${data.slug}` : '/gimun/committees';
    case 'moot-categories': return '/moot-cup/categories';
    case 'resources': return '/resources';
    case 'faq': return '/about/faq';
    case 'team': return '/about/team';
    case 'sponsors': return '/about/sponsors';
    case 'gallery': return '/about/gallery';
    case 'clarifications': return '/moot-cup/clarifications';
    case 'results': return '/results';
    case 'navigation': return '/';
    case 'copy': return COPY_PATHS[String(data.page)] ?? '/';
  }
}
