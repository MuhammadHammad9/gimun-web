import { getSiteConfig } from '@/lib/content';
import type { Metadata } from 'next';
import { getCommittees } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { CommitteesClient } from './CommitteesClient';
import { getEventYear } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Committee Roster & Agendas | GIMUN ${getEventYear(await getSiteConfig())}`,
  description: `Explore the GIMUN ${getEventYear(await getSiteConfig())} simulation bodies across the UN Security Council, DISEC, UNHRC, and Crisis cabinets. Review agenda topics, dais leadership, and country allocation matrix.`,
  path: '/gimun/committees',
}); }

export default async function CommitteesPage() {
  const committees = (await getCommittees());
  return <CommitteesClient initialCommittees={committees} />;
}
