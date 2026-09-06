"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Facebook01Icon,
  NewTwitterIcon,
  InstagramIcon,
  Linkedin01Icon,
} from "@hugeicons/core-free-icons";
import LogoIcon from "@/assets/logo-icon";
import type { SiteConfig, Sponsor } from "@/lib/types";

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
  heroHeading?: React.ReactNode;
  heroDescription?: string;
  ctaText?: string;
  ctaHref?: string;
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
    title: "MOOT CUP",
    links: [
      { label: "Moot Court Overview", href: "/moot-cup" },
      { label: "Problem Categories", href: "/moot-cup/categories" },
      { label: "Rules & Memorials", href: "/moot-cup/rules" },
      { label: "Clarifications Log", href: "/moot-cup/clarifications" },
      { label: "Team Registration", href: "/register?track=moot-cup" },
    ],
  },
  {
    title: "EVENT HUB",
    links: [
      { label: "3-Day Schedule", href: "/schedule" },
      { label: "Resource Archive", href: "/resources" },
      { label: "Announcements Feed", href: "/announcements" },
      { label: "Results & Awards", href: "/results" },
    ],
  },
  {
    title: "ORGANIZATION",
    links: [
      { label: "About The Conclave", href: "/about" },
      { label: "Secretariat & Dais", href: "/about/team" },
      { label: "Campus & Venue Guide", href: "/about/venue" },
      { label: "Sponsors & Partners", href: "/about/sponsors" },
      { label: "Frequently Asked Questions", href: "/about/faq" },
      { label: "Contact Dais", href: "/contact" },
    ],
  },
];

const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.3, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Parent stagger container — staggers children with 100ms spacing.
 * Skill: Split & Stagger Enter Animations.
 */
const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

/**
 * Each staggered child rises up with opacity + blur.
 */
const riseUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 220, damping: 28, mass: 0.9 },
  },
};

/**
 * Tighter stagger for nav column links — 35ms cascade.
 */
const linkCascade: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.04 },
  },
};

const linkTrickle: Variants = {
  hidden: { opacity: 0, x: -8, filter: "blur(4px)" },
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
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Wordmark slams up with spring inertia.
 */
const wordmarkSlam: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 22, mass: 2.2 },
  },
};

export function Footer27({
  siteConfig,
  brandName = "GIMUN & MOOT CUP",
  heroHeading,
  heroDescription,
  ctaText = "Register Now",
  ctaHref = "/register",
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
      className="relative w-full overflow-hidden bg-[#0a0a0a] font-sans antialiased selection:bg-white selection:text-black border-t border-white/10"
      aria-label="Site footer"
    >
      {/* ── Atmospheric Hero Section with Gradient Overlay ────────────── */}
      <div className="relative w-full">
        <motion.img
          src="https://assets.watermelon.sh/footer-25.avif"
          alt="Dramatic golden-hour sunset over mountains reflecting GIKI Topi foothills"
          variants={imageReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="h-[300px] w-full object-cover object-center outline outline-1 -outline-offset-1 outline-white/10 sm:h-[360px] md:h-[420px] lg:h-[500px]"
        />

        {/* Gradient: transparent → solid dark. Pulls the image seamlessly into the footer. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 35%, rgba(10,10,10,0.65) 65%, #0a0a0a 100%)",
          }}
        />

        {/* Overlay text on the atmospheric image */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16"
        >
          <motion.h2
            variants={riseUp}
            className="max-w-xs text-3xl leading-[1.15] font-semibold tracking-[-0.02em] text-balance text-white sm:max-w-sm sm:text-4xl md:max-w-md md:text-5xl font-heading"
          >
            {heroHeading || (
              <>
                Two Flagship Tracks.
                <br />
                One Global Conclave.
              </>
            )}
          </motion.h2>

          <motion.p
            variants={riseUp}
            className="mt-3 max-w-[340px] sm:max-w-md text-sm leading-relaxed text-pretty text-white/70 sm:text-[15px]"
          >
            {heroDescription ||
              "GIMUN & GIKI Moot Cup unite future diplomats and courtroom advocates for 4 intensive days of parliamentary negotiation and appellate advocacy at GIKI."}
          </motion.p>

          <motion.div variants={riseUp} className="mt-5">
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pr-1.5 pl-5 text-sm font-medium text-black shadow-[0_0_0_1px_rgba(255,255,255,0.2)] transition-[background-color,box-shadow] duration-200 hover:bg-white/90 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.4)] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
            >
              {ctaText}
              <span className="flex size-7 items-center justify-center rounded-full bg-black/10 transition-transform duration-200 group-hover:translate-x-0.5">
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Main Footer Content ─────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1400px] px-6 pt-10 pb-0 sm:px-8 md:px-12 lg:px-16">
        {/* 12-column grid: 3 brand | 6 nav | 3 social */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8"
        >
          {/* Brand block — 3 cols */}
          <motion.div
            variants={riseUp}
            className="flex flex-col gap-5 sm:col-span-2 lg:col-span-3"
          >
            <div className="flex items-center gap-2.5">
              <LogoIcon className="size-9 flex-shrink-0 text-white" />
              <span className="font-semibold text-lg tracking-[0.05em] text-white uppercase select-none font-heading">
                {brandName}
              </span>
            </div>

            <p className="max-w-[240px] text-[13px] leading-relaxed text-pretty text-neutral-400">
              Two premier collegiate competitions hosted concurrently at the Ghulam Ishaq Khan Institute.
            </p>

            <Link
              href="/contact"
              className="inline-flex w-fit items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-white/5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.35)] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
            >
              Let&apos;s Connect
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>

          {/* Navigation columns — 6 cols */}
          <motion.nav
            variants={staggerContainer}
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:col-span-6 lg:ml-4"
          >
            {defaultFooterColumns.map((col) => (
              <motion.div
                key={col.title}
                variants={riseUp}
                className="flex flex-col gap-4"
              >
                <h3 className="text-xs font-bold tracking-[0.1em] text-white uppercase font-mono">
                  {col.title}
                </h3>

                <motion.ul
                  variants={linkCascade}
                  className="flex flex-col gap-[10px]"
                >
                  {col.links.map((link) => (
                    <motion.li key={link.label} variants={linkTrickle}>
                      <Link
                        href={link.href}
                        className="inline-block text-[13px] leading-snug text-neutral-400 transition-colors duration-150 hover:text-white focus-visible:text-white focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.nav>

          {/* Social / Connect block — 3 cols */}
          <motion.div
            variants={riseUp}
            className="flex flex-col gap-4 lg:col-span-3"
          >
            <h3 className="text-xl font-semibold text-balance text-white font-heading">
              Stay Connected
            </h3>
            <p className="max-w-[240px] text-[13px] leading-relaxed text-pretty text-neutral-400">
              Follow our channels for updates, committee allocations, and official conference circulars.
            </p>

            <div className="flex items-center gap-2">
              {socialIcons.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full bg-white/5 text-neutral-400 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-[background-color,color,box-shadow,transform] duration-150 hover:bg-white/10 hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
                >
                  <HugeiconsIcon icon={icon} className="size-[18px]" />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Meta & Legal Section ─────────────────────────────────────── */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] pt-5 pb-6 text-[13px] text-neutral-400 sm:flex-row sm:items-center"
        >
          <p className="leading-relaxed tabular-nums text-xs">
            &copy; {new Date().getFullYear()} GIMUN &amp; GIKI Moot Cup Organizing Committee. All rights reserved. (PRD &sect;6.2 Zero-Payment Compliant).
          </p>

          <div className="flex flex-wrap items-center gap-5 leading-none text-xs">
            <Link
              href="/about"
              className="transition-colors duration-150 hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              About Event
            </Link>
            <Link
              href="/gimun/rules"
              className="transition-colors duration-150 hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              Rules of Procedure
            </Link>
            <Link
              href="/about/faq"
              className="transition-colors duration-150 hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="transition-colors duration-150 hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Massive Wordmark ────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" aria-hidden="true">
        <motion.div
          variants={wordmarkSlam}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="flex w-full items-end select-none"
        >
          {/* Decorative logo icon — sits to the left of wordmark text */}
          <div className="flex-shrink-0 self-end px-4 pb-0 sm:px-6 lg:px-8">
            <LogoIcon className="h-[90px] w-auto text-neutral-700 sm:h-[120px] md:h-[120px] lg:h-[160px] xl:h-[180px]" />
          </div>

          {/* Wordmark with gradient fill */}
          <div className="flex-1 overflow-hidden">
            <svg
              className="h-auto w-full"
              viewBox="0 0 1000 170"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="wm-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0%" stopColor="#737373" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#171717" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              <text
                x="50%"
                y="90%"
                dominantBaseline="auto"
                textAnchor="middle"
                textLength="1000"
                lengthAdjust="spacingAndGlyphs"
                fontSize="140"
                fontWeight="800"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                letterSpacing="-0.025em"
                fill="url(#wm-gradient)"
              >
                GIMUN &amp; MOOT CUP
              </text>
            </svg>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export function Footer27Demo() {
  return (
    <div className="w-full">
      <Footer27 />
    </div>
  );
}

export default Footer27;
