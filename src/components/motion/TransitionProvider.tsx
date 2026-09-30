'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { afterSwap, emitTransition, lockScroll, scrollTo, unlockScroll } from '@/lib/motion/bridge';
import { CURTAIN } from '@/lib/motion/tokens';
import { findCurtain, cover, hideLabel, reveal, setLabel, setPhase, settle } from '@/lib/motion/curtain-waapi';
import { motionTier } from '@/lib/motion/policy';
import { isTransitionable, routeLabel } from '@/lib/motion/routes';
import { PageCurtain } from './PageCurtain';

interface NavigateOptions {
  replace?: boolean;
  scroll?: boolean;
}

interface TransitionContextValue {
  navigate(href: string, options?: NavigateOptions): void;
}

export const TransitionContext = createContext<TransitionContextValue | null>(null);

function mainElement(): HTMLElement | null {
  return document.getElementById('main-content');
}

/** After a page change, start keyboard and screen-reader users at the content. */
function focusMain() {
  mainElement()?.focus({ preventScroll: true });
}

/**
 * Owns public-route transitions: the "stagger wipe" curtain on internal link
 * clicks. Admin pages never mount this provider, and Back/Forward stay
 * instant.
 *
 *  1. Cover: panels rise over the page; the old page turns inert.
 *  2. Covered: scroll to the top, then ask the router for the new page.
 *     The new page's first-paint entrances wait, paused.
 *  3. Arrived (pathname changed): the label lifts, the panels keep rising
 *     to reveal the new page, its entrances play, focus moves to <main>.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);
  const sourcePath = useRef(pathname);
  const coveredAt = useRef(0);
  const failsafe = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The pathname last seen by the arrival effect (safe under StrictMode's
  // double effect run, unlike a first-render flag).
  const seenPath = useRef(pathname);

  const openCurtain = useCallback(async (fast = false) => {
    if (!busy.current) return;
    busy.current = false;
    if (failsafe.current) clearTimeout(failsafe.current);
    failsafe.current = null;
    const main = mainElement();
    if (main) main.inert = false;
    const dom = findCurtain();
    if (dom) {
      const hold = fast ? 0 : Math.max(0, CURTAIN.minHold - (performance.now() - coveredAt.current));
      if (hold) await new Promise((resolve) => setTimeout(resolve, hold));
      setPhase(dom, 'revealing');
      emitTransition('revealing');
      if (!fast) await hideLabel(dom);
      if (main) delete main.dataset.transition;
      await reveal(dom, fast);
      settle(dom);
      setPhase(dom, 'idle');
    } else if (main) {
      delete main.dataset.transition;
    }
    emitTransition('idle');
    unlockScroll('page-curtain');
    afterSwap();
    focusMain();
  }, []);

  const navigate = useCallback(
    (href: string, options: NavigateOptions = {}) => {
      if (busy.current) return;
      const hash = href.includes('#');
      const go = (scroll: boolean | undefined) =>
        options.replace ? router.replace(href, { scroll }) : router.push(href, { scroll });

      const dom = motionTier() === 'none' ? null : findCurtain();
      if (!dom) {
        go(options.scroll);
        return;
      }

      busy.current = true;
      sourcePath.current = pathname;
      const main = mainElement();
      // Once the page is inert and busy, any failure must hand it back:
      // otherwise the page stays unclickable and every later navigation is
      // ignored. Open the curtain and navigate without it.
      const recover = () => {
        void openCurtain(true).catch(() => {
          busy.current = false;
          if (main) main.inert = false;
          unlockScroll('page-curtain');
        });
        go(options.scroll);
      };
      try {
        if (main) main.inert = true;
        setLabel(dom, routeLabel(href));
        setPhase(dom, 'covering');
        emitTransition('covering');
        lockScroll('page-curtain');
        // Plain anchors were never prefetched; start the request under the cover.
        router.prefetch(href);
      } catch {
        recover();
        return;
      }

      void cover(dom)
        .then(() => {
          if (!busy.current) return;
          coveredAt.current = performance.now();
          setPhase(dom, 'covered');
          emitTransition('covered');
          if (main) main.dataset.transition = 'covered';
          // Scroll now, while nothing is visible, so the new page (and anything
          // that measures scroll position during its first render) starts at
          // the top. Anchors let the router scroll to their target instead.
          if (!hash && options.scroll !== false) scrollTo(0, { immediate: true });
          go(hash ? options.scroll : false);
          failsafe.current = setTimeout(() => void openCurtain(true), CURTAIN.failsafe);
        })
        .catch(recover);
    },
    [openCurtain, pathname, router],
  );

  // The new page arrived: open the curtain. Without a curtain (reduced
  // motion, Back/Forward), still move focus to the new content.
  useEffect(() => {
    if (pathname === seenPath.current) return;
    seenPath.current = pathname;
    if (busy.current) {
      if (pathname !== sourcePath.current) void openCurtain();
      return;
    }
    focusMain();
  }, [openCurtain, pathname]);

  // Back/Forward mid-transition opens the curtain at once; a page restored
  // from the back/forward cache starts clean.
  useEffect(() => {
    const onPopState = () => {
      if (busy.current) void openCurtain(true);
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      busy.current = false;
      const dom = findCurtain();
      if (dom) {
        settle(dom);
        setPhase(dom, 'idle');
      }
      const main = mainElement();
      if (main) {
        main.inert = false;
        delete main.dataset.transition;
      }
      unlockScroll('page-curtain');
      emitTransition('idle');
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [openCurtain]);

  // Links that are not TransitionLinks (CMS content, plain <a>) get the
  // curtain too. Runs after React's handlers, so anything a component
  // already handled (defaultPrevented) is left alone.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
      if (anchor.closest('[data-no-transition]')) return;
      const href = anchor.getAttribute('href');
      if (!href || !isTransitionable(href, new URL(window.location.href))) return;
      event.preventDefault();
      navigate(href);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [navigate]);

  // Test and styling hook: transitions are wired up.
  useEffect(() => {
    document.documentElement.dataset.transitions = 'ready';
    return () => {
      delete document.documentElement.dataset.transitions;
      if (failsafe.current) clearTimeout(failsafe.current);
      unlockScroll('page-curtain');
    };
  }, []);

  const value = useMemo(() => ({ navigate }), [navigate]);

  return (
    <TransitionContext.Provider value={value}>
      <PageCurtain />
      {children}
    </TransitionContext.Provider>
  );
}
