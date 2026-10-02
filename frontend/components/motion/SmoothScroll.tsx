'use client';

import { useEffect } from 'react';
import { afterLoad, whenIdle } from '@frontend/motion/gates';
import { motionTier, onTierChange } from '@frontend/motion/policy';

/**
 * Loads Lenis on the full motion tier only (fine pointer, 1024 px and up,
 * motion allowed): after the page has loaded and gone idle, or at the first
 * wheel turn, whichever comes first. Touch devices keep native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    let stop: (() => void) | undefined;
    let loading = false;
    let cancelled = false;

    const start = async () => {
      if (stop || loading || motionTier() !== 'full') return;
      loading = true;
      // A failed chunk load (a stale tab after a deploy) keeps native scrolling.
      const lenisModule = await import('@frontend/motion/lenis').catch(() => null);
      loading = false;
      if (!lenisModule) return;
      const { startLenis } = lenisModule;
      if (!cancelled && !stop && motionTier() === 'full') stop = startLenis();
    };

    const onWheel = () => void start();
    window.addEventListener('wheel', onWheel, { passive: true, once: true });
    afterLoad()
      .then(() => whenIdle(1200))
      .then(() => {
        if (!cancelled) void start();
      });
    const offTier = onTierChange((tier) => {
      if (tier === 'full') void start();
      else {
        stop?.();
        stop = undefined;
      }
    });

    return () => {
      cancelled = true;
      window.removeEventListener('wheel', onWheel);
      offTier();
      stop?.();
    };
  }, []);

  return null;
}
