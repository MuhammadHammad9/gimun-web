import type { Metadata } from 'next';
import { getFAQ } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | GIMUN & GIKI Moot Cup',
  description: 'Answers to common questions regarding registration, logistics, accommodation, and competition rules.',
};

export default function FaqPage() {
  const faqs = getFAQ();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Help Center</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Frequently Asked Questions
        </h1>
        <p className="text-neutral-gray text-base max-w-2xl">
          Quick clarity on rules, registration deadlines, transport, and event guidelines.
        </p>
      </header>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-2"
          >
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-neutral-gray font-semibold">
              {faq.category.replace('-', ' ')}
            </span>
            <h2 className="text-lg font-heading font-bold text-ink">{faq.question}</h2>
            <p className="text-sm text-neutral-gray leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
