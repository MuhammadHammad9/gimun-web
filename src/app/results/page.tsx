import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getResults, getSiteConfig } from '@/lib/content';
import { ResultsClient } from './ResultsClient';
import { getEventYear } from '@/lib/site-config';

const eventYear = getEventYear();
export const metadata: Metadata = constructMetadata({
  title: `Official Results & Awardees | GIMUN & GMC ${eventYear}`,
  description:
    'Official hall of fame, winners, and commendations for diplomacy and moot court.',
  path: '/results',
});

export default function ResultsPage() {
  const results = getResults();
  const siteConfig = getSiteConfig();
  return (
    <ResultsClient
      initialResults={results}
      resultsPublished={siteConfig.resultsPublished ?? false}
      eventEndDate={siteConfig.eventDates.end}
    />
  );
}
