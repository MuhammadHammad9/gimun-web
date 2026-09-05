import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Contact Secretariat & Inquiries | GIMUN & GIKI Moot Cup',
  description: 'Reach out to our organizing team for questions regarding registration, partnerships, or logistics.',
};

export default function ContactPage() {
  const config = getSiteConfig();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Get in Touch</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Contact Us
        </h1>
        <p className="text-neutral-gray text-base max-w-xl">
          Have an inquiry regarding committee allocations, legal compromise queries, or travel arrangements? Contact the relevant directorate below.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-4">
          <h2 className="text-xl font-heading font-bold text-ink">Direct Email Channels</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-mono uppercase text-neutral-gray">General Inquiries</div>
              <a href={`mailto:${config.contactEmails.general}`} className="text-primary font-semibold hover:underline">
                {config.contactEmails.general}
              </a>
            </div>
            {config.contactEmails.gimun && (
              <div>
                <div className="text-xs font-mono uppercase text-neutral-gray">GIMUN Secretariat</div>
                <a href={`mailto:${config.contactEmails.gimun}`} className="text-accent font-semibold hover:underline">
                  {config.contactEmails.gimun}
                </a>
              </div>
            )}
            {config.contactEmails.mootCup && (
              <div>
                <div className="text-xs font-mono uppercase text-neutral-gray">Moot Court Bench</div>
                <a href={`mailto:${config.contactEmails.mootCup}`} className="text-secondary font-semibold hover:underline">
                  {config.contactEmails.mootCup}
                </a>
              </div>
            )}
            {config.contactEmails.sponsorship && (
              <div>
                <div className="text-xs font-mono uppercase text-neutral-gray">Sponsorship & Media</div>
                <a href={`mailto:${config.contactEmails.sponsorship}`} className="text-primary font-semibold hover:underline">
                  {config.contactEmails.sponsorship}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-4">
          <h2 className="text-xl font-heading font-bold text-ink">Campus Address</h2>
          <p className="text-sm text-neutral-gray leading-relaxed">
            {config.hostInstitution}
          </p>
          <div className="text-xs font-mono text-neutral-gray pt-4 border-t border-slate-100">
            Office Hours: 09:00 — 17:00 PKT (Mon–Fri)
          </div>
        </div>
      </div>
    </div>
  );
}
