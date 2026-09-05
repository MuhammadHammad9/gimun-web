import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroSection } from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/Button';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { ContentCard } from '@/components/ui/ContentCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Globe2,
  Users2,
  Calendar,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { getCommittees, getSiteConfig } from '@/lib/content';

export const metadata: Metadata = {
  title: 'GIMUN Overview | GIKI Model United Nations 2027',
  description:
    'Experience premier diplomatic negotiation, parliamentary debate, and crisis simulation at GIKI Model United Nations 2027.',
};

export default function GimunOverviewPage() {
  const committees = getCommittees();
  const siteConfig = getSiteConfig();

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. TRACK HERO SECTION (PRD §15.2) */}
      <HeroSection
        eyebrow={
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#FFF0E8] border border-[#FF6B35]/20 text-[#FF6B35]">
            <TrackBadge track="gimun" size="sm" />
            <span>Track 01 — Multilateral Diplomacy</span>
          </div>
        }
        title={
          <>
            Simulate Diplomacy. <br className="hidden sm:inline" />
            <span className="text-[#FF6B35]">Defend Sovereignty</span>. Lead Nations.
          </>
        }
        description="The GIKI Model United Nations (GIMUN) convenes Pakistan's brightest student delegates to debate global crises, draft multilateral treaties, and master parliamentary diplomacy across specialized UN bodies."
        primaryAction={{
          label: 'Register for GIMUN',
          href: '/register?track=gimun',
          variant: 'track-gimun',
        }}
        secondaryAction={{
          label: 'Browse Committees',
          href: '/gimun/committees',
        }}
        sideContent={
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FF6B35] font-bold">
                At a Glance
              </span>
              <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
                Diplomatic Fast Facts
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-[#5A5A6E]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <span><strong>Format:</strong> Classical HMUN & crisis simulation protocols</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <span><strong>Participation:</strong> Individual delegates or head-led institutional delegations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <span><strong>Recognition:</strong> Best Delegate, Outstanding Delegate &amp; Honorary Mentions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <span><strong>Venue:</strong> GIKI Campus Academic Blocks &amp; Main Auditorium</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href="/gimun/rules"
                  className="text-xs font-semibold text-[#1E2A78] hover:text-[#FF6B35] inline-flex items-center gap-1.5"
                >
                  <span>Read Rules of Procedure (RoP)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        }
      />

      {/* 2. FORMAT EXPLAINER (PRD §15.2 - Jargon-free) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold">
              Conference Mechanics
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E] mt-1">
              What Happens at GIMUN?
            </h2>
            <p className="text-[#5A5A6E] text-sm sm:text-base mt-2 leading-relaxed">
              Never attended a Model United Nations before? GIMUN is structured so that both first-time debaters and experienced veterans can participate effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#FF6B35] shadow-xs">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                1. Country Assignment
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                You are assigned a country portfolio within a specific committee. Your objective is to advocate for that sovereign state&apos;s real foreign policy interests—not your personal viewpoints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#FF6B35] shadow-xs">
                <Users2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                2. Caucusing &amp; Blocs
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                Through formal speeches and informal unmoderated negotiations, you coordinate with regional allies and persuade rival delegations to form a collaborative voting bloc.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#FF6B35] shadow-xs">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                3. Resolutions &amp; Voting
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                Your bloc authors a Draft Resolution featuring actionable operative clauses. The committee debates amendments and holds a formal recorded vote to adopt the final treaty.
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
              <div className="double-bezel-inner p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF6B35] font-bold">
                    Participation Path A
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                    Individual
                  </span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-[#1A1A2E]">
                  Individual Delegate Entry
                </h3>
                <p className="text-sm text-[#5A5A6E] leading-relaxed">
                  Ideal for independent delegates, high school seniors, and university scholars seeking solo committee allocation without requiring a registered institution delegation.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-[#1A1A2E] font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />
                    <span>Select top 3 committee preferences</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />
                    <span>Full access to delegate socials &amp; gala</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />
                    <span>Eligible for all individual committee awards</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-gray-100">
                  <Button variant="track-gimun" href="/register?track=gimun&type=individual">
                    Register as Individual Delegate
                  </Button>
                </div>
              </div>
            </div>

            {/* Institutional Delegation Card */}
            <div className="double-bezel">
              <div className="double-bezel-inner p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#1E2A78] font-bold">
                    Participation Path B
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Group Delegation
                  </span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-[#1A1A2E]">
                  Institutional Delegation
                </h3>
                <p className="text-sm text-[#5A5A6E] leading-relaxed">
                  Head Delegates and faculty advisors can register entire institutional squads in a single form submission, competing for the coveted Best Delegation Trophy.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-[#1A1A2E] font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1E2A78]" />
                    <span>Unified delegation registration in one flow</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1E2A78]" />
                    <span>Discounted tier rates for teams of 5+ delegates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1E2A78]" />
                    <span>Contend for the Best Delegation Trophy</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-gray-100">
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
          <div className="p-8 sm:p-10 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5A5A6E] font-semibold">
                  Investment &amp; Inclusions
                </span>
                <h3 className="font-heading font-bold text-2xl text-[#1A1A2E] mt-0.5">
                  Registration Fees &amp; Inclusions
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Online Surcharges</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                <div className="text-xs font-mono text-[#5A5A6E]">Individual Delegate</div>
                <div className="text-2xl font-heading font-extrabold text-[#1A1A2E]">
                  {siteConfig.fees?.gimunIndividual || 'PKR 4,500'}
                </div>
                <div className="text-xs text-[#5A5A6E]">Includes delegate kit, lanyard, lunch &amp; social pass</div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                <div className="text-xs font-mono text-[#5A5A6E]">Delegation Member Rate</div>
                <div className="text-2xl font-heading font-extrabold text-[#FF6B35]">
                  {siteConfig.fees?.gimunDelegationPerDelegate || 'PKR 4,000'}
                </div>
                <div className="text-xs text-[#5A5A6E]">Per delegate for registered institutional teams</div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                <div className="text-xs font-mono text-[#5A5A6E]">On-Campus Accommodation</div>
                <div className="text-2xl font-heading font-extrabold text-[#1E2A78]">
                  Available on Request
                </div>
                <div className="text-xs text-[#5A5A6E]">Hostel lodging at GIKI campus for outstation attendees</div>
              </div>
            </div>

            {/* Strict Non-Payment Statement (PRD §6.2) */}
            <div className="p-4 rounded-xl bg-[#FFF0E8] border border-[#FF6B35]/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF6B35] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-[#5A5A6E]">
                <strong className="text-[#1A1A2E] font-semibold">Important Non-Payment Assurance:</strong>{' '}
                Submitting the online registration form does not charge you anything. The Organizing Committee will review your applicant profile and committee preferences, and reach out via email within 3 business days with your official acceptance dossier and verified institutional payment instructions.
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 5. COMMITTEES PREVIEW (PRD §16.1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold">
              Substantive Bodies
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E] mt-1">
              GIMUN 2027 Committee Roster
            </h2>
          </div>
          <Link
            href="/gimun/committees"
            className="text-xs font-mono font-semibold text-[#FF6B35] hover:underline inline-flex items-center gap-1"
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
              actionLabel="Explore Committee Dossier"
            />
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <div className="double-bezel">
            <div className="double-bezel-inner p-8 sm:p-12 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold">
                Step into the Shoes of a Diplomat
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#1A1A2E] max-w-xl mx-auto">
                Ready to Represent Your Sovereign Nation?
              </h2>
              <p className="text-sm text-[#5A5A6E] max-w-lg mx-auto">
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
