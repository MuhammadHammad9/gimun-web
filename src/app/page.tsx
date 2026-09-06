import React from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/Button';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { ContentCard } from '@/components/ui/ContentCard';
import { SponsorStrip } from '@/components/ui/SponsorStrip';
import { CountdownChip } from '@/components/ui/CountdownChip';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDateRange } from '@/lib/utils';
import {
  getSiteConfig,
  getAnnouncements,
  getCommittees,
  getProblemCategories,
  getSponsors,
} from '@/lib/content';

export default function Home() {
  const siteConfig = getSiteConfig();
  const announcements = getAnnouncements();
  const committees = getCommittees();
  const mootCategories = getProblemCategories();
  const sponsors = getSponsors();

  const latestAnnouncement = announcements.find((a) => a.pinnedFlag) || announcements[0];

  return (
    <div className="space-y-20 sm:space-y-28 pb-24">
      {/* 1. HERO SECTION (PRD §15.1 - Asymmetric, Fluid Typography, Dual CTAs) */}
      <HeroSection
        eyebrow={
          <div className="inline-flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-white border border-gray-200/80 shadow-xs text-[#1E2A78]">
              <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
              <span>
                {formatDateRange(siteConfig?.eventDates?.start, siteConfig?.eventDates?.end)} •{' '}
                {siteConfig?.venue?.split(',')[0] || 'GIKI Campus'}
              </span>
            </div>
            <CountdownChip
              startDate={siteConfig?.eventDates?.start || '2027-03-18'}
              endDate={siteConfig?.eventDates?.end || '2027-03-21'}
            />
          </div>
        }
        title={
          <>
            Where <span className="text-[#FF6B35]">Diplomacy</span> Meets the{' '}
            <span className="text-[#00B4A6]">Courtroom</span>.
          </>
        }
        description="Two concurrent flagship national student competitions hosted under one authoritative platform at the Ghulam Ishaq Khan Institute. Engage in multilateral negotiation across UN-style bodies, or make your legal case before a bench of senior jurists."
        primaryAction={{
          label: 'Register for GIMUN',
          href: '/register?track=gimun',
          variant: 'track-gimun',
        }}
        secondaryAction={{
          label: 'Register for Moot Cup',
          href: '/register?track=moot-cup',
        }}
        sideContent={
          <div className="space-y-4">
            {/* GIMUN Quick Card */}
            <div className="double-bezel transition-all hover:translate-y-[-2px]">
              <div className="double-bezel-inner p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <TrackBadge track="gimun" />
                  <span className="text-xs font-mono text-[#5A5A6E] font-medium">4 Committees</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                  Model United Nations (GIMUN)
                </h3>
                <p className="text-sm text-[#5A5A6E] leading-relaxed">
                  Simulate multilateral diplomacy, draft binding resolutions, and represent sovereign interests across crisis and general assembly organs.
                </p>
                <div className="pt-2">
                  <Link
                    href="/gimun"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6B35] hover:underline"
                  >
                    <span>Explore GIMUN Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Moot Cup Quick Card */}
            <div className="double-bezel transition-all hover:translate-y-[-2px]">
              <div className="double-bezel-inner p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <TrackBadge track="moot-cup" />
                  <span className="text-xs font-mono text-[#5A5A6E] font-medium">3 Problem Tracks</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                  GIKI National Moot Cup
                </h3>
                <p className="text-sm text-[#5A5A6E] leading-relaxed">
                  Rigorous appellate advocacy before panels of esteemed judges. Draft comprehensive memorials and present oral pleadings under pressure.
                </p>
                <div className="pt-2">
                  <Link
                    href="/moot-cup"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00B4A6] hover:underline"
                  >
                    <span>Explore Moot Cup Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* 2. DUAL EVENT INTRODUCTION (PRD §15.1 - Bento Grid & Visual Parity) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1E2A78] font-bold">
              Dual Flagship Structure
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E] mt-1">
              Two Distinct Arenas of Discourse, One Historic Campus
            </h2>
            <p className="text-[#5A5A6E] text-sm sm:text-base mt-2 max-w-3xl">
              Both events operate concurrently with equal prestige, shared social galas, and dedicated adjudicators. Choose your track or field dual delegations.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* GIMUN Section (7 cols) */}
          <div className="lg:col-span-7">
            <ScrollReveal delay={0.1}>
              <div className="double-bezel h-full">
                <div className="double-bezel-inner p-8 flex flex-col justify-between h-full border-l-4 border-l-[#FF6B35]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <TrackBadge track="gimun" />
                      <span className="text-xs font-mono text-[#5A5A6E]">Diplomatic Simulation</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E]">
                      GIMUN 2027: Multilateral Statecraft
                    </h3>
                    <p className="text-[#5A5A6E] text-sm sm:text-base leading-relaxed">
                      Delegates embody diplomats representing member states across the UN Security Council, DISEC, UNHRC, and the Pakistan National Assembly Crisis. Develop persuasive speaking, draft working papers, form multilateral voting blocs, and navigate fast-breaking global developments.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-[#1A1A2E] font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                        <span>UNSC, DISEC & Crisis Organs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                        <span>Individual & Delegation Entry</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                        <span>Experienced Dais Adjudicators</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                        <span>Pre-Conference Background Guides</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8 mt-6 border-t border-gray-100 flex flex-wrap items-center gap-4">
                    <Button variant="track-gimun" href="/gimun">
                      GIMUN Overview & Rules
                    </Button>
                    <Button variant="ghost" href="/gimun/committees">
                      Browse Committees →
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Moot Cup Section (5 cols) */}
          <div className="lg:col-span-5">
            <ScrollReveal delay={0.2}>
              <div className="double-bezel h-full">
                <div className="double-bezel-inner p-8 flex flex-col justify-between h-full border-l-4 border-l-[#00B4A6]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <TrackBadge track="moot-cup" />
                      <span className="text-xs font-mono text-[#5A5A6E]">Judicial Advocacy</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E]">
                      GIKI Moot Cup: Appellate Trial
                    </h3>
                    <p className="text-[#5A5A6E] text-sm sm:text-base leading-relaxed">
                      A high-stakes legal tournament where 2-to-4 member teams analyze complex problem propositions (Compromis) and argue both Applicant and Respondent positions before senior advocates and retired judges.
                    </p>
                    <ul className="space-y-2.5 pt-2 text-xs text-[#1A1A2E] font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0" />
                        <span>Memorial Formatting & Rigorous Citations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0" />
                        <span>Public International & Constitutional Law</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0" />
                        <span>Live Clarifications Process</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8 mt-6 border-t border-gray-100 flex flex-wrap items-center gap-4">
                    <Button variant="track-moot" href="/moot-cup">
                      Moot Cup Overview
                    </Button>
                    <Button variant="ghost" href="/moot-cup/categories">
                      View Problem Tracks →
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. KEY DATES & TIMELINE (PRD §15.1 - Unified Data Source) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="double-bezel">
            <div className="double-bezel-inner p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#1E2A78] font-bold">
                    Official Roadmap
                  </span>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#1A1A2E] mt-1">
                    Key Dates & Critical Deadlines
                  </h2>
                </div>
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1E2A78] hover:underline"
                >
                  <span>Full Day-by-Day Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#5A5A6E]">
                    <span>Phase 01</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Active</span>
                  </div>
                  <div className="font-heading font-bold text-lg text-[#1A1A2E]">Early Bird Open</div>
                  <div className="text-xs font-mono text-[#FF6B35] font-semibold">
                    Deadline: {new Date(siteConfig?.registrationDeadlines?.gimun || '2027-02-15').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <p className="text-xs text-[#5A5A6E]">Priority committee preference & delegation discounts applied.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#5A5A6E]">
                    <span>Phase 02</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">Upcoming</span>
                  </div>
                  <div className="font-heading font-bold text-lg text-[#1A1A2E]">Guides & Proposition</div>
                  <div className="text-xs font-mono text-[#1E2A78] font-semibold">Released: Jan 20, 2027</div>
                  <p className="text-xs text-[#5A5A6E]">Background guides, Compromis, and rules published in Resource Hub.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#5A5A6E]">
                    <span>Phase 03</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">Upcoming</span>
                  </div>
                  <div className="font-heading font-bold text-lg text-[#1A1A2E]">Memorial Submission</div>
                  <div className="text-xs font-mono text-[#00B4A6] font-semibold">
                    Deadline: {new Date(siteConfig?.registrationDeadlines?.mootCup || '2027-03-05').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <p className="text-xs text-[#5A5A6E]">Final electronic submission deadline for Moot Court memorials.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#5A5A6E]">
                    <span>Phase 04</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">On-Campus</span>
                  </div>
                  <div className="font-heading font-bold text-lg text-[#1A1A2E]">Conference Days</div>
                  <div className="text-xs font-mono text-[#1E2A78] font-semibold">
                    {formatDateRange(siteConfig?.eventDates?.start, siteConfig?.eventDates?.end)}
                  </div>
                  <p className="text-xs text-[#5A5A6E]">Check-in, opening ceremony, committee sessions, and Grand Final.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 4. FEATURED COMMITTEES & PROBLEM CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#1E2A78] font-bold">
              Substantive Roster
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E] mt-1">
              Committees & Problem Categories
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/gimun/committees"
              className="text-xs font-mono font-semibold text-[#FF6B35] hover:underline"
            >
              All Committees →
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/moot-cup/categories"
              className="text-xs font-mono font-semibold text-[#00B4A6] hover:underline"
            >
              All Problem Categories →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {committees.slice(0, 2).map((com) => (
            <ContentCard
              key={com.id}
              track="gimun"
              title={com.name}
              description={com.shortDescription}
              meta={`${com.capacity ? `${com.capacity} Delegates` : 'Open'} • ${com.type.replace('-', ' ')}`}
              actionHref={`/gimun/committees/${com.slug}`}
              actionLabel="View Committee Dossier"
            />
          ))}

          {mootCategories.slice(0, 1).map((cat) => (
            <ContentCard
              key={cat.id}
              track="moot-cup"
              title={cat.name}
              description={cat.description}
              meta={`${cat.areaOfLaw} • Updated ${cat.lastUpdated}`}
              actionHref="/moot-cup/categories"
              actionLabel="Explore Legal Category"
            />
          ))}
        </div>
      </section>

      {/* 5. LATEST ANNOUNCEMENT */}
      {latestAnnouncement && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="double-bezel">
              <div className="double-bezel-inner p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FF6B35]/10 text-[#FF6B35]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-ping" />
                      Notice
                    </span>
                    <span className="text-xs font-mono text-[#5A5A6E]">
                      {new Date(latestAnnouncement.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                    {latestAnnouncement.title}
                  </h3>
                  <p className="text-sm text-[#5A5A6E] leading-relaxed">
                    {latestAnnouncement.body}
                  </p>
                </div>
                <Link
                  href="/announcements"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs bg-[#1E2A78] text-white hover:bg-[#1E2A78]/90 transition-colors shadow-xs"
                >
                  <span>Announcements Feed</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* 6. SOCIAL PROOF / STATS (PRD §15.1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="rounded-3xl bg-[#1E2A78] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/[0.03] pointer-events-none" />
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
              <div className="space-y-1">
                <div className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
                  350<span className="text-[#FF6B35]">+</span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/80">Delegates & Advocates</div>
                <div className="text-[10px] font-mono text-white/50">Across Pakistan</div>
              </div>

              <div className="space-y-1">
                <div className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
                  25<span className="text-[#00B4A6]">+</span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/80">Represented Universities</div>
                <div className="text-[10px] font-mono text-white/50">Colleges & Law Faculties</div>
              </div>

              <div className="space-y-1">
                <div className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
                  7
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/80">Committees & Benches</div>
                <div className="text-[10px] font-mono text-white/50">Specialized Jurisdictions</div>
              </div>

              <div className="space-y-1">
                <div className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
                  100<span className="text-[#FF6B35]">%</span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/80">Merit-Based Allocation</div>
                <div className="text-[10px] font-mono text-white/50">Transparent Adjudication</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 7. SPONSOR LOGO STRIP (PRD §15.1) */}
      <section className="space-y-4">
        <div className="text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-[#5A5A6E]">
            Institutional & Corporate Partners
          </span>
        </div>
        <SponsorStrip sponsors={sponsors} />
      </section>

      {/* 8. CALL TO ACTION STRIP */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <div className="double-bezel">
            <div className="double-bezel-inner p-8 sm:p-12 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#1E2A78] font-bold">
                Registration is Open
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#1A1A2E] max-w-2xl mx-auto leading-tight">
                Secure Your Place at GIKI&apos;s Flagship Diplomatic & Legal Gathering
              </h2>
              <p className="text-sm sm:text-base text-[#5A5A6E] max-w-xl mx-auto">
                No upfront payment required. Submitting the registration form reserves your delegate dossier or team application for Dais review.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button variant="track-gimun" size="lg" href="/register?track=gimun">
                  Register for GIMUN
                </Button>
                <Button variant="track-moot" size="lg" href="/register?track=moot-cup">
                  Register for Moot Cup
                </Button>
                <Button variant="secondary" size="lg" href="/resources">
                  Download Handbook
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
