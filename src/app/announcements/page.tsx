import { PageHero } from '@frontend/components/ui/PageHero';
import { getCopy, getSiteConfig } from '@backend/lib/content';
import { fill, nextSteps } from '@shared/lib/copy';
import type { Metadata } from 'next';
import { constructMetadata } from '@frontend/lib/metadata';
import { getAnnouncements } from '@backend/lib/content';
import { AnnouncementsClient } from './AnnouncementsClient';
import { getEventYear } from '@shared/lib/site-config';
import { NextSteps } from '@frontend/components/story/NextSteps';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Live Announcements & News | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  description:
    'Official notices from the GIMUN secretariat and GMC organizers: schedule changes, releases and logistics.',
  path: '/announcements',
}); }

export default async function AnnouncementsPage() {
  const [announcements, copy] = await Promise.all([getAnnouncements(), getCopy('announcements')]);
  const hero = copy('announcements-hero');
  const next = copy('announcements-next');
  return (
    <>
      <PageHero
        variant="utility"
        meta={[`${announcements.length} notices`, 'Pinned notices first']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="All announcements">
        <div className="wrap">
          <AnnouncementsClient initialAnnouncements={announcements} />
        </div>
      </section>
      {!next.hidden && <NextSteps steps={nextSteps(next)} />}
    </>
  );
}
