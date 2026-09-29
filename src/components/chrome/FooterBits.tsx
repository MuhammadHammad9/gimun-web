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

/** Renders children except on the listed paths (the footer's partner band). */
export function HideOnPaths({ paths, children }: { paths: string[]; children: ReactNode }) {
  const pathname = usePathname();
  const hidden = paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  return hidden ? null : children;
}
