import { MetadataRoute } from 'next';
import { getCommittees } from '@backend/lib/content';
import { getSiteUrl } from '@shared/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const committees = (await getCommittees());
  // Omit optional lastmod until an authoritative page-modification time is available.

  const committeeRoutes = committees.map((c) => `/gimun/committees/${c.slug}`);

  const routes = [
    '',
    '/gimun',
    '/gimun/committees',
    ...committeeRoutes,
    '/gimun/rules',
    '/moot-cup',
    '/moot-cup/categories',
    '/moot-cup/rules',
    '/moot-cup/clarifications',
    '/schedule',
    '/resources',
    '/register',
    '/about',
    '/about/team',
    '/about/venue',
    '/about/faq',
    '/about/sponsors',
    '/about/gallery',
    '/announcements',
    '/results',
    '/contact',
    '/privacy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === '' || route === '/schedule' || route === '/announcements' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/register' ? 0.9 : 0.8,
  }));
}
