'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  ExternalLink,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import type { Sponsor } from '@/lib/types';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface SponsorsClientProps {
  initialSponsors: Sponsor[];
}

const TIER_ORDER: Sponsor['tier'][] = ['title', 'gold', 'silver', 'partner', 'media-partner'];

const TIER_LABELS: Record<Sponsor['tier'], { label: string; badge: string; colorClass: string }> = {
  title: {
    label: 'Title Academic Patron',
    badge: 'Title Partner',
    colorClass: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  gold: {
    label: 'Gold Strategic Partners',
    badge: 'Gold Partner',
    colorClass: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  },
  silver: {
    label: 'Silver Enterprise Partners',
    badge: 'Silver Partner',
    colorClass: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  partner: {
    label: 'Judicial & Academic Fraternity Partners',
    badge: 'Institutional Partner',
    colorClass: 'bg-blue-100 text-blue-900 border-blue-200',
  },
  'media-partner': {
    label: 'Official Press & Media Partners',
    badge: 'Media Partner',
    colorClass: 'bg-purple-100 text-purple-900 border-purple-200',
  },
};

export function SponsorsClient({ initialSponsors }: SponsorsClientProps) {
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
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
            Partner Value Proposition
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            Why Sponsor GIMUN & GIKI Moot Cup?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-gray max-w-2xl leading-relaxed">
            Direct access to Pakistan&apos;s most articulate, legally minded, and ambitious student leaders,
            delivering unmatched brand equity, talent recruitment, and corporate social impact.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-heading font-extrabold text-ink">800+</span>
              <h3 className="text-xs font-mono uppercase font-bold text-ink tracking-wide">
                Elite Delegates & Oralists
              </h3>
            </div>
            <p className="text-xs text-neutral-gray leading-relaxed">
              Future lawyers, diplomats, engineers, and public policy researchers representing premier institutions.
            </p>
          </div>

          <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-accent flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-heading font-extrabold text-ink">50+</span>
              <h3 className="text-xs font-mono uppercase font-bold text-ink tracking-wide">
                Universities & Law Schools
              </h3>
            </div>
            <p className="text-xs text-neutral-gray leading-relaxed">
              Pan-Pakistan representation from GIKI, LUMS, NUST, Punjab University, IBA, FAST, and A-Level colleges.
            </p>
          </div>

          <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-secondary flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-heading font-extrabold text-ink">50,000+</span>
              <h3 className="text-xs font-mono uppercase font-bold text-ink tracking-wide">
                Digital Impressions
              </h3>
            </div>
            <p className="text-xs text-neutral-gray leading-relaxed">
              High-engagement campus ambassadorship networks, livestreamed championship benches, and digital gazettes.
            </p>
          </div>

          <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-heading font-extrabold text-ink">3 Days</span>
              <h3 className="text-xs font-mono uppercase font-bold text-ink tracking-wide">
                Immersive On-Campus Branding
              </h3>
            </div>
            <p className="text-xs text-neutral-gray leading-relaxed">
              Keynote stage backdrops, delegate badge lanyards, formal dinner activations, and recruitment pavilions.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Official Sponsorship Prospectus Download Card */}
      <section className="p-6 sm:p-8 rounded-section bg-surface-elevated border border-slate-200/90 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-accent">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Corporate Partnerships Deck</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-ink">
            Download the 2026 Sponsorship Prospectus
          </h3>
          <p className="text-xs sm:text-sm text-neutral-gray max-w-xl leading-relaxed">
            Review detailed tier benefits, stage branding packages, delegate kit inserts, and CSR alignment
            opportunities in our comprehensive institutional prospectus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-button bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-colors shadow-button"
          >
            <Download className="w-4 h-4" />
            <span>Download Prospectus (PDF)</span>
          </Link>
          <Link
            href="/contact?type=sponsorship"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-button bg-white border border-slate-200 text-xs font-semibold text-ink hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>Partner Inquiry Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* SECTION 3: Tiered Partners Directory */}
      <section className="space-y-10">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
            Institutional Roster
          </span>
          <h2 className="text-2xl font-heading font-bold text-ink">
            Current Edition Sponsors & Patrons
          </h2>
          <p className="text-xs sm:text-sm text-neutral-gray max-w-2xl">
            We express our deepest gratitude to our statutory patrons, government boards, and legal institutions.
          </p>
        </div>

        <div className="space-y-12">
          {groupedSponsors.map(({ tier, meta, sponsors }) => (
            <div key={tier} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${meta.colorClass}`}
                  >
                    {meta.badge}
                  </span>
                  <h3 className="text-base font-heading font-bold text-ink">{meta.label}</h3>
                </div>
                <span className="text-xs font-mono text-neutral-gray">
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
                    <div className="double-bezel h-full group">
                      <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-3">
                          {/* Logo Simulator Box with Grayscale-to-Color hover */}
                          <div className="h-20 rounded-card bg-slate-50 border border-slate-200/60 flex items-center justify-center p-4 transition-all group-hover:border-primary/40 group-hover:bg-white">
                            <span className="font-heading font-extrabold text-lg sm:text-xl text-slate-500 transition-colors group-hover:text-primary tracking-tight">
                              {sp.name.split('(')[0].trim()}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-base font-heading font-bold text-ink group-hover:text-primary transition-colors">
                              {sp.name}
                            </h4>
                            {sp.description && (
                              <p className="text-xs text-neutral-gray leading-relaxed">
                                {sp.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {sp.url && (
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-[10px] font-mono uppercase text-neutral-gray">
                              Partner Web Portal
                            </span>
                            <a
                              href={sp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-light transition-colors"
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
      <div className="p-4 rounded-xl bg-surface border border-slate-200 text-xs text-neutral-gray flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-ink font-semibold">Corporate Governance Notice:</strong>{' '}
          All corporate sponsorships, university patronage agreements, and award endowments are formalized exclusively
          via signed bilateral Memorandums of Understanding (MOUs) and processed through official GIKI university accounts.
          Zero commercial financial collection occurs through this website.
        </div>
      </div>
    </div>
  );
}
