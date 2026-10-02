'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';
import { motionTier } from '@frontend/motion/policy';

type FlipModule = typeof import('@frontend/motion/gsap');

/**
 * Animates a list's items from their old positions to their new ones when
 * a filter changes (GSAP Flip). Nothing loads until the visitor reaches for
 * a control (`prime` on pointer enter or focus), and without it, or under
 * reduced motion, the list simply re-renders in place.
 *
 * Call `capture()` just before the state change that re-renders the list.
 */
export function useFlip<T extends HTMLElement>(container: RefObject<T | null>, itemSelector: string) {
  const lib = useRef<FlipModule | null>(null);
  const pending = useRef<ReturnType<FlipModule['Flip']['getState']> | null>(null);

  const prime = () => {
    if (lib.current || motionTier() === 'none') return;
    void import('@frontend/motion/gsap').then((module) => {
      lib.current = module;
    });
  };

  const capture = () => {
    const el = container.current;
    if (!lib.current || !el) return;
    pending.current = lib.current.Flip.getState(el.querySelectorAll(itemSelector));
  };

  useLayoutEffect(() => {
    const el = container.current;
    const state = pending.current;
    if (!lib.current || !el || !state) return;
    pending.current = null;
    const { Flip, gsap } = lib.current;
    Flip.from(state, {
      targets: el.querySelectorAll(itemSelector),
      duration: 0.55,
      ease: 'expo',
      nested: true,
      onEnter: (entering) => gsap.fromTo(entering, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'lift', clearProps: 'opacity,transform' }),
    });
  });

  return { prime, capture };
}
