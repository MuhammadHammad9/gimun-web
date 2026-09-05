import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getFAQ } from "@/lib/content";
import { FaqClient } from "./FaqClient";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = constructMetadata({
  title: "Frequently Asked Questions | GIMUN & GMC 2027",
  description:
    "Official answers to inquiries regarding delegation allocations, OSCOLA memorial standards, zero-payment registration policy, transport shuttles, and GIKI campus hostels.",
  path: "/about/faq",
});

export default function FaqPage() {
  const faqs = getFAQ();

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric FAQ Hero */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-gray-200 border border-white/15">
              <HelpCircle className="w-3.5 h-3.5 text-[#FF6B35]" />
              Official Knowledge Base
            </span>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              PRD &bull; Codified FAQs
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Frequently Asked <span className="text-gradient-silver">Questions</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            Authoritative guidance for delegates, faculty advisors, oral advocates, and sponsoring institutions. Browse by category or search specific terms regarding parliamentary rules, memorial formatting, manual payment verification, and campus logistics.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button variant="secondary" href="/contact">
              Submit Direct Inquiry
            </Button>
            <Button variant="track-gimun" href="/gimun/rules">
              GIMUN RoP Guide
            </Button>
            <Button variant="track-moot" href="/moot-cup/rules">
              GMC Memorial Rules
            </Button>
          </div>
        </div>
      </section>

      {/* Main Interactive Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FaqClient initialFaqs={faqs} />
      </main>
    </div>
  );
}
