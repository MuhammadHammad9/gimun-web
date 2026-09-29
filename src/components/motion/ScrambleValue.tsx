'use client';

import { useRef } from 'react';
import { useEnhance } from './useEnhance';

const CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * A code or reference number that resolves character by character, like a
 * stamp being set. Screen readers get the final value straight away (the
 * moving copy is hidden from them), the width is reserved in `ch` so nothing
 * shifts, and under reduced motion the value simply shows.
 */
export function ScrambleValue({ value, className }: { value: string; className?: string }) {
  const visual = useRef<HTMLSpanElement>(null);

  useEnhance(
    visual,
    async (element, signal) => {
      const { gsap, scrambleText } = await import('@/lib/motion/gsap');
      await scrambleText();
      if (signal.aborted) return;
      const tween = gsap.fromTo(
        element,
        { scrambleText: { text: ' ', chars: CHARS } },
        { duration: 1.2, ease: 'none', scrambleText: { text: value, chars: CHARS, revealDelay: 0.25, speed: 0.7 } },
      );
      return () => {
        tween.kill();
        element.textContent = value;
      };
    },
    { near: '0px' },
  );

  return (
    <span className={className}>
      <span ref={visual} aria-hidden="true" style={{ display: 'inline-block', minWidth: `${value.length}ch` }}>
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
