'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useSiteConfig } from '@/components/SiteConfigProvider';
import { PublishedStats } from '@/components/ui/PublishedStats';
import type { Sponsor } from '@/lib/types';
import { getEventYear } from '@/lib/site-config';

interface SponsorsClientProps {
  initialSponsors: Sponsor[];
}

const TIER_ORDER: Sponsor['tier'][] = ['title', 'gold', 'silver', 'partner', 'media-partner'];

const TIER_LABELS: Record<Sponsor['tier'], string> = {
  title: 'Title sponsor',
  gold: 'Gold sponsors',
  silver: 'Silver sponsors',
  partner: 'Partners',
  'media-partner': 'Media partners',
};

export function SponsorsClient({ initialSponsors }: SponsorsClientProps) {
  const site = useSiteConfig();
  const eventYear = getEventYear(site);
  const groups = TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    sponsors: initialSponsors.filter((s) => s.tier === tier),
  })).filter((group) => group.sponsors.length > 0);

  return (
    <div className="space-y-16">
      {site.stats?.length ? (
        <section aria-labelledby="reach-title" className="space-y-6">
          <h2 id="reach-title" className="font-display text-2xl font-medium text-text sm:text-3xl">
            Who you reach
          </h2>
          <PublishedStats stats={site.stats} />
        </section>
      ) : null}

      <section aria-labelledby="sponsors-title" className="space-y-10">
        <div className="max-w-2xl space-y-2">
          <h2 id="sponsors-title" className="font-display text-2xl font-medium text-text sm:text-3xl">
            {eventYear} sponsors
          </h2>
          <p className="text-base leading-relaxed text-text-2">
            {groups.length > 0
              ? "Thank you to the organizations supporting this year's conference."
              : `Partnerships for ${eventYear} are being finalised. Partners are listed here once agreements are signed.`}
          </p>
        </div>

        {groups.map(({ tier, label, sponsors }) => (
          <div key={tier} className="space-y-4">
            <h3 className="flex items-baseline justify-between border-b border-line pb-3 font-display text-lg font-medium text-text">
              {label}
              <span className="font-mono text-xs font-normal text-text-3">{sponsors.length}</span>
            </h3>
            <ul
              className={
                tier === 'title'
                  ? 'grid gap-6'
                  : tier === 'gold'
                    ? 'grid gap-6 sm:grid-cols-2'
                    : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
              }
            >
              {sponsors.map((sp) => (
                <li key={sp.id} className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-raised p-6 sm:p-7">
                  <div className="flex h-20 items-center justify-center rounded-xl border border-line bg-elevated p-4">
                    {sp.logo ? (
                      <div className="relative h-12 w-full">
                        <Image src={sp.logo} alt={sp.name} fill className="object-contain" sizes="(max-width: 640px) 100vw, 200px" />
                      </div>
                    ) : (
                      <span className="font-display text-lg font-medium tracking-tight text-text-2">{sp.name.split('(')[0].trim()}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-base font-medium text-text">{sp.name}</p>
                    {sp.description && <p className="text-sm leading-relaxed text-text-2">{sp.description}</p>}
                  </div>
                  {sp.url && (
                    <a href={sp.url} target="_blank" rel="noopener noreferrer" className="text-link mt-auto w-fit text-sm">
                      Website
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      <span className="sr-only"> of {sp.name} (opens in a new tab)</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="border-t border-line pt-6 text-sm text-text-3">
        Sponsorship is agreed directly with the organizing committee. No payment is taken on this website.
      </p>
    </div>
  );
}
