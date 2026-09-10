import type { Metadata } from 'next';
import { getCommittees } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { CommitteesClient } from './CommitteesClient';
import { getEventYear } from '@/lib/site-config';

const eventYear = getEventYear();
export const metadata: Metadata = constructMetadata({
  title: `Committee Roster & Agendas | GIMUN ${eventYear}`,
  description: `Explore the GIMUN ${eventYear} simulation bodies across the UN Security Council, DISEC, UNHRC, and Crisis cabinets. Review agenda topics, dais leadership, and country allocation matrix.`,
  path: '/gimun/committees',
});

export default function CommitteesPage() {
  const committees = getCommittees();
  return <CommitteesClient initialCommittees={committees} />;
}
