import type { Metadata } from 'next';
import Link from 'next/link';
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
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'About the Symposium | 15 Years of Legacy | GIMUN & GIKI Moot Cup',
  description:
    'Discover the legacy, academic mission, and institutional heritage of Pakistan’s premier twin diplomatic and legal advocacy championship hosted at GIKI, Topi.',
};

export default function AboutOverviewPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-20">
      {/* 1. Executive Narrative Header */}
      <header className="space-y-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 text-primary border border-slate-200">
            Institutional Legacy & Heritage
          </span>
          <span className="text-xs font-mono text-neutral-gray uppercase tracking-wider">
            PRD §15.1
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-ink tracking-tight leading-tight">
          Pakistan&apos;s Premier Twin-Flagship{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Diplomatic & Legal
          </span>{' '}
          Symposium
        </h1>

        <p className="text-base sm:text-lg text-neutral-gray leading-relaxed">
          Hosted annually at the scenic foothills of Topi, Khyber Pakhtunkhwa, by the Ghulam Ishaq
          Khan Institute of Engineering Sciences and Technology (GIKI), our twin symposium converges
          over 800 aspiring diplomats, jurists, and policy researchers from 50+ leading institutions
          for three days of intensive parliamentary debate, judicial advocacy, and leadership development.
        </p>
      </header>

      {/* 2. 15-Year Legacy Bento Metrics */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
            Institutional Impact
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            A Decade and a Half of Rigor & Excellence
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-3xl font-heading font-extrabold text-ink">15+ Years</span>
            <h3 className="text-xs font-mono uppercase font-bold text-ink tracking-wide">
              Established Heritage
            </h3>
            <p className="text-xs text-neutral-gray leading-relaxed">
              Founded in 2011, establishing the gold benchmark for collegiate parliamentary simulation in Pakistan.
            </p>
          </div>

          <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-accent flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-3xl font-heading font-extrabold text-ink">800+</span>
            <h3 className="text-xs font-mono uppercase font-bold text-ink tracking-wide">
              Annual Delegates
            </h3>
            <p className="text-xs text-neutral-gray leading-relaxed">
              Drawn from Pakistan’s top universities, law faculties, and A-Level institutions nationwide.
            </p>
          </div>

          <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-secondary flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-3xl font-heading font-extrabold text-ink">50+</span>
            <h3 className="text-xs font-mono uppercase font-bold text-ink tracking-wide">
              Universities Represented
            </h3>
            <p className="text-xs text-neutral-gray leading-relaxed">
              National footprint across all 4 provinces and Islamabad Capital Territory.
            </p>
          </div>

          <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-3xl font-heading font-extrabold text-ink">9 Chambers</span>
            <h3 className="text-xs font-mono uppercase font-bold text-ink tracking-wide">
              Committees & Benches
            </h3>
            <p className="text-xs text-neutral-gray leading-relaxed">
              6 specialized UN assemblies and 3 progressive appellate moot court championship benches.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The Twin Flagship Pillars */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-900 via-primary to-slate-900 text-white space-y-6 shadow-card">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-white/15 backdrop-blur-md border border-white/20">
            <Compass className="w-4 h-4 text-accent" />
            <span>Diplomatic Simulation</span>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              GIKI Model United Nations (GIMUN)
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              GIMUN immerses delegates in the intricacies of multilateral diplomacy, international treaty drafting,
              and high-stakes geopolitical crisis management. From the UN Security Council to specialized crisis
              cabinets, delegates represent sovereign states under rigorous parliamentary procedure.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              <span>Standard UNA-USA Parliamentary Procedure</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              <span>Real-time Crisis Directives & Joint Cabinet Crises</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              <span>Merit-based Best Delegate, Outstanding & Honorable Gavels</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-950 via-slate-900 to-teal-900 text-white space-y-6 shadow-card">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-white/15 backdrop-blur-md border border-white/20">
            <Scale className="w-4 h-4 text-secondary" />
            <span>Judicial Advocacy</span>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              GIKI National Moot Court Cup
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              The GIKI Moot Court Cup is Pakistan&apos;s premier collegiate appellate advocacy competition.
              Law school teams prepare comprehensive written memorials for Applicant and Respondent, followed by
              grueling oral pleading rounds evaluated by practicing advocates and senior High Court jurists.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <span>Comprehensive Written Memorial Scoring (OSCOLA Standard)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <span>Preliminary, Quarter, Semi, and Grand Final Pleading Rounds</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <span>Champion Bench, Best Memorial, and Best Oralist Accolades</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 4. Sub-Pages Navigation Hub (Double-Bezel Grid) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
            Explore Details
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            Institutional Directory & Visitor Guides
          </h2>
          <p className="text-xs sm:text-sm text-neutral-gray max-w-2xl">
            Detailed guides on leadership, campus access, procedural regulations, partnerships, and historical records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Team */}
          <ScrollReveal>
            <Link href="/about/team" className="block double-bezel h-full group">
              <div className="double-bezel-inner p-6 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-ink group-hover:text-primary transition-colors">
                    Organizing Team & Leadership
                  </h3>
                  <p className="text-xs text-neutral-gray leading-relaxed">
                    Meet the GIMUN Secretariat, GIKI Moot Court Convening Committee, and Host Directorate leadership.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline pt-2 border-t border-slate-100">
                  <span>View Leadership Directory</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Card 2: Venue */}
          <ScrollReveal>
            <Link href="/about/venue" className="block double-bezel h-full group">
              <div className="double-bezel-inner p-6 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-ink group-hover:text-primary transition-colors">
                    Venue, Hostels & Travel Guide
                  </h3>
                  <p className="text-xs text-neutral-gray leading-relaxed">
                    Directions to GIKI Topi, airport shuttles, campus security checkpoint protocols, and residential hostelling.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline pt-2 border-t border-slate-100">
                  <span>Explore Travel & Campus Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Card 3: FAQ */}
          <ScrollReveal>
            <Link href="/about/faq" className="block double-bezel h-full group">
              <div className="double-bezel-inner p-6 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-amber-800 group-hover:text-white transition-colors">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-ink group-hover:text-primary transition-colors">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-neutral-gray leading-relaxed">
                    Searchable answers covering delegate eligibility, memorial submission, dress code, security, and verification.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline pt-2 border-t border-slate-100">
                  <span>Browse 16 Detailed FAQs</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Card 4: Sponsors */}
          <ScrollReveal>
            <Link href="/about/sponsors" className="block double-bezel h-full group">
              <div className="double-bezel-inner p-6 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center group-hover:bg-purple-800 group-hover:text-white transition-colors">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-ink group-hover:text-primary transition-colors">
                    Sponsors & Strategic Partners
                  </h3>
                  <p className="text-xs text-neutral-gray leading-relaxed">
                    Our statutory patrons, legal chambers, tech boards, and official 2026 Sponsorship Prospectus download.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline pt-2 border-t border-slate-100">
                  <span>View Partners & Deck</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Card 5: Gallery */}
          <ScrollReveal>
            <Link href="/about/gallery" className="block double-bezel h-full group">
              <div className="double-bezel-inner p-6 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center group-hover:bg-rose-800 group-hover:text-white transition-colors">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-ink group-hover:text-primary transition-colors">
                    Visual Archives & Gallery
                  </h3>
                  <p className="text-xs text-neutral-gray leading-relaxed">
                    Interactive photographic archives covering crisis debates, appellate benches, campus life, and social nights.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline pt-2 border-t border-slate-100">
                  <span>Browse Media Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Card 6: Rules & Resources */}
          <ScrollReveal>
            <Link href="/resources" className="block double-bezel h-full group">
              <div className="double-bezel-inner p-6 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center group-hover:bg-cyan-800 group-hover:text-white transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-ink group-hover:text-primary transition-colors">
                    Official Resources & Rules
                  </h3>
                  <p className="text-xs text-neutral-gray leading-relaxed">
                    Download committee study guides, moot court problem statements, OSCOLA memorial templates, and ROPs.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline pt-2 border-t border-slate-100">
                  <span>Access Downloads Center</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. Institutional Governance & Zero-Payment Disclosure */}
      <div className="p-6 rounded-2xl bg-surface-elevated border border-whisper-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-sm font-heading font-bold text-ink">
              Official Institutional Governance
            </h4>
            <p className="text-xs text-neutral-gray max-w-2xl leading-relaxed">
              Organized under the auspices of GIKI Student Affairs and approved academic societies.
              All registrations are processed through official GIKI institutional banking channels with manual
              verification. No online commercial transactions occur on this platform.
            </p>
          </div>
        </div>
        <Link
          href="/about/faq#fees"
          className="shrink-0 px-4 py-2 rounded-button bg-slate-100 text-ink text-xs font-semibold hover:bg-slate-200 transition-colors"
        >
          Payment FAQ &rarr;
        </Link>
      </div>

      {/* 6. Closing Register CTA Banner */}
      <section className="p-8 sm:p-12 rounded-section bg-gradient-to-r from-primary to-blue-950 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 text-center md:text-left max-w-xl">
          <span className="text-xs font-mono uppercase font-bold text-accent tracking-wider">
            Delegate Applications Open
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
            Represent Your Institution at GIKI Topi
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Secure your delegation’s place at Pakistan&apos;s premier diplomatic and legal symposium.
            Select your track to register as a delegation or individual delegate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-button bg-accent text-white text-xs font-bold uppercase tracking-wider hover:bg-accent-hover transition-colors shadow-button"
          >
            <span>Register Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-button bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/20"
          >
            <span>Contact Desk</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
