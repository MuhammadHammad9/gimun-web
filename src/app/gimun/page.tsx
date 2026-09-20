import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { ContentCard } from '@/components/ui/ContentCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Globe2,
  Users2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getCommittees, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { formatEventMonth, getEventYear } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: 'GIMUN Track | Model United Nations Diplomacy',
  description: `Experience premier diplomatic negotiation, parliamentary debate, and crisis simulation at GIKI Model United Nations ${getEventYear(await getSiteConfig())}.`,
  path: '/gimun',
  image: '/images/og/gimun.jpg',
}); }

export default async function GimunOverviewPage() {
  const committees = (await getCommittees());
  const siteConfig = (await getSiteConfig());

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. TRACK HERO SECTION (PRD §15.2 - Dark Diplomatic Command Center) */}
      <PageHero
        variant="gimun"
        eyebrow={
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-brand/20 border border-brand/30 text-champagne shadow-xs">
            <TrackBadge track="gimun" size="sm" />
            <span>Track 01 • Multilateral Diplomacy & Statecraft</span>
          </div>
        }
        title={'Simulate Diplomacy. Defend Sovereignty. Lead Nations.'}
        accentWords={['Defend', 'Sovereignty.']}
        description="The GIKI Model United Nations (GIMUN) convenes Pakistan's brightest student delegates to debate global crises, draft multilateral treaties, and master parliamentary diplomacy across specialized UN bodies."
        actions={[
          { label: 'Register for GIMUN', href: '/register?track=gimun', variant: 'track-gimun' },
          { label: 'Browse Committees', href: '/gimun/committees', variant: 'secondary' },
        ]}
        aside={
          <div className="glass-card-dark rounded-2xl p-6 sm:p-8 space-y-4 border border-brand/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-champagne font-bold">
                At a Glance
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand/40 text-champagne text-[10px] font-mono font-semibold">
                {formatEventMonth(siteConfig.eventDates.start)}
              </span>
            </div>
            <h2 className="font-heading font-bold text-xl text-white">
              Diplomatic Fast Facts
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-text-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <span><strong>Format:</strong> Standard Model UN parliamentary debate &amp; crisis simulations</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <span><strong>Participation:</strong> Individual delegates or faculty-led institutional delegations</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <span><strong>Chambers:</strong> UNSC, DISEC, UNHRC &amp; PNA Crisis</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <span><strong>Recognition:</strong> Best Delegate, Outstanding Delegate &amp; Delegation Trophy</span>
              </li>
            </ul>
            <div className="pt-2 border-t border-white/10">
              <Link
                href="/gimun/rules"
                className="text-xs font-semibold text-champagne hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Read Rules of Procedure (RoP)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        }
      />

      {/* 2. FORMAT EXPLAINER (PRD §15.2 - Step-by-Step Modern Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-crimson-hi font-bold">
              Conference Mechanics
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text mt-1">
              How GIMUN Operates: The 4-Stage Cycle
            </h2>
            <p className="text-champagne/80 text-sm sm:text-base mt-2 leading-relaxed">
              Never attended a Model United Nations before? GIMUN is structured so that both first-time debaters and experienced veterans can participate effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-glass-luxury p-6 rounded-2xl border border-champagne/30 shadow-md space-y-3 relative overflow-hidden group hover:border-champagne/60 transition-colors backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-champagne/15 border border-champagne/30 flex items-center justify-center text-champagne shadow-xs">
                  <Globe2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-champagne">01</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-text">
                Country Assignment
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                You are assigned a country to represent within your committee. Your task is to research and champion that nation&apos;s foreign policy and real-world interests.
              </p>
            </div>

            <div className="card-glass-luxury p-6 rounded-2xl border border-champagne/30 shadow-md space-y-3 relative overflow-hidden group hover:border-champagne/60 transition-colors backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-champagne/15 border border-champagne/30 flex items-center justify-center text-champagne shadow-xs">
                  <Users2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-champagne">02</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-text">
                Formal &amp; Caucusing
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                Deliver formal policy speeches from the Speaker&apos;s List, then initiate Moderated Caucuses to debate specific sub-issues under strict time limits.
              </p>
            </div>

            <div className="card-glass-luxury p-6 rounded-2xl border border-champagne/30 shadow-md space-y-3 relative overflow-hidden group hover:border-champagne/60 transition-colors backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-champagne/15 border border-champagne/30 flex items-center justify-center text-champagne shadow-xs">
                  <Users2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-champagne">03</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-text">
                Bloc Building
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                Step off the podium during unmoderated sessions to negotiate with regional allies, compromise with rival factions, and build a unified voting majority.
              </p>
            </div>

            <div className="card-glass-luxury p-6 rounded-2xl border border-champagne/30 shadow-md space-y-3 relative overflow-hidden group hover:border-champagne/60 transition-colors backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-champagne/15 border border-champagne/30 flex items-center justify-center text-champagne shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-champagne">04</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-text">
                Draft Resolutions
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                Co-sponsor and introduce a comprehensive Draft Resolution. Defend its operative clauses during amendments and carry it through final plenary voting.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. ELIGIBILITY & REGISTRATION OPTIONS (PRD §10.1, §15.2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Individual Delegate Card */}
            <div className="double-bezel">
              <div className="double-bezel-inner p-8 space-y-4 border-l-4 border-l-champagne">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-champagne font-bold">
                    Participation Path A
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-champagne/20 text-champagne font-semibold border border-champagne/30">
                    Individual
                  </span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-cream">
                  Individual Delegate Entry
                </h3>
                <p className="text-sm text-champagne/80 leading-relaxed">
                  Ideal for independent delegates, high school seniors, and university scholars seeking solo committee allocation without requiring a registered institution delegation.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-cream font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-champagne" />
                    <span>Select top 3 committee preferences</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-champagne" />
                    <span>Full access to delegate socials &amp; gala</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-champagne" />
                    <span>Eligible for all individual committee awards</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-champagne/20">
                  <Button variant="track-gimun" href="/register?track=gimun&type=individual">
                    Register as Individual Delegate
                  </Button>
                </div>
              </div>
            </div>

            {/* Institutional Delegation Card */}
            <div className="double-bezel">
              <div className="double-bezel-inner p-8 space-y-4 border-l-4 border-l-champagne">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-champagne font-bold">
                    Participation Path B
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-champagne/20 text-champagne font-semibold border border-champagne/30">
                    Group Delegation
                  </span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-cream">
                  Institutional Delegation
                </h3>
                <p className="text-sm text-champagne/80 leading-relaxed">
                  Head Delegates and faculty advisors can register entire institutional squads in a single form submission, competing for the coveted Best Delegation Trophy.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-cream font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-champagne" />
                    <span>Unified delegation registration in one flow</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-champagne" />
                    <span>Discounted tier rates for teams of 5+ delegates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-champagne" />
                    <span>Contend for the Best Delegation Trophy</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-champagne/20">
                  <Button variant="secondary" href="/register?track=gimun&type=delegation">
                    Register Group Delegation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 4. FEE & STRICT NON-PAYMENT NOTICE (PRD §6.2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="card-glass-luxury p-8 sm:p-10 rounded-2xl border border-champagne/30 shadow-xl space-y-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-champagne/70 font-semibold">
                  Investment &amp; Inclusions
                </span>
                <h3 className="font-heading font-bold text-2xl text-text mt-0.5">
                  Registration Fees &amp; Inclusions
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-champagne/20 text-champagne border border-champagne/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Online Surcharges</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-1">
                <div className="text-xs font-mono text-champagne/70">Individual Delegate</div>
                <div className="text-2xl font-heading font-extrabold text-text">
                  {siteConfig.fees?.gimunIndividual}
                </div>
                <div className="text-xs text-champagne/70">Includes delegate kit, lanyard, lunch &amp; social pass</div>
              </div>

              <div className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-1">
                <div className="text-xs font-mono text-champagne/70">Delegation Member Rate</div>
                <div className="text-2xl font-heading font-extrabold text-champagne">
                  {siteConfig.fees?.gimunDelegationPerDelegate}
                </div>
                <div className="text-xs text-champagne/70">Per delegate for registered institutional teams</div>
              </div>

              <div className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-1">
                <div className="text-xs font-mono text-champagne/70">On-Campus Accommodation</div>
                <div className="text-2xl font-heading font-extrabold text-champagne">
                  Available on Request
                </div>
                <div className="text-xs text-champagne/70">Hostel lodging at GIKI campus for outstation attendees</div>
              </div>
            </div>

            {/* Strict Non-Payment Statement (PRD §6.2) */}
            <div className="p-4 rounded-xl bg-raised/90 border border-champagne/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-champagne shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-champagne/90 leading-relaxed">
                <strong className="text-text font-semibold">Important Non-Payment Assurance:</strong>{' '}
                Submitting the online registration form does not charge you anything. The Organizing Committee will review your applicant profile and committee preferences, and reach out via email with your official acceptance package and verified payment instructions.
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 5. COMMITTEES PREVIEW (PRD §16.1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-champagne font-bold">
              Substantive Bodies
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-cream mt-1">
              GIMUN {getEventYear(await getSiteConfig())} Committee Roster
            </h2>
          </div>
          <Link
            href="/gimun/committees"
            className="text-xs font-mono font-semibold text-champagne hover:underline inline-flex items-center gap-1"
          >
            <span>View All Committees &amp; Country Matrices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {committees.map((com) => (
            <ContentCard
              key={com.id}
              track="gimun"
              title={com.name}
              description={com.shortDescription}
              eyebrow={com.type.replace('-', ' ')}
              meta={`Capacity: ${com.capacity ? `${com.capacity} Delegates` : 'Open'} • ${com.countryList.length} Country Portfolios`}
              actionHref={`/gimun/committees/${com.slug}`}
              actionLabel="View Committee Details"
            />
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <div className="double-bezel">
            <div className="double-bezel-inner p-8 sm:p-12 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-champagne font-bold">
                Step into the Shoes of a Diplomat
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-cream max-w-xl mx-auto">
                Ready to Represent Your Country?
              </h2>
              <p className="text-sm text-champagne/80 max-w-lg mx-auto">
                Registrations are processed on a rolling priority basis. Early submissions receive priority committee and country preferences.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button variant="track-gimun" size="lg" href="/register?track=gimun">
                  Register for GIMUN
                </Button>
                <Button variant="secondary" size="lg" href="/gimun/rules">
                  Rules of Procedure
                </Button>
                <Button variant="ghost" size="lg" href="/resources">
                  Download Background Guides
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
