'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Route-level transition.
 *
 * `template.tsx` remounts on every navigation (unlike `layout.tsx`), which is
 * what makes the enter animation replay.
 *
 * Critically, the *first* page load is never animated. Framer Motion writes
 * the `initial` variant into the server-rendered HTML, so gating the first
 * load would ship every page with `opacity: 0` inline and leave it invisible
 * until React hydrates — which measured as a 4.2s LCP render delay on a
 * throttled mobile profile. On the initial load the wrapper is inert; only
 * client-side navigations animate, and by then hydration has already happened.
 *
 * No exit animation: the App Router unmounts the outgoing tree before the
 * incoming one renders, so an exit variant would never play.
 */

// Module scope so it survives the remount that each navigation causes.
let hasNavigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  // Captured once on mount; reading a ref during render is not allowed.
  const [isFirstLoad] = useState(() => !hasNavigated);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <>{children}</>;

  const skipEnter = reduced || isFirstLoad;

  return (
    <motion.div
      key={pathname}
      initial={skipEnter ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
