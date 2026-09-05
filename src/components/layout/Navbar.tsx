'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';
import { MobileMenu } from './MobileMenu';

interface NavDropdownItem {
  label: string;
  href: string;
  description?: string;
  trackBadge?: 'GIMUN' | 'MOOT CUP';
}

interface NavItem {
  label: string;
  href: string;
  dropdown?: NavDropdownItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'GIMUN',
    href: '/gimun',
    dropdown: [
      { label: 'Track Overview', href: '/gimun', description: 'Diplomatic simulation at GIKI' },
      { label: 'Committees Directory', href: '/gimun/committees', description: 'UNSC, DISEC, & agendas', trackBadge: 'GIMUN' },
      { label: 'Rules of Procedure', href: '/gimun/rules', description: 'Standard parliamentary order' },
    ],
  },
  {
    label: 'Moot Cup',
    href: '/moot-cup',
    dropdown: [
      { label: 'Track Overview', href: '/moot-cup', description: 'National appellate advocacy' },
      { label: 'Problem Categories', href: '/moot-cup/categories', description: 'Areas of law & compromis', trackBadge: 'MOOT CUP' },
      { label: 'Rules & Memorials', href: '/moot-cup/rules', description: 'Formatting & bench criteria' },
      { label: 'Clarifications Log', href: '/moot-cup/clarifications', description: 'Official rulings & Q&A' },
    ],
  },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Resources', href: '/resources' },
  {
    label: 'About',
    href: '/about',
    dropdown: [
      { label: 'About the Events', href: '/about', description: 'Conference background & history' },
      { label: 'Organizing Team', href: '/about/team', description: 'Secretariat & Conveners' },
      { label: 'Venue & Travel', href: '/about/venue', description: 'GIKI Campus, Swabi' },
      { label: 'Frequently Asked Questions', href: '/about/faq', description: 'Eligibility, fees, & logistics' },
      { label: 'Sponsors & Partners', href: '/about/sponsors', description: 'Academic & legal patrons' },
      { label: 'Gallery & Press', href: '/about/gallery', description: 'Visual archives & media' },
    ],
  },
];

interface NavbarProps {
  siteConfig?: SiteConfig;
}

export function Navbar({ siteConfig }: NavbarProps = {}) {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-1 pointer-events-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto bg-[#1E2A78]/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_8px_32px_rgba(20,29,84,0.2)] px-4 sm:px-6 h-16 transition-all">
          {/* Logo / Brand Name */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-heading font-bold text-base tracking-tight shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] rounded-lg"
          >
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" title="GIMUN Track" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00B4A6]" title="Moot Cup Track" />
            </span>
            <span className="hidden sm:inline font-bold">
              {siteConfig?.eventNames?.combined || 'GIMUN & GIKI MOOT CUP'}
            </span>
            <span className="sm:hidden font-bold">GIMUN & MOOT</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              const hasDropdown = Boolean(item.dropdown);

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasDropdown && handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all flex items-center gap-1 ${
                      isActive
                        ? 'text-white bg-white/15 shadow-sm font-semibold'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{item.label}</span>
                    {hasDropdown && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu with Spring Scale-in */}
                  {hasDropdown && (
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96, y: 6 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className="absolute left-0 mt-2 w-64 bg-[#141D54]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-2 z-50 overflow-hidden"
                        >
                          <div className="space-y-1">
                            {item.dropdown?.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setActiveDropdown(null)}
                                className="group block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-[#FF6B35] transition-colors">
                                  <span>{sub.label}</span>
                                  {sub.trackBadge && (
                                    <span
                                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                        sub.trackBadge === 'GIMUN'
                                          ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                                          : 'bg-[#00B4A6]/20 text-[#00B4A6]'
                                      }`}
                                    >
                                      {sub.trackBadge}
                                    </span>
                                  )}
                                </div>
                                {sub.description && (
                                  <p className="text-[11px] text-white/60 leading-tight mt-0.5">
                                    {sub.description}
                                  </p>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action: Register Button + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-[#FF6B35] hover:bg-[#E55A28] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_2px_12px_rgba(255,107,53,0.4)] hover:shadow-[0_4px_16px_rgba(255,107,53,0.6)] active:scale-[0.98]"
            >
              Register
            </Link>

            {/* Hamburger Button that morphs to X */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
                <span
                  className={`block w-5 h-0.5 bg-white rounded-full transition-transform duration-200 ${
                    mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-white rounded-full transition-opacity duration-200 ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-white rounded-full transition-transform duration-200 ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
