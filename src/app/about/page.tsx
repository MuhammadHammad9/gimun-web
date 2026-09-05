import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About the Conference | GIMUN & GIKI Moot Cup',
  description: 'Learn about the legacy, organizing body, and host institution at GIKI, Topi.',
};

export default function AboutOverviewPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Institutional Heritage</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          About the Events
        </h1>
        <p className="text-neutral-gray text-lg leading-relaxed">
          Hosted annually at the Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI), our twin flagship symposiums bring together Pakistan&apos;s premier young debaters, jurists, and diplomats.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4 pt-4">
        <Link
          href="/about/team"
          className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card hover:border-primary/30 transition-colors"
        >
          <h2 className="text-xl font-heading font-bold text-ink mb-2">Organizing Team</h2>
          <p className="text-sm text-neutral-gray">Meet the Secretariat, Executive Conveners, and Directorate.</p>
        </Link>
        <Link
          href="/about/venue"
          className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card hover:border-primary/30 transition-colors"
        >
          <h2 className="text-xl font-heading font-bold text-ink mb-2">Venue & Travel</h2>
          <p className="text-sm text-neutral-gray">Campus directions, shuttle services, and guest accommodation.</p>
        </Link>
        <Link
          href="/about/faq"
          className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card hover:border-primary/30 transition-colors"
        >
          <h2 className="text-xl font-heading font-bold text-ink mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-neutral-gray">Answers regarding rules, logistics, and eligibility.</p>
        </Link>
        <Link
          href="/about/sponsors"
          className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card hover:border-primary/30 transition-colors"
        >
          <h2 className="text-xl font-heading font-bold text-ink mb-2">Sponsors & Partners</h2>
          <p className="text-sm text-neutral-gray">Our institutional patrons and legal fraternity partners.</p>
        </Link>
      </div>
    </div>
  );
}
