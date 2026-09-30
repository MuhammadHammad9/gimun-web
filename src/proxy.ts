import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

export async function proxy(request: NextRequest) {
  if (undecodable(request.nextUrl.pathname)) {
    return new NextResponse('Bad request: the address contains an invalid character sequence.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  // Only the admin needs a session; the public dynamic routes stop here.
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;
  const client = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll: values => { values.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); },
  } });
  const { data, error } = await client.auth.getClaims();
  if ((error || !data?.claims) && !['/admin/login'].includes(request.nextUrl.pathname)) {
    const target = request.nextUrl.clone(); target.pathname = '/admin/login'; target.search = '';
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
// The admin, plus the public routes with a dynamic segment (the only ones a
// malformed escape can crash). Static pages never run the proxy.
export const config = { matcher: ['/admin/:path*', '/gimun/committees/:path*', '/verify/:path*', '/survey/:path*'] };
