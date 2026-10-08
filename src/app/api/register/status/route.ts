import { NextRequest, NextResponse } from 'next/server';
import { clientIp } from '@/lib/server/submissions';
import {
  DEVICE_COOKIE,
  deviceAttemptStatus,
  deviceCookieOptions,
  deviceSubject,
  mintDeviceForNetwork,
  verifyDeviceCookie,
} from '@/lib/server/device-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * The registration form calls this on load. It gives the browser its signed
 * device cookie (if it has none) and reports how many attempts remain, so the
 * form can show the lockout and its countdown before anyone fills it in. The
 * real limit is enforced again when the form is submitted; this endpoint only
 * informs the UI and never records an attempt.
 */
export async function GET(request: NextRequest) {
  const existing = request.cookies.get(DEVICE_COOKIE)?.value;
  const ip = clientIp(request);
  let cookieValue = existing;
  let minted: { id: string; value: string } | null = null;
  if (!verifyDeviceCookie(existing)) {
    minted = await mintDeviceForNetwork(ip);
    cookieValue = minted?.value;
  }

  const status = await deviceAttemptStatus(deviceSubject(cookieValue, ip));
  const response = NextResponse.json(
    {
      maxAttempts: status.maxAttempts,
      remaining: status.remaining,
      locked: status.remaining <= 0,
      retryAfterSeconds: status.remaining <= 0 ? status.retryAfterSeconds : 0,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
  if (minted) response.cookies.set(DEVICE_COOKIE, minted.value, deviceCookieOptions());
  return response;
}
