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
import { constructMetadata } from '@/lib/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'GIKI Moot Court (GMC) | Appellate Courtroom Advocacy',
  description:
    'Premier national appellate advocacy championship testing legal research, memorial drafting, and courtroom advocacy before esteemed jurists.',
  path: '/moot-cup',
});

export default function MootCupOverviewPage() {
  const categories = getMootCategories();
  const siteConfig = getSiteConfig();

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. TRACK HERO SECTION (PRD §15.2 - Supreme Court Appellate Theme) */}
      <HeroSection
        variant="moot"
        eyebrow={
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#00B4A6]/20 border border-[#00B4A6]/30 text-[#5EEAD4] shadow-xs">
            <TrackBadge track="moot-cup" size="sm" />
            <span>Track 02 • GMC Appellate Courtroom Advocacy</span>
          </div>
        }
        title={
          <>
            Master the Law. <br className="hidden sm:inline" />
            <span className="text-gradient-teal">Plead Your Case</span>. Convince the Bench.
          </>
        }
        description="The GIKI Moot Court (GMC) challenges aspiring advocates to analyze complex legal compromises, file rigorous written memorials, and present oral arguments under fierce judicial questioning before senior judges."
        primaryAction={{
          label: 'Register for GMC',
          href: '/register?track=moot-cup',
          variant: 'track-moot',
        }}
        secondaryAction={{
          label: 'Explore Problem Tracks',
          href: '/moot-cup/categories',
        }}
        sideContent={
          <div className="glass-card-dark rounded-2xl p-6 sm:p-8 space-y-4 border border-[#00B4A6]/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#5EEAD4] font-bold">
                Competition At a Glance
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#00B4A6]/20 text-[#5EEAD4] text-[10px] font-mono font-semibold">
                March 2027
              </span>
            </div>
            <h3 className="font-heading font-bold text-xl text-white">
              Advocacy Fast Facts
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
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
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <Link
                href="/moot-cup/rules"
                className="font-semibold text-[#5EEAD4] hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Memorial &amp; Oral Rules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/moot-cup/clarifications"
                className="font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Clarifications Log
              </Link>
            </div>
          </div>
        }
      />

      {/* 2. FORMAT EXPLAINER (PRD §15.2 - Courtroom mechanics 4-Step Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
              Courtroom Procedure
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E] mt-1">
              How GMC Operates: From Compromis to Bench
            </h2>
            <p className="text-[#5A5A6E] text-sm sm:text-base mt-2 leading-relaxed">
              Moot court simulates an appellate or constitutional judicial review proceeding. There are no witnesses or cross-examinations; advocates debate points of substantive law directly before the judges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#00B4A6]/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#00B4A6]/10 flex items-center justify-center text-[#00B4A6] shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-[#00B4A6]">01</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                Factual Compromis
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Teams receive a detailed, fictitious Compromis raising novel legal controversies across international treaties, human rights conventions, or constitutional law.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#00B4A6]/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#1E2A78]/10 flex items-center justify-center text-[#1E2A78] shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-[#1E2A78]">02</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                Dual Memorials
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Draft two comprehensive 25-page legal briefs (Applicant and Respondent) adhering strictly to OSCOLA citation standards and institutional anonymity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#00B4A6]/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 shadow-xs">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-teal-600">03</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                Oral Advocacy
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Argue your case in high-intensity 30-minute rounds. Two oralists deliver submissions while handling spontaneous judicial questioning from senior judges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#00B4A6]/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Gavel className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600">04</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                Grand Final Bench
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Top teams advance through Quarter and Semi-Finals to argue before an expanded panel of High Court jurists on the Aga Khan Auditorium Main Stage.
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
                <div className="p-5 rounded-xl bg-[#F8F8FC] border border-gray-200/80 space-y-2">
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Academic Standing</div>
                  <p className="text-xs leading-relaxed">Open to currently enrolled undergraduate law students (LL.B., B.A. LL.B.) and university debate societies across accredited domestic &amp; international faculties.</p>
                </div>

                <div className="p-5 rounded-xl bg-[#F8F8FC] border border-gray-200/80 space-y-2">
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Team Allocation</div>
                  <p className="text-xs leading-relaxed">Each team consists of two primary Oral Advocates and up to two designated Researchers. Multiple teams from the same law school or university are permitted.</p>
                </div>

                <div className="p-5 rounded-xl bg-[#F8F8FC] border border-gray-200/80 space-y-2">
                  <div className="font-heading font-bold text-sm text-[#1A1A2E]">Strict Anonymity</div>
                  <p className="text-xs leading-relaxed">All memorial submissions and oral arguments must maintain complete institutional anonymity. Teams are assigned blind identity codes (e.g. TC-14).</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button variant="track-moot" href="/register?track=moot-cup">
                  Register Your GMC Team
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
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-6">
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
              <div className="p-5 rounded-xl bg-[#F8F8FC] border border-gray-200/80 space-y-1">
                <div className="text-xs font-mono text-[#5A5A6E]">Complete Team Fee (2–4 Members)</div>
                <div className="text-2xl font-heading font-extrabold text-[#00B4A6]">
                  {siteConfig.fees?.mootCupTeam || 'PKR 12,000'}
                </div>
                <div className="text-xs text-[#5A5A6E]">Includes oral round entries, judicial evaluation dossiers, kits &amp; social passes</div>
              </div>

              <div className="p-5 rounded-xl bg-[#F8F8FC] border border-gray-200/80 space-y-1">
                <div className="text-xs font-mono text-[#5A5A6E]">Memorial Evaluation</div>
                <div className="text-2xl font-heading font-extrabold text-[#1A1A2E]">
                  Detailed Feedback
                </div>
                <div className="text-xs text-[#5A5A6E]">Written scoring matrix and commentary from senior legal practitioners</div>
              </div>

              <div className="p-5 rounded-xl bg-[#F8F8FC] border border-gray-200/80 space-y-1">
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
                Submitting this application does not charge your team anything online. The GMC Convening Committee will examine your team roster and email team credentials, Team Code assignment, and official payment confirmation instructions directly to your designated contact person.
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
                  Register GMC Team
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
