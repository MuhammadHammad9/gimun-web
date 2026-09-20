'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

/**
 * Lenis smooth scroll, mounted once at the root.
 *
 * Deliberately opts *out* on three conditions, because this site's real
 * audience includes delegates on shared campus wifi and low-end Android
 * handsets, and hijacked scroll is the first thing that falls apart there:
 *
 *   - `prefers-reduced-motion: reduce`
 *   - coarse pointers (touch) — mobile browsers already have excellent native
 *     inertial scroll, and Lenis on touch costs a frame budget for nothing
 *   - devices reporting <= 4 logical cores
 *
 * When it opts out the page keeps native scrolling and every anchor link still
 * works, because we only set `scroll-behavior` through the `.lenis` classes.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const isLowPower =
      typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency <= 4;

    if (prefersReduced || isCoarse || isLowPower) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Matches --ease-out-expo in globals.css.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // In-page anchors have to go through Lenis, otherwise the browser's own
    // jump fights the virtual scroll position and the page ends up offset.
    const onAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      event.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -96 });
    };

    document.addEventListener('click', onAnchorClick);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  // Route changes must reset the virtual scroll position; Lenis does not
  // observe Next's client-side navigation on its own.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default SmoothScroll;
