import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getSiteConfig } from "@/lib/content";
import { ContactForm } from "@/components/forms/ContactForm";
import { Mail, MapPin, Clock, Headphones, ShieldCheck } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Contact Secretariat & Directorate | GIMUN & GMC 2027",
  description:
    "Reach out to our organizing team for inquiries regarding committee allocations, compromise clarifications, partnerships, or logistics.",
  path: "/contact",
});

export default function ContactPage() {
  const config = getSiteConfig();

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Concierge Hero */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-gray-200 border border-white/15">
              <Headphones className="w-3.5 h-3.5 text-[#00B4A6]" />
              Direct Communication Concierge
            </span>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              SLA: &lt; 12 Hour Response
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Get in Touch with the <span className="text-gradient-silver">Directorate</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            Have an inquiry regarding committee allocations, country matrix preferences, the 2027 GMC Compromis, corporate sponsorship, or campus arrival coordination? Transmit a message to the relevant department below.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-mono text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Secretariat Inquiries Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Desk Hours: 09:00 — 18:00 PKT</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#00B4A6]" />
              <span>GIKI Topi, Khyber Pakhtunkhwa</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Right Column: Directorate Channels & Campus Venue (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Department Inboxes */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-1 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-heading font-bold text-[#1A1A2E] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#1E2A78]" />
                  <span>Dedicated Department Desks</span>
                </h2>
                <p className="text-xs text-[#5A5A6E]">
                  Direct emails monitored continuously by corresponding directorate heads.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1 p-3 rounded-xl bg-gray-50/80">
                  <div className="font-mono uppercase text-[10px] text-[#5A5A6E] font-bold">
                    General Inquiries &amp; Secretariat
                  </div>
                  <a
                    href={`mailto:${config.contactEmails.general}`}
                    className="text-[#1E2A78] font-bold hover:underline block text-sm font-mono"
                  >
                    {config.contactEmails.general}
                  </a>
                </div>

                {config.contactEmails.gimun && (
                  <div className="space-y-1 p-3 rounded-xl bg-[#FFF0E8]/50 border border-[#FF6B35]/20">
                    <div className="font-mono uppercase text-[10px] text-[#FF6B35] font-bold">
                      GIMUN Secretariat (Committees &amp; Matrix)
                    </div>
                    <a
                      href={`mailto:${config.contactEmails.gimun}`}
                      className="text-[#FF6B35] font-bold hover:underline block text-sm font-mono"
                    >
                      {config.contactEmails.gimun}
                    </a>
                  </div>
                )}

                {config.contactEmails.mootCup && (
                  <div className="space-y-1 p-3 rounded-xl bg-[#E6F9F7]/50 border border-[#00B4A6]/20">
                    <div className="font-mono uppercase text-[10px] text-[#00B4A6] font-bold">
                      GMC Bench Directorate (Advocacy &amp; Briefs)
                    </div>
                    <a
                      href={`mailto:${config.contactEmails.mootCup}`}
                      className="text-[#00B4A6] font-bold hover:underline block text-sm font-mono"
                    >
                      {config.contactEmails.mootCup}
                    </a>
                  </div>
                )}

                {config.contactEmails.sponsorship && (
                  <div className="space-y-1 p-3 rounded-xl bg-gray-50/80">
                    <div className="font-mono uppercase text-[10px] text-[#1E2A78] font-bold">
                      Corporate Partnerships &amp; Media
                    </div>
                    <a
                      href={`mailto:${config.contactEmails.sponsorship}`}
                      className="text-[#1E2A78] font-bold hover:underline block text-sm font-mono"
                    >
                      {config.contactEmails.sponsorship}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Campus Venue Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-4">
              <h2 className="text-lg font-heading font-bold text-[#1A1A2E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B35]" />
                <span>Physical Campus Headquarters</span>
              </h2>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                {config.hostInstitution}
                <br />
                Topi 23640, Swabi District, Khyber Pakhtunkhwa, Pakistan
              </p>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-[#5A5A6E]">
                <span>M-1 Motorway Swabi Exit (14 km)</span>
                <a
                  href="/about/venue"
                  className="font-bold text-[#1E2A78] hover:text-[#FF6B35] transition-colors"
                >
                  Venue Guide &rarr;
                </a>
              </div>
            </div>

            {/* Governance Assurance */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                All inquiries are processed under strict institutional privacy protocols. You will receive an automated tracking reference upon submission.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
