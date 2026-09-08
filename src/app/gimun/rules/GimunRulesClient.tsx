"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Search,
  Sparkles,
  FileText,
  Volume2,
  Users2,
  Clock,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MotionItem {
  name: string;
  category: "point" | "debate" | "resolution" | "closure";
  purpose: string;
  interrupt: string;
  second: string;
  vote: string;
  precedence: number;
  proTip: string;
}

const MOTIONS_DATA: MotionItem[] = [
  {
    name: "Point of Personal Privilege",
    category: "point",
    purpose: "Audibility, room temperature, physical discomfort, or technical hindrance.",
    interrupt: "Yes (only for audibility)",
    second: "No",
    vote: "Dais Discretion",
    precedence: 1,
    proTip: "Raise your placard immediately if you cannot hear the speaker. Never wait until the speech concludes.",
  },
  {
    name: "Point of Order",
    category: "point",
    purpose: "Procedural error or violation of parliamentary rules by delegate or Dais.",
    interrupt: "Yes",
    second: "No",
    vote: "Dais Ruling",
    precedence: 2,
    proTip: "Use strictly for procedural breaches, never to debate or challenge the factual accuracy of a speech.",
  },
  {
    name: "Point of Parliamentary Inquiry",
    category: "point",
    purpose: "Question addressed to the Dais regarding RoP, agenda order, or next procedure.",
    interrupt: "No",
    second: "No",
    vote: "Dais Clarification",
    precedence: 3,
    proTip: "Entertained only when the floor is open between speeches. Great for clarifying voting majorities.",
  },
  {
    name: "Motion for Moderated Caucus",
    category: "debate",
    purpose: "Structured debate on a specific sub-topic with designated total time & individual speaker limit.",
    interrupt: "No",
    second: "Yes",
    vote: "Simple Majority (50% + 1)",
    precedence: 4,
    proTip: "Specify Topic, Total Time (e.g., 9 mins), and Individual Time (e.g., 45 secs). Must divide evenly.",
  },
  {
    name: "Motion for Unmoderated Caucus",
    category: "debate",
    purpose: "Informal suspension of formal rules for bilateral negotiations, alliance building, and drafting.",
    interrupt: "No",
    second: "Yes",
    vote: "Simple Majority (50% + 1)",
    precedence: 5,
    proTip: "Max recommended time is 15–20 minutes. Use to consolidate multiple working papers into single blocs.",
  },
  {
    name: "Motion to Introduce Working Paper",
    category: "resolution",
    purpose: "Distribute and project Dais-approved policy proposals without formal debate restrictions.",
    interrupt: "No",
    second: "Yes",
    vote: "Dais Discretion / Simple",
    precedence: 6,
    proTip: "Requires Dais approval number before introducing. Working papers do not require formal signatories.",
  },
  {
    name: "Motion to Introduce Draft Resolution",
    category: "resolution",
    purpose: "Formally introduce comprehensive resolution document approved by Dais with Sponsors & Signatories.",
    interrupt: "No",
    second: "Yes",
    vote: "Simple Majority (50% + 1)",
    precedence: 7,
    proTip: "Requires 2+ primary Sponsors and minimum 20% of committee present as Signatories.",
  },
  {
    name: "Motion to Enter Voting Procedure",
    category: "closure",
    purpose: "Close substantive debate immediately and move directly into voting on tabled draft resolutions.",
    interrupt: "No",
    second: "Yes",
    vote: "2/3 Majority Required",
    precedence: 8,
    proTip: "Once passed, committee doors lock, all note passing ceases, and no one may enter or exit the chamber.",
  },
];

const DEBATE_STAGES = [
  {
    id: "stage-1",
    step: "01",
    title: "Roll Call & Quorum",
    summary: "Establishment of voting rights and quorum threshold.",
    details:
      "The Dais reads the alphabetical country roster. Delegates state either 'Present' (preserves right to abstain on substantive resolutions) or 'Present and Voting' (relinquishes abstention right; must cast an affirmative 'Yes' or negative 'No' vote). Quorum requires 1/3 of assigned nations present.",
    icon: Users2,
    badge: "Opening Protocol",
  },
  {
    id: "stage-2",
    step: "02",
    title: "General Speakers List",
    summary: "The continuous parliamentary spine of committee debate.",
    details:
      "Default speaking time is 90 seconds. The GSL remains open across sessions. If a delegate concludes before time expires, they MUST yield remaining time: (1) to the Dais, (2) to another delegate, or (3) to Points of Information (questions from the floor).",
    icon: Clock,
    badge: "Continuous Debate",
  },
  {
    id: "stage-3",
    step: "03",
    title: "Caucusing Dynamics",
    summary: "Moderated sub-debates and unmoderated alliance building.",
    details:
      "When the floor is open between GSL speeches, delegates motion for Moderated Caucuses to drill down on specific clauses, or Unmoderated Caucuses to walk freely, negotiate alliances, draft operative clauses, and merge bloc ideas.",
    icon: Volume2,
    badge: "Substantive Strategy",
  },
  {
    id: "stage-4",
    step: "04",
    title: "Resolution Drafting",
    summary: "Transformation of ideas into formal UN draft resolutions.",
    details:
      "Blocs compile preambulatory and operative clauses. Once vetted by the Dais for formatting and mandate legality, the document is assigned a Draft Resolution code (e.g., DR 1.1) and formally introduced to the entire chamber.",
    icon: FileText,
    badge: "Diplomatic Output",
  },
  {
    id: "stage-5",
    step: "05",
    title: "Strict Voting Procedure",
    summary: "Amendments, roll-call voting, and adoption of resolutions.",
    details:
      "Requires a 2/3 majority motion to close debate. Room security locks all doors. Delegates first vote on friendly and unfriendly amendments, then on draft resolutions in order of tabling. Friendly amendments with all sponsors' consent pass automatically.",
    icon: Vote,
    badge: "Final Adoption",
  },
];

export function GimunRulesClient() {
  const [activeStage, setActiveStage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredMotions = MOTIONS_DATA.filter((m) => {
    const matchesCat = categoryFilter === "all" || m.category === categoryFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.proTip.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-16">
      {/* 1. INTERACTIVE PARLIAMENTARY LIFECYCLE FLOW */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#C84815] font-bold">
              Procedural Blueprint
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#1A1A2E] mt-0.5">
              The 5 Stages of Parliamentary Debate
            </h2>
          </div>
          <span className="text-xs font-mono text-[#5A5A6E]">
            Click any phase to inspect rules &amp; delegate strategy
          </span>
        </div>

        {/* Step Selector Horizontal Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {DEBATE_STAGES.map((stg, idx) => {
            const Icon = stg.icon;
            const isSelected = activeStage === idx;

            return (
              <button
                key={stg.id}
                onClick={() => setActiveStage(idx)}
                className={cn(
                  "p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group relative",
                  isSelected
                    ? "bg-[#070B19] border-[#FF6B35] text-white shadow-lg ring-1 ring-[#FF6B35]/40"
                    : "bg-white border-gray-200 hover:border-gray-300 text-[#1A1A2E] hover:bg-gray-50/80"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "text-xs font-mono font-bold",
                      isSelected ? "text-[#FFA27B]" : "text-[#5A5A6E]"
                    )}
                  >
                    {stg.step}
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-[#FF6B35]/20 text-[#FFA27B]"
                        : "bg-gray-100 text-[#5A5A6E] group-hover:text-[#1A1A2E]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <h3
                    className={cn(
                      "text-xs sm:text-sm font-heading font-bold leading-tight",
                      isSelected ? "text-white" : "text-[#1A1A2E]"
                    )}
                  >
                    {stg.title}
                  </h3>
                  <span
                    className={cn(
                      "text-[10px] font-mono block mt-1",
                      isSelected ? "text-gray-300" : "text-[#5A5A6E]"
                    )}
                  >
                    {stg.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep-Dive Showcase Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="double-bezel"
          >
            <div className="double-bezel-inner p-6 sm:p-8 space-y-5 bg-radial-glow-orange">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0E8] text-[#A83A11] font-mono font-extrabold flex items-center justify-center text-sm">
                    {DEBATE_STAGES[activeStage].step}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#1A1A2E]">
                      {DEBATE_STAGES[activeStage].title}
                    </h3>
                    <p className="text-xs font-mono text-[#C84815] font-bold uppercase">
                      {DEBATE_STAGES[activeStage].badge}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-gray-100 text-[#5A5A6E]">
                  Official GIMUN Harvard Protocol
                </span>
              </div>

              <div className="grid md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-8 space-y-3">
                  <span className="text-xs font-mono uppercase font-bold text-[#1E2A78] block">
                    Procedural Standard:
                  </span>
                  <p className="text-sm text-[#1A1A2E] leading-relaxed">
                    {DEBATE_STAGES[activeStage].details}
                  </p>
                </div>

                <div className="md:col-span-4 p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#C84815] uppercase font-mono">
                    <Sparkles className="w-4 h-4" />
                    <span>Secretariat Pro-Tip</span>
                  </div>
                  <p className="text-xs text-[#5A5A6E] leading-relaxed">
                    {activeStage === 0 &&
                      "If you plan to abstain during substantive resolutions to safeguard neutrality, declare yourself 'Present'. If you say 'Present and Voting', abstention is forfeited."}
                    {activeStage === 1 &&
                      "Always yield unspent GSL seconds to Points of Information to demonstrate command of your country's position and earn Dais evaluation marks."}
                    {activeStage === 2 &&
                      "Keep moderated caucus topic scopes tight (e.g. 'Border Verification Measures' rather than 'General Security') so speeches remain actionable."}
                    {activeStage === 3 &&
                      "Avoid sponsor bloat. Too many sponsors makes amending clauses difficult later. A strong resolution has 2–3 active primary authors."}
                    {activeStage === 4 &&
                      "During roll-call voting, you can pass on the first round if uncertain, but upon the second call you must vote Yes or No with no further passing."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 2. SEARCHABLE PARLIAMENTARY MOTIONS CHEAT SHEET */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#C84815] font-bold">
              Floor Motions Reference
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#1A1A2E] mt-0.5">
              Motions &amp; Points Precedence Matrix
            </h2>
          </div>
          <div className="text-xs font-mono text-[#5A5A6E]">
            {filteredMotions.length} Motions Available
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search motions (e.g., caucus, order, yield)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-xs bg-white text-[#1A1A2E] placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: "all", label: "All Motions" },
              { id: "point", label: "Points" },
              { id: "debate", label: "Debate & Caucus" },
              { id: "resolution", label: "Resolutions" },
              { id: "closure", label: "Closures" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer",
                  categoryFilter === tab.id
                    ? "bg-[#1E2A78] text-white shadow-xs"
                    : "bg-gray-100 text-[#5A5A6E] hover:bg-gray-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Motions Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMotions.map((item) => (
            <div
              key={item.name}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:border-[#FF6B35]/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-[#FFF0E8] text-[#A83A11] border border-[#FF6B35]/20">
                    Precedence Rank #{item.precedence}
                  </span>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#1A1A2E] mt-1.5 leading-snug">
                    {item.name}
                  </h3>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded",
                    item.interrupt.startsWith("Yes")
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {item.interrupt.startsWith("Yes") ? "Interrupts" : "No Interrupt"}
                </span>
              </div>

              <p className="text-xs text-[#5A5A6E] leading-relaxed">{item.purpose}</p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500 block text-[9px] uppercase">Second Required</span>
                  <strong className="text-[#1A1A2E] font-bold">{item.second}</strong>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500 block text-[9px] uppercase">Vote Required</span>
                  <strong className="text-[#C84815] font-bold">{item.vote}</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8F8FC] border border-gray-100 text-xs text-[#5A5A6E] flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C84815] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-snug">{item.proTip}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. YIELD PROTOCOL BLUEPRINT */}
      <section className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C84815] font-bold">
            Floor Management
          </span>
          <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
            The Three Yield Protocols (GSL Speeches)
          </h2>
          <p className="text-xs text-[#5A5A6E] mt-1">
            When concluding your substantive speech on the General Speakers List before time expires, you must formally yield the floor in one of three ways:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0E8] text-[#A83A11] flex items-center justify-center font-bold text-xs font-mono">
                01
              </div>
              <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                Yield to the Chair
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Relinquishes any remaining seconds back to the Dais. The floor reopens immediately for new motions or the next country on the GSL. No questions or rebuttals may be directed to you.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#C84815] font-semibold">
                &ldquo;Delegate of France yields remaining time to the Chair.&rdquo;
              </div>
            </div>
          </div>

          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0E8] text-[#A83A11] flex items-center justify-center font-bold text-xs font-mono">
                02
              </div>
              <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                Yield to Another Delegate
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Transfers remaining seconds directly to an allied nation. The recipient must accept or decline. If accepted, they may speak for the remainder of your time but CANNOT yield again.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#C84815] font-semibold">
                &ldquo;Yields remaining time to the distinguished delegate of Japan.&rdquo;
              </div>
            </div>
          </div>

          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0E8] text-[#A83A11] flex items-center justify-center font-bold text-xs font-mono">
                03
              </div>
              <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                Yield to Points of Information
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Invites questions from the committee floor. The Dais recognizes delegates who pose non-argumentative questions. Answers are deducted from your remaining time pool until depleted.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#C84815] font-semibold">
                &ldquo;Yields remaining time to Points of Information.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BOTTOM ACTION CALLOUT */}
      <section className="p-8 sm:p-10 rounded-2xl bg-[#070B19] text-white border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow-orange opacity-40 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-mono uppercase text-[#FFA27B] font-bold tracking-wider">
              Official Literature
            </span>
            <h3 className="text-xl sm:text-3xl font-heading font-extrabold text-white">
              Download the Full GIMUN RoP Handbook
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Contains complete codified clauses on working paper formatting, committee caucusing etiquette, and resolution amendment precedence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="track-gimun"
              size="md"
              href="/documents/gimun/GIMUN_Rules_of_Procedure.pdf"
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF Handbook
            </Button>
            <Button variant="secondary" size="md" href="/gimun/committees">
              Explore Committees
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
