
import { useSiteConfig } from '@/components/SiteConfigProvider';

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
} from "lucide-react";
import { FaFacebookF as Facebook, FaXTwitter as Twitter, FaInstagram as Instagram, FaLinkedinIn as Linkedin } from "react-icons/fa6";
import { footerColumns } from '@/lib/navigation';
import LogoIcon from "@/assets/logo-icon";
import type { SiteConfig, Sponsor } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";
import { getEventYear } from "@/lib/site-config";

export interface FooterColumnLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterColumnLink[];
}

export interface Footer27Props {
  siteConfig?: SiteConfig;
  sponsors?: Sponsor[];
  brandName?: string;
}


export function Footer27({
  siteConfig,
  brandName,
}: Footer27Props) {
  const liveSite = useSiteConfig();
  const columns = footerColumns;
  const eventYear = getEventYear(siteConfig || liveSite);
  const resolvedBrandName = brandName || siteConfig?.eventNames?.combined || `GIMUN & GMC ${eventYear}`;
  const socialIcons = [
    {
      icon: Facebook,
      label: "Facebook",
      href: siteConfig?.socialLinks?.facebook || "https://facebook.com/gimunofficial",
    },
    {
      icon: Twitter,
      label: "Twitter",
      href: "https://twitter.com/gimun_giki",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: siteConfig?.socialLinks?.instagram || "https://instagram.com/gimun_giki",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: siteConfig?.socialLinks?.linkedin || "https://linkedin.com/company/gimun-mootcup",
    },
  ];

  return (
    <footer
      className="relative w-full overflow-hidden bg-void font-sans antialiased selection:bg-champagne selection:text-void border-t border-champagne/20 pt-12 pb-6"
      aria-label="Site footer"
    >
      {/* ── Main Footer Content ─────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Main Grid: 4 cols for Brand | 8 cols for Nav */}
        <div
          className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12"
        >
          {/* Brand block — 4 cols */}
          <div
            className="flex flex-col gap-5 lg:col-span-4"
          >
            <div className="flex items-center gap-3">
              <LogoIcon className="size-9 flex-shrink-0 text-champagne" />
              <span className="font-bold text-lg tracking-[0.04em] text-white uppercase select-none font-heading">
                {resolvedBrandName}
              </span>
            </div>

            <p className="max-w-[320px] text-xs sm:text-[13px] leading-relaxed text-pretty text-text-3">
              {siteConfig?.footerBlurb || 'Student diplomacy and legal advocacy at GIKI, Topi.'}
            </p>

            {/* Quick Metadata Badges */}
            <div className="flex flex-col gap-2 pt-1 text-xs text-text-3 font-mono">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-brand-soft shrink-0" />
                <span>{formatDateRange(siteConfig?.eventDates?.start, siteConfig?.eventDates?.end)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-champagne shrink-0" />
                <span>GIKI Campus, Topi, Khyber Pakhtunkhwa</span>
              </div>
            </div>

            {/* Social Icons Strip */}
            <div className="flex items-center gap-2 pt-2">
              {socialIcons.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full bg-raised text-text-3 shadow-[0_0_0_1px_rgba(236,216,183,0.12)] transition-all duration-150 hover:bg-brand/40 hover:text-champagne hover:shadow-[0_0_0_1px_rgba(236,216,183,0.3)] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-champagne focus-visible:outline-none"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns — 8 cols */}
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:col-span-8"
          >
            <h2 className="sr-only">Site Directory &amp; Navigation</h2>
            {columns.map((col) => (
              <div
                key={col.title}
                className="flex flex-col gap-3.5"
              >
                <h3 className="text-xs font-bold tracking-[0.1em] text-champagne uppercase font-mono">
                  {col.title}
                </h3>

                <ul
                  className="flex flex-col gap-2.5"
                >
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-block text-xs sm:text-[13px] leading-snug text-text-3 transition-colors duration-150 hover:text-champagne focus-visible:text-champagne focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* ── Meta & Legal Section ─────────────────────────────────────── */}
        <div
          className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-champagne/10 pt-6 pb-6 text-xs text-text-3 sm:flex-row sm:items-center"
        >
          <p className="leading-relaxed">
            &copy; {eventYear} GIMUN &amp; GMC Organizing Committee. Ghulam Ishaq Khan Institute.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-text-3 font-mono">
            <span className="text-text-3">No Online Payment Required</span>
            <span className="text-text-4">&bull;</span>
            <Link
              href="/about/faq#fees"
              className="hover:text-champagne transition-colors underline-offset-2 hover:underline"
            >
              Payment Terms
            </Link>
            <span className="text-text-4">&bull;</span>
            <Link
              href="/contact"
              className="hover:text-champagne transition-colors underline-offset-2 hover:underline"
            >
              Inquiry Desk
            </Link>
            <span className="text-text-4">&bull;</span>
            <Link
              href="/privacy"
              className="hover:text-champagne transition-colors underline-offset-2 hover:underline"
            >
              Privacy &amp; Data
            </Link>
          </div>
        </div>
      </div>

      {/* ── Massive Wordmark (With Brand Heading Font Outfit) ─────────── */}
      <div className="relative w-full overflow-hidden border-t border-champagne/10 pt-6 pb-2" aria-hidden="true">
        <div className="flex w-full items-center justify-between gap-4 sm:gap-6 px-4 sm:px-8 md:px-12 select-none pointer-events-none">
          {/* Brand Logo Shield Icon on Left */}
          <div className="flex-shrink-0 self-center">
            <LogoIcon className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto text-champagne/20" />
          </div>

          {/* Crisp, non-stretched wordmark with Outfit display font */}
          <div className="flex-1 overflow-hidden">
            <span className="block text-right font-heading font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-champagne/30 via-brand/20 to-transparent text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-none uppercase whitespace-nowrap">
              GIMUN &amp; GMC
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer27;
