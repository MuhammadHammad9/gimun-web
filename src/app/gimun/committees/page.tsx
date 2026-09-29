import type { Metadata } from 'next';
import { GlobeArt } from '@/components/art/LineArt';
import { seatsOpen } from '@/components/sections/Placards';
import { PageHero } from '@/components/ui/PageHero';
import { getCommittees, getCopy, getSiteConfig } from '@/lib/content';
import { fill } from '@/lib/copy';
import { constructMetadata } from '@/lib/metadata';
import { canRegister } from '@/lib/phase';
import { getEventYear } from '@/lib/site-config';
import { CommitteesClient } from './CommitteesClient';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `Committees & Agendas | GIMUN ${getEventYear(await getSiteConfig())}`,
    description: `The GIMUN ${getEventYear(await getSiteConfig())} committees: agendas, chairs and the countries still open for allocation in each chamber.`,
    path: '/gimun/committees',
  });
}

export default async function CommitteesPage() {
  const [committees, site, copy] = await Promise.all([getCommittees(), getSiteConfig(), getCopy('committees')]);
  const hero = copy('committees-hero');
  const seats = committees.reduce((sum, c) => sum + (c.countryList?.length ?? 0), 0);
  const open = committees.reduce((sum, c) => sum + seatsOpen(c), 0);
  const registrationOpen = canRegister(site, 'gimun');

  return (
    <>
      <PageHero
        variant="gimun"
        breadcrumbs={[{ label: 'GIMUN', href: '/gimun' }, { label: 'Committees' }]}
        meta={[`${committees.length} committees`, `${seats} country seats`, `${open} still open`]}
        title={fill(hero.title, { committees: committees.length })}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead, { committees: committees.length })}
        actions={[
          { label: registrationOpen ? 'Register for GIMUN' : 'Registration status', href: '/register?track=gimun', variant: 'track-gimun' },
          { label: 'Rules of procedure', href: '/gimun/rules', variant: 'secondary' },
        ]}
        art={<GlobeArt className="mx-auto hidden w-full max-w-[22rem] text-accent-gimun opacity-40 lg:block" />}
      />
      <CommitteesClient committees={committees} registrationOpen={registrationOpen} />
    </>
  );
}
