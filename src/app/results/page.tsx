import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getResults, getSiteConfig } from '@/lib/content';
import { ResultsClient } from './ResultsClient';
import { getEventYear } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Official Results & Awardees | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  description:
    'Official hall of fame, winners, and commendations for diplomacy and moot court.',
  path: '/results',
}); }

export default async function ResultsPage() {
  const results = (await getResults());
  const siteConfig = (await getSiteConfig());
  return (
    <ResultsClient
      initialResults={results}
      resultsPublished={siteConfig.resultsPublished ?? false}
      eventEndDate={siteConfig.eventDates.end}
    />
  );
}
