'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/base-ui/input';
import { Button } from '@/components/base-ui/button';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { FaDiscord, FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import LogoIcon from '@/assets/logo-icon';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export interface PrincipalPartner {
  name: string;
  url: string;
}

export interface Footer2Props {
  logo: React.ReactNode;
  brandName: string;
  tagline: string;
  socialLinks: SocialLink[];
  socialText: string;
  linkGroups: FooterLinkGroup[];
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  copyright: string;
  floatingIcon?: React.ReactNode;
  principalPartners?: PrincipalPartner[];
  zeroPaymentNotice?: string;
  venueInfo?: string;
  eventDates?: string;
}

export function Footer2({
  logo,
  brandName,
  tagline,
  socialLinks,
  socialText,
  linkGroups,
  newsletterTitle,
  newsletterSubtitle,
  newsletterPlaceholder = 'Enter email address',
  newsletterButtonText = 'Subscribe',
  copyright,
  floatingIcon,
  principalPartners,
  zeroPaymentNotice,
  venueInfo,
  eventDates,
}: Footer2Props) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setIsSubscribed(true);
  };

  const renderLink = (link: FooterLink) => {
    const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto:');
    if (isExternal) {
      return (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-[#1E2A78] text-sm font-medium transition-colors flex items-center gap-1 group"
        >
          <span>{link.label}</span>
          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#FF6B35]" />
        </a>
      );
    }
    return (
      <Link
        href={link.href}
        className="text-slate-600 hover:text-[#1E2A78] text-sm font-medium transition-colors flex items-center gap-1 group"
      >
        <span>{link.label}</span>
        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#FF6B35]" />
      </Link>
    );
  };

  return (
    <footer className="bg-[#F8F8FC] w-full px-4 py-10 sm:px-6 lg:px-8 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl">
        {/* Optional Principal Partners Banner */}
        {principalPartners && principalPartners.length > 0 && (
          <div className="mb-6 px-6 py-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Principal Partners &amp; Sponsors
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {principalPartners.map((p, idx) => (
                <a
                  key={idx}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold tracking-tight transition-colors"
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Dual-Card Bento Grid */}
        <div className="flex flex-col gap-6 lg:flex-row items-stretch">
          {/* Left Card: Brand, Tagline, Dates & Socials */}
          <div className="bg-[#141D54] text-white flex min-h-[460px] shrink-0 flex-col justify-between rounded-[2.5rem] p-8 sm:p-12 lg:w-[420px] shadow-[0_20px_50px_-15px_rgba(20,29,84,0.3)] relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6B35]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00B4A6]/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="text-white shrink-0 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  {logo}
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight block text-white font-heading">
                    {brandName}
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-semibold">
                    Ghulam Ishaq Khan Institute
                  </span>
                </div>
              </div>

              <div className="mt-14 sm:mt-20">
                <h2 className="text-2xl leading-snug font-semibold sm:text-3xl text-white tracking-tight font-heading">
                  {tagline}
                </h2>

                {(eventDates || venueInfo) && (
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-xs font-mono text-white/80">
                    {eventDates && (
                      <p className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                        <span>{eventDates}</span>
                      </p>
                    )}
                    {venueInfo && (
                      <p className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00B4A6]" />
                        <span>{venueInfo}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-medium text-white/90">{socialText}</span>
              <div className="flex items-center gap-2">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-2.5 transition-all hover:scale-105 active:scale-95 flex items-center justify-center backdrop-blur-xs border border-white/10"
                    aria-label={social.label}
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Card: Links Matrix, Newsletter & Zero-Payment Notice */}
          <div className="bg-white border border-slate-200/90 shadow-[0_10px_35px_-10px_rgba(30,42,120,0.06)] relative flex flex-1 flex-col justify-between overflow-hidden rounded-[2.5rem] p-8 sm:p-12">
            {floatingIcon && (
              <div className="text-slate-900/[0.04] pointer-events-none absolute -top-12 -right-12 h-72 w-72 rotate-12">
                {floatingIcon}
              </div>
            )}

            {/* Link Groups Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
              {linkGroups.map((group, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-slate-900 font-semibold text-sm uppercase tracking-wider font-heading">
                    {group.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {group.links.map((link, lIdx) => (
                      <li key={lIdx}>{renderLink(link)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Row: Legal / Non-Payment Notice & Newsletter Subscription */}
            <div className="relative z-10 mt-14 pt-8 border-t border-slate-100 flex flex-col items-start justify-between gap-8 xl:flex-row xl:items-end">
              {/* Left Column: PRD §6.2 Zero-Payment notice & Copyright */}
              <div className="order-2 xl:order-1 space-y-3 max-w-lg">
                {zeroPaymentNotice && (
                  <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <ShieldCheck className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{zeroPaymentNotice}</p>
                  </div>
                )}
                <p className="text-slate-400 text-xs font-mono">{copyright}</p>
              </div>

              {/* Right Column: Newsletter Subscription */}
              <div className="order-1 w-full space-y-3 sm:max-w-md xl:order-2">
                <div className="space-y-1">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider font-mono">
                    {newsletterSubtitle}
                  </p>
                  <h3 className="text-slate-900 text-base font-bold font-heading">
                    {newsletterTitle}
                  </h3>
                </div>

                {isSubscribed ? (
                  <div className="flex items-center gap-2 p-3.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Subscribed! You will receive official conference circulars.</span>
                  </div>
                ) : (
                  <form className="relative flex items-center" onSubmit={handleSubscribe}>
                    <Input
                      type="email"
                      required
                      placeholder={newsletterPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-100/80 focus-visible:ring-[#1E2A78] text-slate-900 w-full rounded-full border-transparent py-6 pr-32 pl-6 shadow-[0_0_0_0.5px_rgba(0,0,0,0.03),0_2px_4px_0_rgba(0,0,0,0.05),inset_0_2px_0_0px_rgba(255,255,255,0.7)] outline-none focus-visible:border-none focus-visible:ring-2 placeholder:text-slate-400 text-sm"
                    />
                    <Button
                      type="submit"
                      className="bg-linear-to-r from-[#1E2A78] to-[#141D54] hover:from-[#141D54] hover:to-[#0F1640] text-white border-none absolute right-1.5 h-10 rounded-full px-5 text-xs font-semibold shadow-[0_2px_8px_rgba(30,42,120,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {newsletterButtonText}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Footer2Demo() {
  return (
    <div className="w-full">
      <Footer2
        logo={<LogoIcon className="size-8" />}
        brandName="Watermelon"
        tagline="Elevating teamwork to unprecedented heights."
        socialText="Connect with us"
        socialLinks={[
          {
            icon: <FaDiscord className="h-4 w-4" />,
            href: '#',
            label: 'Discord',
          },
          {
            icon: <FaXTwitter className="h-4 w-4" />,
            href: '#',
            label: 'X (Twitter)',
          },
          {
            icon: <FaLinkedin className="h-4 w-4" />,
            href: '#',
            label: 'LinkedIn',
          },
          {
            icon: <FaGithub className="h-4 w-4" />,
            href: '#',
            label: 'GitHub',
          },
        ]}
        linkGroups={[
          {
            title: 'Explore',
            links: [
              { label: 'Platform', href: '#' },
              { label: 'Solutions', href: '#' },
              { label: 'Integrations', href: '#' },
              { label: 'Pricing', href: '#' },
              { label: 'Changelog', href: '#' },
            ],
          },
          {
            title: 'Organization',
            links: [
              { label: 'About Us', href: '#' },
              { label: 'Careers', href: '#' },
              { label: 'Legal', href: '#' },
              { label: 'Privacy Policy', href: '#' },
            ],
          },
        ]}
        newsletterSubtitle="The future of work is here."
        newsletterTitle="Join the Watermelon platform."
        newsletterPlaceholder="Enter email address"
        newsletterButtonText="Subscribe"
        copyright="© 2026 Watermelon Inc. All rights reserved."
        floatingIcon={<LogoIcon className="h-full w-full fill-current" />}
      />
    </div>
  );
}

export default Footer2;
