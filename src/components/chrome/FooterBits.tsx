'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { scrollTo } from '@/lib/motion/bridge';

/** Returns to the top and puts keyboard focus back at the start of the page. */
export function BackToTop() {
  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => {
        scrollTo(0);
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }}
    >
      <ArrowUp aria-hidden="true" strokeWidth={1.75} className="size-4" />
      Back to top
    </button>
  );
}

/** Reading progress (0–1) between which the button shows; the footer has its own below it. */
const SHOW_FROM = 0.08;
const SHOW_UNTIL = 0.89;

/**
 * The floating way back up on long pages: a round button in the corner whose
 * ring fills with reading progress. It appears once the reader is well into
 * the page and steps away again as the footer (with its own button) arrives.
 *
 * Driven by one passive scroll listener, at most once per frame. It used to
 * be CSS scroll timelines animating `visibility` and `stroke-dashoffset`,
 * which the browser cannot run off the main thread (the Lighthouse release
 * gate fails on that), and in browsers without scroll timelines the button
 * never appeared at all. Now only opacity and transform transition; while
 * hidden the button is inert, so it can be neither focused nor clicked.
 */
export function FloatingTop() {
  const [shown, setShown] = useState(false);
  const progress = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const read = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // Without motion the button simply stays in its corner, as before.
      setShown(reduced.matches || (read >= SHOW_FROM && read <= SHOW_UNTIL));
      progress.current?.style.setProperty('stroke-dashoffset', String(1 - read));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    reduced.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <button
      type="button"
      className="float-top"
      aria-label="Back to top"
      data-tip="Back to top"
      data-shown={shown ? 'true' : 'false'}
      inert={!shown}
      onClick={() => {
        scrollTo(0);
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true" className="float-top__ring">
        <circle cx="24" cy="24" r="22" pathLength={1} />
        <circle ref={progress} cx="24" cy="24" r="22" pathLength={1} className="float-top__progress" />
      </svg>
      <ArrowUp aria-hidden="true" strokeWidth={1.75} className="size-4" />
    </button>
  );
}

/** Renders children except on the listed paths (the footer's partner band). */
export function HideOnPaths({ paths, children }: { paths: string[]; children: ReactNode }) {
  const pathname = usePathname();
  const hidden = paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  return hidden ? null : children;
}
