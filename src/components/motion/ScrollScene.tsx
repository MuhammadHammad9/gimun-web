'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';

let registered = false;
function ensureRegistered() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export interface ScrollSceneProps {
  children: React.ReactNode;
  /**
   * Builds the timeline. Receives the scene root and a `gsap.Context`-scoped
   * selector so `q('.step')` only ever matches inside this scene.
   *
   * Must be referentially stable — wrap it in `useCallback` in the caller.
   * A fresh function each render would tear down and rebuild the whole scene,
   * which visibly resets scroll progress mid-scrub.
   *
   * Return nothing; everything created inside is reverted automatically on
   * unmount because the callback runs inside a `gsap.context`.
   */
  build: (root: HTMLDivElement, q: gsap.utils.SelectorFunc) => void;
  className?: string;
}

/**
 * GSAP ScrollTrigger scene wrapper for pinned and scrubbed sections.
 *
 * Three things this handles that hand-rolled ScrollTrigger usually gets wrong:
 *
 *  - Registration happens exactly once per page load, not once per instance.
 *  - Everything is created inside a `gsap.context` scoped to the scene root,
 *    so `revert()` on unmount kills the tweens *and* their triggers. Without
 *    this, client-side navigation leaks triggers that keep firing against
 *    detached nodes.
 *  - It never runs at all under `prefers-reduced-motion`, so pinned sections
 *    degrade to ordinary stacked content rather than a frozen viewport.
 */
export function ScrollScene({ children, build, className }: ScrollSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const root = ref.current;
    if (!root) return;

    ensureRegistered();

    const ctx = gsap.context((self) => {
      build(root, self.selector as gsap.utils.SelectorFunc);
    }, root);

    // Fonts and images landing late change section heights; without this the
    // trigger start/end positions are computed against a stale layout.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    const fontsReady = (document as Document & { fonts?: FontFaceSet }).fonts;
    fontsReady?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

    return () => {
      window.removeEventListener('load', onLoad);
      ctx.revert();
    };
  }, [reduced, build]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default ScrollScene;
