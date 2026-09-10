import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy & Data Handling | GIMUN & GMC 2027',
  description: 'How GIMUN & GMC handles registration, contact, accessibility, and event-operations data.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Public data notice</p>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Privacy &amp; Data Handling
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-gray">
          Registration, contact, and clarification information is collected only to review applications,
          coordinate event logistics, answer inquiries, and communicate official updates.
        </p>
      </header>

      <div className="space-y-8 rounded-section border border-whisper-border bg-white p-6 shadow-card sm:p-10">
        <section className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-ink">What we collect</h2>
          <p className="text-sm leading-relaxed text-neutral-gray">
            Depending on the form, this may include names, institutional details, contact information,
            delegate or team rosters, preferences, accessibility requirements, and the submitted message.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-ink">How it is used</h2>
          <p className="text-sm leading-relaxed text-neutral-gray">
            The Organizing Committee uses this information for application review, allocation, venue and
            accommodation planning, official notices, and responses to inquiries. We do not publish rosters
            or sell participant information.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-ink">Retention and requests</h2>
          <p className="text-sm leading-relaxed text-neutral-gray">
            Event staff retain records only for the period needed for administration, audit, and required
            institutional reporting. To request correction or deletion of a record, contact the Secretariat
            through the <a className="font-semibold text-primary underline" href="/contact">Inquiry Desk</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
