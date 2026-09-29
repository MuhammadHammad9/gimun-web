import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getResults, getSiteConfig } from '@/lib/content';
import { ResultsClient } from './ResultsClient';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Official Results & Awardees | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  description:
    'Official hall of fame, winners, and commendations for diplomacy and moot court.',
  path: '/results',
}); }

export default async function ResultsPage() {
  const results = (await getResults());
  const siteConfig = (await getSiteConfig());
  const published = (siteConfig.resultsPublished ?? false) && results.length > 0;
  return (
    <>
      <PageHero
        variant="utility"
        meta={[published ? 'Published' : `Announced at the awards gala${siteConfig.galaDate ? `, ${formatEventDate(siteConfig.galaDate, { month: 'short' })}` : ''}`]}
        title={published ? 'Results and awards.' : 'Awards, and how they are decided.'}
        description={
          published
            ? 'The award winners of GIMUN and the GIKI Moot Court, as announced at the awards gala.'
            : 'The awards for each track and the criteria behind them. Winners are published here after the awards gala, not before.'
        }
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Awards">
        <div className="wrap">
    <ResultsClient
      initialResults={results}
      resultsPublished={siteConfig.resultsPublished ?? false}
      eventEndDate={siteConfig.eventDates.end}
    />
        </div>
      </section>
    </>
  );
}
