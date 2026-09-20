import { getSiteConfig } from '@/lib/content';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getAnnouncements } from '@/lib/content';
import { AnnouncementsClient } from './AnnouncementsClient';
import { getEventYear } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Live Announcements & News | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  description:
    'Official notifications, schedule changes, and real-time updates during the conference.',
  path: '/announcements',
}); }

export default async function AnnouncementsPage() {
  const announcements = (await getAnnouncements());
  return <AnnouncementsClient initialAnnouncements={announcements} />;
}
