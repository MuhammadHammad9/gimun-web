import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getAnnouncements } from '@/lib/content';
import { AnnouncementsClient } from './AnnouncementsClient';

export const metadata: Metadata = constructMetadata({
  title: 'Live Announcements & News | GIMUN & GMC 2027',
  description:
    'Official notifications, schedule changes, and real-time updates during the conference.',
  path: '/announcements',
});

export default function AnnouncementsPage() {
  const announcements = getAnnouncements();
  return <AnnouncementsClient initialAnnouncements={announcements} />;
}

