import { NextResponse } from 'next/server';
import { contentHealth } from '@/lib/content/repository';
import { getMissingProductionConfig } from '@/lib/server/config';
import { database, hasDatabase } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

type Health = {
  ok: boolean;
  config: 'ok' | 'incomplete';
  cms: 'ok' | 'fallback';
  schema: 'ok' | 'outdated' | 'unknown';
  outbox: 'ok' | 'delayed' | 'unknown';
};

/**
 * An email still waiting this long after it was due means no worker is
 * draining the outbox: Vercel's own cron runs once a day, so retries rely on
 * the Supabase scheduler in supabase/email_scheduler.sql.
 */
const OUTBOX_DELAY_MS = 30 * 60 * 1000;
/** The probe is public; answering from memory stops it becoming a database load generator. */
const MEMO_MS = 10_000;
let memo: { at: number; value: Health } | null = null;

async function check(): Promise<Health> {
  const configOk = getMissingProductionConfig({ emailDelivery: true }).length === 0;
  const cms = await contentHealth();
  // public_revision arrives with migration 0012; its absence means the database
  // is behind the code and admin operations will fail.
  let schema: Health['schema'] = 'unknown';
  let outbox: Health['outbox'] = 'unknown';
  if (hasDatabase()) {
    try {
      const db = database();
      const [revision, overdue] = await Promise.all([
        db.rpc('public_revision'),
        db
          .from('email_outbox')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'retry'])
          .lt('next_attempt_at', new Date(Date.now() - OUTBOX_DELAY_MS).toISOString()),
      ]);
      schema = revision.error ? 'outdated' : 'ok';
      outbox = overdue.error ? 'unknown' : (overdue.count ?? 0) > 0 ? 'delayed' : 'ok';
    } catch {
      schema = 'unknown';
    }
  }
  const ok = configOk && !cms.fallback && schema === 'ok' && outbox !== 'delayed';
  return { ok, config: configOk ? 'ok' : 'incomplete', cms: cms.fallback ? 'fallback' : 'ok', schema, outbox };
}

/**
 * Uptime probe. Reports whether configuration is complete, the CMS is
 * reachable and email is flowing, without naming which variables are missing
 * (that stays in logs).
 */
export async function GET() {
  if (!memo || Date.now() - memo.at > MEMO_MS) memo = { at: Date.now(), value: await check() };
  const value = memo.value;
  return NextResponse.json(value, { status: value.ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
