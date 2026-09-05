import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  BookOpen,
  Download,
  CheckCircle2,
  FileText,
  Shield,
  ArrowRight,
  Gavel,
  HelpCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rules of Procedure (RoP) | GIMUN 2027',
  description:
    'Complete parliamentary rules of procedure governing diplomatic debate, motions, caucusing, and resolution adoption at GIMUN 2027.',
};

export default function GimunRulesPage() {
  const motionsTable = [
    {
      motion: 'Point of Personal Privilege',
      purpose: 'Audibility, physical comfort, room temperature, or technical impediment',
      interrupt: 'Yes (only for audibility)',
      second: 'No',
      vote: 'Chair Decision',
    },
    {
      motion: 'Point of Order',
      purpose: 'Procedural error or violation of RoP by a delegate or dais',
      interrupt: 'Yes',
      second: 'No',
      vote: 'Chair Decision',
    },
    {
      motion: 'Point of Parliamentary Inquiry',
      purpose: 'Question to the Chair regarding committee rules or procedure',
      interrupt: 'No',
      second: 'No',
      vote: 'Chair Decision',
    },
    {
      motion: 'Motion for Moderated Caucus',
      purpose: 'Focused formal debate on a specific sub-issue with set speaking time',
      interrupt: 'No',
      second: 'Yes',
      vote: 'Simple Majority (50% + 1)',
    },
    {
      motion: 'Motion for Unmoderated Caucus',
      purpose: 'Informal consultation for alliance building and working paper drafting',
      interrupt: 'No',
      second: 'Yes',
      vote: 'Simple Majority (50% + 1)',
    },
    {
      motion: 'Motion to Introduce Draft Resolution',
      purpose: 'Formally present a Dais-approved draft resolution to the floor',
      interrupt: 'No',
      second: 'Yes',
      vote: 'Simple Majority (50% + 1)',
    },
    {
      motion: 'Motion to Enter Voting Procedure',
      purpose: 'Close debate and move directly to voting on draft resolutions',
      interrupt: 'No',
      second: 'Yes',
      vote: '2/3 Majority',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <TrackBadge track="gimun" />
          <span className="text-xs font-mono text-[#5A5A6E] uppercase tracking-wider">
            Parliamentary Protocol
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          Rules of Procedure (RoP)
        </h1>
        <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
          GIMUN utilizes standardized parliamentary rules adapted from classical Harvard MUN protocols, calibrated to maintain vigorous substantive debate and fair procedural discipline across all simulation organs.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Button
            variant="track-gimun"
            href="/documents/gimun/GIMUN_Rules_of_Procedure.pdf"
            icon={<Download className="w-4 h-4" />}
          >
            Download Official RoP Handbook (PDF)
          </Button>
          <Button variant="secondary" href="/gimun/committees">
            Explore Committees
          </Button>
        </div>
      </header>

      {/* Quick-Reference Table of Motions */}
      <section className="space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold">
            Procedural Mechanics
          </span>
          <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
            Parliamentary Motions Cheat Sheet
          </h2>
          <p className="text-xs text-[#5A5A6E] mt-1">
            Motions are entertained in order of procedural precedence when the floor is open between speeches.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F8FC] border-b border-gray-200 text-[#1E2A78] font-mono uppercase text-[11px]">
                <th className="p-4 font-bold">Motion / Point</th>
                <th className="p-4 font-bold">Procedural Purpose</th>
                <th className="p-4 font-bold">Interrupt?</th>
                <th className="p-4 font-bold">Second?</th>
                <th className="p-4 font-bold">Vote Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#1A1A2E]">
              {motionsTable.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-heading font-bold text-xs sm:text-sm text-[#1A1A2E] whitespace-nowrap">
                    {row.motion}
                  </td>
                  <td className="p-4 text-[#5A5A6E] leading-relaxed min-w-[220px]">
                    {row.purpose}
                  </td>
                  <td className="p-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        row.interrupt.startsWith('Yes')
                          ? 'bg-red-50 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {row.interrupt}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[#5A5A6E]">{row.second}</td>
                  <td className="p-4 font-mono font-medium text-[#FF6B35]">{row.vote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Substantive Protocols */}
      <section className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold">
            Core Rules
          </span>
          <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
            Key Parliamentary Stages
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B35] flex items-center justify-center font-bold text-xs font-mono">
                01
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                Roll Call &amp; Quorum
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                At the beginning of each committee session, the Dais calls roll in alphabetical order. Delegates respond either &ldquo;Present&rdquo; (may abstain during substantive voting) or &ldquo;Present and Voting&rdquo; (relinquishes the right to abstain; must cast a vote of Yes or No).
              </p>
            </div>
          </div>

          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B35] flex items-center justify-center font-bold text-xs font-mono">
                02
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                General Speakers List (GSL)
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                The GSL is the continuous backbone of debate throughout the conference. The default speaking time is 90 seconds. Once a speech concludes, remaining time may be yielded to the Dais, another delegate, or to questions (Points of Information).
              </p>
            </div>
          </div>

          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B35] flex items-center justify-center font-bold text-xs font-mono">
                03
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                Working Papers &amp; Draft Resolutions
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                Informal working papers develop into formal Draft Resolutions once approved by the Dais. Draft resolutions require at least 2 Sponsors (primary authors) and a required percentage of Signatories (interested nations) before formal introduction.
              </p>
            </div>
          </div>

          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B35] flex items-center justify-center font-bold text-xs font-mono">
                04
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                Voting Procedure &amp; Closures
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                Once a motion to close debate passes by a 2/3 majority, the room enters strict voting procedure. Doors are locked, note-passing ceases, and delegates vote on introduced amendments and draft resolutions in the order of introduction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pt-6">
        <div className="double-bezel">
          <div className="double-bezel-inner p-8 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#1A1A2E]">
              Ready to Demonstrate Diplomatic Mastery?
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A6E] max-w-lg mx-auto">
              Select your committee preference and submit your delegate application today.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Button variant="track-gimun" href="/register?track=gimun">
                Register for GIMUN
              </Button>
              <Button variant="secondary" href="/gimun/committees">
                View Committees
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
