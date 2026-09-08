import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Compass,
  Scale,
  Calendar,
  Building,
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

export const metadata: Metadata = constructMetadata({
  title: "About the Symposium | 15 Years of Legacy | GIMUN & GMC 2027",
  description:
    "Discover the legacy, academic mission, and institutional heritage of Pakistan’s premier twin diplomatic and legal advocacy championship hosted at GIKI, Topi.",
  path: "/about",
});

export default function AboutOverviewPage() {
  return (
    <div className="space-y-16">
      {/* 1. Atmospheric Dark Hero Header */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-16 sm:py-24 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-gray-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
              15 Years of Academic Heritage
            </span>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Est. 2011 &bull; GIKI Topi
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Pakistan&apos;s Premier Twin{" "}
            <span className="text-gradient-silver">Diplomatic &amp; Legal</span>{" "}
            Symposium
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            Hosted annually at the scenic foothills of Topi, Khyber Pakhtunkhwa, by the Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI), our twin symposium converges over 800 aspiring diplomats, jurists, and policy researchers from 50+ leading institutions for four days of rigorous parliamentary debate, appellate advocacy, and institutional leadership.
          </p>

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
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-16">
        {/* 2. 15-Year Legacy Bento Metrics */}
        <section className="space-y-8">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A83A11]">
              Institutional Stature
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#1A1A2E]">
              A Decade and a Half of Rigor &amp; Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3 hover:border-[#1E2A78]/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#1E2A78]/10 text-[#1E2A78] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-3xl font-heading font-extrabold text-[#1A1A2E] block">
                15+ Years
              </span>
              <h3 className="text-xs font-mono uppercase font-bold text-[#1A1A2E] tracking-wide">
                Established Benchmark
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Founded in 2011, defining collegiate parliamentary simulation and advocacy excellence across Pakistan.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3 hover:border-[#FF6B35]/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#FFF0E8] text-[#A83A11] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-3xl font-heading font-extrabold text-[#1A1A2E] block">
                800+
              </span>
              <h3 className="text-xs font-mono uppercase font-bold text-[#1A1A2E] tracking-wide">
                Annual Attendees
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Drawn from Pakistan’s top universities, law faculties, and premier secondary schools nationwide.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3 hover:border-[#00B4A6]/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#E6F9F7] text-[#00B4A6] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-3xl font-heading font-extrabold text-[#1A1A2E] block">
                50+
              </span>
              <h3 className="text-xs font-mono uppercase font-bold text-[#1A1A2E] tracking-wide">
                Universities &amp; Colleges
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Comprehensive national representation across all four provinces and Islamabad Capital Territory.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3 hover:border-[#1E2A78]/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-3xl font-heading font-extrabold text-[#1A1A2E] block">
                9 Chambers
              </span>
              <h3 className="text-xs font-mono uppercase font-bold text-[#1A1A2E] tracking-wide">
                Debate &amp; Court Arenas
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                6 specialized UN assemblies alongside 3 progressive appellate moot court championship benches.
              </p>
            </div>
          </div>
        </section>

        {/* 3. The Twin Flagship Pillars */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* GIMUN Pillar */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#070B19] text-white space-y-6 border border-white/10 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-radial-glow-orange opacity-25 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
                <Compass className="w-3.5 h-3.5" />
                <span>Diplomatic Simulation</span>
              </span>
              <span className="text-xs font-mono text-gray-400">Track 01</span>
            </div>

            <div className="relative z-10 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                GIKI Model United Nations (GIMUN)
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                GIMUN immerses delegates in the intricacies of multilateral diplomacy, treaty negotiation, and high-stakes geopolitical crisis management. From the UN Security Council to specialized historic cabinets, delegates defend sovereign mandates under rigorous parliamentary protocols.
              </p>
            </div>

            <ul className="relative z-10 space-y-2.5 text-xs text-gray-300 font-mono">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <span>Standardized Harvard Parliamentary Rules of Procedure</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <span>Real-time Crisis Directives &amp; Joint Cabinet Interventions</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <span>Merit-based Best Delegate, Outstanding &amp; Gavel Accolades</span>
              </li>
            </ul>

            <div className="relative z-10 pt-4 border-t border-white/10">
              <Link
                href="/gimun"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FF6B35] hover:underline"
              >
                <span>Explore GIMUN Track Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* GMC Pillar */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#070B19] text-white space-y-6 border border-white/10 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-radial-glow-teal opacity-25 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-[#00B4A6]/20 text-[#00B4A6] border border-[#00B4A6]/30">
                <Scale className="w-3.5 h-3.5" />
                <span>Judicial Advocacy</span>
              </span>
              <span className="text-xs font-mono text-gray-400">Track 02</span>
            </div>

            <div className="relative z-10 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                GIKI Moot Court (GMC)
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                The GIKI Moot Court (GMC) is Pakistan&apos;s premier collegiate appellate advocacy championship. Law school delegations draft comprehensive written memorials for Applicant and Respondent, followed by contentious oral pleading rounds adjudicated by senior advocates and High Court jurists.
              </p>
            </div>

            <ul className="relative z-10 space-y-2.5 text-xs text-gray-300 font-mono">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0" />
                <span>Comprehensive Written Memorial Scoring (OSCOLA 4th Ed)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0" />
                <span>Preliminary, Quarter, Semi, and Grand Final Pleading Benches</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0" />
                <span>Champion Bench Trophy, Best Memorial, and Best Oralist Honors</span>
              </li>
            </ul>

            <div className="relative z-10 pt-4 border-t border-white/10">
              <Link
                href="/moot-cup"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00B4A6] hover:underline"
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
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E2A78]">
              Institutional Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#1A1A2E]">
              Directory, Guides &amp; Historical Archives
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5A6E] max-w-2xl">
              Inspect organizing leadership, review campus travel protocols, search the FAQ knowledge base, and access historical media archives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Team */}
            <ScrollReveal>
              <Link href="/about/team" className="block double-bezel h-full group">
                <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4 bg-white">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E2A78] flex items-center justify-center group-hover:bg-[#1E2A78] group-hover:text-white transition-colors">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#1A1A2E] group-hover:text-[#1E2A78] transition-colors">
                      Organizing Leadership
                    </h3>
                    <p className="text-xs text-[#5A5A6E] leading-relaxed">
                      Meet the GIMUN Executive Secretariat, GMC Convening Committee, and Host Directorate operations heads.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2A78] group-hover:text-[#FF6B35] transition-colors pt-3 border-t border-gray-100">
                    <span>View Leadership Roster</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 2: Venue */}
            <ScrollReveal>
              <Link href="/about/venue" className="block double-bezel h-full group">
                <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4 bg-white">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#1A1A2E] group-hover:text-[#1E2A78] transition-colors">
                      Campus Venue &amp; Travel
                    </h3>
                    <p className="text-xs text-[#5A5A6E] leading-relaxed">
                      Directions to GIKI Topi, airport shuttle schedules, campus gate security clearance, and residential boarding.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2A78] group-hover:text-[#FF6B35] transition-colors pt-3 border-t border-gray-100">
                    <span>Explore Venue Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 3: FAQ */}
            <ScrollReveal>
              <Link href="/about/faq" className="block double-bezel h-full group">
                <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4 bg-white">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-amber-800 group-hover:text-white transition-colors">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#1A1A2E] group-hover:text-[#1E2A78] transition-colors">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-xs text-[#5A5A6E] leading-relaxed">
                      Searchable answers covering delegate eligibility, memorial submission, dress code, security, and verification.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2A78] group-hover:text-[#FF6B35] transition-colors pt-3 border-t border-gray-100">
                    <span>Search Knowledge Base</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 4: Sponsors */}
            <ScrollReveal>
              <Link href="/about/sponsors" className="block double-bezel h-full group">
                <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4 bg-white">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center group-hover:bg-purple-800 group-hover:text-white transition-colors">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#1A1A2E] group-hover:text-[#1E2A78] transition-colors">
                      Sponsors &amp; Patrons
                    </h3>
                    <p className="text-xs text-[#5A5A6E] leading-relaxed">
                      Statutory patrons, legal chambers, government boards, and official 2027 Sponsorship Prospectus.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2A78] group-hover:text-[#FF6B35] transition-colors pt-3 border-t border-gray-100">
                    <span>View Partners &amp; Deck</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 5: Gallery */}
            <ScrollReveal>
              <Link href="/about/gallery" className="block double-bezel h-full group">
                <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4 bg-white">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center group-hover:bg-rose-800 group-hover:text-white transition-colors">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#1A1A2E] group-hover:text-[#1E2A78] transition-colors">
                      Visual Archives &amp; Gallery
                    </h3>
                    <p className="text-xs text-[#5A5A6E] leading-relaxed">
                      Photographic archives covering crisis debates, appellate benches, campus life, and social galas.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2A78] group-hover:text-[#FF6B35] transition-colors pt-3 border-t border-gray-100">
                    <span>Browse Gallery</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 6: Resources */}
            <ScrollReveal>
              <Link href="/resources" className="block double-bezel h-full group">
                <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-4 bg-white">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center group-hover:bg-cyan-800 group-hover:text-white transition-colors">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#1A1A2E] group-hover:text-[#1E2A78] transition-colors">
                      Official Resources &amp; Rules
                    </h3>
                    <p className="text-xs text-[#5A5A6E] leading-relaxed">
                      Download committee study guides, moot court compromises, OSCOLA templates, and delegate kits.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2A78] group-hover:text-[#FF6B35] transition-colors pt-3 border-t border-gray-100">
                    <span>Access Downloads</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* 5. Institutional Governance & Zero-Payment Disclosure */}
        <section className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E2A78] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-heading font-bold text-[#1A1A2E]">
                Official Institutional Governance &amp; Manual Payment Notice
              </h4>
              <p className="text-xs sm:text-sm text-[#5A5A6E] max-w-2xl leading-relaxed">
                Organized under the auspices of GIKI Student Affairs. All delegate registration fees are processed exclusively through official GIKI institutional banking channels with manual verification. Zero online commercial transactions occur on this platform.
              </p>
            </div>
          </div>
          <Link
            href="/about/faq"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-gray-100 text-[#1A1A2E] text-xs font-mono font-bold hover:bg-gray-200 transition-colors"
          >
            Payment FAQ &rarr;
          </Link>
        </section>

        {/* 6. Closing Register CTA Banner */}
        <section className="p-8 sm:p-12 rounded-2xl bg-[#070B19] text-white border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-radial-glow-dual opacity-30 pointer-events-none" />
          <div className="relative z-10 space-y-2 text-center md:text-left max-w-xl">
            <span className="text-xs font-mono uppercase font-bold text-[#C84815] tracking-wider">
              Delegate Applications Open
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
              Represent Your Institution at GIKI Topi
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
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
        </section>
      </div>
    </div>
  );
}
