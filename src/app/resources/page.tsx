import type { Metadata } from 'next';
import { getDocuments } from '@/lib/content';
import { ResourcesClient } from './ResourcesClient';

export const metadata: Metadata = {
  title: 'Resource Hub & Document Archive | GIMUN & GIKI Moot Cup 2026',
  description:
    'The authoritative digital archive for official delegate handbooks, committee background guides, legal compromises, competition rules, and campus logistical dossiers.',
};

export default function ResourcesPage() {
  const documents = getDocuments();
  return <ResourcesClient initialDocuments={documents} />;
}
