import type { Metadata } from 'next';
import { GlobeArt } from '@/components/art/LineArt';
import { LiveGlobe, type GlobeMarker } from '@/components/art/LiveGlobe';
import { centroidOf } from '@/lib/geo/centroids';
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
  // One marker per country, showing its most open seat across committees.
  const rank: Record<GlobeMarker['status'], number> = { available: 3, assigned: 2, reserved: 1 };
  const byCountry = new Map<string, GlobeMarker['status']>();
  for (const { country, status } of committees.flatMap((c) => c.countryList ?? [])) {
    const current = byCountry.get(country);
    if (!current || rank[status] > rank[current]) byCountry.set(country, status);
  }
  const markers = [...byCountry].flatMap(([country, status]) => {
    const centre = centroidOf(country);
    return centre ? [{ country, lat: centre[0], lon: centre[1], status }] : [];
  });

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
        art={
          <div className="mx-auto hidden w-full max-w-[24rem] lg:block">
            <LiveGlobe markers={markers} fallback={<GlobeArt className="text-accent-gimun opacity-40" />} />
            <p className="live-globe__legend" aria-hidden="true">
              <span style={{ '--legend-dot': 'var(--color-champagne)' } as React.CSSProperties}>Open</span>
              <span style={{ '--legend-dot': 'var(--color-accent-gimun)' } as React.CSSProperties}>Allocated</span>
            </p>
          </div>
        }
      />
      <CommitteesClient committees={committees} registrationOpen={registrationOpen} />
    </>
  );
}
