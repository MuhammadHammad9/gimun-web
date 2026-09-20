import { PublishedStats } from '@/components/ui/PublishedStats';
import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Compass,
  Scale,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Image as ImageIcon,
  HelpCircle,
  Briefcase,
  MapPin,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";

import { constructMetadata } from "@/lib/metadata";
import { getEventYear } from "@/lib/site-config";
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
  const eventYear = getEventYear(site);
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
        {/* 2. 15-Year Legacy Bento Metrics */}
        <section className="space-y-8">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne">
              Institutional Stature
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-cream">
              The event at a glance
            </h2>
          </div>

          <PublishedStats stats={site.stats}/>
        </section>

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

        {/* 4. Sub-Pages Navigation Hub */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne">
              Institutional Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-cream">
              Directory, Guides &amp; Historical Archives
            </h2>
            <p className="text-xs sm:text-sm text-champagne/80 max-w-2xl">
              Inspect organizing leadership, review campus travel protocols, search the FAQ knowledge base, and access historical media archives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Team */}
            <ScrollReveal>
              <Link href="/about/team" className="block rounded-2xl border border-champagne/25 bg-overlay/85 hover:border-champagne/45 hover:bg-overlay/95 shadow-xl transition-all duration-300 h-full group">
                <div className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-crest text-champagne flex items-center justify-center group-hover:bg-brand group-hover:text-cream transition-colors border border-champagne/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-cream group-hover:text-champagne transition-colors">
                      Organizing Leadership
                    </h3>
                    <p className="text-xs text-champagne/75 leading-relaxed">
                      Meet the GIMUN Executive Secretariat, GMC Convening Committee, and Host Directorate operations heads.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-champagne group-hover:text-cream transition-colors pt-3 border-t border-champagne/15">
                    <span>View Leadership Roster</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 2: Venue */}
            <ScrollReveal>
              <Link href="/about/venue" className="block rounded-2xl border border-champagne/25 bg-overlay/85 hover:border-champagne/45 hover:bg-overlay/95 shadow-xl transition-all duration-300 h-full group">
                <div className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-crest text-champagne flex items-center justify-center group-hover:bg-brand group-hover:text-cream transition-colors border border-champagne/20">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-cream group-hover:text-champagne transition-colors">
                      Campus Venue &amp; Travel
                    </h3>
                    <p className="text-xs text-champagne/75 leading-relaxed">
                      Directions to GIKI Topi, airport shuttle schedules, campus gate security clearance, and residential boarding.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-champagne group-hover:text-cream transition-colors pt-3 border-t border-champagne/15">
                    <span>Explore Venue Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 3: FAQ */}
            <ScrollReveal>
              <Link href="/about/faq" className="block rounded-2xl border border-champagne/25 bg-overlay/85 hover:border-champagne/45 hover:bg-overlay/95 shadow-xl transition-all duration-300 h-full group">
                <div className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-crest text-champagne flex items-center justify-center group-hover:bg-brand group-hover:text-cream transition-colors border border-champagne/20">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-cream group-hover:text-champagne transition-colors">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-xs text-champagne/75 leading-relaxed">
                      Searchable answers covering delegate eligibility, memorial submission, dress code, security, and verification.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-champagne group-hover:text-cream transition-colors pt-3 border-t border-champagne/15">
                    <span>Search Knowledge Base</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 4: Sponsors */}
            <ScrollReveal>
              <Link href="/about/sponsors" className="block rounded-2xl border border-champagne/25 bg-overlay/85 hover:border-champagne/45 hover:bg-overlay/95 shadow-xl transition-all duration-300 h-full group">
                <div className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-crest text-champagne flex items-center justify-center group-hover:bg-brand group-hover:text-cream transition-colors border border-champagne/20">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-cream group-hover:text-champagne transition-colors">
                      Sponsors &amp; Patrons
                    </h3>
                    <p className="text-xs text-champagne/75 leading-relaxed">
                      Statutory patrons, legal chambers, government boards, and official {eventYear} Sponsorship Prospectus.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-champagne group-hover:text-cream transition-colors pt-3 border-t border-champagne/15">
                    <span>View Partners &amp; Deck</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 5: Gallery */}
            <ScrollReveal>
              <Link href="/about/gallery" className="block rounded-2xl border border-champagne/25 bg-overlay/85 hover:border-champagne/45 hover:bg-overlay/95 shadow-xl transition-all duration-300 h-full group">
                <div className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-crest text-champagne flex items-center justify-center group-hover:bg-brand group-hover:text-cream transition-colors border border-champagne/20">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-cream group-hover:text-champagne transition-colors">
                      Visual Archives &amp; Gallery
                    </h3>
                    <p className="text-xs text-champagne/75 leading-relaxed">
                      Photographic archives covering crisis debates, appellate benches, campus life, and social galas.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-champagne group-hover:text-cream transition-colors pt-3 border-t border-champagne/15">
                    <span>Browse Gallery</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 6: Resources */}
            <ScrollReveal>
              <Link href="/resources" className="block rounded-2xl border border-champagne/25 bg-overlay/85 hover:border-champagne/45 hover:bg-overlay/95 shadow-xl transition-all duration-300 h-full group">
                <div className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-crest text-champagne flex items-center justify-center group-hover:bg-brand group-hover:text-cream transition-colors border border-champagne/20">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-cream group-hover:text-champagne transition-colors">
                      Official Resources &amp; Rules
                    </h3>
                    <p className="text-xs text-champagne/75 leading-relaxed">
                      Download committee study guides, moot court case problems, citation guides, and delegate kits.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-champagne group-hover:text-cream transition-colors pt-3 border-t border-champagne/15">
                    <span>Access Downloads</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* 5. Institutional Governance & Zero-Payment Disclosure */}
        <section className="p-6 sm:p-8 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-crest text-champagne flex items-center justify-center shrink-0 mt-0.5 border border-champagne/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-heading font-bold text-cream">
                Official Institutional Governance &amp; Manual Payment Notice
              </h4>
              <p className="text-xs sm:text-sm text-champagne/80 max-w-2xl leading-relaxed">
                Organized under the auspices of GIKI Student Affairs. All delegate registration fees are processed exclusively through official GIKI institutional banking channels with manual verification. Zero online commercial transactions occur on this platform.
              </p>
            </div>
          </div>
          <Link
            href="/about/faq"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-crest border border-champagne/30 text-champagne hover:bg-brand hover:text-cream text-xs font-mono font-bold transition-colors"
          >
            Payment FAQ &rarr;
          </Link>
        </section>

        {/* 6. Closing Register CTA Banner */}
        <CtaBanner variant="slab">
        <div className="text-champagne relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="absolute inset-0 bg-radial-glow-dual opacity-30 pointer-events-none" />
          <div className="relative z-10 space-y-2 text-center md:text-left max-w-xl">
            <span className="text-xs font-mono uppercase font-bold text-champagne tracking-wider">
              Delegate Applications Open
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
              Apply for GIMUN
            </Button>
            <Button variant="track-moot" href="/register?track=moot-cup">
              Register GMC Team
            </Button>
          </div>
        </div>
      </CtaBanner>
      </div>
    </div>
  );
}
