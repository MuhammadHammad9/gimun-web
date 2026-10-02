'use client';

import { useRef } from 'react';
import { whenNear } from '@frontend/motion/gates';
import { isOnScreen, useEnhance } from './useEnhance';

const format = (value: number) => Math.round(value).toLocaleString('en-US');

/**
 * A number that counts up as it comes into view.
 *
 * The server renders the real value. Screen readers always get the final
 * figure (the moving digits are aria-hidden); a number already on screen is
 * never reset. Real content numbers only: nothing here invents a statistic.
 */
export function Counter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEnhance(ref, async (digits, signal) => {
    if (isOnScreen(digits) || value <= 0) return;
    const { animate, ease } = await import('@frontend/motion/anime');
    if (signal.aborted || isOnScreen(digits)) return;
    digits.textContent = '0';
    await whenNear(digits, '0px 0px -12% 0px', signal);
    const state = { n: 0 };
    const animation = animate(state, {
      n: value,
      duration: 1600,
      ease: ease('expo'),
      onUpdate: () => {
        digits.textContent = format(state.n);
      },
    });
    return () => {
      animation.revert();
      digits.textContent = format(value);
    };
  });

  return (
    <span className={className} data-numeric="">
      <span ref={ref} aria-hidden="true">
        {format(value)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
