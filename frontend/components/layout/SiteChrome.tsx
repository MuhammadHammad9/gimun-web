'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { FloatingTop } from '@frontend/components/chrome/FooterBits';
import { SiteHeader } from '@frontend/components/chrome/SiteHeader';
import { PointerGlow } from '@frontend/components/motion/PointerGlow';
import { ScrollProgress } from '@frontend/components/motion/ScrollProgress';
import { SectionReveals } from '@frontend/components/motion/SectionReveals';
import { SmoothScroll } from '@frontend/components/motion/SmoothScroll';
import { TransitionProvider } from '@frontend/components/motion/TransitionProvider';
import { isKnownPublicPath } from '@frontend/motion/routes';

/**
 * The public site shell. The notice bar and the footer arrive as server-
 * rendered elements from the root layout, so they cost no client JavaScript;
 * this component only decides where they appear.
 *
 * `/admin` opts out of all of it (curtain, smooth scroll, progress bar), and
 * unmatched routes render the focused 404 without chrome. Every direct child
 * here lands directly in <body>, and <main> must stay one of them: the print
 * stylesheet hides every body child except <main>.
 */
export function SiteChrome({
  banner,
  footer,
  children,
}: {
  banner: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const path = usePathname();

  if (path === '/admin' || path.startsWith('/admin/') || !isKnownPublicPath(path)) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <TransitionProvider>
      <div className="atmosphere" aria-hidden="true" />
      <ScrollProgress />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {banner}
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="w-full flex-1 outline-none print:m-0 print:p-0">
        {children}
      </main>
      {footer}
      <FloatingTop />
      <SmoothScroll />
      <SectionReveals />
      <PointerGlow />
    </TransitionProvider>
  );
}
