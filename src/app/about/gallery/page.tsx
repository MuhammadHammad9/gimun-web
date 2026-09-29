import type { Metadata } from 'next';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { PageHero } from '@/components/ui/PageHero';
import { getCopy, getGallery, getSiteConfig } from '@/lib/content';
import { fill, nextSteps } from '@/lib/copy';
import { constructMetadata } from '@/lib/metadata';
import { getEventYear } from '@/lib/site-config';
import { GalleryClient } from './GalleryClient';
import { NextSteps } from '@/components/story/NextSteps';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `Gallery | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
    path: '/about/gallery',
    description:
      'Photographs from GIMUN committee sessions, GMC courtroom rounds, the ceremonies and campus life at GIKI, published after each edition.',
  });
}

export default async function GalleryPage() {
  const copy = await getCopy('gallery');
  const hero = copy('gallery-hero');
  const next = copy('gallery-next');
  const items = await getGallery();

  return (
    <>
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Gallery' }]}
        meta={[items.length ? `${items.length} photographs` : 'Published after each edition']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/results" className="text-link">
              Results and awards
            </Link>
            <Link href="/about/venue" className="text-link">
              The campus
            </Link>
          </div>
        }
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Photographs">
        <div className="wrap">
          <GalleryClient initialItems={items} />
        </div>
      </section>
      {!next.hidden && <NextSteps steps={nextSteps(next)} />}
    </>
  );
}
