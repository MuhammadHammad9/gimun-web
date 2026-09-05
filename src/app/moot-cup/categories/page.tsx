import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Scale,
  Download,
  Calendar,
  FileText,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { getMootCategories, getDocuments } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Problem Categories & Compromis | GIKI Moot Court 2027',
  description:
    'Examine the substantive areas of law, factual propositions, and download the official 2027 Moot Court Compromis.',
};

export default function MootCategoriesPage() {
  const categories = getMootCategories();
  const documents = getDocuments();
  const propositionDoc = documents.find((d) => d.type === 'proposition') || documents[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <TrackBadge track="moot-cup" />
          <span className="text-xs font-mono text-[#5A5A6E] uppercase tracking-wider">
            Substantive Jurisprudence
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          Moot Problem Categories
        </h1>
        <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed">
          The 2027 GIKI Moot Court Competition presents multifaceted propositions spanning public international law, comparative constitutionalism, and extraterritorial technology governance. Download the official Compromis below and review the published legal issues.
        </p>
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
          <Button variant="secondary" href="/moot-cup/clarifications">
            View Clarifications Log
          </Button>
        </div>
      </header>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-[#E6F9F7] border border-[#00B4A6]/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#00B4A6] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-[#5A5A6E]">
          <strong className="text-[#1A1A2E] font-semibold">Substantive Compromis Notice:</strong>{' '}
          All registered teams must review both the factual compromise and the official Clarifications Log before memorial submission. Questions regarding ambiguous factual paragraphs may be submitted via the Clarifications portal until the stated deadline.
        </div>
      </div>

      {/* Problem Categories Detailed List */}
      <div className="space-y-8">
        {categories.map((cat, idx) => (
          <ScrollReveal key={cat.id} delay={idx * 0.1}>
            <div className="double-bezel">
              <div className="double-bezel-inner p-8 sm:p-10 space-y-6 border-l-4 border-l-[#00B4A6]">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-[#E6F9F7] text-[#00B4A6] border border-[#00B4A6]/20">
                      {cat.areaOfLaw}
                    </span>
                    <span className="text-xs font-mono text-[#5A5A6E]">
                      Track Category #{idx + 1}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#5A5A6E] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Version Date: {cat.lastUpdated}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A1A2E]">
                    {cat.name}
                  </h2>
                  <p className="text-sm sm:text-base text-[#5A5A6E] mt-3 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Key Legal Questions Tested */}
                <div className="p-5 rounded-xl bg-[#F8F8FC] border border-gray-100 space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1E2A78] block">
                    Core Legal Issues for Memorial Drafting:
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#1A1A2E]">
                    <li className="flex items-start gap-2">
                      <Scale className="w-4 h-4 text-[#00B4A6] shrink-0 mt-0.5" />
                      <span>Jurisdiction of the Court under customary international law and treaty opt-in clauses.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Scale className="w-4 h-4 text-[#00B4A6] shrink-0 mt-0.5" />
                      <span>Proportionality of state countermeasures and sovereign immunity over dual-use digital assets.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Scale className="w-4 h-4 text-[#00B4A6] shrink-0 mt-0.5" />
                      <span>Remedies, declaratory relief, and cross-border restitution standards.</span>
                    </li>
                  </ul>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <Link
                      href="/moot-cup/rules"
                      className="text-[#1E2A78] hover:text-[#00B4A6] font-semibold inline-flex items-center gap-1"
                    >
                      <span>Memorial Citation Guidelines</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      href="/moot-cup/clarifications"
                      className="text-[#00B4A6] hover:underline font-semibold"
                    >
                      Ask a Clarification
                    </Link>
                  </div>

                  <Button
                    variant="track-moot"
                    size="sm"
                    href={`/register?track=moot-cup&category=${cat.id}`}
                  >
                    Register Team for this Category
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Bottom Section */}
      <section className="pt-6">
        <div className="p-8 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
              Have questions regarding memorial formatting or bench procedures?
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A6E]">
              Read our official memorial specifications or submit questions to the Convening Committee.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" href="/moot-cup/rules">
              View Rules &amp; Formatting
            </Button>
            <Button variant="track-moot" size="sm" href="/register?track=moot-cup">
              Team Registration
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
