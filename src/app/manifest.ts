import type { MetadataRoute } from 'next';
import { getSiteConfig } from '@backend/lib/content';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteConfig();
  return {
    name: site.eventNames.combined,
    short_name: 'GIMUN & GMC',
    description: 'Registration, schedule and resources for GIMUN and the GIKI Moot Court.',
    start_url: '/',
    display: 'standalone',
    background_color: '#140302',
    theme_color: '#140302',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
