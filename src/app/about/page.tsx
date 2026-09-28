import { PublishedStats } from '@/components/ui/PublishedStats';
import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Scale,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

import { constructMetadata } from "@/lib/metadata";
import { getEventYear } from "@/lib/site-config";
import { canRegister } from "@/lib/phase";
import { PageHero } from '@/components/ui/PageHero';
import { CtaBanner } from '@/components/ui/CtaBanner';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `About the Symposium | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/about',
  description:
    "Discover the legacy, academic mission, and institutional heritage of Pakistan’s premier twin diplomatic and legal advocacy championship hosted at GIKI, Topi.",
}); }

export default async function AboutOverviewPage() {
  const site=await getSiteConfig();
  const gimunOpen = canRegister(site, 'gimun');
  const mootOpen = canRegister(site, 'mootCup');
  return (
    <div className="space-y-16">
      {/* 1. Atmospheric Dark Hero Header */}
      <PageHero
        variant="utility"
        title={'Pakistan\'s Premier Twin Diplomatic & Legal Symposium'}
        accentWords={['Diplomatic', '&', 'Legal']}
        description={'Hosted at the GIKI campus in Topi, the symposium brings students together for parliamentary debate, courtroom advocacy, and leadership.'}
        eyebrow={
          <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-champagne/20 text-champagne border border-champagne/30">
                        <Sparkles className="w-3.5 h-3.5 text-champagne" />
                        Diplomacy & Advocacy
                      </span>
                      <span className="text-xs font-mono text-champagne/70 uppercase tracking-widest">
                        GIKI Topi
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Button variant="track-gimun" href="/gimun">
                          Explore GIMUN
                        </Button>
                        <Button variant="track-moot" href="/moot-cup">
                          Explore GMC
                        </Button>
                        <Button variant="secondary" href="/about/team">
                          Leadership Directory
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-16">
        {/* 2. Published metrics — omitted entirely until the CMS has real figures. */}
        {site.stats?.length ? (
        <section className="space-y-8">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne">
              Institutional Stature
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-cream">
              At a glance
            </h2>
          </div>

          <PublishedStats stats={site.stats}/>
        </section>
        ) : null}

        {/* 3. The Twin Flagship Pillars */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* GIMUN Pillar */}
          <div className="p-8 sm:p-10 rounded-2xl bg-overlay/90 text-champagne space-y-6 border border-champagne/30 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-brand/20 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-champagne/20 text-cream border border-champagne/40">
                <Compass className="w-3.5 h-3.5" />
                <span>Diplomatic Simulation</span>
              </span>
              <span className="text-xs font-mono text-champagne/70">Track 01</span>
            </div>

            <div className="relative z-10 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-cream">
                GIKI Model United Nations (GIMUN)
              </h3>
              <p className="text-xs sm:text-sm text-champagne/85 leading-relaxed">
                GIMUN immerses delegates in the intricacies of multilateral diplomacy, treaty negotiation, and high-stakes geopolitical crisis management. From the UN Security Council to specialized historic cabinets, delegates defend sovereign mandates under rigorous parliamentary protocols.
              </p>
            </div>

            <ul className="relative z-10 space-y-2.5 text-xs text-champagne/90 font-mono">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
                <span>Standardized Harvard Parliamentary Rules of Procedure</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
                <span>Real-time Crisis Directives &amp; Joint Cabinet Interventions</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
                <span>Merit-based Best Delegate, Outstanding &amp; Gavel Accolades</span>
              </li>
            </ul>

            <div className="relative z-10 pt-4 border-t border-champagne/15">
              <Link
                href="/gimun"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-champagne hover:text-cream transition-colors"
              >
                <span>Explore GIMUN Track Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* GMC Pillar */}
          <div className="p-8 sm:p-10 rounded-2xl bg-overlay/90 text-champagne space-y-6 border border-champagne/30 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-champagne/10 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-brand text-cream border border-champagne/30">
                <Scale className="w-3.5 h-3.5" />
                <span>Judicial Advocacy</span>
              </span>
              <span className="text-xs font-mono text-champagne/70">Track 02</span>
            </div>

            <div className="relative z-10 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-cream">
                GIKI Moot Court (GMC)
              </h3>
              <p className="text-xs sm:text-sm text-champagne/85 leading-relaxed">
                The GIKI Moot Court (GMC) is Pakistan&apos;s premier collegiate appellate advocacy championship. Law school delegations draft comprehensive written memorials for Applicant and Respondent, followed by contentious oral pleading rounds adjudicated by senior advocates and High Court jurists.
              </p>
            </div>

            <ul className="relative z-10 space-y-2.5 text-xs text-champagne/90 font-mono">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
                <span>Comprehensive Written Memorial Scoring (OSCOLA 4th Ed)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
                <span>Preliminary, Quarter, Semi, and Grand Final Pleading Benches</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
                <span>Champion Bench Trophy, Best Memorial, and Best Oralist Honors</span>
              </li>
            </ul>

            <div className="relative z-10 pt-4 border-t border-champagne/15">
              <Link
                href="/moot-cup"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-champagne hover:text-cream transition-colors"
              >
                <span>Explore GMC Track Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* The six-card "Institutional Directory" that sat here linked to Team,
            Venue, FAQ, Sponsors, Gallery and Resources — the same six links
            already in the About menu and the footer, so it was the third copy
            on the page and pushed the actual content below the fold. The About
            menu covers navigation; this page now only says what the event is. */}

        <section className="surface flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-crest text-champagne">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <p className="max-w-2xl text-body text-text-3">
              <span className="font-semibold text-text">
                Run by GIKI Student Affairs.
              </span>{' '}
              Fees are paid through the institute&apos;s own banking channels. Nothing is
              charged on this site.
            </p>
          </div>
          <Link
            href="/about/faq#fees"
            className="shrink-0 rounded-xl border border-line-2 px-4 py-2.5 text-sm font-medium text-champagne transition-colors hover:border-line-3 hover:bg-champagne/5"
          >
            Fees &amp; payment
          </Link>
        </section>

        {/* 6. Closing Register CTA Banner */}
        <CtaBanner variant="slab">
        <div className="text-champagne relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="absolute inset-0 bg-radial-glow-dual opacity-30 pointer-events-none" />
          <div className="relative z-10 space-y-2 text-center md:text-left max-w-xl">
            <span className="text-xs font-mono uppercase font-bold text-champagne tracking-wider">
              {gimunOpen || mootOpen ? 'Applications open' : 'Registration status'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-cream">
              Represent Your Institution at GIKI Topi
            </h2>
            <p className="text-xs sm:text-sm text-champagne/80 leading-relaxed">
              Secure your delegation’s place at Pakistan&apos;s premier diplomatic and legal championship.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Button variant="track-gimun" href="/register?track=gimun">
              {gimunOpen ? 'Apply for GIMUN' : 'GIMUN registration status'}
            </Button>
            <Button variant="track-moot" href="/register?track=moot-cup">
              {mootOpen ? 'Register GMC Team' : 'GMC registration status'}
            </Button>
          </div>
        </div>
      </CtaBanner>
      </div>
    </div>
  );
}
