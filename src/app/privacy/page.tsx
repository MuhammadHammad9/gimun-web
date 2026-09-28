import { getSiteConfig } from '@/lib/content';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getEventYear } from '@/lib/site-config';
import { AnalyticsChoiceButton } from './AnalyticsChoiceButton';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Privacy & Data Handling | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  description: 'How GIMUN & GMC handles registration, contact, accessibility, and event-operations data.',
  path: '/privacy',
}); }

export default async function PrivacyPage() {
  const site=await getSiteConfig();
  return (
    <>
      <PageHero
        variant="utility"
        eyebrow={
          <span className="font-mono text-meta font-bold uppercase tracking-[0.14em] text-champagne">
            Public data notice
          </span>
        }
        title={'Privacy & Data Handling'}
        accentWords={['Data', 'Handling']}
        description="Registration, contact, and clarification information is collected only to review applications, coordinate event logistics, answer inquiries, and communicate official updates."
        actionsSlot={
          site.privacyNotice ? undefined : (
            <p className="inline-flex rounded-full border border-line-2 bg-crest px-3.5 py-1 text-xs font-semibold text-champagne">
              Draft notice — institutional retention and legal-contact terms are pending approval.
            </p>
          )
        }
      />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">

      {site.privacyNotice && <p className="whitespace-pre-wrap">{site.privacyNotice}</p>}
      <div className="space-y-8 rounded-2xl border border-champagne/25 bg-overlay/90 p-6 shadow-xl sm:p-10">
        <section className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-cream">What we collect</h2>
          <p className="text-sm leading-relaxed text-champagne/85">
            Depending on the form, this may include names, institutional details, contact information,
            delegate or team rosters, preferences, accessibility requirements, and the submitted message.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-cream">How it is used</h2>
          <p className="text-sm leading-relaxed text-champagne/85">
            The Organizing Committee uses this information for application review, allocation, venue and
            accommodation planning, official notices, and responses to inquiries. We do not publish rosters
            or sell participant information. Published award results and certificate verification links can show participant names; clarification answers may be published after editorial review.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-cream">Services that process your data</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-champagne/85">
            <li><strong className="text-cream">Supabase</strong> stores registrations, messages and admin records.</li>
            <li><strong className="text-cream">Resend</strong> delivers receipts, invoices, certificates and replies by email.</li>
            <li><strong className="text-cream">Upstash</strong> counts requests to stop form abuse. It stores a one-way hash of your IP address, not the address itself, for a few minutes.</li>
            <li><strong className="text-cream">Vercel</strong> hosts the website and keeps short-lived server logs.</li>
          </ul>
        </section>
        <section id="analytics" className="scroll-mt-28 space-y-3">
          <h2 className="font-heading text-2xl font-bold text-cream">Analytics and browser storage</h2>
          <p className="text-sm leading-relaxed text-champagne/85">
            Google Analytics runs only if you choose Allow in the analytics prompt; it then sets cookies to count
            visits, with IP anonymisation. Without your consent no analytics script is loaded. The site also keeps
            two small preferences in your browser: whether you dismissed the announcement bar, and your analytics
            choice. <AnalyticsChoiceButton />.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-cream">Retention and requests</h2>
          <p className="text-sm leading-relaxed text-champagne/85">
            Event staff retain records only for the period needed for administration, audit, and required
            institutional reporting. To request correction or deletion of a record, contact the Secretariat
            through the <Link className="font-semibold text-champagne hover:text-cream underline transition-colors" href="/contact">Inquiry Desk</Link>.
          </p>
        </section>
      </div>
      </div>
    </>
  );
}
