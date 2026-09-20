import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.ADMIN_TEST_BUILD === '1' ? '.next-admin-test' : '.next',
  typescript: process.env.ADMIN_TEST_BUILD === '1' ? { tsconfigPath: 'tsconfig.admin-test.json' } : {},
  images: {
    qualities: [75, 85, 90, 100],
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL ? [{ protocol: 'https', hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname, pathname: '/storage/v1/object/public/media/**' }] : [],
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
    ] }, { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'private, no-store' }] }];
  },
  // Tell Turbopack the workspace root explicitly to avoid the
  // "package-lock.json is outside the current Git repository" warning.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
