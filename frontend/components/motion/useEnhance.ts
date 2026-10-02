'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { firstIntent, unlessAborted, whenNear } from '@frontend/motion/gates';
import { motionTier, type MotionTier } from '@frontend/motion/policy';

type Cleanup = void | (() => void);

export interface EnhanceOptions {
  /** How close to the viewport the element must be before setup runs. */
  near?: string;
  /** Tiers that get the enhancement. `none` (reduced motion) never does. */
  tiers?: MotionTier[];
}

/**
 * Runs a motion enhancement for one server-rendered element, following the
 * site's loading rule: nothing happens before the visitor's first intent,
 * setup waits until the element is near the viewport, and reduced motion
 * never runs it. `run` may be async (it usually imports GSAP or anime.js);
 * its cleanup runs on unmount, including under the page curtain.
 */
export function useEnhance<T extends Element>(
  ref: RefObject<T | null>,
  run: (element: T, signal: AbortSignal, tier: MotionTier) => Cleanup | Promise<Cleanup>,
  { near = '50% 0px', tiers = ['lite', 'full'] }: EnhanceOptions = {},
) {
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  const tierKey = tiers.join();
  useEffect(() => {
    const element = ref.current;
    const tier = motionTier();
    if (!element || !tierKey.split(',').includes(tier)) return;
    const controller = new AbortController();
    const { signal } = controller;
    let cleanup: Cleanup;
    (async () => {
      await unlessAborted(firstIntent(), signal);
      await whenNear(element, near, signal);
      const result = await runRef.current(element, signal, tier);
      if (signal.aborted) result?.();
      else cleanup = result;
    })().catch(() => {
      // Motion is optional. A chunk that fails to load (a tab opened before a
      // new deploy asks for files that no longer exist) leaves the static
      // page as it is instead of raising an unhandled rejection.
    });
    return () => {
      controller.abort();
      cleanup?.();
    };
  }, [ref, near, tierKey]);
}

/** True when any part of the element is on screen: it has been seen, so leave it be. */
export function isOnScreen(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}
