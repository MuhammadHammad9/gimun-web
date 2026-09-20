import { MetadataRoute } from 'next';
import { getCommittees } from '@/lib/content';
import { getSiteUrl } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const committees = (await getCommittees());
  // Sitemaps are expected to carry <lastmod>; the SEO gate checks for it.
  const lastModified = new Date().toISOString();

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
    lastModified,
    changeFrequency: route === '' || route === '/schedule' || route === '/announcements' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/register' ? 0.9 : 0.8,
  }));
}
