import { NextResponse } from 'next/server';
import { contentHealth } from '@/lib/content/repository';
import { getMissingProductionConfig } from '@/lib/server/config';
import { database, hasDatabase } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

/**
 * Uptime probe. Reports whether configuration is complete and the CMS is
 * reachable, without naming which variables are missing (that stays in logs).
 */
export async function GET() {
  const configOk = getMissingProductionConfig({ emailDelivery: true }).length === 0;
  const cms = await contentHealth();
  // public_revision arrives with migration 0012; its absence means the database
  // is behind the code and admin operations will fail.
  let schema: 'ok' | 'outdated' | 'unknown' = 'unknown';
  if (hasDatabase()) {
    try {
      const { error } = await database().rpc('public_revision');
      schema = error ? 'outdated' : 'ok';
    } catch {
      schema = 'unknown';
    }
  }
  const ok = configOk && !cms.fallback && schema === 'ok';
  return NextResponse.json(
    { ok, config: configOk ? 'ok' : 'incomplete', cms: cms.fallback ? 'fallback' : 'ok', schema },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
