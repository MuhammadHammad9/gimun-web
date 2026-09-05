import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rules of Procedure | GIMUN 2026',
  description: 'Official rules of parliamentary procedure governing debate at GIMUN 2026.',
};

export default function GimunRulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-accent font-semibold">GIMUN Protocol</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Rules of Procedure
        </h1>
        <p className="text-neutral-gray text-base">
          Standardized parliamentary order based on modified HMUN protocols tailored for diplomatic efficacy.
        </p>
      </header>

      <section className="space-y-6 text-sm text-neutral-gray leading-relaxed">
        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3">
          <h2 className="text-xl font-heading font-bold text-ink">1. Roll Call & Quorum</h2>
          <p>
            At the beginning of each session, the Chair shall call the roll of delegates. A simple majority of voting members shall constitute quorum for formal debate.
          </p>
        </div>

        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3">
          <h2 className="text-xl font-heading font-bold text-ink">2. Moderated & Unmoderated Caucusing</h2>
          <p>
            Delegates may motion for a Moderated Caucus specifying total duration, speaking time per delegate, and a focused topic. Unmoderated caucuses allow informal drafting of working papers.
          </p>
        </div>

        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3">
          <h2 className="text-xl font-heading font-bold text-ink">3. Working Papers & Draft Resolutions</h2>
          <p>
            Working papers require approval from the Dais before official distribution as Draft Resolutions. All documents must adhere to standard UN clause formatting.
          </p>
        </div>
      </section>

      <div className="pt-4">
        <Link
          href="/resources"
          className="inline-block px-6 py-3 rounded-button bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
        >
          Download Full RoP Handbook (PDF)
        </Link>
      </div>
    </div>
  );
}
