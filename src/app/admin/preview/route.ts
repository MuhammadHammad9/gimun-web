import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { isCollection } from '@/lib/content/registry';
import { previewPath } from '@/lib/content/preview';
import { routePermission } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';

/**
 * "Preview on site": turns on draft mode for this editor and opens the public
 * page where the entry appears. The target comes from the saved entry, never
 * from the query string, so this cannot be used as an open redirect.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const collection = params.get('collection') ?? '';
  const id = params.get('id') ?? '';
  if (!isCollection(collection) || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) return new Response('Unknown entry', { status: 404 });
  const user = await routePermission(collection, false, 'page');
  if (user instanceof Response) return user;
  if (!can(user, collection)) return new Response('You do not have permission to preview this content.', { status: 403 });
  const { data, error } = await database().from('content_entries').select('data').eq('collection', collection).eq('id', id).maybeSingle();
  if (error || !data) return new Response('Save the entry before previewing it.', { status: 404 });
  (await draftMode()).enable();
  redirect(previewPath(collection, data.data as Record<string, unknown>));
}
