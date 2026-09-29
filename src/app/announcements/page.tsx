import { PageHero } from '@/components/ui/PageHero';
import { getSiteConfig } from '@/lib/content';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getAnnouncements } from '@/lib/content';
import { AnnouncementsClient } from './AnnouncementsClient';
import { getEventYear } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Live Announcements & News | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  description:
    'Official notices from the GIMUN secretariat and GMC organizers: schedule changes, releases and logistics.',
  path: '/announcements',
}); }

export default async function AnnouncementsPage() {
  const announcements = (await getAnnouncements());
  return (
    <>
      <PageHero
        variant="utility"
        meta={[`${announcements.length} notices`, 'Pinned notices first']}
        title="Announcements."
        accentPhrase="Announcements."
        description="Notices from the GIMUN secretariat and the GMC organizers: schedule changes, releases and logistics. Check here before you travel and each morning of the event."
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="All announcements">
        <div className="wrap">
          <AnnouncementsClient initialAnnouncements={announcements} />
        </div>
      </section>
    </>
  );
}
