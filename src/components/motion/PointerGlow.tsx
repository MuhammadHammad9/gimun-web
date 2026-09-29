'use client';

import { useEffect } from 'react';

/**
 * Feeds the card spotlight (see [data-glow] in interactions.css): one
 * delegated listener writes the pointer's position, relative to the card
 * under it, into --gx / --gy, at most once a frame. Fine pointers only, and
 * nothing under reduced motion. Renders nothing.
 */
export function PointerGlow() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const event = last;
      if (!event) return;
      const card = (event.target as Element | null)?.closest<HTMLElement>('[data-glow]');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--gx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--gy', `${event.clientY - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || event.pointerType !== 'mouse') return;
      last = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
