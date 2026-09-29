'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { useRenderedAt, useSiteConfig } from '@/components/SiteConfigProvider';
import { canRegister, eventPhase } from '@/lib/phase';
import { navigationTree } from '@/lib/navigation';
import { formatEventDate } from '@/lib/site-config';
import { BrandMark } from './BrandMark';
import { MobileMenu } from './MobileMenu';
import { isCurrentPath } from './nav-utils';
import dynamic from 'next/dynamic';
import { QuickJumpButton } from './QuickJumpButton';
import { ThemeSwitch } from './ThemeSwitch';

// The panel art (and the geometry behind it) loads when a panel first opens.
const PanelArt = dynamic(() => import('./PanelArt'), { ssr: false });

type PanelKind = 'gimun' | 'gmc' | 'about';

/**
 * Fallback lead copy and art for a section panel, chosen by where the section
 * points rather than by its id, so an entry an editor re-creates keeps its art.
 * The copy shown is the navigation entry's own description when it has one.
 */
const PANEL_COPY: Record<PanelKind, string> = {
  gimun: 'Model United Nations. Represent a country in committee, on your own or with a delegation.',
  gmc: 'The GIKI Moot Court. Argue a case problem as a team before a bench of judges.',
  about: 'The event, the campus at Topi, and answers before you ask.',
};
function panelLead(href: string): { kind: PanelKind; copy: string } {
  const kind: PanelKind = href.startsWith('/gimun') ? 'gimun' : href.startsWith('/moot-cup') ? 'gmc' : 'about';
  return { kind, copy: PANEL_COPY[kind] };
}

const HIDE_AFTER = 480;
const noopSubscribe = () => () => {};

export function SiteHeader() {
  const site = useSiteConfig();
  const renderedAt = useRenderedAt();
  const pathname = usePathname();
  const items = navigationTree(site.navigation, 'header');
  const registrationOpen = eventPhase(site, renderedAt) === 'registration-open';
  const gimunOpen = canRegister(site, 'gimun', renderedAt);
  const mootOpen = canRegister(site, 'mootCup', renderedAt);

  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [panel, setPanel] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // A new page closes whatever was open.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPanel(null);
    setMenuOpen(false);
  }

  // Condense into the glass pill once the page moves; step out of the way
  // while reading down, come back on the way up. Attributes are written
  // straight to the element so scrolling never re-renders React.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      header.toggleAttribute('data-condensed', y > 24);
      const busy = header.hasAttribute('data-panel') || header.contains(document.activeElement);
      if (y < HIDE_AFTER || y < lastY - 6 || busy) header.removeAttribute('data-hidden');
      else if (y > lastY + 6) header.setAttribute('data-hidden', '');
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const reveal = () => header.removeAttribute('data-hidden');
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    header.addEventListener('focusin', reveal);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      header.removeEventListener('focusin', reveal);
    };
  }, []);

  // Click outside closes an open panel.
  useEffect(() => {
    if (!panel) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [panel]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const hoverOpen = (id: string) => (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(closeTimer.current);
    setPanel(id);
  };

  const hoverClose = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPanel(null), 150);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !panel) return;
    const toggle = headerRef.current?.querySelector<HTMLElement>(`[data-panel-toggle="${panel}"]`);
    setPanel(null);
    toggle?.focus();
  };

  // One highlight glides between the links under the pointer (fine pointers only).
  const glideTo = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return;
    const link = (event.target as Element).closest<HTMLElement>('.nav-link');
    if (!link) return;
    const nav = event.currentTarget;
    const from = nav.getBoundingClientRect();
    const to = link.getBoundingClientRect();
    nav.style.setProperty('--glide-x', `${to.left - from.left}px`);
    nav.style.setProperty('--glide-w', `${to.width}px`);
    nav.setAttribute('data-glide', '');
  };

  const onBlurWithin = (id: string) => (event: React.FocusEvent<HTMLElement>) => {
    if (panel === id && !event.currentTarget.contains(event.relatedTarget as Node | null)) setPanel(null);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="site-header"
        data-panel={panel ? '' : undefined}
        onKeyDown={onKeyDown}
      >
        <div className="site-header__bar">
          <Link href="/" className="brand">
            <BrandMark className="brand__mark" />
            <span>GIMUN &amp; GMC</span>
            <span className="brand__year">2027</span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="primary-nav"
            onPointerOver={glideTo}
            onPointerLeave={(event) => event.currentTarget.removeAttribute('data-glide')}
          >
            <span className="nav-glide" aria-hidden="true" />
            {items.map((item) => {
              const current = isCurrentPath(item.href, pathname);
              const lead = panelLead(item.href);
              const hasPanel = item.dropdown.length > 0;
              const open = panel === item.id;
              const panelId = `nav-panel-${item.id}`;
              return (
                <div
                  key={item.id}
                  className="nav-item"
                  data-has-panel={hasPanel ? '' : undefined}
                  data-open={open ? '' : undefined}
                  onPointerEnter={hasPanel ? hoverOpen(item.id) : undefined}
                  onPointerLeave={hasPanel ? hoverClose : undefined}
                  onBlur={hasPanel ? onBlurWithin(item.id) : undefined}
                  style={lead.kind === 'gimun' ? ({ '--nav-accent': 'var(--color-accent-gimun)' } as React.CSSProperties) : undefined}
                >
                  <Link href={item.href} className="nav-link" aria-current={current ? 'page' : undefined}>
                    {item.label}
                  </Link>
                  {hasPanel && (
                    <button
                      type="button"
                      className="nav-toggle"
                      data-panel-toggle={item.id}
                      aria-expanded={open}
                      aria-controls={open ? panelId : undefined}
                      aria-label={`${item.label} pages`}
                      onClick={() => setPanel(open ? null : item.id)}
                    >
                      <ChevronDown aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
                    </button>
                  )}
                  {hasPanel && open && (
                    <div id={panelId} className="mega">
                      <div className={lead.kind === 'about' ? 'mega__lead tone-deep' : 'mega__lead tone-crest'}>
                        <span className="mega__lead-title">{item.label}</span>
                        <p className="mega__lead-copy">{item.description || lead.copy}</p>
                        <Link href={item.href} className="mega__lead-link" onClick={() => setPanel(null)}>
                          {lead.kind === 'about' ? 'About the event' : `${item.label} overview`}
                          <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
                        </Link>
                        <PanelArt kind={lead.kind} />
                      </div>
                      <div className="mega__links">
                        {item.dropdown.map((child, index) => (
                          <Link
                            key={child.id}
                            href={child.href}
                            className="mega__link"
                            style={{ '--i': index } as React.CSSProperties}
                            aria-current={isCurrentPath(child.href, pathname) ? 'page' : undefined}
                            onClick={() => setPanel(null)}
                          >
                            <span className="mega__link-label">{child.label}</span>
                            {child.description && <span className="mega__link-copy">{child.description}</span>}
                          </Link>
                        ))}
                        <MegaFoot kind={lead.kind} onNavigate={() => setPanel(null)} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="header-actions">
            <QuickJumpButton />
            <ThemeSwitch />

            <div
              className="register register--wide"
              onPointerEnter={hoverOpen('register')}
              onPointerLeave={hoverClose}
              onBlur={onBlurWithin('register')}
            >
              <button
                type="button"
                className="register__button"
                data-panel-toggle="register"
                aria-haspopup="true"
                aria-expanded={panel === 'register'}
                onClick={() => setPanel(panel === 'register' ? null : 'register')}
              >
                {registrationOpen ? 'Register' : 'Registration status'}
                <ChevronDown aria-hidden="true" strokeWidth={2} className="size-3.5" />
              </button>
              {panel === 'register' && (
                <div className="register__menu">
                  <Link href="/register?track=gimun" className="register__track" onClick={() => setPanel(null)}>
                    <span className="register__track-dot bg-crimson" aria-hidden="true" />
                    <span>
                      <span className="register__track-name">GIMUN, Model UN</span>
                      <span className="register__track-state">{gimunOpen ? 'Applications open' : 'Registration closed'}</span>
                    </span>
                    <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4 text-text-3" />
                  </Link>
                  <Link href="/register?track=moot-cup" className="register__track" onClick={() => setPanel(null)}>
                    <span className="register__track-dot bg-champagne" aria-hidden="true" />
                    <span>
                      <span className="register__track-name">GMC, Moot Court</span>
                      <span className="register__track-state">{mootOpen ? 'Applications open' : 'Registration closed'}</span>
                    </span>
                    <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4 text-text-3" />
                  </Link>
                </div>
              )}
            </div>

            <Link href="/register" className="register-compact">
              {registrationOpen ? 'Register' : 'Status'}
            </Link>

            <button
              ref={menuToggleRef}
              type="button"
              className="menu-toggle"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="menu-toggle__lines" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenuPortal open={menuOpen} onClose={() => setMenuOpen(false)} triggerRef={menuToggleRef} />
    </>
  );
}

/**
 * The menu renders into <body>: the header moves with a transform when it
 * hides, and a fixed element inside a transformed parent would move with it.
 */
function MobileMenuPortal(props: { open: boolean; onClose: () => void; triggerRef: React.RefObject<HTMLButtonElement | null> }) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return null;
  return createPortal(<MobileMenu {...props} />, document.body);
}

/** A practical last row in each panel: the deadline and a direct way in. */
function MegaFoot({ kind, onNavigate }: { kind?: PanelKind; onNavigate: () => void }) {
  const site = useSiteConfig();
  if (!kind) return null;
  if (kind === 'about') {
    const email = site.contactEmails?.general;
    return (
      <div className="mega__foot">
        <span>{email ? `Questions: ${email}` : 'Questions before you apply?'}</span>
        <Link href="/contact" className="mega__foot-link" onClick={onNavigate}>
          Contact the organizers
          <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
        </Link>
      </div>
    );
  }
  const deadline = kind === 'gimun' ? site.registrationDeadlines.gimun : site.registrationDeadlines.mootCup;
  return (
    <div className="mega__foot">
      <span>Applications close {formatEventDate(deadline, { month: 'short' })}</span>
      <Link href={kind === 'gimun' ? '/register?track=gimun' : '/register?track=moot-cup'} className="mega__foot-link" onClick={onNavigate}>
        Apply for {kind === 'gimun' ? 'GIMUN' : 'GMC'}
        <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
      </Link>
    </div>
  );
}
