'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [gimunOpen, setGimunOpen] = useState(false);
  const [mootOpen, setMootOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#1E2A78]/95 backdrop-blur-2xl flex flex-col md:hidden text-white"
        >
          {/* Header Bar inside Mobile Menu */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
            <Link
              href="/"
              onClick={onClose}
              className="font-heading text-lg font-bold text-white tracking-tight flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
              <span>GIMUN & MOOT CUP</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links with Staggered Fade */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            <Link
              href="/"
              onClick={onClose}
              className="block font-heading text-2xl font-bold text-white/90 hover:text-[#FF6B35] transition-colors"
            >
              Home
            </Link>

            {/* GIMUN Section */}
            <div>
              <button
                type="button"
                onClick={() => setGimunOpen(!gimunOpen)}
                className="w-full flex items-center justify-between font-heading text-2xl font-bold text-white/90 hover:text-[#FF6B35] transition-colors text-left"
              >
                <span>GIMUN (MUN)</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    gimunOpen ? 'rotate-180 text-[#FF6B35]' : ''
                  }`}
                />
              </button>
              {gimunOpen && (
                <div className="pl-4 mt-3 space-y-3 border-l-2 border-[#FF6B35]/40">
                  <Link
                    href="/gimun"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Overview & Eligibility
                  </Link>
                  <Link
                    href="/gimun/committees"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Committees & Topics
                  </Link>
                  <Link
                    href="/gimun/rules"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Rules of Procedure
                  </Link>
                </div>
              )}
            </div>

            {/* Moot Cup Section */}
            <div>
              <button
                type="button"
                onClick={() => setMootOpen(!mootOpen)}
                className="w-full flex items-center justify-between font-heading text-2xl font-bold text-white/90 hover:text-[#00B4A6] transition-colors text-left"
              >
                <span>GIKI Moot Cup</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    mootOpen ? 'rotate-180 text-[#00B4A6]' : ''
                  }`}
                />
              </button>
              {mootOpen && (
                <div className="pl-4 mt-3 space-y-3 border-l-2 border-[#00B4A6]/40">
                  <Link
                    href="/moot-cup"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Overview & Format
                  </Link>
                  <Link
                    href="/moot-cup/categories"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Problem Categories
                  </Link>
                  <Link
                    href="/moot-cup/rules"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Rules & Memorials
                  </Link>
                  <Link
                    href="/moot-cup/clarifications"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Clarifications Log
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/schedule"
              onClick={onClose}
              className="block font-heading text-2xl font-bold text-white/90 hover:text-[#FF6B35] transition-colors"
            >
              Schedule
            </Link>

            <Link
              href="/resources"
              onClick={onClose}
              className="block font-heading text-2xl font-bold text-white/90 hover:text-[#FF6B35] transition-colors"
            >
              Resource Hub
            </Link>

            {/* About Section */}
            <div>
              <button
                type="button"
                onClick={() => setAboutOpen(!aboutOpen)}
                className="w-full flex items-center justify-between font-heading text-2xl font-bold text-white/90 hover:text-[#FF6B35] transition-colors text-left"
              >
                <span>About</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    aboutOpen ? 'rotate-180 text-[#FF6B35]' : ''
                  }`}
                />
              </button>
              {aboutOpen && (
                <div className="pl-4 mt-3 space-y-3 border-l-2 border-white/20">
                  <Link
                    href="/about/team"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Secretariat & Team
                  </Link>
                  <Link
                    href="/about/venue"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Venue & Travel
                  </Link>
                  <Link
                    href="/about/faq"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    FAQ
                  </Link>
                  <Link
                    href="/about/sponsors"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Sponsors & Partners
                  </Link>
                  <Link
                    href="/about/gallery"
                    onClick={onClose}
                    className="block text-base text-white/80 hover:text-white"
                  >
                    Gallery & Press
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Persistent Bottom Action */}
          <div className="p-6 border-t border-white/10 bg-[#141D54]/50">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              href="/register"
              onClick={onClose}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Register Now (No Payment)
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
