'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { afterSwap, emitTransition, lockScroll, unlockScroll } from '@/lib/motion/bridge';
import { CURTAIN } from '@/lib/motion/tokens';
import { findCurtain, cover, hideLabel, reveal, setLabel, setPhase, settle } from '@/lib/motion/curtain-waapi';
import { motionTier } from '@/lib/motion/policy';
import { routeLabel } from '@/lib/motion/routes';
import { PageCurtain } from './PageCurtain';

interface NavigateOptions {
  replace?: boolean;
  scroll?: boolean;
}

interface TransitionContextValue {
  navigate(href: string, options?: NavigateOptions): void;
}

export const TransitionContext = createContext<TransitionContextValue | null>(null);

/** Owns public-route transitions. Admin pages never mount this provider. */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);
  const sourcePath = useRef(pathname);
  const coveredAt = useRef(0);
  const failsafe = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openCurtain = useCallback(async (fast = false) => {
    if (!busy.current) return;
    busy.current = false;
    if (failsafe.current) clearTimeout(failsafe.current);
    failsafe.current = null;
    const dom = findCurtain();
    if (dom) {
      const hold = Math.max(0, CURTAIN.minHold - (performance.now() - coveredAt.current));
      if (hold) await new Promise((resolve) => setTimeout(resolve, hold));
      setPhase(dom, 'revealing');
      emitTransition('revealing');
      await hideLabel(dom);
      await reveal(dom, fast);
      settle(dom);
      setPhase(dom, 'idle');
    }
    emitTransition('idle');
    unlockScroll('page-curtain');
    afterSwap();
  }, []);

  const navigate = useCallback((href: string, options: NavigateOptions = {}) => {
    if (busy.current) return;
    if (motionTier() === 'none') {
      if (options.replace) router.replace(href, { scroll: options.scroll });
      else router.push(href, { scroll: options.scroll });
      return;
    }

    const dom = findCurtain();
    if (!dom) {
      if (options.replace) router.replace(href, { scroll: options.scroll });
      else router.push(href, { scroll: options.scroll });
      return;
    }

    busy.current = true;
    sourcePath.current = pathname;
    setLabel(dom, routeLabel(href));
    setPhase(dom, 'covering');
    emitTransition('covering');
    lockScroll('page-curtain');

    void cover(dom).then(() => {
      if (!busy.current) return;
      coveredAt.current = performance.now();
      setPhase(dom, 'covered');
      emitTransition('covered');
      if (options.replace) router.replace(href, { scroll: options.scroll });
      else router.push(href, { scroll: options.scroll });
      failsafe.current = setTimeout(() => void openCurtain(true), CURTAIN.failsafe);
    });
  }, [openCurtain, pathname, router]);

  useEffect(() => {
    if (busy.current && pathname !== sourcePath.current) void openCurtain();
  }, [openCurtain, pathname]);

  useEffect(() => () => {
    if (failsafe.current) clearTimeout(failsafe.current);
    unlockScroll('page-curtain');
  }, []);

  const value = useMemo(() => ({ navigate }), [navigate]);

  return (
    <TransitionContext.Provider value={value}>
      <PageCurtain />
      {children}
    </TransitionContext.Provider>
  );
}

