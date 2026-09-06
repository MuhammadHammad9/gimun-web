import type { Metadata } from 'next';
import { getCommittees } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { CommitteesClient } from './CommitteesClient';

export const metadata: Metadata = constructMetadata({
  title: 'Committee Roster & Agendas | GIMUN 2027',
  description:
    'Explore the GIMUN 2027 simulation bodies across the UN Security Council, DISEC, UNHRC, and Crisis cabinets. Review agenda topics, dais leadership, and country allocation matrix.',
  path: '/gimun/committees',
});

export default function CommitteesPage() {
  const committees = getCommittees();
  return <CommitteesClient initialCommittees={committees} />;
}
