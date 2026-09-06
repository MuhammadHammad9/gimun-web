import type { Metadata } from 'next';
import { getFAQ } from '@/lib/content';
import { FaqClient } from './FaqClient';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | GIMUN & GIKI Moot Cup 2026',
  description: 'Official answers to inquiries regarding delegation allocations, OSCOLA memorial standards, zero-payment registration policy, transport shuttles, and GIKI campus hostels.',
};

export default function FaqPage() {
  const faqs = getFAQ();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 text-primary border border-slate-200">
            Official Knowledge Base
          </span>
          <span className="text-xs font-mono text-neutral-gray uppercase tracking-wider">
            PRD §18.1
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-neutral-gray leading-relaxed">
          Comprehensive guidance for delegates, faculty advisors, oralists, and sponsoring institutions.
          Browse by category or search specific terms regarding parliamentary rules, memorial formatting,
          and GIKI campus logistics.
        </p>
      </header>

      {/* Interactive FAQ Client Island */}
      <FaqClient initialFaqs={faqs} />
    </div>
  );
}
