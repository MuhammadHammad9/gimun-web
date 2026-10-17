import { createHash, randomBytes } from 'node:crypto';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { HEAD_BOOT_SCRIPT } from '@/lib/boot-script';
import { adminCsp } from '@/lib/csp';
import { SEEN_COOKIE, adminCookieOptions, mintSeen, readSeen, sessionState } from '@/lib/server/admin/session';

/**
 * A path with a broken percent escape ("/gimun/committees/abc%") makes Next
 * throw "failed to decode param" on every dynamic route before any page code
 * runs, answering 500 and logging a server error for what is only a bad URL.
 * Such paths are refused here with a 400 instead.
 */
function undecodable(pathname: string) {
  try {
    decodeURIComponent(pathname);
    return false;
  } catch {
    return true;
  }
}

/** The root layout's one inline script, allowed on admin pages by this hash. */
const BOOT_SCRIPT_HASH = createHash('sha256').update(HEAD_BOOT_SCRIPT).digest('base64');

export async function proxy(request: NextRequest) {
  if (undecodable(request.nextUrl.pathname)) {
    return new NextResponse('Bad request: the address contains an invalid character sequence.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  // Only the admin needs a session; the public dynamic routes stop here.
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();

  // A fresh nonce per request. Next reads it from the request's policy header
  // and puts it on every script it renders; the browser gets the same policy.
  const csp = adminCsp(randomBytes(16).toString('base64'), BOOT_SCRIPT_HASH);
  const withPolicy = (response: NextResponse) => {
    response.headers.set('Content-Security-Policy', csp);
    return response;
  };
  // Built on demand: Supabase may refresh the session cookies first, and the
  // request forwarded to the page must carry the updated ones.
  const forward = () => {
    const headers = new Headers(request.headers);
    headers.set('Content-Security-Policy', csp);
    return NextResponse.next({ request: { headers } });
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let response = forward();
  // Fail closed: if auth is not configured the session cannot be verified, so
  // never render an admin page — send everything except the sign-in page there.
  // In production scripts/check-env.mjs guarantees these are set, so this only
  // matters for a misconfigured preview or self-host.
  if (!url || !key) {
    if (request.nextUrl.pathname === '/admin/login') return withPolicy(response);
    const target = request.nextUrl.clone(); target.pathname = '/admin/login'; target.search = '';
    return withPolicy(NextResponse.redirect(target));
  }
  const client = createServerClient(url, key, { cookieOptions: adminCookieOptions(), cookies: {
    getAll: () => request.cookies.getAll(),
    setAll: values => { values.forEach(({ name, value }) => request.cookies.set(name, value)); response = forward(); values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); },
  } });
  const { data, error } = await client.auth.getClaims();
  if ((error || !data?.claims) && !['/admin/login'].includes(request.nextUrl.pathname)) {
    const target = request.nextUrl.clone(); target.pathname = '/admin/login'; target.search = '';
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return withPolicy(redirect);
  }
  const path = request.nextUrl.pathname;
  if (path !== '/admin/login') {
    const current = request.cookies.get(SEEN_COOKIE)?.value;
    const state = sessionState(current);
    if (state === 'idle' || state === 'expired') {
      // End the session on the server too, so its refresh token cannot be reused.
      await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
      const target = request.nextUrl.clone(); target.pathname = '/admin/login'; target.search = `?reason=${state}`;
      const redirect = NextResponse.redirect(target);
      response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
      request.cookies.getAll().filter(c => c.name.startsWith('sb-')).forEach(c => redirect.cookies.delete(c.name));
      redirect.cookies.delete(SEEN_COOKIE);
      return withPolicy(redirect);
    }
    // Open admin tabs poll /admin/live in the background; only a ping sent while someone works counts as use.
    const background = path === '/admin/live' && request.nextUrl.searchParams.get('active') !== '1';
    if (state === 'missing' || !background) response.cookies.set(SEEN_COOKIE, mintSeen(readSeen(current)?.since ?? Date.now(), Date.now()), adminCookieOptions());
  }
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return withPolicy(response);
}
// The admin, plus the public routes with a dynamic segment (the only ones a
// malformed escape can crash). Static pages never run the proxy.
export const config = { matcher: ['/admin/:path*', '/gimun/committees/:path*', '/verify/:path*', '/survey/:path*'] };
