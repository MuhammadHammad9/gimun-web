import React from 'react';
import type { SiteConfig, Sponsor } from '@/lib/types';
import { formatDateRange } from '@/lib/utils';
import { Footer2, FooterLinkGroup, SocialLink } from './Footer2';
import LogoIcon from '@/assets/logo-icon';
import { FaInstagram, FaFacebook, FaLinkedin, FaEnvelope } from 'react-icons/fa6';

export interface FooterProps {
  siteConfig?: SiteConfig;
  sponsors?: Sponsor[];
}

export function Footer({ siteConfig, sponsors }: FooterProps) {
  const topSponsors = sponsors
    ?.filter((s) => s.tier === 'title' || s.tier === 'gold')
    .map((s) => ({ name: s.name, url: s.url })) || [];

  const socialLinks: SocialLink[] = [
    ...(siteConfig?.socialLinks?.instagram
      ? [
          {
            icon: <FaInstagram className="w-4 h-4" />,
            href: siteConfig.socialLinks.instagram,
            label: 'Instagram',
          },
        ]
      : []),
    ...(siteConfig?.socialLinks?.facebook
      ? [
          {
            icon: <FaFacebook className="w-4 h-4" />,
            href: siteConfig.socialLinks.facebook,
            label: 'Facebook',
          },
        ]
      : []),
    ...(siteConfig?.socialLinks?.linkedin
      ? [
          {
            icon: <FaLinkedin className="w-4 h-4" />,
            href: siteConfig.socialLinks.linkedin,
            label: 'LinkedIn',
          },
        ]
      : []),
    ...(siteConfig?.contactEmails?.general
      ? [
          {
            icon: <FaEnvelope className="w-4 h-4" />,
            href: `mailto:${siteConfig.contactEmails.general}`,
            label: 'Email Secretariat',
          },
        ]
      : []),
  ];

  const linkGroups: FooterLinkGroup[] = [
    {
      title: 'GIMUN Track',
      links: [
        { label: 'Overview & Eligibility', href: '/gimun' },
        { label: 'Committees & Topics', href: '/gimun/committees' },
        { label: 'Rules of Procedure', href: '/gimun/rules' },
        { label: 'Delegate Registration →', href: '/register?track=gimun' },
      ],
    },
    {
      title: 'Moot Cup Track',
      links: [
        { label: 'Overview & Format', href: '/moot-cup' },
        { label: 'Problem Categories', href: '/moot-cup/categories' },
        { label: 'Rules & Memorials', href: '/moot-cup/rules' },
        { label: 'Clarifications Log', href: '/moot-cup/clarifications' },
        { label: 'Team Registration →', href: '/register?track=moot-cup' },
      ],
    },
    {
      title: 'Event Hub',
      links: [
        { label: '3-Day Schedule', href: '/schedule' },
        { label: 'Resource Library', href: '/resources' },
        { label: 'Announcements Feed', href: '/announcements' },
        { label: 'Results & Awards', href: '/results' },
      ],
    },
    {
      title: 'Organization',
      links: [
        { label: 'About Conclave', href: '/about' },
        { label: 'Secretariat & Dais', href: '/about/team' },
        { label: 'Campus & Travel Guide', href: '/about/venue' },
        { label: 'Sponsors & Partners', href: '/about/sponsors' },
        { label: 'Frequently Asked Questions', href: '/about/faq' },
        { label: 'Contact Dais', href: '/contact' },
      ],
    },
  ];

  const formattedDates = formatDateRange(
    siteConfig?.eventDates?.start || '2027-03-18',
    siteConfig?.eventDates?.end || '2027-03-21'
  );

  const floatingIconWatermark = (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full fill-current"
    >
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="3" opacity="0.35" />
      <circle
        cx="100"
        cy="100"
        r="75"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.25"
        strokeDasharray="6 6"
      />
      <path d="M100 25V175M25 100H175" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      {/* Laurel Wreath */}
      <path
        d="M70 65C55 80 55 120 70 135C80 145 90 150 100 155M130 65C145 80 145 120 130 135C120 145 110 150 100 155"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.25"
      />
      {/* Scales Beam */}
      <path d="M75 80H125M100 70V130M90 130H110" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <circle cx="100" cy="100" r="10" fill="currentColor" opacity="0.2" />
    </svg>
  );

  return (
    <Footer2
      logo={<LogoIcon className="w-8 h-8" />}
      brandName="GIMUN & GIKI MOOT CUP"
      tagline="Two Flagship Competitions. One Unrivaled Diplomatic and Legal Assembly."
      socialText="Official Channels"
      socialLinks={socialLinks}
      linkGroups={linkGroups}
      newsletterSubtitle="Stay informed with official circulars"
      newsletterTitle="Receive Conference Dispatches & Updates"
      newsletterPlaceholder="Enter institutional email address"
      newsletterButtonText="Subscribe"
      copyright={`© ${new Date().getFullYear()} GIMUN & GIKI Moot Cup Organizing Committee. Ghulam Ishaq Khan Institute. All rights reserved.`}
      floatingIcon={floatingIconWatermark}
      principalPartners={topSponsors}
      zeroPaymentNotice="Registration is strictly form-only (PRD §6.2). Payment collection occurs manually via verified institutional directives following delegate review."
      venueInfo={siteConfig?.venue || 'GIKI Campus, Topi, KP, Pakistan'}
      eventDates={formattedDates}
    />
  );
}

export { Footer2 };
export default Footer;
