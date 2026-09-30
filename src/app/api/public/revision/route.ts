import { publicRevision } from '@/lib/server/live';

export const dynamic = 'force-dynamic';

/**
 * The published revision, polled by every open public page (LiveUpdates).
 * One URL for everyone, so the CDN can share a response for five seconds and
 * visitors add almost no database load. It never invalidates anything; a page
 * that sees a newer revision asks syncLiveContent (a server action) to do that.
 *
 * An "unavailable" answer is shared too, for a little longer. It used to be
 * no-store, which sent every poll from every visitor to the server exactly
 * when the database was failing.
 */
export async function GET() {
  const live = await publicRevision();
  return Response.json(live, {
    headers: {
      'Cache-Control': live.connected
        ? 'public, max-age=0, s-maxage=5, stale-while-revalidate=10'
        : 'public, max-age=0, s-maxage=15, stale-while-revalidate=15',
    },
  });
}
