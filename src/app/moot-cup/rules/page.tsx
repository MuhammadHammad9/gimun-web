import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rules & Memorial Guidelines | GIKI Moot Court',
  description: 'Official competition rules and memorial formatting guidelines for the GIKI Moot Court.',
};

export default function MootRulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-secondary font-semibold">
          Competition Guidelines
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Rules & Memorial Guidelines
        </h1>
        <p className="text-neutral-gray text-base">
          Strict protocols governing memorial submissions, oral pleadings, bench questioning, and scoring.
        </p>
      </header>

      <div className="space-y-6 text-sm text-neutral-gray leading-relaxed">
        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3">
          <h2 className="text-xl font-heading font-bold text-ink">1. Memorial Anonymity</h2>
          <p>
            Memorials must not contain any reference identifying the team&apos;s institution, country of origin, or coach. Violations incur immediate score penalties.
          </p>
        </div>

        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3">
          <h2 className="text-xl font-heading font-bold text-ink">2. Word Count & Font Specifications</h2>
          <p>
            The Pleadings section shall not exceed 8,000 words. Footnotes must follow the standard Oxford Bluebook citation format. Body text must be Times New Roman 12pt with 1.5 line spacing.
          </p>
        </div>

        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3">
          <h2 className="text-xl font-heading font-bold text-ink">3. Oral Rounds Time Allocation</h2>
          <p>
            Each team is allocated 30 minutes per round. Both oralists must speak for at least 12 minutes. A maximum of 3 minutes may be reserved for rebuttal or sur-rebuttal.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/resources"
          className="inline-block px-6 py-3 rounded-button bg-secondary text-white font-medium hover:bg-secondary-hover transition-colors"
        >
          Download Official Rules Document (PDF)
        </Link>
      </div>
    </div>
  );
}
