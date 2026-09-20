'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';
import { eventPhase } from '@/lib/phase';
import { navigationTree } from '@/lib/navigation';
import { useSiteConfig } from '@/components/SiteConfigProvider';
import { MobileMenu } from './MobileMenu';

interface NavbarProps {
  siteConfig?: SiteConfig;
}

export function Navbar({ siteConfig }: NavbarProps = {}) {
  const site = useSiteConfig();
  const registrationOpen=eventPhase(site)==='registration-open';
  const NAV_ITEMS = navigationTree(site.navigation, 'header');
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const registerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleRegisterEnter = () => {
    if (registerTimeoutRef.current) clearTimeout(registerTimeoutRef.current);
    setRegisterOpen(true);
  };

  const handleRegisterLeave = () => {
    registerTimeoutRef.current = setTimeout(() => setRegisterOpen(false), 150);
  };

  // Not wrapped in useCallback: `setMobileMenuOpen` is already referentially
  // stable, and the manual memo here prevented React Compiler from optimizing
  // this component at all.
  const handleMobileMenuClose = () => setMobileMenuOpen(false);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setActiveDropdown(null);
    setRegisterOpen(false);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (registerTimeoutRef.current) clearTimeout(registerTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <header onKeyDown={event => { if (event.key === 'Escape') { setActiveDropdown(null); setRegisterOpen(false); } }} className="relative z-40 px-3 sm:px-6 pt-3 pb-1 pointer-events-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto bg-canvas/92 backdrop-blur-xl border border-champagne/20 rounded-2xl shadow-[0_8px_32px_rgba(94,18,5,0.25)] px-4 sm:px-6 h-16 transition-all">
          {/* Logo / Brand Name */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-heading font-bold text-base tracking-tight shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne rounded-lg"
          >
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-crimson" title="GIMUN Track" />
              <span className="w-2.5 h-2.5 rounded-full bg-champagne" title="GMC Track" />
            </span>
            <span className="hidden sm:inline font-bold">
              {siteConfig?.eventNames?.combined || 'GIMUN & GMC'}
            </span>
            <span className="sm:hidden font-bold">GIMUN & GMC</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.label === 'Info'
                  ? pathname.startsWith('/about') || pathname.startsWith('/announcements') || pathname.startsWith('/contact')
                  : item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);

              const hasDropdown = Boolean(item.dropdown);

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasDropdown && handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                  onFocus={() => hasDropdown && handleMouseEnter(item.label)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setActiveDropdown(null);
                    }
                  }}
                >
                  <Link
                    aria-expanded={hasDropdown ? activeDropdown === item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    href={item.href}
                    className={`relative px-3 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-colors flex items-center gap-1 ${
                      isActive
                        ? 'text-champagne font-semibold'
                        : 'text-white/80 hover:text-champagne hover:bg-white/10'
                    }`}
                  >
                    {/* Shared layout id: the pill slides between sections on
                        navigation rather than cutting, which makes the change
                        of place legible on a 23-route site. */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-xl bg-white/15 shadow-sm"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
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
                          className="absolute left-0 mt-2 w-64 bg-raised/95 backdrop-blur-2xl border border-champagne/25 rounded-xl shadow-2xl p-2 z-50 overflow-hidden"
                        >
                          <div className="space-y-1">
                            {item.dropdown?.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setActiveDropdown(null)}
                                className="group block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-champagne transition-colors">
                                  <span>{sub.label}</span>
                                  {sub.trackBadge && (
                                    <span
                                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                        sub.trackBadge === 'GIMUN'
                                          ? 'bg-crimson/20 text-crimson-soft border border-crimson/40'
                                          : 'bg-champagne/20 text-champagne border border-champagne/40'
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

          {/* Right Action: Register Split-Dropdown + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Desktop: split-dropdown register button */}
            <div
              className="relative hidden md:block"
              onMouseEnter={handleRegisterEnter}
              onMouseLeave={handleRegisterLeave}
            >
              <button
                type="button"
                onClick={() => setRegisterOpen(!registerOpen)}
                className="btn-shimmer-gold flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                aria-haspopup="true"
                aria-expanded={registerOpen}
              >
                {registrationOpen?'Register':'Registration status'}
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${registerOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {registerOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 6 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="absolute right-0 mt-2 w-52 bg-raised/95 backdrop-blur-2xl border border-champagne/25 rounded-xl shadow-2xl p-2 z-50"
                  >
                    <p className="text-[10px] font-mono text-champagne/60 uppercase tracking-wider px-3 pt-1 pb-2">
                      Choose your track
                    </p>
                    <Link
                      href="/register?track=gimun"
                      onClick={() => setRegisterOpen(false)}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-crimson shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-crimson-soft transition-colors">GIMUN (Model UN)</div>
                        <div className="text-[10px] text-white/50">{site.registrationStatus.gimunOpen&&registrationOpen?'Diplomacy & debate':'Registration closed'}</div>
                      </div>
                    </Link>
                    <Link
                      href="/register?track=moot-cup"
                      onClick={() => setRegisterOpen(false)}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-champagne shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-champagne transition-colors">GMC (Moot Court)</div>
                        <div className="text-[10px] text-white/50">{site.registrationStatus.mootCupOpen&&registrationOpen?'Legal advocacy':'Registration closed'}</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile: plain register link */}
            <Link
              href="/register"
              className="btn-shimmer-gold md:hidden px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
            >
              {registrationOpen?'Register':'Registration status'}
            </Link>

            {/* Hamburger Button that morphs to X */}
            <button
              ref={mobileToggleRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
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
        onClose={handleMobileMenuClose}
        triggerRef={mobileToggleRef}
      />
    </>
  );
}
