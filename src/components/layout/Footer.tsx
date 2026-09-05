'use client';

import React from 'react';
import type { SiteConfig, Sponsor } from '@/lib/types';
import { Footer2, FooterLinkGroup, SocialLink } from './Footer2';
import LogoIcon from '@/assets/logo-icon';
import { FaInstagram, FaFacebook, FaLinkedin, FaEnvelope } from 'react-icons/fa6';

export interface FooterProps {
  siteConfig?: SiteConfig;
  sponsors?: Sponsor[];
}

export function Footer({ siteConfig }: FooterProps) {
  const socialLinks: SocialLink[] = [
    {
      icon: <FaInstagram className="h-4 w-4" />,
      href: siteConfig?.socialLinks?.instagram || 'https://instagram.com/gimun_giki',
      label: 'Instagram',
    },
    {
      icon: <FaFacebook className="h-4 w-4" />,
      href: siteConfig?.socialLinks?.facebook || 'https://facebook.com/gimunofficial',
      label: 'Facebook',
    },
    {
      icon: <FaLinkedin className="h-4 w-4" />,
      href: siteConfig?.socialLinks?.linkedin || 'https://linkedin.com/company/gimun-mootcup',
      label: 'LinkedIn',
    },
    {
      icon: <FaEnvelope className="h-4 w-4" />,
      href: siteConfig?.contactEmails?.general
        ? `mailto:${siteConfig.contactEmails.general}`
        : 'mailto:info@gimun-mootcup.org',
      label: 'Email',
    },
  ];

  const linkGroups: FooterLinkGroup[] = [
    {
      title: 'GIMUN Track',
      links: [
        { label: 'Platform Overview', href: '/gimun' },
        { label: 'Committees & Topics', href: '/gimun/committees' },
        { label: 'Rules of Procedure', href: '/gimun/rules' },
        { label: 'Delegate Registration', href: '/register?track=gimun' },
      ],
    },
    {
      title: 'Moot Cup',
      links: [
        { label: 'Moot Court Overview', href: '/moot-cup' },
        { label: 'Problem Categories', href: '/moot-cup/categories' },
        { label: 'Rules & Memorials', href: '/moot-cup/rules' },
        { label: 'Clarifications Log', href: '/moot-cup/clarifications' },
        { label: 'Team Registration', href: '/register?track=moot-cup' },
      ],
    },
    {
      title: 'Event Hub',
      links: [
        { label: '3-Day Schedule', href: '/schedule' },
        { label: 'Resource Archive', href: '/resources' },
        { label: 'Announcements', href: '/announcements' },
        { label: 'Results & Awards', href: '/results' },
      ],
    },
    {
      title: 'Organization',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Secretariat & Bench', href: '/about/team' },
        { label: 'Campus & Venue', href: '/about/venue' },
        { label: 'Sponsors & Partners', href: '/about/sponsors' },
        { label: 'Frequently Asked Questions', href: '/about/faq' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ];

  return (
    <Footer2
      logo={<LogoIcon className="size-8 text-primary-foreground" />}
      brandName="GIMUN & GIKI Moot Cup"
      tagline="Two Flagship Competitions. One Unrivaled Diplomatic and Legal Assembly."
      socialText="Connect with us"
      socialLinks={socialLinks}
      linkGroups={linkGroups}
      newsletterSubtitle="Official circulars & deadlines."
      newsletterTitle="Join the GIMUN & Moot Cup platform."
      newsletterPlaceholder="Enter email address"
      copyright="© 2027 GIMUN & GIKI Moot Cup. All rights reserved. Zero-payment compliant (PRD §6.2)."
      floatingIcon={<LogoIcon className="h-full w-full fill-current" />}
    />
  );
}

export { Footer2 };
export default Footer;
