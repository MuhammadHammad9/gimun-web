import { NextResponse } from 'next/server';
import { contentHealth } from '@/lib/content/repository';
import { getMissingProductionConfig } from '@/lib/server/config';

export const dynamic = 'force-dynamic';

/**
 * Uptime probe. Reports whether configuration is complete and the CMS is
 * reachable, without naming which variables are missing (that stays in logs).
 */
export async function GET() {
  const configOk = getMissingProductionConfig({ emailDelivery: true }).length === 0;
  const cms = await contentHealth();
  const ok = configOk && !cms.fallback;
  return NextResponse.json(
    { ok, config: configOk ? 'ok' : 'incomplete', cms: cms.fallback ? 'fallback' : 'ok' },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
