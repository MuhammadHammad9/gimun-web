"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MootRulesClientProps {
  rulesDocumentUrl?: string;
}

export function MootRulesClient({ rulesDocumentUrl }: MootRulesClientProps) {
  // Tab switcher for Scoring Rubric
  const [scoringTab, setScoringTab] = useState<"memorial" | "oral">("memorial");

  // Memorial Compliance Simulator State
  const [testWordCount, setTestWordCount] = useState<number>(7450);

  // Calculate penalties based on word count
  const calculatePenalty = (words: number) => {
    if (words <= 8000) return { penalty: 0, status: "Compliant", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    const over = words - 8000;
    const deduction = Math.ceil(over / 100) * 1;
    return {
      penalty: deduction,
      status: `Over limit by ${over} words (-${deduction} pts deduction)`,
      color: "text-rose-700 bg-rose-50 border-rose-200",
    };
  };

  const wordCountAssessment = calculatePenalty(testWordCount);

  return (
    <div className="space-y-16">
      {/* 1. CRITICAL RULE 1.1 ANONYMITY SHIELD */}
      <section className="p-6 sm:p-8 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-7 h-7 text-amber-600 shrink-0 mt-1" />
          <div className="space-y-2 text-amber-950">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-amber-200/80 text-amber-900 border border-amber-300">
                Rule 1.1 Mandate
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-amber-950">
                Absolute Memorial &amp; Courtroom Anonymity Gate
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-900">
              Written memorials and oral submissions must NOT reveal the identity of participating law schools, advocate names, faculty coaches, crests, or geographic origin. Teams are identified EXCLUSIVELY by their assigned Team Code (e.g. <strong>TC-09</strong>). Any intentional or negligent breach results in immediate disqualification or punitive score deductions.
            </p>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE MEMORIAL SPECIFICATIONS & COMPLIANCE INSPECTOR */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#00665C] font-bold">
              Drafting Rigor
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#1A1A2E] mt-0.5">
              Written Memorial Specifications
            </h2>
          </div>
          <span className="text-xs font-mono text-[#5A5A6E]">
            OSCOLA 4th Ed &bull; Max 8,000 Words
          </span>
        </div>

        {/* 3 Core Specs Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#00665C]">Length Limit</span>
              <FileCheck className="w-4 h-4 text-[#00665C]" />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-[#1A1A2E]">
              8,000 Words Max
            </h3>
            <p className="text-xs text-[#5A5A6E] leading-relaxed">
              Applies strictly to the Pleadings &amp; Prayer for Relief section. Table of Contents, Index of Authorities, and Statement of Facts do not count toward this limit.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#00665C]">Typography</span>
              <Scale className="w-4 h-4 text-[#00665C]" />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-[#1A1A2E]">
              Times New Roman
            </h3>
            <p className="text-xs text-[#5A5A6E] leading-relaxed">
              Body text: 12pt font with 1.5 line spacing. Footnotes: 10pt font with single line spacing. 1-inch (2.54 cm) margins on all four sides.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#00665C]">Citations</span>
              <BookOpen className="w-4 h-4 text-[#00665C]" />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-[#1A1A2E]">
              OSCOLA 4th Edition
            </h3>
            <p className="text-xs text-[#5A5A6E] leading-relaxed">
              All international treaties, ICJ decisions, customary declarations, and municipal jurisprudence must be cited uniformly using Oxford OSCOLA standards.
            </p>
          </div>
        </div>

        {/* Live Word Count & Compliance Sandbox */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-8 space-y-5 bg-radial-glow-teal">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-[#00665C] tracking-wider">
                  Interactive Sandbox
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-[#1A1A2E]">
                  Memorial Compliance &amp; Deduction Calculator
                </h3>
              </div>
              <span className="text-xs font-mono text-[#5A5A6E]">
                Official GMC Penalties Schedule
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <label htmlFor="gmc-word-count" className="text-xs font-mono text-[#5A5A6E] block font-medium">
                  Test Your Substantive Pleadings Word Count:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="gmc-word-count"
                    type="range"
                    min="5000"
                    max="9500"
                    step="50"
                    value={testWordCount}
                    onChange={(e) => setTestWordCount(Number(e.target.value))}
                    className="w-full accent-[#00B4A6] cursor-pointer"
                  />
                  <span className="font-mono font-bold text-sm text-[#1A1A2E] w-16 text-right">
                    {testWordCount}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>5,000 words</span>
                  <span>8,000 (Limit)</span>
                  <span>9,500 words</span>
                </div>
              </div>

              {/* Assessment Status Box */}
              <div className={cn("p-4 rounded-xl border text-xs space-y-1", wordCountAssessment.color)}>
                <div className="flex items-center gap-2 font-bold font-mono uppercase">
                  {wordCountAssessment.penalty === 0 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span>{wordCountAssessment.status}</span>
                </div>
                <p className="text-[11px] leading-snug">
                  {wordCountAssessment.penalty === 0
                    ? "Your brief is within the safe 8,000-word ceiling. No mechanical word deductions will apply."
                    : "Penalty rule: 1 point is deducted for every 100 words exceeding the 8,000-word limit."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ORAL PLEADINGS STRUCTURE & TIME ALLOCATION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#00665C] font-bold">
              Courtroom Advocacy
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#1A1A2E] mt-0.5">
              Oral Rounds Procedure &amp; Time Allocation
            </h2>
          </div>
          <span className="text-xs font-mono text-[#5A5A6E]">
            30 Minutes / Side &bull; 2 Oralists Mandatory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00665C]">
              <Clock className="w-4 h-4" />
              <span>Total Match Time</span>
            </div>
            <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
              30 Minutes / Team
            </h3>
            <p className="text-xs text-[#5A5A6E] leading-relaxed">
              Each side (Applicant and Respondent) has exactly 30 minutes to present oral arguments. Time is strictly monitored by the Clerk of the Court.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00665C]">
              <Clock className="w-4 h-4" />
              <span>Advocate Minimum</span>
            </div>
            <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
              12 Minutes Minimum
            </h3>
            <p className="text-xs text-[#5A5A6E] leading-relaxed">
              Both registered oral advocates must present submissions. Neither speaker may speak for less than 12 minutes nor more than 18 minutes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00665C]">
              <Clock className="w-4 h-4" />
              <span>Rebuttal Protocol</span>
            </div>
            <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
              3 Minutes Max
            </h3>
            <p className="text-xs text-[#5A5A6E] leading-relaxed">
              Reserved at the opening of the round. Applicant may deliver Rebuttal; Respondent may deliver Sur-rebuttal. Must address specific arguments raised by opposing counsel.
            </p>
          </div>
        </div>

        {/* Judicial Intervention Etiquette Guide */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#070B19] text-white border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#5EEAD4]">
            <Sparkles className="w-4 h-4" />
            <span>Bench Interventions &amp; Courtroom Decorum</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Judges are permitted to interrupt counsel at any juncture to test legal reasoning. The speaking clock DOES NOT pause during judicial questions. Address the bench as <em>&ldquo;Your Honour&rdquo;</em> or <em>&ldquo;May it please the Court&rdquo;</em>. When concluding answers, transition seamlessly back to your roadmap: <em>&ldquo;If that satisfies the Court, I shall now turn to my second submission…&rdquo;</em>
          </p>
        </div>
      </section>

      {/* 4. COMPOSITE SCORING MATRIX (100 POINTS) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#00665C] font-bold">
              Adjudication Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#1A1A2E] mt-0.5">
              Composite Scoring Matrix (100 Points)
            </h2>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 border border-gray-200">
            <button
              onClick={() => setScoringTab("memorial")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
                scoringTab === "memorial"
                  ? "bg-[#007A70] text-white shadow-xs"
                  : "text-[#5A5A6E] hover:text-[#1A1A2E]"
              )}
            >
              Part I: Written Memorial (40%)
            </button>
            <button
              onClick={() => setScoringTab("oral")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
                scoringTab === "oral"
                  ? "bg-[#1E2A78] text-white shadow-xs"
                  : "text-[#5A5A6E] hover:text-[#1A1A2E]"
              )}
            >
              Part II: Oral Advocacy (60%)
            </button>
          </div>
        </div>

        {/* Rubric Cards */}
        <AnimatePresence mode="wait">
          {scoringTab === "memorial" ? (
            <motion.div
              key="memorial"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#00665C]">Criterion 1</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800">12 Pts</span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  Knowledge of Law &amp; Precedent
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Rigorous synthesis of ICJ case law, treaty interpretations, and customary international doctrines.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#00665C]">Criterion 2</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800">10 Pts</span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  Logical Structure &amp; Persuasiveness
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Cohesive roadmap, sound syllogistic deductions, and effective application of facts to law.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#00665C]">Criterion 3</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800">10 Pts</span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  Depth of Research &amp; Authority
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Broad spectrum of primary sources, state practice, scholar treaties, and arbitral awards.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#00665C]">Criterion 4</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800">8 Pts</span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  Style &amp; OSCOLA Citation Rigor
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Immaculate footnote formatting, flawless cross-referencing, grammar, and typography discipline.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="oral"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#1E2A78]">Criterion 1</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">20 Pts</span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  Judicial Responsiveness
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Direct, concise, and intellectually agile responses to bench interventions without evading questions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#1E2A78]">Criterion 2</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">18 Pts</span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  Legal Arguments &amp; Application
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Substantive command of the Compromis facts, burden of proof, and legal principles under scrutiny.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#1E2A78]">Criterion 3</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">12 Pts</span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  Courtroom Poise &amp; Decorum
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Formal courtroom presence, modulation, respectful address, posture, and professional demeanor.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#1E2A78]">Criterion 4</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">10 Pts</span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  Time Precision &amp; Rebuttal
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Strict adherence to time limits, elegant prayer delivery, and targeted counter-advocacy.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 5. BOTTOM ACTION CALLOUT */}
      <section className="p-8 sm:p-10 rounded-2xl bg-[#070B19] text-white border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow-teal opacity-40 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono uppercase text-[#5EEAD4] font-bold tracking-wider">
              Authoritative Handbook
            </span>
            <h3 className="text-xl sm:text-3xl font-heading font-extrabold text-white">
              Download the Official GMC Rules &amp; Memorial Guide
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Includes complete codified schedules, citation examples, penalties rubric, and courtroom protocol.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {rulesDocumentUrl && (
              <Button
                variant="track-moot"
                size="md"
                href={rulesDocumentUrl}
                icon={<Download className="w-4 h-4" />}
              >
                Download PDF Rules
              </Button>
            )}
            <Button variant="secondary" size="md" href="/moot-cup/clarifications">
              Clarifications Portal
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
