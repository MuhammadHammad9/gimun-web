import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gimungiki.org';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
    '/gimun',
    '/gimun/committees',
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
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/schedule' || route === '/announcements' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/register' ? 0.9 : 0.8,
  }));
}
