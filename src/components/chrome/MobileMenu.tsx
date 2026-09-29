'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { useRenderedAt, useSiteConfig } from '@/components/SiteConfigProvider';
import { lockScroll, unlockScroll } from '@/lib/motion/bridge';
import { prefersReducedMotion } from '@/lib/motion/policy';
import { navigationTree } from '@/lib/navigation';
import { eventPhase } from '@/lib/phase';
import { BrandMark } from './BrandMark';
import { isCurrentPath } from './nav-utils';
import { ThemeSwitch } from './ThemeSwitch';

type MenuState = 'closed' | 'open' | 'closing';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The phone and tablet navigation: a full-screen dialog. Three panels wipe
 * down like the page curtain, the rows rise out of their masks, and closing
 * plays the panels back up before the dialog unmounts.
 */
export function MobileMenu({
  open,
  onClose,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const site = useSiteConfig();
  const renderedAt = useRenderedAt();
  const pathname = usePathname();
  // The full set, not the header's: on a phone this is the only navigation.
  // Register has its own button at the foot of the menu.
  const groups = navigationTree(site.navigation, 'footer').filter((g) => g.href !== '/register');
  const registrationOpen = eventPhase(site, renderedAt) === 'registration-open';
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [state, setState] = useState<MenuState>(open ? 'open' : 'closed');
  if (open && state !== 'open') setState('open');
  if (!open && state === 'open') setState('closing');

  // Let the closing animation play, then unmount.
  useEffect(() => {
    if (state !== 'closing') return;
    const timer = setTimeout(() => setState('closed'), prefersReducedMotion() ? 0 : 320);
    return () => clearTimeout(timer);
  }, [state]);

  const requestClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onClose, triggerRef]);

  // Lock scrolling, trap focus, close on Escape.
  useEffect(() => {
    if (state !== 'open') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lockScroll('mobile-menu');
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      unlockScroll('mobile-menu');
    };
  }, [state, requestClose]);

  if (state === 'closed') return null;

  let row = 0;
  const rise = () => ({ '--i': row++ }) as CSSProperties;

  return (
    <div
      ref={menuRef}
      className="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
      data-state={state}
      data-lenis-prevent=""
    >
      <div className="mobile-menu__panels" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span key={index} className="mobile-menu__panel" style={{ '--i': index } as CSSProperties} />
        ))}
      </div>

      <div className="mobile-menu__top">
        <Link href="/" className="brand" onClick={requestClose}>
          <BrandMark className="brand__mark" />
          <span>GIMUN &amp; GMC</span>
        </Link>
        <button ref={closeRef} type="button" className="mobile-menu__close" aria-label="Close mobile menu" onClick={requestClose}>
          <X aria-hidden="true" strokeWidth={1.75} className="size-5" />
        </button>
      </div>

      <nav aria-label="Main navigation" className="mobile-menu__nav">
        <ul>
          <li className="mobile-menu__group">
            <span className="mobile-menu__mask">
              <Link
                href="/"
                className="mobile-menu__link mobile-menu__rise"
                style={rise()}
                aria-current={pathname === '/' ? 'page' : undefined}
                onClick={requestClose}
              >
                Home
              </Link>
            </span>
          </li>
          {groups.map((item) => (
            <li key={item.id} className="mobile-menu__group">
              <span className="mobile-menu__mask">
                <Link
                  href={item.href}
                  className="mobile-menu__link mobile-menu__rise"
                  style={rise()}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  onClick={requestClose}
                >
                  {item.label}
                </Link>
              </span>
              {item.dropdown.length > 0 && (
                <ul className="mobile-menu__children mobile-menu__rise" style={rise()}>
                  {item.dropdown.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={child.href}
                        className="mobile-menu__child"
                        aria-current={isCurrentPath(child.href, pathname) ? 'page' : undefined}
                        onClick={requestClose}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mobile-menu__bottom">
        <Link href="/register" className="mobile-menu__cta" onClick={requestClose}>
          {registrationOpen ? 'Register for GIMUN or GMC' : 'Registration status'}
          <span className="mobile-menu__cta-icon" aria-hidden="true">
            <ArrowRight strokeWidth={1.75} className="size-4" />
          </span>
        </Link>
        <ThemeSwitch variant="segmented" />
      </div>
    </div>
  );
}
