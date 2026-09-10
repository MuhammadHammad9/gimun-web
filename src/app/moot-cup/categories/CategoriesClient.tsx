"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Download,
  Calendar,
  ArrowRight,
  Shield,
  BookOpen,
  FileCheck,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ProblemCategory, Document } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getEventYear } from "@/lib/site-config";

interface CategoriesClientProps {
  categories: ProblemCategory[];
  propositionDoc?: Document;
}

const eventYear = getEventYear();

const CATEGORY_LEGAL_ANALYSIS: Record<
  string,
  {
    docketNumber: string;
    applicantCore: string;
    respondentCore: string;
    governingTreaties: string[];
    substantiveIssues: { title: string; questions: string[] }[];
  }
> = {
  "cat-01": {
    docketNumber: `ICJ-GMC-${eventYear}/01`,
    applicantCore:
      "State sovereignty breach through state-attributed offensive cyber infrastructure; violation of Article 2(4) of the UN Charter and customary international law on non-intervention.",
    respondentCore:
      "Cyber operations fall below the threshold of use of force; non-state actor proxies cannot be attributed under the effective control test (Nicaragua standard); plea of necessity.",
    governingTreaties: [
      "UN Charter (Articles 2(4), 51)",
      "ILC Articles on State Responsibility (Articles 4, 8, 25)",
      "Tallinn Manual 2.0 on Cyber Warfare",
      "Budapest Convention on Cybercrime",
    ],
    substantiveIssues: [
      {
        title: "Issue 1: Jurisdiction & Admissibility",
        questions: [
          "Whether the Court possesses jurisdiction under the Optional Clause declarations given the respondent state's reservation on national security intelligence operations.",
          "Whether the applicant has exhausted domestic dispute settlement mechanisms prior to instituting contentious proceedings.",
        ],
      },
      {
        title: "Issue 2: Attribution of Autonomous Digital Incursions",
        questions: [
          "What evidentiary threshold applies to decentralized proxy botnets operating within respondent territory without overt command-and-control logs?",
          "Does failure to prevent transnational cyber harm constitute an independent breach of the due diligence obligation (Corfu Channel principle)?",
        ],
      },
      {
        title: "Issue 3: Lawfulness of Cyber Countermeasures & Self-Defense",
        questions: [
          "Whether anticipatory counter-strikes disabling dual-use satellite relays satisfy the Webster criteria of necessity and proportionality.",
          "Can civilian economic infrastructure destruction be excused under extraterritorial self-defense doctrines?",
        ],
      },
    ],
  },
  "cat-02": {
    docketNumber: `ICJ-GMC-${eventYear}/02`,
    applicantCore:
      "Unilateral diversion of international watercourse causing catastrophic downstream ecological depletion, violating equitable utilization and prior notification standards.",
    respondentCore:
      "Sovereign territorial development over natural resources; compliance with environmental impact assessment protocols; severe domestic energy emergency justifying upstream impoundment.",
    governingTreaties: [
      "1997 UN Watercourses Convention",
      "Ramsar Convention on Wetlands of International Importance",
      "Rio Declaration on Environment and Development (Principles 2, 15)",
      "Customary International Environmental Law (Pulp Mills precedent)",
    ],
    substantiveIssues: [
      {
        title: "Issue 1: Equitable & Reasonable Utilization vs. No-Harm Rule",
        questions: [
          "How must the Court balance Article 5 (Equitable Utilization) against Article 7 (Obligation not to cause significant harm) when vital downstream agricultural security is threatened?",
          "Does the precautionary principle reverse the burden of proof regarding long-term subterranean aquifer contamination?",
        ],
      },
      {
        title: "Issue 2: Procedural Duties of Environmental Impact Assessment (EIA)",
        questions: [
          "Whether the respondent conducted transboundary EIA in good faith by failing to disclose seismic hazard assessments to co-riparian states.",
          "Does customary law mandate joint monitoring committees prior to impoundment of transboundary reservoirs?",
        ],
      },
    ],
  },
  "cat-03": {
    docketNumber: `ICJ-GMC-${eventYear}/03`,
    applicantCore:
      "Extraterritorial biometric data harvesting and spyware interception violating International Covenant on Civil and Political Rights (ICCPR) Article 17 and diplomatic premises inviolability.",
    respondentCore:
      "Jurisdictional limits of ICCPR abroad; foreign intelligence exemptions; state immunity under the UN Jurisdictional Immunities Convention over state security apparatus.",
    governingTreaties: [
      "Vienna Convention on Diplomatic Relations (Article 22)",
      "ICCPR (Articles 2, 17)",
      "UN Convention on Jurisdictional Immunities of States (2004)",
      "Universal Declaration of Human Rights (Article 12)",
    ],
    substantiveIssues: [
      {
        title: "Issue 1: Extraterritorial Application of Human Rights Treaties",
        questions: [
          "Whether digital interception of telecommunications without physical presence within state territory triggers ICCPR jurisdiction under the 'functional control' doctrine.",
          "Are commercial spyware zero-click vulnerabilities deployed by state intelligence agencies subject to foreign sovereign immunity?",
        ],
      },
      {
        title: "Issue 2: Inviolability of Diplomatic Data Archives",
        questions: [
          "Does unauthorized remote decryption of encrypted embassy communications violate the absolute inviolability of mission archives under Article 24 of the VCDR?",
          "What forms of declaratory relief and cross-border data destruction orders may the Court order as legal remedies?",
        ],
      },
    ],
  },
};

export function CategoriesClient({ categories, propositionDoc }: CategoriesClientProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || "cat-01");
  const [openIssueIdx, setOpenIssueIdx] = useState<number | null>(0);

  const currentCategory =
    categories.find((c) => c.id === selectedCatId) || categories[0];
  const currentAnalysis =
    CATEGORY_LEGAL_ANALYSIS[currentCategory?.id] || CATEGORY_LEGAL_ANALYSIS["cat-01"];

  return (
    <div className="space-y-12">
      {/* Category Navigation Pills */}
      <div className="flex flex-wrap gap-2.5 p-1.5 rounded-2xl bg-gray-100/90 border border-gray-200">
        {categories.map((cat, idx) => {
          const isSelected = cat.id === selectedCatId;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCatId(cat.id);
                setOpenIssueIdx(0);
              }}
              className={cn(
                "flex items-center gap-2.5 px-4 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-left",
                isSelected
                  ? "bg-[#070B19] text-white shadow-md ring-1 ring-[#00B4A6]/50"
                  : "bg-white text-[#5A5A6E] hover:text-[#1A1A2E] hover:bg-white/90 border border-gray-200/60"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0",
                  isSelected
                    ? "bg-[#00B4A6] text-[#070B19]"
                    : "bg-gray-100 text-[#5A5A6E]"
                )}
              >
                0{idx + 1}
              </span>
              <span className="truncate max-w-[220px] sm:max-w-xs">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Active Case File Showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >
          {/* Dossier Header Card */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-10 space-y-6 bg-radial-glow-teal border-l-4 border-l-[#00B4A6]">
              {/* Meta row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-[#E6F9F7] text-[#007A70] border border-[#00B4A6]/30">
                    {currentCategory.areaOfLaw}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-gray-100 text-[#1E2A78]">
                    Docket: {currentAnalysis.docketNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#5A5A6E]">
                  <Calendar className="w-3.5 h-3.5 text-[#00B4A6]" />
                  <span>Promulgated: {currentCategory.lastUpdated}</span>
                </div>
              </div>

              {/* Title & Factual Synopsis */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#1A1A2E] leading-tight">
                  {currentCategory.name}
                </h2>
                <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
                  {currentCategory.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                {propositionDoc && (
                  <Button
                    variant="track-moot"
                    href={propositionDoc.fileUrl}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download Official Compromis (PDF)
                  </Button>
                )}
                <Button
                  variant="secondary"
                  href={`/register?track=moot-cup&category=${currentCategory.id}`}
                >
                  Register Team for this Problem
                </Button>
                <Link
                  href="/moot-cup/clarifications"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#007A70] hover:underline ml-auto"
                >
                  <span>Submit Factual Inquiry to Bench</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Substantive Pleading Dialectic: Applicant vs Respondent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#1E2A78]">
                <Scale className="w-4 h-4 text-[#1E2A78]" />
                <span>Applicant Core Thesis</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                State Claims &amp; Inviolability
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                {currentAnalysis.applicantCore}
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#007A70]">
                <Shield className="w-4 h-4 text-[#00B4A6]" />
                <span>Respondent Defense Line</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                Sovereignty &amp; Threshold Defense
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
                {currentAnalysis.respondentCore}
              </p>
            </div>
          </div>

          {/* Substantive Questions Accordion */}
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#007A70] font-bold">
                Appellate Inquiries
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
                Core Legal Issues for Memorial Submission
              </h3>
            </div>

            <div className="space-y-3">
              {currentAnalysis.substantiveIssues.map((issue, idx) => {
                const isOpen = openIssueIdx === idx;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-2xl border transition-all duration-200",
                      isOpen
                        ? "bg-white border-[#00B4A6]/50 shadow-md"
                        : "bg-[#F8F8FC] border-gray-200/80 hover:border-gray-300"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIssueIdx(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#E6F9F7] text-[#007A70] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          0{idx + 1}
                        </span>
                        <h4 className="font-heading font-bold text-base sm:text-lg text-[#1A1A2E]">
                          {issue.title}
                        </h4>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-5 h-5 text-[#5A5A6E] transition-transform duration-200",
                          isOpen && "rotate-90 text-[#00B4A6]"
                        )}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-1 space-y-3 border-t border-gray-100">
                            <span className="text-[11px] font-mono uppercase font-bold text-[#1E2A78] block">
                              Points for Oral Advocacy &amp; Written Submissions:
                            </span>
                            <ul className="space-y-2 text-xs sm:text-sm text-[#5A5A6E]">
                              {issue.questions.map((q, qIdx) => (
                                <li key={qIdx} className="flex items-start gap-2.5">
                                  <CheckCircle2 className="w-4 h-4 text-[#00B4A6] shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Governing Legal Authorities Strip */}
          <div className="p-6 rounded-2xl bg-[#070B19] text-white border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#00B4A6]">
              <BookOpen className="w-4 h-4" />
              <span>Mandatory Governing Treaties &amp; Authorities</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentAnalysis.governingTreaties.map((treaty, tIdx) => (
                <div
                  key={tIdx}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-200 flex items-start gap-2"
                >
                  <FileCheck className="w-4 h-4 text-[#00B4A6] shrink-0 mt-0.5" />
                  <span className="leading-snug">{treaty}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Information Notice */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
            Have inquiries regarding memorial citation standards?
          </h3>
          <p className="text-xs sm:text-sm text-[#5A5A6E]">
            Inspect our comprehensive Rules of Procedure detailing the OSCOLA citation system and Rule 1.1 anonymity safeguards.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" size="sm" href="/moot-cup/rules">
            Memorial Rules &amp; Rubric
          </Button>
          <Button variant="track-moot" size="sm" href="/moot-cup/clarifications">
            Clarifications Portal
          </Button>
        </div>
      </section>
    </div>
  );
}
