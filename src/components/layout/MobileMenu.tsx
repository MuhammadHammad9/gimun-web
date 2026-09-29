'use client';

import React from 'react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { X, ArrowRight, ChevronDown } from 'lucide-react';
import { eventPhase } from '@/lib/phase';
import { navigationTree } from '@/lib/navigation';
import { useRenderedAt, useSiteConfig } from '@/components/SiteConfigProvider';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function MobileMenu({ isOpen, onClose: requestClose, triggerRef }: MobileMenuProps) {
  const site=useSiteConfig();
  const renderedAt = useRenderedAt();
  // The full set, not the reduced header set: on a phone this menu is the
  // only navigation, so anything that exists has to be reachable from it.
  const navigation = navigationTree(site.navigation, 'footer');
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

  // No exit animation: the overlay unmounts on close. Keeping AnimatePresence
  // for a 200ms fade-out is not worth shipping framer-motion in the chrome
  // bundle on every route.
  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="pop-in fixed inset-0 z-50 flex flex-col bg-canvas/98 text-text backdrop-blur-xl md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
          {/* Header Bar inside Mobile Menu */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-line">
            <Link
              href="/"
              onClick={onClose}
              className="font-heading text-lg font-bold text-text tracking-tight flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-crimson" />
              <span>GIMUN & GMC</span>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close mobile menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-2 bg-raised/80 text-text hover:bg-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav Links with Staggered Fade */}
          <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            <Link
              href="/"
              onClick={onClose}
              className="block font-heading text-2xl font-bold text-text hover:text-champagne transition-colors"
            >
              Home
            </Link>

            {navigation.map((item) =>
              item.dropdown.length ? (
                <details key={item.id} className="group border-b border-line py-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-2xl font-bold text-text transition-colors hover:text-champagne">
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className="h-5 w-5 text-text-4 transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <div className="space-y-3 py-4 pl-1">
                    {/* The section's own page. Without this the parent was a
                        toggle only, and /gimun and /moot-cup could not be
                        reached at all from a phone. */}
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block text-lg font-medium text-champagne"
                    >
                      {item.label} overview
                    </Link>
                    {item.dropdown.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        onClick={onClose}
                        className="block text-lg text-text-2 transition-colors hover:text-text"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="block border-b border-line py-3 text-2xl font-bold text-text transition-colors hover:text-champagne"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Persistent Bottom Action */}
          <div className="p-6 border-t border-line bg-raised/90">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              href="/register"
              onClick={onClose}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {eventPhase(site, renderedAt) === 'registration-open' ? 'Register' : 'Registration status'}
            </Button>
          </div>
    </div>
  );
}
