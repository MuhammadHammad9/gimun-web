import { MetadataRoute } from 'next';
import { getCommittees } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gimungiki.org').replace(/\/$/, '');
  const currentDate = new Date().toISOString();
  const committees = getCommittees();

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
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/schedule' || route === '/announcements' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/register' ? 0.9 : 0.8,
  }));
}
