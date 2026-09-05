import type { Metadata } from 'next';
import { getCommittees } from '@/lib/content';
import { CommitteesClient } from './CommitteesClient';

export const metadata: Metadata = {
  title: 'Committee Roster & Agendas | GIMUN 2026',
  description:
    'Explore the GIMUN 2026 simulation bodies across the UN Security Council, DISEC, UNHRC, and Crisis cabinets. Review agenda topics, dais leadership, and country allocation matrix.',
};

export default function CommitteesPage() {
  const committees = getCommittees();
  return <CommitteesClient initialCommittees={committees} />;
}
