import type { NextConfig } from "next";
import { publicCsp } from "./src/lib/csp";

// A malformed value must not crash the config itself; scripts/check-env.mjs
// reports it by name before a production build.
const supabaseUrl = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
  } catch {
    return null;
  }
})();

// Public pages only; the admin gets a stricter per-request policy from src/proxy.ts.
const contentSecurityPolicy = publicCsp();

const nextConfig: NextConfig = {
  distDir: process.env.ADMIN_TEST_BUILD === '1' ? '.next-admin-test' : '.next',
  typescript: process.env.ADMIN_TEST_BUILD === '1' ? { tsconfigPath: 'tsconfig.admin-test.json' } : {},
  // PDFs embed this font from disk. Tracing finds it today; listing it keeps
  // certificate and invoice generation from breaking after a refactor.
  outputFileTracingIncludes: {
    '/admin/**': ['./src/assets/fonts/GeneralSans-Variable.woff2'],
    '/verify/**': ['./src/assets/fonts/GeneralSans-Variable.woff2'],
  },
  images: {
    qualities: [75, 85, 90],
    remotePatterns: supabaseUrl ? [{ protocol: 'https', hostname: supabaseUrl.hostname, pathname: '/storage/v1/object/public/media/**' }] : [],
  },
  // Short URLs for posters, QR codes and social bios.
  async redirects() {
    return [
      { source: '/apply', destination: '/register', permanent: false },
      { source: '/go', destination: '/register', permanent: false },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    ] },
    // Every path except /admin and below, which src/proxy.ts covers with a nonce policy.
    { source: '/((?!admin(?:/|$)).*)', headers: [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }] },
    { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'private, no-store' }] }];
  },
  // Tell Turbopack the workspace root explicitly to avoid the
  // "package-lock.json is outside the current Git repository" warning.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
