import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getCopy, getResults, getSiteConfig } from '@/lib/content';
import { fill } from '@/lib/copy';
import { ResultsClient } from './ResultsClient';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { PageHero } from '@/components/ui/PageHero';
import { GavelArt } from '@/components/art/LineArt';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Official Results & Awardees | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  description:
    'Official hall of fame, winners, and commendations for diplomacy and moot court.',
  path: '/results',
}); }

export default async function ResultsPage() {
  const [results, siteConfig, copy] = await Promise.all([getResults(), getSiteConfig(), getCopy('results')]);
  const published = (siteConfig.resultsPublished ?? false) && results.length > 0;
  const hero = copy(published ? 'results-hero-published' : 'results-hero');
  return (
    <>
      <PageHero
        variant="utility"
        meta={[published ? 'Published' : `Announced at the awards gala${siteConfig.galaDate ? `, ${formatEventDate(siteConfig.galaDate, { month: 'short' })}` : ''}`]}
        title={fill(hero.title)}
        description={fill(hero.lead)}
        art={<GavelArt className="mx-auto hidden w-full max-w-[18rem] text-champagne opacity-50 lg:block" />}
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Awards">
        <div className="wrap">
    <ResultsClient
      initialResults={results}
      resultsPublished={siteConfig.resultsPublished ?? false}
      eventEndDate={siteConfig.eventDates.end}
      awards={copy('results-awards')}
      criteria={copy('results-criteria')}
    />
        </div>
      </section>
    </>
  );
}
