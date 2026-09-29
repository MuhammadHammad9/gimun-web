import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getSiteConfig } from "@/lib/content";
import { ContactFormFromUrl } from "@/components/forms/ContactForm";
import { Mail, MapPin, Clock, Headphones, ShieldCheck } from "lucide-react";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Contact Organizing Team | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/contact',
  description:
    "Reach out to our organizing team for inquiries regarding committee allocations, case problems, partnerships, or logistics.",
}); }

export default async function ContactPage() {
  const config = (await getSiteConfig());

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Concierge Hero */}
      <PageHero
        variant="utility"
        title={'Contact the Organizing Team'}
        accentWords={['Organizing', 'Team']}
        description={'Have a question about eligibility, committee selection, the GMC case problem, sponsorship, or getting to campus? Send a message to the relevant team below.'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-champagne/20 text-champagne border border-line-2">
                        <Headphones className="w-3.5 h-3.5 text-champagne" />
                        Get in Touch
                      </span>
                      <span className="text-xs font-mono text-text-3 uppercase tracking-widest">
                        {config.replyTime || 'Replies are sent by the organizing team'}
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-mono text-text-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-champagne" />
                          <span>{config.checkinDesk || 'Contact us for current desk hours'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-champagne" />
                          <span>GIKI Topi, Khyber Pakhtunkhwa</span>
                        </div>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <ContactFormFromUrl />
          </div>

          {/* Right Column: Directorate Channels & Campus Venue (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Department Inboxes */}
            <div className="p-6 sm:p-8 rounded-2xl bg-overlay/90 border border-line shadow-xl space-y-6">
              <div className="space-y-1 pb-3 border-b border-line">
                <h2 className="text-lg font-display font-medium text-text flex items-center gap-2">
                  <Mail className="w-4 h-4 text-champagne" />
                  <span>Who to email</span>
                </h2>
                <p className="text-xs text-text-3">
                  Email the team that owns your question, or use the form.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1 p-3 rounded-xl bg-elevated border border-line">
                  <div className="font-mono uppercase text-[10px] text-text-3 font-bold">
                    General Inquiries &amp; Secretariat
                  </div>
                  <a
                    href={`mailto:${config.contactEmails.general}`}
                    className="text-text font-bold hover:text-champagne block text-sm font-mono transition-colors"
                  >
                    {config.contactEmails.general}
                  </a>
                </div>

                {config.contactEmails.gimun && (
                  <div className="space-y-1 p-3 rounded-xl bg-elevated border border-line">
                    <div className="font-mono uppercase text-[10px] text-text-3 font-bold">
                      GIMUN Secretariat (Committees &amp; Matrix)
                    </div>
                    <a
                      href={`mailto:${config.contactEmails.gimun}`}
                      className="text-text font-bold hover:text-champagne block text-sm font-mono transition-colors"
                    >
                      {config.contactEmails.gimun}
                    </a>
                  </div>
                )}

                {config.contactEmails.mootCup && (
                  <div className="space-y-1 p-3 rounded-xl bg-elevated border border-line">
                    <div className="font-mono uppercase text-[10px] text-text-3 font-bold">
                      GMC Bench Directorate (Advocacy &amp; Briefs)
                    </div>
                    <a
                      href={`mailto:${config.contactEmails.mootCup}`}
                      className="text-text font-bold hover:text-champagne block text-sm font-mono transition-colors"
                    >
                      {config.contactEmails.mootCup}
                    </a>
                  </div>
                )}

                {config.contactEmails.sponsorship && (
                  <div className="space-y-1 p-3 rounded-xl bg-elevated border border-line">
                    <div className="font-mono uppercase text-[10px] text-text-3 font-bold">
                      Corporate Partnerships &amp; Media
                    </div>
                    <a
                      href={`mailto:${config.contactEmails.sponsorship}`}
                      className="text-text font-bold hover:text-champagne block text-sm font-mono transition-colors"
                    >
                      {config.contactEmails.sponsorship}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Official social accounts, only those configured in settings */}
            {Object.values(config.socialLinks || {}).some(Boolean) && (
              <div className="p-6 rounded-2xl border border-line space-y-3">
                <h2 className="text-lg font-display font-medium text-text">Follow updates</h2>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {([['Instagram', config.socialLinks.instagram], ['Facebook', config.socialLinks.facebook], ['LinkedIn', config.socialLinks.linkedin], ['X (Twitter)', config.socialLinks.twitter]] as const)
                    .filter(([, href]) => href)
                    .map(([label, href]) => (
                      <li key={label}>
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-champagne underline-offset-4 hover:underline">
                          {label}<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Campus Venue Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-overlay/90 border border-line shadow-xl space-y-4">
              <h2 className="text-lg font-display font-medium text-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-champagne" />
                <span>Where we are</span>
              </h2>
              <p className="text-xs text-text-2 leading-relaxed">
                {config.hostInstitution}
                <br />
                Topi 23640, Swabi District, Khyber Pakhtunkhwa, Pakistan
              </p>
              <div className="pt-3 border-t border-line flex items-center justify-between text-xs font-mono text-text-3">
                <span>M-1 Motorway Swabi Exit (14 km)</span>
                <a
                  href="/about/venue"
                  className="font-bold text-champagne hover:text-text transition-colors"
                >
                  Venue Guide &rarr;
                </a>
              </div>
            </div>

            {/* Governance Assurance */}
            <div className="p-4 rounded-xl bg-overlay/90 border border-line text-xs text-text-2 flex items-start gap-2.5 shadow-md">
              <ShieldCheck className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
              <span>
                Messages are handled as described in our <a href="/privacy" className="underline underline-offset-2 hover:text-text">privacy notice</a> and used only to answer your question.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
