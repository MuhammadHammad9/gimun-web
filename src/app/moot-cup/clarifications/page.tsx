import type { Metadata } from 'next';
import { getClarifications } from '@/lib/content';
import { ClarificationsClient } from './ClarificationsClient';

export const metadata: Metadata = {
  title: 'Official Clarifications Log & Rulings | GIKI Moot Court 2026',
  description:
    'Formal questions submitted by participating teams and binding interpretations issued by the Bench Drafting Committee for the GIKI Moot Court Compromis.',
};

export default function ClarificationsPage() {
  const clarifications = getClarifications();
  return <ClarificationsClient initialClarifications={clarifications} />;
}
