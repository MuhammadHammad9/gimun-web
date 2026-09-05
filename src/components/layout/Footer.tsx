import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import type { SiteConfig, Sponsor } from '@/lib/types';
import { formatDateRange } from '@/lib/utils';

export interface FooterProps {
  siteConfig?: SiteConfig;
  sponsors?: Sponsor[];
}

export function Footer({ siteConfig, sponsors }: FooterProps) {
  const topSponsors = sponsors?.filter((s) => s.tier === 'title' || s.tier === 'gold') || [];

  return (
    <footer className="bg-[#141D54] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tier Sponsors if present */}
        {topSponsors.length > 0 && (
          <div className="mb-12 pb-10 border-b border-white/10">
            <p className="text-xs font-mono uppercase tracking-widest text-white/60 mb-5 text-center sm:text-left">
              Principal Partners &amp; Sponsors
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8">
              {topSponsors.map((sp) => (
                <Link
                  key={sp.id}
                  href={sp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white font-bold text-sm tracking-tight"
                >
                  {sp.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Column 1 & 2: Branding & Dual Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF6B35]" />
              <span className="font-heading text-xl font-black text-white tracking-tight">
                GIMUN <span className="text-[#00B4A6]">&amp; GIKI MOOT CUP</span>
              </span>
            </div>

            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              Two flagship collegiate competitions hosted concurrently at the Ghulam Ishaq Khan Institute. One unified platform uniting diplomatic negotiation with appellate courtroom advocacy.
            </p>

            <div className="space-y-2 pt-2 text-xs text-white/80 font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B35] shrink-0" />
                <span>{siteConfig?.venue || 'GIKI Campus, Topi, KP, Pakistan'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#00B4A6] shrink-0" />
                <span>{formatDateRange(siteConfig?.eventDates?.start, siteConfig?.eventDates?.end)}</span>
              </div>
            </div>
          </div>

          {/* Column 3: GIMUN Track */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold">
              GIMUN Track
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/gimun" className="hover:text-white transition-colors">
                  Overview &amp; Eligibility
                </Link>
              </li>
              <li>
                <Link href="/gimun/committees" className="hover:text-white transition-colors">
                  Committees &amp; Topics
                </Link>
              </li>
              <li>
                <Link href="/gimun/rules" className="hover:text-white transition-colors">
                  Rules of Procedure
                </Link>
              </li>
              <li>
                <Link href="/register?track=gimun" className="hover:text-white transition-colors font-medium text-[#FF6B35]">
                  Delegate Registration →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Moot Cup Track */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-[#00B4A6] font-bold">
              Moot Cup Track
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/moot-cup" className="hover:text-white transition-colors">
                  Overview &amp; Format
                </Link>
              </li>
              <li>
                <Link href="/moot-cup/categories" className="hover:text-white transition-colors">
                  Problem Categories
                </Link>
              </li>
              <li>
                <Link href="/moot-cup/rules" className="hover:text-white transition-colors">
                  Rules &amp; Memorials
                </Link>
              </li>
              <li>
                <Link href="/moot-cup/clarifications" className="hover:text-white transition-colors">
                  Clarifications Log
                </Link>
              </li>
              <li>
                <Link href="/register?track=moot-cup" className="hover:text-white transition-colors font-medium text-[#00B4A6]">
                  Team Registration →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Logistics & Society */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-white/60 font-bold">
              Event Hub
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/schedule" className="hover:text-white transition-colors">
                  Full Schedule
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  Resource Library
                </Link>
              </li>
              <li>
                <Link href="/about/venue" className="hover:text-white transition-colors">
                  Venue &amp; Travel
                </Link>
              </li>
              <li>
                <Link href="/about/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Secretariat
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Socials, Copyright & Privacy Declaration */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/60">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-[#FF6B35] shrink-0" />
            <p className="max-w-xl text-center md:text-left">
              Registration on this site is strictly form-only. Payment collection occurs manually via verified institutional banking instructions following application review.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {siteConfig?.socialLinks?.instagram && (
              <Link
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
            )}
            {siteConfig?.socialLinks?.facebook && (
              <Link
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
            )}
            {siteConfig?.socialLinks?.linkedin && (
              <Link
                href={siteConfig.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </Link>
            )}
            {siteConfig?.contactEmails?.general && (
              <Link
                href={`mailto:${siteConfig.contactEmails.general}`}
                aria-label="Email"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-white/40 font-mono">
          &copy; {new Date().getFullYear()} GIMUN &amp; GIKI Moot Cup Organizing Committee. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
