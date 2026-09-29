import type { Metadata } from 'next';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { PageHero } from '@/components/ui/PageHero';
import { getCopy, getDocuments, getSiteConfig, getSponsors } from '@/lib/content';
import { fill, nextSteps } from '@/lib/copy';
import { constructMetadata } from '@/lib/metadata';
import { getEventYear } from '@/lib/site-config';
import { SponsorsClient } from './SponsorsClient';
import { NextSteps } from '@/components/story/NextSteps';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `Sponsors & Partners | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
    path: '/about/sponsors',
    description:
      'The organizations supporting GIMUN and the GIKI Moot Court, and how to partner with the event. The sponsorship deck sets out the tiers.',
  });
}

export default async function SponsorsPage() {
  const copy = await getCopy('sponsors');
  const hero = copy('sponsors-hero');
  const next = copy('sponsors-next');
  const [sponsors, documents] = await Promise.all([getSponsors(), getDocuments()]);
  const deck = documents.find((doc) => doc.type === 'sponsorship-deck');
  const deckUrl = deck?.fileUrl ?? '/resources';

  return (
    <>
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Sponsors' }]}
        meta={['Sponsorship', deck ? `Deck revised ${deck.versionDate}` : 'Deck on request']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href={deckUrl} className="text-link" data-no-transition="">
              Sponsorship deck{deck ? ` (${deck.fileFormat})` : ''}
            </a>
            <Link href="/contact?type=sponsorship" className="text-link">
              Ask about partnering
            </Link>
          </div>
        }
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Sponsors">
        <div className="wrap">
          <SponsorsClient initialSponsors={sponsors} />
        </div>
      </section>
      {!next.hidden && <NextSteps steps={nextSteps(next)} />}
    </>
  );
}
