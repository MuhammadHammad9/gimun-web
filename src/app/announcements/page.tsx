import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getAnnouncements } from '@/lib/content';
import { AnnouncementsClient } from './AnnouncementsClient';
import { getEventYear } from '@/lib/site-config';

const eventYear = getEventYear();
export const metadata: Metadata = constructMetadata({
  title: `Live Announcements & News | GIMUN & GMC ${eventYear}`,
  description:
    'Official notifications, schedule changes, and real-time updates during the conference.',
  path: '/announcements',
});

export default function AnnouncementsPage() {
  const announcements = getAnnouncements();
  return <AnnouncementsClient initialAnnouncements={announcements} />;
}
