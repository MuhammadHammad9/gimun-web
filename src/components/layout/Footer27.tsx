"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Facebook01Icon,
  NewTwitterIcon,
  InstagramIcon,
  Linkedin01Icon,
  MapPinIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import LogoIcon from "@/assets/logo-icon";
import type { SiteConfig, Sponsor } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";

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

const defaultFooterColumns: FooterColumn[] = [
  {
    title: "GIMUN TRACK",
    links: [
      { label: "Platform Overview", href: "/gimun" },
      { label: "Committees & Topics", href: "/gimun/committees" },
      { label: "Rules of Procedure", href: "/gimun/rules" },
      { label: "Delegate Registration", href: "/register?track=gimun" },
    ],
  },
  {
    title: "GMC TRACK",
    links: [
      { label: "GMC Overview", href: "/moot-cup" },
      { label: "Problem Categories", href: "/moot-cup/categories" },
      { label: "Rules & Memorials", href: "/moot-cup/rules" },
      { label: "Bench Clarifications", href: "/moot-cup/clarifications" },
      { label: "Team Registration", href: "/register?track=moot-cup" },
    ],
  },
  {
    title: "EVENT HUB",
    links: [
      { label: "Four-Day Schedule", href: "/schedule" },
      { label: "Resource Archive", href: "/resources" },
      { label: "Announcements Feed", href: "/announcements" },
      { label: "Results & Awards", href: "/results" },
    ],
  },
  {
    title: "INSTITUTION",
    links: [
      { label: "About The Conclave", href: "/about" },
      { label: "Secretariat & Dais", href: "/about/team" },
      { label: "Campus & Venue Guide", href: "/about/venue" },
      { label: "Sponsors & Patrons", href: "/about/sponsors" },
      { label: "Visual Gallery", href: "/about/gallery" },
      { label: "Frequently Asked Questions", href: "/about/faq" },
      { label: "Contact Desk", href: "/contact" },
    ],
  },
];

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const riseUp: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 240, damping: 26, mass: 0.8 },
  },
};

const linkCascade: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03, delayChildren: 0.03 },
  },
};

const linkTrickle: Variants = {
  hidden: { opacity: 0, x: -6, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 350, damping: 30, mass: 0.6 },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Footer27({
  siteConfig,
  brandName = "GIMUN & GMC 2027",
}: Footer27Props) {
  const socialIcons = [
    {
      icon: Facebook01Icon,
      label: "Facebook",
      href: siteConfig?.socialLinks?.facebook || "https://facebook.com/gimunofficial",
    },
    {
      icon: NewTwitterIcon,
      label: "Twitter",
      href: "https://twitter.com/gimun_giki",
    },
    {
      icon: InstagramIcon,
      label: "Instagram",
      href: siteConfig?.socialLinks?.instagram || "https://instagram.com/gimun_giki",
    },
    {
      icon: Linkedin01Icon,
      label: "LinkedIn",
      href: siteConfig?.socialLinks?.linkedin || "https://linkedin.com/company/gimun-mootcup",
    },
  ];

  return (
    <footer
      className="relative w-full overflow-hidden bg-[#0a0a0a] font-sans antialiased selection:bg-white selection:text-black border-t border-white/10 pt-12 pb-6"
      aria-label="Site footer"
    >
      {/* ── Main Footer Content ─────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Main Grid: 4 cols for Brand | 8 cols for Nav */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12"
        >
          {/* Brand block — 4 cols */}
          <motion.div
            variants={riseUp}
            className="flex flex-col gap-5 lg:col-span-4"
          >
            <div className="flex items-center gap-3">
              <LogoIcon className="size-9 flex-shrink-0 text-white" />
              <span className="font-bold text-lg tracking-[0.04em] text-white uppercase select-none font-heading">
                {brandName}
              </span>
            </div>

            <p className="max-w-[320px] text-xs sm:text-[13px] leading-relaxed text-pretty text-neutral-400">
              Pakistan&apos;s premier collegiate diplomatic and legal advocacy championship hosted
              concurrently at the Ghulam Ishaq Khan Institute (GIKI), Topi.
            </p>

            {/* Quick Metadata Badges */}
            <div className="flex flex-col gap-2 pt-1 text-xs text-neutral-400 font-mono">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 text-accent shrink-0" />
                <span>{formatDateRange(siteConfig?.eventDates?.start, siteConfig?.eventDates?.end)}</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={MapPinIcon} className="size-3.5 text-secondary shrink-0" />
                <span>GIKI Campus, Topi, Khyber Pakhtunkhwa</span>
              </div>
            </div>

            {/* Social Icons Strip */}
            <div className="flex items-center gap-2 pt-2">
              {socialIcons.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full bg-white/5 text-neutral-400 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-150 hover:bg-white/10 hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  <HugeiconsIcon icon={icon} className="size-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Navigation columns — 8 cols */}
          <motion.nav
            variants={staggerContainer}
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:col-span-8"
          >
            <h2 className="sr-only">Site Directory &amp; Navigation</h2>
            {defaultFooterColumns.map((col) => (
              <motion.div
                key={col.title}
                variants={riseUp}
                className="flex flex-col gap-3.5"
              >
                <h3 className="text-xs font-bold tracking-[0.1em] text-white uppercase font-mono">
                  {col.title}
                </h3>

                <motion.ul
                  variants={linkCascade}
                  className="flex flex-col gap-2.5"
                >
                  {col.links.map((link) => (
                    <motion.li key={link.label} variants={linkTrickle}>
                      <Link
                        href={link.href}
                        className="inline-block text-xs sm:text-[13px] leading-snug text-neutral-400 transition-colors duration-150 hover:text-white focus-visible:text-white focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.nav>
        </motion.div>

        {/* ── Meta & Legal Section ─────────────────────────────────────── */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] pt-6 pb-6 text-xs text-neutral-400 sm:flex-row sm:items-center"
        >
          <p className="leading-relaxed">
            &copy; {new Date().getFullYear()} GIMUN &amp; GMC Organizing Committee. Ghulam Ishaq Khan Institute.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-mono">
            <span className="text-neutral-500">PRD &sect;6.2 Zero-Payment Compliant</span>
            <span className="text-neutral-700">&bull;</span>
            <Link
              href="/about/faq#fees"
              className="hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              Payment Terms
            </Link>
            <span className="text-neutral-700">&bull;</span>
            <Link
              href="/contact"
              className="hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              Inquiry Desk
            </Link>
            <span className="text-neutral-700">&bull;</span>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              Privacy &amp; Data
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Massive Wordmark (With Brand Heading Font Outfit) ─────────── */}
      <div className="relative w-full overflow-hidden border-t border-white/[0.06] pt-6 pb-2" aria-hidden="true">
        <div className="flex w-full items-center justify-between gap-4 sm:gap-6 px-4 sm:px-8 md:px-12 select-none pointer-events-none">
          {/* Brand Logo Shield Icon on Left */}
          <div className="flex-shrink-0 self-center">
            <LogoIcon className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto text-neutral-700/50" />
          </div>

          {/* Crisp, non-stretched wordmark with Outfit display font */}
          <div className="flex-1 overflow-hidden">
            <span className="block text-right font-heading font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-neutral-500/80 via-neutral-700/50 to-neutral-900/30 text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-none uppercase whitespace-nowrap">
              GIMUN &amp; GMC
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer27;
