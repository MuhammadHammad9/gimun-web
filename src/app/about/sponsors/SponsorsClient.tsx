'use client';

import { useSiteConfig } from '@/components/SiteConfigProvider';

import React from 'react';
import { PublishedStats } from '@/components/ui/PublishedStats';
import Image from 'next/image';
import Link from 'next/link';
import {
  Download,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { Sponsor } from '@/lib/types';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getEventYear } from '@/lib/site-config';
import { CtaBanner } from '@/components/ui/CtaBanner';

interface SponsorsClientProps {
  initialSponsors: Sponsor[];
}

const TIER_ORDER: Sponsor['tier'][] = ['title', 'gold', 'silver', 'partner', 'media-partner'];

const TIER_LABELS: Record<Sponsor['tier'], { label: string; badge: string; colorClass: string }> = {
  title: {
    label: 'Title Academic Patron',
    badge: 'Title Partner',
    colorClass: 'bg-champagne/20 text-cream border-champagne/40',
  },
  gold: {
    label: 'Gold Strategic Partners',
    badge: 'Gold Partner',
    colorClass: 'bg-brand text-cream border-champagne/30',
  },
  silver: {
    label: 'Silver Enterprise Partners',
    badge: 'Silver Partner',
    colorClass: 'bg-crest text-champagne border-champagne/30',
  },
  partner: {
    label: 'Judicial & Academic Fraternity Partners',
    badge: 'Institutional Partner',
    colorClass: 'bg-overlay text-champagne border-champagne/30',
  },
  'media-partner': {
    label: 'Official Press & Media Partners',
    badge: 'Media Partner',
    colorClass: 'bg-crest text-champagne border-champagne/30',
  },
};

export function SponsorsClient({ initialSponsors }: SponsorsClientProps) {
  const site=useSiteConfig();
  const eventYear = getEventYear(site);
  // Group sponsors by tier
  const groupedSponsors = TIER_ORDER.map((tier) => ({
    tier,
    meta: TIER_LABELS[tier],
    sponsors: initialSponsors.filter((s) => s.tier === tier),
  })).filter((group) => group.sponsors.length > 0);

  return (
    <div className="space-y-16">
      {/* SECTION 1: Why Partner With Us (Value Proposition Bento) */}
      <section className="space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne">
            Partner Value Proposition
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-cream">
            Why Sponsor GIMUN &amp; GMC?
          </h2>
          <p className="text-xs sm:text-sm text-champagne/80 max-w-2xl leading-relaxed">
            Direct access to Pakistan&apos;s most articulate, legally minded, and ambitious student leaders,
            delivering unmatched brand equity, talent recruitment, and corporate social impact.
          </p>
        </div>

        <PublishedStats stats={site.stats}/>
      </section>

      {/* SECTION 2: Official Sponsorship Prospectus Download Card */}
      <CtaBanner variant="slab">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-champagne">
            <Sparkles className="w-4 h-4 text-champagne" />
            <span>Corporate Partnerships Deck</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-cream">
            Download the {eventYear} Sponsorship Prospectus
          </h3>
          <p className="text-xs sm:text-sm text-champagne/80 max-w-xl leading-relaxed">
            Review detailed tier benefits, stage branding packages, delegate kit inserts, and CSR alignment
            opportunities in our comprehensive institutional prospectus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-crest text-xs font-bold hover:brightness-110 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download Prospectus (PDF)</span>
          </Link>
          <Link
            href="/contact?type=sponsorship"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-crest border border-champagne/40 text-xs font-semibold text-champagne hover:bg-brand transition-colors"
          >
            <span>Partner Inquiry Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        </div>
      </CtaBanner>

      {/* SECTION 3: Tiered Partners Directory */}
      <section className="space-y-10">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne">
            Institutional Roster
          </span>
          <h2 className="text-2xl font-heading font-bold text-cream">
            Current Edition Sponsors &amp; Patrons
          </h2>
          <p className="text-xs sm:text-sm text-champagne/80 max-w-2xl">
            We express our deepest gratitude to our statutory patrons, government boards, and legal institutions.
          </p>
        </div>

        <div className="space-y-12">
          {groupedSponsors.map(({ tier, meta, sponsors }) => (
            <div key={tier} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-champagne/15">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${meta.colorClass}`}
                  >
                    {meta.badge}
                  </span>
                  <h3 className="text-base font-heading font-bold text-cream">{meta.label}</h3>
                </div>
                <span className="text-xs font-mono text-champagne/70">
                  {sponsors.length} {sponsors.length === 1 ? 'Organization' : 'Organizations'}
                </span>
              </div>

              <div
                className={`grid gap-6 ${
                  tier === 'title'
                    ? 'grid-cols-1'
                    : tier === 'gold'
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {sponsors.map((sp) => (
                  <ScrollReveal key={sp.id}>
                    <div className="rounded-2xl border border-champagne/25 bg-overlay/85 hover:border-champagne/45 hover:bg-overlay/95 shadow-xl transition-all duration-300 h-full group">
                      <div className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-3">
                          {/* Logo Box with Grayscale-to-Color hover */}
                          <div className="h-20 rounded-xl bg-crest/60 border border-champagne/20 flex items-center justify-center p-4 transition-all group-hover:border-champagne/40 group-hover:bg-crest/80">
                            {sp.logo ? (
                              <div className="relative w-full h-12">
                                <Image
                                  src={sp.logo}
                                  alt={sp.name}
                                  fill
                                  className="object-contain filter brightness-90 contrast-125 group-hover:brightness-100 transition-all duration-300"
                                  sizes="(max-width: 640px) 100vw, 200px"
                                />
                              </div>
                            ) : (
                              <span className="font-heading font-extrabold text-lg sm:text-xl text-champagne/80 transition-colors group-hover:text-cream tracking-tight">
                                {sp.name.split('(')[0].trim()}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-base font-heading font-bold text-cream group-hover:text-champagne transition-colors">
                              {sp.name}
                            </h4>
                            {sp.description && (
                              <p className="text-xs text-champagne/75 leading-relaxed">
                                {sp.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {sp.url && (
                          <div className="pt-3 border-t border-champagne/15 flex items-center justify-between text-xs">
                            <span className="text-[10px] font-mono uppercase text-champagne/60">
                              Partner Web Portal
                            </span>
                            <a
                              href={sp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-semibold text-champagne hover:text-cream transition-colors"
                            >
                              <span>Official Site</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Zero Online Payment Formalization Disclosure */}
      <div className="p-4 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-md text-xs text-champagne/80 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
        <div>
          <strong className="text-cream font-semibold">Corporate Governance Notice:</strong>{' '}
          All corporate sponsorships, university patronage agreements, and award endowments are formalized exclusively
          via signed bilateral Memorandums of Understanding (MOUs) and processed through official GIKI university accounts.
          Zero commercial financial collection occurs through this website.
        </div>
      </div>
    </div>
  );
}
