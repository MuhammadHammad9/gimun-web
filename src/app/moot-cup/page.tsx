import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
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
import { formatEventMonth } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: 'GIKI Moot Court (GMC) | Appellate Courtroom Advocacy',
  description:
    'Premier national appellate advocacy championship testing legal research, memorial drafting, and courtroom advocacy before esteemed jurists.',
  path: '/moot-cup',
  image: '/images/og/moot-cup.jpg',
}); }

export default async function MootCupOverviewPage() {
  const categories = (await getMootCategories());
  const siteConfig = (await getSiteConfig());

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. TRACK HERO SECTION (PRD §15.2 - Supreme Court Appellate Theme) */}
      <PageHero
        variant="moot"
        eyebrow={
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-champagne/20 border border-champagne/30 text-champagne shadow-xs">
            <TrackBadge track="moot-cup" size="sm" />
            <span>Track 02 • GMC Appellate Courtroom Advocacy</span>
          </div>
        }
        title={'Master the Law. Plead Your Case. Convince the Bench.'}
        accentWords={['Plead', 'Your', 'Case.']}
        description="The GIKI Moot Court (GMC) challenges aspiring advocates to analyze complex case problems, draft written arguments (memorials), and present oral submissions before a panel of experienced judges."
        actions={[
          { label: 'Register for GMC', href: '/register?track=moot-cup', variant: 'track-moot' },
          { label: 'Explore Problem Tracks', href: '/moot-cup/categories', variant: 'secondary' },
        ]}
        aside={
          <div className="glass-card-dark rounded-2xl p-6 sm:p-8 space-y-4 border border-champagne/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-champagne font-bold">
                Competition At a Glance
              </span>
              <span className="px-2 py-0.5 rounded-full bg-champagne/20 text-champagne text-[10px] font-mono font-semibold">
                {formatEventMonth(siteConfig.eventDates.start)}
              </span>
            </div>
            <h2 className="font-heading font-bold text-xl text-white">
              Advocacy Fast Facts
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-text-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
                <span><strong>Team Size:</strong> 2 to 4 members (2 Oralists + 1-2 Researchers)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
                <span><strong>Format:</strong> Dual Written Briefs (Applicant &amp; Respondent) + Knockout Courtroom Rounds</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
                <span><strong>Adjudication:</strong> Bench of retired High Court judges &amp; senior advocates</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
                <span><strong>Accolades:</strong> Champion Trophy, Best Memorial &amp; Best Oralist</span>
              </li>
            </ul>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <Link
                href="/moot-cup/rules"
                className="font-semibold text-champagne hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Rules &amp; Written Arguments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/moot-cup/clarifications"
                className="font-semibold text-text-2 hover:text-white transition-colors"
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
            <span className="text-xs font-mono uppercase tracking-widest text-champagne/80 font-bold">
              Courtroom Procedure
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text mt-1">
              How GMC Operates: From Case Problem to the Bench
            </h2>
            <p className="text-champagne/80 text-sm sm:text-base mt-2 leading-relaxed">
              Moot court simulates an appellate or constitutional judicial review proceeding. There are no witnesses or cross-examinations; advocates debate points of substantive law directly before the judges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-glass-luxury p-6 rounded-2xl border border-champagne/30 shadow-xl space-y-3 relative overflow-hidden group hover:border-champagne/60 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand/80 border border-champagne/25 flex items-center justify-center text-champagne shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-champagne/70">01</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-text">
                Factual Case Problem (Compromis)
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                Teams receive a detailed legal case problem presenting complex legal disputes across constitutional, international, or human rights law.
              </p>
            </div>

            <div className="card-glass-luxury p-6 rounded-2xl border border-champagne/30 shadow-xl space-y-3 relative overflow-hidden group hover:border-champagne/60 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand/80 border border-champagne/25 flex items-center justify-center text-champagne shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-champagne/70">02</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-text">
                Written Arguments (Memorials)
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                Draft two comprehensive legal briefs (Applicant and Respondent) following standard citation guidelines and institutional anonymity.
              </p>
            </div>

            <div className="card-glass-luxury p-6 rounded-2xl border border-champagne/30 shadow-xl space-y-3 relative overflow-hidden group hover:border-champagne/60 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand/80 border border-champagne/25 flex items-center justify-center text-champagne shadow-xs">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-champagne/70">03</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-text">
                Oral Advocacy
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
                Argue your case in high-intensity 30-minute rounds. Two oralists deliver submissions while handling spontaneous judicial questioning from senior judges.
              </p>
            </div>

            <div className="card-glass-luxury p-6 rounded-2xl border border-champagne/30 shadow-xl space-y-3 relative overflow-hidden group hover:border-champagne/60 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand/80 border border-champagne/25 flex items-center justify-center text-champagne shadow-xs">
                  <Gavel className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-champagne/70">04</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-text">
                Grand Final Bench
              </h3>
              <p className="text-xs text-champagne/80 leading-relaxed">
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
            <div className="double-bezel-inner p-8 sm:p-10 space-y-6 border-l-4 border-l-champagne">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-champagne/80 font-bold">
                    Eligibility Guidelines
                  </span>
                  <h3 className="font-heading font-bold text-2xl text-text mt-1">
                    Team Composition &amp; Institution Criteria
                  </h3>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded-full bg-champagne/20 border border-champagne/30 text-text font-bold self-start">
                  2 to 4 Advocates Per Team
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-champagne/80">
                <div className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-2">
                  <div className="font-heading font-bold text-sm text-text">Academic Standing</div>
                  <p className="text-xs leading-relaxed">Open to currently enrolled undergraduate law students (LL.B., B.A. LL.B.) and university debate societies across accredited domestic &amp; international faculties.</p>
                </div>

                <div className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-2">
                  <div className="font-heading font-bold text-sm text-text">Team Allocation</div>
                  <p className="text-xs leading-relaxed">Each team consists of two primary Oral Advocates and up to two designated Researchers. Multiple teams from the same law school or university are permitted.</p>
                </div>

                <div className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-2">
                  <div className="font-heading font-bold text-sm text-text">Strict Anonymity</div>
                  <p className="text-xs leading-relaxed">All memorial submissions and oral arguments must maintain complete institutional anonymity. Teams are assigned blind identity codes (e.g. TC-14).</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button variant="track-moot" href="/register?track=moot-cup">
                  Register Your GMC Team
                </Button>
                <Button variant="secondary" href="/moot-cup/rules">
                  View Written Argument Rules
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 4. FEE & STRICT NON-PAYMENT NOTICE (PRD §6.2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="card-glass-luxury p-8 sm:p-10 rounded-2xl border border-champagne/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-champagne/70 font-semibold">
                  Team Investment
                </span>
                <h3 className="font-heading font-bold text-2xl text-text mt-0.5">
                  Registration Package &amp; Inclusions
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-elevated/70 border border-champagne-lo/40 text-champagne">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Online Payment Gateway</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-1">
                <div className="text-xs font-mono text-champagne/70">Complete Team Fee (2–4 Members)</div>
                <div className="text-2xl font-heading font-extrabold text-champagne">
                  {siteConfig.fees?.mootCupTeam}
                </div>
                <div className="text-xs text-champagne/80">Includes oral round entries, judicial evaluation dossiers, kits &amp; social passes</div>
              </div>

              <div className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-1">
                <div className="text-xs font-mono text-champagne/70">Written Brief Evaluation</div>
                <div className="text-2xl font-heading font-extrabold text-text">
                  Detailed Feedback
                </div>
                <div className="text-xs text-champagne/80">Written scoring matrix and commentary from senior legal practitioners</div>
              </div>

              <div className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-1">
                <div className="text-xs font-mono text-champagne/70">Lodging &amp; Campus Board</div>
                <div className="text-2xl font-heading font-extrabold text-champagne">
                  Subsidized Options
                </div>
                <div className="text-xs text-champagne/80">GIKI campus residential accommodations for visiting legal teams</div>
              </div>
            </div>

            {/* Strict Non-Payment Statement (PRD §6.2) */}
            <div className="p-4 rounded-xl bg-raised/90 border border-champagne/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-champagne shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-champagne/90 leading-relaxed">
                <strong className="text-text font-semibold">Important Non-Payment Assurance:</strong>{' '}
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
            <span className="text-xs font-mono uppercase tracking-widest text-champagne/80 font-bold">
              Substantive Jurisprudence
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-cream mt-1">
              Active Moot Problem Categories
            </h2>
          </div>
          <Link
            href="/moot-cup/categories"
            className="text-xs font-mono font-semibold text-champagne hover:underline inline-flex items-center gap-1 transition-colors"
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
              actionLabel="Download Case Problem"
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
              <span className="text-xs font-mono uppercase tracking-widest text-champagne/80 font-bold">
                Step Up to the Bar
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-cream max-w-xl mx-auto">
                Ready to Argue Before Senior Judges?
              </h2>
              <p className="text-sm text-champagne/80 max-w-lg mx-auto">
                Early registration ensures timely receipt of team codes and priority access to the official clarifications process.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button variant="track-moot" size="lg" href="/register?track=moot-cup">
                  Register GMC Team
                </Button>
                <Button variant="secondary" size="lg" href="/moot-cup/rules">
                  Rules &amp; Written Arguments
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
