import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { drainEmailOutbox, SubmissionServiceError } from '@/lib/server/submissions';
import { database, hasDatabase } from '@/lib/server/supabase';
import { adminSettings } from '@/lib/server/admin/modules';

/** Deletes what has waited in Trash longer than Admin settings allow, and the files it held. Never blocks email. */
async function cleanTrash() {
  try {
    if (!hasDatabase()) return 0;
    const { trashDays } = await adminSettings();
    if (trashDays < 1) return 0;
    const { data, error } = await database().rpc('purge_expired_trash', { p_days: trashDays });
    if (error) { console.error('[Trash] Automatic clean-up failed', error.message); return 0; }
    const paths = (data ?? []) as string[];
    if (paths.length) await database().storage.from('media').remove(paths);
    return paths.length;
  } catch (error) {
    console.error('[Trash] Automatic clean-up failed', error instanceof Error ? error.message : error);
    return 0;
  }
}

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !constantTimeEquals(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await drainEmailOutbox();
    await cleanTrash();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof SubmissionServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: 'Email dispatch failed.' }, { status: 500 });
  }
}

function constantTimeEquals(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
