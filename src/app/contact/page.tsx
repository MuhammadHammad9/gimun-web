import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/content';
import { ContactForm } from '@/components/forms/ContactForm';
import { Mail, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Secretariat & Directorate | GIMUN & GIKI Moot Cup',
  description:
    'Reach out to our organizing team for inquiries regarding committee allocations, compromise clarifications, partnerships, or logistics.',
};

export default function ContactPage() {
  const config = getSiteConfig();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10">
      <header className="space-y-3 max-w-2xl">
        <span className="text-xs font-mono uppercase text-primary font-semibold tracking-wider">
          Official Inquiries
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink tracking-tight">
          Get in Touch
        </h1>
        <p className="text-neutral-gray text-sm md:text-base leading-relaxed">
          Have an inquiry regarding committee allocations, legal compromise queries, sponsorship, or travel arrangements?
          Transmit a direct message to the relevant directorate below.
        </p>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        {/* Right Column: Directorate Channels & Campus Address (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 md:p-8 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-6">
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-heading font-bold text-ink flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>Direct Email Desks</span>
              </h2>
              <p className="text-xs text-neutral-gray">
                Dedicated email channels monitored daily by corresponding heads.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="font-mono uppercase text-[10px] text-neutral-gray font-semibold">
                  General Inquiries & Secretariat
                </div>
                <a
                  href={`mailto:${config.contactEmails.general}`}
                  className="text-primary font-semibold hover:underline block text-sm font-mono"
                >
                  {config.contactEmails.general}
                </a>
              </div>

              {config.contactEmails.gimun && (
                <div className="space-y-1">
                  <div className="font-mono uppercase text-[10px] text-accent font-semibold">
                    GIMUN Secretariat (Committees & Matrix)
                  </div>
                  <a
                    href={`mailto:${config.contactEmails.gimun}`}
                    className="text-accent font-semibold hover:underline block text-sm font-mono"
                  >
                    {config.contactEmails.gimun}
                  </a>
                </div>
              )}

              {config.contactEmails.mootCup && (
                <div className="space-y-1">
                  <div className="font-mono uppercase text-[10px] text-secondary font-semibold">
                    Moot Court Bench (Advocacy & Briefs)
                  </div>
                  <a
                    href={`mailto:${config.contactEmails.mootCup}`}
                    className="text-secondary font-semibold hover:underline block text-sm font-mono"
                  >
                    {config.contactEmails.mootCup}
                  </a>
                </div>
              )}

              {config.contactEmails.sponsorship && (
                <div className="space-y-1">
                  <div className="font-mono uppercase text-[10px] text-primary font-semibold">
                    Corporate Partnerships & Media
                  </div>
                  <a
                    href={`mailto:${config.contactEmails.sponsorship}`}
                    className="text-primary font-semibold hover:underline block text-sm font-mono"
                  >
                    {config.contactEmails.sponsorship}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-4">
            <h2 className="text-lg font-heading font-bold text-ink flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span>Campus Venue</span>
            </h2>
            <p className="text-xs text-neutral-gray leading-relaxed">
              {config.hostInstitution}
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-gray pt-3 border-t border-slate-100">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Secretariat Hours: 09:00 — 17:00 PKT (Mon–Fri)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
