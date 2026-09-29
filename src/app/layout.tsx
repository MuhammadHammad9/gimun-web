import type { Metadata } from 'next';
import { connection } from 'next/server';
import localFont from 'next/font/local';
import './globals.css';
import { SiteChrome } from '@/components/layout/SiteChrome';
import { NoticeBar, noticeBootScript } from '@/components/chrome/NoticeBar';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { SiteConfigProvider } from '@/components/SiteConfigProvider';
import { getSiteConfig, getAnnouncements, getSponsors } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { getAnalyticsMeasurementId } from '@/lib/site-config';
import { serverRenderTime } from '@/lib/phase';
import { THEME_BOOT_SCRIPT } from '@/lib/theme';
import { publicRevision } from '@/lib/server/live';
import { LiveUpdates } from '@/components/LiveUpdates';

const satoshi = localFont({
  src: '../assets/fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  display: 'swap',
  weight: '300 900',
});

// Preloaded, unlike the mono face: body copy is nearly every word on the page,
// so letting it swap in late reflowed whole paragraphs and pushed CLS as high
// as 0.77. The display and body faces are worth the critical-path bytes; the
// mono face, used only for small labels, is not.
const generalSans = localFont({
  src: '../assets/fonts/GeneralSans-Variable.woff2',
  variable: '--font-body-sans',
  display: 'swap',
  weight: '200 700',
});

// Not preloaded: the mono face is used only for small eyebrow and meta text,
// none of it above the fold as the largest paint. Preloading all three faces
// put ~120KB in front of the render-blocking stylesheet on a throttled
// connection, which delayed first paint — and first paint is when the LCP
// element lands, so it delayed LCP one-for-one.
const jetbrainsMono = localFont({
  src: '../assets/fonts/JetBrainsMono-Variable.woff2',
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: '400 600',
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata(); }

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const live = await publicRevision();
  const siteConfig = (await getSiteConfig());
  const announcements = (await getAnnouncements());
  const sponsors = (await getSponsors());

  // Frozen per render so every client component agrees with this HTML.
  const renderedAt = serverRenderTime();

  const activeAnnouncement =
    announcements.find((a) => a.pinnedFlag) || announcements[0];

  return (
    // The boot script sets data-theme before first paint, so <html> differs
    // from the server markup by design.
    <html lang="en" suppressHydrationWarning className={`${satoshi.variable} ${generalSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT + noticeBootScript(activeAnnouncement) }} />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas text-text antialiased">
        <GoogleAnalytics measurementId={getAnalyticsMeasurementId()} />
        <SiteConfigProvider value={siteConfig} renderedAt={renderedAt}>
          <LiveUpdates initial={live.revision} />
          <SiteChrome
            banner={<NoticeBar announcement={activeAnnouncement} />}
            footer={<SiteFooter site={siteConfig} sponsors={sponsors} />}
          >
            {children}
          </SiteChrome>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
