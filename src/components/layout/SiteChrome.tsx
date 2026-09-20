'use client';

import { usePathname } from 'next/navigation';
import type { SiteConfig, Announcement, Sponsor } from '@/lib/types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AnnouncementBanner } from './AnnouncementBanner';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { ScrollProgress } from '@/components/motion/ScrollProgress';

/**
 * The public site shell: skip link, announcement bar, navbar, main, footer.
 *
 * `/admin` opts out of all of it — including smooth scroll and the progress
 * bar, which would fight the CMS's own dense, scrollable panels.
 */
export function SiteChrome({
  site,
  announcement,
  sponsors,
  children,
}: {
  site: SiteConfig;
  announcement?: Announcement;
  sponsors: Sponsor[];
  children: React.ReactNode;
}) {
  const path = usePathname();

  if (path === '/admin' || path.startsWith('/admin/')) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <>
      <SmoothScroll />
      <ScrollProgress />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-champagne focus:px-4 focus:py-3 focus:font-semibold focus:text-canvas"
      >
        Skip to main content
      </a>

      <div className="print:hidden">
        <AnnouncementBanner announcement={announcement} />
      </div>

      {/* The wrapper must stick: a sticky child cannot leave a header-height parent. */}
      <div className="sticky top-0 z-40 print:hidden">
        <Navbar siteConfig={site} />
      </div>

      <main id="main-content" className="flex-1 w-full print:p-0 print:m-0">
        {children}
      </main>

      <div className="print:hidden">
        <Footer siteConfig={site} sponsors={sponsors} />
      </div>
    </>
  );
}
