'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useInView, useReducedMotion, animate } from 'framer-motion';

export interface CountUpProps {
  /** Final value. */
  value: number;
  /** Seconds the count takes. */
  duration?: number;
  /** Rendered after the number, e.g. "+" or "%". */
  suffix?: string;
  suffixClassName?: string;
  className?: string;
  /** Locale-formatted thousands separators. */
  separator?: boolean;
}

/** useLayoutEffect that degrades to useEffect on the server. */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Number that counts up the first time it scrolls into view.
 *
 * The final value is what renders on the server, so crawlers and no-JS
 * visitors always see the real figure. On the client, if motion is allowed,
 * it is reset to zero before the browser paints and then animated.
 *
 * Updates go straight to the DOM node rather than through React state, so a
 * row of four of these costs four text writes per frame instead of four
 * component re-renders.
 */
export function CountUp({
  value,
  duration = 1.6,
  suffix,
  suffixClassName,
  className,
  separator = true,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  // A ref, not state: whether the count has played is not rendered, and
  // setting state here would schedule a cascading render on every reveal.
  const hasRun = useRef(false);

  const format = useCallback(
    (n: number) =>
      separator ? Math.round(n).toLocaleString('en-US') : String(Math.round(n)),
    [separator]
  );

  // Zero it out before first paint so the number never flashes its final
  // value and then restarts.
  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (ref.current) ref.current.textContent = format(0);
  }, [reduced, format]);

  useEffect(() => {
    if (!inView || hasRun.current) return;
    hasRun.current = true;

    if (reduced) {
      if (ref.current) ref.current.textContent = format(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = format(latest);
      },
    });

    return () => controls.stop();
  }, [inView, reduced, value, duration, format]);

  return (
    <span className={className}>
      <span ref={ref}>{format(value)}</span>
      {suffix && <span className={suffixClassName}>{suffix}</span>}
    </span>
  );
}

export default CountUp;
