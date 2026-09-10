import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getResults, getSiteConfig } from '@/lib/content';
import { ResultsClient } from './ResultsClient';

export const metadata: Metadata = constructMetadata({
  title: 'Official Results & Awardees | GIMUN & GMC 2027',
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
