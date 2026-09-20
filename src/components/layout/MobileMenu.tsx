'use client';

import React from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventPhase } from '@/lib/phase';
import { navigationTree } from '@/lib/navigation';
import { useSiteConfig } from '@/components/SiteConfigProvider';
import { Button } from '@/components/ui/Button';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function MobileMenu({ isOpen, onClose: requestClose, triggerRef }: MobileMenuProps) {
  const site=useSiteConfig();
  const navigation = navigationTree(site.navigation, 'mobile');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  const onClose = React.useCallback(() => {
    requestClose();
    requestAnimationFrame(() => triggerRef?.current?.focus());
  }, [requestClose, triggerRef]);

  React.useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
          return;
        }
        if (e.key !== 'Tab') return;
        const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      requestAnimationFrame(() => closeButtonRef.current?.focus());
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
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
          ref={menuRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-canvas/98 backdrop-blur-2xl flex flex-col md:hidden text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          {/* Header Bar inside Mobile Menu */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
            <Link
              href="/"
              onClick={onClose}
              className="font-heading text-lg font-bold text-white tracking-tight flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-crimson" />
              <span>GIMUN & GMC</span>
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close mobile menu"
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links with Staggered Fade */}
          <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            <Link
              href="/"
              onClick={onClose}
              className="block font-heading text-2xl font-bold text-white/90 hover:text-champagne transition-colors"
            >
              Home
            </Link>

            {navigation.map(item => item.dropdown.length ? <details key={item.id} className="py-2"><summary className="text-2xl font-bold cursor-pointer">{item.label}</summary><div className="pl-4 py-3 space-y-3">{item.dropdown.map(child => <Link key={child.id} href={child.href} onClick={onClose} className="block text-lg text-white/90">{child.label}</Link>)}</div></details> : <Link key={item.id} href={item.href} onClick={onClose} className="block text-2xl font-bold">{item.label}</Link>)}
          </nav>

          {/* Persistent Bottom Action */}
          <div className="p-6 border-t border-white/10 bg-raised/90">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              href="/register"
              onClick={onClose}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {eventPhase(site)==='registration-open'?'Register Now (No Payment)':'Registration status'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
