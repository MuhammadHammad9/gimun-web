'use client';

import type { ReactNode } from 'react';
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

/**
 * The floating way back up on long pages: a round button in the corner whose
 * ring fills with reading progress. It appears once the reader is well into
 * the page and steps away again as the footer (with its own button) arrives.
 * Both are CSS scroll timelines; without them it simply stays hidden.
 */
export function FloatingTop() {
  return (
    <button
      type="button"
      className="float-top"
      aria-label="Back to top"
      data-tip="Back to top"
      onClick={() => {
        scrollTo(0);
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true" className="float-top__ring">
        <circle cx="24" cy="24" r="22" pathLength={1} />
        <circle cx="24" cy="24" r="22" pathLength={1} className="float-top__progress" />
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
