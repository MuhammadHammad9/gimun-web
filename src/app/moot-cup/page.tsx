import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroSection } from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/Button';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { ContentCard } from '@/components/ui/ContentCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Scale,
  Gavel,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getMootCategories, getSiteConfig } from '@/lib/content';

export const metadata: Metadata = {
  title: 'GIKI Moot Court Competition 2027 | Overview',
  description:
    'Premier national appellate advocacy championship testing legal research, memorial drafting, and courtroom advocacy before esteemed jurists.',
};

export default function MootCupOverviewPage() {
  const categories = getMootCategories();
  const siteConfig = getSiteConfig();

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. TRACK HERO SECTION (PRD §15.2) */}
      <HeroSection
        eyebrow={
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#E6F9F7] border border-[#00B4A6]/20 text-[#00B4A6]">
            <TrackBadge track="moot-cup" size="sm" />
            <span>Track 02 — Appellate Advocacy</span>
          </div>
        }
        title={
          <>
            Master the Law. <br className="hidden sm:inline" />
            <span className="text-[#00B4A6]">Plead Your Case</span>. Convince the Bench.
          </>
        }
        description="The GIKI Moot Court Competition challenges aspiring advocates to analyze complex legal compromises, file rigorous written memorials, and present oral arguments under fierce judicial questioning before senior judges."
        primaryAction={{
          label: 'Register for Moot Cup',
          href: '/register?track=moot-cup',
          variant: 'track-moot',
        }}
        secondaryAction={{
          label: 'Explore Problem Tracks',
          href: '/moot-cup/categories',
        }}
        sideContent={
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#00B4A6] font-bold">
                Competition At a Glance
              </span>
              <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
                Advocacy Fast Facts
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-[#5A5A6E]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0 mt-0.5" />
                  <span><strong>Team Size:</strong> 2 to 4 members (2 Oralists + 1-2 Researchers)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0 mt-0.5" />
                  <span><strong>Format:</strong> Dual Memorials (Applicant &amp; Respondent) + Knockout Oral Rounds</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0 mt-0.5" />
                  <span><strong>Adjudication:</strong> Bench of retired High Court judges &amp; senior advocates</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0 mt-0.5" />
                  <span><strong>Accolades:</strong> Champion Trophy, Best Memorial &amp; Best Oralist</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href="/moot-cup/rules"
                  className="text-xs font-semibold text-[#1E2A78] hover:text-[#00B4A6] inline-flex items-center gap-1.5"
                >
                  <span>Memorial &amp; Oral Rules</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/moot-cup/clarifications"
                  className="text-xs font-semibold text-[#00B4A6] hover:underline"
                >
                  Clarifications Log
                </Link>
              </div>
            </div>
          </div>
        }
      />

      {/* 2. FORMAT EXPLAINER (PRD §15.2 - Courtroom mechanics) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
              Courtroom Procedure
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E] mt-1">
              How Does the Moot Cup Work?
            </h2>
            <p className="text-[#5A5A6E] text-sm sm:text-base mt-2 leading-relaxed">
              Moot court simulates an appellate or constitutional judicial review proceeding. There are no witnesses or cross-examinations; advocates debate points of substantive law directly before the judges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#00B4A6] shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                1. Compromis &amp; Memorials
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                Teams receive a factual Compromis raising novel legal questions. Your team drafts two written memorials: one representing the Applicant and one representing the Respondent.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#00B4A6] shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                2. Oral Pleadings
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                Each round grants 30 minutes total per team. Two oral advocates present substantive submissions while actively answering probing, spontaneous questions from the judicial bench.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#00B4A6] shadow-xs">
                <Gavel className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                3. Knockout Rounds &amp; Grand Final
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                Following preliminary rounds, the top 8 scoring teams advance through single-elimination Quarter-Finals and Semi-Finals to compete on the AHA Auditorium Main Stage before a full judicial bench.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. ELIGIBILITY & TEAM COMPOSITION (PRD §10.2, §15.2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="double-bezel">
            <div className="double-bezel-inner p-8 sm:p-10 space-y-6 border-l-4 border-l-[#00B4A6]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
                    Eligibility Guidelines
                  </span>
                  <h3 className="font-heading font-bold text-2xl text-[#1A1A2E] mt-1">
                    Team Composition &amp; Institution Criteria
                  </h3>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-bold self-start">
                  2 to 4 Advocates Per Team
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#5A5A6E]">
                <div className="p-4 rounded-xl bg-white border border-gray-200/80 space-y-2">
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Academic Standing</div>
                  <p className="text-xs">Open to currently enrolled undergraduate law students (LL.B., B.A. LL.B.) and university debate societies across accredited domestic &amp; international faculties.</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-200/80 space-y-2">
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Team Allocation</div>
                  <p className="text-xs">Each team consists of two primary Oral Advocates and up to two designated Researchers. Multiple teams from the same law school or university are permitted.</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-200/80 space-y-2">
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Strict Anonymity</div>
                  <p className="text-xs">All memorial submissions and oral arguments must maintain complete institutional anonymity. Teams are assigned blind identity codes (e.g. TC-14).</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button variant="track-moot" href="/register?track=moot-cup">
                  Register Your Moot Team
                </Button>
                <Button variant="secondary" href="/moot-cup/rules">
                  View Memorial Format Rules
                </Button>
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
                  Team Investment
                </span>
                <h3 className="font-heading font-bold text-2xl text-[#1A1A2E] mt-0.5">
                  Registration Package &amp; Inclusions
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Online Payment Gateway</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                <div className="text-xs font-mono text-[#5A5A6E]">Complete Team Fee (2–4 Members)</div>
                <div className="text-2xl font-heading font-extrabold text-[#00B4A6]">
                  {siteConfig.fees?.mootCupTeam || 'PKR 12,000'}
                </div>
                <div className="text-xs text-[#5A5A6E]">Includes oral round entries, judicial evaluation dossiers, kits &amp; social passes</div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                <div className="text-xs font-mono text-[#5A5A6E]">Memorial Evaluation</div>
                <div className="text-2xl font-heading font-extrabold text-[#1A1A2E]">
                  Detailed Feedback
                </div>
                <div className="text-xs text-[#5A5A6E]">Written scoring matrix and commentary from senior legal practitioners</div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                <div className="text-xs font-mono text-[#5A5A6E]">Lodging &amp; Campus Board</div>
                <div className="text-2xl font-heading font-extrabold text-[#1E2A78]">
                  Subsidized Options
                </div>
                <div className="text-xs text-[#5A5A6E]">GIKI campus residential accommodations for visiting legal teams</div>
              </div>
            </div>

            {/* Strict Non-Payment Statement (PRD §6.2) */}
            <div className="p-4 rounded-xl bg-[#E6F9F7] border border-[#00B4A6]/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#00B4A6] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-[#5A5A6E]">
                <strong className="text-[#1A1A2E] font-semibold">Important Non-Payment Assurance:</strong>{' '}
                Submitting this application does not charge your team anything online. The Moot Court Convening Committee will examine your team roster and email team credentials, Team Code assignment, and official payment confirmation instructions directly to your designated contact person.
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 5. PROBLEM CATEGORIES PREVIEW (PRD §16.2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
              Substantive Jurisprudence
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E] mt-1">
              Active Moot Problem Categories
            </h2>
          </div>
          <Link
            href="/moot-cup/categories"
            className="text-xs font-mono font-semibold text-[#00B4A6] hover:underline inline-flex items-center gap-1"
          >
            <span>Explore All Categories &amp; Propositions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <ContentCard
              key={cat.id}
              track="moot-cup"
              title={cat.name}
              description={cat.description}
              eyebrow={cat.areaOfLaw}
              meta={`Last Updated: ${cat.lastUpdated}`}
              actionHref="/moot-cup/categories"
              actionLabel="Download Compromis"
              updatedFlag={true}
            />
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <div className="double-bezel">
            <div className="double-bezel-inner p-8 sm:p-12 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
                Step Up to the Bar
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#1A1A2E] max-w-xl mx-auto">
                Ready to Argue Before Senior Judges?
              </h2>
              <p className="text-sm text-[#5A5A6E] max-w-lg mx-auto">
                Early registration ensures timely receipt of team codes and priority access to the official clarifications process.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button variant="track-moot" size="lg" href="/register?track=moot-cup">
                  Register Moot Team
                </Button>
                <Button variant="secondary" size="lg" href="/moot-cup/rules">
                  Rules &amp; Memorial Specs
                </Button>
                <Button variant="ghost" size="lg" href="/moot-cup/clarifications">
                  Clarifications Log
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
