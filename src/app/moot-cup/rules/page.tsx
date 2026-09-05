import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Scale,
  Download,
  FileText,
  AlertTriangle,
  Gavel,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rules & Memorial Guidelines | GIKI Moot Court 2027',
  description:
    'Comprehensive competition rules, memorial drafting specifications, oral pleading rounds structure, and scoring criteria for the 2027 Moot Court.',
};

export default function MootRulesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <TrackBadge track="moot-cup" />
          <span className="text-xs font-mono text-[#5A5A6E] uppercase tracking-wider">
            Competition Handbook
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          Rules &amp; Memorial Guidelines
        </h1>
        <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
          The GIKI Moot Court Competition adheres to strict national standards of appellate advocacy and scholarly legal drafting. Review the memorial formatting specifications, round time allocations, and penalty guidelines below.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Button
            variant="track-moot"
            href="/documents/moot-cup/Moot_Cup_Rules_and_Memorial_Guide.pdf"
            icon={<Download className="w-4 h-4" />}
          >
            Download Official Rules PDF
          </Button>
          <Button variant="secondary" href="/moot-cup/clarifications">
            Clarifications Log
          </Button>
        </div>
      </header>

      {/* Critical Anonymity Rule Notice */}
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong className="font-bold text-sm block">Rule 1.1 — Strict Memorial &amp; Courtroom Anonymity:</strong>
          Memorials must NOT contain any identifying marks, names of advocates, institutional crests, university logos, or geographic references indicating team origin. Teams must use exclusively their assigned Team Code (e.g. TC-09). Any intentional or negligent breach of anonymity results in immediate disqualification or severe score deductions.
        </div>
      </div>

      {/* Section 1: Memorial Formatting Specifications */}
      <section className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
            Drafting Standards
          </span>
          <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
            Written Memorial Specifications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 space-y-2">
            <div className="font-mono text-xs text-[#00B4A6] font-bold">Word Limits</div>
            <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">8,000 Words Max</h3>
            <p className="text-xs text-[#5A5A6E] leading-relaxed">
              Applies to the Pleadings &amp; Prayer for Relief section. Table of Contents, Index of Authorities, and Statement of Facts do not count toward this limit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 space-y-2">
            <div className="font-mono text-xs text-[#00B4A6] font-bold">Typography &amp; Spacing</div>
            <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">Times New Roman</h3>
            <p className="text-xs text-[#5A5A6E] leading-relaxed">
              Body text: 12pt font with 1.5 line spacing. Footnotes: 10pt font with single line spacing. 1-inch (2.54 cm) margins on all four sides.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 space-y-2">
            <div className="font-mono text-xs text-[#00B4A6] font-bold">Citation System</div>
            <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">Oxford / Bluebook</h3>
            <p className="text-xs text-[#5A5A6E] leading-relaxed">
              All legal authorities, domestic precedents, and international treaties must be cited uniformly using either OSCOLA or Oxford/Bluebook 21st Edition format.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Oral Pleadings Structure & Timing */}
      <section className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
            Bench Advocacy
          </span>
          <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
            Oral Rounds Procedure &amp; Time Allocation
          </h2>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-8 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 p-4 rounded-xl bg-white border border-gray-200/80">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00B4A6]">
                  <Clock className="w-4 h-4" />
                  <span>30 Minutes / Team</span>
                </div>
                <h4 className="font-heading font-bold text-base text-[#1A1A2E]">Total Argument Time</h4>
                <p className="text-xs text-[#5A5A6E]">
                  Each side (Applicant and Respondent) has exactly 30 minutes to present oral arguments.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-white border border-gray-200/80">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00B4A6]">
                  <Clock className="w-4 h-4" />
                  <span>12 Minutes Min</span>
                </div>
                <h4 className="font-heading font-bold text-base text-[#1A1A2E]">Per Oralist Minimum</h4>
                <p className="text-xs text-[#5A5A6E]">
                  Two oral advocates must speak. Neither speaker may speak for less than 12 minutes.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-white border border-gray-200/80">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00B4A6]">
                  <Clock className="w-4 h-4" />
                  <span>3 Minutes Max</span>
                </div>
                <h4 className="font-heading font-bold text-base text-[#1A1A2E]">Rebuttal / Sur-rebuttal</h4>
                <p className="text-xs text-[#5A5A6E]">
                  Reserved at the start of the round. Must respond directly to points raised by the opposing counsel.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8FC] border border-gray-100 text-xs text-[#5A5A6E] leading-relaxed">
              <strong className="text-[#1A1A2E]">Bench Inquiries:</strong> Judges may intervene with questions at any point during an advocate&apos;s submissions. The clock continues running during judicial questioning. Counsel should address judges formally as &ldquo;Your Honour&rdquo; or &ldquo;May it please the Court&rdquo;.
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Adjudication Scoring Breakdown */}
      <section className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
            Grading Criteria
          </span>
          <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
            Composite Scoring Matrix (100 Points Total)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Memorial Scoring (40%) */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#00B4A6]">Part I</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">40% Weight</span>
            </div>
            <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
              Written Memorial Assessment
            </h3>
            <ul className="space-y-2 text-xs text-[#5A5A6E]">
              <li className="flex items-center justify-between py-1 border-b border-gray-50">
                <span>Knowledge of Law &amp; Legal Precedent</span>
                <span className="font-mono font-bold text-[#1A1A2E]">12 Pts</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-gray-50">
                <span>Logical Structure &amp; Persuasiveness</span>
                <span className="font-mono font-bold text-[#1A1A2E]">10 Pts</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-gray-50">
                <span>Depth of Legal Authority &amp; Research</span>
                <span className="font-mono font-bold text-[#1A1A2E]">10 Pts</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span>Style, Grammar &amp; Citation Rigor</span>
                <span className="font-mono font-bold text-[#1A1A2E]">8 Pts</span>
              </li>
            </ul>
          </div>

          {/* Oral Rounds Scoring (60%) */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#1E2A78]">Part II</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">60% Weight</span>
            </div>
            <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
              Oral Advocacy Assessment
            </h3>
            <ul className="space-y-2 text-xs text-[#5A5A6E]">
              <li className="flex items-center justify-between py-1 border-b border-gray-50">
                <span>Responsiveness to Judicial Interventions</span>
                <span className="font-mono font-bold text-[#1A1A2E]">20 Pts</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-gray-50">
                <span>Substantive Legal Arguments &amp; Application</span>
                <span className="font-mono font-bold text-[#1A1A2E]">18 Pts</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-gray-50">
                <span>Courtroom Decorum &amp; Delivery Poise</span>
                <span className="font-mono font-bold text-[#1A1A2E]">12 Pts</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span>Time Management &amp; Rebuttal Precision</span>
                <span className="font-mono font-bold text-[#1A1A2E]">10 Pts</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pt-6">
        <div className="double-bezel">
          <div className="double-bezel-inner p-8 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#1A1A2E]">
              Have Inquiries on Proposition Facts?
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A6E] max-w-lg mx-auto">
              Submit formal requests for clarification to the Moot Court Bench Drafting Committee.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Button variant="track-moot" href="/moot-cup/clarifications">
                Clarifications Board
              </Button>
              <Button variant="secondary" href="/moot-cup/categories">
                View Categories
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
